export function validateWordCount(text: string, minWords: number): boolean {
  const words = text.trim().split(/\s+/).length;
  return words >= minWords;
}

export function validateRoteiro(roteiro: string): boolean {
  const requiredSections = [
    'HOOK',
    'ATO I',
    'ATO II',
    'ATO III',
    'ATO IV',
    'ATO V',
    'ATO VI',
    'CONCLUSÃO'
  ];

  return requiredSections.every(section =>
    roteiro.toUpperCase().includes(section)
  );
}

export function validateTextoNarrado(texto: string): boolean {
  const hasMinWords = validateWordCount(texto, 8500);
  const hasSections = texto.includes('OPENING') &&
                       texto.includes('ACT ONE') &&
                       texto.includes('CONCLUSION');
  return hasMinWords && hasSections;
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).length;
}

export function countCharacters(text: string): number {
  // Remove espaços em branco para contar apenas caracteres visíveis
  return text.replace(/\s/g, '').length;
}

export function extractSectionWordCounts(texto: string): Record<string, number> {
  const sections = {
    'HOOK': /OPENING[\s\S]*?(?=ACT ONE|$)/i,
    'ACT ONE': /ACT ONE[\s\S]*?(?=ACT TWO|$)/i,
    'ACT TWO': /ACT TWO[\s\S]*?(?=ACT THREE|$)/i,
    'ACT THREE': /ACT THREE[\s\S]*?(?=ACT FOUR|$)/i,
    'ACT FOUR': /ACT FOUR[\s\S]*?(?=ACT FIVE|$)/i,
    'ACT FIVE': /ACT FIVE[\s\S]*?(?=ACT SIX|$)/i,
    'ACT SIX': /ACT SIX[\s\S]*?(?=CONCLUSION|$)/i,
    'CONCLUSION': /CONCLUSION[\s\S]*$/i,
  };

  const counts: Record<string, number> = {};

  for (const [name, regex] of Object.entries(sections)) {
    const match = texto.match(regex);
    if (match) {
      counts[name] = countWords(match[0]);
    }
  }

  return counts;
}
