import { NextRequest, NextResponse } from 'next/server';
import { generateTTS, splitTextIntoChunks } from '@/lib/google-tts';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, voiceName, speakingRate, pitch } = body;

    if (!text) {
      return NextResponse.json({ error: 'Texto é obrigatório' }, { status: 400 });
    }

    if (!process.env.GOOGLE_TTS_API_KEY) {
      return NextResponse.json(
        { error: 'API Key do Google TTS não configurada' },
        { status: 500 }
      );
    }

    // Gerar áudio
    const audioBuffer = await generateTTS({
      text,
      voiceName: voiceName || 'pt-BR-Standard-A',
      speakingRate: speakingRate || 1.0,
      pitch: pitch || 0,
    });

    // Retornar áudio como base64
    return NextResponse.json({
      audio: audioBuffer.toString('base64'),
      charCount: text.length,
    });
  } catch (error: any) {
    console.error('Erro ao gerar TTS:', error);
    return NextResponse.json({ error: error.message || 'Erro ao gerar áudio' }, { status: 500 });
  }
}

// Rota para dividir texto em chunks
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const text = searchParams.get('text');

    if (!text) {
      return NextResponse.json({ error: 'Texto é obrigatório' }, { status: 400 });
    }

    const chunks = splitTextIntoChunks(text);

    return NextResponse.json({
      chunks,
      totalChunks: chunks.length,
      totalChars: text.length,
    });
  } catch (error: any) {
    console.error('Erro ao dividir texto:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
