import { NextRequest } from 'next/server';
import { generateWithRotation as generateWithRotationGemini } from '@/lib/gemini';
import { generateWithRotation as generateWithRotationClaude } from '@/lib/anthropic';
import {
  buildRoteiroPrompt,
  buildTrilhaPrompt,
  buildTextoNarradoHookPrompt,
  buildTextoNarradoAtoPrompt,
  buildTextoNarradoConclusaoPrompt,
  buildPersonagensPrompt,
  buildTituloPrompt,
} from '@/lib/prompts';
import {
  buildEstruturaPrompt,
  buildHookPrompt,
  buildTopicoPrompt,
  buildConclusaoPrompt,
  buildTakesPrompt,
} from '@/lib/prompts-historia';
import {
  validateRoteiro,
  validateTextoNarrado,
  countCharacters,
} from '@/lib/validators';
import { ScriptInput, GeneratedScript, ChecklistStep } from '@/types';

// Helper para enviar eventos SSE
function sendEvent(controller: ReadableStreamDefaultController, data: any) {
  const message = `data: ${JSON.stringify(data)}\n\n`;
  controller.enqueue(new TextEncoder().encode(message));
}

// Helper para gerenciar etapas do checklist
class ChecklistManager {
  private steps: ChecklistStep[] = [];

  constructor(mode: 'story' | 'documentary' | 'curiosities' | 'custom') {
    if (mode === 'story') {
      this.steps = [
        { id: 'estrutura', label: '📋 Estrutura da História', status: 'pending' },
        { id: 'hook', label: '🎣 Hook/Introdução', status: 'pending' },
        { id: 'topico1', label: '📖 Tópico 1', status: 'pending' },
        { id: 'topico2', label: '📖 Tópico 2', status: 'pending' },
        { id: 'topico3', label: '📖 Tópico 3', status: 'pending' },
        { id: 'conclusao', label: '🎬 Conclusão', status: 'pending' },
        { id: 'trilha', label: '🎵 Trilha Sonora', status: 'pending' },
        { id: 'personagens', label: '👥 Personagens', status: 'pending' },
        { id: 'titulo', label: '📝 Título e Descrição', status: 'pending' },
        { id: 'takes', label: '🎬 Takes - Cenas Visuais', status: 'pending' },
      ];
    } else {
      // Documentary mode
      this.steps = [
        { id: 'roteiro', label: '📋 Roteiro Estruturado', status: 'pending' },
        { id: 'trilha', label: '🎵 Trilha Sonora', status: 'pending' },
        { id: 'textoNarrado_hook', label: '🎣 Texto Narrado - HOOK', status: 'pending' },
        { id: 'textoNarrado_ato1', label: '📖 Texto Narrado - ATO I', status: 'pending' },
        { id: 'textoNarrado_ato2', label: '📖 Texto Narrado - ATO II', status: 'pending' },
        { id: 'textoNarrado_ato3', label: '📖 Texto Narrado - ATO III', status: 'pending' },
        { id: 'textoNarrado_ato4', label: '📖 Texto Narrado - ATO IV', status: 'pending' },
        { id: 'textoNarrado_ato5', label: '📖 Texto Narrado - ATO V', status: 'pending' },
        { id: 'textoNarrado_ato6', label: '📖 Texto Narrado - ATO VI', status: 'pending' },
        { id: 'textoNarrado_conclusao', label: '🎬 Texto Narrado - CONCLUSÃO', status: 'pending' },
        { id: 'personagens', label: '👥 Personagens', status: 'pending' },
        { id: 'titulo', label: '📝 Título e Descrição', status: 'pending' },
      ];
    }
  }

  updateStep(id: string, status: 'running' | 'success' | 'error', message?: string, error?: string) {
    const step = this.steps.find(s => s.id === id);
    if (step) {
      step.status = status;
      if (message) step.message = message;
      if (error) step.error = error;
    }
  }

  getSteps(): ChecklistStep[] {
    return this.steps;
  }
}

// Helper para converter seleção do usuário em nome completo do modelo
function getClaudeModelName(userSelection: 'haiku' | 'sonnet' | 'opus'): string {
  const modelMap = {
    'haiku': 'claude-haiku-4-5',           // Claude Haiku 4.5 - US$ 1/5 por milhão (mais barato)
    'sonnet': 'claude-sonnet-4-5',          // Claude Sonnet 4.5 - US$ 3/15 por milhão (balanceado)
    'opus': 'claude-opus-4-1-20250805'      // Claude Opus 4.1 - US$ 15/75 por milhão (melhor qualidade)
  };
  return modelMap[userSelection];
}

