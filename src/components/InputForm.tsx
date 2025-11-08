'use client';

import { useState, useEffect } from 'react';
import { ScriptInput, ApiKeys, ApiSelection, ScriptMode, StoryLanguage } from '@/types';
import { Sparkles, Settings2, FileText, BookOpen, CheckCircle, Info, Code } from 'lucide-react';
import ConfigModal from './ConfigModal';
import PromptViewer from './PromptViewer';

interface InputFormProps {
  onSubmit: (input: ScriptInput) => void;
  isGenerating: boolean;
}

export default function InputForm({ onSubmit, isGenerating }: InputFormProps) {
  const [title, setTitle] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [knowledgeBase, setKnowledgeBase] = useState('');
  const [scriptMode, setScriptMode] = useState<ScriptMode>('documentary');
  const [language, setLanguage] = useState<StoryLanguage>('pt'); // Português por padrão
  const [targetCharacters, setTargetCharacters] = useState<number>(100000); // Padrão: 100k caracteres
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPromptViewerOpen, setIsPromptViewerOpen] = useState(false);
  const [customPrompts, setCustomPrompts] = useState<Record<string, string>>({});

  // API Keys com as chaves do Gemini já preenchidas
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    // Gratuitos - Gemini já configurado
    gemini: [
      'AIzaSyAm5YalZdJ5iowJhMaIfmTCloVCvmWwP8Y',
      'AIzaSyA5drFLHxNU2eDWo54ZAhDZFZKphgWrjIw',
      'AIzaSyC3UV9gOufG-1Q6eDJdkItgcmbt3DNq1zw'
    ],
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

  // Gemini selecionado por padrão
  const [selectedApi, setSelectedApi] = useState<ApiSelection>({
    provider: 'gemini',
    label: 'Google Gemini (3 APIs)'
  });

  // Adicionar estado para mostrar configurações simplificadas
  const [showSimpleConfig, setShowSimpleConfig] = useState(false);

  // Ajustar targetCharacters quando o modo mudar
  useEffect(() => {
    if (scriptMode === 'documentary') {
      setTargetCharacters(9000); // Modo teste para desenvolvimento
    } else if (scriptMode === 'story') {
      setTargetCharacters(9000); // Modo teste para desenvolvimento
    } else if (scriptMode === 'curiosities') {
      setTargetCharacters(9000); // Modo teste para desenvolvimento
    }
  }, [scriptMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !synopsis.trim()) {
      alert('Por favor, preencha o título e a sinopse.');
      return;
    }

    onSubmit({
      title: title.trim(),
      synopsis: synopsis.trim(),
      knowledgeBase: knowledgeBase.trim(),
      apiKeys,
      mode: scriptMode,
      selectedApi,
      language,
      targetCharacters,
      customPrompts,
    });
  };

  // Função para alternar idioma rapidamente
  const toggleLanguage = () => {
    setLanguage(prev => {
      if (prev === 'pt') return 'en';
      if (prev === 'en') return 'es';
      return 'pt';
    });
  };

  // Função para alternar modo rapidamente
  const toggleMode = () => {
    setScriptMode(prev => {
      if (prev === 'documentary') return 'story';
      if (prev === 'story') return 'curiosities';
      if (prev === 'curiosities') return 'custom';
      return 'documentary';
    });
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Configuração Rápida - Mais Amigável */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                ⚡ Configuração Rápida
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Já está tudo pronto! Você pode começar imediatamente ou ajustar as configurações.
              </p>
            </div>
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-semibold">Pronto!</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Modo */}
            <button
              type="button"
              onClick={toggleMode}
              className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700 relative"
              disabled={isGenerating}
            >
              <div className="absolute top-2 right-2">
                <span className="text-xs text-blue-600 dark:text-blue-400">Trocar</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <span className="text-3xl mb-1">
                  {scriptMode === 'documentary' ? '📚' :
                   scriptMode === 'story' ? '🎭' :
                   scriptMode === 'curiosities' ? '💡' : '✨'}
                </span>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Tipo</p>
                  <p className="font-semibold text-sm mt-1">
                    {scriptMode === 'documentary' ? 'Documentário' :
                     scriptMode === 'story' ? 'História' :
                     scriptMode === 'curiosities' ? 'Curiosidades' : 'Custom'}
                  </p>
                </div>
              </div>
            </button>

            {/* Idioma */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700 relative"
              disabled={isGenerating}
            >
              <div className="absolute top-2 right-2">
                <span className="text-xs text-blue-600 dark:text-blue-400">Trocar</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <span className="text-3xl mb-1">
                  {language === 'pt' ? '🇧🇷' : language === 'en' ? '🇺🇸' : '🇪🇸'}
                </span>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Idioma</p>
                  <p className="font-semibold text-sm mt-1">
                    {language === 'pt' ? 'Português' : language === 'en' ? 'English' : 'Español'}
                  </p>
                </div>
              </div>
            </button>

            {/* Provider */}
            <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col items-center gap-2 text-center">
                <span className="text-3xl mb-1">🤖</span>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">IA Configurada</p>
                  <p className="font-semibold text-sm text-green-600 dark:text-green-400 mt-1">
                    {selectedApi?.label || 'Nenhuma API selecionada'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Botões de configurações */}
          <div className="mt-4 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors flex items-center gap-2"
            >
              <Settings2 className="w-4 h-4" />
              Configurações avançadas
            </button>
            <button
              type="button"
              onClick={() => setIsPromptViewerOpen(true)}
              className={`text-sm transition-colors flex items-center gap-2 ${
                Object.keys(customPrompts).length > 0
                  ? 'text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold'
                  : 'text-gray-600 dark:text-gray-400 hover:text-primary'
              }`}
            >
              <Code className="w-4 h-4" />
              Ver prompts da IA
              {Object.keys(customPrompts).length > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 text-xs rounded-full">
                  {Object.keys(customPrompts).length} customizado{Object.keys(customPrompts).length > 1 ? 's' : ''}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Informação amigável */}
        <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <Info className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-green-800 dark:text-green-300">
            <p className="font-semibold mb-1">Tudo configurado automaticamente! 🎉</p>
            <p>O sistema já está pronto com as melhores configurações. Você só precisa preencher o título e a sinopse abaixo para começar.</p>
          </div>
        </div>

        {/* Aviso de prompts customizados */}
        {Object.keys(customPrompts).length > 0 && (
          <div className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <Code className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-purple-800 dark:text-purple-300">
              <p className="font-semibold mb-1">Prompts Personalizados Ativos ✨</p>
              <p>
                Você tem {Object.keys(customPrompts).length} prompt{Object.keys(customPrompts).length > 1 ? 's' : ''} personalizado{Object.keys(customPrompts).length > 1 ? 's' : ''}.
                O roteiro será gerado com suas modificações.
              </p>
              <button
                type="button"
                onClick={() => setIsPromptViewerOpen(true)}
                className="mt-2 text-xs text-purple-600 dark:text-purple-400 hover:underline"
              >
                Gerenciar prompts →
              </button>
            </div>
          </div>
        )}

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6"></div>

        {/* Título */}
        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <span>Título do Vídeo *</span>
            </div>
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white transition-all"
            placeholder="Ex: A História de Davi e Golias"
            required
            disabled={isGenerating}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            💡 Dica: Use títulos que despertem curiosidade, como "O Segredo Revelado de..." ou "A Verdade Sobre..."
          </p>
        </div>

        {/* Sinopse */}
        <div>
          <label htmlFor="synopsis" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <span>Sinopse *</span>
            </div>
          </label>
          <textarea
            id="synopsis"
            value={synopsis}
            onChange={(e) => setSynopsis(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white transition-all"
            placeholder="Descreva em poucas palavras sobre o que é o vídeo. Ex: A história de como um jovem pastor derrotou um gigante com apenas uma pedra e muita fé."
            rows={4}
            required
            disabled={isGenerating}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            💡 Dica: Não precisa ser muito detalhado. 2-3 frases são suficientes para a IA entender o contexto.
          </p>
        </div>

        {/* Total de Caracteres */}
        <div>
          <label htmlFor="targetCharacters" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            <div className="flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-primary" />
              <span>Total de Caracteres do Roteiro</span>
            </div>
          </label>

          {/* Botões de Preset Rápido */}
          <div className="flex gap-2 mb-3">
            <button
              type="button"
              onClick={() => setTargetCharacters(9000)}
              className="flex-1 px-3 py-2 text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-all disabled:opacity-50"
              disabled={isGenerating}
            >
              ⚡ Teste (9k)
            </button>
            <button
              type="button"
              onClick={() => setTargetCharacters(scriptMode === 'story' ? 30000 : 20000)}
              className="flex-1 px-3 py-2 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all disabled:opacity-50"
              disabled={isGenerating}
            >
              📊 Médio ({scriptMode === 'story' ? '30k' : '20k'})
            </button>
            <button
              type="button"
              onClick={() => setTargetCharacters(scriptMode === 'story' ? 100000 : 30000)}
              className="flex-1 px-3 py-2 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-all disabled:opacity-50"
              disabled={isGenerating}
            >
              🎯 Completo ({scriptMode === 'story' ? '100k' : '30k'})
            </button>
          </div>

          <input
            type="number"
            id="targetCharacters"
            value={targetCharacters}
            onChange={(e) => setTargetCharacters(Number(e.target.value))}
            min={5000}
            max={500000}
            step={1000}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white transition-all"
            placeholder="100000"
            disabled={isGenerating}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            💡 {scriptMode === 'documentary'
              ? 'Use "Teste" para protótipos rápidos (~2 min). "Completo" para produção final (~10 min).'
              : scriptMode === 'story'
              ? 'Use "Teste (9k)" para validar rápido (~2-3 min). "Completo (100k)" para produção (~15 min).'
              : scriptMode === 'curiosities'
              ? 'Use "Teste" para validação rápida. "Completo" para versão final.'
              : 'Defina o total de caracteres desejado para seu roteiro personalizado.'}
          </p>
        </div>

        {/* Base de Conhecimento - Simplificada */}
        {showSimpleConfig && (
          <div>
            <label htmlFor="knowledgeBase" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-gray-500" />
                <span>Informações Extras (Opcional)</span>
              </div>
            </label>
            <textarea
              id="knowledgeBase"
              value={knowledgeBase}
              onChange={(e) => setKnowledgeBase(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white transition-all"
              placeholder="Se quiser, adicione detalhes específicos que devem aparecer no vídeo..."
              rows={3}
              disabled={isGenerating}
            />
          </div>
        )}

        {!showSimpleConfig && (
          <button
            type="button"
            onClick={() => setShowSimpleConfig(true)}
            className="text-sm text-gray-500 hover:text-primary transition-colors"
          >
            + Adicionar informações extras (opcional)
          </button>
        )}

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6"></div>

        {/* Botão de Gerar - Mais Chamativo */}
        <div className="space-y-4">
          <button
            type="submit"
            className={`w-full py-5 px-6 rounded-xl font-bold text-white transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 text-lg shadow-xl ${
              isGenerating
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 animate-gradient'
            }`}
            disabled={isGenerating}
          >
            <Sparkles className={`w-6 h-6 ${isGenerating ? 'animate-spin' : 'animate-pulse'}`} />
            {isGenerating ? 'Criando seu Roteiro Profissional...' : 'Criar Meu Roteiro Profissional'}
          </button>

          <div className="text-center space-y-2">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              ⏱️ Leva apenas 3-5 minutos
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Você receberá 5 arquivos completos: Roteiro, Trilha Sonora, Narração, Personagens e Título SEO
            </p>
          </div>
        </div>
      </form>

      {/* Modal de Configurações Avançadas */}
      <ConfigModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        scriptMode={scriptMode}
        onScriptModeChange={setScriptMode}
        language={language}
        onLanguageChange={setLanguage}
        selectedApi={selectedApi}
        onApiChange={setSelectedApi}
        apiKeys={apiKeys}
        onApiKeysChange={setApiKeys}
        isGenerating={isGenerating}
      />

      {/* Modal de Visualização de Prompts */}
      <PromptViewer
        isOpen={isPromptViewerOpen}
        onClose={() => setIsPromptViewerOpen(false)}
        scriptInput={{
          title,
          synopsis,
          knowledgeBase,
          apiKeys,
          mode: scriptMode,
          selectedApi,
          language
        }}
        customPrompts={customPrompts}
        onCustomPromptsChange={setCustomPrompts}
      />

      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </>
  );
}