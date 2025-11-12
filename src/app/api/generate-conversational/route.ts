import { NextRequest } from 'next/server';
import { ConversationalInput, ConversationMessage, Conversation } from '@/types/conversation';
import { getTemplateById, replaceVariables } from '@/lib/templates';
import { generateWithRotation as generateWithRotationClaude } from '@/lib/anthropic';
import { generateWithRotation as generateWithRotationGemini } from '@/lib/gemini';

// Helper para enviar eventos SSE
function sendEvent(controller: ReadableStreamDefaultController, data: any) {
  const message = `data: ${JSON.stringify(data)}\n\n`;
  controller.enqueue(new TextEncoder().encode(message));
}

// Helper para gerar com provider selecionado COM RETRY
async function generateWithProvider(
  prompt: string,
  apiKeys: string[],
  provider: string,
  model?: string,
  maxRetries: number = 3
): Promise<string> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Tentativa ${attempt} de ${maxRetries}...`);

      if (provider === 'anthropic') {
        const claudeModel = model || 'claude-sonnet-4-5';
        return await generateWithRotationClaude(prompt, apiKeys, claudeModel);
      } else if (provider === 'gemini') {
        return await generateWithRotationGemini(prompt, apiKeys);
      } else {
        throw new Error(`Provider "${provider}" não está implementado`);
      }
    } catch (error: any) {
      console.error(`❌ Tentativa ${attempt} falhou:`, error.message);

      // Se for a última tentativa, lança o erro
      if (attempt === maxRetries) {
        throw error;
      }

      // Aguardar antes de tentar novamente (backoff exponencial)
      const waitTime = Math.min(5000 * Math.pow(2, attempt - 1), 30000);
      console.log(`⏳ Aguardando ${waitTime/1000}s antes de tentar novamente...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw new Error('Todas as tentativas falharam');
}

