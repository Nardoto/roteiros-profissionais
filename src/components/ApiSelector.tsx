'use client';

import { useState, useEffect } from 'react';
import { Cpu } from 'lucide-react';
import { ApiKeys, ApiSelection, AIProvider } from '@/types';

interface ApiSelectorProps {
  apiKeys: ApiKeys;
  selectedApi: ApiSelection | null;
  onChange: (selection: ApiSelection) => void;
}

export default function ApiSelector({ apiKeys, selectedApi, onChange }: ApiSelectorProps) {
  // Gerar lista de PROVIDERS (empresas) disponíveis - não APIs individuais
  const getAvailableProviders = (): ApiSelection[] => {
    const providers: ApiSelection[] = [];

    // === GRATUITOS ===
    // Google Gemini
    if (apiKeys.gemini.filter(k => k.trim()).length > 0) {
      const count = apiKeys.gemini.filter(k => k.trim()).length;
      providers.push({
        provider: 'gemini',
        label: `Google Gemini (${count} API${count > 1 ? 's' : ''})`
      });
    }

    // Groq
    if (apiKeys.groq.filter(k => k.trim()).length > 0) {
      const count = apiKeys.groq.filter(k => k.trim()).length;
      providers.push({
        provider: 'groq',
        label: `Groq (${count} API${count > 1 ? 's' : ''})`
      });
    }

    // Cohere
    if (apiKeys.cohere.filter(k => k.trim()).length > 0) {
      const count = apiKeys.cohere.filter(k => k.trim()).length;
      providers.push({
        provider: 'cohere',
        label: `Cohere (${count} API${count > 1 ? 's' : ''})`
      });
    }

    // Hugging Face
    if (apiKeys.huggingface.filter(k => k.trim()).length > 0) {
      const count = apiKeys.huggingface.filter(k => k.trim()).length;
      providers.push({
        provider: 'huggingface',
        label: `Hugging Face (${count} API${count > 1 ? 's' : ''})`
      });
    }

    // === PAGOS ===
    // OpenAI
    if (apiKeys.openai?.trim()) {
      providers.push({
        provider: 'openai',
        label: `OpenAI GPT-4`
      });
    }

    // Anthropic
    if (apiKeys.anthropic?.trim()) {
      providers.push({
        provider: 'anthropic',
        label: `Anthropic Claude`
      });
    }

    // Mistral
    if (apiKeys.mistral?.trim()) {
      providers.push({
        provider: 'mistral',
        label: `Mistral AI`
      });
    }

    // Together
    if (apiKeys.together?.trim()) {
      providers.push({
        provider: 'together',
        label: `Together AI`
      });
    }

    // Perplexity
    if (apiKeys.perplexity?.trim()) {
      providers.push({
        provider: 'perplexity',
        label: `Perplexity AI`
      });
    }

    return providers;
  };

  const availableProviders = getAvailableProviders();

  // Carregar última seleção do localStorage
  useEffect(() => {
    const savedSelection = localStorage.getItem('lastProviderSelection');
    if (savedSelection && !selectedApi) {
      try {
        const parsed: ApiSelection = JSON.parse(savedSelection);
        // Verificar se o PROVIDER ainda está disponível
        const exists = availableProviders.some(
          p => p.provider === parsed.provider
        );
        if (exists) {
          // Encontrar o provider atualizado (com contagem correta)
          const currentProvider = availableProviders.find(p => p.provider === parsed.provider);
          if (currentProvider) {
            onChange(currentProvider);
          }
        } else if (availableProviders.length > 0) {
          // Se não existe mais, selecionar o primeiro disponível
          onChange(availableProviders[0]);
        }
      } catch (e) {
        console.error('Erro ao carregar último provider selecionado:', e);
        if (availableProviders.length > 0) {
          onChange(availableProviders[0]);
        }
      }
    } else if (!selectedApi && availableProviders.length > 0) {
      // Se não há seleção e há providers disponíveis, selecionar o primeiro
      onChange(availableProviders[0]);
    }
  }, [availableProviders.length, onChange, selectedApi]);

  // Salvar no localStorage quando mudar
  useEffect(() => {
    if (selectedApi) {
      localStorage.setItem('lastProviderSelection', JSON.stringify(selectedApi));
    }
  }, [selectedApi]);

  const handleChange = (value: string) => {
    const parsed = JSON.parse(value) as ApiSelection;
    onChange(parsed);
  };

  // Verificar se é provider gratuito ou pago
  const isFreeProvider = (provider: AIProvider): boolean => {
    return ['gemini', 'groq', 'cohere', 'huggingface'].includes(provider);
  };

  if (availableProviders.length === 0) {
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
      <label htmlFor="provider-selector" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
        <div className="flex items-center gap-2 mb-1">
          <Cpu size={16} className="text-primary" />
          <span>Selecione o Provider de IA *</span>
        </div>
      </label>

      <select
        id="provider-selector"
        value={selectedApi ? JSON.stringify(selectedApi) : ''}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white transition-all"
        required
      >
        {availableProviders.map((provider, index) => (
          <option key={index} value={JSON.stringify(provider)}>
            {provider.label} {isFreeProvider(provider.provider) ? '(Gratuito)' : '(Pago)'}
          </option>
        ))}
      </select>

      <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="text-xs text-blue-800 dark:text-blue-300">
          <strong>ℹ️ Dica:</strong> Ao selecionar um provider, TODAS as APIs cadastradas dele serão usadas em rotação automática.
          {selectedApi && isFreeProvider(selectedApi.provider) && (
            <span> Providers gratuitos têm limites diários - use múltiplas APIs para aumentar o limite!</span>
          )}
          {selectedApi?.provider === 'gemini' && (
            <span> Gemini: ~16 roteiros/dia por API.</span>
          )}
          {selectedApi?.provider === 'groq' && (
            <span> Groq: ultra-rápido, limite generoso.</span>
          )}
          {selectedApi?.provider === 'openai' && (
            <span> OpenAI GPT-4: ~US$ 0.50/roteiro.</span>
          )}
          {selectedApi?.provider === 'anthropic' && (
            <span> Anthropic Claude: ~US$ 0.40/roteiro.</span>
          )}
        </div>
      </div>
    </div>
  );
}
