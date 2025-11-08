import { NextRequest } from 'next/server';
import { generateWithRotation } from '@/lib/gemini';
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
import { ScriptInput, GeneratedScript } from '@/types';

// Helper para enviar eventos SSE
function sendEvent(controller: ReadableStreamDefaultController, data: any) {
  const message = `data: ${JSON.stringify(data)}\n\n`;
  controller.enqueue(new TextEncoder().encode(message));
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

  // IMPORTANTE: Por enquanto, apenas Gemini está implementado
  // Outros providers precisarão de suas próprias implementações
  if (selectedProvider !== 'gemini') {
    return new Response(
      JSON.stringify({ error: `Provider "${input.selectedApi.label}" ainda não está implementado. Por favor, use Google Gemini por enquanto.` }),
      { status: 501 } // Not Implemented
    );
  }

  const geminiKeys = validKeys;

  // Criar stream SSE para progresso em tempo real
  const stream = new ReadableStream({
    async start(controller) {
      try {
        let roteiro = '';
        let trilha = '';
        let textoNarrado = '';
        let personagens = '';
        let titulo = '';
        let takes = '';
        let totalCharacters = 0;

        // Check if it's story mode
        if (input.mode === 'story') {
          // ========== MODO HISTÓRIA: Usar prompts de história com TÓPICOS ==========

          // ETAPA 1: Gerar Estrutura com TÓPICOS (não ATOS)
          sendEvent(controller, {
            progress: 5,
            message: 'Criando estrutura da história com 3 tópicos...',
            currentFile: 'roteiro',
          });

          const estrutura = await generateWithRotation(
            buildEstruturaPrompt(input, input.language || 'pt'),
            geminiKeys
          );

          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 3000));

          sendEvent(controller, {
            progress: 10,
            message: 'Estrutura criada! Gerando introdução...',
            currentFile: 'roteiro',
          });

          // ETAPA 2: Gerar Hook/Introdução
          const hook = await generateWithRotation(
            buildHookPrompt(input, estrutura, input.language || 'pt'),
            geminiKeys
          );

          roteiro = `${input.title.toUpperCase()} - ROTEIRO COMPLETO\n`;
          roteiro += '='.repeat(60) + '\n\n';
          roteiro += 'INTRODUÇÃO\n' + '-'.repeat(40) + '\n\n';
          roteiro += hook + '\n\n';

          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 3000));

          sendEvent(controller, {
            progress: 15,
            message: 'Introdução criada! Iniciando geração dos tópicos...',
            currentFile: 'roteiro',
          });

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
            const progressBase = 20 + (topic.number - 1) * 20; // 20%, 40%, 60%

            sendEvent(controller, {
              progress: progressBase,
              message: `Gerando TÓPICO ${topic.number}: ${topic.title} (meta: ~${targetPerTopic.toLocaleString()} caracteres)...`,
              currentFile: 'roteiro',
            });

            const topicContent = await generateWithRotation(
              buildTopicoPrompt(
                topic.number,
                topic.title,
                topic.subtopics,
                input,
                input.language || 'pt',
                topicosGerados
              ),
              geminiKeys
            );

            roteiro += `\nTÓPICO ${topic.number}: ${topic.title}\n` + '='.repeat(60) + '\n\n';
            roteiro += topicContent + '\n\n';
            topicosGerados.push(topicContent);

            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, 3000));

            const charCount = countCharacters(topicContent);
            sendEvent(controller, {
              progress: progressBase + 15,
              message: `TÓPICO ${topic.number} concluído (${charCount.toLocaleString()} caracteres)`,
              currentFile: 'roteiro',
              partialFile: {
                type: 'roteiro',
                content: roteiro,
                generatedAt: new Date().toISOString(),
                isComplete: false
              }
            });
          }

          // ETAPA 4: Gerar Conclusão/CTA
          sendEvent(controller, {
            progress: 80,
            message: 'Gerando conclusão e chamada para ação...',
            currentFile: 'roteiro',
          });

          const conclusao = await generateWithRotation(
            buildConclusaoPrompt(input, input.language || 'pt'),
            geminiKeys
          );

          roteiro += '\nCONCLUSÃO\n' + '='.repeat(60) + '\n\n';
          roteiro += conclusao;

          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 3000));

          sendEvent(controller, {
            progress: 85,
            message: 'Roteiro completo! Gerando arquivos complementares...',
            currentFile: 'roteiro',
            partialFile: {
              type: 'roteiro',
              content: roteiro,
              generatedAt: new Date().toISOString(),
              isComplete: true
            }
          });

          // Para modo história, vamos gerar os arquivos complementares

          // ETAPA 5: Gerar Trilha Sonora
          sendEvent(controller, {
            progress: 88,
            message: 'Criando direção de trilha sonora...',
            currentFile: 'trilha',
          });

          trilha = await generateWithRotation(buildTrilhaPrompt(roteiro, input), geminiKeys);

          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 3000));

          sendEvent(controller, {
            progress: 90,
            message: 'Trilha sonora definida!',
            currentFile: 'trilha',
            partialFile: {
              type: 'trilha',
              content: trilha,
              generatedAt: new Date().toISOString(),
              isComplete: true
            }
          });

          // ETAPA 6: Texto Narrado (para modo história é o próprio roteiro)
          textoNarrado = `${input.title.toUpperCase()} - TEXTO NARRADO\n`;
          textoNarrado += '='.repeat(60) + '\n\n';
          textoNarrado += 'NOTA: Para modo história, o texto narrado segue a narrativa completa.\n\n';
          textoNarrado += roteiro;

          // ETAPA 7: Gerar Personagens
          sendEvent(controller, {
            progress: 92,
            message: 'Criando descrições de personagens para IA...',
            currentFile: 'personagens',
          });

          personagens = await generateWithRotation(buildPersonagensPrompt(roteiro, input), geminiKeys);

          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 3000));

          sendEvent(controller, {
            progress: 95,
            message: 'Personagens descritos!',
            currentFile: 'personagens',
            partialFile: {
              type: 'personagens',
              content: personagens,
              generatedAt: new Date().toISOString(),
              isComplete: true
            }
          });

          // ETAPA 8: Gerar Títulos
          sendEvent(controller, {
            progress: 97,
            message: 'Gerando títulos e descrição para YouTube...',
            currentFile: 'titulo',
          });

          titulo = await generateWithRotation(buildTituloPrompt(roteiro, input), geminiKeys);

          sendEvent(controller, {
            progress: 98,
            message: 'Títulos criados!',
            currentFile: 'titulo',
            partialFile: {
              type: 'titulo',
              content: titulo,
              generatedAt: new Date().toISOString(),
              isComplete: true
            }
          });

          // ETAPA 9: Gerar TAKES (Divisão em cenas visuais)
          sendEvent(controller, {
            progress: 99,
            message: 'Criando TAKES para geração de imagens/vídeos...',
            currentFile: 'takes',
          });

          takes = await generateWithRotation(
            buildTakesPrompt(textoNarrado, personagens, input.language),
            geminiKeys
          );

          sendEvent(controller, {
            progress: 99.5,
            message: 'TAKES criados! Finalizando...',
            currentFile: 'takes',
            partialFile: {
              type: 'takes',
              content: takes,
              generatedAt: new Date().toISOString(),
              isComplete: true
            }
          });

          // Calcular total de caracteres para modo história
          totalCharacters = countCharacters(textoNarrado);

        } else {
          // ========== MODO DOCUMENTÁRIO: Usar fluxo original com ATOS ==========

          // ETAPA 1: Gerar Roteiro Estruturado (PT)
          sendEvent(controller, {
            progress: 5,
            message: 'Iniciando geração do roteiro estruturado...',
            currentFile: 'roteiro',
          });

          roteiro = await generateWithRotation(buildRoteiroPrompt(input), geminiKeys);

          // Rate limiting: aguarda 3s antes da próxima chamada (12 req = 36s, bem abaixo de 60s)
          await new Promise(resolve => setTimeout(resolve, 3000));

          sendEvent(controller, {
            progress: 15,
            message: 'Roteiro estruturado criado! Validando...',
            currentFile: 'roteiro',
            partialFile: {
              type: 'roteiro',
              content: roteiro,
              generatedAt: new Date().toISOString(),
              isComplete: true
            }
          });

          if (!validateRoteiro(roteiro)) {
            throw new Error('Roteiro gerado não contém todas as seções necessárias');
          }

        // ETAPA 2: Gerar Trilha Sonora (PT/EN)
        sendEvent(controller, {
          progress: 20,
          message: 'Criando direção de trilha sonora...',
          currentFile: 'trilha',
        });

        trilha = await generateWithRotation(buildTrilhaPrompt(roteiro, input), geminiKeys);

        // Rate limiting: aguarda 2s antes da próxima chamada
        await new Promise(resolve => setTimeout(resolve, 3000));

        sendEvent(controller, {
          progress: 25,
          message: 'Trilha sonora definida!',
          currentFile: 'trilha',
          partialFile: {
            type: 'trilha',
            content: trilha,
            generatedAt: new Date().toISOString(),
            isComplete: true
          }
        });

        // ETAPA 3: Gerar Texto Narrado (EN) - SEÇÃO POR SEÇÃO
        sendEvent(controller, {
          progress: 30,
          message: 'Expandindo HOOK do texto narrado (inglês)...',
          currentFile: 'textoNarrado',
        });

        const hook = await generateWithRotation(buildTextoNarradoHookPrompt(roteiro, input), geminiKeys);
        textoNarrado += `${input.title.toUpperCase()} - NARRATED TEXT\nEnglish Version\n================================================\n\n${hook}\n\n`;

        // Rate limiting: aguarda 2s antes da próxima chamada
        await new Promise(resolve => setTimeout(resolve, 3000));

        sendEvent(controller, {
          progress: 35,
          message: `HOOK concluído (${countCharacters(hook)} caracteres)`,
          currentFile: 'textoNarrado',
        });

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
          sendEvent(controller, {
            progress: act.progress,
            message: `Expandindo ATO ${act.num}...`,
            currentFile: 'textoNarrado',
          });

          // Extrair título do ato do roteiro
          const atoRegex = new RegExp(`ATO ${['I', 'II', 'III', 'IV', 'V', 'VI'][act.num - 1]} - ([^\\n(]+)`, 'i');
          const atoMatch = roteiro.match(atoRegex);
          const atoTitle = atoMatch ? atoMatch[1].trim() : `Act ${act.name}`;

          const atoContent = await generateWithRotation(
            buildTextoNarradoAtoPrompt(roteiro, act.num, atoTitle, act.timestamps),
            geminiKeys
          );

          textoNarrado += `${atoContent}\n\n`;

          // Rate limiting: aguarda 2s entre atos
          await new Promise(resolve => setTimeout(resolve, 3000));

          sendEvent(controller, {
            progress: act.progress + 2,
            message: `ATO ${act.num} concluído (${countCharacters(atoContent)} caracteres)`,
            currentFile: 'textoNarrado',
            partialFile: {
              type: 'textoNarrado',
              content: textoNarrado,
              generatedAt: new Date().toISOString(),
              isComplete: false // Ainda não terminou (falta conclusão)
            }
          });
        }

        // Conclusão
        sendEvent(controller, {
          progress: 85,
          message: 'Expandindo CONCLUSÃO...',
          currentFile: 'textoNarrado',
        });

        const conclusao = await generateWithRotation(buildTextoNarradoConclusaoPrompt(roteiro), geminiKeys);
        textoNarrado += conclusao;

        // Rate limiting: aguarda 2s antes da próxima chamada
        await new Promise(resolve => setTimeout(resolve, 3000));

        sendEvent(controller, {
          progress: 88,
          message: `Conclusão concluída (${countCharacters(conclusao)} caracteres)`,
          currentFile: 'textoNarrado',
          partialFile: {
            type: 'textoNarrado',
            content: textoNarrado,
            generatedAt: new Date().toISOString(),
            isComplete: true // Agora está completo
          }
        });

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
        sendEvent(controller, {
          progress: 92,
          message: 'Criando descrições de personagens para IA...',
          currentFile: 'personagens',
        });

        personagens = await generateWithRotation(buildPersonagensPrompt(roteiro, input), geminiKeys);

        // Rate limiting: aguarda 2s antes da próxima chamada
        await new Promise(resolve => setTimeout(resolve, 3000));

        sendEvent(controller, {
          progress: 95,
          message: 'Personagens descritos!',
          currentFile: 'personagens',
          partialFile: {
            type: 'personagens',
            content: personagens,
            generatedAt: new Date().toISOString(),
            isComplete: true
          }
        });

        // ETAPA 5: Gerar Títulos (PT)
        sendEvent(controller, {
          progress: 97,
          message: 'Gerando títulos e descrição para YouTube...',
          currentFile: 'titulo',
        });

        titulo = await generateWithRotation(buildTituloPrompt(roteiro, input), geminiKeys);

          sendEvent(controller, {
            progress: 99,
            message: 'Títulos criados! Finalizando...',
            currentFile: 'titulo',
            partialFile: {
              type: 'titulo',
              content: titulo,
              generatedAt: new Date().toISOString(),
              isComplete: true
            }
          });
        } // Fim do else para modo documentário

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
