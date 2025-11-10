// ============================================================================
// SISTEMA UNIVERSAL DE TEMPLATES - Tipos TypeScript
// ============================================================================

/**
 * Operações disponíveis para manipular respostas da IA
 */
export type TemplateOperation =
  | SplitOperation
  | JoinOperation
  | ExtractOperation
  | ReplaceOperation
  | LoopOperation;

/**
 * SPLIT - Divide texto em partes usando regex
 */
export interface SplitOperation {
  type: 'SPLIT';
  input: string; // Nome da variável ou campo para dividir
  pattern: string; // Regex para dividir (ex: /Tópico \d+:/i)
  outputArray: string; // Nome do array resultante
}

/**
 * JOIN - Junta múltiplas strings em uma
 */
export interface JoinOperation {
  type: 'JOIN';
  inputs: string[]; // Nomes das variáveis/campos para juntar
  separator: string; // Separador (ex: '\n\n')
  output: string; // Nome da variável resultante
}

/**
 * EXTRACT - Extrai parte do texto usando regex
 */
export interface ExtractOperation {
  type: 'EXTRACT';
  input: string; // Nome da variável/campo
  pattern: string; // Regex para extrair (ex: /^(.+?):/m para pegar primeira linha)
  group?: number; // Grupo de captura (default: 1)
  output: string; // Nome da variável resultante
}

/**
 * REPLACE - Substitui texto usando regex
 */
export interface ReplaceOperation {
  type: 'REPLACE';
  input: string; // Nome da variável/campo
  pattern: string; // Regex para buscar
  replacement: string; // Texto de substituição (pode ter {{VARS}})
  output: string; // Nome da variável resultante
}

/**
 * LOOP - Executa steps para cada item de um array
 */
export interface LoopOperation {
  type: 'LOOP';
  array: string; // Nome do array para iterar
  itemVar: string; // Nome da variável que receberá cada item (ex: 'TOPICO_ATUAL')
  indexVar?: string; // Nome da variável que receberá o índice (ex: 'TOPICO_NUM')
  steps: UniversalStep[]; // Steps a executar para cada item
}

/**
 * Step universal - pode gerar prompt OU executar operação
 */
export interface UniversalStep {
  id: string;
  name: string;
  description: string;

  // TIPO 1: Gerar prompt para IA
  type: 'prompt' | 'operation';

  // Se type = 'prompt'
  promptTemplate?: string; // Template com {{VARIAVEIS}}
  usesContext?: boolean; // Se usa contexto da conversa

  // Se type = 'operation'
  operation?: TemplateOperation;

  // Output
  outputVar?: string; // Nome da variável onde salvar resultado
  outputType?: 'structure' | 'topic' | 'characters' | 'soundtrack' | 'takes' | 'clean-text';

  // Validação (opcional)
  validation?: {
    minChars?: number;
    maxChars?: number;
    mustContain?: string[];
    isCleanText?: boolean; // Se true, valida que não tem markdown
  };
}

/**
 * Template Universal
 */
export interface UniversalTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;

  // Variáveis padrão do template
  defaultVariables: {
    NUM_TOPICOS: number;
    NUM_SUBTOPICOS: number;
    CARACTERES_TOTAIS: number;
    CARACTERES_POR_TOPICO?: number; // Auto-calculado
    CARACTERES_HOOK?: number;
  };

  // Sequência de steps a executar
  steps: UniversalStep[];

  // Arquivos a gerar no final
  outputs: {
    primary: TemplateOutput; // Roteiro completo (TTS-ready)
    optional: TemplateOutput[]; // Estrutura, Personagens, etc
  };
}

/**
 * Definição de arquivo de output
 */
export interface TemplateOutput {
  id: string;
  filename: string; // Ex: '01_Roteiro_Completo.txt'
  description: string;

  // Como construir o conteúdo
  buildFrom: 'variable' | 'join' | 'custom';

  // Se buildFrom = 'variable'
  sourceVar?: string;

  // Se buildFrom = 'join'
  joinVars?: string[];
  separator?: string;

  // Se buildFrom = 'custom'
  customBuilder?: (context: Record<string, any>) => string;

  // Formatação
  isCleanText?: boolean; // Se true, remove markdown
  stripMarkdown?: boolean;
}

/**
 * Contexto de execução do template
 */
export interface TemplateContext {
  // Variáveis do usuário
  userInput: {
    title: string;
    synopsis: string;
    knowledgeBase?: string;
    language: 'pt' | 'en' | 'es';
  };

  // Variáveis do template
  variables: Record<string, any>;

  // Respostas da IA
  aiResponses: Record<string, string>;

  // Arrays (ex: topicos[])
  arrays: Record<string, string[]>;

  // Mensagens da conversa
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    stepId: string;
  }>;
}

/**
 * Utilitário para validar texto limpo (sem markdown)
 */
export function isCleanText(text: string): boolean {
  const markdownPatterns = [
    /#{1,6}\s/, // Headers
    /\*\*(.+?)\*\*/, // Bold
    /\*(.+?)\*/, // Italic
    /_(.+?)_/, // Italic alternativo
    /\[(.+?)\]\(.+?\)/, // Links
    /`(.+?)`/, // Code inline
    /```[\s\S]*?```/, // Code blocks
    /^[-*+]\s/m, // Listas
    /^\d+\.\s/m, // Listas numeradas
  ];

  return !markdownPatterns.some(pattern => pattern.test(text));
}

/**
 * Utilitário para limpar markdown de um texto
 */
export function stripMarkdown(text: string): string {
  return text
    // Remove headers (## Título → Título)
    .replace(/#{1,6}\s+(.+?)$/gm, '$1')
    // Remove bold (**texto** → texto)
    .replace(/\*\*(.+?)\*\*/g, '$1')
    // Remove italic (*texto* → texto)
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    // Remove links ([texto](url) → texto)
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    // Remove code inline (`código` → código)
    .replace(/`(.+?)`/g, '$1')
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    // Remove listas (- item → item)
    .replace(/^[-*+]\s+/gm, '')
    // Remove listas numeradas (1. item → item)
    .replace(/^\d+\.\s+/gm, '')
    // Limpar linhas vazias múltiplas
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
