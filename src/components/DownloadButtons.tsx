'use client';

import { Download, FileText } from 'lucide-react';
import JSZip from 'jszip';
import { GeneratedScript } from '@/types';

interface DownloadButtonsProps {
  scripts: GeneratedScript;
  title: string;
}

export default function DownloadButtons({ scripts, title }: DownloadButtonsProps) {
  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadAll = async () => {
    const zip = new JSZip();
    const folderName = title.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();

    zip.file(`${folderName}/01_Roteiro_Estruturado.txt`, scripts.roteiro);
    zip.file(`${folderName}/02_Trilha_Sonora.txt`, scripts.trilha);
    zip.file(`${folderName}/03_Texto_Narrado.txt`, scripts.textoNarrado);
    zip.file(`${folderName}/04_Personagens_Descricoes.txt`, scripts.personagens);
    zip.file(`${folderName}/05_Titulo_Descricao.txt`, scripts.titulo);
    if (scripts.takes) {
      zip.file(`${folderName}/06_Takes_Cenas_Visuais.txt`, scripts.takes);
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${folderName}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const files = [
    { key: 'roteiro', name: '01_Roteiro_Estruturado.txt', content: scripts.roteiro },
    { key: 'trilha', name: '02_Trilha_Sonora.txt', content: scripts.trilha },
    { key: 'textoNarrado', name: '03_Texto_Narrado.txt', content: scripts.textoNarrado },
    { key: 'personagens', name: '04_Personagens_Descricoes.txt', content: scripts.personagens },
    { key: 'titulo', name: '05_Titulo_Descricao.txt', content: scripts.titulo },
    ...(scripts.takes ? [{ key: 'takes', name: '06_Takes_Cenas_Visuais.txt', content: scripts.takes }] : []),
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <button
          onClick={downloadAll}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-lg hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
        >
          <Download size={20} />
          Download Completo (.zip)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {files.map((file) => (
          <button
            key={file.key}
            onClick={() => downloadFile(file.content, file.name)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <FileText size={18} />
            <span className="text-sm truncate">{file.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
