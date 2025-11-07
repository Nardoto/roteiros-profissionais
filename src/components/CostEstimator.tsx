'use client';

import { DollarSign, Zap } from 'lucide-react';
import { ApiSelection, CostEstimate } from '@/types';

interface CostEstimatorProps {
  selectedApi: ApiSelection | null;
  synopsisLength: number;
  knowledgeBaseLength: number;
}

export default function CostEstimator({ selectedApi, synopsisLength, knowledgeBaseLength }: CostEstimatorProps) {
  if (!selectedApi) {
    return null;
  }

  // Calcular estimativa de tokens
  // Roteiro completo gera ~12 chamadas de API, cada uma com ~8k tokens de saída
  // Input estimado: ~2k tokens (prompts base + sinopse + conhecimento)
  // Total: ~100k tokens de saída + ~24k de entrada = ~124k tokens totais
  const baseInputTokens = 24000; // Prompts + contexto
  const userInputTokens = Math.ceil((synopsisLength + knowledgeBaseLength) / 4); // Aprox 4 chars = 1 token
  const estimatedInputTokens = baseInputTokens + userInputTokens;
  const estimatedOutputTokens = 100000; // Saída dos 5 arquivos
  const totalTokens = estimatedInputTokens + estimatedOutputTokens;

  // Calcular custo baseado na API
  let estimatedCost = 0;
  let isFree = false;
  let providerName = '';
  let details = '';

  if (selectedApi.provider === 'gemini') {
    isFree = true;
    providerName = 'Gemini';
    details = 'API gratuita do Google (limite: 16 roteiros/dia por API)';
  } else if (selectedApi.provider === 'openai') {
    // GPT-4 Turbo pricing: $0.01/1K input, $0.03/1K output
    const inputCost = (estimatedInputTokens / 1000) * 0.01;
    const outputCost = (estimatedOutputTokens / 1000) * 0.03;
    estimatedCost = inputCost + outputCost;
    providerName = 'GPT-4';
    details = `~${(totalTokens / 1000).toFixed(0)}k tokens totais`;
  } else if (selectedApi.provider === 'anthropic') {
    // Claude 3 pricing: $0.008/1K input, $0.024/1K output
    const inputCost = (estimatedInputTokens / 1000) * 0.008;
    const outputCost = (estimatedOutputTokens / 1000) * 0.024;
    estimatedCost = inputCost + outputCost;
    providerName = 'Claude 3';
    details = `~${(totalTokens / 1000).toFixed(0)}k tokens totais`;
  }

  const estimate: CostEstimate = {
    provider: providerName,
    estimatedTokens: totalTokens,
    estimatedCost,
    isFree
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${
      isFree
        ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
        : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${
          isFree
            ? 'bg-green-100 dark:bg-green-800'
            : 'bg-yellow-100 dark:bg-yellow-800'
        }`}>
          {isFree ? (
            <Zap size={20} className="text-green-600 dark:text-green-400" />
          ) : (
            <DollarSign size={20} className="text-yellow-600 dark:text-yellow-400" />
          )}
        </div>

        <div className="flex-1">
          <h3 className={`font-semibold text-sm mb-1 ${
            isFree
              ? 'text-green-900 dark:text-green-300'
              : 'text-yellow-900 dark:text-yellow-300'
          }`}>
            Previsão de Custo - {providerName}
          </h3>

          <div className={`text-xs space-y-1 ${
            isFree
              ? 'text-green-800 dark:text-green-400'
              : 'text-yellow-800 dark:text-yellow-400'
          }`}>
            <p><strong>Modelo:</strong> {selectedApi.label}</p>
            <p><strong>Custo estimado:</strong> {
              isFree ? (
                <span className="font-bold text-green-600 dark:text-green-400">GRATUITO</span>
              ) : (
                <span className="font-bold">US$ {estimatedCost.toFixed(2)}</span>
              )
            }</p>
            <p><strong>Detalhes:</strong> {details}</p>
            {!isFree && (
              <p className="mt-2 italic">💡 Dica: Use Gemini para gerar gratuitamente!</p>
            )}
          </div>
        </div>
      </div>

      {isFree && (
        <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-700">
          <p className="text-xs text-green-700 dark:text-green-400">
            ℹ️ <strong>Limite do Gemini:</strong> Você pode gerar até 16 roteiros por dia com cada API key.
            {synopsisLength + knowledgeBaseLength > 500 && ' Esta é uma sinopse longa, pode levar mais tempo.'}
          </p>
        </div>
      )}

      {!isFree && (
        <div className="mt-3 pt-3 border-t border-yellow-200 dark:border-yellow-700">
          <p className="text-xs text-yellow-700 dark:text-yellow-400">
            ⚠️ <strong>Atenção:</strong> Este valor é uma estimativa. O custo real pode variar baseado no conteúdo gerado.
            Você será cobrado diretamente pela {selectedApi.provider === 'openai' ? 'OpenAI' : 'Anthropic'}.
          </p>
        </div>
      )}
    </div>
  );
}
