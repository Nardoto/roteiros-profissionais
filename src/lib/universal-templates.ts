import { UniversalTemplate } from '@/types/universal-template';

// ============================================================================
// TEMPLATES UNIVERSAIS - Novo formato sem Hook separado
// ============================================================================

/**
 * TEMPLATE UNIVERSAL 1: HISTÓRIA BÍBLICA
 *
 * Fluxo:
 * 1. Gerar estrutura geral
 * 2. Gerar HOOK inicial (integrado ao roteiro)
 * 3. Desenvolver CADA tópico com texto LIMPO (sem markdown)
 * 4. Opcionais: Personagens, Trilha, Takes
 */
export const TEMPLATE_HISTORIA_BIBLICA: UniversalTemplate = {
  id: 'historia-biblica',
  name: 'História Bíblica',
  description: 'Narrativa bíblica completa com tópicos e subtópicos',
  icon: '📖',

  defaultVariables: {
    NUM_TOPICOS: 3,
    NUM_SUBTOPICOS: 8,
    CARACTERES_TOTAIS: 60000, // Apenas o roteiro TTS
    CARACTERES_HOOK: 1000,
  },

  steps: [
    // ========== STEP 1: ESTRUTURA GERAL ==========
    {
      id: 'estrutura',
      name: 'Estrutura Geral',
      description: 'Criar visão geral do roteiro',
      type: 'prompt',
      promptTemplate: `Possuo um canal no YouTube de histórias bíblicas. Se fosse para criar um roteiro sobre "{{TITULO}}" em {{NUM_TOPICOS}} tópicos como se fosse uma narrativa de livro e em ordem cronológica, sem que informações fiquem repetidas, como você criaria?

Sinopse: {{SINOPSE}}
{{BASE_CONHECIMENTO}}

Escreva em {{IDIOMA_NOME}}. Os tópicos não devem conter introdução e nem conclusão, e devem ser bem divididos para que os espectadores não se sintam perdidos no vídeo. Cada tópico deve ter {{NUM_SUBTOPICOS}} subtópicos. Formate exatamente assim e numere os subtópicos como 1.1, 1.2 etc... e NÃO desenvolva os subtópicos, quero apenas seus títulos.

TÓPICO 1: [NOME DO TÓPICO]
1.1 [Nome do subtópico]
1.2 [Nome do subtópico]
...`,
      usesContext: false,
      outputVar: 'ESTRUTURA',
      outputType: 'structure',
    },

    // ========== STEP 2: HOOK INICIAL (para o roteiro completo) ==========
    {
      id: 'hook',
      name: 'Hook Inicial',
      description: 'Criar gancho inicial do roteiro',
      type: 'prompt',
      promptTemplate: `Agora crie uma introdução de {{CARACTERES_HOOK}} caracteres muito imersiva e chamativa, que prenda o espectador desde o primeiro segundo do vídeo.

Escreva em {{IDIOMA_NOME}}.

IMPORTANTE:
- Escreva um texto LIMPO, sem markdown, pronto para narração (TTS)
- Não use negrito (**), itálico (*), títulos (##), listas (-)
- Apenas texto narrativo puro
- A estrutura do roteiro foi fornecida anteriormente`,
      usesContext: true,
      outputVar: 'HOOK',
      outputType: 'clean-text',
      validation: {
        minChars: 800,
        maxChars: 1200,
        isCleanText: true,
      },
    },

    // ========== STEP 3: OPERAÇÃO SPLIT - Dividir estrutura em tópicos ==========
    {
      id: 'split-topicos',
      name: 'Dividir Tópicos',
      description: 'Extrair cada tópico da estrutura',
      type: 'operation',
      operation: {
        type: 'SPLIT',
        input: 'ESTRUTURA',
        pattern: 'T[oó]pico? \\d+:', // Regex multilíngue
        outputArray: 'TOPICOS_ARRAY',
      },
    },

    // ========== STEP 4: LOOP - Desenvolver cada tópico ==========
    {
      id: 'loop-topicos',
      name: 'Desenvolver Tópicos',
      description: 'Gerar cada tópico em profundidade',
      type: 'operation',
      operation: {
        type: 'LOOP',
        array: 'TOPICOS_ARRAY',
        itemVar: 'TOPICO_ESTRUTURA',
        indexVar: 'TOPICO_NUM',
        steps: [
          {
            id: 'topico',
            name: 'Tópico {{TOPICO_NUM}}',
            description: 'Escrever tópico completo',
            type: 'prompt',
            promptTemplate: `Faça agora o Tópico {{TOPICO_NUM}}, faça sem palavras difíceis, um texto narrativo limpo e direto, sem muita enrolação. Os capítulos e versículos devem ser mencionados de forma natural no texto antes de sua citação, para que não haja uma quebra brusca de narrativa.

Quero que você se baseie em cada tópico, de forma individual, para fazer uma produção textual se limitando a dizer apenas ao que o tópico está pedindo. E principalmente não repita informações dita antes por outros tópicos. E nem vá além do que o tópico está pedindo, pois irá interferir na narrativa dos próximos tópicos.

Siga essa instrução para escrever os parágrafos de cada tópico:

Escreva como se fosse uma narrativa de um livro, em terceira pessoa, usando sempre versículos bíblicos referente ao momento da história, não importa se ele é grande. Escreva como um experiente escritor e sábio, se comporte como tal. Escreva de uma forma que promova dinamismo e imersão. O texto precisa ser fluido e o texto não pode ser cansativo. Escreva um texto humanizado que gere conexão com o espectador. O texto deve ser principalmente fiel ao texto bíblico, sem adicionar informações que a bíblia não fala. Pense em um estilo de comunicação claro e direto na narrativa, sem enrolação. Escreva de uma forma dinâmica, para que até uma criança consiga entender, como se estivesse conversando diretamente com uma única pessoa. Não crie nenhuma conclusão sobre o tópico, apenas o encerre de forma direta sem reflexões. Use uma linguagem simples e de fácil entendimento.

Escreva em {{IDIOMA_NOME}}.

MUITO IMPORTANTE - FORMATAÇÃO:
- Escreva um texto LIMPO, sem markdown, pronto para narração (TTS)
- NÃO use negrito (**), itálico (*), títulos (##), listas (-)
- Apenas parágrafos de texto narrativo puro
- Separe parágrafos com linha em branco

Faça o tópico {{TOPICO_NUM}} com {{CARACTERES_POR_TOPICO}} caracteres separados dentre os {{NUM_SUBTOPICOS}} subtópicos. Não repita versículos e nem informações já ditas antes.

Esse é o tópico:
Tópico {{TOPICO_NUM}}: {{TOPICO_ESTRUTURA}}`,
            usesContext: true,
            outputVar: 'TOPICO_{{TOPICO_NUM}}',
            outputType: 'clean-text',
            validation: {
              minChars: 18000,
              isCleanText: true,
            },
          },
        ],
      },
    },

    // ========== STEP 5: JOIN - Juntar Hook + Todos os tópicos ==========
    {
      id: 'join-roteiro',
      name: 'Montar Roteiro Completo',
      description: 'Juntar hook e tópicos',
      type: 'operation',
      operation: {
        type: 'JOIN',
        inputs: ['HOOK', ...Array.from({ length: 10 }, (_, i) => `TOPICO_${i + 1}`)], // Até 10 tópicos
        separator: '\n\n',
        output: 'ROTEIRO_COMPLETO',
      },
    },

    // ========== OPCIONAIS (executados apenas se solicitado) ==========

    // STEP 6: Personagens
    {
      id: 'personagens',
      name: 'Personagens',
      description: 'Listar personagens e características',
      type: 'prompt',
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
      outputVar: 'PERSONAGENS',
      outputType: 'characters',
    },

    // STEP 7: Trilha Sonora
    {
      id: 'trilha',
      name: 'Trilha Sonora',
      description: 'Sugerir trilha sonora',
      type: 'prompt',
      promptTemplate: `Com base no roteiro completo, sugira a trilha sonora ideal para cada seção do vídeo.

Para cada momento (Introdução, cada Tópico), indique:
- Tipo de música (épica, dramática, contemplativa, tensa, etc)
- Instrumentação sugerida (orquestra, piano, cordas, percussão, etc)
- Intensidade (baixa, média, alta)
- Momento exato onde trocar de música
- Referências de músicas similares (opcional)

Escreva em {{IDIOMA}}.

Crie transições suaves entre as músicas para manter o espectador imerso.`,
      usesContext: true,
      outputVar: 'TRILHA',
      outputType: 'soundtrack',
    },

    // STEP 8: Takes
    {
      id: 'takes',
      name: 'Divisão em Takes',
      description: 'Dividir roteiro em cenas',
      type: 'prompt',
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
      outputVar: 'TAKES',
      outputType: 'takes',
    },
  ],

  // ========== DEFINIÇÃO DOS ARQUIVOS DE OUTPUT ==========
  outputs: {
    // ARQUIVO PRINCIPAL (TTS-ready)
    primary: {
      id: 'roteiro-completo',
      filename: '01_Roteiro_Completo.txt',
      description: 'Roteiro completo pronto para TTS (Hook + Tópicos)',
      buildFrom: 'variable',
      sourceVar: 'ROTEIRO_COMPLETO',
      isCleanText: true,
      stripMarkdown: true,
    },

    // ARQUIVOS OPCIONAIS
    optional: [
      {
        id: 'estrutura',
        filename: '00_Estrutura.txt',
        description: 'Estrutura geral do roteiro (referência)',
        buildFrom: 'variable',
        sourceVar: 'ESTRUTURA',
        isCleanText: false,
      },
      {
        id: 'personagens',
        filename: 'Personagens.txt',
        description: 'Lista de personagens e características',
        buildFrom: 'variable',
        sourceVar: 'PERSONAGENS',
        isCleanText: false,
      },
      {
        id: 'trilha',
        filename: 'Trilha_Sonora.txt',
        description: 'Sugestões de trilha sonora',
        buildFrom: 'variable',
        sourceVar: 'TRILHA',
        isCleanText: false,
      },
      {
        id: 'takes',
        filename: 'Takes.txt',
        description: 'Divisão em takes/cenas para gravação',
        buildFrom: 'variable',
        sourceVar: 'TAKES',
        isCleanText: false,
      },
    ],
  },
};

