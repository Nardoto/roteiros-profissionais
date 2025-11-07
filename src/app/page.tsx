'use client';

import { useState, useEffect } from 'react';
import InputForm from '@/components/InputForm';
import ProgressBar from '@/components/ProgressBar';
import FilePreview from '@/components/FilePreview';
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

          {/* Right Column - Info/Instructions */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-8 border border-gray-200 dark:border-gray-800">
            <h2 className="text-2xl font-bold mb-6">📚 Como Funciona</h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">1</span>
                <div>
                  <h3 className="font-semibold mb-1">Preencha os Dados</h3>
                  <p className="text-sm">Título, sinopse e base de conhecimento (opcional)</p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">2</span>
                <div>
                  <h3 className="font-semibold mb-1">Aguarde a Geração</h3>
                  <p className="text-sm">A IA criará 5 arquivos completos (5-10 minutos)</p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">3</span>
                <div>
                  <h3 className="font-semibold mb-1">Baixe os Arquivos</h3>
                  <p className="text-sm">Download individual ou completo em .zip</p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">📦 Arquivos Gerados:</h3>
              <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                <li>• 01_Roteiro_Estruturado.txt (PT)</li>
                <li>• 02_Trilha_Sonora.txt (PT/EN)</li>
                <li>• 03_Texto_Narrado.txt (EN, 8500+ palavras)</li>
                <li>• 04_Personagens_Descricoes.txt (EN)</li>
                <li>• 05_Titulo_Descricao.txt (PT)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {(isGenerating || generatedScripts) && (
          <div className="mt-8">
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
          <div className="mt-8">
            <ProgressiveDownloads partialFiles={partialFiles} title={currentInput.title} />
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400">
              <strong>Erro:</strong> {error}
            </p>
          </div>
        )}

        {/* Results */}
        {generatedScripts && currentInput && (
          <div className="mt-8 space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-8 border border-gray-200 dark:border-gray-800">
              <h2 className="text-2xl font-bold mb-6">📥 Downloads</h2>
              <DownloadButtons scripts={generatedScripts} title={currentInput.title} />
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-8 border border-gray-200 dark:border-gray-800">
              <h2 className="text-2xl font-bold mb-6">👁️ Preview dos Arquivos</h2>
              <FilePreview scripts={generatedScripts} />
            </div>

            {/* Stats */}
            {(generatedScripts as any).stats && (
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-8 border border-gray-200 dark:border-gray-800">
                <h2 className="text-2xl font-bold mb-6">📊 Estatísticas</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total de Palavras</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {(generatedScripts as any).stats.totalWords.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Meta Mínima</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">8,500</p>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {(generatedScripts as any).stats.validated ? '✓ Válido' : '⚠ Revisar'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <Footer />
      </div>
    </main>
  );
}
