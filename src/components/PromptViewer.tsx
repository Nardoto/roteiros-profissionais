'use client';

import { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Edit, Save, AlertCircle, Code, BookOpen, FileText, Music, Users, Type } from 'lucide-react';
import { ScriptInput } from '@/types';
import {
  buildRoteiroPrompt,
  buildTrilhaPrompt,
  buildTextoNarradoHookPrompt,
  buildTextoNarradoAtoPrompt,
  buildTextoNarradoConclusaoPrompt,
  buildPersonagensPrompt,
  buildTituloPrompt
} from '@/lib/prompts';
import {
  buildEstruturaPrompt,
  buildHookPrompt,
  buildTopicoPrompt,
  buildConclusaoPrompt
} from '@/lib/prompts-historia';

interface PromptViewerProps {
  isOpen: boolean;
  onClose: () => void;
  scriptInput: ScriptInput | null;
  customPrompts?: Record<string, string>;
  onCustomPromptsChange?: (prompts: Record<string, string>) => void;
}

interface PromptSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  getPrompt: (input: ScriptInput) => string;
  color: string;
}

export default function PromptViewer({
  isOpen,
  onClose,
  scriptInput,
  customPrompts = {},
  onCustomPromptsChange
}: PromptViewerProps) {
  const [selectedSection, setSelectedSection] = useState<string>('roteiro');
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState('');
  const [showRawPrompt, setShowRawPrompt] = useState(false);

  // Criar um input de exemplo se não houver
  const exampleInput: ScriptInput = scriptInput || {
    title: 'A História de Davi e Golias',
    synopsis: 'A história de como um jovem pastor derrotou um gigante com fé e coragem.',
    knowledgeBase: '',
    apiKeys: { gemini: ['exemplo'], groq: [], cohere: [], huggingface: [] },
    mode: 'documentary',
    selectedApi: { provider: 'gemini', label: 'Google Gemini' },
    language: 'pt'
  };

  // Exemplo de roteiro para usar quando necessário
  const exampleRoteiro = `HOOK (0:00-2:30)
Abertura impactante sobre o tema

ATO I - INTRODUÇÃO (2:30-20:00)
Desenvolvimento inicial da história

ATO II - DESENVOLVIMENTO (20:00-40:00)
Conflito e desenvolvimento principal

ATO III - CONCLUSÃO (40:00-55:00)
Resolução e mensagem final`;

  // Exemplo de estrutura para história
  const exampleEstrutura = `TÓPICO 1: O Início
- Subtópico 1.1: Contexto
- Subtópico 1.2: Personagem
...8 subtópicos no total

TÓPICO 2: O Desenvolvimento
- Subtópico 2.1: Conflito
...8 subtópicos no total

TÓPICO 3: A Conclusão
- Subtópico 3.1: Resolução
...8 subtópicos no total`;

  // Definir as seções de prompts baseadas no modo
  const isStoryMode = exampleInput.mode === 'story';

  const promptSections: PromptSection[] = isStoryMode ? [
    // MODO HISTÓRIA - Prompts específicos para história
    {
      id: 'estrutura',
      title: '1. Estrutura da História',
      icon: <Users className="w-5 h-5" />,
      description: '📖 História COMPLETA em 3 tópicos com 8 subtópicos cada (24 total). Meta: 100.000 caracteres no TOTAL (33k por tópico).',
      getPrompt: (input) => buildEstruturaPrompt(input, input.language || 'pt'),
      color: 'secondary'
    },
    {
      id: 'hook',
      title: '2. Hook da História',
      icon: <BookOpen className="w-5 h-5" />,
      description: '🎯 Abertura impactante que prende a atenção através da perspectiva do personagem.',
      getPrompt: (input) => buildHookPrompt(input, exampleEstrutura, input.language || 'pt'),
      color: 'green'
    },
    {
      id: 'topico',
      title: '3. Desenvolvimento do Tópico',
      icon: <FileText className="w-5 h-5" />,
      description: '📝 Cada tópico desenvolvido com ~33.000 caracteres através da narrativa pessoal.',
      getPrompt: (input) => buildTopicoPrompt(
        1,
        'O Início',
        ['Subtópico 1', 'Subtópico 2', 'Subtópico 3', 'Subtópico 4', 'Subtópico 5', 'Subtópico 6', 'Subtópico 7', 'Subtópico 8'],
        input,
        input.language || 'pt',
        []
      ),
      color: 'blue'
    },
    {
      id: 'conclusao',
      title: '4. Conclusão da História',
      icon: <Type className="w-5 h-5" />,
      description: '✍️ Fechamento emocionante com lições e aplicações práticas.',
      getPrompt: (input) => buildConclusaoPrompt(input, input.language || 'pt'),
      color: 'pink'
    }
  ] : [
    // MODO DOCUMENTÁRIO - Prompts tradicionais
    {
      id: 'roteiro',
      title: '1. Roteiro do Documentário',
      icon: <FileText className="w-5 h-5" />,
      description: '🎬 Estrutura investigativa com Hook + 3 Atos + Conclusão. Foco em fatos, contexto histórico e curiosidades.',
      getPrompt: buildRoteiroPrompt,
      color: 'blue'
    },
    {
      id: 'trilha',
      title: '2. Trilha Sonora',
      icon: <Music className="w-5 h-5" />,
      description: '🎵 Sugestões de músicas épicas e efeitos sonoros para cada parte do documentário.',
      getPrompt: (input) => buildTrilhaPrompt(exampleRoteiro, input),
      color: 'purple'
    },
    {
      id: 'hook',
      title: '3.1 Texto Narrado - Hook',
      icon: <BookOpen className="w-5 h-5" />,
      description: 'A abertura do vídeo que deve prender a atenção nos primeiros segundos.',
      getPrompt: (input) => buildTextoNarradoHookPrompt(exampleRoteiro, input, input.language || 'pt'),
      color: 'green'
    },
    {
      id: 'ato',
      title: '3.2 Texto Narrado - Atos',
      icon: <BookOpen className="w-5 h-5" />,
      description: 'O desenvolvimento da história dividido em 3 atos principais.',
      getPrompt: (input) => buildTextoNarradoAtoPrompt(exampleRoteiro, 1, 'Exemplo', '10:00-20:00', input.language === 'es' ? 'es' : 'en'),
      color: 'green'
    },
    {
      id: 'conclusao',
      title: '3.3 Texto Narrado - Conclusão',
      icon: <BookOpen className="w-5 h-5" />,
      description: 'O fechamento do vídeo com call-to-action.',
      getPrompt: (input) => buildTextoNarradoConclusaoPrompt(exampleRoteiro, input.language === 'es' ? 'es' : 'en'),
      color: 'green'
    },
    {
      id: 'personagens',
      title: '4. Personagens',
      icon: <Users className="w-5 h-5" />,
      description: 'Lista detalhada de todos os personagens com suas características e papéis.',
      getPrompt: (input) => buildPersonagensPrompt(exampleRoteiro, input),
      color: 'orange'
    },
    {
      id: 'titulo',
      title: '5. Título e SEO',
      icon: <Type className="w-5 h-5" />,
      description: 'Título otimizado para YouTube, descrição e tags para melhor alcance.',
      getPrompt: (input) => buildTituloPrompt(exampleRoteiro, input, input.language === 'es' ? 'es' : 'en'),
      color: 'pink'
    }
  ];

  const currentSection = promptSections.find(s => s.id === selectedSection) || promptSections[0];

  // Obter o prompt atual
  const getCurrentPrompt = () => {
    if (customPrompts[selectedSection]) {
      return customPrompts[selectedSection];
    }
    return currentSection.getPrompt(exampleInput);
  };

  // Salvar edição
  const handleSaveEdit = () => {
    if (onCustomPromptsChange) {
      onCustomPromptsChange({
        ...customPrompts,
        [selectedSection]: editedPrompt
      });
    }
    setIsEditing(false);
  };

  // Resetar para o prompt original
  const handleReset = () => {
    if (onCustomPromptsChange) {
      const newCustomPrompts = { ...customPrompts };
      delete newCustomPrompts[selectedSection];
      onCustomPromptsChange(newCustomPrompts);
    }
    setEditedPrompt('');
    setIsEditing(false);
  };

  useEffect(() => {
    setEditedPrompt(getCurrentPrompt());
  }, [selectedSection]);

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
          <div className="w-full max-w-6xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl transform transition-all duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Code className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Visualizar Prompts da IA
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    100% transparência - veja exatamente o que a IA recebe
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Indicador do modo atual */}
                <div className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                  exampleInput.mode === 'story'
                    ? 'bg-secondary/10 text-secondary'
                    : 'bg-primary/10 text-primary'
                }`}>
                  {exampleInput.mode === 'story' ? '👤 História' : '🎬 Documentário'}
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Mode Banner - DESTAQUE PRINCIPAL */}
            <div className={`p-4 ${isStoryMode ? 'bg-gradient-to-r from-secondary/20 to-pink-100 dark:from-secondary/30 dark:to-pink-900/20' : 'bg-gradient-to-r from-primary/20 to-blue-100 dark:from-primary/30 dark:to-blue-900/20'} border-b border-gray-200 dark:border-gray-700`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 ${isStoryMode ? 'bg-secondary/20' : 'bg-primary/20'} rounded-lg`}>
                    {isStoryMode ? <Users className="w-8 h-8 text-secondary" /> : <FileText className="w-8 h-8 text-primary" />}
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${isStoryMode ? 'text-secondary' : 'text-primary'}`}>
                      {isStoryMode ? '👤 MODO: HISTÓRIA DE PERSONAGEM' : '🎬 MODO: DOCUMENTÁRIO'}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {isStoryMode
                        ? 'Narrativa pessoal através dos olhos do personagem bíblico - 100.000 caracteres no total'
                        : 'Estilo investigativo com fatos, curiosidades e contexto histórico - 8.500+ palavras'}
                    </p>
                  </div>
                </div>
                <div className={`px-4 py-2 ${isStoryMode ? 'bg-secondary/10 border-secondary' : 'bg-primary/10 border-primary'} border-2 rounded-lg`}>
                  <p className="text-xs font-semibold uppercase">
                    {isStoryMode ? 'História Completa' : 'Documentário'}
                  </p>
                  <p className="text-lg font-bold">
                    {isStoryMode ? '3 Tópicos × 8 Subtópicos' : 'Hook + 3 Atos'}
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex h-[65vh]">
              {/* Sidebar */}
              <div className="w-80 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  {isStoryMode ? '📚 Arquivos da História' : '📁 Arquivos do Documentário'}
                </h3>
                <div className="space-y-2">
                  {promptSections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setSelectedSection(section.id)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        selectedSection === section.id
                          ? 'bg-primary/10 border-l-4 border-primary'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`text-${section.color}-500`}>
                          {section.icon}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">
                            {section.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {section.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 p-6 overflow-y-auto">
                {/* Header do Prompt */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {currentSection.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowRawPrompt(!showRawPrompt)}
                        className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                      >
                        {showRawPrompt ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {showRawPrompt ? 'Visualização Amigável' : 'Ver Prompt Raw'}
                      </button>
                      {!isEditing ? (
                        <button
                          onClick={() => {
                            setIsEditing(true);
                            setEditedPrompt(getCurrentPrompt());
                          }}
                          className="px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Personalizar
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleSaveEdit}
                            className="px-3 py-1.5 text-sm bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition-colors flex items-center gap-2"
                          >
                            <Save className="w-4 h-4" />
                            Salvar
                          </button>
                          <button
                            onClick={() => setIsEditing(false)}
                            className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                          >
                            Cancelar
                          </button>
                          {customPrompts[selectedSection] && (
                            <button
                              onClick={handleReset}
                              className="px-3 py-1.5 text-sm bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                            >
                              Resetar
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-800 dark:text-blue-300">
                        <p className="font-semibold mb-1">Como funciona:</p>
                        <p>{currentSection.description}</p>
                        {customPrompts[selectedSection] && (
                          <p className="mt-2 text-yellow-700 dark:text-yellow-400">
                            ⚠️ Este prompt foi personalizado. Clique em "Resetar" para voltar ao original.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Área do Prompt */}
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Editar Prompt
                      </label>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {editedPrompt.length} caracteres
                      </span>
                    </div>
                    <textarea
                      value={editedPrompt}
                      onChange={(e) => setEditedPrompt(e.target.value)}
                      className="w-full h-[400px] p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white font-mono text-sm"
                      placeholder="Digite ou cole seu prompt personalizado aqui..."
                    />
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <p className="text-xs text-yellow-800 dark:text-yellow-300">
                        <strong>⚠️ Atenção:</strong> Modificar os prompts pode afetar a qualidade e formato do resultado.
                        Recomendamos manter a estrutura básica e apenas ajustar detalhes específicos.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className={`p-4 bg-gray-50 dark:bg-gray-800 rounded-lg ${showRawPrompt ? 'font-mono text-sm' : ''}`}>
                    {showRawPrompt ? (
                      <pre className="whitespace-pre-wrap break-words text-gray-700 dark:text-gray-300">
                        {getCurrentPrompt()}
                      </pre>
                    ) : (
                      <div className="space-y-4 text-gray-700 dark:text-gray-300">
                        {/* Visualização amigável do prompt */}
                        <div>
                          <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">
                            📝 O que a IA vai fazer:
                          </h4>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                              <span className="text-green-500">✓</span>
                              <span>Analisar o título: "{exampleInput.title || 'Seu título aqui'}"</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-green-500">✓</span>
                              <span>Considerar a sinopse fornecida</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-green-500">✓</span>
                              <span>Gerar conteúdo no formato: {exampleInput.mode === 'documentary' ? 'Documentário' : 'História de Personagem'}</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-green-500">✓</span>
                              <span>Idioma: {exampleInput.language === 'pt' ? 'Português' : exampleInput.language === 'en' ? 'Inglês' : 'Espanhol'}</span>
                            </li>
                          </ul>
                        </div>

                        {exampleInput.mode === 'story' ? (
                          <div className="p-4 bg-secondary/10 rounded-lg border border-secondary/30">
                            <h4 className="font-semibold mb-2 text-secondary">
                              👤 Modo História de Personagem:
                            </h4>
                            <p className="text-sm mb-2">
                              Neste modo, a IA conta a história através dos olhos de um personagem bíblico específico:
                            </p>
                            <ul className="space-y-1 text-sm">
                              <li>• Narrativa em primeira pessoa ou perspectiva próxima</li>
                              <li>• Foco nas emoções e experiências do personagem</li>
                              <li>• Desenvolvimento psicológico e espiritual</li>
                              <li>• Lições pessoais e aplicações práticas</li>
                            </ul>
                          </div>
                        ) : (
                          <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
                            <h4 className="font-semibold mb-2 text-primary">
                              🎬 Modo Documentário:
                            </h4>
                            <p className="text-sm mb-2">
                              Estilo investigativo com abordagem educativa:
                            </p>
                            <ul className="space-y-1 text-sm">
                              <li>• Contexto histórico e arqueológico</li>
                              <li>• Fatos e curiosidades</li>
                              <li>• Múltiplas perspectivas</li>
                              <li>• Análise objetiva dos eventos</li>
                            </ul>
                          </div>
                        )}

                        <div>
                          <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">
                            🎯 Formato esperado:
                          </h4>
                          <p className="text-sm">
                            A IA irá gerar um {currentSection.title.toLowerCase()} completo e profissional,
                            seguindo as melhores práticas para vídeos do YouTube com duração de aproximadamente 55 minutos.
                          </p>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">
                            ⚙️ Configurações técnicas:
                          </h4>
                          <ul className="space-y-1 text-sm">
                            <li>• Meta de palavras: ~8.500+ palavras no total</li>
                            <li>• Divisão: Hook + 3 Atos + Conclusão</li>
                            <li>• Tom: {exampleInput.mode === 'story' ? 'Pessoal e envolvente' : 'Conversacional mas informativo'}</li>
                            <li>• Foco: Engajamento e retenção de audiência</li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <p>💡 Dica: Você pode personalizar os prompts para ajustar o estilo e tom do conteúdo gerado.</p>
                </div>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors font-semibold"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}