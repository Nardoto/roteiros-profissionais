import { GoogleGenerativeAI } from "@google/generative-ai";

// Limite seguro para evitar erro 429 (aproximadamente 17k tokens)
const MAX_CHARS_PER_CHUNK = 25000;

export async function generateContent(prompt: string, apiKey: string): Promise<string> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
      }
    });

    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error: any) {
    console.error("Erro ao gerar conteúdo:", error);

    // Tratamento específico para erro 429 (Resource exhausted)
    if (error.message && error.message.includes('429')) {
      throw new Error(
        'Limite de requisições atingido! A API gratuita do Gemini tem limite de requisições por minuto. ' +
        'Por favor, aguarde alguns minutos antes de tentar novamente. ' +
        'Se o problema persistir, você pode ter atingido o limite diário da sua API key.'
      );
    }

    // Tratamento para modelo não encontrado
    if (error.message && (error.message.includes('404') || error.message.includes('not found'))) {
      throw new Error(
        'Modelo Gemini não encontrado. Verifique se a API key está correta e se o modelo está disponível.'
      );
    }

    throw error;
  }
}

export async function generateLongContent(prompt: string, apiKey: string, maxRetries = 3): Promise<string> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await generateContent(prompt, apiKey);
    } catch (error: any) {
      if (i === maxRetries - 1) throw error;
      console.log(`Tentativa ${i + 1} falhou, tentando novamente...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  throw new Error("Falha ao gerar conteúdo após múltiplas tentativas");
}

/**
 * Gera conteúdo com rotação automática de API keys
 * Tenta cada API key até conseguir gerar o conteúdo
 */
export async function generateWithRotation(prompt: string, apiKeys: string[]): Promise<string> {
  let lastError: Error | null = null;

  for (let i = 0; i < apiKeys.length; i++) {
    const apiKey = apiKeys[i];
    console.log(`Tentando API key ${i + 1} de ${apiKeys.length}...`);

    try {
      const result = await generateLongContent(prompt, apiKey);
      console.log(`✓ Sucesso com API key ${i + 1}`);
      return result;
    } catch (error: any) {
      console.warn(`✗ API key ${i + 1} falhou:`, error.message);
      lastError = error;

      // Se for erro 429 e ainda há keys, tenta a próxima
      if (error.message && error.message.includes('429') && i < apiKeys.length - 1) {
        console.log(`Rotacionando para próxima API key...`);
        continue;
      }

      // Se não for 429 ou é a última key, lança o erro
      if (i === apiKeys.length - 1) {
        throw error;
      }
    }
  }

  throw lastError || new Error("Falha ao gerar conteúdo com todas as API keys");
}

/**
 * Divide texto em chunks inteligentes respeitando parágrafos
 */
function divideTextIntoChunks(text: string, maxChunkSize: number = MAX_CHARS_PER_CHUNK): string[] {
  if (text.length <= maxChunkSize) {
    return [text];
  }

  const chunks: string[] = [];
  let currentChunk = '';

  // Divide por parágrafos duplos primeiro
  const paragraphs = text.split('\n\n');

  for (const paragraph of paragraphs) {
    // Se o parágrafo sozinho é maior que o limite, divide por parágrafos simples
    if (paragraph.length > maxChunkSize) {
      const subParagraphs = paragraph.split('\n');

      for (const subPara of subParagraphs) {
        if ((currentChunk + subPara).length > maxChunkSize && currentChunk) {
          chunks.push(currentChunk.trim());
          currentChunk = subPara + '\n';
        } else {
          currentChunk += subPara + '\n';
        }
      }
    } else {
      // Verifica se adicionar este parágrafo ultrapassa o limite
      if ((currentChunk + paragraph + '\n\n').length > maxChunkSize && currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = paragraph + '\n\n';
      } else {
        currentChunk += paragraph + '\n\n';
      }
    }
  }

  // Adiciona o último chunk se houver
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Gera conteúdo dividindo em chunks se necessário, com rate limiting
 */
export async function generateContentWithChunks(
  basePrompt: string,
  content: string,
  apiKeys: string[],
  onProgress?: (chunk: number, total: number) => void
): Promise<string> {
  // Se o conteúdo é pequeno, gera direto
  if (content.length <= MAX_CHARS_PER_CHUNK) {
    console.log('Conteúdo pequeno, gerando direto...');
    return await generateWithRotation(basePrompt, apiKeys);
  }

  console.log(`Conteúdo grande (${content.length} caracteres), dividindo em chunks...`);
  const chunks = divideTextIntoChunks(content);
  console.log(`Dividido em ${chunks.length} chunks`);

  const results: string[] = [];

  for (let i = 0; i < chunks.length; i++) {
    console.log(`Processando chunk ${i + 1} de ${chunks.length}...`);

    if (onProgress) {
      onProgress(i + 1, chunks.length);
    }

    // Modifica o prompt para incluir apenas este chunk
    const chunkPrompt = basePrompt.replace(content, chunks[i]);

    // Gera o conteúdo para este chunk (com rotação de API keys)
    const result = await generateWithRotation(chunkPrompt, apiKeys);
    results.push(result);

    // Rate limiting: aguarda 2 segundos entre chunks (exceto no último)
    if (i < chunks.length - 1) {
      console.log('Aguardando 2s antes do próximo chunk (rate limiting)...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Junta todos os resultados
  return results.join('\n\n');
}