/**
 * TEMPLATE UNIVERSAL 2: CURIOSIDADES
 */
export const TEMPLATE_CURIOSIDADES: UniversalTemplate = {
  id: 'curiosidades',
  name: 'Curiosidades',
  description: 'Lista de curiosidades/fatos interessantes',
  icon: '🤔',

  defaultVariables: {
    NUM_TOPICOS: 5,
    NUM_SUBTOPICOS: 3,
    CARACTERES_TOTAIS: 15000,
    CARACTERES_HOOK: 600,
  },

  steps: [
    {
      id: 'estrutura',
      name: 'Estrutura',
      type: 'prompt',
      description: 'Criar lista de curiosidades',
      promptTemplate: `Crie uma estrutura de curiosidades sobre "{{TITULO}}" com {{NUM_TOPICOS}} curiosidades principais.

Contexto: {{SINOPSE}}
{{BASE_CONHECIMENTO}}

Formate assim:

CURIOSIDADE 1: [Título chamativo]
1.1 [Subtópico]
1.2 [Subtópico]
1.3 [Subtópico]

CURIOSIDADE 2: [Título chamativo]
...`,
      usesContext: false,
      outputVar: 'ESTRUTURA',
      outputType: 'structure',
    },

    {
      id: 'hook',
      name: 'Hook',
      type: 'prompt',
      description: 'Criar gancho inicial',
      promptTemplate: `Crie um hook curto e direto de {{CARACTERES_HOOK}} caracteres que desperte curiosidade sobre: {{TITULO}}

Escreva em {{IDIOMA}}.

IMPORTANTE: Texto LIMPO, sem markdown, pronto para narração.

Torne impactante e misterioso!`,
      usesContext: true,
      outputVar: 'HOOK',
      outputType: 'clean-text',
      validation: {
        minChars: 500,
        maxChars: 700,
        isCleanText: true,
      },
    },

    {
      id: 'split-curiosidades',
      name: 'Dividir Curiosidades',
      type: 'operation',
      description: 'Extrair cada curiosidade',
      operation: {
        type: 'SPLIT',
        input: 'ESTRUTURA',
        pattern: 'CURIOSIDADE \\d+:',
        outputArray: 'CURIOSIDADES_ARRAY',
      },
    },

    {
      id: 'loop-curiosidades',
      name: 'Desenvolver Curiosidades',
      type: 'operation',
      description: 'Gerar cada curiosidade',
      operation: {
        type: 'LOOP',
        array: 'CURIOSIDADES_ARRAY',
        itemVar: 'CURIOSIDADE_ESTRUTURA',
        indexVar: 'CURIOSIDADE_NUM',
        steps: [
          {
            id: 'curiosidade',
            name: 'Curiosidade {{CURIOSIDADE_NUM}}',
            type: 'prompt',
            description: 'Desenvolver curiosidade',
            promptTemplate: `Desenvolva a CURIOSIDADE {{CURIOSIDADE_NUM}} de forma direta e fascinante.

Use linguagem simples, dados interessantes, exemplos concretos.

Escreva em {{IDIOMA}}.

IMPORTANTE: Texto LIMPO, sem markdown, pronto para narração.

Escreva aproximadamente {{CARACTERES_POR_TOPICO}} caracteres.

A curiosidade é:
Curiosidade {{CURIOSIDADE_NUM}}: {{CURIOSIDADE_ESTRUTURA}}`,
            usesContext: true,
            outputVar: 'CURIOSIDADE_{{CURIOSIDADE_NUM}}',
            outputType: 'clean-text',
            validation: {
              isCleanText: true,
            },
          },
        ],
      },
    },

    {
      id: 'join-roteiro',
      name: 'Montar Roteiro',
      type: 'operation',
      description: 'Juntar tudo',
      operation: {
        type: 'JOIN',
        inputs: ['HOOK', ...Array.from({ length: 10 }, (_, i) => `CURIOSIDADE_${i + 1}`)],
        separator: '\n\n',
        output: 'ROTEIRO_COMPLETO',
      },
    },
  ],

  outputs: {
    primary: {
      id: 'roteiro-completo',
      filename: '01_Roteiro_Completo.txt',
      description: 'Roteiro completo de curiosidades',
      buildFrom: 'variable',
      sourceVar: 'ROTEIRO_COMPLETO',
      isCleanText: true,
      stripMarkdown: true,
    },
    optional: [
      {
        id: 'estrutura',
        filename: '00_Estrutura.txt',
        description: 'Estrutura das curiosidades',
        buildFrom: 'variable',
        sourceVar: 'ESTRUTURA',
        isCleanText: false,
      },
    ],
  },
};

