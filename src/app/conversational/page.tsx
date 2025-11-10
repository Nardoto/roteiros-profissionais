'use client';

import { useState } from 'react';
import { MessageSquare, Download, FileText, Clock } from 'lucide-react';
import ConversationalInputForm from '@/components/ConversationalInputForm';
import ConversationView from '@/components/ConversationView';
import { ConversationalInput, ConversationMessage, Conversation } from '@/types/conversation';
import { calculateVideoTime } from '@/lib/time-calculator';

export default function ConversationalPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [completedConversation, setCompletedConversation] = useState<Conversation | null>(null);
  const [progress, setProgress] = useState(0);

  const handleGenerate = async (input: ConversationalInput) => {
    setIsGenerating(true);
    setMessages([]);
    setCompletedConversation(null);
    setProgress(0);

    try {
      const response = await fetch('/api/generate-conversational', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error('Erro ao gerar roteiro conversacional');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Não foi possível ler a resposta');
      }

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === 'message') {
                // Nova mensagem
                setMessages((prev) => [...prev, data.message]);
                setCurrentStep(data.currentStep || '');
                setProgress(data.progress || 0);
              } else if (data.type === 'complete') {
                // Concluído
                setCompletedConversation(data.conversation);
                setIsGenerating(false);
                setProgress(100);
              } else if (data.type === 'error') {
                console.error('Erro:', data.error);
                alert(`Erro: ${data.error}`);
                setIsGenerating(false);
              }
            } catch (parseError) {
              console.warn('Chunk JSON incompleto, ignorando:', parseError);
            }
          }
        }
      }
    } catch (err: any) {
      console.error('Erro:', err);
      alert(`Erro: ${err.message}`);
      setIsGenerating(false);
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
    <main className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <MessageSquare size={32} className="text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
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
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 border border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FileText className="text-primary" size={24} />
              Configuração
            </h2>
            <ConversationalInputForm onSubmit={handleGenerate} isGenerating={isGenerating} />
          </div>

          {/* Coluna Direita: Conversa + Downloads */}
          <div className="space-y-6">
            {/* Progress */}
            {(isGenerating || completedConversation) && (
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-4 border border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {isGenerating ? 'Gerando...' : '✓ Concluído'}
                  </span>
                  <span className="text-sm font-bold text-primary">{Math.round(progress)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Conversa */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 border border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <MessageSquare className="text-blue-600" size={24} />
                Conversa com IA
              </h2>
              <ConversationView
                messages={messages}
                currentStep={currentStep}
                isGenerating={isGenerating}
              />
            </div>

            {/* Downloads */}
            {completedConversation && (
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 border border-gray-200 dark:border-gray-800">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Download className="text-green-600" size={24} />
                  Arquivos Gerados
                </h2>

                <div className="space-y-3">
                  {/* Estrutura */}
                  {completedConversation.generatedFiles.estrutura && (
                    <button
                      onClick={() =>
                        downloadFile(
                          '01_Estrutura.txt',
                          completedConversation.generatedFiles.estrutura!
                        )
                      }
                      className="w-full px-4 py-3 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all flex items-center justify-between"
                    >
                      <span className="font-medium">📋 Estrutura</span>
                      <Download size={18} />
                    </button>
                  )}

                  {/* Hook */}
                  {completedConversation.generatedFiles.hook && (
                    <button
                      onClick={() =>
                        downloadFile('02_Hook_Introducao.txt', completedConversation.generatedFiles.hook!)
                      }
                      className="w-full px-4 py-3 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-all flex items-center justify-between"
                    >
                      <span className="font-medium">🎣 Hook/Introdução</span>
                      <Download size={18} />
                    </button>
                  )}

                  {/* Tópicos */}
                  {completedConversation.generatedFiles.topicos?.map((topico, idx) => (
                    <button
                      key={idx}
                      onClick={() => downloadFile(`03_Topico_${idx + 1}.txt`, topico)}
                      className="w-full px-4 py-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-all flex items-center justify-between"
                    >
                      <span className="font-medium">📖 Tópico {idx + 1}</span>
                      <Download size={18} />
                    </button>
                  ))}

                  {/* Roteiro Completo */}
                  <button
                    onClick={() => {
                      const fullScript = [
                        completedConversation.generatedFiles.hook || '',
                        ...(completedConversation.generatedFiles.topicos || []),
                      ].join('\n\n');
                      downloadFile('00_Roteiro_Completo.txt', fullScript);
                    }}
                    className="w-full px-4 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:shadow-xl transition-all flex items-center justify-between font-bold"
                  >
                    <span>📝 Roteiro Completo</span>
                    <Download size={18} />
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
