'use client';

import { useState, useEffect } from 'react';
import InputForm from '@/components/InputForm';
import ProgressBar from '@/components/ProgressBar';
import DownloadButtons from '@/components/DownloadButtons';
import ProgressiveDownloads from '@/components/ProgressiveDownloads';
import Footer from '@/components/Footer';
import { ScriptInput, GeneratedScript, ProgressUpdate, PartialFile } from '@/types';
import { BookOpen, Sparkles } from 'lucide-react';

export default function Home() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<ProgressUpdate>({ progress: 0, message: '' });
  const [generatedScripts, setGeneratedScripts] = useState<GeneratedScript | null>(null);
  const [partialFiles, setPartialFiles] = useState<Record<string, PartialFile>>({});
  const [currentInput, setCurrentInput] = useState<ScriptInput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

  // Limpar timer quando componente desmontar
  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  // Função para formatar tempo decorrido
  const formatElapsedTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Função para iniciar o timer
  const startTimer = () => {
    const start = Date.now();
    setStartTime(start);
    setElapsedTime(0);

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    setTimerInterval(interval);
  };

  // Função para parar o timer
  const stopTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  };

  const handleGenerate = async (input: ScriptInput) => {
    setIsGenerating(true);
    setProgress({ progress: 0, message: 'Iniciando geração...' });
    setGeneratedScripts(null);
    setPartialFiles({});
    setCurrentInput(input);
    setError(null);

    // Iniciar timer
    startTimer();

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error('Erro ao gerar roteiro');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Não foi possível ler a resposta');
      }

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.error) {
              setError(data.message);
              setIsGenerating(false);
              stopTimer();
              return;
            }

            if (data.complete) {
              // Construir o resultado final a partir dos partialFiles
              const finalResult: GeneratedScript & { stats: any } = {
                roteiro: partialFiles.roteiro?.content || '',
                trilha: partialFiles.trilha?.content || '',
                textoNarrado: partialFiles.textoNarrado?.content || '',
                personagens: partialFiles.personagens?.content || '',
                titulo: partialFiles.titulo?.content || '',
                stats: data.stats || {}
              };

              setGeneratedScripts(finalResult);
              const totalTime = Math.floor((Date.now() - startTime) / 1000);
              const timeMessage = totalTime >= 60
                ? `${Math.floor(totalTime / 60)} minuto${Math.floor(totalTime / 60) !== 1 ? 's' : ''} e ${totalTime % 60} segundo${totalTime % 60 !== 1 ? 's' : ''}`
                : `${totalTime} segundo${totalTime !== 1 ? 's' : ''}`;
              setProgress({ progress: 100, message: `✓ Concluído em ${timeMessage}!` });
              setIsGenerating(false);
              stopTimer();
            } else {
              setProgress({
                progress: data.progress,
                message: data.message,
                currentFile: data.currentFile,
              });

              // Processar arquivo parcial se houver
              if (data.partialFile) {
                setPartialFiles(prev => ({
                  ...prev,
                  [data.partialFile.type]: data.partialFile
                }));
              }
            }
            } catch (parseError) {
              // Ignora erros de parsing de JSON incompleto (chunks cortados)
              console.warn('Chunk JSON incompleto, ignorando:', parseError);
            }
          }
        }
      }
    } catch (err: any) {
      console.error('Erro:', err);
      setError(err.message || 'Erro desconhecido ao gerar roteiro');
      setIsGenerating(false);
      stopTimer();
    }
  };

  return (
    <main className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen size={40} className="text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Gerador de Roteiros Bíblicos
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Gere roteiros profissionais completos para documentários bíblicos usando IA.
            5 arquivos criados automaticamente em minutos.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Input Form */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-8 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="text-primary" size={24} />
              <h2 className="text-2xl font-bold">Configurar Roteiro</h2>
            </div>
            <InputForm onSubmit={handleGenerate} isGenerating={isGenerating} />
          </div>

          {/* Right Column - Info/Status/Results */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 border border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-bold mb-4">📚 Como Funciona</h2>

            {/* Instruções compactas */}
            <div className="space-y-2 text-gray-700 dark:text-gray-300 mb-4">
              <div className="flex gap-2 items-center">
                <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xs">1</span>
                <p className="text-xs">Preencha título e sinopse</p>
              </div>
              <div className="flex gap-2 items-center">
                <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xs">2</span>
                <p className="text-xs">Aguarde geração (5-10 min)</p>
              </div>
              <div className="flex gap-2 items-center">
                <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xs">3</span>
                <p className="text-xs">Baixe os arquivos</p>
              </div>
            </div>

            {/* Lista de arquivos compacta */}
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-1 text-sm">📦 5 Arquivos:</h3>
              <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-0.5">
                <li>• Roteiro (PT) • Trilha (PT/EN)</li>
                <li>• Texto Narrado (EN, 8500+ palavras)</li>
                <li>• Personagens (EN) • Título (PT)</li>
              </ul>
            </div>

            {/* Progress Bar */}
            {(isGenerating || generatedScripts) && (
              <div className="mt-4">
                <ProgressBar
                  progress={progress.progress}
                  message={progress.message}
                  currentFile={progress.currentFile}
                  elapsedTime={elapsedTime}
                  formatElapsedTime={formatElapsedTime}
                />
              </div>
            )}

            {/* Progressive Downloads */}
            {currentInput && Object.keys(partialFiles).length > 0 && (
              <div className="mt-4">
                <ProgressiveDownloads partialFiles={partialFiles} title={currentInput.title} />
              </div>
            )}

            {/* Downloads finais */}
            {generatedScripts && currentInput && (
              <div className="mt-4 space-y-4">
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    📥 Downloads
                  </h3>
                  <DownloadButtons scripts={generatedScripts} title={currentInput.title} />
                </div>

                {/* Stats */}
                {(generatedScripts as any).stats && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h3 className="text-lg font-bold mb-3">📊 Estatísticas</h3>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Total</p>
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">
                          {(generatedScripts as any).stats.totalWords.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Meta</p>
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">8,500</p>
                      </div>
                      <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Status</p>
                        <p className="text-base font-bold text-purple-600 dark:text-purple-400">
                          {(generatedScripts as any).stats.validated ? '✓ OK' : '⚠ Rev'}
                        </p>
                      </div>
                    </div>
                    {!(generatedScripts as any).stats.validated && (
                      <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <p className="text-xs text-yellow-800 dark:text-yellow-300">
                          <strong>💡 Como revisar:</strong> O texto narrado tem menos de 8.500 palavras.
                          Para atingir a meta, você pode:
                        </p>
                        <ul className="text-xs text-yellow-700 dark:text-yellow-400 mt-1 space-y-0.5 ml-4">
                          <li>• Adicionar mais detalhes na sinopse</li>
                          <li>• Usar a base de conhecimento</li>
                          <li>• Gerar novamente com contexto adicional</li>
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400 text-sm">
              <strong>Erro:</strong> {error}
            </p>
          </div>
        )}

        <Footer />
      </div>
    </main>
  );
}
