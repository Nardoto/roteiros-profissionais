import { ScriptInput } from "@/types";

const INSTRUCOES_BASE = `
VOCÊ É UM GERADOR PROFISSIONAL DE ROTEIROS PARA DOCUMENTÁRIOS BÍBLICOS.

⚠️ REGRA CRÍTICA DE FORMATAÇÃO:
NUNCA use linhas de sinais de igual (====) ou traços (----) em linhas separadas para dividir seções.
Se quiser usar marcadores decorativos, coloque-os NA MESMA LINHA do título.

ABORDAGEM OBRIGATÓRIA - EQUILÍBRIO ENTRE FÉ E ANÁLISE:
- Explorar teorias e evidências SEM desacreditar a Bíblia
- Apresentar múltiplas perspectivas mas AFIRMAR a autoridade bíblica
- Reconhecer elementos sobrenaturais além do alcance da ciência
- Usar análise para FORTALECER a fé, não destruí-la
- Levar o espectador a refletir PROFUNDAMENTE sobre sua própria fé
`;

export function buildRoteiroPrompt(input: ScriptInput): string {
  return `${INSTRUCOES_BASE}

TEMA DO VÍDEO: ${input.title}

SINOPSE:
${input.synopsis}

${input.knowledgeBase ? `BASE DE CONHECIMENTO:\n${input.knowledgeBase}\n` : ''}

TAREFA: Criar o arquivo 01_Roteiro_Estruturado.txt em PORTUGUÊS.

ESTRUTURA OBRIGATÓRIA:

TÍTULO DO VÍDEO: ${input.title}
DURAÇÃO ESTIMADA: 55 minutos

HOOK (0:00-2:30):
ELEMENTOS OBRIGATÓRIOS:
□ Pergunta provocativa de abertura
□ Estatística ou fato chocante
□ Contradição ou paradoxo intrigante
□ Promessa do que será revelado
□ Estabelecer tom (investigativo/dramático/científico)
□ Criar urgência para continuar assistindo

[Escrever o HOOK completo aqui]

ATO I - [TÍTULO DO ATO] (2:30-7:30):
Duração: 5 minutos
Objetivos:
- Estabelecer período histórico
- Descrever mundo/ambiente
- Introduzir forças em conflito

Estrutura:
1. [Subtópico com evidências]
2. [Subtópico com análise]
3. [Subtópico com implicações]
4. [Transição para próximo ato]

ATO II - [TÍTULO] (7:30-15:30):
Duração: 8 minutos
Objetivos:
[Definir objetivos específicos]

Estrutura:
[Desenvolver argumentos]

ATO III - [TÍTULO] (15:30-25:30):
Duração: 10 minutos
Objetivos:
[Definir objetivos específicos]

Estrutura:
[Desenvolver argumentos]

ATO IV - [TÍTULO] (25:30-37:30):
Duração: 12 minutos
Objetivos:
[Definir objetivos específicos]

Estrutura:
[Desenvolver argumentos]

ATO V - [TÍTULO] (37:30-45:30):
Duração: 8 minutos
Objetivos:
[Definir objetivos específicos]

Estrutura:
[Desenvolver argumentos]

ATO VI - [TÍTULO] (45:30-52:30):
Duração: 7 minutos
Objetivos:
[Definir objetivos específicos]

Estrutura:
[Desenvolver argumentos]

CONCLUSÃO - AFIRMAÇÃO DE FÉ (52:30-55:00):
□ Síntese dos pontos principais da análise
□ TRANSIÇÃO PARA MENSAGEM DE FÉ: "Mas além de toda análise..."
□ Reconhecimento dos MISTÉRIOS que a ciência não pode explicar
□ Afirmação de que MILAGRES EXISTEM e o SOBRENATURAL É REAL
□ Reflexão sobre como a análise FORTALECE, não enfraquece, a fé
□ Testemunho de que a Palavra de Deus permanece VERDADEIRA e AUTORITATIVA
□ Encorajamento para o espectador APROFUNDAR sua própria fé
□ Call to action para reflexão espiritual

ELEMENTOS TÉCNICOS:
Use marcações como:
- [INSERIR MAPA]: Indicar quando mostrar mapas
- [EVIDÊNCIA ARQUEOLÓGICA]: Marcar descobertas relevantes
- [PARALELO MÍTICO]: Quando fazer comparações
- [DADO CIENTÍFICO]: Estatísticas e cálculos
- [CITAÇÃO]: Trechos importantes a destacar

IMPORTANTE: Seja específico e detalhado em cada ato. O roteiro deve servir como base para todos os outros documentos.
`;
}

