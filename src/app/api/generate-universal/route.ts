import { NextRequest } from 'next/server';
import { ConversationalInput, ConversationMessage } from '@/types/conversation';
import { getUniversalTemplateById, replaceUniversalVariables } from '@/lib/universal-templates';
import {
  prepareUniversalVariables,
  executeOperation,
  ensureCleanText,
  buildOutput,
} from '@/lib/universal-executor';
import { TemplateContext } from '@/types/universal-template';
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

      if (attempt === maxRetries) {
        throw error;
      }

      const waitTime = Math.min(5000 * Math.pow(2, attempt - 1), 30000);
      console.log(`⏳ Aguardando ${waitTime / 1000}s antes de tentar novamente...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
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

  // Validar input
  if (!input.title || !input.synopsis) {
    return new Response(JSON.stringify({ error: 'Título e sinopse são obrigatórios' }), {
      status: 400,
    });
  }

  // Pegar template universal (customizado ou padrão)
  const template = input.customTemplate || getUniversalTemplateById(input.templateId);
  if (!template) {
    return new Response(JSON.stringify({ error: 'Template não encontrado' }), { status: 400 });
  }

  // Extrair API keys
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
      const startTime = Date.now();
      let timeoutId: NodeJS.Timeout | null = null;

      try {
        // Timeout de segurança (15 minutos)
        timeoutId = setTimeout(() => {
          console.error('⏰ TIMEOUT: Geração excedeu 15 minutos, finalizando...');
          sendEvent(controller, {
            type: 'error',
            error: 'Geração excedeu o tempo limite de 15 minutos. Por favor, tente com menos tópicos ou caracteres.',
          });
          controller.close();
        }, 900000); // 15 minutos

        // OTIMIZAÇÃO HAIKU
        const isHaiku = selectedProvider === 'anthropic' && input.claudeModel === 'haiku';
        const characterMultiplier = isHaiku ? 0.6 : 1.0;

        if (isHaiku) {
          console.log(`⚡ OTIMIZAÇÃO HAIKU: Reduzindo ${input.totalCharacters} → ${Math.floor(input.totalCharacters * characterMultiplier)} caracteres (60%)`);
        }

        // Preparar variáveis
        const variables = prepareUniversalVariables(
          template,
          {
            title: input.title,
            synopsis: input.synopsis,
            knowledgeBase: input.knowledgeBase,
            language: input.language,
            numTopics: input.numTopics,
            numSubtopics: input.numSubtopics,
            totalCharacters: input.totalCharacters,
          },
          characterMultiplier
        );

        // Criar contexto de execução
        const context: TemplateContext = {
          userInput: {
            title: input.title,
            synopsis: input.synopsis,
            knowledgeBase: input.knowledgeBase,
            language: input.language,
          },
          variables,
          aiResponses: {},
          arrays: {},
          messages: [],
        };

        // Array para manter mensagens completas com timestamp, chars, etc
        const fullMessages: ConversationMessage[] = [];

        console.log('\n🚀 Iniciando geração universal...');
        console.log('Template:', template.name);
        console.log('Tópicos:', input.numTopics);
        console.log('Caracteres totais:', variables.CARACTERES_TOTAIS);

        // ========== EXECUTAR CADA STEP DO TEMPLATE ==========
        let currentStepIndex = 0;
        const totalSteps = template.steps.length;

        for (const step of template.steps) {
          console.log(`\n📌 Executando: ${step.name}`);

          if (step.type === 'operation') {
            // Executar operação
            if (step.operation) {
              executeOperation(step.operation, context);

              // Se for LOOP, expandir e executar os steps internos
              if (step.operation.type === 'LOOP') {
                const loopOp = step.operation;
                const array = context.arrays[loopOp.array] || [];

                for (let i = 0; i < array.length; i++) {
                  const item = array[i];

                  // Definir variáveis do loop
                  context.variables[loopOp.itemVar] = item;
                  if (loopOp.indexVar) {
                    context.variables[loopOp.indexVar] = i + 1;
                  }

                  // Executar cada step do loop
                  for (const loopStep of loopOp.steps) {
                    try {
                      if (loopStep.type === 'prompt' && loopStep.promptTemplate) {
                        console.log(`\n  📝 Loop ${i + 1}/${array.length}: ${loopStep.name}`);

                      // Substituir variáveis no prompt
                      const promptText = replaceUniversalVariables(loopStep.promptTemplate, {
                        ...context.variables,
                        ...context.userInput,
                      });

                      // Criar mensagem do usuário
                      const userMessage: ConversationMessage = {
                        id: `msg-${Date.now()}-user-${i}`,
                        role: 'user',
                        content: promptText,
                        timestamp: new Date(),
                        stepId: `${loopStep.id}${i + 1}`,
                      };

                      fullMessages.push(userMessage);
                      context.messages.push({
                        role: userMessage.role,
                        content: userMessage.content,
                        stepId: userMessage.stepId!,
                      });

                      sendEvent(controller, {
                        type: 'message',
                        message: userMessage,
                        progress: ((currentStepIndex + (i + 1) / array.length) / totalSteps) * 100,
                        currentStep: `${loopStep.name} ${i + 1}`,
                      });

                      // Preparar contexto
                      let contextPrompt = promptText;
                      if (loopStep.usesContext && context.messages.length > 0) {
                        const recentMessages = context.messages.slice(-4);
                        const contextStr = recentMessages
                          .map((m) => `${m.role === 'user' ? 'Usuário' : 'Assistente'}: ${m.content}`)
                          .join('\n\n');
                        contextPrompt = `${contextStr}\n\nUsuário: ${promptText}`;
                      }

                      console.log(`📝 Tamanho do contexto: ${contextPrompt.length} caracteres`);

                      // Gerar resposta
                      const response = await generateWithProvider(
                        contextPrompt,
                        validKeys,
                        selectedProvider,
                        selectedProvider === 'anthropic' && input.claudeModel
                          ? getClaudeModelName(input.claudeModel)
                          : undefined
                      );

                      // Limpar markdown se necessário
                      const cleanResponse = loopStep.validation?.isCleanText
                        ? ensureCleanText(response, true)
                        : response;

                      // Criar mensagem da IA
                      const aiMessage: ConversationMessage = {
                        id: `msg-${Date.now()}-ai-${i}`,
                        role: 'assistant',
                        content: cleanResponse,
                        timestamp: new Date(),
                        stepId: `${loopStep.id}${i + 1}`,
                        chars: cleanResponse.length,
                      };

                      fullMessages.push(aiMessage);
                      context.messages.push({
                        role: aiMessage.role,
                        content: aiMessage.content,
                        stepId: aiMessage.stepId!,
                      });

                      // Salvar no contexto
                      if (loopStep.outputVar) {
                        const varName = loopStep.outputVar.replace('{{TOPICO_NUM}}', String(i + 1))
                          .replace('{{CURIOSIDADE_NUM}}', String(i + 1))
                          .replace('{{ATO_NUM}}', String(i + 1))
                          .replace('{{CENA_NUM}}', String(i + 1));
                        context.aiResponses[varName] = cleanResponse;
                        context.variables[varName] = cleanResponse;
                      }

                      sendEvent(controller, {
                        type: 'message',
                        message: aiMessage,
                        progress: ((currentStepIndex + (i + 2) / array.length) / totalSteps) * 100,
                      });

                      // Rate limiting
                      await new Promise((resolve) => setTimeout(resolve, 3000));
                      }
                    } catch (stepError: any) {
                      console.error(`❌ Erro no step do loop "${loopStep.name}":`, stepError.message);
                      // Continuar com próximo step mesmo se houver erro
                    }
                  }
                }
              }
            }
          } else if (step.type === 'prompt' && step.promptTemplate) {
            try {
              // Step de prompt normal
              const promptText = replaceUniversalVariables(step.promptTemplate, {
                ...context.variables,
                ...context.userInput,
              });

            // Criar mensagem do usuário
            const userMessage: ConversationMessage = {
              id: `msg-${Date.now()}-user`,
              role: 'user',
              content: promptText,
              timestamp: new Date(),
              stepId: step.id,
            };

            fullMessages.push(userMessage);
            context.messages.push({
              role: userMessage.role,
              content: userMessage.content,
              stepId: userMessage.stepId!,
            });

            sendEvent(controller, {
              type: 'message',
              message: userMessage,
              progress: (currentStepIndex / totalSteps) * 100,
              currentStep: step.name,
            });

            // Preparar contexto
            let contextPrompt = promptText;
            if (step.usesContext && context.messages.length > 0) {
              const recentMessages = context.messages.slice(-4);
              const contextStr = recentMessages
                .map((m) => `${m.role === 'user' ? 'Usuário' : 'Assistente'}: ${m.content}`)
                .join('\n\n');
              contextPrompt = `${contextStr}\n\nUsuário: ${promptText}`;
            }

            console.log(`📝 Tamanho do contexto: ${contextPrompt.length} caracteres`);

            // Gerar resposta
            const response = await generateWithProvider(
              contextPrompt,
              validKeys,
              selectedProvider,
              selectedProvider === 'anthropic' && input.claudeModel
                ? getClaudeModelName(input.claudeModel)
                : undefined
            );

            // Limpar markdown se necessário
            const cleanResponse = step.validation?.isCleanText ? ensureCleanText(response, true) : response;

            // Criar mensagem da IA
            const aiMessage: ConversationMessage = {
              id: `msg-${Date.now()}-ai`,
              role: 'assistant',
              content: cleanResponse,
              timestamp: new Date(),
              stepId: step.id,
              chars: cleanResponse.length,
            };

            fullMessages.push(aiMessage);
            context.messages.push({
              role: aiMessage.role,
              content: aiMessage.content,
              stepId: aiMessage.stepId!,
            });

            // Salvar no contexto
            if (step.outputVar) {
              context.aiResponses[step.outputVar] = cleanResponse;
              context.variables[step.outputVar] = cleanResponse;
            }

            sendEvent(controller, {
              type: 'message',
              message: aiMessage,
              progress: ((currentStepIndex + 1) / totalSteps) * 100,
            });

              // Rate limiting
              await new Promise((resolve) => setTimeout(resolve, 3000));
            } catch (stepError: any) {
              console.error(`❌ Erro no step "${step.name}":`, stepError.message);
              // Continuar com próximo step mesmo se houver erro
            }
          }

          currentStepIndex++;
        }

        // ========== CONSTRUIR ARQUIVOS DE OUTPUT (AUTO-DETECÇÃO) ==========
        console.log('\n📦 Construindo arquivos de output...');

        const generatedFiles: any = {};

        // 1. ROTEIRO COMPLETO (SEMPRE GERA) - Junta HOOK + todos os TOPICO_X
        try {
          const roteiroParts: string[] = [];

          // Adiciona HOOK se existir
          if (context.aiResponses['HOOK']) {
            roteiroParts.push(context.aiResponses['HOOK']);
          }

          // Detecta e adiciona todos os TOPICO_X em ordem
          const topicoKeys = Object.keys(context.aiResponses)
            .filter(k => k.match(/^(TOPICO|CURIOSIDADE|ATO|CENA)_\d+$/))
            .sort((a, b) => {
              const numA = parseInt(a.match(/\d+$/)?.[0] || '0');
              const numB = parseInt(b.match(/\d+$/)?.[0] || '0');
              return numA - numB;
            });

          topicoKeys.forEach(key => {
            if (context.aiResponses[key]) {
              roteiroParts.push(context.aiResponses[key]);
            }
          });

          const roteiroCompleto = roteiroParts.filter(x => x.trim()).join('\n\n');

          if (roteiroCompleto.trim()) {
            generatedFiles['roteiro'] = roteiroCompleto;
            console.log(`✅ 01_Roteiro_Completo.txt: ${roteiroCompleto.length} chars`);
          } else {
            console.warn(`⚠️ Roteiro completo está vazio`);
          }
        } catch (error: any) {
          console.error(`❌ Erro ao construir roteiro completo:`, error.message);
        }

        // 2. ESTRUTURA (Opcional)
        if (context.aiResponses['ESTRUTURA']) {
          generatedFiles['estrutura'] = context.aiResponses['ESTRUTURA'];
          console.log(`✅ 00_Estrutura.txt: ${context.aiResponses['ESTRUTURA'].length} chars`);
        }

        // 3. PERSONAGENS (Opcional)
        if (context.aiResponses['PERSONAGENS']) {
          generatedFiles['personagens'] = context.aiResponses['PERSONAGENS'];
          console.log(`✅ 02_Personagens.txt: ${context.aiResponses['PERSONAGENS'].length} chars`);
        }

        // 4. TRILHA SONORA (Opcional)
        if (context.aiResponses['TRILHA']) {
          generatedFiles['trilha'] = context.aiResponses['TRILHA'];
          console.log(`✅ 03_Trilha_Sonora.txt: ${context.aiResponses['TRILHA'].length} chars`);
        }

        // 5. TAKES (Opcional)
        if (context.aiResponses['TAKES']) {
          generatedFiles['takes'] = context.aiResponses['TAKES'];
          console.log(`✅ 04_Takes.txt: ${context.aiResponses['TAKES'].length} chars`);
        }

        // ========== CONCLUÍDO ==========
        const endTime = Date.now();
        const duration = Math.floor((endTime - startTime) / 1000);

        const totalChars = context.messages
          .filter((m) => m.role === 'assistant')
          .reduce((sum, m) => sum + m.content.length, 0);

        console.log('\n✅ Geração universal concluída!');
        console.log('Mensagens trocadas:', context.messages.length);
        console.log('Caracteres totais:', totalChars);
        console.log('Duração:', duration, 'segundos');

        // Criar objeto de conversa compatível para o frontend
        const conversation = {
          id: Date.now().toString(),
          templateId: input.templateId,
          createdAt: new Date(),
          messages: fullMessages,
          contextWindow: '',
          currentStepIndex: totalSteps,
          status: 'completed' as const,
          generatedFiles: {
            estrutura: generatedFiles.estrutura || '',
            hook: generatedFiles.roteiro || '', // Roteiro completo
            topicos: [], // Não precisa mais, tudo está no roteiro completo
            personagens: generatedFiles.personagens || '',
            trilha: generatedFiles.trilha || '',
            takes: generatedFiles.takes || '',
          },
          stats: {
            totalTokens: 0,
            totalChars,
            estimatedCost: 0,
            duration,
          },
        };

        console.log('\n🎉 ENVIANDO EVENTO COMPLETE!');
        console.log('📦 Conversation ID:', conversation.id);
        console.log('📊 Total messages:', conversation.messages.length);
        console.log('📝 Generated files:', Object.keys(conversation.generatedFiles));

        // Converter datas para ISO string para evitar problemas de serialização
        const conversationSerialized = {
          ...conversation,
          createdAt: conversation.createdAt.toISOString(),
          messages: conversation.messages.map(m => ({
            ...m,
            timestamp: m.timestamp.toISOString(),
          })),
        };

        sendEvent(controller, {
          type: 'complete',
          conversation: conversationSerialized,
          progress: 100,
        });

        console.log('✅ Evento complete enviado, fechando stream...');
        controller.close();
        console.log('✅ Stream fechado!');
      } catch (error: any) {
        console.error('❌ Erro na geração universal:', error);
        sendEvent(controller, {
          type: 'error',
          error: error.message,
        });
        controller.close();
      } finally {
        // Limpar timeout de segurança
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
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
