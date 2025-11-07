'use client';

import { useState, useEffect, useRef } from 'react';
import { Key, Plus, X, Eye, EyeOff, ChevronDown, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { ApiKeys } from '@/types';

interface ApiKeyManagerProps {
  apiKeys: ApiKeys;
  onChange: (apiKeys: ApiKeys) => void;
}

export default function ApiKeyManager({ apiKeys, onChange }: ApiKeyManagerProps) {
  const [showKeys, setShowKeys] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [testingKeys, setTestingKeys] = useState<Record<string, boolean>>({});
  const [keyStatus, setKeyStatus] = useState<Record<string, 'valid' | 'invalid' | null>>({});

  // Carregar API keys do localStorage ao montar
  useEffect(() => {
    const savedKeys = localStorage.getItem('apiKeys');
    if (savedKeys) {
      try {
        const parsed = JSON.parse(savedKeys);
        // Garantir que os novos campos existam
        const mergedKeys: ApiKeys = {
          gemini: parsed.gemini || [''],
          groq: parsed.groq || [],
          cohere: parsed.cohere || [],
          huggingface: parsed.huggingface || [],
          openai: parsed.openai,
          anthropic: parsed.anthropic,
          mistral: parsed.mistral,
          together: parsed.together,
          perplexity: parsed.perplexity,
        };
        onChange(mergedKeys);
      } catch (e) {
        console.error('Erro ao carregar API keys:', e);
      }
    }
  }, []);

  // Salvar no localStorage quando mudar
  useEffect(() => {
    localStorage.setItem('apiKeys', JSON.stringify(apiKeys));
  }, [apiKeys]);

  // Funções genéricas para arrays de keys
  const addKey = (provider: 'gemini' | 'groq' | 'cohere' | 'huggingface') => {
    onChange({
      ...apiKeys,
      [provider]: [...apiKeys[provider], '']
    });

    // Focar no novo campo após adicionar
    setTimeout(() => {
      const inputs = document.querySelectorAll(`input[placeholder*="${provider.charAt(0).toUpperCase() + provider.slice(1)}"]`);
      const lastInput = inputs[inputs.length - 1] as HTMLInputElement;
      if (lastInput) {
        lastInput.focus();
      }
    }, 50);
  };

  const removeKey = (provider: 'gemini' | 'groq' | 'cohere' | 'huggingface', index: number) => {
    const newKeys = apiKeys[provider].filter((_, i) => i !== index);
    onChange({
      ...apiKeys,
      [provider]: newKeys.length > 0 ? newKeys : [''] // Manter pelo menos um campo vazio
    });
  };

  const updateKey = (provider: 'gemini' | 'groq' | 'cohere' | 'huggingface', index: number, value: string) => {
    const newKeys = [...apiKeys[provider]];
    newKeys[index] = value;
    onChange({
      ...apiKeys,
      [provider]: newKeys
    });
  };

  // Funções para single keys
  const updateSingleKey = (provider: 'openai' | 'anthropic' | 'mistral' | 'together' | 'perplexity', value: string) => {
    onChange({
      ...apiKeys,
      [provider]: value || undefined
    });
  };

  // Contar providers configurados
  const countConfigured = () => {
    let count = 0;
    if (apiKeys.gemini.filter(k => k.trim()).length > 0) count++;
    if (apiKeys.groq.filter(k => k.trim()).length > 0) count++;
    if (apiKeys.cohere.filter(k => k.trim()).length > 0) count++;
    if (apiKeys.huggingface.filter(k => k.trim()).length > 0) count++;
    if (apiKeys.openai?.trim()) count++;
    if (apiKeys.anthropic?.trim()) count++;
    if (apiKeys.mistral?.trim()) count++;
    if (apiKeys.together?.trim()) count++;
    if (apiKeys.perplexity?.trim()) count++;
    return count;
  };

  // Testar uma API key do Gemini
  const testGeminiKey = async (key: string, keyId: string) => {
    if (!key.trim()) return;

    setTestingKeys(prev => ({ ...prev, [keyId]: true }));
    setKeyStatus(prev => ({ ...prev, [keyId]: null }));

    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

      // Teste simples: gerar "OK"
      const result = await model.generateContent('Say OK');
      const response = await result.response;
      const text = response.text();

      if (text) {
        setKeyStatus(prev => ({ ...prev, [keyId]: 'valid' }));
      } else {
        setKeyStatus(prev => ({ ...prev, [keyId]: 'invalid' }));
      }
    } catch (error: any) {
      console.error('Erro ao testar API:', error);
      setKeyStatus(prev => ({ ...prev, [keyId]: 'invalid' }));
    } finally {
      setTestingKeys(prev => ({ ...prev, [keyId]: false }));
    }
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden scroll-smooth">
      {/* Header - Clicável para expandir/recolher */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          setIsExpanded(!isExpanded);
          // Scroll suave para o conteúdo quando expandir
          if (!isExpanded) {
            setTimeout(() => {
              contentRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
              });
            }, 100);
          }
        }}
        className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Key className="text-primary" size={20} />
          <h3 className="text-lg font-semibold">Configuração de API Keys</h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            ({countConfigured()} provider{countConfigured() !== 1 ? 's' : ''} configurado{countConfigured() !== 1 ? 's' : ''})
          </span>
        </div>
        <ChevronDown
          size={20}
          className={`text-gray-600 dark:text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Conteúdo expansível */}
      <div
        ref={contentRef}
        className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}
      >
        <div className="p-6 space-y-6">
          {/* Botão de mostrar/ocultar keys */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowKeys(!showKeys)}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary flex items-center gap-1"
            >
              {showKeys ? <EyeOff size={16} /> : <Eye size={16} />}
              {showKeys ? 'Ocultar chaves' : 'Mostrar chaves'}
            </button>
          </div>

          {/* ===== SEÇÃO: GRATUITOS ===== */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-green-200 dark:border-green-800">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <h4 className="font-semibold text-green-700 dark:text-green-400">APIs Gratuitas</h4>
            </div>

            {/* Google Gemini */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                🔷 Google Gemini (múltiplas contas)
              </label>
              {apiKeys.gemini.map((key, index) => {
                const keyId = `gemini-${index}`;
                const isTesting = testingKeys[keyId];
                const status = keyStatus[keyId];

                return (
                  <div key={index} className="flex gap-2">
                    <div className="flex-1 relative">
                      <input
                        type={showKeys ? 'text' : 'password'}
                        value={key}
                        onChange={(e) => {
                          updateKey('gemini', index, e.target.value);
                          // Limpar status quando modificar a key
                          setKeyStatus(prev => ({ ...prev, [keyId]: null }));
                        }}
                        placeholder={`API Key do Gemini ${index + 1}`}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white font-mono text-sm"
                      />
                      {/* Indicador de status */}
                      {status === 'valid' && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <CheckCircle size={18} className="text-green-500" />
                        </div>
                      )}
                      {status === 'invalid' && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <AlertCircle size={18} className="text-red-500" />
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => testGeminiKey(key, keyId)}
                      disabled={isTesting || !key.trim()}
                      className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                      title="Testar API Key"
                    >
                      {isTesting ? (
                        <Loader size={18} className="animate-spin" />
                      ) : (
                        <CheckCircle size={18} />
                      )}
                    </button>
                    {apiKeys.gemini.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeKey('gemini', index)}
                        className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                );
              })}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  addKey('gemini');
                }}
                className="w-full px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                Adicionar outra conta Gemini
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Gratuito • Limite: 15 RPM, 1M TPM • <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-primary underline">Obter API</a>
              </p>
            </div>

            {/* Groq */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                ⚡ Groq (ultra rápido, múltiplas contas)
              </label>
              {apiKeys.groq.length === 0 && (
                <button
                  type="button"
                  onClick={() => addKey('groq')}
                  className="w-full px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:border-primary hover:text-primary transition-colors"
                >
                  + Adicionar API do Groq
                </button>
              )}
              {apiKeys.groq.map((key, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type={showKeys ? 'text' : 'password'}
                    value={key}
                    onChange={(e) => updateKey('groq', index, e.target.value)}
                    placeholder={`API Key do Groq ${index + 1}`}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeKey('groq', index)}
                    className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
              {apiKeys.groq.length > 0 && (
                <button
                  type="button"
                  onClick={() => addKey('groq')}
                  className="w-full px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  Adicionar outra conta Groq
                </button>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Gratuito • Ultra rápido • <a href="https://console.groq.com/keys" target="_blank" className="text-primary underline">Obter API</a>
              </p>
            </div>

            {/* Cohere */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                🧠 Cohere (tier gratuito generoso)
              </label>
              {apiKeys.cohere.length === 0 && (
                <button
                  onClick={() => addKey('cohere')}
                  className="w-full px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:border-primary hover:text-primary transition-colors"
                >
                  + Adicionar API do Cohere
                </button>
              )}
              {apiKeys.cohere.map((key, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type={showKeys ? 'text' : 'password'}
                    value={key}
                    onChange={(e) => updateKey('cohere', index, e.target.value)}
                    placeholder={`API Key do Cohere ${index + 1}`}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white font-mono text-sm"
                  />
                  <button
                    onClick={() => removeKey('cohere', index)}
                    className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
              {apiKeys.cohere.length > 0 && (
                <button
                  onClick={() => addKey('cohere')}
                  className="w-full px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  Adicionar outra conta Cohere
                </button>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Gratuito • Tier generoso • <a href="https://dashboard.cohere.com/api-keys" target="_blank" className="text-primary underline">Obter API</a>
              </p>
            </div>

            {/* Hugging Face */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                🤗 Hugging Face (inference gratuita)
              </label>
              {apiKeys.huggingface.length === 0 && (
                <button
                  onClick={() => addKey('huggingface')}
                  className="w-full px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:border-primary hover:text-primary transition-colors"
                >
                  + Adicionar API do Hugging Face
                </button>
              )}
              {apiKeys.huggingface.map((key, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type={showKeys ? 'text' : 'password'}
                    value={key}
                    onChange={(e) => updateKey('huggingface', index, e.target.value)}
                    placeholder={`API Key do Hugging Face ${index + 1}`}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white font-mono text-sm"
                  />
                  <button
                    onClick={() => removeKey('huggingface', index)}
                    className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
              {apiKeys.huggingface.length > 0 && (
                <button
                  onClick={() => addKey('huggingface')}
                  className="w-full px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  Adicionar outra conta Hugging Face
                </button>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Gratuito • Vários modelos • <a href="https://huggingface.co/settings/tokens" target="_blank" className="text-primary underline">Obter API</a>
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 my-6"></div>

          {/* ===== SEÇÃO: PAGOS ===== */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-yellow-200 dark:border-yellow-800">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <h4 className="font-semibold text-yellow-700 dark:text-yellow-400">APIs Pagas</h4>
            </div>

            {/* OpenAI */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                🟢 OpenAI / GPT
              </label>
              <input
                type={showKeys ? 'text' : 'password'}
                value={apiKeys.openai || ''}
                onChange={(e) => updateSingleKey('openai', e.target.value)}
                placeholder="sk-..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white font-mono text-sm"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Pago • GPT-4, GPT-4 Turbo • <a href="https://platform.openai.com/api-keys" target="_blank" className="text-primary underline">Obter API</a>
              </p>
            </div>

            {/* Anthropic */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                🟣 Anthropic / Claude
              </label>
              <input
                type={showKeys ? 'text' : 'password'}
                value={apiKeys.anthropic || ''}
                onChange={(e) => updateSingleKey('anthropic', e.target.value)}
                placeholder="sk-ant-..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white font-mono text-sm"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Pago • Claude 3 Opus, Sonnet, Haiku • <a href="https://console.anthropic.com/" target="_blank" className="text-primary underline">Obter API</a>
              </p>
            </div>

            {/* Mistral */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                🔴 Mistral AI (barato)
              </label>
              <input
                type={showKeys ? 'text' : 'password'}
                value={apiKeys.mistral || ''}
                onChange={(e) => updateSingleKey('mistral', e.target.value)}
                placeholder="..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white font-mono text-sm"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Pago • Barato • Mistral Large, Medium • <a href="https://console.mistral.ai/" target="_blank" className="text-primary underline">Obter API</a>
              </p>
            </div>

            {/* Together AI */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                🔵 Together AI
              </label>
              <input
                type={showKeys ? 'text' : 'password'}
                value={apiKeys.together || ''}
                onChange={(e) => updateSingleKey('together', e.target.value)}
                placeholder="..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white font-mono text-sm"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Pago • Vários modelos open source • <a href="https://api.together.xyz/settings/api-keys" target="_blank" className="text-primary underline">Obter API</a>
              </p>
            </div>

            {/* Perplexity */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                🟠 Perplexity AI
              </label>
              <input
                type={showKeys ? 'text' : 'password'}
                value={apiKeys.perplexity || ''}
                onChange={(e) => updateSingleKey('perplexity', e.target.value)}
                placeholder="pplx-..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white font-mono text-sm"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Pago • Perplexity Sonar • <a href="https://www.perplexity.ai/settings/api" target="_blank" className="text-primary underline">Obter API</a>
              </p>
            </div>
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
        </div>
      </div>
    </div>
  );
}