export function buildTrilhaPrompt(roteiro: string, input: ScriptInput): string {
  return `${INSTRUCOES_BASE}

ROTEIRO JÁ CRIADO:
${roteiro}

TAREFA: Criar o arquivo 02_Trilha_Sonora.txt baseado no roteiro acima.

FORMATO SIMPLIFICADO - Apenas indique o SENTIMENTO/MOOD de cada ATO com keywords para busca.

ESTRUTURA DO ARQUIVO:

TRILHA SONORA E ORIENTAÇÕES MUSICAIS
Documentário: ${input.title}
================================================

INSTRUÇÕES PARA BUSCA DE MÚSICAS:
Este documento contém orientações para encontrar músicas em bibliotecas como:
- Epidemic Sound
- Artlist
- AudioJungle
- YouTube Audio Library

Para cada seção, use as palavras-chave (keywords) fornecidas para buscar.
Priorize músicas que correspondam ao sentimento (mood) descrito.

HOOK (0:00-2:30):
Sentimento: [Descrever emoção/atmosfera desejada]
Keywords: "[keyword1]", "[keyword2]", "[keyword3]", "[keyword4]"
Mood: [Adjetivos separados por vírgula em inglês]
Intensidade: [Baixa/Média/Alta/Crescente]
Notas: [Observações sobre quando a música deve mudar]

ATO I - [TÍTULO] (2:30-7:30):
Sentimento: [Descrever emoção/atmosfera desejada]
Keywords: "[keyword1]", "[keyword2]", "[keyword3]", "[keyword4]"
Mood: [Adjetivos em inglês]
Intensidade: [Baixa/Média/Alta]
Notas: [Observações]

[Repetir para ATOS II, III, IV, V, VI]

CONCLUSÃO - [TÍTULO] (52:30-55:00):
Sentimento: [Descrever emoção/atmosfera desejada]
Keywords: "[keyword1]", "[keyword2]", "[keyword3]", "[keyword4]"
Mood: [Adjetivos em inglês]
Intensidade: [Média/Alta/Crescente até o fim]
Notas: [Como a música deve terminar]

CATEGORIAS DE KEYWORDS ÚTEIS:
ÉPICO: "epic orchestral", "cinematic trailer", "heroic", "powerful"
MISTÉRIO: "investigation", "mystery", "suspense", "dark ambient"
EMOCIONAL: "emotional piano", "touching", "sad strings", "hopeful"
TENSÃO: "tension", "rising action", "conflict", "urgent"
ESPIRITUAL: "ethereal", "angelic", "spiritual", "sacred"
ÉTNICO: "middle eastern", "arabic", "ancient world", "desert"
REVELAÇÃO: "discovery", "revelation", "breakthrough", "uplifting"
`;
}

