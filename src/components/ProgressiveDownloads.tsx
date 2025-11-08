'use client';

import { Download, CheckCircle, Clock } from 'lucide-react';
import { PartialFile } from '@/types';

interface ProgressiveDownloadsProps {
  partialFiles: Record<string, PartialFile>;
  title: string;
}

export default function ProgressiveDownloads({ partialFiles, title }: ProgressiveDownloadsProps) {
  const fileNames: Record<string, string> = {
    roteiro: '01_Roteiro_Estruturado.txt',
    trilha: '02_Trilha_Sonora.txt',
    textoNarrado: '03_Texto_Narrado.txt',
    personagens: '04_Personagens_Descricoes.txt',
    titulo: '05_Titulo_Descricao.txt',
    takes: '06_Takes_Cenas_Visuais.txt',
  };

  const fileLabels: Record<string, string> = {
    roteiro: 'Roteiro Estruturado (PT)',
    trilha: 'Trilha Sonora (PT/EN)',
    textoNarrado: 'Texto Narrado (EN)',
    personagens: 'Personagens (EN)',
    titulo: 'Título e Descrição (PT)',
    takes: 'Takes - Cenas Visuais (EN)',
  };

  const downloadFile = (fileType: string) => {
    const file = partialFiles[fileType];
    if (!file || !file.content) return;

    const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileNames[fileType];
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const allFiles = Object.keys(fileNames);
  const hasAnyFile = Object.keys(partialFiles).length > 0;

  if (!hasAnyFile) return null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 border border-gray-200 dark:border-gray-800">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Download size={24} className="text-primary" />
        Downloads Progressivos
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Baixe os arquivos conforme ficam prontos. Não precisa esperar tudo terminar!
      </p>

      <div className="grid gap-3">
        {allFiles.map((fileType) => {
          const file = partialFiles[fileType];
          const isAvailable = file && file.content;
          const isComplete = file && file.isComplete;

          return (
            <div
              key={fileType}
              className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                isAvailable
                  ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                {isAvailable ? (
                  <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
                ) : (
                  <Clock size={20} className="text-gray-400" />
                )}
                <div>
                  <p className={`font-medium ${isAvailable ? 'text-green-900 dark:text-green-300' : 'text-gray-500 dark:text-gray-400'}`}>
                    {fileLabels[fileType]}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {fileNames[fileType]}
                    {isAvailable && !isComplete && ' (gerando...)'}
                  </p>
                </div>
              </div>

              {isAvailable && (
                <button
                  onClick={() => downloadFile(fileType)}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <Download size={16} />
                  Baixar
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-xs text-blue-800 dark:text-blue-400">
          💡 <strong>Dica:</strong> Se o processo for interrompido, você não perde os arquivos já baixados!
        </p>
      </div>
    </div>
  );
}
