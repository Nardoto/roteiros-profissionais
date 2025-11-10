import { ScriptInput } from '@/types';

/**
 * PROMPTS SIMPLIFICADOS PARA MODO HISTÓRIA
 * Baseado no padrão: Estrutura → Introdução → Desenvolver cada tópico
 */

// ============================================================================
// ETAPA 1: ESTRUTURA - Apenas títulos numerados (1.1, 1.2, etc)
// ============================================================================

export function buildEstruturaPrompt(input: ScriptInput, language?: 'pt' | 'en' | 'es'): string {
  const lang = language || 'pt';

  if (lang === 'pt') {
    return `Possuo um canal no YouTube de histórias bíblicas. Se fosse para criar um roteiro sobre "${input.title}" em 3 tópicos como se fosse uma narrativa de livro e em ordem cronológica, sem que informações fiquem repetidas, como você criaria?

Sinopse: ${input.synopsis}
${input.knowledgeBase ? `\nInformações extras:\n${input.knowledgeBase}` : ''}

Escreva em ${lang === 'pt' ? 'português' : lang === 'en' ? 'inglês' : 'espanhol'}. Os tópicos não devem conter introdução e nem conclusão, e devem ser bem divididos para que os espectadores não se sintam perdidos no vídeo. Cada tópico deve ter 8 subtópicos.

Formate EXATAMENTE assim (numere os subtópicos como 1.1, 1.2 etc... e NÃO desenvolva os subtópicos, quero apenas seus títulos):

TÓPICO 1: [NOME DO TÓPICO]
1.1 [Nome do subtópico]
1.2 [Nome do subtópico]
1.3 [Nome do subtópico]
1.4 [Nome do subtópico]
1.5 [Nome do subtópico]
1.6 [Nome do subtópico]
1.7 [Nome do subtópico]
1.8 [Nome do subtópico]

TÓPICO 2: [NOME DO TÓPICO]
2.1 [Nome do subtópico]
2.2 [Nome do subtópico]
2.3 [Nome do subtópico]
2.4 [Nome do subtópico]
2.5 [Nome do subtópico]
2.6 [Nome do subtópico]
2.7 [Nome do subtópico]
2.8 [Nome do subtópico]

TÓPICO 3: [NOME DO TÓPICO]
3.1 [Nome do subtópico]
3.2 [Nome do subtópico]
3.3 [Nome do subtópico]
3.4 [Nome do subtópico]
3.5 [Nome do subtópico]
3.6 [Nome do subtópico]
3.7 [Nome do subtópico]
3.8 [Nome do subtópico]`;
  }

  // English
  if (lang === 'en') {
    return `I have a YouTube channel about biblical stories. If you were to create a script about "${input.title}" in 3 topics as if it were a book narrative and in chronological order, without repeated information, how would you create it?

Synopsis: ${input.synopsis}
${input.knowledgeBase ? `\nExtra information:\n${input.knowledgeBase}` : ''}

Write in English. The topics should not contain introduction or conclusion, and should be well divided so that viewers don't feel lost in the video. Each topic must have 8 subtopics.

Format EXACTLY like this (number the subtopics as 1.1, 1.2 etc... and DO NOT develop the subtopics, I only want their titles):

TOPIC 1: [TOPIC NAME]
1.1 [Subtopic name]
1.2 [Subtopic name]
1.3 [Subtopic name]
1.4 [Subtopic name]
1.5 [Subtopic name]
1.6 [Subtopic name]
1.7 [Subtopic name]
1.8 [Subtopic name]

TOPIC 2: [TOPIC NAME]
2.1 [Subtopic name]
2.2 [Subtopic name]
2.3 [Subtopic name]
2.4 [Subtopic name]
2.5 [Subtopic name]
2.6 [Subtopic name]
2.7 [Subtopic name]
2.8 [Subtopic name]

TOPIC 3: [TOPIC NAME]
3.1 [Subtopic name]
3.2 [Subtopic name]
3.3 [Subtopic name]
3.4 [Subtopic name]
3.5 [Subtopic name]
3.6 [Subtopic name]
3.7 [Subtopic name]
3.8 [Subtopic name]`;
  }

  // Spanish
  return `Tengo un canal de YouTube sobre historias bíblicas. Si fueras a crear un guion sobre "${input.title}" en 3 tópicos como si fuera una narrativa de libro y en orden cronológico, sin información repetida, ¿cómo lo crearías?

Sinopsis: ${input.synopsis}
${input.knowledgeBase ? `\nInformación extra:\n${input.knowledgeBase}` : ''}

Escribe en español. Los tópicos no deben contener introducción ni conclusión, y deben estar bien divididos para que los espectadores no se sientan perdidos en el video. Cada tópico debe tener 8 subtópicos.

Formatea EXACTAMENTE así (numera los subtópicos como 1.1, 1.2 etc... y NO desarrolles los subtópicos, solo quiero sus títulos):

TÓPICO 1: [NOMBRE DEL TÓPICO]
1.1 [Nombre del subtópico]
1.2 [Nombre del subtópico]
1.3 [Nombre del subtópico]
1.4 [Nombre del subtópico]
1.5 [Nombre del subtópico]
1.6 [Nombre del subtópico]
1.7 [Nombre del subtópico]
1.8 [Nombre del subtópico]

TÓPICO 2: [NOMBRE DEL TÓPICO]
2.1 [Nombre del subtópico]
2.2 [Nombre del subtópico]
2.3 [Nombre del subtópico]
2.4 [Nombre del subtópico]
2.5 [Nombre del subtópico]
2.6 [Nombre del subtópico]
2.7 [Nombre del subtópico]
2.8 [Nombre del subtópico]

TÓPICO 3: [NOMBRE DEL TÓPICO]
3.1 [Nombre del subtópico]
3.2 [Nombre del subtópico]
3.3 [Nombre del subtópico]
3.4 [Nombre del subtópico]
3.5 [Nombre del subtópico]
3.6 [Nombre del subtópico]
3.7 [Nombre del subtópico]
3.8 [Nombre del subtópico]`;
}

