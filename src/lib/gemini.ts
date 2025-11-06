import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY não está definida no .env.local");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateContent(prompt: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-pro",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
      }
    });

    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error("Erro ao gerar conteúdo:", error);
    throw error;
  }
}

export async function generateLongContent(prompt: string, maxRetries = 3): Promise<string> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await generateContent(prompt);
    } catch (error: any) {
      if (i === maxRetries - 1) throw error;
      console.log(`Tentativa ${i + 1} falhou, tentando novamente...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  throw new Error("Falha ao gerar conteúdo após múltiplas tentativas");
}