export function buildTextoNarradoHookPrompt(roteiro: string, input: ScriptInput, language: 'en' | 'es' = 'en'): string {
  const isEnglish = language === 'en';

  const taskDescription = isEnglish
    ? 'TASK: Expand the HOOK into fluid narrated text in ENGLISH for YouTube.'
    : 'TAREA: Expandir el HOOK en texto narrado fluido en ESPAÑOL para YouTube.';

  const characteristics = isEnglish
    ? `ESSENTIAL CHARACTERISTICS:
- Written in first person plural ("we") or second person ("you")
- Conversational but authoritative tone
- Paragraphs of 3-5 sentences for easy narration
- Create MYSTERY and CURIOSITY immediately
- Engage the viewer in the first 10 seconds`
    : `CARACTERÍSTICAS ESENCIALES:
- Escrito en primera persona del plural ("nosotros") o segunda persona ("tú"/"usted")
- Tono conversacional pero autoritativo
- Párrafos de 3-5 frases para facilitar narración
- Crear MISTERIO y CURIOSIDAD inmediatos
- Enganchar al espectador en los primeros 10 segundos`;

  const template = isEnglish
    ? `OPENING TEMPLATE:
"What's the difference between [concept A] and [concept B]?
Between [concrete comparison] and [abstract comparison]?

Let's talk about [introduce protagonist/event with impactful description].
[Name]. [Two-word description].

But what if I told you that [surprising revelation]?
That [specific fact that contradicts expectations]?

Over the next 55 minutes, we're going to [specific action].
You're about to discover [main discovery].

Prepare yourself to [emotional/intellectual experience].
This is [redefinition of the theme].
Let's begin."`
    : `PLANTILLA DE APERTURA:
"¿Cuál es la diferencia entre [concepto A] y [concepto B]?
¿Entre [comparación concreta] y [comparación abstracta]?

Hablemos de [introducir protagonista/evento con descripción impactante].
[Nombre]. [Descripción en dos palabras].

¿Pero qué pasaría si te dijera que [revelación sorprendente]?
¿Que [hecho específico que contradice expectativas]?

Durante los próximos 55 minutos, vamos a [acción específica].
Estás a punto de descubrir [descubrimiento principal].

Prepárate para [experiencia emocional/intelectual].
Esto es [redefinición del tema].
Comencemos."`;

  const important = isEnglish
    ? `IMPORTANT:
- DO NOT use bullets or lists
- CONTINUOUS text in paragraphs
- Smooth transitions
- Simple and engaging language
- Create sense of urgency

Write ONLY the OPENING - THE HOOK section in English, formatted like this:

OPENING - THE HOOK (0:00-2:30)

[Complete text here in continuous paragraphs]`
    : `IMPORTANTE:
- NO usar viñetas o listas
- Texto CORRIDO en párrafos
- Transiciones suaves
- Lenguaje simple y atractivo
- Crear sentido de urgencia

Escribe SOLO la sección APERTURA - EL GANCHO en español, formateado así:

APERTURA - EL GANCHO (0:00-2:30)

[Texto completo aquí en párrafos corridos]`;

  return `${INSTRUCOES_BASE}

ROTEIRO ESTRUTURADO - SEÇÃO HOOK:
${roteiro.match(/HOOK[\s\S]*?(?=ATO I|$)/i)?.[0] || 'HOOK não encontrado'}

${taskDescription}

TARGET: 400-500 words

${characteristics}

${template}

${important}
`;
}
}

