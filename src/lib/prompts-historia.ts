import { ScriptInput } from '@/types';

/**
 * PROMPTS PARA MODO HISTÓRIA BÍBLICA
 * Sistema iterativo com validação de caracteres (18k-22k por tópico)
 */

// ============================================================================
// ETAPA 1: GERAR ESTRUTURA (3 TÓPICOS + 24 SUBTÓPICOS)
// ============================================================================

export function buildEstruturaPrompt(input: ScriptInput, language: 'en' | 'es'): string {
  const instructions = language === 'en'
    ? `You are creating the outline for a biblical story video. Create a structure with:
- 3 MAIN TOPICS (without introduction or conclusion)
- 8 SUBTOPICS for each main topic (24 subtopics total)
- Chronological order
- No repeated information between topics
- Each topic should be well divided so viewers don't feel lost

The topics must NOT contain introduction or conclusion, just the narrative development.

Story Title: ${input.title}
Synopsis: ${input.synopsis}
${input.knowledgeBase ? `Additional Knowledge:\n${input.knowledgeBase}` : ''}

Format your response EXACTLY like this example:

TOPIC 1: [TOPIC NAME IN CAPS]
1.1 [Subtopic name]
1.2 [Subtopic name]
1.3 [Subtopic name]
1.4 [Subtopic name]
1.5 [Subtopic name]
1.6 [Subtopic name]
1.7 [Subtopic name]
1.8 [Subtopic name]

TOPIC 2: [TOPIC NAME IN CAPS]
2.1 [Subtopic name]
2.2 [Subtopic name]
2.3 [Subtopic name]
2.4 [Subtopic name]
2.5 [Subtopic name]
2.6 [Subtopic name]
2.7 [Subtopic name]
2.8 [Subtopic name]

TOPIC 3: [TOPIC NAME IN CAPS]
3.1 [Subtopic name]
3.2 [Subtopic name]
3.3 [Subtopic name]
3.4 [Subtopic name]
3.5 [Subtopic name]
3.6 [Subtopic name]
3.7 [Subtopic name]
3.8 [Subtopic name]`
    : `Estás creando el esquema para un video de historia bíblica. Crea una estructura con:
- 3 TÓPICOS PRINCIPALES (sin introducción ni conclusión)
- 8 SUBTÓPICOS para cada tópico principal (24 subtópicos en total)
- Orden cronológico
- Sin información repetida entre tópicos
- Cada tópico debe estar bien dividido para que los espectadores no se sientan perdidos

Los tópicos NO deben contener introducción ni conclusión, solo el desarrollo narrativo.

Título de la Historia: ${input.title}
Sinopsis: ${input.synopsis}
${input.knowledgeBase ? `Conocimiento Adicional:\n${input.knowledgeBase}` : ''}

Formatea tu respuesta EXACTAMENTE como este ejemplo:

TÓPICO 1: [NOMBRE DEL TÓPICO EN MAYÚSCULAS]
1.1 [Nombre del subtópico]
1.2 [Nombre del subtópico]
1.3 [Nombre del subtópico]
1.4 [Nombre del subtópico]
1.5 [Nombre del subtópico]
1.6 [Nombre del subtópico]
1.7 [Nombre del subtópico]
1.8 [Nombre del subtópico]

TÓPICO 2: [NOMBRE DEL TÓPICO EN MAYÚSCULAS]
2.1 [Nombre del subtópico]
2.2 [Nombre del subtópico]
2.3 [Nombre del subtópico]
2.4 [Nombre del subtópico]
2.5 [Nombre del subtópico]
2.6 [Nombre del subtópico]
2.7 [Nombre del subtópico]
2.8 [Nombre del subtópico]

TÓPICO 3: [NOMBRE DEL TÓPICO EN MAYÚSCULAS]
3.1 [Nombre del subtópico]
3.2 [Nombre del subtópico]
3.3 [Nombre del subtópico]
3.4 [Nombre del subtópico]
3.5 [Nombre del subtópico]
3.6 [Nombre del subtópico]
3.7 [Nombre del subtópico]
3.8 [Nombre del subtópico]`;

  return instructions;
}

// ============================================================================
// ETAPA 2: GERAR HOOK/INTRODUÇÃO (~1000 CARACTERES)
// ============================================================================

export function buildHookPrompt(input: ScriptInput, estrutura: string, language: 'en' | 'es'): string {
  const instructions = language === 'en'
    ? `Create an immersive, captivating, and prophetic introduction of approximately 1000 characters that hooks the viewer.

Write as if a very prophetic tale with strong narrative is ready to unfold in this introduction.

Style guidelines:
- Prophetic and mysterious tone
- Strong, engaging narrative
- Build curiosity and tension
- No difficult words - simple and direct
- Make the viewer want to keep watching

Story Title: ${input.title}
Synopsis: ${input.synopsis}
Structure:
${estrutura}

Write ONLY the introduction text (around 1000 characters). Do not add titles, headers, or explanations.`
    : `Crea una introducción inmersiva, cautivadora y profética de aproximadamente 1000 caracteres que enganche al espectador.

Escribe como si un cuento muy profético con narrativa fuerte estuviera listo para desplegarse en esta introducción.

Pautas de estilo:
- Tono profético y misterioso
- Narrativa fuerte y envolvente
- Construye curiosidad y tensión
- Sin palabras difíciles - simple y directo
- Haz que el espectador quiera seguir viendo

Título de la Historia: ${input.title}
Sinopsis: ${input.synopsis}
Estructura:
${estrutura}

Escribe SOLO el texto de introducción (alrededor de 1000 caracteres). No agregues títulos, encabezados o explicaciones.`;

  return instructions;
}

