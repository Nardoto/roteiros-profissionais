import {
  UniversalTemplate,
  UniversalStep,
  TemplateOperation,
  TemplateContext,
  stripMarkdown,
  isCleanText,
} from '@/types/universal-template';
import { replaceUniversalVariables } from './universal-templates';

// ============================================================================
// EXECUTOR DO TEMPLATE UNIVERSAL
// ============================================================================

/**
 * Executa uma operação do template
 */
export function executeOperation(
  operation: TemplateOperation,
  context: TemplateContext
): void {
  switch (operation.type) {
    case 'SPLIT':
      executeSplit(operation, context);
      break;
    case 'JOIN':
      executeJoin(operation, context);
      break;
    case 'EXTRACT':
      executeExtract(operation, context);
      break;
    case 'REPLACE':
      executeReplace(operation, context);
      break;
    case 'LOOP':
      executeLoop(operation, context);
      break;
  }
}

/**
 * SPLIT - Divide texto em partes usando regex
 */
function executeSplit(
  operation: Extract<TemplateOperation, { type: 'SPLIT' }>,
  context: TemplateContext
): void {
  const input = context.variables[operation.input] || context.aiResponses[operation.input] || '';

  const regex = new RegExp(operation.pattern, 'i');
  const parts = input.split(regex).filter((p: string) => p.trim());

  context.arrays[operation.outputArray] = parts;

  console.log(`✂️ SPLIT: Dividiu "${operation.input}" em ${parts.length} partes → ${operation.outputArray}`);
}

/**
 * JOIN - Junta múltiplas strings em uma
 */
function executeJoin(
  operation: Extract<TemplateOperation, { type: 'JOIN' }>,
  context: TemplateContext
): void {
  const parts: string[] = [];

  for (const inputName of operation.inputs) {
    const value = context.variables[inputName] || context.aiResponses[inputName] || '';
    if (value && value.trim()) {
      parts.push(value);
    }
  }

  const result = parts.join(operation.separator);
  context.variables[operation.output] = result;

  console.log(`🔗 JOIN: Juntou ${parts.length} partes → ${operation.output} (${result.length} chars)`);
}

/**
 * EXTRACT - Extrai parte do texto usando regex
 */
function executeExtract(
  operation: Extract<TemplateOperation, { type: 'EXTRACT' }>,
  context: TemplateContext
): void {
  const input = context.variables[operation.input] || context.aiResponses[operation.input] || '';

  const regex = new RegExp(operation.pattern);
  const match = input.match(regex);

  const group = operation.group || 1;
  const result = match?.[group] || '';

  context.variables[operation.output] = result;

  console.log(`📤 EXTRACT: Extraiu de "${operation.input}" → ${operation.output} (${result.length} chars)`);
}

/**
 * REPLACE - Substitui texto usando regex
 */
function executeReplace(
  operation: Extract<TemplateOperation, { type: 'REPLACE' }>,
  context: TemplateContext
): void {
  const input = context.variables[operation.input] || context.aiResponses[operation.input] || '';

  const regex = new RegExp(operation.pattern, 'g');
  const replacement = replaceUniversalVariables(operation.replacement, context.variables);
  const result = input.replace(regex, replacement);

  context.variables[operation.output] = result;

  console.log(`🔄 REPLACE: Substituiu em "${operation.input}" → ${operation.output}`);
}

/**
 * LOOP - Executa steps para cada item de um array
 */
function executeLoop(
  operation: Extract<TemplateOperation, { type: 'LOOP' }>,
  context: TemplateContext
): void {
  const array = context.arrays[operation.array] || [];

  console.log(`🔁 LOOP: Iterando sobre ${array.length} items de "${operation.array}"`);

  for (let i = 0; i < array.length; i++) {
    const item = array[i];

    // Criar variáveis do loop
    context.variables[operation.itemVar] = item;
    if (operation.indexVar) {
      context.variables[operation.indexVar] = i + 1; // Index começa em 1
    }

    console.log(`  ↪ Item ${i + 1}/${array.length}: ${operation.itemVar} = "${item.substring(0, 50)}..."`);

    // Executar os steps do loop
    // NOTA: Steps do loop são apenas prompts, não operações aninhadas
    for (const step of operation.steps) {
      if (step.type === 'prompt') {
        // Este step será processado pelo executor principal
        // Aqui apenas registramos que ele existe
        console.log(`    📝 Step: ${step.name}`);
      }
    }
  }
}

/**
 * Valida texto limpo (sem markdown)
 */
export function validateCleanText(text: string, stepName: string): boolean {
  if (!isCleanText(text)) {
    console.warn(`⚠️ AVISO: "${stepName}" gerou texto com markdown! Limpando...`);
    return false;
  }
  return true;
}