export function buildTextoNarradoAtoPrompt(
  roteiro: string,
  atoNumber: number,
  atoTitle: string,
  timestamps: string,
  language: 'en' | 'es' = 'en'
): string {
  const isEnglish = language === 'en';
  const atoRomanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI'];
  const atoRoman = atoRomanNumerals[atoNumber - 1];

  const atoRegex = new RegExp(`ATO ${atoRoman}[\\s\\S]*?(?=ATO ${atoRomanNumerals[atoNumber] || 'CONCLUSÃO'}|CONCLUSÃO|$)`, 'i');
  const atoContent = roteiro.match(atoRegex)?.[0] || `ATO ${atoRoman} não encontrado`;

  const taskDescription = isEnglish
    ? `TASK: Expand ACT ${atoRoman} into fluid narrated text in ENGLISH.`
    : `TAREA: Expandir el ACTO ${atoRoman} en texto narrado fluido en ESPAÑOL.`;

  return `${INSTRUCOES_BASE}

ROTEIRO ESTRUTURADO - ATO ${atoRoman}:
${atoContent}

${taskDescription}

TARGET: 1,000-1,250 words

${isEnglish ? `MANDATORY NARRATIVE TECHNIQUES:

1. DATA ANCHORING:
"Archaeological evidence shows..."
"The numbers are staggering: [statistic]"
"Recent discoveries at [location] revealed..."

2. MENTAL IMAGERY CREATION:
"Imagine [vivid sensory description]"
"Picture [specific scene]"

3. RHETORICAL QUESTIONING:
"But why would [logical question]?"
"How could [apparent impossibility]?"

4. PROGRESSIVE REVELATION:
"This is where it gets interesting..."
"But here's what they don't tell you..."

5. CONTEMPORARY CONNECTIONS:
"We still see this today in..."
"The modern parallel would be..."

STRUCTURE:
- Clearly introduce the act's theme
- Develop each argument listed in the structured script
- Add concrete and specific examples
- Include historical, archaeological, or textual details
- Use storytelling: create scenes, describe situations
- Make smooth transitions between arguments
- Conclude by connecting to the next act

IMPORTANT:
- DO NOT use bullets or lists
- CONTINUOUS text in paragraphs of 3-5 sentences
- Informative but ENGAGING tone
- Simple language, avoid academic jargon
- Use narrative, not just exposition

Write ONLY ACT ${atoNumber === 1 ? 'ONE' : atoNumber === 2 ? 'TWO' : atoNumber === 3 ? 'THREE' : atoNumber === 4 ? 'FOUR' : atoNumber === 5 ? 'FIVE' : 'SIX'} in English, formatted like this:

ACT ${atoNumber === 1 ? 'ONE' : atoNumber === 2 ? 'TWO' : atoNumber === 3 ? 'THREE' : atoNumber === 4 ? 'FOUR' : atoNumber === 5 ? 'FIVE' : 'SIX'} - ${atoTitle} (${timestamps})

[Complete text here in continuous paragraphs]`
: `TÉCNICAS NARRATIVAS OBLIGATORIAS:

1. ANCLAJE EN DATOS:
"La evidencia arqueológica muestra..."
"Las cifras son asombrosas: [estadística]"
"Descubrimientos recientes en [ubicación] revelaron..."

2. CREACIÓN DE IMÁGENES MENTALES:
"Imagina [descripción sensorial vívida]"
"Visualiza [escena específica]"

3. CUESTIONAMIENTO RETÓRICO:
"¿Pero por qué [pregunta lógica]?"
"¿Cómo pudo [imposibilidad aparente]?"

4. REVELACIÓN PROGRESIVA:
"Aquí es donde se pone interesante..."
"Pero esto es lo que no te dicen..."

5. CONEXIONES CONTEMPORÁNEAS:
"Aún vemos esto hoy en..."
"El paralelo moderno sería..."

ESTRUCTURA:
- Introducir claramente el tema del acto
- Desarrollar cada argumento listado en el guion estructurado
- Agregar ejemplos concretos y específicos
- Incluir detalles históricos, arqueológicos o textuales
- Usar storytelling: crear escenas, describir situaciones
- Hacer transiciones suaves entre argumentos
- Concluir conectando con el próximo acto

IMPORTANTE:
- NO usar viñetas o listas
- Texto CORRIDO en párrafos de 3-5 frases
- Tono informativo pero ATRAPANTE
- Lenguaje simple, evitar jerga académica
- Usar narrativa, no solo exposición

Escribe SOLO el ACTO ${atoNumber === 1 ? 'UNO' : atoNumber === 2 ? 'DOS' : atoNumber === 3 ? 'TRES' : atoNumber === 4 ? 'CUATRO' : atoNumber === 5 ? 'CINCO' : 'SEIS'} en español, formateado así:

ACTO ${atoNumber === 1 ? 'UNO' : atoNumber === 2 ? 'DOS' : atoNumber === 3 ? 'TRES' : atoNumber === 4 ? 'CUATRO' : atoNumber === 5 ? 'CINCO' : 'SEIS'} - ${atoTitle} (${timestamps})

[Texto completo aquí en párrafos corridos]`}
`;
}

