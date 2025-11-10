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
            // REGEX MULTILÍNGUE: Aceita "Tópico", "TÓPICO", "Topic", "TOPIC", "Topico"
            const topicosRaw = estruturaGerada.split(/T[oó]pico? \d+:/i);

            // Remover elementos vazios (primeiro elemento após split quando estrutura começa com "TÓPICO 1:")
            const topicos = topicosRaw.filter(t => t.trim().length > 0);

            console.log(`🔍 DEBUG - Estrutura split em ${topicos.length} tópicos`);
            if (topicos[0]) {
              console.log(`🔍 DEBUG - Primeiros 100 chars do tópico 1:`, topicos[0].substring(0, 100));
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
                console.error(`📋 Estrutura completa (primeiros 500 chars):`, estruturaGerada.substring(0, 500));
                throw new Error(`Tópico ${topicoNum} não encontrado na estrutura gerada. Verifique se a IA gerou ${input.numTopics} tópicos corretamente.`);
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
