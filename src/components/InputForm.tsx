'use client';

import { useState } from 'react';
import { ScriptInput, ApiKeys, ApiSelection, ScriptMode } from '@/types';
import { Sparkles } from 'lucide-react';
import ApiKeyManager from './ApiKeyManager';
import ApiSelector from './ApiSelector';
import ScriptModeSelector from './ScriptModeSelector';
import CostEstimator from './CostEstimator';

interface InputFormProps {
  onSubmit: (input: ScriptInput) => void;
  isGenerating: boolean;
}

export default function InputForm({ onSubmit, isGenerating }: InputFormProps) {
  const [title, setTitle] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [knowledgeBase, setKnowledgeBase] = useState('');
  const [scriptMode, setScriptMode] = useState<ScriptMode>('documentary');
  const [selectedApi, setSelectedApi] = useState<ApiSelection | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    // Gratuitos
    gemini: [''],
    groq: [],
    cohere: [],
    huggingface: [],
    // Pagos
    openai: undefined,
    anthropic: undefined,
    mistral: undefined,
    together: undefined,
    perplexity: undefined,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !synopsis.trim()) {
      alert('Por favor, preencha o título e a sinopse.');
      return;
    }

    // Validar que um provider foi selecionado
    if (!selectedApi) {
      alert('Por favor, selecione um provider de IA para usar.');
      return;
    }

    // Validar que o provider selecionado tem API keys configuradas
    const provider = selectedApi.provider;
    let hasValidKeys = false;

    if (['gemini', 'groq', 'cohere', 'huggingface'].includes(provider)) {
      const keys = apiKeys[provider as 'gemini' | 'groq' | 'cohere' | 'huggingface'];
      hasValidKeys = keys.filter(k => k.trim().length > 0).length > 0;
    } else if (['openai', 'anthropic', 'mistral', 'together', 'perplexity'].includes(provider)) {
      const key = apiKeys[provider as 'openai' | 'anthropic' | 'mistral' | 'together' | 'perplexity'];
      hasValidKeys = !!key?.trim();
    }

    if (!hasValidKeys) {
      alert(`Por favor, adicione pelo menos uma API Key para ${selectedApi.label}.`);
      return;
    }

    // Limpar e enviar apenas as keys válidas
    const cleanedApiKeys: any = {
      gemini: apiKeys.gemini.filter(k => k.trim().length > 0),
      groq: apiKeys.groq.filter(k => k.trim().length > 0),
      cohere: apiKeys.cohere.filter(k => k.trim().length > 0),
      huggingface: apiKeys.huggingface.filter(k => k.trim().length > 0),
    };

    // Adicionar keys pagas se existirem
    if (apiKeys.openai?.trim()) cleanedApiKeys.openai = apiKeys.openai.trim();
    if (apiKeys.anthropic?.trim()) cleanedApiKeys.anthropic = apiKeys.anthropic.trim();
    if (apiKeys.mistral?.trim()) cleanedApiKeys.mistral = apiKeys.mistral.trim();
    if (apiKeys.together?.trim()) cleanedApiKeys.together = apiKeys.together.trim();
    if (apiKeys.perplexity?.trim()) cleanedApiKeys.perplexity = apiKeys.perplexity.trim();

    onSubmit({
      title: title.trim(),
      synopsis: synopsis.trim(),
      knowledgeBase: knowledgeBase.trim() || undefined,
      mode: scriptMode,
      selectedApi: selectedApi,
      apiKeys: cleanedApiKeys
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* API Key Manager */}
      <ApiKeyManager apiKeys={apiKeys} onChange={setApiKeys} />

      <div className="border-t border-gray-200 dark:border-gray-700 pt-6"></div>

      {/* Seletor de Modo */}
      <ScriptModeSelector selectedMode={scriptMode} onChange={setScriptMode} />

      <div className="border-t border-gray-200 dark:border-gray-700 pt-6"></div>

      {/* Seletor de API */}
      <ApiSelector
        apiKeys={apiKeys}
        selectedApi={selectedApi}
        onChange={setSelectedApi}
      />

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

      {/* Estimativa de Custo */}
      {selectedApi && (title.trim() || synopsis.trim()) && (
        <CostEstimator
          selectedApi={selectedApi}
          synopsisLength={synopsis.length}
          knowledgeBaseLength={knowledgeBase.length}
        />
      )}

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