export function buildTextoNarradoConclusaoPrompt(roteiro: string, language: 'en' | 'es' = 'en'): string {
  const isEnglish = language === 'en';
  const conclusaoContent = roteiro.match(/CONCLUSÃO[\s\S]*$/i)?.[0] || 'CONCLUSÃO não encontrada';

  const taskDescription = isEnglish
    ? 'TASK: Expand the CONCLUSION into fluid narrated text in ENGLISH.'
    : 'TAREA: Expandir la CONCLUSIÓN en texto narrado fluido en ESPAÑOL.';

  return `${INSTRUCOES_BASE}

ROTEIRO ESTRUTURADO - CONCLUSÃO:
${conclusaoContent}

${taskDescription}

TARGET: 600-700 words

${isEnglish ? `CONCLUSION STRUCTURE:

1. RECAP (2-3 paragraphs):
- Briefly summarize the main points
- Connect the acts into a cohesive narrative

2. TRANSITION TO FAITH (1 paragraph):
"But beyond all the analysis..."
"When we step back from the evidence..."

3. AFFIRMATION OF FAITH AND MYSTERY (3-4 paragraphs):
- Acknowledge the limits of science
- Affirm that miracles exist and the supernatural is real
- Explain how analysis STRENGTHENS faith
- The Word of God remains true and authoritative

4. FINAL MESSAGE (2 paragraphs):
- Encouragement to deepen one's own faith
- Call to action for spiritual reflection
- Impactful closing phrase

TEMPLATE:
"We've explored [theme] from multiple angles. We've examined [aspects].
And what have we discovered?

That the more deeply we investigate, the more the grandeur of the biblical narrative reveals itself.
Yes, we can find natural explanations for some elements. Yes, there are parallels in other cultures.
But this doesn't diminish biblical truth - on the contrary, it confirms that God has always been speaking to humanity in multiple forms.

Science has its limits. It can tell us how, but it cannot explain the perfect timing, the divine hand orchestrating these mechanisms.

In the end, faith isn't about having all the answers. It's about trusting the One who does.
Miracles exist. The supernatural is real. And the Word of God remains true and authoritative.

May this intellectual journey strengthen your spiritual journey. May the questions lead to a deeper faith.
And may you discover, as many before us, that the more we question sincerely, the more God's truth reveals itself."

IMPORTANT:
- INSPIRATIONAL and HOPEFUL tone
- Balance critical analysis with faith affirmation
- Eloquent but accessible language
- End with emotional impact

Write ONLY the CONCLUSION section in English, formatted like this:

CONCLUSION - FAITH AND MYSTERY (52:30-55:00)

[Complete text here in continuous paragraphs]`
: `ESTRUCTURA DE LA CONCLUSIÓN:

1. RECAPITULACIÓN (2-3 párrafos):
- Resumir brevemente los puntos principales
- Conectar los actos en una narrativa cohesiva

2. TRANSICIÓN HACIA LA FE (1 párrafo):
"Pero más allá de todo el análisis..."
"Cuando nos alejamos de la evidencia..."

3. AFIRMACIÓN DE FE Y MISTERIO (3-4 párrafos):
- Reconocer los límites de la ciencia
- Afirmar que los milagros existen y lo sobrenatural es real
- Explicar cómo el análisis FORTALECE la fe
- La Palabra de Dios permanece verdadera y autoritativa

4. MENSAJE FINAL (2 párrafos):
- Aliento para profundizar la propia fe
- Llamado a la acción para reflexión espiritual
- Frase de impacto final

PLANTILLA:
"Hemos explorado [tema] desde múltiples ángulos. Hemos examinado [aspectos].
¿Y qué hemos descubierto?

Que cuanto más profundamente investigamos, más se revela la grandeza de la narrativa bíblica.
Sí, podemos encontrar explicaciones naturales para algunos elementos. Sí, hay paralelismo en otras culturas.
Pero esto no disminuye la verdad bíblica - al contrario, confirma que Dios siempre ha estado hablando a la humanidad de múltiples formas.

La ciencia tiene sus límites. Puede decirnos cómo, pero no puede explicar el momento perfecto, la mano divina orquestando estos mecanismos.

Al final, la fe no se trata de tener todas las respuestas. Se trata de confiar en Aquel que sí las tiene.
Los milagros existen. Lo sobrenatural es real. Y la Palabra de Dios permanece verdadera y autoritativa.

Que este viaje intelectual fortalezca tu viaje espiritual. Que las preguntas conduzcan a una fe más profunda.
Y que descubras, como muchos antes que nosotros, que cuanto más cuestionamos sinceramente, más se revela la verdad de Dios."

IMPORTANTE:
- Tono INSPIRADOR y ESPERANZADOR
- Equilibrar análisis crítico con afirmación de fe
- Lenguaje elocuente pero accesible
- Terminar con impacto emocional

Escribe SOLO la sección CONCLUSIÓN en español, formateada así:

CONCLUSIÓN - FE Y MISTERIO (52:30-55:00)

[Texto completo aquí en párrafos corridos]`}
`;
}

