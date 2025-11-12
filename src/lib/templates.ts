import { PromptTemplate } from '@/types/conversation';

// ============================================================================
// TEMPLATES DE ROTEIRO - Estruturas prontas para diferentes tipos de vídeo
// ============================================================================

/**
 * TEMPLATE 1: HISTÓRIA BÍBLICA
 * Baseado no workflow do arquivo "CMO ESCREVER HISTORIAS.txt"
 */
export const TEMPLATE_HISTORIA_BIBLICA: PromptTemplate = {
  id: 'historia-biblica',
  name: 'História Bíblica',
  description: 'Narrativa bíblica completa com tópicos e subtópicos',
  icon: '📖',

  variables: {
    TITULO: '',
    SINOPSE: '',
    BASE_CONHECIMENTO: '',
    NUM_TOPICOS: 3,
    NUM_SUBTOPICOS: 8,
    IDIOMA: 'pt',
    CARACTERES_TOTAIS: 60000,
    CARACTERES_POR_TOPICO: 20000,
    CARACTERES_HOOK: 1000,
  },

  steps: [
    // STEP 1: Gerar estrutura completa
    {
      id: 'estrutura',
      name: 'Estrutura',
      description: 'Criar estrutura com tópicos e subtópicos',
      promptTemplate: `Possuo um canal no YouTube de histórias bíblicas. Se fosse para criar um roteiro sobre "{{TITULO}}" em {{NUM_TOPICOS}} tópicos como se fosse uma narrativa de livro e em ordem cronológica, sem que informações fiquem repetidas, como você criaria?

Sinopse: {{SINOPSE}}
{{BASE_CONHECIMENTO}}

Escreva em {{IDIOMA_NOME}}. Os tópicos não devem conter introdução e nem conclusão, e devem ser bem divididos para que os espectadores não se sintam perdidos no vídeo. Cada tópico deve ter {{NUM_SUBTOPICOS}} subtópicos.

⚠️ IMPORTANTE: Use EXATAMENTE o formato abaixo (com "TÓPICO" em maiúsculas e dois-pontos após o número):

TÓPICO 1: [NOME DO TÓPICO]
1.1 [Nome do subtópico]
1.2 [Nome do subtópico]
...
1.{{NUM_SUBTOPICOS}} [Nome do subtópico]

TÓPICO 2: [NOME DO TÓPICO]
2.1 [Nome do subtópico]
...

Numere os subtópicos como 1.1, 1.2 etc... e NÃO desenvolva os subtópicos, quero apenas seus títulos.

REPITA: Você DEVE gerar EXATAMENTE {{NUM_TOPICOS}} tópicos usando o formato "TÓPICO 1:", "TÓPICO 2:", etc.`,
      usesContext: false,
      autoExecute: true,
      outputType: 'structure',
    },

    // STEP 2: Hook/Introdução
    {
      id: 'hook',
      name: 'Hook/Introdução',
      description: 'Criar introdução imersiva de 1000 caracteres',
      promptTemplate: `Faça uma introdução imersiva e chamativa e curiosa de {{CARACTERES_HOOK}} caracteres que prenda o espectador.

Escreva em {{IDIOMA}}.

A estrutura do roteiro foi fornecida anteriormente na conversa.`,
      usesContext: true, // USA CONTEXTO!
      autoExecute: true,
      outputType: 'hook',
      validation: {
        minChars: 800,
        maxChars: 1200,
      },
    },

    // STEP 3-N: Cada tópico (gerado dinamicamente)
    {
      id: 'topico',
      name: 'Tópico',
      description: 'Escrever tópico completo',
      promptTemplate: `Faça agora o Tópico {{TOPICO_NUM}}, faça sem palavras difíceis, um texto narrativo limpo e direto, sem muita enrolação. Os capítulos e versículos devem ser mencionados de forma natural no texto antes de sua citação, para que não haja uma quebra brusca de narrativa.

Quero que você se baseie em cada tópico, de forma individual, para fazer uma produção textual se limitando a dizer apenas ao que o tópico está pedindo. E principalmente NÃO repita informações ditas antes por outros tópicos.

Siga essa instrução para escrever os parágrafos de cada tópico:

Escreva como se fosse uma narrativa de um livro, em terceira pessoa, usando sempre versículos bíblicos referente ao momento da história. Escreva como um experiente escritor e sábio. Escreva de uma forma que promova dinamismo e imersão. O texto precisa ser fluido e não pode ser cansativo. Escreva um texto humanizado que gere conexão com o espectador. O texto deve ser principalmente fiel ao texto bíblico, sem adicionar informações que a bíblia não fala. Use uma linguagem simples e de fácil entendimento.

Escreva em {{IDIOMA}}.

Faça o tópico {{TOPICO_NUM}} com {{CARACTERES_POR_TOPICO}} caracteres separados dentre os {{NUM_SUBTOPICOS}} subtópicos. Não repita versículos e nem informações já ditas antes.

Esse é o tópico:
{{TOPICO_ESTRUTURA}}`,
      usesContext: true, // USA CONTEXTO!
      autoExecute: true,
      outputType: 'topic',
      validation: {
        minChars: 18000,
      },
    },

    // STEP 4: Personagens (DEPOIS de todos os tópicos)
    {
      id: 'personagens',
      name: 'Personagens',
      description: 'Listar personagens e suas características',
      promptTemplate: `Agora que o roteiro completo foi escrito, liste TODOS os personagens mencionados na história.

Para cada personagem, forneça:
- Nome completo
- Papel na história (protagonista, antagonista, coadjuvante)
- Características físicas (se mencionadas)
- Personalidade
- Motivações
- Versículos bíblicos onde aparece

Escreva em {{IDIOMA}}.

Baseie-se APENAS no roteiro que foi gerado anteriormente. Não invente informações.`,
      usesContext: true,
      autoExecute: true,
      outputType: 'characters',
    },

    // STEP 5: Trilha Sonora (DEPOIS de todos os tópicos)
    {
      id: 'trilha',
      name: 'Trilha Sonora',
      description: 'Sugerir trilha sonora para cada momento',
      promptTemplate: `Com base no roteiro completo, sugira a trilha sonora ideal para cada seção do vídeo.

Para cada momento (Hook, cada Tópico), indique:
- Tipo de música (épica, dramática, contemplativa, tensa, etc)
- Instrumentação sugerida (orquestra, piano, cordas, percussão, etc)
- Intensidade (baixa, média, alta)
- Momento exato onde trocar de música
- Referências de músicas similares (opcional)

Escreva em {{IDIOMA}}.

Crie transições suaves entre as músicas para manter o espectador imerso.`,
      usesContext: true,
      autoExecute: true,
      outputType: 'soundtrack',
    },

    // STEP 6: Takes/Divisão de Cenas (DEPOIS de todos os tópicos)
    {
      id: 'takes',
      name: 'Divisão em Takes',
      description: 'Dividir roteiro em takes/cenas para gravação',
      promptTemplate: `Divida o roteiro completo em TAKES (cenas) numeradas para facilitar a gravação e edição.

Para cada take, forneça:
- Número do take
- Texto exato a ser narrado
- Duração estimada (baseado em {{CARACTERES_TOTAIS}} caracteres)
- Sugestão de imagem/B-roll
- Tom de voz (neutro, dramático, empolgante, reflexivo)

Escreva em {{IDIOMA}}.

Divida em takes de aproximadamente 30-60 segundos cada para facilitar a edição. Indique onde fazer pausas naturais.`,
      usesContext: true,
      autoExecute: true,
      outputType: 'takes',
    },
  ],
};