// ============================================================================
// ETAPA 3: GERAR TÓPICO (18k-22k CARACTERES)
// ============================================================================

export function buildTopicoPrompt(
  input: ScriptInput,
  estrutura: string,
  topicNumber: number,
  language: 'en' | 'es',
  previousTopics?: string[]
): string {
  const previousContext = previousTopics && previousTopics.length > 0
    ? language === 'en'
      ? `\n\nPREVIOUSLY COVERED (do NOT repeat this information):\n${previousTopics.join('\n---\n')}`
      : `\n\nYA CUBIERTO ANTERIORMENTE (NO repitas esta información):\n${previousTopics.join('\n---\n')}`
    : '';

  const instructions = language === 'en'
    ? `Write Topic ${topicNumber} following these strict guidelines:

CRITICAL RULES:
1. Target length: 20,000 WORDS or 100,000 CHARACTERS (will be validated - must be between 18,000-22,000 words OR 90,000-110,000 characters)
2. Distribute content evenly across the 8 subtopics (~2,500 words each)
3. Write as a book narrative in third person
4. Use Bible verses naturally integrated into the text
5. Do NOT repeat information from other topics
6. Do NOT go beyond what this topic asks for
7. Do NOT create conclusions - end directly without reflections
8. Simple language that even a child can understand
9. Dynamic, fluid text that generates connection with the viewer
10. Be faithful to the biblical text - no added information
11. Write as if talking directly to one person

Story Title: ${input.title}
Synopsis: ${input.synopsis}
${input.knowledgeBase ? `Additional Knowledge:\n${input.knowledgeBase}` : ''}

STRUCTURE:
${estrutura}
${previousContext}

Write ONLY Topic ${topicNumber} with its 8 subtopics. Target: 20,000 WORDS or 100,000 CHARACTERS (18,000-22,000 words OR 90,000-110,000 chars).
Do NOT add title, header, or topic number - start directly with the narrative.`
    : `Escribe el Tópico ${topicNumber} siguiendo estas pautas estrictas:

REGLAS CRÍTICAS:
1. Longitud objetivo: 20,000 PALABRAS o 100,000 CARACTERES (será validado - debe estar entre 18,000-22,000 palabras O 90,000-110,000 caracteres)
2. Distribuye el contenido uniformemente entre los 8 subtópicos (~2,500 palabras cada uno)
3. Escribe como narrativa de libro en tercera persona
4. Usa versículos bíblicos integrados naturalmente al texto
5. NO repitas información de otros tópicos
6. NO vayas más allá de lo que este tópico pide
7. NO crees conclusiones - termina directamente sin reflexiones
8. Lenguaje simple que hasta un niño pueda entender
9. Texto dinámico y fluido que genere conexión con el espectador
10. Sé fiel al texto bíblico - sin información agregada
11. Escribe como si hablaras directamente con una persona

Título de la Historia: ${input.title}
Sinopsis: ${input.synopsis}
${input.knowledgeBase ? `Conocimiento Adicional:\n${input.knowledgeBase}` : ''}

ESTRUCTURA:
${estrutura}
${previousContext}

Escribe SOLO el Tópico ${topicNumber} con sus 8 subtópicos. Objetivo: 20,000 PALABRAS o 100,000 CARACTERES (18,000-22,000 palabras O 90,000-110,000 caracteres).
NO agregues título, encabezado o número de tópico - comienza directamente con la narrativa.`;

  return instructions;
}

// ============================================================================
// ETAPA 4: GERAR CONCLUSÃO/CTA
// ============================================================================

export function buildConclusaoPrompt(input: ScriptInput, language: 'en' | 'es'): string {
  const instructions = language === 'en'
    ? `Write a brief conclusion calling the viewer to subscribe and share the video.

Style guidelines:
- Summarize the main lesson or message from the story
- Create emotional connection
- Call to action: subscribe, share, comment
- Ask what most impacted them about the story
- Keep it concise and engaging

Story Title: ${input.title}

Write ONLY the conclusion text (around 1500-2000 characters). Do not add titles or headers.`
    : `Escribe una breve conclusión llamando al espectador a suscribirse y compartir el video.

Pautas de estilo:
- Resume la lección principal o mensaje de la historia
- Crea conexión emocional
- Llamada a la acción: suscribirse, compartir, comentar
- Pregunta qué les impactó más de la historia
- Mantenlo conciso y atractivo

Título de la Historia: ${input.title}

Escribe SOLO el texto de conclusión (alrededor de 1500-2000 caracteres). No agregues títulos ni encabezados.`;

  return instructions;
}