/**
 * TEMPLATE UNIVERSAL 3: DOCUMENTÁRIO
 */
export const TEMPLATE_DOCUMENTARIO: UniversalTemplate = {
  id: 'documentario',
  name: 'Documentário',
  description: 'Formato educacional com atos dramáticos',
  icon: '🎬',

  defaultVariables: {
    NUM_TOPICOS: 4,
    NUM_SUBTOPICOS: 5,
    CARACTERES_TOTAIS: 50000,
    CARACTERES_HOOK: 1200,
  },

  steps: [
    {
      id: 'estrutura',
      name: 'Estrutura',
      type: 'prompt',
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
      outputVar: 'ESTRUTURA',
      outputType: 'structure',
    },

    {
      id: 'hook',
      name: 'Hook Documental',
      type: 'prompt',
      description: 'Abertura impactante',
      promptTemplate: `Crie abertura de documentário de {{CARACTERES_HOOK}} caracteres para: {{TITULO}}

Escreva em {{IDIOMA}}.

IMPORTANTE: Texto LIMPO, sem markdown, pronto para narração.

Use tom jornalístico, dados impactantes, contexto histórico.`,
      usesContext: true,
      outputVar: 'HOOK',
      outputType: 'clean-text',
      validation: {
        isCleanText: true,
      },
    },

    {
      id: 'split-atos',
      name: 'Dividir Atos',
      type: 'operation',
      description: 'Extrair cada ato',
      operation: {
        type: 'SPLIT',
        input: 'ESTRUTURA',
        pattern: 'ATO \\d+:',
        outputArray: 'ATOS_ARRAY',
      },
    },

    {
      id: 'loop-atos',
      name: 'Desenvolver Atos',
      type: 'operation',
      description: 'Gerar cada ato',
      operation: {
        type: 'LOOP',
        array: 'ATOS_ARRAY',
        itemVar: 'ATO_ESTRUTURA',
        indexVar: 'ATO_NUM',
        steps: [
          {
            id: 'ato',
            name: 'Ato {{ATO_NUM}}',
            type: 'prompt',
            description: 'Desenvolver ato',
            promptTemplate: `Desenvolva o ATO {{ATO_NUM}} em formato documental.

Use tom educativo, dados históricos, narrativa envolvente.

Escreva em {{IDIOMA}}.

IMPORTANTE: Texto LIMPO, sem markdown, pronto para narração.

Aproximadamente {{CARACTERES_POR_TOPICO}} caracteres.

O ato é:
Ato {{ATO_NUM}}: {{ATO_ESTRUTURA}}`,
            usesContext: true,
            outputVar: 'ATO_{{ATO_NUM}}',
            outputType: 'clean-text',
            validation: {
              isCleanText: true,
            },
          },
        ],
      },
    },

    {
      id: 'join-roteiro',
      name: 'Montar Documentário',
      type: 'operation',
      description: 'Juntar tudo',
      operation: {
        type: 'JOIN',
        inputs: ['HOOK', ...Array.from({ length: 10 }, (_, i) => `ATO_${i + 1}`)],
        separator: '\n\n',
        output: 'ROTEIRO_COMPLETO',
      },
    },
  ],

  outputs: {
    primary: {
      id: 'roteiro-completo',
      filename: '01_Roteiro_Completo.txt',
      description: 'Roteiro completo do documentário',
      buildFrom: 'variable',
      sourceVar: 'ROTEIRO_COMPLETO',
      isCleanText: true,
      stripMarkdown: true,
    },
    optional: [
      {
        id: 'estrutura',
        filename: '00_Estrutura.txt',
        description: 'Estrutura do documentário',
        buildFrom: 'variable',
        sourceVar: 'ESTRUTURA',
        isCleanText: false,
      },
    ],
  },
};

