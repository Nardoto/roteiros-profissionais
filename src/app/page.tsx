'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Download, FileText, Clock } from 'lucide-react';
import ConversationalInputForm from '@/components/ConversationalInputForm';
import ConversationView from '@/components/ConversationView';
import { ConversationalInput, ConversationMessage, Conversation } from '@/types/conversation';
import { calculateVideoTime } from '@/lib/time-calculator';

export default function Home() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [completedConversation, setCompletedConversation] = useState<Conversation | null>(null);
  const [progress, setProgress] = useState(0);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [lastInput, setLastInput] = useState<ConversationalInput | null>(null);
  const [isCancelled, setIsCancelled] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);

  // Timer para mostrar tempo decorrido
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isGenerating) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGenerating, startTime]);

  const handleGenerate = async (input: ConversationalInput, resume: boolean = false) => {
    setIsGenerating(true);
    setIsCancelled(false);
    setStartTime(Date.now());
    setElapsedTime(0);

    // Se não está retomando, limpar estado anterior
    if (!resume) {
      setMessages([]);
      setCompletedConversation(null);
      setProgress(0);
    }

    setLastInput(input);

    // Criar AbortController para poder cancelar
    const controller = new AbortController();
    setAbortController(controller);

    try {
      const response = await fetch('/api/generate-universal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...input,
          resumeFrom: resume && completedConversation ? completedConversation : undefined,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error('Erro ao gerar roteiro conversacional');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Não foi possível ler a resposta');
      }

      let buffer = ''; // Buffer para acumular chunks incompletos

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        // Adicionar novo chunk ao buffer
        buffer += decoder.decode(value, { stream: true });

        // Processar apenas linhas completas (terminadas com \n)
        const lines = buffer.split('\n');

        // Última linha pode estar incompleta, manter no buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === 'message') {
                // Nova mensagem
                setMessages((prev) => [...prev, data.message]);
                setCurrentStep(data.currentStep || '');
                setProgress(data.progress || 0);
                console.log('📨 Mensagem recebida:', data.currentStep, `${data.progress}%`);
              } else if (data.type === 'complete') {
                // Concluído
                console.log('✅ EVENTO COMPLETE RECEBIDO!', data.conversation);

                // Convert ISO strings back to Date objects
                const conversation = {
                  ...data.conversation,
                  createdAt: new Date(data.conversation.createdAt),
                  messages: data.conversation.messages.map((m: any) => ({
                    ...m,
                    timestamp: new Date(m.timestamp),
                  })),
                };

                setCompletedConversation(conversation);
                setIsGenerating(false);
                setProgress(100);
              } else if (data.type === 'error') {
                console.error('❌ Erro:', data.error);
                alert(`Erro: ${data.error}`);
                setIsGenerating(false);
              } else {
                console.warn('⚠️ Evento desconhecido:', data.type, data);
              }
            } catch (parseError) {
              console.error('❌ Erro ao fazer parse do SSE:', parseError);
              console.error('Linha problemática:', line);
            }
          }
        }
      }
    } catch (err: any) {
      // Se foi cancelado pelo usuário, não mostrar erro
      if (err.name === 'AbortError') {
        console.log('Geração cancelada pelo usuário');
        setIsCancelled(true);
        setIsGenerating(false);
        return;
      }

      console.error('Erro:', err);
      alert(`Erro: ${err.message}`);
      setIsGenerating(false);
    }
  };

  // Função para cancelar a geração
  const handleCancel = () => {
    if (abortController) {
      abortController.abort();
      setIsGenerating(false);
      setIsCancelled(true);
    }
  };

  // Função para continuar de onde parou
  const handleResume = () => {
    if (lastInput) {
      handleGenerate(lastInput, true);
    }
  };

  // Download de arquivo
  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <MessageSquare size={32} className="text-gray-900 dark:text-gray-100" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
              Gerador Conversacional
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm max-w-2xl mx-auto">
            Sistema que simula o uso manual do Claude • Usa contexto conversacional • Templates personalizáveis
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Coluna Esquerda: Input Form */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <FileText className="text-gray-700 dark:text-gray-300" size={24} />
              Configuração
            </h2>
            <ConversationalInputForm onSubmit={handleGenerate} isGenerating={isGenerating} />
          </div>

          {/* Coluna Direita: Conversa + Downloads */}
          <div className="space-y-6">
            {/* Progress */}
            {(isGenerating || completedConversation || isCancelled) && (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {isGenerating ? 'Gerando...' : isCancelled ? '⏸️ Pausado' : '✓ Concluído'}
                    </span>
                    {isGenerating && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Clock size={12} />
                        {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{Math.round(progress)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gray-900 dark:bg-gray-100 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Botões de controle */}
                {isGenerating && (
                  <button
                    onClick={handleCancel}
                    className="mt-3 w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    ⏹️ Cancelar Geração
                  </button>
                )}

                {isCancelled && !isGenerating && (
                  <button
                    onClick={handleResume}
                    className="mt-3 w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    ▶️ Continuar de Onde Parou
                  </button>
                )}
              </div>
            )}

            {/* Conversa */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-800">
              <ConversationView
                messages={messages}
                currentStep={currentStep}
                isGenerating={isGenerating}
              />
            </div>

            {/* Downloads */}
            {completedConversation && (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-800">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <Download className="text-gray-700 dark:text-gray-300" size={24} />
                  Arquivos Gerados
                </h2>

                <div className="space-y-3">
                  {/* Roteiro Completo (PRINCIPAL - TTS-ready) */}
                  <button
                    onClick={() => {
                      const fullScript = completedConversation.generatedFiles.hook || '';
                      downloadFile('01_Roteiro_Completo.txt', fullScript);
                    }}
                    className="w-full px-4 py-3 bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-gray-900 rounded-lg transition-all flex items-center justify-between font-bold"
                  >
                    <span>📝 Roteiro Completo (TTS-ready)</span>
                    <Download size={18} />
                  </button>

                  {/* Estrutura (Referência) */}
                  {completedConversation.generatedFiles.estrutura && (
                    <button
                      onClick={() =>
                        downloadFile(
                          '00_Estrutura.txt',
                          completedConversation.generatedFiles.estrutura!
                        )
                      }
                      className="w-full px-4 py-3 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-all flex items-center justify-between"
                    >
                      <span className="font-medium">📋 Estrutura (Referência)</span>
                      <Download size={18} />
                    </button>
                  )}

                  {/* Personagens */}
                  {completedConversation.generatedFiles.personagens && (
                    <button
                      onClick={() =>
                        downloadFile('04_Personagens.txt', completedConversation.generatedFiles.personagens!)
                      }
                      className="w-full px-4 py-3 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-all flex items-center justify-between"
                    >
                      <span className="font-medium">👥 Personagens</span>
                      <Download size={18} />
                    </button>
                  )}

                  {/* Trilha Sonora */}
                  {completedConversation.generatedFiles.trilha && (
                    <button
                      onClick={() =>
                        downloadFile('05_Trilha_Sonora.txt', completedConversation.generatedFiles.trilha!)
                      }
                      className="w-full px-4 py-3 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-all flex items-center justify-between"
                    >
                      <span className="font-medium">🎵 Trilha Sonora</span>
                      <Download size={18} />
                    </button>
                  )}

                  {/* Takes/Divisão de Cenas */}
                  {completedConversation.generatedFiles.takes && (
                    <button
                      onClick={() =>
                        downloadFile('06_Takes_Divisao_Cenas.txt', completedConversation.generatedFiles.takes!)
                      }
                      className="w-full px-4 py-3 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-all flex items-center justify-between"
                    >
                      <span className="font-medium">🎬 Takes/Divisão</span>
                      <Download size={18} />
                    </button>
                  )}

                  {/* Separador */}
                  <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>

                  {/* Baixar Tudo em JSON */}
                  <button
                    onClick={() => {
                      const exportData = {
                        version: '1.0',
                        exportedAt: new Date().toISOString(),
                        conversation: {
                          id: completedConversation.id,
                          templateId: completedConversation.templateId,
                          createdAt: completedConversation.createdAt,
                          status: completedConversation.status,
                          stats: completedConversation.stats,
                        },
                        files: {
                          estrutura: completedConversation.generatedFiles.estrutura || null,
                          hook: completedConversation.generatedFiles.hook || null,
                          topicos: completedConversation.generatedFiles.topicos || [],
                          personagens: completedConversation.generatedFiles.personagens || null,
                          trilha: completedConversation.generatedFiles.trilha || null,
                          takes: completedConversation.generatedFiles.takes || null,
                          roteiroCompleto: [
                            completedConversation.generatedFiles.hook || '',
                            ...(completedConversation.generatedFiles.topicos || []),
                          ].join('\n\n'),
                        },
                        messages: completedConversation.messages.map(m => ({
                          id: m.id,
                          role: m.role,
                          content: m.content,
                          timestamp: m.timestamp,
                          stepId: m.stepId,
                          chars: m.chars,
                          tokens: m.tokens,
                        })),
                      };

                      const jsonString = JSON.stringify(exportData, null, 2);
                      downloadFile(`Roteiro_${completedConversation.id}_Export.json`, jsonString);
                    }}
                    className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 text-white rounded-lg transition-all flex items-center justify-between font-bold"
                  >
                    <span>📦 Baixar Tudo (JSON)</span>
                    <Download size={18} />
                  </button>

                  {/* Baixar Tudo em TXT Formatado */}
                  <button
                    onClick={() => {
                      const sections = [];

                      sections.push('═══════════════════════════════════════════════════════════');
                      sections.push('  ROTEIRO COMPLETO - PACOTE DE ARQUIVOS');
                      sections.push('═══════════════════════════════════════════════════════════');
                      sections.push(`Gerado em: ${new Date().toLocaleString('pt-BR')}`);
                      sections.push(`Template: ${completedConversation.templateId}`);
                      sections.push(`ID da Conversa: ${completedConversation.id}`);
                      sections.push('');

                      sections.push('───────────────────────────────────────────────────────────');
                      sections.push('📊 ESTATÍSTICAS');
                      sections.push('───────────────────────────────────────────────────────────');
                      sections.push(`Mensagens trocadas: ${completedConversation.messages.length}`);
                      sections.push(`Total de caracteres: ${completedConversation.stats.totalChars.toLocaleString()}`);
                      sections.push(`Duração: ${Math.floor(completedConversation.stats.duration / 60)}min ${completedConversation.stats.duration % 60}s`);
                      const videoTime = calculateVideoTime(completedConversation.stats.totalChars);
                      sections.push(`Tempo estimado do vídeo: ${videoTime.medium.duration}`);
                      sections.push('');

                      if (completedConversation.generatedFiles.estrutura) {
                        sections.push('═══════════════════════════════════════════════════════════');
                        sections.push('📋 01 - ESTRUTURA DO ROTEIRO');
                        sections.push('═══════════════════════════════════════════════════════════');
                        sections.push('');
                        sections.push(completedConversation.generatedFiles.estrutura);
                        sections.push('');
                        sections.push('');
                      }

                      if (completedConversation.generatedFiles.hook) {
                        sections.push('═══════════════════════════════════════════════════════════');
                        sections.push('🎬 02 - HOOK / INTRODUÇÃO');
                        sections.push('═══════════════════════════════════════════════════════════');
                        sections.push('');
                        sections.push(completedConversation.generatedFiles.hook);
                        sections.push('');
                        sections.push('');
                      }

                      if (completedConversation.generatedFiles.topicos) {
                        completedConversation.generatedFiles.topicos.forEach((topico, idx) => {
                          sections.push('═══════════════════════════════════════════════════════════');
                          sections.push(`📖 ${String(idx + 3).padStart(2, '0')} - TÓPICO ${idx + 1}`);
                          sections.push('═══════════════════════════════════════════════════════════');
                          sections.push('');
                          sections.push(topico);
                          sections.push('');
                          sections.push('');
                        });
                      }

                      if (completedConversation.generatedFiles.personagens) {
                        sections.push('═══════════════════════════════════════════════════════════');
                        sections.push('👥 PERSONAGENS');
                        sections.push('═══════════════════════════════════════════════════════════');
                        sections.push('');
                        sections.push(completedConversation.generatedFiles.personagens);
                        sections.push('');
                        sections.push('');
                      }

                      if (completedConversation.generatedFiles.trilha) {
                        sections.push('═══════════════════════════════════════════════════════════');
                        sections.push('🎵 TRILHA SONORA');
                        sections.push('═══════════════════════════════════════════════════════════');
                        sections.push('');
                        sections.push(completedConversation.generatedFiles.trilha);
                        sections.push('');
                        sections.push('');
                      }

                      if (completedConversation.generatedFiles.takes) {
                        sections.push('═══════════════════════════════════════════════════════════');
                        sections.push('🎬 TAKES / DIVISÃO DE CENAS');
                        sections.push('═══════════════════════════════════════════════════════════');
                        sections.push('');
                        sections.push(completedConversation.generatedFiles.takes);
                        sections.push('');
                        sections.push('');
                      }

                      const fullPackage = sections.join('\n');
                      downloadFile(`Roteiro_Completo_${completedConversation.id}_Pacote.txt`, fullPackage);
                    }}
                    className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 text-white rounded-lg transition-all flex items-center justify-between font-bold"
                  >
                    <span>📄 Baixar Tudo (TXT Formatado)</span>
                    <Download size={18} />
                  </button>
                </div>

                {/* Exportar Prompts como Template */}
                <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700">
                  <h3 className="font-semibold mb-2 text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    ⚙️ Criar Template Customizado
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                    Exporte os prompts usados nesta geração para criar seu próprio template de roteiro
                  </p>
                  <button
                    onClick={() => {
                      // Filtrar apenas mensagens do usuário (prompts enviados)
                      const userMessages = completedConversation.messages.filter(m => m.role === 'user');

                      const templateContent = [
                        '# TEMPLATE DE ROTEIRO CUSTOMIZADO',
                        `# Gerado em: ${new Date().toLocaleString('pt-BR')}`,
                        `# Template original: ${completedConversation.templateId}`,
                        '',
                        '## 📚 COMO USAR ESTE TEMPLATE',
                        '## 1. Edite os prompts abaixo conforme necessário',
                        '## 2. Mantenha as variáveis {{NOME_VARIAVEL}} para serem substituídas automaticamente',
                        '## 3. Salve este arquivo e use como referência para futuros roteiros',
                        '## 4. Você pode adicionar/remover steps conforme sua necessidade',
                        '',
                        '## 🔧 VARIÁVEIS DISPONÍVEIS:',
                        '## - {{TITULO}} - Título do vídeo',
                        '## - {{SINOPSE}} - Sinopse/descrição',
                        '## - {{BASE_CONHECIMENTO}} - Informações extras',
                        '## - {{NUM_TOPICOS}} - Quantidade de tópicos',
                        '## - {{NUM_SUBTOPICOS}} - Subtópicos por tópico',
                        '## - {{IDIOMA}} - Idioma (pt, en, es)',
                        '## - {{CARACTERES_TOTAIS}} - Total de caracteres',
                        '## - {{CARACTERES_POR_TOPICO}} - Caracteres por tópico',
                        '## - {{CARACTERES_HOOK}} - Caracteres do hook',
                        '## - {{TOPICO_NUM}} - Número do tópico atual',
                        '## - {{TOPICO_ESTRUTURA}} - Estrutura do tópico',
                        '',
                        '---',
                        '',
                        '## 📋 PROMPTS ENVIADOS',
                        '',
                        ...userMessages.map((msg, idx) => {
                          return [
                            `### ${idx + 1}. STEP: ${msg.stepId?.toUpperCase() || 'DESCONHECIDO'}`,
                            `**Timestamp:** ${new Date(msg.timestamp).toLocaleString('pt-BR')}`,
                            `**Tamanho:** ${msg.content.length} caracteres`,
                            '',
                            '#### Prompt:',
                            '```',
                            msg.content,
                            '```',
                            '',
                            '---',
                            ''
                          ].join('\n');
                        }),
                        '',
                        '## 💡 DICAS PARA EDIÇÃO:',
                        '## - Para roteiros mais longos, aumente {{CARACTERES_POR_TOPICO}}',
                        '## - Para mais detalhes, aumente {{NUM_SUBTOPICOS}}',
                        '## - Mantenha a linguagem consistente em todos os prompts',
                        '## - Teste alterações pequenas primeiro antes de grandes mudanças',
                        '',
                        `## 📊 ESTATÍSTICAS DESTA GERAÇÃO:`,
                        `## - Total de prompts: ${userMessages.length}`,
                        `## - Mensagens totais: ${completedConversation.messages.length}`,
                        `## - Caracteres gerados: ${completedConversation.stats.totalChars.toLocaleString()}`,
                        `## - Duração: ${Math.floor(completedConversation.stats.duration / 60)}min ${completedConversation.stats.duration % 60}s`,
                      ].join('\n');

                      downloadFile('TEMPLATE_Customizado.md', templateContent);
                    }}
                    className="w-full px-4 py-3 bg-gray-600 hover:bg-gray-500 dark:bg-gray-600 dark:hover:bg-gray-500 text-white rounded-lg transition-all flex items-center justify-center gap-2 font-medium"
                  >
                    <Download size={18} />
                    <span>💾 Exportar Prompts (Template)</span>
                  </button>
                </div>

                {/* Stats */}
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h3 className="font-semibold mb-3 text-sm text-gray-700 dark:text-gray-300">
                    📊 Estatísticas
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-gray-600 dark:text-gray-400">Mensagens</div>
                      <div className="font-bold text-lg">
                        {completedConversation.messages.length}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600 dark:text-gray-400">Caracteres</div>
                      <div className="font-bold text-lg">
                        {completedConversation.stats.totalChars.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600 dark:text-gray-400">Duração</div>
                      <div className="font-bold text-lg flex items-center gap-1">
                        <Clock size={16} />
                        {Math.floor(completedConversation.stats.duration / 60)}:
                        {(completedConversation.stats.duration % 60).toString().padStart(2, '0')}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600 dark:text-gray-400">Vídeo (média)</div>
                      <div className="font-bold text-lg">
                        {calculateVideoTime(completedConversation.stats.totalChars).medium.duration}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
