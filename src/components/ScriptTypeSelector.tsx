'use client';

import { useState, useEffect } from 'react';
import { ScriptMode, ScriptTypeConfig, SavedTemplate } from '@/types';
import { Film, Users, Sparkles, Settings, Save, Trash2, Clock, Plus } from 'lucide-react';

interface ScriptTypeSelectorProps {
  selectedMode: ScriptMode;
  onModeChange: (mode: ScriptMode) => void;
  disabled?: boolean;
}

// Configuração dos 4 tipos principais
const SCRIPT_TYPES: ScriptTypeConfig[] = [
  {
    id: 'documentary',
    name: 'Documentário',
    icon: '📚',
    description: 'Estilo investigativo com fatos, contexto histórico e curiosidades',
    structure: 'Hook + 6 Atos + Conclusão',
    characterTarget: '30.000+ caracteres',
    color: 'blue'
  },
  {
    id: 'story',
    name: 'História/Drama',
    icon: '🎭',
    description: 'Narrativa pessoal através dos olhos do personagem',
    structure: '3 Tópicos × 8 Subtópicos',
    characterTarget: '100.000 caracteres',
    color: 'purple'
  },
  {
    id: 'curiosities',
    name: 'Curiosidades',
    icon: '💡',
    description: 'Listas, Top 10, fatos interessantes e descobertas',
    structure: '10-15 Tópicos curtos',
    characterTarget: '20.000+ caracteres',
    color: 'yellow'
  },
  {
    id: 'custom',
    name: 'Customizado',
    icon: '✨',
    description: 'Crie seu próprio formato com estrutura personalizada',
    structure: 'Você define',
    characterTarget: 'Você escolhe',
    color: 'pink'
  }
];

export default function ScriptTypeSelector({
  selectedMode,
  onModeChange,
  disabled = false
}: ScriptTypeSelectorProps) {
  const [showTemplates, setShowTemplates] = useState(false);
  const [templates, setTemplates] = useState<SavedTemplate[]>([]);
  const [customName, setCustomName] = useState('');
  const [customStructure, setCustomStructure] = useState('');
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);

  // Carregar templates salvos
  useEffect(() => {
    const saved = localStorage.getItem('savedTemplates');
    if (saved) {
      setTemplates(JSON.parse(saved));
    }
  }, []);

  // Salvar template
  const saveTemplate = () => {
    if (!customName || !customStructure) return;

    const newTemplate: SavedTemplate = {
      id: Date.now().toString(),
      name: customName,
      mode: 'custom',
      structure: customStructure,
      createdAt: new Date().toISOString()
    };

    const updatedTemplates = [...templates, newTemplate];
    setTemplates(updatedTemplates);
    localStorage.setItem('savedTemplates', JSON.stringify(updatedTemplates));

    setCustomName('');
    setCustomStructure('');
    setIsCreatingCustom(false);
  };

  // Deletar template
  const deleteTemplate = (id: string) => {
    const updatedTemplates = templates.filter(t => t.id !== id);
    setTemplates(updatedTemplates);
    localStorage.setItem('savedTemplates', JSON.stringify(updatedTemplates));
  };

  // Usar template
  const useTemplate = (template: SavedTemplate) => {
    onModeChange('custom');
    // Aqui você pode adicionar lógica adicional para aplicar o template
    const updatedTemplate = {
      ...template,
      lastUsed: new Date().toISOString()
    };
    const updatedTemplates = templates.map(t =>
      t.id === template.id ? updatedTemplate : t
    );
    setTemplates(updatedTemplates);
    localStorage.setItem('savedTemplates', JSON.stringify(updatedTemplates));
  };

  return (
    <div className="space-y-6">
      {/* Grid de tipos principais */}
      <div className="grid grid-cols-2 gap-4">
        {SCRIPT_TYPES.map((type) => (
          <button
            key={type.id}
            onClick={() => {
              if (type.id === 'custom' && !templates.length) {
                setIsCreatingCustom(true);
              } else {
                onModeChange(type.id);
              }
            }}
            disabled={disabled}
            className={`
              relative p-6 rounded-xl border-2 transition-all
              ${selectedMode === type.id
                ? `border-${type.color}-500 bg-${type.color}-50 dark:bg-${type.color}-900/20`
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              text-left group
            `}
          >
            {/* Badge de selecionado */}
            {selectedMode === type.id && (
              <div className="absolute top-2 right-2">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}

            {/* Conteúdo */}
            <div className="space-y-3">
              <div className="text-4xl">{type.icon}</div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {type.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {type.description}
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <Film className="w-3 h-3 text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {type.structure}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Settings className="w-3 h-3 text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {type.characterTarget}
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Templates customizados */}
      {(selectedMode === 'custom' || templates.length > 0) && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              📂 Templates Salvos
            </h3>
            <button
              onClick={() => setIsCreatingCustom(!isCreatingCustom)}
              className="px-3 py-1.5 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Novo Template
            </button>
          </div>

          {/* Criar novo template */}
          {isCreatingCustom && (
            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
              <input
                type="text"
                placeholder="Nome do template..."
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
              />
              <textarea
                placeholder="Descreva a estrutura (ex: 5 capítulos com introdução e conclusão)..."
                value={customStructure}
                onChange={(e) => setCustomStructure(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 h-20"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setIsCreatingCustom(false);
                    setCustomName('');
                    setCustomStructure('');
                  }}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveTemplate}
                  disabled={!customName || !customStructure}
                  className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Salvar Template
                </button>
              </div>
            </div>
          )}

          {/* Lista de templates */}
          {templates.length > 0 ? (
            <div className="grid gap-2">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary/50 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {template.name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {template.structure}
                    </p>
                    {template.lastUsed && (
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-400">
                          Último uso: {new Date(template.lastUsed).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => useTemplate(template)}
                      className="px-3 py-1.5 bg-primary text-white text-xs rounded-lg hover:bg-primary/90"
                    >
                      Usar
                    </button>
                    <button
                      onClick={() => deleteTemplate(template.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !isCreatingCustom && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                Nenhum template salvo ainda
              </p>
            )
          )}
        </div>
      )}
    </div>
  );
}