/**
 * TEMPLATE UNIVERSAL 4: TEATRO/ROTEIRO DRAMÁTICO
 */
export const TEMPLATE_TEATRO: UniversalTemplate = {
  id: 'teatro',
  name: 'Teatro',
  description: 'Roteiro dramático com diálogos e direções',
  icon: '🎭',

  defaultVariables: {
    NUM_TOPICOS: 3,
    NUM_SUBTOPICOS: 6,
    CARACTERES_TOTAIS: 40000,
    CARACTERES_HOOK: 800,
  },

  steps: [
    {
      id: 'estrutura',
      name: 'Estrutura',
      type: 'prompt',
      description: 'Criar estrutura de cenas',
      promptTemplate: `Crie estrutura teatral sobre "{{TITULO}}" em {{NUM_TOPICOS}} atos/cenas principais.

Contexto: {{SINOPSE}}
{{BASE_CONHECIMENTO}}

Formate:

CENA 1: [Título da cena]
1.1 [Momento/beat]
1.2 [Momento/beat]
...`,
      usesContext: false,
      outputVar: 'ESTRUTURA',
      outputType: 'structure',
    },

    {
      id: 'hook',
      name: 'Prólogo',
      type: 'prompt',
      description: 'Prólogo/abertura teatral',
      promptTemplate: `Crie um prólogo teatral de {{CARACTERES_HOOK}} caracteres para: {{TITULO}}

Escreva em {{IDIOMA}}.

IMPORTANTE: Texto LIMPO, pronto para narração/encenação.

Estabeleça o tom, o cenário, e prepare o público.`,
      usesContext: true,
      outputVar: 'HOOK',
      outputType: 'clean-text',
      validation: {
        isCleanText: true,
      },
    },

    {
      id: 'split-cenas',
      name: 'Dividir Cenas',
      type: 'operation',
      description: 'Extrair cada cena',
      operation: {
        type: 'SPLIT',
        input: 'ESTRUTURA',
        pattern: 'CENA \\d+:',
        outputArray: 'CENAS_ARRAY',
      },
    },

    {
      id: 'loop-cenas',
      name: 'Desenvolver Cenas',
      type: 'operation',
      description: 'Gerar cada cena',
      operation: {
        type: 'LOOP',
        array: 'CENAS_ARRAY',
        itemVar: 'CENA_ESTRUTURA',
        indexVar: 'CENA_NUM',
        steps: [
          {
            id: 'cena',
            name: 'Cena {{CENA_NUM}}',
            type: 'prompt',
            description: 'Desenvolver cena',
            promptTemplate: `Desenvolva a CENA {{CENA_NUM}} em formato teatral/dramático.

Inclua diálogos, direções de cena, emoções dos personagens.

Escreva em {{IDIOMA}}.

IMPORTANTE: Texto LIMPO, pronto para leitura dramática.

Aproximadamente {{CARACTERES_POR_TOPICO}} caracteres.

A cena é:
Cena {{CENA_NUM}}: {{CENA_ESTRUTURA}}`,
            usesContext: true,
            outputVar: 'CENA_{{CENA_NUM}}',
            outputType: 'clean-text',
            validation: {
              isCleanText: true,
            },
          },
        ],
      },
    },

    {
      id: 'join-roteiro',
      name: 'Montar Roteiro Teatral',
      type: 'operation',
      description: 'Juntar tudo',
      operation: {
        type: 'JOIN',
        inputs: ['HOOK', ...Array.from({ length: 10 }, (_, i) => `CENA_${i + 1}`)],
        separator: '\n\n',
        output: 'ROTEIRO_COMPLETO',
      },
    },
  ],

  outputs: {
    primary: {
      id: 'roteiro-completo',
      filename: '01_Roteiro_Completo.txt',
      description: 'Roteiro teatral completo',
      buildFrom: 'variable',
      sourceVar: 'ROTEIRO_COMPLETO',
      isCleanText: true,
      stripMarkdown: true,
    },
    optional: [
      {
        id: 'estrutura',
        filename: '00_Estrutura.txt',
        description: 'Estrutura das cenas',
        buildFrom: 'variable',
        sourceVar: 'ESTRUTURA',
        isCleanText: false,
      },
    ],
  },
};

// ============================================================================
// EXPORT ALL UNIVERSAL TEMPLATES
// ============================================================================

export const ALL_UNIVERSAL_TEMPLATES: UniversalTemplate[] = [
  TEMPLATE_HISTORIA_BIBLICA,
  TEMPLATE_CURIOSIDADES,
  TEMPLATE_DOCUMENTARIO,
  TEMPLATE_TEATRO,
];

export function getUniversalTemplateById(id: string): UniversalTemplate | undefined {
  return ALL_UNIVERSAL_TEMPLATES.find((t) => t.id === id);
}

// ============================================================================
// HELPER: Substituir variáveis no template
// ============================================================================

export function replaceUniversalVariables(template: string, variables: Record<string, any>): string {
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