// Helper para determinar qual modelo Claude usar baseado no tipo de arquivo
// (usado apenas quando o usuário NÃO selecionar um modelo manualmente)
// Opus 4.1 para documentos pesados (análise profunda, roteiros longos)
// Sonnet 4.5 para documentos leves (mais rápido e econômico)
function getClaudeModel(fileType: 'estrutura' | 'roteiro' | 'textoNarrado' | 'trilha' | 'personagens' | 'titulo' | 'takes'): string {
  // Documentos PESADOS: usar Claude Opus 4.1 (melhor qualidade, mais caro)
  const heavyDocs = ['estrutura', 'roteiro', 'textoNarrado'];
  if (heavyDocs.includes(fileType)) {
    return 'claude-opus-4-1-20250805'; // Claude Opus 4.1 - US$ 15/75 por milhão de tokens
  }

  // Documentos LEVES: usar Claude Sonnet 4.5 (rápido, econômico, alta qualidade)
  return 'claude-sonnet-4-5'; // Claude Sonnet 4.5 - US$ 3/15 por milhão de tokens
}

// Helper para escolher o adapter correto baseado no provider
// model: modelo específico do Claude (Opus 4.1 ou Sonnet 4.5) - apenas para provider 'anthropic'
function generateWithProvider(
  prompt: string,
  apiKeys: string[],
  provider: string,
  model?: string
): Promise<string> {
  if (provider === 'anthropic') {
    // Para Claude, permite escolher entre Opus 4.1 (docs pesados) e Sonnet 4.5 (docs leves)
    const claudeModel = model || 'claude-sonnet-4-5';
    return generateWithRotationClaude(prompt, apiKeys, claudeModel);
  } else if (provider === 'gemini') {
    return generateWithRotationGemini(prompt, apiKeys);
  } else {
    throw new Error(`Provider "${provider}" ainda não está implementado. Providers disponíveis: Gemini, Claude`);
  }
}

