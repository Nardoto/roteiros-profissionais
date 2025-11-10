// ============================================================================
// SISTEMA DE TEMPLATES E CONVERSAÇÃO - Tipos TypeScript
// ============================================================================

/**
 * Template de roteiro com estrutura de prompts sequenciais
 */
export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;

  // Variáveis que o template usa
  variables: {
    TITULO: string;
    SINOPSE: string;
    BASE_CONHECIMENTO?: string;
    NUM_TOPICOS: number;
    NUM_SUBTOPICOS: number;
    IDIOMA: 'pt' | 'en' | 'es';
    CARACTERES_TOTAIS: number;
    CARACTERES_POR_TOPICO: number;
    CARACTERES_HOOK: number;
  };

  // Sequência de prompts a executar
  steps: PromptStep[];
}

/**
 * Passo individual na conversa
 */
export interface PromptStep {
  id: string;
  name: string;
  description: string;

  // Template do prompt com {{VARIAVEIS}}
  promptTemplate: string;

  // Se true, usa contexto da conversa anterior
  usesContext: boolean;

  // Se true, executa automaticamente após o anterior
  autoExecute: boolean;

  // Tipo de output esperado
  outputType: 'structure' | 'hook' | 'topic' | 'complementary' | 'characters' | 'soundtrack' | 'takes';

  // Validação do output (opcional)
  validation?: {
    minChars?: number;
    maxChars?: number;
    mustContain?: string[];
  };
}

/**
 * Mensagem na conversa
 */
export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  stepId?: string; // Qual step gerou esta mensagem
  tokens?: number;
  chars?: number;
}

/**
 * Estado da conversa ativa
 */
export interface Conversation {
  id: string;
  templateId: string;
  createdAt: Date;

  // Todas as mensagens trocadas
  messages: ConversationMessage[];

  // Contexto acumulado (usado pela IA)
  contextWindow: string;

  // Qual step está sendo executado agora
  currentStepIndex: number;

  // Status
  status: 'idle' | 'running' | 'paused' | 'completed' | 'error';

  // Arquivos gerados até agora
  generatedFiles: {
    estrutura?: string;
    hook?: string;
    topicos?: string[];
    complementares?: string[];
    personagens?: string;
    trilha?: string;
    takes?: string;
  };

  // Estatísticas
  stats: {
    totalTokens: number;
    totalChars: number;
    estimatedCost: number;
    duration: number; // segundos
  };
}

/**
 * Configuração de velocidade de leitura
 */
export interface ReadingSpeed {
  name: string;
  charsPerSecond: number;
  description: string;
}

/**
 * Estimativa de duração do vídeo
 */
export interface VideoTimeEstimate {
  totalChars: number;
  slow: { duration: string; charsPerSec: number }; // Voz lenta
  medium: { duration: string; charsPerSec: number }; // Voz média
  fast: { duration: string; charsPerSec: number }; // Voz rápida
}

/**
 * Input do usuário para geração
 */
export interface ConversationalInput {
  // Campos básicos
  title: string;
  synopsis: string;
  knowledgeBase?: string;

  // Configurações do roteiro
  numTopics: number;
  numSubtopics: number;
  totalCharacters: number;
  language: 'pt' | 'en' | 'es';

  // Template escolhido
  templateId: string;
  customTemplate?: any; // Template customizado (se editado pelo usuário)

  // API
  apiKeys: any;
  selectedProvider: string;
  claudeModel?: 'haiku' | 'sonnet' | 'opus';
}
