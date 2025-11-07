'use client';

import { useState, useEffect } from 'react';
import { Key, Plus, X, Eye, EyeOff } from 'lucide-react';
import { ApiKeys } from '@/types';

interface ApiKeyManagerProps {
  apiKeys: ApiKeys;
  onChange: (apiKeys: ApiKeys) => void;
}

export default function ApiKeyManager({ apiKeys, onChange }: ApiKeyManagerProps) {
  const [showKeys, setShowKeys] = useState(false);

  // Carregar API keys do localStorage ao montar
  useEffect(() => {
    const savedKeys = localStorage.getItem('apiKeys');
    if (savedKeys) {
      try {
        const parsed = JSON.parse(savedKeys);
        onChange(parsed);
      } catch (e) {
        console.error('Erro ao carregar API keys:', e);
      }
    }
  }, []);

  // Salvar no localStorage quando mudar
  useEffect(() => {
    localStorage.setItem('apiKeys', JSON.stringify(apiKeys));
  }, [apiKeys]);

  const addGeminiKey = () => {
    onChange({
      ...apiKeys,
      gemini: [...apiKeys.gemini, '']
    });
  };

  const removeGeminiKey = (index: number) => {
    const newGemini = apiKeys.gemini.filter((_, i) => i !== index);
    onChange({
      ...apiKeys,
      gemini: newGemini
    });
  };

  const updateGeminiKey = (index: number, value: string) => {
    const newGemini = [...apiKeys.gemini];
    newGemini[index] = value;
    onChange({
      ...apiKeys,
      gemini: newGemini
    });
  };

  const updateOpenAI = (value: string) => {
    onChange({
      ...apiKeys,
      openai: value || undefined
    });
  };

  const updateAnthropic = (value: string) => {
    onChange({
      ...apiKeys,
      anthropic: value || undefined
    });
  };

  const maskKey = (key: string) => {
    if (!key || key.length < 10) return key;
    return key.substring(0, 8) + '•'.repeat(Math.min(20, key.length - 8));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Key className="text-primary" size={20} />
          <h3 className="text-lg font-semibold">API Keys</h3>
        </div>
        <button
          onClick={() => setShowKeys(!showKeys)}
          className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary flex items-center gap-1"
        >
          {showKeys ? <EyeOff size={16} /> : <Eye size={16} />}
          {showKeys ? 'Ocultar' : 'Mostrar'}
        </button>
      </div>

      {/* Gemini APIs (múltiplas) */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          🔷 Google Gemini (você pode adicionar várias)
        </label>

        {apiKeys.gemini.map((key, index) => (
          <div key={index} className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type={showKeys ? 'text' : 'password'}
                value={key}
                onChange={(e) => updateGeminiKey(index, e.target.value)}
                placeholder={`API Key do Gemini ${index + 1}`}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white font-mono text-sm"
              />
            </div>
            {apiKeys.gemini.length > 1 && (
              <button
                onClick={() => removeGeminiKey(index)}
                className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                title="Remover esta API"
              >
                <X size={18} />
              </button>
            )}
          </div>
        ))}

        <button
          onClick={addGeminiKey}
          className="w-full px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          Adicionar outra API do Gemini
        </button>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          💡 <strong>Dica:</strong> Adicione múltiplas APIs para rotação automática.
          Se uma atingir o limite (16 roteiros/dia), o sistema usa a próxima automaticamente.
        </p>
      </div>

      {/* OpenAI API (opcional) */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          🟢 OpenAI / GPT (opcional - pago)
        </label>
        <input
          type={showKeys ? 'text' : 'password'}
          value={apiKeys.openai || ''}
          onChange={(e) => updateOpenAI(e.target.value)}
          placeholder="sk-..."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white font-mono text-sm"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Suporta GPT-4, GPT-4 Turbo, GPT-3.5 Turbo
        </p>
      </div>

      {/* Anthropic API (opcional) */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          🟣 Anthropic / Claude (opcional - pago)
        </label>
        <input
          type={showKeys ? 'text' : 'password'}
          value={apiKeys.anthropic || ''}
          onChange={(e) => updateAnthropic(e.target.value)}
          placeholder="sk-ant-..."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white font-mono text-sm"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Suporta Claude 3 Opus, Sonnet, Haiku
        </p>
      </div>

      {/* Info Box */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
          🔐 Segurança das suas APIs
        </h4>
        <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
          <li>• As chaves são salvas apenas no SEU navegador (localStorage)</li>
          <li>• O servidor usa sua chave apenas durante a geração</li>
          <li>• Suas chaves NUNCA são armazenadas no servidor</li>
          <li>• Você pode apagar todas as chaves a qualquer momento</li>
        </ul>
      </div>

      {/* Como obter APIs */}
      <details className="text-sm">
        <summary className="cursor-pointer font-medium text-gray-700 dark:text-gray-300 hover:text-primary">
          📚 Como obter API Keys gratuitas?
        </summary>
        <div className="mt-3 space-y-3 text-gray-600 dark:text-gray-400">
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <strong className="text-primary">Google Gemini (GRATUITO):</strong>
            <ol className="mt-2 ml-4 space-y-1 text-xs list-decimal">
              <li>Acesse <a href="https://aistudio.google.com/apikey" target="_blank" className="text-primary underline">Google AI Studio</a></li>
              <li>Faça login com sua conta Google</li>
              <li>Clique em "Criar chave de API"</li>
              <li>Cole aqui e clique em "Adicionar outra API" para mais contas</li>
            </ol>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <strong className="text-green-600">OpenAI (PAGO):</strong>
            <ol className="mt-2 ml-4 space-y-1 text-xs list-decimal">
              <li>Acesse <a href="https://platform.openai.com/api-keys" target="_blank" className="text-primary underline">OpenAI Platform</a></li>
              <li>Crie uma conta e adicione créditos</li>
              <li>Gere uma API key</li>
            </ol>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <strong className="text-purple-600">Anthropic (PAGO):</strong>
            <ol className="mt-2 ml-4 space-y-1 text-xs list-decimal">
              <li>Acesse <a href="https://console.anthropic.com/" target="_blank" className="text-primary underline">Anthropic Console</a></li>
              <li>Crie uma conta e adicione créditos</li>
              <li>Gere uma API key</li>
            </ol>
          </div>
        </div>
      </details>
    </div>
  );
}