export async function POST(request: NextRequest) {
  const input: ScriptInput = await request.json();

  // Validar input
  if (!input.title || !input.synopsis) {
    return new Response(
      JSON.stringify({ error: 'Título e sinopse são obrigatórios' }),
      { status: 400 }
    );
  }

  // Validar que um provider foi selecionado
  if (!input.selectedApi || !input.selectedApi.provider) {
    return new Response(
      JSON.stringify({ error: 'Por favor, selecione um provider de IA' }),
      { status: 400 }
    );
  }

  // Extrair API keys do provider selecionado
  const selectedProvider = input.selectedApi.provider;
  let providerKeys: string[] = [];

  // Providers com múltiplas keys (gratuitos)
  if (['gemini', 'groq', 'cohere', 'huggingface'].includes(selectedProvider)) {
    providerKeys = input.apiKeys[selectedProvider as 'gemini' | 'groq' | 'cohere' | 'huggingface'] || [];
  }
  // Providers com uma key (pagos)
  else if (['openai', 'anthropic', 'mistral', 'together', 'perplexity'].includes(selectedProvider)) {
    const singleKey = input.apiKeys[selectedProvider as 'openai' | 'anthropic' | 'mistral' | 'together' | 'perplexity'];
    if (singleKey) {
      providerKeys = [singleKey];
    }
  }

  // Validar que há pelo menos uma API key
  const validKeys = providerKeys.filter(k => k.trim().length > 0);
  if (validKeys.length === 0) {
    return new Response(
      JSON.stringify({ error: `Nenhuma API Key válida encontrada para o provider ${input.selectedApi.label}` }),
      { status: 400 }
    );
  }

  console.log(`🔑 Usando ${validKeys.length} API key(s) do provider: ${input.selectedApi.label}`);

  // Criar stream SSE para progresso em tempo real
  // Suporte para múltiplos providers (Gemini, Claude, etc.)
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Inicializar checklist
        const checklist = new ChecklistManager(input.mode);

        // Enviar checklist inicial
        sendEvent(controller, {
          progress: 0,
          message: 'Iniciando geração...',
          checklistSteps: checklist.getSteps(),
        });

        let roteiro = '';
        let trilha = '';
        let textoNarrado = '';
        let personagens = '';
        let titulo = '';
        let takes = '';
        let estrutura = '';
        let totalCharacters = 0;

        // Check if it's story mode
        if (input.mode === 'story') {
          // ========== MODO HISTÓRIA: Usar prompts de história com TÓPICOS ==========

          // ETAPA 1: Gerar Estrutura com TÓPICOS (não ATOS)
          try {
            checklist.updateStep('estrutura', 'running', 'Criando estrutura da história...');
            sendEvent(controller, {
              progress: 5,
              message: 'Criando estrutura da história com 3 tópicos...',
              currentFile: 'roteiro',
              checklistSteps: checklist.getSteps(),
            });

            estrutura = await generateWithProvider(
              buildEstruturaPrompt(input, input.language || 'pt'),
              validKeys,
              selectedProvider,
              selectedProvider === 'anthropic'
                ? (input.claudeModel ? getClaudeModelName(input.claudeModel) : getClaudeModel('estrutura'))
                : undefined
            );

            checklist.updateStep('estrutura', 'success', `Estrutura criada`);

            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, 3000));

            sendEvent(controller, {
              progress: 10,
              message: 'Estrutura criada! Gerando introdução...',
              currentFile: 'roteiro',
              checklistSteps: checklist.getSteps(),
            });
          } catch (error: any) {
            checklist.updateStep('estrutura', 'error', undefined, error.message);
            throw error;
          }

          // ETAPA 2: Gerar Hook/Introdução
          try {
            checklist.updateStep('hook', 'running', 'Criando introdução...');
            sendEvent(controller, {
              progress: 12,
              message: 'Gerando introdução envolvente...',
              currentFile: 'roteiro',
              checklistSteps: checklist.getSteps(),
            });

            const hook = await generateWithProvider(
              buildHookPrompt(input, estrutura, input.language || 'pt'),
              validKeys,
              selectedProvider,
              selectedProvider === 'anthropic'
                ? (input.claudeModel ? getClaudeModelName(input.claudeModel) : getClaudeModel('textoNarrado'))
                : undefined
            );

            roteiro = `${input.title.toUpperCase()} - ROTEIRO COMPLETO\n`;
            roteiro += '='.repeat(60) + '\n\n';
            roteiro += 'INTRODUÇÃO\n' + '-'.repeat(40) + '\n\n';
            roteiro += hook + '\n\n';

            checklist.updateStep('hook', 'success', `Introdução criada (${countCharacters(hook)} caracteres)`);

            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, 3000));

            sendEvent(controller, {
              progress: 15,
              message: 'Introdução criada! Iniciando geração dos tópicos...',
              currentFile: 'roteiro',
              checklistSteps: checklist.getSteps(),
            });
          } catch (error: any) {
            checklist.updateStep('hook', 'error', undefined, error.message);
            throw error;
          }

          // ETAPA 3: Gerar os 3 TÓPICOS (não ATOS)
          const topicosGerados = [];

          // Extrair informações dos tópicos da estrutura
          const topicPattern = /TÓPICO (\d+): ([^\n]+)\n((?:\d+\.\d+ [^\n]+\n)+)/g;
          const topics = [];
          let match;

          while ((match = topicPattern.exec(estrutura)) !== null) {
            const topicNumber = parseInt(match[1]);
            const topicTitle = match[2];
            const subtopicsText = match[3];
            const subtopics = subtopicsText.split('\n')
              .filter(line => line.trim())
              .map(line => line.replace(/^\d+\.\d+\s+/, ''));

            topics.push({ number: topicNumber, title: topicTitle, subtopics });
          }

          // Gerar cada tópico
          const targetTotal = input.targetCharacters || 100000;
          const targetPerTopic = Math.floor(targetTotal / 3);

          for (const topic of topics) {
            try {
              const progressBase = 20 + (topic.number - 1) * 20; // 20%, 40%, 60%
              const topicoStepId = `topico${topic.number}` as 'topico1' | 'topico2' | 'topico3';

              checklist.updateStep(topicoStepId, 'running', `Gerando tópico ${topic.number}...`);
              sendEvent(controller, {
                progress: progressBase,
                message: `Gerando TÓPICO ${topic.number}: ${topic.title} (meta: ~${targetPerTopic.toLocaleString()} caracteres)...`,
                currentFile: 'roteiro',
                checklistSteps: checklist.getSteps(),
              });

              const topicContent = await generateWithProvider(
                buildTopicoPrompt(
                  topic.number,
                  topic.title,
                  topic.subtopics,
                  input,
                  input.language || 'pt',
                  topicosGerados
                ),
                validKeys,
                selectedProvider,
                selectedProvider === 'anthropic'
                  ? (input.claudeModel ? getClaudeModelName(input.claudeModel) : getClaudeModel('textoNarrado'))
                  : undefined
              );

              roteiro += `\nTÓPICO ${topic.number}: ${topic.title}\n` + '='.repeat(60) + '\n\n';
              roteiro += topicContent + '\n\n';
              topicosGerados.push(topicContent);

              const charCount = countCharacters(topicContent);
              checklist.updateStep(topicoStepId, 'success', `Tópico ${topic.number} concluído (${charCount.toLocaleString()} caracteres)`);

              // Rate limiting
              await new Promise(resolve => setTimeout(resolve, 3000));

              sendEvent(controller, {
                progress: progressBase + 15,
                message: `TÓPICO ${topic.number} concluído (${charCount.toLocaleString()} caracteres)`,
                currentFile: 'roteiro',
                checklistSteps: checklist.getSteps(),
                partialFile: {
                  type: 'roteiro',
                  content: roteiro,
                  generatedAt: new Date().toISOString(),
                  isComplete: false
                }
              });
            } catch (error: any) {
              const topicoStepId = `topico${topic.number}` as 'topico1' | 'topico2' | 'topico3';
              checklist.updateStep(topicoStepId, 'error', undefined, error.message);
              throw error;
            }
          }

          // ETAPA 4: Gerar Conclusão/CTA
          try {
            checklist.updateStep('conclusao', 'running', 'Criando conclusão...');
            sendEvent(controller, {
              progress: 80,
              message: 'Gerando conclusão e chamada para ação...',
              currentFile: 'roteiro',
              checklistSteps: checklist.getSteps(),
            });

            const conclusao = await generateWithProvider(
              buildConclusaoPrompt(input, input.language || 'pt'),
              validKeys,
              selectedProvider,
              selectedProvider === 'anthropic'
                ? (input.claudeModel ? getClaudeModelName(input.claudeModel) : getClaudeModel('textoNarrado'))
                : undefined
            );

            roteiro += '\nCONCLUSÃO\n' + '='.repeat(60) + '\n\n';
            roteiro += conclusao;

            checklist.updateStep('conclusao', 'success', `Conclusão criada (${countCharacters(conclusao)} caracteres)`);

            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, 3000));

            sendEvent(controller, {
              progress: 85,
              message: 'Roteiro completo! Gerando arquivos complementares...',
              currentFile: 'roteiro',
              checklistSteps: checklist.getSteps(),
              partialFile: {
                type: 'roteiro',
                content: roteiro,
                generatedAt: new Date().toISOString(),
                isComplete: true
              }
            });
          } catch (error: any) {
            checklist.updateStep('conclusao', 'error', undefined, error.message);
            throw error;
          }

          // Para modo história, vamos gerar os arquivos complementares

          // ETAPA 5: Gerar Trilha Sonora
          try {
            checklist.updateStep('trilha', 'running', 'Criando direção de trilha sonora...');
            sendEvent(controller, {
              progress: 88,
              message: 'Criando direção de trilha sonora...',
              currentFile: 'trilha',
              checklistSteps: checklist.getSteps(),
            });

            trilha = await generateWithProvider(
              buildTrilhaPrompt(roteiro, input),
              validKeys,
              selectedProvider,
              selectedProvider === 'anthropic'
                ? (input.claudeModel ? getClaudeModelName(input.claudeModel) : getClaudeModel('trilha'))
                : undefined
            );

            checklist.updateStep('trilha', 'success', 'Trilha sonora criada');

            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, 3000));

            sendEvent(controller, {
              progress: 90,
              message: 'Trilha sonora definida!',
              currentFile: 'trilha',
              checklistSteps: checklist.getSteps(),
              partialFile: {
                type: 'trilha',
                content: trilha,
                generatedAt: new Date().toISOString(),
                isComplete: true
              }
            });
          } catch (error: any) {
            checklist.updateStep('trilha', 'error', undefined, error.message);
            throw error;
          }

          // ETAPA 6: Texto Narrado (para modo história é o próprio roteiro)
          textoNarrado = `${input.title.toUpperCase()} - TEXTO NARRADO\n`;
          textoNarrado += '='.repeat(60) + '\n\n';
          textoNarrado += 'NOTA: Para modo história, o texto narrado segue a narrativa completa.\n\n';
          textoNarrado += roteiro;

          // Enviar texto narrado para download
          sendEvent(controller, {
            progress: 91,
            message: `Texto narrado criado (${textoNarrado.length} caracteres)`,
            currentFile: 'textoNarrado',
            checklistSteps: checklist.getSteps(),
            partialFile: {
              type: 'textoNarrado',
              content: textoNarrado,
              generatedAt: new Date().toISOString(),
              isComplete: true
            }
          });

          // ETAPA 7: Gerar Personagens
          try {
            checklist.updateStep('personagens', 'running', 'Criando descrições de personagens...');
            sendEvent(controller, {
              progress: 92,
              message: 'Criando descrições de personagens para IA...',
              currentFile: 'personagens',
              checklistSteps: checklist.getSteps(),
            });

            personagens = await generateWithProvider(
              buildPersonagensPrompt(roteiro, input),
              validKeys,
              selectedProvider,
              selectedProvider === 'anthropic'
                ? (input.claudeModel ? getClaudeModelName(input.claudeModel) : getClaudeModel('personagens'))
                : undefined
            );

            checklist.updateStep('personagens', 'success', 'Personagens criados');

            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, 3000));

            sendEvent(controller, {
              progress: 95,
              message: 'Personagens descritos!',
              currentFile: 'personagens',
              checklistSteps: checklist.getSteps(),
              partialFile: {
                type: 'personagens',
                content: personagens,
                generatedAt: new Date().toISOString(),
                isComplete: true
              }
            });
          } catch (error: any) {
            checklist.updateStep('personagens', 'error', undefined, error.message);
            throw error;
          }

          // ETAPA 8: Gerar Títulos
          try {
            checklist.updateStep('titulo', 'running', 'Gerando títulos e descrição...');
            sendEvent(controller, {
              progress: 97,
              message: 'Gerando títulos e descrição para YouTube...',
              currentFile: 'titulo',
              checklistSteps: checklist.getSteps(),
            });

            titulo = await generateWithProvider(
              buildTituloPrompt(roteiro, input),
              validKeys,
              selectedProvider,
              selectedProvider === 'anthropic'
                ? (input.claudeModel ? getClaudeModelName(input.claudeModel) : getClaudeModel('titulo'))
                : undefined
            );

            checklist.updateStep('titulo', 'success', 'Títulos criados');

            sendEvent(controller, {
              progress: 98,
              message: 'Títulos criados!',
              currentFile: 'titulo',
              checklistSteps: checklist.getSteps(),
              partialFile: {
                type: 'titulo',
                content: titulo,
                generatedAt: new Date().toISOString(),
                isComplete: true
              }
            });
          } catch (error: any) {
            checklist.updateStep('titulo', 'error', undefined, error.message);
            throw error;
          }

          // ETAPA 9: Gerar TAKES (Divisão em cenas visuais)
          try {
            checklist.updateStep('takes', 'running', 'Criando TAKES para geração visual...');
            sendEvent(controller, {
              progress: 99,
              message: 'Criando TAKES para geração de imagens/vídeos...',
              currentFile: 'takes',
              checklistSteps: checklist.getSteps(),
            });

            takes = await generateWithProvider(
              buildTakesPrompt(textoNarrado, personagens, input.language),
              validKeys,
              selectedProvider,
              selectedProvider === 'anthropic'
                ? (input.claudeModel ? getClaudeModelName(input.claudeModel) : getClaudeModel('takes'))
                : undefined
            );

            checklist.updateStep('takes', 'success', 'TAKES criados');

            sendEvent(controller, {
              progress: 99.5,
              message: 'TAKES criados! Finalizando...',
              currentFile: 'takes',
              checklistSteps: checklist.getSteps(),
              partialFile: {
                type: 'takes',
                content: takes,
                generatedAt: new Date().toISOString(),
                isComplete: true
              }
            });
          } catch (error: any) {
            checklist.updateStep('takes', 'error', undefined, error.message);
            throw error;
          }

          // Calcular total de caracteres para modo história
          totalCharacters = countCharacters(textoNarrado);

        } else {
          // ========== MODO DOCUMENTÁRIO: Usar fluxo original com ATOS ==========

          // ETAPA 1: Gerar Roteiro Estruturado (PT)
          try {
            checklist.updateStep('roteiro', 'running', 'Gerando roteiro estruturado...');
            sendEvent(controller, {
              progress: 5,
              message: 'Iniciando geração do roteiro estruturado...',
              currentFile: 'roteiro',
              checklistSteps: checklist.getSteps(),
            });

            console.log('\n🔍 ========== INICIANDO MODO DOCUMENTÁRIO ==========');
            console.log('📊 Target de caracteres:', input.targetCharacters || 100000);
            console.log('🚀 Gerando roteiro estruturado...');
            const roteiroStartTime = Date.now();

            roteiro = await generateWithProvider(
              buildRoteiroPrompt(input),
              validKeys,
              selectedProvider,
              selectedProvider === 'anthropic'
                ? (input.claudeModel ? getClaudeModelName(input.claudeModel) : getClaudeModel('roteiro'))
                : undefined
            );

            console.log('✅ Roteiro gerado em', (Date.now() - roteiroStartTime) / 1000, 'segundos');
            console.log('📝 Roteiro tem', roteiro.length, 'caracteres');

            checklist.updateStep('roteiro', 'success', `${roteiro.length} caracteres`);
          } catch (error: any) {
            checklist.updateStep('roteiro', 'error', undefined, error.message);
            throw error;
          }

          // Rate limiting: aguarda 3s antes da próxima chamada (12 req = 36s, bem abaixo de 60s)
          await new Promise(resolve => setTimeout(resolve, 3000));

          sendEvent(controller, {
            progress: 15,
            message: 'Roteiro estruturado criado! Validando...',
            currentFile: 'roteiro',
            checklistSteps: checklist.getSteps(),
            partialFile: {
              type: 'roteiro',
              content: roteiro,
              generatedAt: new Date().toISOString(),
              isComplete: true
            }
          });

          if (!validateRoteiro(roteiro)) {
            checklist.updateStep('roteiro', 'error', undefined, 'Roteiro não contém todas as seções necessárias');
            sendEvent(controller, {
              progress: 15,
              message: 'Erro: Roteiro incompleto',
              checklistSteps: checklist.getSteps(),
            });
            throw new Error('Roteiro gerado não contém todas as seções necessárias');
          }

        // ETAPA 2: Gerar Trilha Sonora (PT/EN)
        try {
          checklist.updateStep('trilha', 'running', 'Criando direção de trilha sonora...');
          sendEvent(controller, {
            progress: 20,
            message: 'Criando direção de trilha sonora...',
            currentFile: 'trilha',
            checklistSteps: checklist.getSteps(),
          });

          trilha = await generateWithProvider(
            buildTrilhaPrompt(roteiro, input),
            validKeys,
            selectedProvider,
            selectedProvider === 'anthropic'
              ? (input.claudeModel ? getClaudeModelName(input.claudeModel) : getClaudeModel('trilha'))
              : undefined
          );

          checklist.updateStep('trilha', 'success', `${trilha.length} caracteres`);

          // Rate limiting: aguarda 2s antes da próxima chamada
          await new Promise(resolve => setTimeout(resolve, 3000));

          sendEvent(controller, {
            progress: 25,
            message: 'Trilha sonora definida!',
            currentFile: 'trilha',
            checklistSteps: checklist.getSteps(),
            partialFile: {
              type: 'trilha',
              content: trilha,
              generatedAt: new Date().toISOString(),
              isComplete: true
            }
          });
        } catch (error: any) {
          checklist.updateStep('trilha', 'error', undefined, error.message);
          throw error;
        }

        // ETAPA 3: Gerar Texto Narrado (EN) - SEÇÃO POR SEÇÃO
        console.log('\n🔍 ========== INICIANDO GERAÇÃO DO TEXTO NARRADO ==========');
        console.log('📊 Roteiro tem', roteiro.length, 'caracteres');

        try {
          checklist.updateStep('textoNarrado_hook', 'running', 'Expandindo HOOK...');
          sendEvent(controller, {
            progress: 30,
            message: 'Expandindo HOOK do texto narrado (inglês)...',
            currentFile: 'textoNarrado',
            checklistSteps: checklist.getSteps(),
          });

          console.log('🚀 Gerando HOOK do texto narrado...');
          const hookStartTime = Date.now();
          const hook = await generateWithProvider(
            buildTextoNarradoHookPrompt(roteiro, input),
            validKeys,
            selectedProvider,
            selectedProvider === 'anthropic'
              ? (input.claudeModel ? getClaudeModelName(input.claudeModel) : getClaudeModel('textoNarrado'))
              : undefined
          );
          console.log('✅ HOOK gerado em', (Date.now() - hookStartTime) / 1000, 'segundos');
          console.log('📝 HOOK tem', hook.length, 'caracteres');

          checklist.updateStep('textoNarrado_hook', 'success', `${hook.length} caracteres`);

          textoNarrado += `${input.title.toUpperCase()} - NARRATED TEXT\nEnglish Version\n================================================\n\n${hook}\n\n`;

          // Rate limiting: aguarda 2s antes da próxima chamada
          await new Promise(resolve => setTimeout(resolve, 3000));

          sendEvent(controller, {
            progress: 35,
            message: `HOOK concluído (${countCharacters(hook)} caracteres)`,
            currentFile: 'textoNarrado',
            checklistSteps: checklist.getSteps(),
          });
        } catch (error: any) {
          checklist.updateStep('textoNarrado_hook', 'error', undefined, error.message);
          throw error;
        }

        // Gerar os 6 atos
        const acts = [
          { num: 1, name: 'ONE', timestamps: '2:30-7:30', progress: 40 },
          { num: 2, name: 'TWO', timestamps: '7:30-15:30', progress: 50 },
          { num: 3, name: 'THREE', timestamps: '15:30-25:30', progress: 60 },
          { num: 4, name: 'FOUR', timestamps: '25:30-37:30', progress: 70 },
          { num: 5, name: 'FIVE', timestamps: '37:30-45:30', progress: 75 },
          { num: 6, name: 'SIX', timestamps: '45:30-52:30', progress: 80 },
        ];

        for (const act of acts) {
          try {
            const atoStepId = `textoNarrado_ato${act.num}`;
            checklist.updateStep(atoStepId, 'running', `Expandindo ATO ${act.num}...`);
            sendEvent(controller, {
              progress: act.progress,
              message: `Expandindo ATO ${act.num}...`,
              currentFile: 'textoNarrado',
              checklistSteps: checklist.getSteps(),
            });

            // Extrair título do ato do roteiro
            const atoRegex = new RegExp(`ATO ${['I', 'II', 'III', 'IV', 'V', 'VI'][act.num - 1]} - ([^\\n(]+)`, 'i');
            const atoMatch = roteiro.match(atoRegex);
            const atoTitle = atoMatch ? atoMatch[1].trim() : `Act ${act.name}`;

            console.log(`\n🚀 Gerando ATO ${act.num}: "${atoTitle}"...`);
            const atoStartTime = Date.now();

            const atoContent = await generateWithProvider(
              buildTextoNarradoAtoPrompt(roteiro, act.num, atoTitle, act.timestamps),
              validKeys,
              selectedProvider,
              selectedProvider === 'anthropic'
                ? (input.claudeModel ? getClaudeModelName(input.claudeModel) : getClaudeModel('textoNarrado'))
                : undefined
            );

            console.log(`✅ ATO ${act.num} gerado em`, (Date.now() - atoStartTime) / 1000, 'segundos');
            console.log(`📝 ATO ${act.num} tem`, atoContent.length, 'caracteres');

            checklist.updateStep(atoStepId, 'success', `${atoContent.length} caracteres`);

            textoNarrado += `${atoContent}\n\n`;

            // Rate limiting: aguarda 2s entre atos
            await new Promise(resolve => setTimeout(resolve, 3000));

            sendEvent(controller, {
              progress: act.progress + 2,
              message: `ATO ${act.num} concluído (${countCharacters(atoContent)} caracteres)`,
              currentFile: 'textoNarrado',
              checklistSteps: checklist.getSteps(),
              partialFile: {
                type: 'textoNarrado',
                content: textoNarrado,
                generatedAt: new Date().toISOString(),
                isComplete: false // Ainda não terminou (falta conclusão)
              }
            });
          } catch (error: any) {
            checklist.updateStep(`textoNarrado_ato${act.num}`, 'error', undefined, error.message);
            throw error;
          }
        }

        // Conclusão
        try {
          checklist.updateStep('textoNarrado_conclusao', 'running', 'Expandindo CONCLUSÃO...');
          sendEvent(controller, {
            progress: 85,
            message: 'Expandindo CONCLUSÃO...',
            currentFile: 'textoNarrado',
            checklistSteps: checklist.getSteps(),
          });

          console.log('\n🚀 Gerando CONCLUSÃO do texto narrado...');
          const conclusaoStartTime = Date.now();

          const conclusao = await generateWithProvider(
            buildTextoNarradoConclusaoPrompt(roteiro),
            validKeys,
            selectedProvider,
            selectedProvider === 'anthropic'
              ? (input.claudeModel ? getClaudeModelName(input.claudeModel) : getClaudeModel('textoNarrado'))
              : undefined
          );

          console.log('✅ CONCLUSÃO gerada em', (Date.now() - conclusaoStartTime) / 1000, 'segundos');
          console.log('📝 CONCLUSÃO tem', conclusao.length, 'caracteres');

          checklist.updateStep('textoNarrado_conclusao', 'success', `${conclusao.length} caracteres`);

          textoNarrado += conclusao;

          console.log('\n📊 RESUMO DO TEXTO NARRADO:');
          console.log('   Total de caracteres:', textoNarrado.length);
          console.log('   Partes geradas: HOOK +', acts.length, 'ATOS + CONCLUSÃO');
          console.log('🔍 ========== FIM DA GERAÇÃO DO TEXTO NARRADO ==========\n');

          // Rate limiting: aguarda 2s antes da próxima chamada
          await new Promise(resolve => setTimeout(resolve, 3000));

          const textoNarradoFinalChars = countCharacters(textoNarrado);
          console.log('📤 Enviando texto narrado completo ao cliente:', textoNarradoFinalChars, 'caracteres');

          sendEvent(controller, {
            progress: 88,
            message: `Texto narrado completo: ${textoNarradoFinalChars.toLocaleString()} caracteres`,
            currentFile: 'textoNarrado',
            checklistSteps: checklist.getSteps(),
            partialFile: {
              type: 'textoNarrado',
              content: textoNarrado,
              generatedAt: new Date().toISOString(),
              isComplete: true // Agora está completo
            }
          });
        } catch (error: any) {
          checklist.updateStep('textoNarrado_conclusao', 'error', undefined, error.message);
          throw error;
        }

        // Validar texto narrado
        totalCharacters = countCharacters(textoNarrado);
        const targetMinDoc = input.targetCharacters || 9000;
        sendEvent(controller, {
          progress: 90,
          message: `Texto narrado completo: ${totalCharacters.toLocaleString()} caracteres. Validando...`,
          currentFile: 'textoNarrado',
        });

        if (totalCharacters < targetMinDoc * 0.6) {
          console.warn(`Aviso: Texto narrado tem apenas ${totalCharacters} caracteres (mínimo: ${Math.floor(targetMinDoc * 0.6)})`);
        }

        // ETAPA 4: Gerar Personagens (EN)
        try {
          checklist.updateStep('personagens', 'running', 'Criando descrições de personagens...');
          sendEvent(controller, {
            progress: 92,
            message: 'Criando descrições de personagens para IA...',
            currentFile: 'personagens',
            checklistSteps: checklist.getSteps(),
          });

          personagens = await generateWithProvider(
            buildPersonagensPrompt(roteiro, input),
            validKeys,
            selectedProvider,
            selectedProvider === 'anthropic'
              ? (input.claudeModel ? getClaudeModelName(input.claudeModel) : getClaudeModel('personagens'))
              : undefined
          );

          checklist.updateStep('personagens', 'success', `${personagens.length} caracteres`);

          // Rate limiting: aguarda 2s antes da próxima chamada
          await new Promise(resolve => setTimeout(resolve, 3000));

          sendEvent(controller, {
            progress: 95,
            message: 'Personagens descritos!',
            currentFile: 'personagens',
            checklistSteps: checklist.getSteps(),
            partialFile: {
              type: 'personagens',
              content: personagens,
              generatedAt: new Date().toISOString(),
              isComplete: true
            }
          });
        } catch (error: any) {
          checklist.updateStep('personagens', 'error', undefined, error.message);
          throw error;
        }

        // ETAPA 5: Gerar Títulos (PT)
        try {
          checklist.updateStep('titulo', 'running', 'Gerando títulos e descrição...');
          sendEvent(controller, {
            progress: 97,
            message: 'Gerando títulos e descrição para YouTube...',
            currentFile: 'titulo',
            checklistSteps: checklist.getSteps(),
          });

          titulo = await generateWithProvider(
            buildTituloPrompt(roteiro, input),
            validKeys,
            selectedProvider,
            selectedProvider === 'anthropic'
              ? (input.claudeModel ? getClaudeModelName(input.claudeModel) : getClaudeModel('titulo'))
              : undefined
          );

          checklist.updateStep('titulo', 'success', `${titulo.length} caracteres`);

          sendEvent(controller, {
            progress: 99,
            message: 'Títulos criados! Finalizando...',
            currentFile: 'titulo',
            checklistSteps: checklist.getSteps(),
            partialFile: {
              type: 'titulo',
              content: titulo,
              generatedAt: new Date().toISOString(),
              isComplete: true
            }
          });
        } catch (error: any) {
          checklist.updateStep('titulo', 'error', undefined, error.message);
          throw error;
        }
        } // Fim do else para modo documentário

        // Log final com resumo completo
        console.log('\n' + '='.repeat(60));
        console.log('📊 RESUMO FINAL DA GERAÇÃO');
        console.log('='.repeat(60));
        console.log('Modo:', input.mode);
        console.log('Provider:', selectedProvider);
        console.log('\n📄 ARQUIVOS GERADOS:');
        console.log('  ✅ Roteiro:', roteiro.length, 'caracteres');
        console.log('  ✅ Trilha:', trilha.length, 'caracteres');
        console.log('  ✅ Texto Narrado:', textoNarrado.length, 'caracteres');
        console.log('  ✅ Personagens:', personagens.length, 'caracteres');
        console.log('  ✅ Título:', titulo.length, 'caracteres');
        if (takes) {
          console.log('  ✅ Takes:', takes.length, 'caracteres');
        }
        console.log('\n📈 TOTAIS:');
        console.log('  Total de caracteres:', totalCharacters);
        console.log('  Target:', input.targetCharacters || 100000);
        console.log('='.repeat(60) + '\n');

        // Resultado final - validar baseado em caracteres
        // Para testes, aceita 60% do valor alvo (permite roteiros menores)
        const targetMinimum = input.targetCharacters ? input.targetCharacters * 0.6 : (input.mode === 'story' ? 5000 : 5000);
        const validated = totalCharacters >= targetMinimum;

        const result: GeneratedScript & { stats: any } = {
          roteiro,
          trilha,
          textoNarrado,
          personagens,
          titulo,
          takes,
          stats: {
            totalCharacters: totalCharacters,
            validated: validated,
            mode: input.mode,
          },
        };

        // Aguardar um pouco antes do evento final para garantir que tudo foi processado
        await new Promise(resolve => setTimeout(resolve, 500));

        // ⚠️ NÃO enviar 'result' completo aqui - é muito grande e corta o SSE
        // O frontend já recebeu todos os arquivos via partialFile nos eventos anteriores
        // Enviamos apenas estatísticas e o sinal de conclusão
        sendEvent(controller, {
          progress: 100,
          message: '✓ Roteiro completo gerado com sucesso!',
          complete: true,
          stats: {
            totalCharacters: totalCharacters,
            validated: validated,
            mode: input.mode,
          }
        });

        console.log('✅ Geração concluída! Evento final enviado.');

        // Garantir que o evento final seja enviado antes de fechar
        await new Promise(resolve => setTimeout(resolve, 300));

        controller.close();
      } catch (error: any) {
        console.error('Erro na geração:', error);
        sendEvent(controller, {
          progress: 0,
          message: `Erro: ${error.message}`,
          error: true,
        });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