/**
 * TEMPLATE 2: VÍDEO DE CURIOSIDADES
 * Formato mais direto, lista de fatos interessantes
 */
export const TEMPLATE_CURIOSIDADES: PromptTemplate = {
  id: 'curiosidades',
  name: 'Curiosidades',
  description: 'Lista de curiosidades/fatos interessantes',
  icon: '🤔',

  variables: {
    TITULO: '',
    SINOPSE: '',
    BASE_CONHECIMENTO: '',
    NUM_TOPICOS: 5,
    NUM_SUBTOPICOS: 3,
    IDIOMA: 'pt',
    CARACTERES_TOTAIS: 15000,
    CARACTERES_POR_TOPICO: 3000,
    CARACTERES_HOOK: 600,
  },

  steps: [
    {
      id: 'estrutura',
      name: 'Estrutura',
      description: 'Criar lista de curiosidades',
      promptTemplate: `Crie uma estrutura de curiosidades sobre "{{TITULO}}" com {{NUM_TOPICOS}} curiosidades principais.

Contexto: {{SINOPSE}}
{{BASE_CONHECIMENTO}}

⚠️ IMPORTANTE: Use EXATAMENTE o formato abaixo (com "CURIOSIDADE" em maiúsculas e dois-pontos após o número):

CURIOSIDADE 1: [Título chamativo]
1.1 [Subtópico]
1.2 [Subtópico]
1.3 [Subtópico]

CURIOSIDADE 2: [Título chamativo]
2.1 [Subtópico]
2.2 [Subtópico]
2.3 [Subtópico]

...

REPITA: Você DEVE gerar EXATAMENTE {{NUM_TOPICOS}} curiosidades usando o formato "CURIOSIDADE 1:", "CURIOSIDADE 2:", etc.`,
      usesContext: false,
      autoExecute: true,
      outputType: 'structure',
    },

    {
      id: 'hook',
      name: 'Hook/Introdução',
      description: 'Criar gancho inicial',
      promptTemplate: `Crie um hook curto e direto de {{CARACTERES_HOOK}} caracteres que desperte curiosidade sobre: {{TITULO}}

Torne impactante e misterioso!`,
      usesContext: true,
      autoExecute: true,
      outputType: 'hook',
      validation: {
        minChars: 500,
        maxChars: 700,
      },
    },

    {
      id: 'curiosidade',
      name: 'Curiosidade',
      description: 'Desenvolver curiosidade',
      promptTemplate: `Desenvolva a CURIOSIDADE {{TOPICO_NUM}} de forma direta e fascinante.

Use linguagem simples, dados interessantes, exemplos concretos.

Escreva aproximadamente {{CARACTERES_POR_TOPICO}} caracteres.

A curiosidade é:
{{TOPICO_ESTRUTURA}}`,
      usesContext: true,
      autoExecute: true,
      outputType: 'topic',
    },
  ],
};

