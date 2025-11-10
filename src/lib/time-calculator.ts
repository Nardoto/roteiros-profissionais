import { VideoTimeEstimate, ReadingSpeed } from '@/types/conversation';

// ============================================================================
// CALCULADORA DE TEMPO DE VÍDEO
// Baseado em velocidade de leitura (caracteres por segundo)
// ============================================================================

/**
 * Velocidades de leitura/narração
 */
export const READING_SPEEDS: ReadingSpeed[] = [
  {
    name: 'Lenta',
    charsPerSecond: 10,
    description: 'Narração pausada e detalhada',
  },
  {
    name: 'Média',
    charsPerSecond: 12,
    description: 'Narração padrão de documentários',
  },
  {
    name: 'Rápida',
    charsPerSecond: 14,
    description: 'Narração dinâmica e ágil',
  },
];

/**
 * Formata segundos em formato MM:SS ou HH:MM:SS
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Calcula estimativa de duração do vídeo em diferentes velocidades
 */
export function calculateVideoTime(totalChars: number): VideoTimeEstimate {
  const slow = READING_SPEEDS[0];
  const medium = READING_SPEEDS[1];
  const fast = READING_SPEEDS[2];

  return {
    totalChars,
    slow: {
      duration: formatDuration(totalChars / slow.charsPerSecond),
      charsPerSec: slow.charsPerSecond,
    },
    medium: {
      duration: formatDuration(totalChars / medium.charsPerSecond),
      charsPerSec: medium.charsPerSecond,
    },
    fast: {
      duration: formatDuration(totalChars / fast.charsPerSecond),
      charsPerSec: fast.charsPerSecond,
    },
  };
}

/**
 * Calcula quantos caracteres são necessários para um tempo específico
 */
export function calculateCharsForDuration(minutes: number, speed: 'slow' | 'medium' | 'fast'): number {
  const speedMap = {
    slow: READING_SPEEDS[0].charsPerSecond,
    medium: READING_SPEEDS[1].charsPerSecond,
    fast: READING_SPEEDS[2].charsPerSecond,
  };

  const charsPerSec = speedMap[speed];
  const totalSeconds = minutes * 60;

  return Math.floor(totalSeconds * charsPerSec);
}

/**
 * Sugere total de caracteres baseado em duração desejada
 */
export function suggestCharactersForVideoLength(
  targetMinutes: number
): {
  forSlowVoice: number;
  forMediumVoice: number;
  forFastVoice: number;
  recommended: number;
} {
  return {
    forSlowVoice: calculateCharsForDuration(targetMinutes, 'slow'),
    forMediumVoice: calculateCharsForDuration(targetMinutes, 'medium'),
    forFastVoice: calculateCharsForDuration(targetMinutes, 'fast'),
    recommended: calculateCharsForDuration(targetMinutes, 'medium'), // Média
  };
}