// ============================================================================
// ETAPA 2: INTRODUÇÃO - 1000 caracteres
// ============================================================================

export function buildHookPrompt(input: ScriptInput, estrutura: string, language?: 'pt' | 'en' | 'es'): string {
  const lang = language || 'pt';

  if (lang === 'pt') {
    return `Faça uma introdução imersiva e chamativa e curiosa de 1000 caracteres que prenda o espectador.

Estrutura do roteiro:
${estrutura}

Título: ${input.title}
Sinopse: ${input.synopsis}`;
  }

  if (lang === 'en') {
    return `Create an immersive, catchy and curious introduction of 1000 characters that hooks the viewer.

Script structure:
${estrutura}

Title: ${input.title}
Synopsis: ${input.synopsis}`;
  }

  return `Haz una introducción inmersiva, atractiva y curiosa de 1000 caracteres que enganche al espectador.

Estructura del guion:
${estrutura}

Título: ${input.title}
Sinopsis: ${input.synopsis}`;
}

// ============================================================================
// ETAPA 3: DESENVOLVER TÓPICO - 20.000 caracteres
// ============================================================================

export function buildTopicoPrompt(
  topicoNumber: number,
  topicoTitle: string,
  subtopics: string[],
  input: ScriptInput,
  language: 'pt' | 'en' | 'es',
  topicosAnteriores: string[]
): string {
  const lang = language || 'pt';
  const targetChars = 20000;

  // Construir lista de subtópicos
  const subtopicList = subtopics.map((sub, idx) => `${topicoNumber}.${idx + 1} ${sub}`).join('\n');

  if (lang === 'pt') {
    return `Faça agora o Tópico ${topicoNumber}, faça sem palavras difíceis, um texto narrativo limpo e direto, sem muita enrolação. Os capítulos e versículos devem ser mencionados de forma natural no texto antes de sua citação, para que não haja uma quebra brusca de narrativa.

Quero que você se baseie em cada tópico, de forma individual, para fazer uma produção textual se limitando a dizer apenas ao que o tópico está pedindo. E principalmente NÃO repita informações ditas antes por outros tópicos. E nem vá além do que o tópico está pedindo, pois irá interferir na narrativa dos próximos tópicos.

Siga essa instrução para escrever os parágrafos de cada tópico:

Escreva como se fosse uma narrativa de um livro, em terceira pessoa, usando sempre versículos bíblicos referente ao momento da história, não importa se ele é grande. Escreva como um experiente escritor e sábio, se comporte como tal. Escreva de uma forma que promova dinamismo e imersão. O texto precisa ser fluido e o texto não pode ser cansativo. Escreva um texto humanizado que gere conexão com o espectador. O texto deve ser principalmente fiel ao texto bíblico, sem adicionar informações que a bíblia não fala. Pense em um estilo de comunicação claro e direto na narrativa, sem enrolação. Escreva de uma forma dinâmica, para que até uma criança consiga entender, como se estivesse conversando diretamente com uma única pessoa. Não crie nenhuma conclusão sobre o tópico, apenas o encerre de forma direta sem reflexões. Use uma linguagem simples e de fácil entendimento.

Faça o tópico ${topicoNumber} com ${targetChars.toLocaleString()} caracteres separados dentre os 8 subtópicos. Não repita versículos e nem informações já ditas antes.

Esse é o tópico:

TÓPICO ${topicoNumber}: ${topicoTitle}
${subtopicList}

Título da História: ${input.title}
Sinopse: ${input.synopsis}
${input.knowledgeBase ? `Conhecimento adicional:\n${input.knowledgeBase}` : ''}`;
  }

  if (lang === 'en') {
    return `Now create Topic ${topicoNumber}. Use simple words, clean and direct narrative text, without too much rambling. Chapters and verses should be mentioned naturally in the text before their citation, so there is no abrupt narrative break.

Base yourself on each topic individually to create a textual production limiting yourself to saying only what the topic is asking. And mainly DO NOT repeat information said before by other topics. And don't go beyond what the topic is asking, as it will interfere with the narrative of the next topics.

Follow this instruction to write the paragraphs of each topic:

Write as if it were a book narrative, in third person, always using biblical verses referring to the moment of the story, no matter if it's long. Write as an experienced and wise writer, behave as such. Write in a way that promotes dynamism and immersion. The text needs to be fluid and not tiring. Write a humanized text that generates connection with the viewer. The text must be mainly faithful to the biblical text, without adding information that the bible doesn't say. Think of a clear and direct communication style in the narrative, without rambling. Write dynamically, so that even a child can understand, as if you were talking directly to a single person. Don't create any conclusion about the topic, just end it directly without reflections. Use simple and easy-to-understand language.

Make topic ${topicoNumber} with ${targetChars.toLocaleString()} characters separated among the 8 subtopics. Don't repeat verses or information already said before. Write in English.

This is the topic:

TOPIC ${topicoNumber}: ${topicoTitle}
${subtopicList}

Story Title: ${input.title}
Synopsis: ${input.synopsis}
${input.knowledgeBase ? `Additional Knowledge:\n${input.knowledgeBase}` : ''}`;
  }

  return `Ahora crea el Tópico ${topicoNumber}. Usa palabras simples, texto narrativo limpio y directo, sin divagar demasiado. Los capítulos y versículos deben mencionarse naturalmente en el texto antes de su cita, para que no haya una ruptura narrativa abrupta.

Basa cada tópico individualmente para crear una producción textual limitándote a decir solo lo que el tópico está pidiendo. Y principalmente NO repitas información dicha antes por otros tópicos. Y no vayas más allá de lo que el tópico está pidiendo, ya que interferirá con la narrativa de los próximos tópicos.

Sigue esta instrucción para escribir los párrafos de cada tópico:

Escribe como si fuera una narrativa de libro, en tercera persona, siempre usando versículos bíblicos referentes al momento de la historia, no importa si es largo. Escribe como un escritor experimentado y sabio, compórtate como tal. Escribe de manera que promueva dinamismo e inmersión. El texto necesita ser fluido y no cansador. Escribe un texto humanizado que genere conexión con el espectador. El texto debe ser principalmente fiel al texto bíblico, sin agregar información que la biblia no dice. Piensa en un estilo de comunicación claro y directo en la narrativa, sin divagar. Escribe dinámicamente, para que hasta un niño pueda entender, como si estuvieras hablando directamente con una sola persona. No crees ninguna conclusión sobre el tópico, solo termínalo directamente sin reflexiones. Usa un lenguaje simple y fácil de entender.

Haz el tópico ${topicoNumber} con ${targetChars.toLocaleString()} caracteres separados entre los 8 subtópicos. No repitas versículos ni información ya dicha antes. Escribe en español.

Este es el tópico:

TÓPICO ${topicoNumber}: ${topicoTitle}
${subtopicList}

Título de la Historia: ${input.title}
Sinopsis: ${input.synopsis}
${input.knowledgeBase ? `Conocimiento adicional:\n${input.knowledgeBase}` : ''}`;
}

