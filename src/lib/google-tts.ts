import { TextToSpeechClient } from '@google-cloud/text-to-speech';

export interface TTSOptions {
  text: string;
  languageCode?: string;
  voiceName?: string;
  gender?: 'MALE' | 'FEMALE' | 'NEUTRAL';
  speakingRate?: number;
  pitch?: number;
  volumeGainDb?: number;
}

export interface TTSChunk {
  index: number;
  text: string;
  charCount: number;
}

/**
 * Divide texto em chunks de até 5000 caracteres (limite do Google TTS)
 */
export function splitTextIntoChunks(text: string, maxChars: number = 5000): TTSChunk[] {
  const chunks: TTSChunk[] = [];
  let currentIndex = 0;
  let chunkIndex = 0;

  // Dividir por parágrafos primeiro
  const paragraphs = text.split(/\n\n+/);

  let currentChunk = '';

  for (const paragraph of paragraphs) {
    // Se o parágrafo sozinho exceder o limite, dividir por frases
    if (paragraph.length > maxChars) {
      // Salvar chunk atual se existir
      if (currentChunk.length > 0) {
        chunks.push({
          index: chunkIndex++,
          text: currentChunk.trim(),
          charCount: currentChunk.length,
        });
        currentChunk = '';
      }

      // Dividir parágrafo grande por frases
      const sentences = paragraph.match(/[^.!?]+[.!?]+/g) || [paragraph];

      for (const sentence of sentences) {
        if (currentChunk.length + sentence.length > maxChars) {
          if (currentChunk.length > 0) {
            chunks.push({
              index: chunkIndex++,
              text: currentChunk.trim(),
              charCount: currentChunk.length,
            });
            currentChunk = '';
          }

          // Se uma frase sozinha for maior que o limite, dividir por palavras
          if (sentence.length > maxChars) {
            const words = sentence.split(/\s+/);
            for (const word of words) {
              if (currentChunk.length + word.length + 1 > maxChars) {
                chunks.push({
                  index: chunkIndex++,
                  text: currentChunk.trim(),
                  charCount: currentChunk.length,
                });
                currentChunk = word + ' ';
              } else {
                currentChunk += word + ' ';
              }
            }
          } else {
            currentChunk = sentence;
          }
        } else {
          currentChunk += sentence;
        }
      }
    } else {
      // Parágrafo normal
      if (currentChunk.length + paragraph.length + 2 > maxChars) {
        chunks.push({
          index: chunkIndex++,
          text: currentChunk.trim(),
          charCount: currentChunk.length,
        });
        currentChunk = paragraph + '\n\n';
      } else {
        currentChunk += paragraph + '\n\n';
      }
    }
  }

  // Adicionar último chunk
  if (currentChunk.trim().length > 0) {
    chunks.push({
      index: chunkIndex++,
      text: currentChunk.trim(),
      charCount: currentChunk.length,
    });
  }

  return chunks;
}

/**
 * Gera áudio usando Google Cloud Text-to-Speech
 */
export async function generateTTS(options: TTSOptions): Promise<Buffer> {
  const {
    text,
    languageCode = 'pt-BR',
    voiceName = 'pt-BR-Standard-A',
    gender = 'FEMALE',
    speakingRate = 1.0,
    pitch = 0,
    volumeGainDb = 0,
  } = options;

  // Criar cliente TTS
  const client = new TextToSpeechClient({
    apiKey: process.env.GOOGLE_TTS_API_KEY,
  });

  const request = {
    input: { text },
    voice: {
      languageCode,
      name: voiceName,
      ssmlGender: gender,
    },
    audioConfig: {
      audioEncoding: 'MP3' as const,
      speakingRate,
      pitch,
      volumeGainDb,
    },
  };

  const [response] = await client.synthesizeSpeech(request);

  if (!response.audioContent) {
    throw new Error('Nenhum áudio foi gerado');
  }

  return Buffer.from(response.audioContent);
}

/**
 * Lista vozes disponíveis
 */
export async function listVoices(languageCode: string = 'pt-BR') {
  const client = new TextToSpeechClient({
    apiKey: process.env.GOOGLE_TTS_API_KEY,
  });

  const [response] = await client.listVoices({ languageCode });

  return response.voices || [];
}
