'use client';

import { useState, useEffect } from 'react';
import { Film, Users } from 'lucide-react';
import { ScriptMode } from '@/types';

interface ScriptModeSelectorProps {
  selectedMode: ScriptMode;
  onChange: (mode: ScriptMode) => void;
}

export default function ScriptModeSelector({ selectedMode, onChange }: ScriptModeSelectorProps) {
  // Carregar último modo do localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('lastScriptMode') as ScriptMode;
    if (savedMode && !selectedMode) {
      onChange(savedMode);
    }
  }, []);

  // Salvar no localStorage quando mudar
  useEffect(() => {
    if (selectedMode) {
      localStorage.setItem('lastScriptMode', selectedMode);
    }
  }, [selectedMode]);

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
        Modo de Roteiro *
      </label>

      <div className="grid grid-cols-2 gap-4">
        {/* Modo Documentário */}
        <button
          type="button"
          onClick={() => onChange('documentary')}
          className={`p-4 rounded-lg border-2 transition-all ${
            selectedMode === 'documentary'
              ? 'border-primary bg-primary/5 dark:bg-primary/10'
              : 'border-gray-300 dark:border-gray-600 hover:border-primary/50'
          }`}
        >
          <div className="flex flex-col items-center gap-2">
            <Film
              size={32}
              className={selectedMode === 'documentary' ? 'text-primary' : 'text-gray-500'}
            />
            <div className="text-center">
              <p className={`font-semibold ${selectedMode === 'documentary' ? 'text-primary' : 'text-gray-700 dark:text-gray-300'}`}>
                Documentário
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Estilo investigativo com curiosidades e fatos históricos
              </p>
            </div>
          </div>
        </button>

        {/* Modo História de Personagens */}
        <button
          type="button"
          onClick={() => onChange('character')}
          className={`p-4 rounded-lg border-2 transition-all ${
            selectedMode === 'character'
              ? 'border-secondary bg-secondary/5 dark:bg-secondary/10'
              : 'border-gray-300 dark:border-gray-600 hover:border-secondary/50'
          }`}
        >
          <div className="flex flex-col items-center gap-2">
            <Users
              size={32}
              className={selectedMode === 'character' ? 'text-secondary' : 'text-gray-500'}
            />
            <div className="text-center">
              <p className={`font-semibold ${selectedMode === 'character' ? 'text-secondary' : 'text-gray-700 dark:text-gray-300'}`}>
                História de Personagem
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Narrativa pessoal com ponto de vista único do personagem
              </p>
            </div>
          </div>
        </button>
      </div>

      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {selectedMode === 'documentary' ? (
            <>
              <strong>Documentário:</strong> Aborda temas bíblicos com foco em curiosidades, evidências arqueológicas, contexto histórico e análise investigativa. Ideal para conteúdo educativo.
            </>
          ) : (
            <>
              <strong>História de Personagem:</strong> Conta a história através dos olhos de um personagem bíblico específico, explorando suas emoções, desafios e jornada pessoal. Ideal para narrativas envolventes.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
