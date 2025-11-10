'use client';

import { X, AlertCircle, DollarSign, Clock, FileText } from 'lucide-react';
import { ScriptInput } from '@/types';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  input: ScriptInput;
  selectedProvider: string;
}

export default function ConfirmationModal({ isOpen, onClose, onConfirm, input, selectedProvider }: ConfirmationModalProps) {
  if (!isOpen) return null;

  // Calcular estimativas baseadas no tipo de roteiro e provider
  const getEstimatedCost = (): string => {
    if (selectedProvider === 'anthropic') {
      // Claude 4: Opus 4.1 + Sonnet 4.5
      return input.mode === 'story' ? '~US$ 1.00' : '~US$ 0.80';
    } else if (selectedProvider === 'openai') {
      return '~US$ 0.50';
    } else if (selectedProvider === 'gemini' || selectedProvider === 'groq') {
      return 'Gratuito (com limites diários)';
    }
    return 'Variável';
  };

  const getEstimatedTime = (): string => {
    if (input.mode === 'story') {
      return '8-12 minutos';
    }
    return '3-6 minutos';
  };

  const getScriptTypeLabel = (): string => {
    const types = {
      story: '📖 História Completa (8500+ palavras)',
      documentary: '📚 Documentário',
      curiosities: '🤔 Curiosidades',
      custom: '⚙️ Personalizado'
    };
    return types[input.mode] || input.mode;
  };

  const getFilesCount = (): number => {
    return input.mode === 'story' ? 6 : 5;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-slideUp">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle size={28} />
            <div>
              <h2 className="text-2xl font-bold">Confirmar Geração</h2>
              <p className="text-sm opacity-90">Verifique os detalhes antes de gerar</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Fechar"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Resumo do Roteiro */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-5">
            <h3 className="font-bold text-lg text-blue-900 dark:text-blue-300 mb-4 flex items-center gap-2">
              <FileText size={20} />
              Resumo do Roteiro
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Tipo:</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{getScriptTypeLabel()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Tema:</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100 truncate max-w-[60%]">{input.title}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Duração estimada:</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{getEstimatedTime()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Arquivos gerados:</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{getFilesCount()} arquivos</span>
              </div>
            </div>
          </div>

          {/* Estimativas */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Tempo Estimado */}
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={18} className="text-purple-600 dark:text-purple-400" />
                <h4 className="font-semibold text-purple-900 dark:text-purple-300">Tempo de Geração</h4>
              </div>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">{getEstimatedTime()}</p>
              <p className="text-xs text-purple-600 dark:text-purple-500 mt-1">Tempo aproximado</p>
            </div>

            {/* Custo Estimado */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={18} className="text-green-600 dark:text-green-400" />
                <h4 className="font-semibold text-green-900 dark:text-green-300">Custo Estimado</h4>
              </div>
              <p className="text-2xl font-bold text-green-700 dark:text-green-400">{getEstimatedCost()}</p>
              <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                Provider: {selectedProvider === 'anthropic' ? 'Claude 4' : selectedProvider === 'openai' ? 'OpenAI' : selectedProvider.toUpperCase()}
              </p>
            </div>
          </div>

          {/* Arquivos que serão gerados */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-5">
            <h4 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-3">📦 Arquivos que serão gerados:</h4>
            <ul className="space-y-2 text-sm text-yellow-800 dark:text-yellow-400">
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 dark:text-yellow-500">•</span>
                <span><strong>01_Roteiro_Estruturado.txt</strong> - Roteiro completo em português</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 dark:text-yellow-500">•</span>
                <span><strong>02_Trilha_Sonora.txt</strong> - Direção musical e efeitos sonoros</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 dark:text-yellow-500">•</span>
                <span><strong>03_Texto_Narrado.txt</strong> - Texto expandido em inglês (8500+ palavras)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 dark:text-yellow-500">•</span>
                <span><strong>04_Personagens_Descricoes.txt</strong> - Descrições para geração de imagens</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 dark:text-yellow-500">•</span>
                <span><strong>05_Titulo_Descricao.txt</strong> - Títulos e descrição para YouTube</span>
              </li>
              {input.mode === 'story' && (
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 dark:text-yellow-500">•</span>
                  <span><strong>06_Takes_Cenas_Visuais.txt</strong> - Cenas visuais detalhadas</span>
                </li>
              )}
            </ul>
          </div>

          {/* Aviso */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-800 dark:text-red-300">
                <p className="font-semibold mb-1">⚠️ Atenção:</p>
                <ul className="space-y-1 text-xs">
                  <li>• A geração não pode ser interrompida após iniciar</li>
                  <li>• Os créditos serão consumidos mesmo se você fechar a aba</li>
                  <li>• Certifique-se de que todos os dados estão corretos</li>
                  {selectedProvider !== 'gemini' && selectedProvider !== 'groq' && (
                    <li>• APIs pagas cobram por uso - verifique seu saldo</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-800 p-6 rounded-b-2xl flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
          >
            ❌ Cancelar
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl"
          >
            ✅ Confirmar e Gerar
          </button>
        </div>
      </div>
    </div>
  );
}