/**
 * Limpa markdown de um texto se necessário
 */
export function ensureCleanText(text: string, shouldStrip: boolean = true): string {
  if (!shouldStrip) return text;

  if (!isCleanText(text)) {
    console.log('🧹 Limpando markdown do texto...');
    return stripMarkdown(text);
  }

  return text;
}

/**
 * Processa um step do template universal
 */
export function processStep(
  step: UniversalStep,
  context: TemplateContext
): { prompt?: string; isOperation: boolean } {
  if (step.type === 'operation') {
    // Executar operação
    if (step.operation) {
      executeOperation(step.operation, context);
    }
    return { isOperation: true };
  }

  // Gerar prompt
  if (step.type === 'prompt' && step.promptTemplate) {
    const prompt = replaceUniversalVariables(step.promptTemplate, {
      ...context.variables,
      ...context.userInput,
    });

    return { prompt, isOperation: false };
  }

  return { isOperation: false };
}

/**
 * Constrói arquivo de output baseado na definição
 */
export function buildOutput(
  outputDef: any,
  context: TemplateContext
): string {
  let content = '';

  if (outputDef.buildFrom === 'variable') {
    content = context.variables[outputDef.sourceVar!] || '';
  } else if (outputDef.buildFrom === 'join' && outputDef.joinVars) {
    const parts = outputDef.joinVars
      .map((varName: string) => context.variables[varName] || '')
      .filter((v: string) => v.trim());
    content = parts.join(outputDef.separator || '\n\n');
  } else if (outputDef.buildFrom === 'custom' && outputDef.customBuilder) {
    content = outputDef.customBuilder(context);
  }

  // Aplicar limpeza de markdown se necessário
  if (outputDef.stripMarkdown || outputDef.isCleanText) {
    content = ensureCleanText(content, true);
  }

  return content;
}

/**
 * Calcula caracteres por tópico baseado no total
 */
export function calculateCharactersPerTopic(
  totalChars: number,
  numTopics: number,
  hookChars: number = 1000
): number {
  const remainingChars = totalChars - hookChars;
  return Math.floor(remainingChars / numTopics);
}

/**
 * Prepara variáveis do template universal
 */
export function prepareUniversalVariables(
  template: UniversalTemplate,
  userInput: {
    title: string;
    synopsis: string;
    knowledgeBase?: string;
    language: 'pt' | 'en' | 'es';
    numTopics: number;
    numSubtopics: number;
    totalCharacters: number;
  },
  characterMultiplier: number = 1.0
): Record<string, any> {
  const adjustedTotalChars = Math.floor(userInput.totalCharacters * characterMultiplier);

  return {
    TITULO: userInput.title,
    SINOPSE: userInput.synopsis,
    BASE_CONHECIMENTO: userInput.knowledgeBase || '',
    NUM_TOPICOS: userInput.numTopics,
    NUM_SUBTOPICOS: userInput.numSubtopics,
    IDIOMA: userInput.language,
    CARACTERES_TOTAIS: adjustedTotalChars,
    CARACTERES_POR_TOPICO: calculateCharactersPerTopic(
      adjustedTotalChars,
      userInput.numTopics,
      template.defaultVariables.CARACTERES_HOOK
    ),
    CARACTERES_HOOK: Math.floor((template.defaultVariables.CARACTERES_HOOK || 1000) * characterMultiplier),
  };
}

/**
 * Extrai steps que são prompts (não operações)
 * Para uso no loop de geração
 */
export function extractPromptSteps(template: UniversalTemplate): UniversalStep[] {
  const promptSteps: UniversalStep[] = [];

  for (const step of template.steps) {
    if (step.type === 'prompt') {
      promptSteps.push(step);
    } else if (step.type === 'operation' && step.operation?.type === 'LOOP') {
      // Adicionar os steps dentro do loop
      const loopOp = step.operation as Extract<TemplateOperation, { type: 'LOOP' }>;
      for (const loopStep of loopOp.steps) {
        if (loopStep.type === 'prompt') {
          promptSteps.push(loopStep);
        }
      }
    }
  }

  return promptSteps;
}

/**
 * Determina quais steps executar baseado nas operações
 */
export function getExecutionPlan(template: UniversalTemplate): {
  steps: UniversalStep[];
  totalSteps: number;
} {
  const steps: UniversalStep[] = [];

  for (const step of template.steps) {
    if (step.type === 'prompt') {
      steps.push(step);
    } else if (step.type === 'operation' && step.operation?.type === 'LOOP') {
      // LOOP será expandido em runtime baseado no array
      steps.push(step);
    }
    // Outras operações (SPLIT, JOIN, etc) não geram steps visíveis
  }

  return { steps, totalSteps: steps.length };
}
