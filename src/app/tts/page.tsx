'use client';

import { useState } from 'react';
import { Upload, Volume2, Download, Loader2, FileText, Settings } from 'lucide-react';

interface AudioChunk {
  index: number;
  audioData: string; // base64
  charCount: number;
}

const VOICES = [
  { id: 'pt-BR-Standard-A', name: 'Feminino - Standard A', gender: 'FEMALE' },
  { id: 'pt-BR-Standard-B', name: 'Masculino - Standard B', gender: 'MALE' },
  { id: 'pt-BR-Wavenet-A', name: 'Feminino - WaveNet A (Premium)', gender: 'FEMALE' },
  { id: 'pt-BR-Wavenet-B', name: 'Masculino - WaveNet B (Premium)', gender: 'MALE' },
  { id: 'pt-BR-Neural2-A', name: 'Feminino - Neural2 A (Melhor)', gender: 'FEMALE' },
  { id: 'pt-BR-Neural2-B', name: 'Masculino - Neural2 B (Melhor)', gender: 'MALE' },
];

export default function TTSPage() {
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('pt-BR-Standard-A');
  const [speakingRate, setSpeakingRate] = useState(1.0);
  const [pitch, setPitch] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [audioChunks, setAudioChunks] = useState<AudioChunk[]>([]);
  const [totalChars, setTotalChars] = useState(0);
  const [usedChars, setUsedChars] = useState(0);

  const MAX_CHARS_FREE = 1000000; // 1M caracteres grátis/mês

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setText(content);
      setTotalChars(content.length);
    };
    reader.readAsText(file);
  };

  const handleGenerate = async () => {
    if (!text.trim()) {
      alert('Por favor, insira ou faça upload de um texto');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setAudioChunks([]);

    try {
      // Dividir texto em chunks de 5000 caracteres
      const chunkSize = 5000;
      const chunks: string[] = [];
      for (let i = 0; i < text.length; i += chunkSize) {
        chunks.push(text.slice(i, i + chunkSize));
      }

      console.log(`📝 Dividido em ${chunks.length} chunks`);

      const generatedChunks: AudioChunk[] = [];

      for (let i = 0; i < chunks.length; i++) {
        const chunkText = chunks[i];
        console.log(`🎤 Gerando chunk ${i + 1}/${chunks.length}...`);

        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: chunkText,
            voiceName: selectedVoice,
            speakingRate,
            pitch,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Erro ao gerar áudio');
        }

        const data = await response.json();

        generatedChunks.push({
          index: i,
          audioData: data.audio,
          charCount: data.charCount,
        });

        setProgress(((i + 1) / chunks.length) * 100);
        setAudioChunks([...generatedChunks]);
      }

      setUsedChars((prev) => prev + text.length);
      console.log('✅ TTS gerado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao gerar TTS:', error);
      alert(`Erro: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadAudio = (chunk: AudioChunk) => {
    const audioBlob = new Blob(
      [Uint8Array.from(atob(chunk.audioData), (c) => c.charCodeAt(0))],
      { type: 'audio/mpeg' }
    );
    const url = URL.createObjectURL(audioBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audio_chunk_${chunk.index + 1}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadAllAudio = async () => {
    if (audioChunks.length === 0) return;

    // Se for apenas 1 chunk, baixar direto
    if (audioChunks.length === 1) {
      downloadAudio(audioChunks[0]);
      return;
    }

    // Se for múltiplos, criar ZIP (necessita jszip)
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    audioChunks.forEach((chunk) => {
      const audioData = Uint8Array.from(atob(chunk.audioData), (c) => c.charCodeAt(0));
      zip.file(`audio_chunk_${chunk.index + 1}.mp3`, audioData);
    });

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'audio_completo.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Volume2 size={32} className="text-gray-900 dark:text-gray-100" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
              Gerador de Text-to-Speech
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm max-w-2xl mx-auto">
            Converta seus roteiros em áudio usando Google Cloud Text-to-Speech
          </p>
        </div>

        {/* Usage Stats */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Uso Mensal ({((usedChars / MAX_CHARS_FREE) * 100).toFixed(1)}%)
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {usedChars.toLocaleString()} / {MAX_CHARS_FREE.toLocaleString()} caracteres
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gray-900 dark:bg-gray-100 transition-all"
              style={{ width: `${(usedChars / MAX_CHARS_FREE) * 100}%` }}
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Coluna Esquerda: Input */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <FileText className="text-gray-700 dark:text-gray-300" size={24} />
              Texto do Roteiro
            </h2>

            {/* Upload de arquivo */}
            <div className="mb-4">
              <label className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-all cursor-pointer">
                <Upload size={20} />
                <span>Fazer Upload de Arquivo (.txt)</span>
                <input type="file" accept=".txt" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            {/* Textarea */}
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setTotalChars(e.target.value.length);
              }}
              placeholder="Cole ou digite seu roteiro aqui..."
              className="w-full h-96 px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-400"
            />

            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {totalChars.toLocaleString()} caracteres • ~{Math.ceil(totalChars / 5000)} chunks de
              áudio
            </div>

            {/* Configurações */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <Settings size={20} />
                Configurações de Voz
              </h3>

              {/* Seleção de voz */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Voz
                </label>
                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  {VOICES.map((voice) => (
                    <option key={voice.id} value={voice.id}>
                      {voice.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Velocidade */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Velocidade: {speakingRate.toFixed(1)}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={speakingRate}
                  onChange={(e) => setSpeakingRate(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Tom */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tom: {pitch > 0 ? `+${pitch}` : pitch}
                </label>
                <input
                  type="range"
                  min="-20"
                  max="20"
                  step="1"
                  value={pitch}
                  onChange={(e) => setPitch(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            {/* Botão Gerar */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !text.trim()}
              className="w-full mt-4 px-6 py-3 bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-gray-900 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Gerando... {Math.round(progress)}%
                </>
              ) : (
                <>
                  <Volume2 size={20} />
                  Gerar Áudio
                </>
              )}
            </button>
          </div>

          {/* Coluna Direita: Output */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <Download className="text-gray-700 dark:text-gray-300" size={24} />
              Áudios Gerados
            </h2>

            {audioChunks.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Volume2 size={48} className="mx-auto mb-4 opacity-50" />
                <p>Nenhum áudio gerado ainda</p>
                <p className="text-sm mt-2">Faça upload de um roteiro e clique em "Gerar Áudio"</p>
              </div>
            ) : (
              <>
                {/* Botão baixar tudo */}
                <button
                  onClick={downloadAllAudio}
                  className="w-full mb-4 px-4 py-3 bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-gray-900 rounded-lg transition-all flex items-center justify-center gap-2 font-semibold"
                >
                  <Download size={20} />
                  Baixar {audioChunks.length > 1 ? 'Tudo (ZIP)' : 'Áudio'}
                </button>

                {/* Lista de chunks */}
                <div className="space-y-3">
                  {audioChunks.map((chunk) => (
                    <div
                      key={chunk.index}
                      className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            Chunk {chunk.index + 1}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {chunk.charCount.toLocaleString()} caracteres
                          </p>
                        </div>
                        <button
                          onClick={() => downloadAudio(chunk)}
                          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                        >
                          <Download size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