export function buildPersonagensPrompt(roteiro: string, input: ScriptInput): string {
  return `${INSTRUCOES_BASE}

ROTEIRO COMPLETO:
${roteiro.substring(0, 3000)}...

TAREFA: Criar descrições detalhadas de personagens em INGLÊS para geração de imagens com IA.

FORMATO: Cada descrição deve ser um PARÁGRAFO CONTÍNUO (sem quebras, sem bullets).

ESTRUTURA DO ARQUIVO:

CHARACTER DESCRIPTIONS FOR AI IMAGE GENERATION
Documentary: ${input.title}
================================================

INSTRUCTIONS:
These descriptions are written in continuous paragraph format, optimized for
AI image generation tools like Midjourney, DALL-E, Stable Diffusion, etc.

Each description includes physical appearance, clothing, facial features,
context, and lighting suggestions.

Copy the entire paragraph for each character when generating images.

PRIMARY CHARACTERS
--------------------------------------------

[NÚMERO]. [NOME DO PERSONAGEM]

[Parágrafo único de 80-150 palavras com: altura + build + características faciais + cabelo + olhos + pele + roupas detalhadas + expressão + contexto histórico + iluminação, tudo em uma descrição fluida, terminando com "biblical period, photorealistic, cinematic lighting"]

ELEMENTOS QUE CADA DESCRIÇÃO DEVE TER:
✓ Altura e tipo físico
✓ Características faciais (olhos, nariz, formato do rosto)
✓ Cabelo (cor, comprimento, estilo)
✓ Pele (tom, textura, marcas)
✓ Roupas historicamente precisas (cores, tecidos, estilo)
✓ Expressão facial ou emoção
✓ Contexto/cenário
✓ Iluminação sugerida
✓ Palavras-chave finais: "biblical period", "photorealistic", "cinematic lighting"

EXEMPLO:
1. MOSES THE PROPHET

A Hebrew prophet and lawgiver standing six feet tall with a strong weathered build from forty years in the wilderness, his face showing deep lines of age and wisdom with a prominent straight nose, piercing dark brown eyes that convey both authority and compassion, deeply tanned and wrinkled skin marked by decades of desert sun, long flowing white beard reaching his chest, thick white hair with hints of gray, wearing a simple undyed wool robe with a dark brown outer cloak, leather sandals worn from travel, holding a gnarled wooden staff, standing on Mount Sinai with dramatic storm clouds gathering behind him, his expression stern yet loving as he prepares to receive divine law, golden hour lighting from the side creating dramatic shadows across his weathered features, biblical period, photorealistic, cinematic lighting.

Crie descrições para:
- 5-8 personagens principais mencionados no roteiro
- 3-5 personagens secundários relevantes
- 2-3 grupos/multidões se aplicável

IDIOMA: INGLÊS
FORMATO: Parágrafo contínuo para cada personagem
`;
}

