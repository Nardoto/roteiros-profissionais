'use client';

import { useState } from 'react';
import InputForm from '@/components/InputForm';
import ProgressBar from '@/components/ProgressBar';
import FilePreview from '@/components/FilePreview';
import DownloadButtons from '@/components/DownloadButtons';
import { ScriptInput, GeneratedScript, ProgressUpdate } from '@/types';
import { BookOpen, Sparkles } from 'lucide-react';

export default function Home() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<ProgressUpdate>({ progress: 0, message: '' });
  const [generatedScripts, setGeneratedScripts] = useState<GeneratedScript | null>(null);
  const [currentInput, setCurrentInput] = useState<ScriptInput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (input: ScriptInput) => {
    setIsGenerating(true);
    setProgress({ progress: 0, message: 'Iniciando geração...' });
    setGeneratedScripts(null);
    setCurrentInput(input);
    setError(null);

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
            const data = JSON.parse(line.slice(6));

            if (data.error) {
              setError(data.message);
              setIsGenerating(false);
              return;
            }

            if (data.complete) {
              setGeneratedScripts(data.result);
              setProgress({ progress: 100, message: '✓ Concluído!' });
              setIsGenerating(false);
            } else {
              setProgress({
                progress: data.progress,
                message: data.message,
                currentFile: data.currentFile,
              });
            }
          }
        }
      }
    } catch (err: any) {
      console.error('Erro:', err);
      setError(err.message || 'Erro desconhecido ao gerar roteiro');
      setIsGenerating(false);
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
            />
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

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-500 dark:text-gray-500 text-sm">
          <p>Gerador de Roteiros Bíblicos • Powered by Gemini AI</p>
          <p className="mt-1">Criado para produção profissional de documentários</p>
        </footer>
      </div>
    </main>
  );
}
