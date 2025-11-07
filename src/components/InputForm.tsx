'use client';

import { useState } from 'react';
import { ScriptInput, ApiKeys } from '@/types';
import { Sparkles } from 'lucide-react';
import ApiKeyManager from './ApiKeyManager';

interface InputFormProps {
  onSubmit: (input: ScriptInput) => void;
  isGenerating: boolean;
}

export default function InputForm({ onSubmit, isGenerating }: InputFormProps) {
  const [title, setTitle] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [knowledgeBase, setKnowledgeBase] = useState('');
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    gemini: [''], // Inicia com 1 campo vazio
    openai: undefined,
    anthropic: undefined
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !synopsis.trim()) {
      alert('Por favor, preencha o título e a sinopse.');
      return;
    }

    // Validar que pelo menos 1 API key do Gemini está preenchida
    const validGeminiKeys = apiKeys.gemini.filter(key => key.trim().length > 0);
    if (validGeminiKeys.length === 0) {
      alert('Por favor, adicione pelo menos uma API Key do Google Gemini.');
      return;
    }

    onSubmit({
      title: title.trim(),
      synopsis: synopsis.trim(),
      knowledgeBase: knowledgeBase.trim() || undefined,
      apiKeys: {
        gemini: validGeminiKeys,
        openai: apiKeys.openai?.trim() || undefined,
        anthropic: apiKeys.anthropic?.trim() || undefined
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* API Key Manager */}
      <ApiKeyManager apiKeys={apiKeys} onChange={setApiKeys} />

      <div className="border-t border-gray-200 dark:border-gray-700 pt-6"></div>

      {/* Título */}
      <div>
        <label htmlFor="title" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Título do Vídeo *
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: A Arca de Noé - Mito ou Realidade?"
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white transition-all"
          disabled={isGenerating}
          required
        />
      </div>

      {/* Sinopse */}
      <div>
        <label htmlFor="synopsis" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Sinopse (2-3 parágrafos) *
        </label>
        <textarea
          id="synopsis"
          value={synopsis}
          onChange={(e) => setSynopsis(e.target.value)}
          placeholder="Descreva brevemente o tema, a abordagem desejada, os pontos principais que devem ser abordados..."
          rows={6}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white transition-all resize-y"
          disabled={isGenerating}
          required
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Seja específico sobre o ângulo narrativo e os principais argumentos
        </p>
      </div>

      {/* Base de Conhecimento */}
      <div>
        <label htmlFor="knowledge" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Base de Conhecimento (Opcional)
        </label>
        <textarea
          id="knowledge"
          value={knowledgeBase}
          onChange={(e) => setKnowledgeBase(e.target.value)}
          placeholder="Cole aqui qualquer material de referência, citações bíblicas, descobertas arqueológicas, ou outros dados que devem ser incorporados..."
          rows={8}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white transition-all resize-y"
          disabled={isGenerating}
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Adicione fontes, versículos, evidências ou contexto adicional (opcional)
        </p>
      </div>

      {/* Botão Submit */}
      <button
        type="submit"
        disabled={isGenerating}
        className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
      >
        {isGenerating ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Gerando Roteiro...</span>
          </>
        ) : (
          <>
            <Sparkles size={20} />
            <span>Gerar Roteiro Completo</span>
          </>
        )}
      </button>

      {isGenerating && (
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Este processo pode levar 5-10 minutos. Por favor, aguarde...
        </p>
      )}
    </form>
  );
}