/**
 * TEMPLATE 3: DOCUMENTÁRIO
 * Formato educacional com atos
 */
export const TEMPLATE_DOCUMENTARIO: PromptTemplate = {
  id: 'documentario',
  name: 'Documentário',
  description: 'Formato educacional com atos dramáticos',
  icon: '🎬',

  variables: {
    TITULO: '',
    SINOPSE: '',
    BASE_CONHECIMENTO: '',
    NUM_TOPICOS: 4,
    NUM_SUBTOPICOS: 5,
    IDIOMA: 'pt',
    CARACTERES_TOTAIS: 50000,
    CARACTERES_POR_TOPICO: 12500,
    CARACTERES_HOOK: 1200,
  },

  steps: [
    {
      id: 'estrutura',
      name: 'Estrutura',
      description: 'Criar estrutura de atos',
      promptTemplate: `Crie estrutura de documentário sobre "{{TITULO}}" em {{NUM_TOPICOS}} atos dramáticos.

Contexto: {{SINOPSE}}
{{BASE_CONHECIMENTO}}

Formate:

ATO 1: [Título do ato]
1.1 [Subtópico]
1.2 [Subtópico]
...`,
      usesContext: false,
      autoExecute: true,
      outputType: 'structure',
    },

    {
      id: 'hook',
      name: 'Hook Documental',
      description: 'Abertura impactante',
      promptTemplate: `Crie abertura de documentário de {{CARACTERES_HOOK}} caracteres para: {{TITULO}}

Use tom jornalístico, dados impactantes, contexto histórico.`,
      usesContext: true,
      autoExecute: true,
      outputType: 'hook',
    },

    {
      id: 'ato',
      name: 'Ato',
      description: 'Desenvolver ato do documentário',
      promptTemplate: `Desenvolva o ATO {{TOPICO_NUM}} em formato documental.

Use tom educativo, dados históricos, narrativa envolvente.

Aproximadamente {{CARACTERES_POR_TOPICO}} caracteres.

O ato é:
{{TOPICO_ESTRUTURA}}`,
      usesContext: true,
      autoExecute: true,
      outputType: 'topic',
    },
  ],
};

// ============================================================================
// EXPORT ALL TEMPLATES
// ============================================================================

export const ALL_TEMPLATES: PromptTemplate[] = [
  TEMPLATE_HISTORIA_BIBLICA,
  TEMPLATE_CURIOSIDADES,
  TEMPLATE_DOCUMENTARIO,
];

export function getTemplateById(id: string): PromptTemplate | undefined {
  return ALL_TEMPLATES.find((t) => t.id === id);
}

// ============================================================================
// HELPER: Substituir variáveis no template
// ============================================================================

export function replaceVariables(template: string, variables: Record<string, any>): string {
  let result = template;

  // Substituir todas as {{VARIAVEIS}}
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, String(value ?? ''));
  });

  // Substituir idioma por nome completo
  if (variables.IDIOMA) {
    const idiomaMap: Record<string, string> = {
      pt: 'português',
      en: 'inglês',
      es: 'espanhol',
    };
    result = result.replace(/{{IDIOMA_NOME}}/g, idiomaMap[variables.IDIOMA] || 'português');
  }

  // Limpar base de conhecimento se vazia
  if (!variables.BASE_CONHECIMENTO || variables.BASE_CONHECIMENTO.trim() === '') {
    result = result.replace(/{{BASE_CONHECIMENTO}}/g, '');
  } else {
    result = result.replace(/{{BASE_CONHECIMENTO}}/g, `\nInformações extras:\n${variables.BASE_CONHECIMENTO}`);
  }

  return result;
}
