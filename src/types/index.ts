export interface ApiKeys {
  gemini: string[];  // Múltiplas APIs do Gemini
  openai?: string;   // API do GPT (opcional)
  anthropic?: string; // API do Claude (opcional)
}

export interface ScriptInput {
  title: string;
  synopsis: string;
  knowledgeBase?: string;
  apiKeys: ApiKeys;
}

export interface GeneratedScript {
  roteiro: string;
  trilha: string;
  textoNarrado: string;
  personagens: string;
  titulo: string;
}

export interface ProgressUpdate {
  progress: number;
  message: string;
  currentFile?: string;
}

export type FileType = 'roteiro' | 'trilha' | 'textoNarrado' | 'personagens' | 'titulo';
