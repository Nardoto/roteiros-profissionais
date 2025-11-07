export interface ApiKeys {
  gemini: string[];  // Múltiplas APIs do Gemini
  openai?: string;   // API do GPT (opcional)
  anthropic?: string; // API do Claude (opcional)
}

// Tipo de modo de roteiro
export type ScriptMode = 'documentary' | 'character';

// Seleção de API para usar
export interface ApiSelection {
  provider: 'gemini' | 'openai' | 'anthropic';
  index?: number; // Para Gemini, qual das múltiplas keys
  label: string; // Nome amigável (ex: "Gemini #1", "GPT-4", "Claude")
}

// Estimativa de custo
export interface CostEstimate {
  provider: string;
  estimatedTokens: number;
  estimatedCost: number; // em USD, 0 para Gemini
  isFree: boolean;
}

// Histórico de roteiros
export interface ScriptHistory {
  id: string;
  title: string;
  mode: ScriptMode;
  apiUsed: ApiSelection;
  generatedAt: string; // ISO date
  duration: number; // segundos
  cost: number; // USD
  success: boolean;
  filesGenerated: FileType[];
}

export interface ScriptInput {
  title: string;
  synopsis: string;
  knowledgeBase?: string;
  apiKeys: ApiKeys;
  mode: ScriptMode; // Modo do roteiro
  selectedApi: ApiSelection; // API escolhida
}

export interface GeneratedScript {
  roteiro: string;
  trilha: string;
  textoNarrado: string;
  personagens: string;
  titulo: string;
}

// Arquivo parcial gerado (para download progressivo)
export interface PartialFile {
  type: FileType;
  content: string;
  generatedAt: string;
  isComplete: boolean;
}

export interface ProgressUpdate {
  progress: number;
  message: string;
  currentFile?: string;
  streamedContent?: string; // Conteúdo sendo gerado em tempo real
  partialFile?: PartialFile; // Arquivo parcial disponível para download
}

export type FileType = 'roteiro' | 'trilha' | 'textoNarrado' | 'personagens' | 'titulo';
