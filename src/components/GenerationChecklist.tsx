'use client';

import { CheckCircle2, Circle, AlertCircle, Loader2 } from 'lucide-react';

export interface ChecklistStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
  error?: string;
}

interface GenerationChecklistProps {
  steps: ChecklistStep[];
}

export default function GenerationChecklist({ steps }: GenerationChecklistProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border-2 border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400" />
        Progresso da Geração
      </h3>

      <div className="space-y-3">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
              step.status === 'running'
                ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-700'
                : step.status === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                : step.status === 'error'
                ? 'bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700'
                : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
            }`}
          >
            {/* Ícone de status */}
            <div className="flex-shrink-0 mt-0.5">
              {step.status === 'pending' && (
                <Circle className="w-5 h-5 text-gray-400 dark:text-gray-600" />
              )}
              {step.status === 'running' && (
                <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
              )}
              {step.status === 'success' && (
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              )}
              {step.status === 'error' && (
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              )}
            </div>

            {/* Conteúdo */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={`font-semibold text-sm ${
                    step.status === 'running'
                      ? 'text-blue-900 dark:text-blue-300'
                      : step.status === 'success'
                      ? 'text-green-900 dark:text-green-300'
                      : step.status === 'error'
                      ? 'text-red-900 dark:text-red-300'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
                {step.status === 'running' && (
                  <span className="px-2 py-0.5 bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-200 text-xs font-bold rounded-full">
                    EM ANDAMENTO
                  </span>
                )}
                {step.status === 'success' && (
                  <span className="px-2 py-0.5 bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-200 text-xs font-bold rounded-full">
                    ✓ CONCLUÍDO
                  </span>
                )}
                {step.status === 'error' && (
                  <span className="px-2 py-0.5 bg-red-200 dark:bg-red-800 text-red-900 dark:text-red-200 text-xs font-bold rounded-full">
                    ✗ ERRO
                  </span>
                )}
              </div>

              {/* Mensagem de progresso */}
              {step.message && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {step.message}
                </p>
              )}

              {/* Mensagem de erro */}
              {step.error && (
                <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 rounded border border-red-300 dark:border-red-700">
                  <p className="text-xs text-red-800 dark:text-red-300 font-medium">
                    <strong>❌ Erro:</strong> {step.error}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Legenda */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <Circle className="w-3 h-3 text-gray-400" />
            <span className="text-gray-600 dark:text-gray-400">Aguardando</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Loader2 className="w-3 h-3 text-blue-600 animate-spin" />
            <span className="text-gray-600 dark:text-gray-400">Em andamento</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-green-600" />
            <span className="text-gray-600 dark:text-gray-400">Concluído</span>
          </div>
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3 h-3 text-red-600" />
            <span className="text-gray-600 dark:text-gray-400">Erro</span>
          </div>
        </div>
      </div>
    </div>
  );
}
