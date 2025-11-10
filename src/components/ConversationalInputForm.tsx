'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Sparkles, Clock, Zap, MessageSquare, Edit2, Plus, Upload, Download, Trash2, ChevronDown } from 'lucide-react';
import { ConversationalInput } from '@/types/conversation';
import { ALL_UNIVERSAL_TEMPLATES } from '@/lib/universal-templates';
import { UniversalTemplate } from '@/types/universal-template';
import { calculateVideoTime, suggestCharactersForVideoLength } from '@/lib/time-calculator';
import ApiSelector from './ApiSelector';
import ApiKeyManager from './ApiKeyManager';
import TemplateEditor from './TemplateEditor';
import { ApiSelection, ApiKeys } from '@/types';

interface ConversationalInputFormProps {
  onSubmit: (input: ConversationalInput) => void;
  isGenerating: boolean;
}

export default function ConversationalInputForm({ onSubmit, isGenerating }: ConversationalInputFormProps) {
  // ========== ESTADO ==========
  const [title, setTitle] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [knowledgeBase, setKnowledgeBase] = useState('');

  const [templateId, setTemplateId] = useState('historia-biblica');
  const [numTopics, setNumTopics] = useState(3);
  const [numSubtopics, setNumSubtopics] = useState(8);
  const [totalCharacters, setTotalCharacters] = useState(60000);
  const [language, setLanguage] = useState<'pt' | 'en' | 'es'>('pt');

  // Editor de templates
  const [editingTemplate, setEditingTemplate] = useState<UniversalTemplate | null>(null);
  const [customTemplates, setCustomTemplates] = useState<Record<string, UniversalTemplate>>({});

  // API
  const [selectedApi, setSelectedApi] = useState<ApiSelection | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    gemini: [''],
    groq: [],
    cohere: [],
    huggingface: [],
    openai: undefined,
    anthropic: undefined,
    mistral: undefined,
    together: undefined,
    perplexity: undefined,
  });
  const [claudeModel, setClaudeModel] = useState<'haiku' | 'sonnet' | 'opus'>('sonnet');
  const [isClaudeModelExpanded, setIsClaudeModelExpanded] = useState(false);

  // Estimativa de tempo
  const [videoTimeEstimate, setVideoTimeEstimate] = useState(calculateVideoTime(60000));

  // ========== EFEITOS ==========

  // CARREGAR dados do localStorage ao montar o componente
  useEffect(() => {
    const savedApiKeys = localStorage.getItem('apiKeys');
    const savedSelectedApi = localStorage.getItem('selectedApi');
    const savedClaudeModel = localStorage.getItem('claudeModel');
    const savedCustomTemplates = localStorage.getItem('customTemplates');

    if (savedApiKeys) {
      try {
        setApiKeys(JSON.parse(savedApiKeys));
      } catch (e) {
        console.error('Erro ao carregar API keys:', e);
      }
    }

    if (savedSelectedApi) {
      try {
        setSelectedApi(JSON.parse(savedSelectedApi));
      } catch (e) {
        console.error('Erro ao carregar provider selecionado:', e);
      }
    }

    if (savedClaudeModel) {
      setClaudeModel(savedClaudeModel as 'haiku' | 'sonnet' | 'opus');
    }

    if (savedCustomTemplates) {
      try {
        setCustomTemplates(JSON.parse(savedCustomTemplates));
        console.log('✅ Templates customizados carregados do localStorage');
      } catch (e) {
        console.error('Erro ao carregar templates customizados:', e);
      }
    }
  }, []);

  // SALVAR API keys no localStorage sempre que mudarem
  useEffect(() => {
    localStorage.setItem('apiKeys', JSON.stringify(apiKeys));
  }, [apiKeys]);

  // SALVAR provider selecionado no localStorage
  useEffect(() => {
    if (selectedApi) {
      localStorage.setItem('selectedApi', JSON.stringify(selectedApi));
    }
  }, [selectedApi]);

  // SALVAR modelo Claude no localStorage
  useEffect(() => {
    localStorage.setItem('claudeModel', claudeModel);
  }, [claudeModel]);

  // SALVAR templates customizados no localStorage sempre que mudarem
  useEffect(() => {
    if (Object.keys(customTemplates).length > 0) {
      localStorage.setItem('customTemplates', JSON.stringify(customTemplates));
      console.log('💾 Templates customizados salvos no localStorage');
    }
  }, [customTemplates]);

  // Atualizar estimativa quando caracteres mudarem
  useEffect(() => {
    setVideoTimeEstimate(calculateVideoTime(totalCharacters));
  }, [totalCharacters]);

  // ========== HANDLERS ==========

  // Abrir editor de template
  const handleEditTemplate = (templateId: string) => {
    const template = customTemplates[templateId] || ALL_UNIVERSAL_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setEditingTemplate(template);
    }
  };

  // Salvar template editado
  const handleSaveTemplate = (editedTemplate: UniversalTemplate) => {
    setCustomTemplates((prev) => ({
      ...prev,
      [editedTemplate.id]: editedTemplate,
    }));
    setEditingTemplate(null);
  };

  // Criar novo template do zero
  const handleCreateNewTemplate = () => {
    const newId = `custom-${Date.now()}`;
    const newTemplate: UniversalTemplate = {
      id: newId,
      name: 'Novo Template',
      description: 'Template personalizado',
      icon: '✨',
      defaultVariables: {
        NUM_TOPICOS: 3,
        NUM_SUBTOPICOS: 8,
        CARACTERES_TOTAIS: 60000,
        CARACTERES_HOOK: 1000,
      },
      steps: [
        {
          id: 'estrutura',
          name: 'Estrutura',
          description: 'Criar estrutura do roteiro',
          type: 'prompt',
          promptTemplate: 'Crie uma estrutura sobre "{{TITULO}}"...',
          usesContext: false,
          outputVar: 'ESTRUTURA',
          outputType: 'structure',
        },
      ],
      outputs: {
        primary: {
          id: 'roteiro-completo',
          filename: '01_Roteiro_Completo.txt',
          description: 'Roteiro completo',
          buildFrom: 'variable',
          sourceVar: 'ROTEIRO_COMPLETO',
          isCleanText: true,
          stripMarkdown: true,
        },
        optional: [],
      },
    };
    setEditingTemplate(newTemplate);
  };

  // Importar template de arquivo JSON
  const handleImportTemplate = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e: any) => {
      const file = e.target?.files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const template: UniversalTemplate = JSON.parse(text);

        // Validar estrutura básica
        if (!template.id || !template.name || !template.steps) {
          alert('Arquivo JSON inválido! Formato de template incorreto.');
          return;
        }

        setCustomTemplates((prev) => ({
          ...prev,
          [template.id]: template,
        }));
        alert(`✅ Template "${template.name}" importado com sucesso!`);
      } catch (error) {
        console.error('Erro ao importar template:', error);
        alert('❌ Erro ao importar template. Verifique se o arquivo JSON está válido.');
      }
    };
    input.click();
  };

  // Exportar template como arquivo JSON
  const handleExportTemplate = (templateId: string) => {
    const template = getCurrentTemplate(templateId);
    const json = JSON.stringify(template, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Deletar template customizado
  const handleDeleteTemplate = (deleteTemplateId: string) => {
    const template = customTemplates[deleteTemplateId];
    if (!template) return;

    const confirmMessage = `Tem certeza que deseja deletar o template "${template.name}"?\n\nEsta ação não pode ser desfeita.`;
    if (!confirm(confirmMessage)) return;

    // Remover do estado
    const newCustomTemplates = { ...customTemplates };
    delete newCustomTemplates[deleteTemplateId];
    setCustomTemplates(newCustomTemplates);

    // Se era o template selecionado, voltar para o padrão
    if (deleteTemplateId === templateId) {
      setTemplateId('historia-biblica');
    }

    // Atualizar localStorage (será atualizado automaticamente pelo useEffect)
    alert(`✅ Template "${template.name}" deletado com sucesso!`);
  };

  // Obter template atual (custom ou original)
  const getCurrentTemplate = (templateId: string): UniversalTemplate => {
    return customTemplates[templateId] || ALL_UNIVERSAL_TEMPLATES.find((t) => t.id === templateId)!;
  };

  // Obter todos os templates para exibir (default + custom)
  const getAllTemplatesToDisplay = (): UniversalTemplate[] => {
    const templates = [...ALL_UNIVERSAL_TEMPLATES];

    // Adicionar templates customizados que não são baseados nos padrões
    Object.values(customTemplates).forEach((customTemplate) => {
      const isNotDefaultTemplate = !ALL_UNIVERSAL_TEMPLATES.find((t) => t.id === customTemplate.id);
      if (isNotDefaultTemplate) {
        templates.push(customTemplate);
      }
    });

    return templates;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedApi) {
      alert('Por favor, selecione um provider de IA');
      return;
    }

    const input: ConversationalInput = {
      title: title.trim(),
      synopsis: synopsis.trim(),
      knowledgeBase: knowledgeBase.trim(),
      numTopics,
      numSubtopics,
      totalCharacters,
      language,
      templateId,
      customTemplate: customTemplates[templateId], // Incluir template customizado se houver
      apiKeys,
      selectedProvider: selectedApi.provider,
      claudeModel: selectedApi.provider === 'anthropic' ? claudeModel : undefined,
    };

    onSubmit(input);
  };

  // Presets de duração
  const applyDurationPreset = (minutes: number) => {
    const suggestion = suggestCharactersForVideoLength(minutes);
    setTotalCharacters(suggestion.recommended);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ========== TEMPLATE ========== */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          <div className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Tipo de Roteiro *</span>
            </div>

            {/* Botões de gerenciamento de templates */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCreateNewTemplate}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
                disabled={isGenerating}
                title="Criar novo template do zero"
              >
                <Plus size={14} />
                Criar
              </button>

              <button
                type="button"
                onClick={handleImportTemplate}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                disabled={isGenerating}
                title="Importar template de arquivo JSON"
              >
                <Upload size={14} />
                Importar
              </button>

              <button
                type="button"
                onClick={() => handleExportTemplate(templateId)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors"
                disabled={isGenerating}
                title="Exportar template atual como JSON"
              >
                <Download size={14} />
                Exportar
              </button>
            </div>
          </div>
        </label>

        <div className="grid grid-cols-4 gap-2">
          {getAllTemplatesToDisplay().map((template) => {
            const hasCustomVersion = !!customTemplates[template.id];
            const isCustomCreated = template.id.startsWith('custom-');
            return (
              <div key={template.id} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setTemplateId(template.id);
                    // Ajustar valores padrão do template
                    setNumTopics(template.defaultVariables.NUM_TOPICOS);
                    setNumSubtopics(template.defaultVariables.NUM_SUBTOPICOS);
                    setTotalCharacters(template.defaultVariables.CARACTERES_TOTAIS);
                  }}
                  className={`w-full p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                    templateId === template.id
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-gray-300 dark:border-gray-700 hover:border-primary/50'
                  }`}
                  disabled={isGenerating}
                >
                  <div className="text-2xl mb-1">{template.icon}</div>
                  <div className="font-bold">{template.name}</div>
                  {hasCustomVersion && !isCustomCreated && (
                    <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                      ✨ Editado
                    </div>
                  )}
                  {isCustomCreated && (
                    <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      🆕 Personalizado
                    </div>
                  )}
                </button>

                {/* Botões de ação */}
                <div className="absolute top-1 right-1 flex gap-1">
                  {/* Botão de editar */}
                  <button
                    type="button"
                    onClick={() => handleEditTemplate(template.id)}
                    className="p-1.5 bg-white dark:bg-gray-800 rounded-md shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-600"
                    disabled={isGenerating}
                    title="Editar prompts do template"
                  >
                    <Edit2 size={14} className="text-gray-600 dark:text-gray-400" />
                  </button>

                  {/* Botão de deletar (apenas para custom templates) */}
                  {isCustomCreated && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTemplate(template.id);
                      }}
                      className="p-1.5 bg-white dark:bg-gray-800 rounded-md shadow-md hover:bg-red-100 dark:hover:bg-red-900/30 transition-all border border-gray-200 dark:border-gray-600 hover:border-red-300 dark:hover:border-red-700"
                      disabled={isGenerating}
                      title="Deletar template"
                    >
                      <Trash2 size={14} className="text-red-600 dark:text-red-400" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {getCurrentTemplate(templateId)?.description || 'Template personalizado'}
        </p>
      </div>

      {/* ========== TÍTULO ========== */}
      <div>
        <label htmlFor="title" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Título do Vídeo *
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder='Ex: "A Vida de Moisés"'
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:text-white"
          required
          disabled={isGenerating}
        />
      </div>

      {/* ========== SINOPSE ========== */}
      <div>
        <label htmlFor="synopsis" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Sinopse *
        </label>
        <textarea
          id="synopsis"
          value={synopsis}
          onChange={(e) => setSynopsis(e.target.value)}
          placeholder="Descreva brevemente sobre o que será o vídeo..."
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:text-white resize-none"
          required
          disabled={isGenerating}
        />
      </div>

      {/* ========== BASE DE CONHECIMENTO ========== */}
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
          placeholder="Versículos, referências, contexto histórico..."
          rows={2}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:text-white resize-none"
          disabled={isGenerating}
        />
      </div>

      {/* ========== CONFIGURAÇÕES DO ROTEIRO ========== */}
      <div className="grid grid-cols-2 gap-4">
        {/* Número de Tópicos */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Tópicos *
          </label>
          <input
            type="number"
            min="2"
            max="10"
            value={numTopics}
            onChange={(e) => setNumTopics(parseInt(e.target.value))}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:text-white"
            disabled={isGenerating}
          />
        </div>

        {/* Número de Subtópicos */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Subtópicos/Tópico *
          </label>
          <input
            type="number"
            min="3"
            max="15"
            value={numSubtopics}
            onChange={(e) => setNumSubtopics(parseInt(e.target.value))}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:text-white"
            disabled={isGenerating}
          />
        </div>
      </div>

      {/* ========== IDIOMA ========== */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Idioma *
        </label>
        <div className="flex gap-2">
          {[
            { code: 'pt' as const, name: 'Português' },
            { code: 'en' as const, name: 'English' },
            { code: 'es' as const, name: 'Español' },
          ].map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => setLanguage(lang.code)}
              className={`flex-1 px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                language === lang.code
                  ? 'border-primary bg-primary text-white'
                  : 'border-gray-300 dark:border-gray-700 hover:border-primary/50'
              }`}
              disabled={isGenerating}
            >
              {lang.name}
            </button>
          ))}
        </div>
      </div>

      {/* ========== DURAÇÃO DO VÍDEO ========== */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Duração do Vídeo</span>
          </div>
        </label>

        {/* Presets rápidos */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          {[5, 10, 15, 20].map((mins) => (
            <button
              key={mins}
              type="button"
              onClick={() => applyDurationPreset(mins)}
              className="px-3 py-2 text-xs font-medium rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all"
              disabled={isGenerating}
            >
              {mins} min
            </button>
          ))}
        </div>

        {/* Input manual de caracteres */}
        <input
          type="number"
          min="5000"
          max="200000"
          step="1000"
          value={totalCharacters}
          onChange={(e) => setTotalCharacters(parseInt(e.target.value))}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:text-white"
          disabled={isGenerating}
        />

        {/* Estimativa de tempo */}
        <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700">
          <p className="text-[10px] font-medium text-gray-600 dark:text-gray-400">
            ⏱️ Duração estimada: <span className="font-semibold text-gray-900 dark:text-gray-100">{videoTimeEstimate.medium.duration}</span> <span className="text-[9px]">({videoTimeEstimate.slow.duration} ~ {videoTimeEstimate.fast.duration})</span>
          </p>
        </div>
      </div>

      {/* ========== GERENCIADOR DE API KEYS ========== */}
      <ApiKeyManager
        apiKeys={apiKeys}
        onChange={setApiKeys}
      />

      {/* ========== API SELECTOR ========== */}
      <ApiSelector
        apiKeys={apiKeys}
        selectedApi={selectedApi}
        onChange={(selection) => {
          console.log('🔍 Provider selecionado:', selection);
          setSelectedApi(selection);
        }}
        disabled={isGenerating}
      />

      {/* ========== MODELO CLAUDE (DROPDOWN) ========== */}
      {selectedApi?.provider === 'anthropic' && (
        <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setIsClaudeModelExpanded(!isClaudeModelExpanded)}
            className="w-full flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              <span className="text-sm font-semibold">Modelo Claude *</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">({claudeModel === 'haiku' ? 'Haiku 4.5' : claudeModel === 'sonnet' ? 'Sonnet 4.5' : 'Opus 4.1'})</span>
            </div>
            <ChevronDown
              size={18}
              className={`text-gray-600 dark:text-gray-400 transition-transform duration-200 ${isClaudeModelExpanded ? 'rotate-180' : ''}`}
            />
          </button>

          <div className={`transition-all duration-300 ease-in-out ${isClaudeModelExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
            <div className="p-3 space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'haiku', name: 'Haiku 4.5', cost: '$0.30' },
                  { id: 'sonnet', name: 'Sonnet 4.5', cost: '$0.50' },
                  { id: 'opus', name: 'Opus 4.1', cost: '$1.00' },
                ].map((model) => (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => setClaudeModel(model.id as any)}
                    className={`px-3 py-2 text-xs font-medium rounded-lg transition-all border ${
                      claudeModel === model.id
                        ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-gray-900 dark:border-gray-100'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                    disabled={isGenerating}
                  >
                    <div className="font-bold">{model.name}</div>
                    <div className="text-[10px] mt-0.5 opacity-70">{model.cost}</div>
                  </button>
                ))}
              </div>

              {/* Aviso Haiku */}
              {claudeModel === 'haiku' && (
                <div className="p-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg">
                  <p className="text-xs text-gray-700 dark:text-gray-300">
                    ⚡ <strong>Haiku:</strong> Mais rápido e barato, mas pode demorar 40-60s por tópico em roteiros longos.
                    O sistema reduzirá automaticamente o tamanho para 60% do solicitado.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========== BOTÃO SUBMIT ========== */}
      <button
        type="submit"
        disabled={isGenerating || !selectedApi}
        className="w-full px-6 py-4 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isGenerating ? (
          <>
            <Zap className="w-5 h-5 animate-spin" />
            Gerando conversa com IA...
          </>
        ) : (
          <>
            <MessageSquare className="w-5 h-5" />
            Iniciar Geração Conversacional
          </>
        )}
      </button>

      {/* ========== EDITOR DE TEMPLATES ========== */}
      {editingTemplate && (
        <TemplateEditor
          template={editingTemplate}
          onSave={handleSaveTemplate}
          onClose={() => setEditingTemplate(null)}
        />
      )}
    </form>
  );
}
