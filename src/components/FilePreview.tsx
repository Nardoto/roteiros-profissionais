'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { FileText, Copy, Check } from 'lucide-react';
import { GeneratedScript, FileType } from '@/types';

interface FilePreviewProps {
  scripts: GeneratedScript;
}

export default function FilePreview({ scripts }: FilePreviewProps) {
  const [activeTab, setActiveTab] = useState<FileType>('roteiro');
  const [copied, setCopied] = useState(false);

  const tabs = [
    { key: 'roteiro' as FileType, label: 'Roteiro', icon: '📋' },
    { key: 'trilha' as FileType, label: 'Trilha', icon: '🎵' },
    { key: 'textoNarrado' as FileType, label: 'Texto Narrado', icon: '📝' },
    { key: 'personagens' as FileType, label: 'Personagens', icon: '👥' },
    { key: 'titulo' as FileType, label: 'Título', icon: '🎬' },
  ];

  const copyToClipboard = () => {
    const content = scripts[activeTab];
    if (content) {
      navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Tabs */}
      <div className="flex overflow-x-auto bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-6 py-3 font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? 'text-primary border-b-2 border-primary bg-white dark:bg-gray-900'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="relative">
        <button
          onClick={copyToClipboard}
          className="absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm transition-colors"
        >
          {copied ? (
            <>
              <Check size={16} className="text-green-600" />
              <span className="text-green-600">Copiado!</span>
            </>
          ) : (
            <>
              <Copy size={16} />
              <span>Copiar</span>
            </>
          )}
        </button>

        <div className="p-6 max-h-[600px] overflow-y-auto">
          <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
            {scripts[activeTab]}
          </pre>
        </div>
      </div>
    </div>
  );
}
