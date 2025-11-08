import { ScriptInput } from '@/types';

/**
 * PROMPTS PARA MODO CURIOSIDADES/TOP 10
 * Sistema para listas e fatos interessantes
 */

// ============================================================================
// GERAR ESTRUTURA DE CURIOSIDADES
// ============================================================================

export function buildCuriosidadesEstruturaPrompt(input: ScriptInput, language?: 'pt' | 'en' | 'es'): string {
  const lang = language || 'pt';

  const instructions = lang === 'pt'
    ? `Crie uma estrutura de CURIOSIDADES E FATOS sobre: ${input.title}

Estruture o conteúdo em 10-15 tópicos curtos e impactantes:
- Cada tópico deve ter um título chamativo
- Organize do mais impressionante para o menos
- Misture fatos, números e histórias
- Pense em viral/shareable content

Formato:
1. [TÍTULO CHAMATIVO] - Breve descrição
2. [TÍTULO CHAMATIVO] - Breve descrição
...

Título: ${input.title}
Contexto: ${input.synopsis}
${input.knowledgeBase ? `Informações extras: ${input.knowledgeBase}` : ''}`
    : lang === 'en'
    ? `Create a CURIOSITIES AND FACTS structure about: ${input.title}

Structure the content into 10-15 short, impactful topics:
- Each topic should have a catchy title
- Organize from most impressive to least
- Mix facts, numbers and stories
- Think viral/shareable content

Format:
1. [CATCHY TITLE] - Brief description
2. [CATCHY TITLE] - Brief description
...

Title: ${input.title}
Context: ${input.synopsis}
${input.knowledgeBase ? `Extra info: ${input.knowledgeBase}` : ''}`
    : `Crea una estructura de CURIOSIDADES Y DATOS sobre: ${input.title}

Estructura el contenido en 10-15 tópicos cortos e impactantes:
- Cada tópico debe tener un título llamativo
- Organiza del más impresionante al menos
- Mezcla hechos, números e historias
- Piensa en contenido viral/compartible

Formato:
1. [TÍTULO LLAMATIVO] - Breve descripción
2. [TÍTULO LLAMATIVO] - Breve descripción
...

Título: ${input.title}
Contexto: ${input.synopsis}
${input.knowledgeBase ? `Información extra: ${input.knowledgeBase}` : ''}`;

  return instructions;
}

// ============================================================================
// GERAR INTRODUÇÃO DE CURIOSIDADES
// ============================================================================

export function buildCuriosidadesIntroPrompt(input: ScriptInput, estrutura: string, language?: 'pt' | 'en' | 'es'): string {
  const lang = language || 'pt';

  const instructions = lang === 'pt'
    ? `Crie uma introdução IMPACTANTE para um vídeo de curiosidades (500-800 caracteres).

Use técnicas de:
- Pergunta provocativa
- Estatística surpreendente
- Promessa de revelação
- Criação de expectativa

Título: ${input.title}
Estrutura planejada:
${estrutura}

Escreva APENAS a introdução. Seja direto e cativante!`
    : lang === 'en'
    ? `Create an IMPACTFUL introduction for a curiosities video (500-800 characters).

Use techniques like:
- Provocative question
- Surprising statistic
- Revelation promise
- Building anticipation

Title: ${input.title}
Planned structure:
${estrutura}

Write ONLY the introduction. Be direct and captivating!`
    : `Crea una introducción IMPACTANTE para un video de curiosidades (500-800 caracteres).

Usa técnicas como:
- Pregunta provocativa
- Estadística sorprendente
- Promesa de revelación
- Crear expectativa

Título: ${input.title}
Estructura planeada:
${estrutura}

Escribe SOLO la introducción. ¡Sé directo y cautivador!`;

  return instructions;
}

// ============================================================================
// DESENVOLVER CADA CURIOSIDADE
// ============================================================================

export function buildCuriosidadePrompt(
  numero: number,
  titulo: string,
  descricao: string,
  input: ScriptInput,
  language?: 'pt' | 'en' | 'es'
): string {
  const lang = language || 'pt';

  const instructions = lang === 'pt'
    ? `Desenvolva a CURIOSIDADE #${numero}: "${titulo}"

Estrutura (300-500 palavras):
1. Hook inicial impactante
2. Contexto e explicação
3. Dados/números impressionantes
4. História ou exemplo real
5. Conexão com o presente/relevância

Descrição base: ${descricao}
Tema geral: ${input.title}

IMPORTANTE:
- Linguagem simples e direta
- Foco no "wow factor"
- Inclua números e comparações
- Seja específico e factual`
    : lang === 'en'
    ? `Develop CURIOSITY #${numero}: "${titulo}"

Structure (300-500 words):
1. Impactful initial hook
2. Context and explanation
3. Impressive data/numbers
4. Real story or example
5. Present connection/relevance

Base description: ${descricao}
General theme: ${input.title}

IMPORTANT:
- Simple, direct language
- Focus on "wow factor"
- Include numbers and comparisons
- Be specific and factual`
    : `Desarrolla la CURIOSIDAD #${numero}: "${titulo}"

Estructura (300-500 palabras):
1. Gancho inicial impactante
2. Contexto y explicación
3. Datos/números impresionantes
4. Historia o ejemplo real
5. Conexión con el presente/relevancia

Descripción base: ${descricao}
Tema general: ${input.title}

IMPORTANTE:
- Lenguaje simple y directo
- Enfoque en el "factor wow"
- Incluye números y comparaciones
- Sé específico y factual`;

  return instructions;
}

// ============================================================================
// GERAR CONCLUSÃO/CTA PARA CURIOSIDADES
// ============================================================================

export function buildCuriosidadesConclusaoPrompt(input: ScriptInput, language?: 'pt' | 'en' | 'es'): string {
  const lang = language || 'pt';

  const instructions = lang === 'pt'
    ? `Crie uma conclusão envolvente para o vídeo de curiosidades (800-1200 caracteres).

Inclua:
1. Resumo do mais impressionante
2. Reflexão sobre o aprendizado
3. Pergunta para os comentários
4. Call-to-action (inscrever-se, compartilhar)
5. Teaser para próximo vídeo

Título: ${input.title}

Seja entusiástico e motivador!`
    : lang === 'en'
    ? `Create an engaging conclusion for the curiosities video (800-1200 characters).

Include:
1. Summary of most impressive facts
2. Reflection on learning
3. Question for comments
4. Call-to-action (subscribe, share)
5. Teaser for next video

Title: ${input.title}

Be enthusiastic and motivating!`
    : `Crea una conclusión atractiva para el video de curiosidades (800-1200 caracteres).

Incluye:
1. Resumen de lo más impresionante
2. Reflexión sobre el aprendizaje
3. Pregunta para los comentarios
4. Llamada a la acción (suscribirse, compartir)
5. Adelanto del próximo video

Título: ${input.title}

¡Sé entusiasta y motivador!`;

  return instructions;
}