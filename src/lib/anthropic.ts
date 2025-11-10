import Anthropic from "@anthropic-ai/sdk";

// Limite seguro para Claude (aproximadamente 100k tokens de entrada, 8k de saída)
const MAX_CHARS_PER_CHUNK = 200000;

export async function generateContent(prompt: string, apiKey: string, model: string = "claude-sonnet-4-5"): Promise<string> {
  try {
    const client = new Anthropic({
      apiKey: apiKey,
    });

    const message = await client.messages.create({
      model: model,
      max_tokens: 8192,
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });

    // Claude retorna um array de content blocks, pegamos o texto do primeiro
    const textContent = message.content.find(block => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('Resposta do Claude não contém texto');
    }

    return textContent.text;
  } catch (error: any) {
    console.error("Erro ao gerar conteúdo com Claude:", error);

    // Tratamento específico para erro 429 (Rate limit)
    if (error.status === 429 || (error.message && error.message.includes('429'))) {
      throw new Error(
        'Limite de requisições atingido! A API do Claude tem limite de requisições por minuto. ' +
        'Por favor, aguarde alguns minutos antes de tentar novamente. ' +
        'Se o problema persistir, você pode ter atingido o limite da sua API key.'
      );
    }

    // Tratamento para erro de autenticação
    if (error.status === 401 || (error.message && error.message.includes('401'))) {
      throw new Error(
        'API key inválida. Verifique se a chave da Anthropic está correta.'
      );
    }

    // Tratamento para modelo não encontrado
    if (error.status === 404 || (error.message && error.message.includes('404'))) {
      throw new Error(
        `Modelo Claude não encontrado. Sua API key pode não ter acesso ao modelo ${model}. Verifique se você tem acesso aos modelos Claude 4 (Opus 4.1, Sonnet 4.5, Haiku 4.5).`
      );
    }

    // Tratamento para limite de tokens excedido
    if (error.message && error.message.includes('max_tokens')) {
      throw new Error(
        'Limite de tokens excedido. O prompt é muito longo ou a resposta esperada é muito grande.'
      );
    }

    throw error;
  }
}

export async function generateLongContent(prompt: string, apiKey: string, model: string = "claude-sonnet-4-5", maxRetries = 3): Promise<string> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await generateContent(prompt, apiKey, model);
    } catch (error: any) {
      if (i === maxRetries - 1) throw error;
      console.log(`Tentativa ${i + 1} falhou, tentando novamente...`);
      // Aguarda progressivamente mais tempo entre retries
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error("Falha ao gerar conteúdo após múltiplas tentativas");
}

/**
 * Gera conteúdo com rotação automática de API keys
 * Tenta cada API key até conseguir gerar o conteúdo
 */
export async function generateWithRotation(prompt: string, apiKeys: string[], model: string = "claude-sonnet-4-5"): Promise<string> {
  let lastError: Error | null = null;

  for (let i = 0; i < apiKeys.length; i++) {
    const apiKey = apiKeys[i];
    console.log(`[Claude ${model}] Tentando API key ${i + 1} de ${apiKeys.length}...`);

    try {
      const result = await generateLongContent(prompt, apiKey, model);
      console.log(`[Claude ${model}] ✓ Sucesso com API key ${i + 1}`);
      return result;
    } catch (error: any) {
      console.warn(`[Claude ${model}] ✗ API key ${i + 1} falhou:`, error.message);
      lastError = error;

      // Se for erro 429 e ainda há keys, tenta a próxima
      if (error.message && error.message.includes('429') && i < apiKeys.length - 1) {
        console.log(`[Claude] Rotacionando para próxima API key...`);
        continue;
      }

      // Se não for 429 ou é a última key, lança o erro
      if (i === apiKeys.length - 1) {
        throw error;
      }
    }
  }

  throw lastError || new Error("Falha ao gerar conteúdo com todas as API keys do Claude");
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
  model: string = "claude-sonnet-4-5",
  onProgress?: (chunk: number, total: number) => void
): Promise<string> {
  // Se o conteúdo é pequeno, gera direto
  if (content.length <= MAX_CHARS_PER_CHUNK) {
    console.log(`[Claude ${model}] Conteúdo pequeno, gerando direto...`);
    return await generateWithRotation(basePrompt, apiKeys, model);
  }

  console.log(`[Claude ${model}] Conteúdo grande (${content.length} caracteres), dividindo em chunks...`);
  const chunks = divideTextIntoChunks(content);
  console.log(`[Claude ${model}] Dividido em ${chunks.length} chunks`);

  const results: string[] = [];

  for (let i = 0; i < chunks.length; i++) {
    console.log(`[Claude ${model}] Processando chunk ${i + 1} de ${chunks.length}...`);

    if (onProgress) {
      onProgress(i + 1, chunks.length);
    }

    // Modifica o prompt para incluir apenas este chunk
    const chunkPrompt = basePrompt.replace(content, chunks[i]);

    // Gera o conteúdo para este chunk (com rotação de API keys)
    const result = await generateWithRotation(chunkPrompt, apiKeys, model);
    results.push(result);

    // Rate limiting: aguarda 2 segundos entre chunks (exceto no último)
    if (i < chunks.length - 1) {
      console.log('[Claude] Aguardando 2s antes do próximo chunk (rate limiting)...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Junta todos os resultados
  return results.join('\n\n');
}
