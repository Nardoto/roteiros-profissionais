// Providers disponíveis
export type AIProvider =
  // Gratuitos
  | 'gemini'      // Google Gemini (gratuito com limites)
  | 'groq'        // Groq (gratuito, ultra rápido)
  | 'cohere'      // Cohere (tier gratuito generoso)
  | 'huggingface' // Hugging Face Inference (gratuito)
  // Pagos
  | 'openai'      // OpenAI GPT (pago)
  | 'anthropic'   // Anthropic Claude (pago)
  | 'mistral'     // Mistral AI (pago, barato)
  | 'together'    // Together AI (pago)
  | 'perplexity'; // Perplexity AI (pago)

export interface ApiKeys {
  // Gratuitos (múltiplas chaves)
  gemini: string[];
  groq: string[];
  cohere: string[];
  huggingface: string[];
  // Pagos (uma chave cada)
  openai?: string;
  anthropic?: string;
  mistral?: string;
  together?: string;
  perplexity?: string;
}

// Tipo de modo de roteiro
export type ScriptMode = 'documentary' | 'story' | 'curiosities' | 'custom';

// Configuração detalhada para cada tipo
export interface ScriptTypeConfig {
  id: ScriptMode;
  name: string;
  icon: string;
  description: string;
  structure: string;
  characterTarget: string;
  color: string;
}

// Idioma para modo história e documentário
export type StoryLanguage = 'pt' | 'en' | 'es';

// Seleção de PROVIDER (empresa), não API específica
export interface ApiSelection {
  provider: AIProvider;
  label: string; // Nome amigável (ex: "Google Gemini", "OpenAI GPT-4", "Anthropic Claude")
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

// Template salvo pelo usuário
export interface SavedTemplate {
  id: string;
  name: string;
  mode: ScriptMode;
  structure?: string;
  customPrompts?: Record<string, string>;
  createdAt: string;
  lastUsed?: string;
}

export interface ScriptInput {
  title: string;
  synopsis: string;
  knowledgeBase?: string;
  apiKeys: ApiKeys;
  mode: ScriptMode; // Modo do roteiro
  selectedApi: ApiSelection; // API escolhida
  language?: StoryLanguage; // Idioma
  targetCharacters?: number; // Total de caracteres desejado para o roteiro
  customPrompts?: Record<string, string>; // Prompts customizados pelo usuário
  templateId?: string; // ID do template usado
}

export interface GeneratedScript {
  roteiro: string;
  trilha: string;
  textoNarrado: string;
  personagens: string;
  titulo: string;
  takes?: string;
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

export type FileType = 'roteiro' | 'trilha' | 'textoNarrado' | 'personagens' | 'titulo' | 'takes';
