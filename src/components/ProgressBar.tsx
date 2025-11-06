'use client';

interface ProgressBarProps {
  progress: number;
  message: string;
  currentFile?: string;
}

export default function ProgressBar({ progress, message, currentFile }: ProgressBarProps) {
  const fileNames: Record<string, string> = {
    roteiro: '01_Roteiro_Estruturado.txt',
    trilha: '02_Trilha_Sonora.txt',
    textoNarrado: '03_Texto_Narrado.txt',
    personagens: '04_Personagens_Descricoes.txt',
    titulo: '05_Titulo_Descricao.txt',
  };

  return (
    <div className="w-full space-y-3 bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {currentFile ? `Gerando: ${fileNames[currentFile]}` : 'Preparando...'}
        </span>
        <span className="text-sm font-bold text-primary">
          {progress}%
        </span>
      </div>

      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
        <div
          className="bg-gradient-to-r from-primary to-secondary h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        >
          <div className="w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
        </div>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 animate-pulse">
        {message}
      </p>

      {progress === 100 && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
          <p className="text-sm text-green-700 dark:text-green-400 font-medium">
            ✓ Geração concluída! Todos os arquivos estão prontos para download.
          </p>
        </div>
      )}
    </div>
  );
}
