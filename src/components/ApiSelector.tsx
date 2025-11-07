'use client';

import { useState, useEffect } from 'react';
import { Cpu } from 'lucide-react';
import { ApiKeys, ApiSelection } from '@/types';

interface ApiSelectorProps {
  apiKeys: ApiKeys;
  selectedApi: ApiSelection | null;
  onChange: (selection: ApiSelection) => void;
}

export default function ApiSelector({ apiKeys, selectedApi, onChange }: ApiSelectorProps) {
  // Gerar lista de opções disponíveis
  const getAvailableApis = (): ApiSelection[] => {
    const options: ApiSelection[] = [];

    // Adicionar APIs do Gemini
    apiKeys.gemini.forEach((key, index) => {
      if (key.trim()) {
        options.push({
          provider: 'gemini',
          index,
          label: `Gemini #${index + 1}${key.length > 10 ? ` (${key.substring(0, 8)}...)` : ''}`
        });
      }
    });

    // Adicionar OpenAI se disponível
    if (apiKeys.openai && apiKeys.openai.trim()) {
      options.push({
        provider: 'openai',
        label: `GPT-4 (OpenAI)`
      });
    }

    // Adicionar Anthropic se disponível
    if (apiKeys.anthropic && apiKeys.anthropic.trim()) {
      options.push({
        provider: 'anthropic',
        label: `Claude (Anthropic)`
      });
    }

    return options;
  };

  const availableApis = getAvailableApis();

  // Carregar última seleção do localStorage
  useEffect(() => {
    const savedSelection = localStorage.getItem('lastApiSelection');
    if (savedSelection && !selectedApi) {
      try {
        const parsed: ApiSelection = JSON.parse(savedSelection);
        // Verificar se a API ainda existe
        const exists = availableApis.some(
          api => api.provider === parsed.provider && api.index === parsed.index
        );
        if (exists) {
          onChange(parsed);
        } else if (availableApis.length > 0) {
          // Se não existe mais, selecionar a primeira disponível
          onChange(availableApis[0]);
        }
      } catch (e) {
        console.error('Erro ao carregar última API selecionada:', e);
        if (availableApis.length > 0) {
          onChange(availableApis[0]);
        }
      }
    } else if (!selectedApi && availableApis.length > 0) {
      // Se não há seleção e há APIs disponíveis, selecionar a primeira
      onChange(availableApis[0]);
    }
  }, []);

  // Salvar no localStorage quando mudar
  useEffect(() => {
    if (selectedApi) {
      localStorage.setItem('lastApiSelection', JSON.stringify(selectedApi));
    }
  }, [selectedApi]);

  const handleChange = (value: string) => {
    const parsed = JSON.parse(value) as ApiSelection;
    onChange(parsed);
  };

  if (availableApis.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <p className="text-sm text-yellow-800 dark:text-yellow-300">
          ⚠️ Nenhuma API Key configurada. Por favor, adicione pelo menos uma API Key acima.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label htmlFor="api-selector" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
        <div className="flex items-center gap-2 mb-1">
          <Cpu size={16} className="text-primary" />
          <span>Selecione a API para usar *</span>
        </div>
      </label>

      <select
        id="api-selector"
        value={selectedApi ? JSON.stringify(selectedApi) : ''}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white transition-all"
        required
      >
        {availableApis.map((api, index) => (
          <option key={index} value={JSON.stringify(api)}>
            {api.label}
            {api.provider === 'gemini' ? ' (Gratuito)' : ' (Pago)'}
          </option>
        ))}
      </select>

      <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="text-xs text-blue-800 dark:text-blue-300">
          <strong>ℹ️ Dica:</strong> A última API selecionada será lembrada para as próximas gerações.
          {selectedApi?.provider === 'gemini' && (
            <span> O Gemini é gratuito, mas tem limite de 16 roteiros/dia por API.</span>
          )}
          {selectedApi?.provider === 'openai' && (
            <span> GPT-4 é pago (~US$ 0.50 por roteiro).</span>
          )}
          {selectedApi?.provider === 'anthropic' && (
            <span> Claude é pago (~US$ 0.40 por roteiro).</span>
          )}
        </div>
      </div>
    </div>
  );
}