// Helper para converter seleção do usuário em nome do modelo
function getClaudeModelName(userSelection: 'haiku' | 'sonnet' | 'opus'): string {
  const modelMap = {
    haiku: 'claude-haiku-4-5',
    sonnet: 'claude-sonnet-4-5',
    opus: 'claude-opus-4-1-20250805',
  };
  return modelMap[userSelection];
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const input: ConversationalInput = body;
  const resumeFrom: Conversation | undefined = body.resumeFrom;

  // Validar input
  if (!input.title || !input.synopsis) {
    return new Response(JSON.stringify({ error: 'Título e sinopse são obrigatórios' }), {
      status: 400,
    });
  }

  // Pegar template
  const template = getTemplateById(input.templateId);
  if (!template) {
    return new Response(JSON.stringify({ error: 'Template não encontrado' }), { status: 400 });
  }

  // Extrair API keys do provider selecionado
  const selectedProvider = input.selectedProvider;
  let providerKeys: string[] = [];

  if (['gemini', 'groq', 'cohere', 'huggingface'].includes(selectedProvider)) {
    providerKeys = input.apiKeys[selectedProvider as 'gemini' | 'groq' | 'cohere' | 'huggingface'] || [];
  } else if (['openai', 'anthropic', 'mistral', 'together', 'perplexity'].includes(selectedProvider)) {
    const singleKey = input.apiKeys[selectedProvider as 'openai' | 'anthropic' | 'mistral' | 'together' | 'perplexity'];
    if (singleKey) {
      providerKeys = [singleKey];
    }
  }

  const validKeys = providerKeys.filter((k) => k.trim().length > 0);
  if (validKeys.length === 0) {
    return new Response(JSON.stringify({ error: `Nenhuma API Key válida para ${selectedProvider}` }), {
      status: 400,
    });
  }

  console.log(`🔑 Usando ${validKeys.length} API key(s) do provider: ${selectedProvider}`);

  // ========== CRIAR STREAM SSE ==========
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Inicializar conversa (ou retomar)
        const conversation: Conversation = resumeFrom || {
          id: Date.now().toString(),
          templateId: input.templateId,
          createdAt: new Date(),
          messages: [],
          contextWindow: '',
          currentStepIndex: 0,
          status: 'running',
          generatedFiles: {},
          stats: {
            totalTokens: 0,
            totalChars: 0,
            estimatedCost: 0,
            duration: 0,
          },
        };

        // Atualizar status para running se estava pausado
        conversation.status = 'running';

        const startTime = Date.now();

        // Determinar em qual step começar
        const startStepIndex = resumeFrom ? resumeFrom.currentStepIndex : 0;

        // Variáveis do template
        // OTIMIZAÇÃO HAIKU: Reduzir caracteres em 40% para gerar mais rápido
        const isHaiku = selectedProvider === 'anthropic' && input.claudeModel === 'haiku';
        const characterMultiplier = isHaiku ? 0.6 : 1.0;

        const adjustedTotalChars = Math.floor(input.totalCharacters * characterMultiplier);

        const variables = {
          TITULO: input.title,
          SINOPSE: input.synopsis,
          BASE_CONHECIMENTO: input.knowledgeBase || '',
          NUM_TOPICOS: input.numTopics,
          NUM_SUBTOPICOS: input.numSubtopics,
          IDIOMA: input.language,
          CARACTERES_TOTAIS: adjustedTotalChars,
          CARACTERES_POR_TOPICO: Math.floor(adjustedTotalChars / input.numTopics),
          CARACTERES_HOOK: Math.floor(template.variables.CARACTERES_HOOK * characterMultiplier),
        };

        if (isHaiku) {
          console.log(`⚡ OTIMIZAÇÃO HAIKU: Reduzindo ${input.totalCharacters} → ${adjustedTotalChars} caracteres (60%)`);
        }

        console.log('\n🚀 Iniciando geração conversacional...');
        console.log('Template:', template.name);
        console.log('Tópicos:', input.numTopics);
        console.log('Caracteres totais:', input.totalCharacters);

        // ========== EXECUTAR CADA STEP DO TEMPLATE ==========

        // Variável para guardar a estrutura gerada (recuperar se estiver retomando)
        let estruturaGerada = resumeFrom?.generatedFiles.estrutura || '';

        for (let stepIndex = startStepIndex; stepIndex < template.steps.length; stepIndex++) {
          const step = template.steps[stepIndex];

          // Atualizar índice atual
          conversation.currentStepIndex = stepIndex;

          // Se o step é "topico", vamos gerar N vezes (um para cada tópico)
          if (step.id === 'topico' || step.id === 'curiosidade' || step.id === 'ato') {
            // Extrair cada tópico da estrutura gerada
            // Tentar múltiplos padrões para detectar tópicos
            let topicos: string[] = [];
            let usedPattern = '';

            // Padrão 1: "TÓPICO 1:", "CURIOSIDADE 1:", "ATO 1:" (com dois-pontos)
            const pattern1 = /(T[oó]pico?|CURIOSIDADE|Curiosidade|ATO|Ato) \d+:/i;
            let topicosRaw = estruturaGerada.split(pattern1);
            // Filtrar apenas elementos com conteúdo (o split gera arrays com os grupos de captura)
            topicos = topicosRaw.filter((t, idx) => idx % 2 === 0 && t.trim().length > 0);

            // Se o split com grupos de captura não funcionou bem, tentar sem grupos
            if (topicos.length < input.numTopics) {
              topicosRaw = estruturaGerada.split(/(?:T[oó]pico?|CURIOSIDADE|Curiosidade|ATO|Ato) \d+:/i);
              topicos = topicosRaw.filter(t => t.trim().length > 0);
            }

            if (topicos.length >= input.numTopics) {
              usedPattern = 'Padrão 1: "TÓPICO/CURIOSIDADE/ATO N:"';
            } else {
              // Padrão 2: "TÓPICO 1 -", "CURIOSIDADE 1 -" (com hífen)
              const pattern2 = /(?:T[oó]pico?|CURIOSIDADE|Curiosidade|ATO|Ato) \d+ -/i;
              topicosRaw = estruturaGerada.split(pattern2);
              topicos = topicosRaw.filter(t => t.trim().length > 0);

              if (topicos.length >= input.numTopics) {
                usedPattern = 'Padrão 2: "TÓPICO N -"';
              } else {
                // Padrão 3: Numeração simples "1.", "2.", "3." no início de linha
                const pattern3 = /^(\d+)\./gm;
                const matches = estruturaGerada.match(pattern3);

                if (matches && matches.length >= input.numTopics) {
                  // Dividir por número + ponto
                  topicosRaw = estruturaGerada.split(/^\d+\./gm);
                  topicos = topicosRaw.filter(t => t.trim().length > 0);
                  usedPattern = 'Padrão 3: "N."';
                } else {
                  // Padrão 4: "## Tópico" ou "# Tópico" (formato Markdown)
                  const pattern4 = /#{1,3}\s*T[oó]pico?/i;
                  topicosRaw = estruturaGerada.split(pattern4);
                  topicos = topicosRaw.filter(t => t.trim().length > 0);

                  if (topicos.length >= input.numTopics) {
                    usedPattern = 'Padrão 4: Markdown "# TÓPICO"';
                  } else {
                    // Fallback: dividir por quebras de linha duplas (parágrafos)
                    console.warn('⚠️ Nenhum padrão de tópico detectado, usando fallback...');
                    topicosRaw = estruturaGerada.split(/\n\n+/);
                    topicos = topicosRaw.filter(t => t.trim().length > 100); // Apenas blocos grandes
                    usedPattern = 'Fallback: Parágrafos grandes';
                  }
                }
              }
            }

            console.log(`🔍 DEBUG - Estrutura split em ${topicos.length} tópicos usando: ${usedPattern}`);
            console.log(`🔍 DEBUG - Tópicos esperados: ${input.numTopics}`);

            if (topicos[0]) {
              console.log(`🔍 DEBUG - Primeiros 150 chars do tópico 1:`, topicos[0].substring(0, 150));
            }

            // Log da estrutura completa para debug
            if (topicos.length < input.numTopics) {
              console.error('❌ ESTRUTURA COMPLETA (primeiros 1000 chars):');
              console.error(estruturaGerada.substring(0, 1000));
              console.error('❌ ESTRUTURA COMPLETA (últimos 500 chars):');
              console.error(estruturaGerada.substring(estruturaGerada.length - 500));
            }

            // Se estiver retomando, determinar de qual tópico começar
            const topicosJaGerados = resumeFrom?.generatedFiles.topicos?.length || 0;
            const startTopicoNum = resumeFrom ? topicosJaGerados + 1 : 1;

            for (let topicoNum = startTopicoNum; topicoNum <= input.numTopics; topicoNum++) {
              console.log(`\n📌 Executando: ${step.name} ${topicoNum}/${input.numTopics}`);

              // Pegar a estrutura real deste tópico (índice correto: topicoNum - 1)
              const topicoEstrutura = topicos[topicoNum - 1];

              if (!topicoEstrutura || topicoEstrutura.trim().length === 0) {
                console.error(`❌ ERRO: Tópico ${topicoNum} não encontrado!`);
                console.error(`📋 Total de tópicos extraídos: ${topicos.length}`);
                console.error(`📋 Padrão usado: ${usedPattern}`);
                console.error(`📋 Estrutura completa (primeiros 800 chars):`, estruturaGerada.substring(0, 800));

                // Mostrar todos os tópicos extraídos para debug
                console.error(`📋 Tópicos extraídos:`);
                topicos.forEach((t, idx) => {
                  console.error(`  Tópico ${idx + 1}: "${t.substring(0, 100)}..."`);
                });

                throw new Error(
                  `❌ ERRO NO BLOCO 3: Tópico ${topicoNum} não encontrado na estrutura gerada.\n\n` +
                  `📊 Diagnóstico:\n` +
                  `- Tópicos esperados: ${input.numTopics}\n` +
                  `- Tópicos detectados: ${topicos.length}\n` +
                  `- Padrão usado: ${usedPattern}\n\n` +
                  `💡 Possíveis causas:\n` +
                  `1. A IA não gerou todos os ${input.numTopics} tópicos na estrutura\n` +
                  `2. A formatação está diferente do esperado\n` +
                  `3. Tente gerar novamente ou use outro modelo de IA\n\n` +
                  `🔍 Verifique o console para mais detalhes.`
                );
              }

              console.log(`📝 Tópico ${topicoNum} extraído (primeiros 150 chars):`, topicoEstrutura.substring(0, 150));

              // Montar prompt para este tópico específico
              // NÃO adicionar "Tópico X:" novamente, pois já está no template original
              let promptText = replaceVariables(step.promptTemplate, {
                ...variables,
                TOPICO_NUM: topicoNum,
                TOPICO_ESTRUTURA: topicoEstrutura.trim(),
              });

              // Criar mensagem do usuário
              const userMessage: ConversationMessage = {
                id: `msg-${Date.now()}-user`,
                role: 'user',
                content: promptText,
                timestamp: new Date(),
                stepId: `${step.id}${topicoNum}`,
              };

              conversation.messages.push(userMessage);

              // Enviar update
              sendEvent(controller, {
                type: 'message',
                message: userMessage,
                conversation,
                progress: ((stepIndex + topicoNum / input.numTopics) / template.steps.length) * 100,
                currentStep: `${step.name} ${topicoNum}`,
              });

              // Gerar resposta da IA
              let contextPrompt = promptText;

              if (step.usesContext && conversation.messages.length > 0) {
                // LIMITAR CONTEXTO: Pegar apenas as últimas 4 mensagens (2 pares de perguntas/respostas)
                // Isso evita que o Haiku fique sobrecarregado
                const recentMessages = conversation.messages.slice(-4);
                const contextStr = recentMessages
                  .map((m) => `${m.role === 'user' ? 'Usuário' : 'Assistente'}: ${m.content}`)
                  .join('\n\n');
                contextPrompt = `${contextStr}\n\nUsuário: ${promptText}`;
              }

              console.log(`📝 Tamanho do contexto: ${contextPrompt.length} caracteres`);

              const response = await generateWithProvider(
                contextPrompt,
                validKeys,
                selectedProvider,
                selectedProvider === 'anthropic' && input.claudeModel
                  ? getClaudeModelName(input.claudeModel)
                  : undefined
              );

              // Criar mensagem da IA
              const aiMessage: ConversationMessage = {
                id: `msg-${Date.now()}-ai`,
                role: 'assistant',
                content: response,
                timestamp: new Date(),
                stepId: `${step.id}${topicoNum}`,
                chars: response.length,
              };

              conversation.messages.push(aiMessage);
              conversation.stats.totalChars += response.length;

              // Salvar no arquivo correspondente
              if (!conversation.generatedFiles.topicos) {
                conversation.generatedFiles.topicos = [];
              }
              conversation.generatedFiles.topicos.push(response);

              // Enviar update
              sendEvent(controller, {
                type: 'message',
                message: aiMessage,
                conversation,
                progress: ((stepIndex + (topicoNum + 1) / input.numTopics) / template.steps.length) * 100,
              });

              // Rate limiting
              await new Promise((resolve) => setTimeout(resolve, 3000));
            }

            // Resetar flag de retomada após processar os tópicos
            if (resumeFrom) {
              resumeFrom.currentStepIndex = stepIndex + 1;
            }
          } else {
            // Step normal (estrutura, hook, etc)
            console.log(`\n📌 Executando: ${step.name}`);

            let promptText = replaceVariables(step.promptTemplate, variables);

            // Criar mensagem do usuário
            const userMessage: ConversationMessage = {
              id: `msg-${Date.now()}-user`,
              role: 'user',
              content: promptText,
              timestamp: new Date(),
              stepId: step.id,
            };

            conversation.messages.push(userMessage);

            sendEvent(controller, {
              type: 'message',
              message: userMessage,
              conversation,
              progress: (stepIndex / template.steps.length) * 100,
              currentStep: step.name,
            });

            // Gerar resposta
            let contextPrompt = promptText;

            if (step.usesContext && conversation.messages.length > 0) {
              // LIMITAR CONTEXTO: Pegar apenas as últimas 4 mensagens
              const recentMessages = conversation.messages.slice(-4);
              const contextStr = recentMessages
                .map((m) => `${m.role === 'user' ? 'Usuário' : 'Assistente'}: ${m.content}`)
                .join('\n\n');
              contextPrompt = `${contextStr}\n\nUsuário: ${promptText}`;
            }

            console.log(`📝 Tamanho do contexto: ${contextPrompt.length} caracteres`);

            const response = await generateWithProvider(
              contextPrompt,
              validKeys,
              selectedProvider,
              selectedProvider === 'anthropic' && input.claudeModel
                ? getClaudeModelName(input.claudeModel)
                : undefined
            );

            const aiMessage: ConversationMessage = {
              id: `msg-${Date.now()}-ai`,
              role: 'assistant',
              content: response,
              timestamp: new Date(),
              stepId: step.id,
              chars: response.length,
            };

            conversation.messages.push(aiMessage);
            conversation.stats.totalChars += response.length;

            // Salvar no arquivo correspondente
            if (step.outputType === 'structure') {
              conversation.generatedFiles.estrutura = response;
              estruturaGerada = response; // SALVAR ESTRUTURA PARA USAR NOS TÓPICOS
            } else if (step.outputType === 'hook') {
              conversation.generatedFiles.hook = response;
            } else if (step.outputType === 'characters') {
              conversation.generatedFiles.personagens = response;
            } else if (step.outputType === 'soundtrack') {
              conversation.generatedFiles.trilha = response;
            } else if (step.outputType === 'takes') {
              conversation.generatedFiles.takes = response;
            }

            sendEvent(controller, {
              type: 'message',
              message: aiMessage,
              conversation,
              progress: ((stepIndex + 1) / template.steps.length) * 100,
            });

            // Rate limiting
            await new Promise((resolve) => setTimeout(resolve, 3000));
          }
        }

        // ========== CONCLUÍDO ==========
        const endTime = Date.now();
        conversation.stats.duration = Math.floor((endTime - startTime) / 1000);
        conversation.status = 'completed';

        console.log('\n✅ Geração conversacional concluída!');
        console.log('Mensagens trocadas:', conversation.messages.length);
        console.log('Caracteres totais:', conversation.stats.totalChars);
        console.log('Duração:', conversation.stats.duration, 'segundos');

        sendEvent(controller, {
          type: 'complete',
          conversation,
          progress: 100,
        });

        controller.close();
      } catch (error: any) {
        console.error('❌ Erro na geração conversacional:', error);
        sendEvent(controller, {
          type: 'error',
          error: error.message,
        });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
