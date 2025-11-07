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
  validateRoteiro,
  validateTextoNarrado,
  countWords,
  extractSectionWordCounts,
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

  // Validar API keys
  if (!input.apiKeys || !input.apiKeys.gemini || input.apiKeys.gemini.length === 0) {
    return new Response(
      JSON.stringify({ error: 'Pelo menos uma API Key do Gemini é obrigatória' }),
      { status: 400 }
    );
  }

  const geminiKeys = input.apiKeys.gemini;

  // Criar stream SSE para progresso em tempo real
  const stream = new ReadableStream({
    async start(controller) {
      try {
        let roteiro = '';
        let trilha = '';
        let textoNarrado = '';
        let personagens = '';
        let titulo = '';

        // ETAPA 1: Gerar Roteiro Estruturado (PT)
        sendEvent(controller, {
          progress: 5,
          message: 'Iniciando geração do roteiro estruturado...',
          currentFile: 'roteiro',
        });

        roteiro = await generateWithRotation(buildRoteiroPrompt(input), geminiKeys);

        // Rate limiting: aguarda 2s antes da próxima chamada
        await new Promise(resolve => setTimeout(resolve, 5000));

        sendEvent(controller, {
          progress: 15,
          message: 'Roteiro estruturado criado! Validando...',
          currentFile: 'roteiro',
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
        await new Promise(resolve => setTimeout(resolve, 5000));

        sendEvent(controller, {
          progress: 25,
          message: 'Trilha sonora definida!',
          currentFile: 'trilha',
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
        await new Promise(resolve => setTimeout(resolve, 5000));

        sendEvent(controller, {
          progress: 35,
          message: `HOOK concluído (${countWords(hook)} palavras)`,
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
            message: `Expandindo ATO ${act.num} (meta: 1000-1250 palavras)...`,
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
          await new Promise(resolve => setTimeout(resolve, 5000));

          sendEvent(controller, {
            progress: act.progress + 2,
            message: `ATO ${act.num} concluído (${countWords(atoContent)} palavras)`,
            currentFile: 'textoNarrado',
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
        await new Promise(resolve => setTimeout(resolve, 5000));

        sendEvent(controller, {
          progress: 88,
          message: `Conclusão concluída (${countWords(conclusao)} palavras)`,
          currentFile: 'textoNarrado',
        });

        // Validar texto narrado
        const totalWords = countWords(textoNarrado);
        sendEvent(controller, {
          progress: 90,
          message: `Texto narrado completo: ${totalWords} palavras. Validando qualidade...`,
          currentFile: 'textoNarrado',
        });

        if (totalWords < 8500) {
          console.warn(`Aviso: Texto narrado tem apenas ${totalWords} palavras (mínimo: 8500)`);
        }

        // ETAPA 4: Gerar Personagens (EN)
        sendEvent(controller, {
          progress: 92,
          message: 'Criando descrições de personagens para IA...',
          currentFile: 'personagens',
        });

        personagens = await generateWithRotation(buildPersonagensPrompt(roteiro, input), geminiKeys);

        // Rate limiting: aguarda 2s antes da próxima chamada
        await new Promise(resolve => setTimeout(resolve, 5000));

        sendEvent(controller, {
          progress: 95,
          message: 'Personagens descritos!',
          currentFile: 'personagens',
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
        });

        // Extrair contagem por seção
        const sectionCounts = extractSectionWordCounts(textoNarrado);

        // Resultado final
        const result: GeneratedScript & { stats: any } = {
          roteiro,
          trilha,
          textoNarrado,
          personagens,
          titulo,
          stats: {
            totalWords: totalWords,
            sectionWords: sectionCounts,
            validated: totalWords >= 8500,
          },
        };

        sendEvent(controller, {
          progress: 100,
          message: '✓ Roteiro completo gerado com sucesso!',
          complete: true,
          result,
        });

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