export function buildTituloPrompt(roteiro: string, input: ScriptInput, language: 'en' | 'es' = 'en'): string {
  const isEnglish = language === 'en';

  const taskDescription = isEnglish
    ? 'TASK: Create YouTube titles and complete description in ENGLISH.'
    : 'TAREA: Crear títulos para YouTube y descripción completa en ESPAÑOL.';

  return `${INSTRUCOES_BASE}

ROTEIRO COMPLETO:
${roteiro}

${taskDescription}

${isEnglish ? `FILE STRUCTURE:

YOUTUBE TITLE OPTIONS
================================================

OPTION 1: [45-60 characters, moderate clickbait, with emoji]
OPTION 2: [45-60 characters, more direct, provocative question]
OPTION 3: [45-60 characters, focus on revelation/discovery]
OPTION 4: [45-60 characters, controversial but true]
OPTION 5: [45-60 characters, promise of definitive answer]

RECOMMENDED TITLE: [Indicate which of the 5 and explain why in 1 line]


COMPLETE YOUTUBE DESCRIPTION
================================================

[Introductory paragraph of 2-3 lines summarizing the video impactfully]

In this documentary, you will discover:
✓ [Main point 1 - specific and impactful]
✓ [Main point 2 - specific and impactful]
✓ [Main point 3 - specific and impactful]
✓ [Main point 4 - specific and impactful]
✓ [Main point 5 - specific and impactful]

TIMESTAMPS:
0:00 - Introduction: [Brief description of the hook]
2:30 - [Act I title extracted from script]
7:30 - [Act II title extracted from script]
15:30 - [Act III title extracted from script]
25:30 - [Act IV title extracted from script]
37:30 - [Act V title extracted from script]
45:30 - [Act VI title extracted from script]
52:30 - Conclusion: [Brief description]

📚 SOURCES AND REFERENCES:
[List 3-5 main sources mentioned or used]

🔔 Subscribe to the channel for more biblical documentaries
👍 Leave your like if this content was useful
💬 Comment below your reflections

#[hashtag1] #[hashtag2] #[hashtag3] #[hashtag4] #[hashtag5]`
: `ESTRUCTURA DEL ARCHIVO:

OPCIONES DE TÍTULOS PARA YOUTUBE
================================================

OPCIÓN 1: [45-60 caracteres, clickbait moderado, con emoji]
OPCIÓN 2: [45-60 caracteres, más directo, pregunta provocativa]
OPCIÓN 3: [45-60 caracteres, enfoque en revelación/descubrimiento]
OPCIÓN 4: [45-60 caracteres, controvertido pero verdadero]
OPCIÓN 5: [45-60 caracteres, promesa de respuesta definitiva]

TÍTULO RECOMENDADO: [Indicar cuál de los 5 y explicar por qué en 1 línea]


DESCRIPCIÓN COMPLETA PARA YOUTUBE
================================================

[Párrafo introductorio de 2-3 líneas resumiendo el video de forma impactante]

En este documental, descubrirás:
✓ [Punto principal 1 - específico e impactante]
✓ [Punto principal 2 - específico e impactante]
✓ [Punto principal 3 - específico e impactante]
✓ [Punto principal 4 - específico e impactante]
✓ [Punto principal 5 - específico e impactante]

MARCAS DE TIEMPO:
0:00 - Introducción: [Breve descripción del gancho]
2:30 - [Título del Acto I extraído del guion]
7:30 - [Título del Acto II extraído del guion]
15:30 - [Título del Acto III extraído del guion]
25:30 - [Título del Acto IV extraído del guion]
37:30 - [Título del Acto V extraído del guion]
45:30 - [Título del Acto VI extraído del guion]
52:30 - Conclusión: [Breve descripción]

📚 FUENTES Y REFERENCIAS:
[Listar 3-5 fuentes principales mencionadas o utilizadas]

🔔 Suscríbete al canal para más documentales bíblicos
👍 Deja tu like si este contenido fue útil
💬 Comenta abajo tus reflexiones

#[hashtag1] #[hashtag2] #[hashtag3] #[hashtag4] #[hashtag5]`}


${isEnglish ? `THUMBNAIL IDEAS
================================================

THUMBNAIL OPTION 1:
Concept: [Describe the main visual idea in 2-3 lines]
Elements:
- [Visual element 1]
- [Visual element 2]
- Highlighted text: "[SHORT AND IMPACTFUL TEXT]"
- Color scheme: [main colors]
- Style: [photorealistic/artistic/dramatic]

THUMBNAIL OPTION 2:
Concept: [Describe a different visual idea in 2-3 lines]
Elements:
- [Visual element 1]
- [Visual element 2]
- Highlighted text: "[ALTERNATIVE TEXT]"
- Color scheme: [main colors]
- Style: [photorealistic/artistic/dramatic]

TITLE GUIDELINES:
✓ 45-60 characters
✓ Keyword at the beginning
✓ Provocative but honest
✓ Create curiosity
✓ Can use 1 strategic emoji`
: `IDEAS PARA MINIATURA
================================================

MINIATURA OPCIÓN 1:
Concepto: [Describir la idea visual principal en 2-3 líneas]
Elementos:
- [Elemento visual 1]
- [Elemento visual 2]
- Texto destacado: "[TEXTO CORTO E IMPACTANTE]"
- Esquema de colores: [colores principales]
- Estilo: [fotorrealista/artístico/dramático]

MINIATURA OPCIÓN 2:
Concepto: [Describir idea visual diferente en 2-3 líneas]
Elementos:
- [Elemento visual 1]
- [Elemento visual 2]
- Texto destacado: "[TEXTO ALTERNATIVO]"
- Esquema de colores: [colores principales]
- Estilo: [fotorrealista/artístico/dramático]

DIRECTRICES PARA TÍTULOS:
✓ 45-60 caracteres
✓ Palabra clave al inicio
✓ Provocativo pero honesto
✓ Crear curiosidad
✓ Puede usar 1 emoji estratégico`}
`;
}
