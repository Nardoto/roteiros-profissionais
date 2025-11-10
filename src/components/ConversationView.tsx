'use client';

import { useRef, useEffect, useState } from 'react';
import { ConversationMessage } from '@/types/conversation';
import { User, Bot, CheckCircle, Clock, ChevronDown, MessageSquare } from 'lucide-react';

interface ConversationViewProps {
  messages: ConversationMessage[];
  currentStep?: string;
  isGenerating: boolean;
}

export default function ConversationView({ messages, currentStep, isGenerating }: ConversationViewProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false); // COMEÇA MINIMIZADA

  // Auto-scroll para última mensagem
  useEffect(() => {
    if (isExpanded) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isExpanded]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400 dark:text-gray-600">
        <Bot size={48} className="mb-4 opacity-50" />
        <p className="text-sm">Aguardando início da conversa...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header clicável para expandir/minimizar */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors mb-3"
      >
        <div className="flex items-center gap-2">
          <MessageSquare size={18} className="text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
            {isGenerating ? `Gerando ${currentStep || ''}...` : `${messages.length} mensagens trocadas`}
          </span>
        </div>
        <ChevronDown
          size={18}
          className={`text-blue-600 dark:text-blue-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Conversa (oculta por padrão) */}
      <div className={`transition-all duration-300 ${isExpanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="space-y-4 max-h-[600px] overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {/* Avatar */}
              {message.role === 'assistant' && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                    <Bot size={18} className="text-white" />
                  </div>
                </div>
              )}

              {/* Mensagem */}
              <div
                className={`max-w-[75%] rounded-xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-white'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                }`}
              >
                {/* Header */}
                <div className="flex items-center gap-2 mb-2 text-xs opacity-70">
                  <span className="font-semibold">
                    {message.role === 'user' ? 'Você' : 'Claude'}
                  </span>
                  {message.stepId && (
                    <span className="px-2 py-0.5 bg-black/10 dark:bg-white/10 rounded-full">
                      {message.stepId}
                    </span>
                  )}
                </div>

                {/* Conteúdo */}
                <div className={`text-sm ${message.role === 'user' ? 'text-white' : 'text-gray-800 dark:text-gray-200'}`}>
                  {/* Se for mensagem do usuário (prompt), mostrar de forma colapsável */}
                  {message.role === 'user' ? (
                    <details className="cursor-pointer">
                      <summary className="font-semibold mb-2 hover:opacity-80">
                        📋 Ver prompt enviado... (clique para expandir)
                      </summary>
                      <div className="mt-2 p-3 bg-white/10 rounded text-xs whitespace-pre-wrap">
                        {message.content}
                      </div>
                    </details>
                  ) : (
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  )}
                </div>

                {/* Footer com stats */}
                <div className="flex items-center gap-3 mt-2 text-xs opacity-60">
                  {message.chars && <span>{message.chars.toLocaleString()} chars</span>}
                  {message.tokens && <span>{message.tokens.toLocaleString()} tokens</span>}
                  <span>{new Date(message.timestamp).toLocaleTimeString('pt-BR')}</span>
                </div>
              </div>

              {/* Avatar do usuário */}
              {message.role === 'user' && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <User size={18} className="text-white" />
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Indicador de digitação */}
          {isGenerating && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <Bot size={18} className="text-white" />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2 mb-1 text-xs text-gray-600 dark:text-gray-400">
                  <Clock size={12} className="animate-spin" />
                  <span>Gerando {currentStep || 'resposta'}...</span>
                </div>
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
}
