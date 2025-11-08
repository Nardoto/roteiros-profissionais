'use client';

import { X, Settings, Key, Cpu, Globe, Film, Users } from 'lucide-react';
import { ScriptMode, ApiKeys, ApiSelection, StoryLanguage } from '@/types';
import ApiKeyManager from './ApiKeyManager';
import ApiSelector from './ApiSelector';
import ScriptTypeSelector from './ScriptTypeSelector';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  scriptMode: ScriptMode;
  onScriptModeChange: (mode: ScriptMode) => void;
  language: StoryLanguage;
  onLanguageChange: (lang: StoryLanguage) => void;
  selectedApi: ApiSelection;
  onApiChange: (api: ApiSelection) => void;
  apiKeys: ApiKeys;
  onApiKeysChange: (keys: ApiKeys) => void;
  isGenerating: boolean;
}

export default function ConfigModal({
  isOpen,
  onClose,
  scriptMode,
  onScriptModeChange,
  language,
  onLanguageChange,
  selectedApi,
  onApiChange,
  apiKeys,
  onApiKeysChange,
  isGenerating,
}: ConfigModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl transform transition-all duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Settings className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Configurar Roteiro
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                disabled={isGenerating}
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto">
              {/* Modo de Roteiro */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Film className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Tipo de Roteiro
                  </h3>
                </div>
                <ScriptTypeSelector
                  selectedMode={scriptMode}
                  onModeChange={onScriptModeChange}
                  disabled={isGenerating}
                />
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700"></div>

              {/* Idioma */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Idioma do Roteiro
                  </h3>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    type="button"
                    onClick={() => onLanguageChange('pt')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      language === 'pt'
                        ? 'border-primary bg-primary/10 text-primary dark:bg-primary/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                    disabled={isGenerating}
                  >
                    <p className="text-2xl mb-2">🇧🇷</p>
                    <p className="font-semibold">Português</p>
                    <p className="text-xs mt-1 opacity-75">
                      {scriptMode === 'documentary' ? 'Tudo em PT' : 'Todo conteúdo'}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => onLanguageChange('en')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      language === 'en'
                        ? 'border-primary bg-primary/10 text-primary dark:bg-primary/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                    disabled={isGenerating}
                  >
                    <p className="text-2xl mb-2">🇺🇸</p>
                    <p className="font-semibold">English</p>
                    <p className="text-xs mt-1 opacity-75">
                      {scriptMode === 'documentary' ? 'Narração + Título' : 'Todo conteúdo'}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => onLanguageChange('es')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      language === 'es'
                        ? 'border-primary bg-primary/10 text-primary dark:bg-primary/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                    disabled={isGenerating}
                  >
                    <p className="text-2xl mb-2">🇪🇸</p>
                    <p className="font-semibold">Español</p>
                    <p className="text-xs mt-1 opacity-75">
                      {scriptMode === 'documentary' ? 'Narración + Título' : 'Todo contenido'}
                    </p>
                  </button>
                </div>
                <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                  {scriptMode === 'documentary'
                    ? 'Define o idioma do texto narrado (arquivo 3) e título/descrição (arquivo 5)'
                    : 'Define o idioma de todos os arquivos gerados'}
                </p>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700"></div>

              {/* Provider de IA */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Cpu className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Provider de IA
                  </h3>
                </div>
                <ApiSelector
                  selectedApi={selectedApi}
                  onChange={onApiChange}
                  apiKeys={apiKeys}
                  disabled={isGenerating}
                />
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700"></div>

              {/* API Keys */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Key className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Configuração de API Keys
                  </h3>
                </div>
                <ApiKeyManager apiKeys={apiKeys} onChange={onApiKeysChange} />
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <p>✅ Configurações salvas automaticamente</p>
                </div>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors font-semibold"
                  disabled={isGenerating}
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}