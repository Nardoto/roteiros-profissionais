'use client';

import { useState } from 'react';
import { Edit, Save, X, Eye, EyeOff, Plus, Trash2, GripVertical } from 'lucide-react';
import { UniversalTemplate, UniversalStep } from '@/types/universal-template';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface TemplateEditorProps {
  template: UniversalTemplate;
  onSave: (template: UniversalTemplate) => void;
  onClose: () => void;
}

export default function TemplateEditor({ template, onSave, onClose }: TemplateEditorProps) {
  const [editedTemplate, setEditedTemplate] = useState<UniversalTemplate>(template);
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set([0]));

  const toggleStep = (index: number) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSteps(newExpanded);
  };

  const updateStepPrompt = (parentIndex: number, newPrompt: string, loopIndex?: number) => {
    const newSteps = [...editedTemplate.steps];

    if (loopIndex !== undefined) {
      // Atualizar prompt dentro de LOOP
      const step = newSteps[parentIndex];
      if (step.type === 'operation' && step.operation?.type === 'LOOP' && step.operation.steps) {
        step.operation.steps[loopIndex] = {
          ...step.operation.steps[loopIndex],
          promptTemplate: newPrompt,
        };
      }
    } else {
      // Atualizar prompt de nível superior
      if (newSteps[parentIndex].type === 'prompt') {
        newSteps[parentIndex] = {
          ...newSteps[parentIndex],
          promptTemplate: newPrompt,
        };
      }
    }

    setEditedTemplate({ ...editedTemplate, steps: newSteps });
  };

  const updateStepName = (parentIndex: number, newName: string, loopIndex?: number) => {
    const newSteps = [...editedTemplate.steps];

    if (loopIndex !== undefined) {
      const step = newSteps[parentIndex];
      if (step.type === 'operation' && step.operation?.type === 'LOOP' && step.operation.steps) {
        step.operation.steps[loopIndex] = {
          ...step.operation.steps[loopIndex],
          name: newName,
        };
      }
    } else {
      newSteps[parentIndex] = {
        ...newSteps[parentIndex],
        name: newName,
      };
    }

    setEditedTemplate({ ...editedTemplate, steps: newSteps });
  };

  const updateStepDescription = (parentIndex: number, newDescription: string, loopIndex?: number) => {
    const newSteps = [...editedTemplate.steps];

    if (loopIndex !== undefined) {
      const step = newSteps[parentIndex];
      if (step.type === 'operation' && step.operation?.type === 'LOOP' && step.operation.steps) {
        step.operation.steps[loopIndex] = {
          ...step.operation.steps[loopIndex],
          description: newDescription,
        };
      }
    } else {
      newSteps[parentIndex] = {
        ...newSteps[parentIndex],
        description: newDescription,
      };
    }

    setEditedTemplate({ ...editedTemplate, steps: newSteps });
  };

  const updateStepOutputVar = (parentIndex: number, newOutputVar: string, loopIndex?: number) => {
    const newSteps = [...editedTemplate.steps];

    if (loopIndex !== undefined) {
      const step = newSteps[parentIndex];
      if (step.type === 'operation' && step.operation?.type === 'LOOP' && step.operation.steps) {
        step.operation.steps[loopIndex] = {
          ...step.operation.steps[loopIndex],
          outputVar: newOutputVar,
        };
      }
    } else {
      if (newSteps[parentIndex].type === 'prompt') {
        newSteps[parentIndex] = {
          ...newSteps[parentIndex],
          outputVar: newOutputVar,
        };
      }
    }

    setEditedTemplate({ ...editedTemplate, steps: newSteps });
  };

  const addNewPrompt = () => {
    const newStep: UniversalStep = {
      id: `custom-prompt-${Date.now()}`,
      name: 'Novo Prompt',
      description: 'Descreva o que este prompt deve fazer',
      type: 'prompt',
      promptTemplate: 'Digite seu prompt aqui...\n\nVocê pode usar variáveis como:\n{{TITULO}}\n{{SINOPSE}}\n{{BASE_CONHECIMENTO}}',
      usesContext: true,
      outputVar: `CUSTOM_OUTPUT_${Date.now()}`,
      outputType: 'clean-text',
      validation: {
        isCleanText: true,
      },
    };

    setEditedTemplate({
      ...editedTemplate,
      steps: [...editedTemplate.steps, newStep],
    });

    // Expandir automaticamente o novo prompt
    const newIndex = editedTemplate.steps.filter(s => s.type === 'prompt').length;
    setExpandedSteps(new Set([...expandedSteps, newIndex]));
  };

  const removePrompt = (stepId: string) => {
    if (confirm('Tem certeza que deseja remover este prompt?')) {
      const newSteps = editedTemplate.steps.filter(s => s.id !== stepId);
      setEditedTemplate({ ...editedTemplate, steps: newSteps });
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(editedTemplate.steps);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setEditedTemplate({ ...editedTemplate, steps: items });
  };

  const insertVariable = (parentIndex: number, variable: string, loopIndex?: number) => {
    const newSteps = [...editedTemplate.steps];

    if (loopIndex !== undefined) {
      const step = newSteps[parentIndex];
      if (step.type === 'operation' && step.operation?.type === 'LOOP' && step.operation.steps) {
        const loopStep = step.operation.steps[loopIndex];
        if (loopStep.type === 'prompt' && loopStep.promptTemplate) {
          const currentPrompt = loopStep.promptTemplate || '';
          step.operation.steps[loopIndex] = {
            ...loopStep,
            promptTemplate: currentPrompt + `\n\n{{${variable}}}`,
          };
        }
      }
    } else {
      if (newSteps[parentIndex].type === 'prompt' && newSteps[parentIndex].promptTemplate) {
        const currentPrompt = newSteps[parentIndex].promptTemplate || '';
        newSteps[parentIndex] = {
          ...newSteps[parentIndex],
          promptTemplate: currentPrompt + `\n\n{{${variable}}}`,
        };
      }
    }

    setEditedTemplate({ ...editedTemplate, steps: newSteps });
  };

  // Coletar todas as variáveis de output disponíveis
  const getAvailableOutputVars = () => {
    const vars: string[] = [];
    promptSteps.forEach(({ step }) => {
      if (step.outputVar) {
        vars.push(step.outputVar);
      }
    });
    return vars;
  };

  const handleSave = () => {
    onSave(editedTemplate);
    onClose();
  };

  // Extrair todos os prompts editáveis (incluindo os de dentro de LOOPs)
  const getAllEditableSteps = () => {
    const steps: Array<{ step: UniversalStep; parentIndex?: number; loopIndex?: number }> = [];

    editedTemplate.steps.forEach((step, index) => {
      if (step.type === 'prompt') {
        steps.push({ step, parentIndex: index });
      } else if (step.type === 'operation' && step.operation?.type === 'LOOP') {
        // Adicionar os prompts de dentro do LOOP
        step.operation.steps?.forEach((loopStep, loopIndex) => {
          if (loopStep.type === 'prompt') {
            steps.push({ step: loopStep, parentIndex: index, loopIndex });
          }
        });
      }
    });

    return steps;
  };

  const promptSteps = getAllEditableSteps();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Edit className="text-indigo-600" />
              Editar Template: {editedTemplate.name}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Personalize os prompts enviados para a IA
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Campos de edição do Template */}
          <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            {/* Nome do Template */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                📝 Nome do Template:
              </label>
              <input
                type="text"
                value={editedTemplate.name}
                onChange={(e) => setEditedTemplate({ ...editedTemplate, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-900 dark:text-white"
                placeholder="Ex: Meu Roteiro Personalizado"
              />
            </div>
          </div>

          {/* Botão adicionar novo prompt */}
          <button
            type="button"
            onClick={addNewPrompt}
            className="w-full mb-4 p-3 border-2 border-dashed border-indigo-300 dark:border-indigo-700 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all flex items-center justify-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold"
          >
            <Plus size={20} />
            Adicionar Novo Prompt
          </button>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="prompts">
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`space-y-4 ${snapshot.isDraggingOver ? 'bg-indigo-50 dark:bg-indigo-900/10 rounded-lg p-2' : ''}`}
                >
                  {promptSteps.map(({ step, parentIndex, loopIndex }, index) => {
                    const isExpanded = expandedSteps.has(index);
                    const stepLabel = loopIndex !== undefined ? `${step.name} (Loop)` : step.name;

                    return (
                      <Draggable key={`${step.id}-${loopIndex ?? 'top'}`} draggableId={`${step.id}-${loopIndex ?? 'top'}`} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden transition-all ${
                              snapshot.isDragging ? 'shadow-2xl rotate-2 scale-105 bg-white dark:bg-gray-800' : ''
                            }`}
                          >
                            {/* Step Header */}
                            <div className="flex items-stretch">
                              {/* Drag Handle */}
                              <div
                                {...provided.dragHandleProps}
                                className="flex items-center justify-center px-3 bg-gray-100 dark:bg-gray-800 cursor-grab active:cursor-grabbing hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-all"
                                title="Arraste para reordenar"
                              >
                                <GripVertical size={20} className="text-gray-400 dark:text-gray-600" />
                              </div>

                              <button
                                type="button"
                                onClick={() => toggleStep(index)}
                                className="flex-1 p-4 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all flex items-center justify-between"
                              >
                                <div className="flex items-center gap-3">
                                  {isExpanded ? <EyeOff size={18} /> : <Eye size={18} />}
                                  <div className="text-left">
                                    <div className="font-semibold flex items-center gap-2">
                                      <span>{index + 1}. {step.name}</span>
                                      {loopIndex !== undefined && (
                                        <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded font-normal">
                                          🔁 LOOP - Executado para cada tópico
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">
                                      {step.description}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {step.outputVar && (
                                    <div className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded font-mono">
                                      {step.outputVar}
                                    </div>
                                  )}
                                  <div className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded">
                                    {step.promptTemplate?.length || 0} chars
                                  </div>
                                </div>
                              </button>

                              {/* Botão de remover */}
                              <button
                                type="button"
                                onClick={() => removePrompt(step.id)}
                                className="px-3 bg-gray-100 dark:bg-gray-800 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-all"
                                title="Remover prompt"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>

                            {/* Step Content (Prompt Editável) */}
                            {isExpanded && step.promptTemplate && (
                              <div className="p-4 bg-white dark:bg-gray-800 space-y-3">
                                {/* Nome do Prompt / Variável de Output */}
                                <div>
                                  <label className="block text-sm font-semibold mb-1">
                                    💾 Nome do Prompt / Variável:
                                  </label>
                                  <input
                                    type="text"
                                    value={step.outputVar || ''}
                                    onChange={(e) => {
                                      updateStepOutputVar(parentIndex!, e.target.value, loopIndex);
                                      updateStepName(parentIndex!, e.target.value, loopIndex);
                                    }}
                                    className="w-full px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500 dark:bg-gray-900 dark:text-white"
                                    placeholder="Ex: ESTRUTURA, HOOK, TOPICO_1"
                                  />
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Identifica o prompt e salva a resposta da IA nesta variável
                                  </p>
                                </div>

                                {/* Prompt Template */}
                                <div>
                                  <label className="block text-sm font-semibold mb-1">
                                    Prompt Template:
                                  </label>
                                  <textarea
                                    value={step.promptTemplate}
                                    onChange={(e) => {
                                      updateStepPrompt(parentIndex!, e.target.value, loopIndex);
                                    }}
                                    className="w-full h-32 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-xs focus:ring-2 focus:ring-indigo-500 dark:bg-gray-900 dark:text-white resize-y"
                                    placeholder="Digite o prompt aqui..."
                                  />
                                </div>

                                {/* Dicas de Variáveis */}
                                <div className="space-y-3">
                                  {/* Variáveis do Usuário */}
                                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-2">
                                      💡 Variáveis do usuário (preenchidas no formulário):
                                    </p>
                                    <div className="grid grid-cols-2 gap-2 text-xs text-blue-700 dark:text-blue-400">
                                      <code>{'{{TITULO}}'}</code>
                                      <code>{'{{SINOPSE}}'}</code>
                                      <code>{'{{BASE_CONHECIMENTO}}'}</code>
                                      <code>{'{{NUM_TOPICOS}}'}</code>
                                      <code>{'{{NUM_SUBTOPICOS}}'}</code>
                                      <code>{'{{IDIOMA}}'}</code>
                                      <code>{'{{CARACTERES_TOTAIS}}'}</code>
                                      <code>{'{{CARACTERES_POR_TOPICO}}'}</code>
                                      <code>{'{{TOPICO_NUM}}'}</code>
                                      <code>{'{{TOPICO_ESTRUTURA}}'}</code>
                                    </div>
                                  </div>

                                  {/* Variáveis de Memória (AI Responses) */}
                                  {getAvailableOutputVars().length > 0 && (
                                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                      <p className="text-xs font-semibold text-green-800 dark:text-green-300 mb-2">
                                        💾 Memória (respostas da IA armazenadas):
                                      </p>
                                      <div className="flex flex-wrap gap-2">
                                        {getAvailableOutputVars().map((varName) => (
                                          <button
                                            key={varName}
                                            type="button"
                                            onClick={() => {
                                              insertVariable(parentIndex!, varName, loopIndex);
                                            }}
                                            className="text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-2 py-1 rounded font-mono hover:bg-green-200 dark:hover:bg-green-900/60 transition-all"
                                            title={`Clique para inserir {{${varName}}} no prompt`}
                                          >
                                            {`{{${varName}}}`}
                                          </button>
                                        ))}
                                      </div>
                                      <p className="text-xs text-green-700 dark:text-green-400 mt-2">
                                        ✨ Clique em uma variável para inseri-la no prompt acima
                                      </p>
                                    </div>
                                  )}
                                </div>

                                {/* Validação */}
                                {step.validation && (
                                  <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                    <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-300 mb-1">
                                      ⚙️ Validação:
                                    </p>
                                    <div className="text-xs text-yellow-700 dark:text-yellow-400">
                                      {step.validation.minChars && (
                                        <div>Mínimo: {step.validation.minChars} caracteres</div>
                                      )}
                                      {step.validation.maxChars && (
                                        <div>Máximo: {step.validation.maxChars} caracteres</div>
                                      )}
                                      {step.validation.isCleanText && (
                                        <div>✅ Texto limpo (sem markdown)</div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
          <button
            onClick={handleSave}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <Save size={20} />
            Salvar Alterações
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