// ============================================================================
// ETAPA 4: CONCLUSÃO (OPCIONAL - se precisar)
// ============================================================================

export function buildConclusaoPrompt(input: ScriptInput, language?: 'pt' | 'en' | 'es'): string {
  const lang = language || 'pt';

  if (lang === 'pt') {
    return `Crie uma conclusão breve e direta de 500-800 caracteres para o roteiro.

Não faça reflexões profundas, apenas encerre a narrativa de forma natural.

Título: ${input.title}`;
  }

  if (lang === 'en') {
    return `Create a brief and direct conclusion of 500-800 characters for the script.

Don't make deep reflections, just end the narrative naturally.

Title: ${input.title}`;
  }

  return `Crea una conclusión breve y directa de 500-800 caracteres para el guion.

No hagas reflexiones profundas, solo termina la narrativa naturalmente.

Título: ${input.title}`;
}

// ============================================================================
// ETAPA 5: TRILHA SONORA
// ============================================================================

export function buildTrilhaPrompt(roteiro: string, input: ScriptInput): string {
  return `Com base neste roteiro, crie sugestões de trilha sonora e direção musical.

Roteiro:
${roteiro.substring(0, 5000)}...

Título: ${input.title}

Formato:
- Momentos musicais (quando usar música épica, dramática, suave, etc)
- Sugestões de estilo musical
- Indicações de intensidade para cada parte`;
}

// ============================================================================
// ETAPA 6: PERSONAGENS
// ============================================================================

export function buildPersonagensPrompt(roteiro: string, input: ScriptInput): string {
  return `Com base neste roteiro, crie descrições detalhadas dos personagens principais para geração de imagens com IA.

Roteiro:
${roteiro.substring(0, 5000)}...

Para cada personagem, descreva:
- Aparência física (idade, altura, cabelo, olhos, etc)
- Vestimentas da época
- Características marcantes
- Expressões faciais típicas

Use linguagem clara para que uma IA consiga gerar imagens precisas.`;
}

// ============================================================================
// ETAPA 7: TÍTULO E DESCRIÇÃO
// ============================================================================

export function buildTituloPrompt(roteiro: string, input: ScriptInput): string {
  return `Com base neste roteiro, crie:

1. Título para YouTube (máx 100 caracteres, chamativo)
2. Descrição completa para YouTube (300-500 palavras)
3. 10 palavras-chave/tags relevantes

Roteiro:
${roteiro.substring(0, 3000)}...

Título original: ${input.title}`;
}

// ============================================================================
// ETAPA 8: TAKES (Cenas Visuais)
// ============================================================================

export function buildTakesPrompt(textoNarrado: string, personagens: string, language?: 'pt' | 'en' | 'es'): string {
  const lang = language || 'pt';

  return `Divida este texto narrado em TAKES (cenas visuais) para geração de imagens/vídeos.

Para cada TAKE, descreva:
- O que mostrar visualmente
- Personagens em cena
- Cenário
- Ação acontecendo

Personagens disponíveis:
${personagens.substring(0, 2000)}

Texto Narrado:
${textoNarrado.substring(0, 10000)}...

Formato:
TAKE 1: [Descrição visual]
TAKE 2: [Descrição visual]
...`;
}
