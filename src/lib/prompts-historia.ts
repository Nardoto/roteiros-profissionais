import { ScriptInput } from '@/types';

/**
 * PROMPTS PARA MODO HISTÓRIA BÍBLICA
 * Sistema iterativo com validação de caracteres (18k-22k por tópico)
 */

// ============================================================================
// ETAPA 1: GERAR ESTRUTURA (3 TÓPICOS + 24 SUBTÓPICOS)
// ============================================================================

export function buildEstruturaPrompt(input: ScriptInput, language?: 'pt' | 'en' | 'es'): string {
  const lang = language || 'pt'; // Português como padrão
  const targetTotal = input.targetCharacters || 100000;
  const targetPerTopic = Math.floor(targetTotal / 3);

  const instructions = lang === 'pt'
    ? `Você está criando o esquema para um vídeo de história bíblica. Crie uma estrutura com:
- 3 TÓPICOS PRINCIPAIS (sem introdução ou conclusão)
- 8 SUBTÓPICOS para cada tópico principal (24 subtópicos no total)
- Objetivo: ${targetTotal.toLocaleString()} caracteres no TOTAL (aproximadamente ${targetPerTopic.toLocaleString()} caracteres por tópico)
- Ordem cronológica
- Sem informação repetida entre tópicos
- Cada tópico deve ser bem dividido para que os espectadores não se sintam perdidos

Os tópicos NÃO devem conter introdução ou conclusão, apenas o desenvolvimento narrativo.

Título da História: ${input.title}
Sinopse: ${input.synopsis}
${input.knowledgeBase ? `Conhecimento Adicional:\n${input.knowledgeBase}` : ''}

PLANEJAMENTO NARRATIVO - PENSE EM COMO CONECTAR OS TÓPICOS:
- Identifique GANCHOS entre tópicos (como um tópico prepara o próximo)
- Marque momentos para FORESHADOWING (antecipar eventos futuros)
- Defina CALLBACKS (oportunidades de relembrar eventos anteriores)

Exemplo de estrutura conectada:
TÓPICO 1 termina com → algo que será explorado no Tópico 2
TÓPICO 2 relembra → evento do Tópico 1 e planta → gancho para Tópico 3
TÓPICO 3 entrega → promessas dos Tópicos 1 e 2

Formate sua resposta EXATAMENTE assim:

TÓPICO 1: [NOME DO TÓPICO EM MAIÚSCULAS]
1.1 [Nome do subtópico]
1.2 [Nome do subtópico]
1.3 [Nome do subtópico]
1.4 [Nome do subtópico]
1.5 [Nome do subtópico]
1.6 [Nome do subtópico]
1.7 [Nome do subtópico]
1.8 [Nome do subtópico]

TÓPICO 2: [NOME DO TÓPICO EM MAIÚSCULAS]
2.1 [Nome do subtópico]
2.2 [Nome do subtópico]
2.3 [Nome do subtópico]
2.4 [Nome do subtópico]
2.5 [Nome do subtópico]
2.6 [Nome do subtópico]
2.7 [Nome do subtópico]
2.8 [Nome do subtópico]

TÓPICO 3: [NOME DO TÓPICO EM MAIÚSCULAS]
3.1 [Nome do subtópico]
3.2 [Nome do subtópico]
3.3 [Nome do subtópico]
3.4 [Nome do subtópico]
3.5 [Nome do subtópico]
3.6 [Nome do subtópico]
3.7 [Nome do subtópico]
3.8 [Nome do subtópico]`
    : lang === 'en'
    ? `You are creating the outline for a biblical story video. Create a structure with:
- 3 MAIN TOPICS (without introduction or conclusion)
- 8 SUBTOPICS for each main topic (24 subtopics total)
- Target: ${targetTotal.toLocaleString()} characters TOTAL (approximately ${targetPerTopic.toLocaleString()} characters per topic)
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
- Objetivo: ${targetTotal.toLocaleString()} caracteres en TOTAL (aproximadamente ${targetPerTopic.toLocaleString()} caracteres por tópico)
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

export function buildHookPrompt(input: ScriptInput, estrutura: string, language?: 'pt' | 'en' | 'es'): string {
  const lang = language || 'pt'; // Português como padrão
  const instructions = lang === 'pt'
    ? `Crie uma introdução imersiva, cativante e profética de aproximadamente 1000 caracteres que prenda o espectador.

Escreva como se uma história muito profética com narrativa forte estivesse prestes a se desdobrar nesta introdução.

TÉCNICAS NARRATIVAS OBRIGATÓRIAS PARA O HOOK:
1. Comece com algo intrigante, contraditório ou surpreendente
2. Plante uma PERGUNTA ou MISTÉRIO que será respondido ao longo da história
3. Use técnicas de antecipação:
   • "Mas o que ele não sabia era que..."
   • "Isso era apenas o começo de..."
   • "Ninguém imaginava que..."
   • "Parecia impossível, mas..."
4. Crie contraste entre aparência e realidade
5. Termine com gancho que faça o espectador querer continuar

Exemplo de estrutura:
[Situação aparente] → [Reviravolta/mistério] → [Pergunta que será respondida]

"Parecia o fim... mas era o começo. Como [situação improvável] se tornaria [resultado surpreendente]?"

Diretrizes de estilo:
- Tom profético e misterioso
- Narrativa forte e envolvente
- Use linguagem bíblica mas acessível
- Transporte o leitor para a época e local

Título da História: ${input.title}
Sinopse: ${input.synopsis}

ESTRUTURA DA HISTÓRIA:
${estrutura}

Escreva APENAS o texto de introdução (aproximadamente 1000 caracteres). Não adicione títulos ou cabeçalhos.`
    : lang === 'en'
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
  topicNumber: number,
  topicTitle: string,
  subtopics: string[],
  input: ScriptInput,
  language?: 'pt' | 'en' | 'es',
  previousTopics?: string[]
): string {
  const lang = language || 'pt'; // Português como padrão
  const targetTotal = input.targetCharacters || 100000;
  const targetPerTopic = Math.floor(targetTotal / 3);
  const targetPerSubtopic = Math.floor(targetPerTopic / 8);

  const previousContext = previousTopics && previousTopics.length > 0
    ? lang === 'pt'
      ? `\n\nJÁ COBERTO ANTERIORMENTE (NÃO repita esta informação):\n${previousTopics.join('\n---\n')}`
      : lang === 'en'
      ? `\n\nPREVIOUSLY COVERED (do NOT repeat this information):\n${previousTopics.join('\n---\n')}`
      : `\n\nYA CUBIERTO ANTERIORMENTE (NO repitas esta información):\n${previousTopics.join('\n---\n')}`
    : '';

  const instructions = lang === 'pt'
    ? `Escreva o Tópico ${topicNumber}: "${topicTitle}" seguindo estas diretrizes rigorosas:

REGRAS CRÍTICAS:
1. Tamanho objetivo: ~${targetPerTopic.toLocaleString()} CARACTERES para este tópico (Objetivo total da história: ${targetTotal.toLocaleString()} caracteres em 3 tópicos)
2. Distribua o conteúdo uniformemente entre os 8 subtópicos (~${targetPerSubtopic.toLocaleString()} caracteres cada)
3. Escreva como narrativa de livro em terceira pessoa
4. Use versículos bíblicos integrados naturalmente ao texto
5. NÃO repita informação de outros tópicos
6. NÃO vá além do que este tópico pede
7. NÃO crie conclusões - termine diretamente sem reflexões
8. Linguagem simples que até uma criança possa entender
9. Texto dinâmico e fluido que gere conexão com o espectador
10. Seja fiel ao texto bíblico - sem informação adicionada
11. Escreva como se falasse diretamente com uma pessoa

Título da História: ${input.title}
Sinopse: ${input.synopsis}
${input.knowledgeBase ? `Conhecimento Adicional:\n${input.knowledgeBase}` : ''}

SUBTÓPICOS A DESENVOLVER:
${subtopics.map((sub, i) => `${i + 1}. ${sub}`).join('\n')}
${previousContext}

===========================================
TÉCNICAS NARRATIVAS OBRIGATÓRIAS
===========================================

${topicNumber > 1 ? `
✅ CALLBACK (Relembrar tópicos anteriores):
- Faça pelo menos 1-2 referências NATURAIS aos tópicos já desenvolvidos
- Conecte eventos passados com o que está acontecendo agora
- Use frases como:
  • "Lembra quando..." ou "Como vimos..."
  • "Aquele momento em que [evento do tópico anterior]..."
  • "Depois de [evento anterior], agora..."
  • "O que começou com [tópico 1] agora..."
- NÃO force a referência - integre organicamente na narrativa
` : ''}

${topicNumber < 3 ? `
✅ FORESHADOWING (Antecipar próximos eventos):
- Plante 1-2 sementes sutis do que está por vir
- Crie expectativa sem revelar tudo
- Use frases como:
  • "Mas isso era apenas o começo..."
  • "O que ele não sabia era que..."
  • "Isso tudo faria sentido mais tarde..."
  • "Algo maior estava prestes a acontecer..."
  • "Essa decisão teria consequências que ele ainda não imaginava..."
- Mantenha o mistério - não entregue o final
` : ''}

${topicNumber === 3 ? `
✅ PAYOFF (Entregar promessas anteriores):
- Conecte este tópico final com os tópicos 1 e 2
- Mostre como tudo se encaixa no plano maior
- Resolva os ganchos e mistérios plantados anteriormente
- Use frases como:
  • "E foi exatamente como prometido..."
  • "Agora tudo fazia sentido: aquele [evento do tópico 1]..."
  • "O que começou em [tópico 1], passou por [tópico 2], agora culmina em..."
  • "Finalmente se revelava o propósito de..."
- Crie sensação de círculo narrativo completo
` : ''}

===========================================
TRANSIÇÕES ENTRE SUBTÓPICOS
===========================================
- NÃO liste subtópicos de forma mecânica (não use "Primeiro... Segundo... Terceiro...")
- Crie PONTES NARRATIVAS entre subtópicos
- Use conectores orgânicos:
  • "Enquanto isso..."
  • "Mas antes disso..."
  • "Paralelamente..."
  • "No mesmo momento..."
  • "Isso nos leva a..."
  • "Logo após..."

EXEMPLO RUIM (mecânico):
"1.1 Moisés nasceu em uma família levita.
1.2 O faraó ordenou matar os bebês hebreus.
1.3 A mãe colocou Moisés no rio."

EXEMPLO BOM (narrativo e fluido):
"Moisés nasceu em um momento crítico para o povo hebreu. O faraó,
temendo uma rebelião, havia dado uma ordem terrível: todos os bebês
hebreus deveriam ser lançados ao Nilo. Mas a mãe de Moisés não conseguia
aceitar aquele destino. Durante três meses, ela escondeu seu filho...
até que um dia teve uma ideia ousada que mudaria tudo."

Escreva APENAS o Tópico ${topicNumber}: "${topicTitle}" com seus 8 subtópicos. Meta: ~${targetPerTopic.toLocaleString()} CARACTERES.
NÃO adicione título, cabeçalho ou número de tópico - comece diretamente com a narrativa.`
    : lang === 'en'
    ? `Write Topic ${topicNumber}: "${topicTitle}" following these strict guidelines:

CRITICAL RULES:
1. Target length: ~${targetPerTopic.toLocaleString()} CHARACTERS for this topic (Total story target: ${targetTotal.toLocaleString()} characters across 3 topics)
2. Distribute content evenly across the 8 subtopics (~${targetPerSubtopic.toLocaleString()} characters each)
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

SUBTOPICS TO DEVELOP:
${subtopics.map((sub, i) => `${i + 1}. ${sub}`).join('\n')}
${previousContext}

Write ONLY Topic ${topicNumber}: "${topicTitle}" with its 8 subtopics. Target: ~${targetPerTopic.toLocaleString()} CHARACTERS.
Do NOT add title, header, or topic number - start directly with the narrative.`
    : `Escribe el Tópico ${topicNumber}: "${topicTitle}" siguiendo estas pautas estrictas:

REGLAS CRÍTICAS:
1. Longitud objetivo: ~${targetPerTopic.toLocaleString()} CARACTERES para este tópico (Objetivo total de la historia: ${targetTotal.toLocaleString()} caracteres en 3 tópicos)
2. Distribuye el contenido uniformemente entre los 8 subtópicos (~${targetPerSubtopic.toLocaleString()} caracteres cada uno)
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

SUBTÓPICOS A DESARROLLAR:
${subtopics.map((sub, i) => `${i + 1}. ${sub}`).join('\n')}
${previousContext}

Escribe SOLO el Tópico ${topicNumber}: "${topicTitle}" con sus 8 subtópicos. Objetivo: ~${targetPerTopic.toLocaleString()} CARACTERES.
NO agregues título, encabezado o número de tópico - comienza directamente con la narrativa.`;

  return instructions;
}

// ============================================================================
// ETAPA 4: GERAR CONCLUSÃO/CTA
// ============================================================================

export function buildConclusaoPrompt(input: ScriptInput, language?: 'pt' | 'en' | 'es'): string {
  const lang = language || 'pt'; // Português como padrão
  const instructions = lang === 'pt'
    ? `Escreva uma breve conclusão chamando o espectador a se inscrever e compartilhar o vídeo.

ESTRUTURA DA CONCLUSÃO:

1. PAYOFF DO HOOK (Responda ao mistério do início)
   - Retome a pergunta/mistério plantado na introdução
   - Mostre como foi resolvido ao longo da história

2. CÍRCULO NARRATIVO (Conecte fim com começo)
   - Referencie momento-chave de cada tópico
   - Mostre como tudo se conecta no plano maior
   - "Do [tópico 1], passando por [tópico 2], até [tópico 3]..."

3. LIÇÃO/MENSAGEM (Aplicação para hoje)
   - Qual o impacto pessoal desta história?
   - Como isso se aplica à vida do espectador hoje?

4. CALL TO ACTION
   - Pergunte o que mais impactou
   - Convide a inscrever-se, curtir, compartilhar

Exemplo de estrutura:
"[Retomar mistério do hook] → E assim vemos que [conexão dos 3 tópicos] →
Isso nos ensina que [lição] → E você, o que mais te impactou nesta história?
[CTA: inscrever, compartilhar]"

Diretrizes de estilo:
- Tom profético mas acessível
- Crie conexão emocional forte
- Faça o espectador sentir que a jornada valeu a pena
- Termine com esperança e inspiração

Título da História: ${input.title}

Escreva APENAS o texto de conclusão (aproximadamente 1500-2000 caracteres). Não adicione títulos ou cabeçalhos.`
    : lang === 'en'
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

// ============================================================================
// ETAPA 5: GERAR TAKES (DIVISÃO EM CENAS VISUAIS)
// ============================================================================

export function buildTakesPrompt(
  textoNarrado: string,
  personagens: string,
  language?: 'pt' | 'en' | 'es'
): string {
  const lang = language || 'pt';

  const instructions = lang === 'pt'
    ? `Você vai criar um arquivo TAKES dividindo o texto narrado em cenas visuais de 60-90 caracteres cada.

OBJETIVO: Criar um guia visual para geração de imagens/vídeos com IA, garantindo consistência de personagens.

ESTRUTURA DO ARQUIVO:

========================================
BANCO DE PERSONAGENS (CHARACTER BANK)
========================================

[Extraia TODOS os personagens do arquivo "personagens" abaixo e liste aqui]

PERSONAGEM 1: [Nome]
Visual Anchor: [Descrição visual completa copiada do arquivo personagens]

PERSONAGEM 2: [Nome]
Visual Anchor: [Descrição visual completa copiada do arquivo personagens]

[... todos os personagens ...]

========================================
TAKES (60-90 caracteres cada)
========================================

TAKE 1 (X caracteres)
Cena: [Descrição visual da cena em 60-90 caracteres]
Personagens presentes: [Lista de personagens que aparecem]
└─ CHARACTER ANCHOR: [Nome: descrição visual do banco]

TAKE 2 (X caracteres)
Cena: [Descrição visual da cena em 60-90 caracteres]
Personagens presentes: [Lista de personagens que aparecem]
└─ CHARACTER ANCHOR: [Nome: descrição visual do banco]

[... continuar para todas as cenas ...]

---

REGRAS CRÍTICAS:

1. BANCO DE PERSONAGENS:
   - Copie EXATAMENTE as descrições do arquivo "personagens" fornecido
   - Não invente ou modifique descrições
   - Liste TODOS os personagens mencionados

2. DIVISÃO EM TAKES:
   - Cada take = 1 cena visual distinta
   - Cada descrição deve ter entre 60-90 CARACTERES
   - Conte os caracteres e inclua o número entre parênteses
   - Foque em ELEMENTOS VISUAIS (o que se vê, não o que se ouve)

3. CHARACTER ANCHOR:
   - Para CADA take, identifique quais personagens aparecem
   - Copie a descrição visual do banco para garantir consistência
   - Se não houver personagens, escreva "Nenhum personagem humano"

4. NARRATIVA VISUAL:
   - Pense em ângulos de câmera (close, plano geral, etc)
   - Descreva cenário, iluminação, ações
   - Seja específico e direto

EXEMPLO DE TAKE BEM FEITO:

TAKE 15 (78 caracteres)
Cena: Close no rosto de Moisés olhando para sarça ardente, expressão de espanto
Personagens presentes: Moisés
└─ CHARACTER ANCHOR: Moisés: homem de 80 anos, barba grisalha longa, túnica de pastor desgastada, pele bronzeada pelo sol do deserto, olhos profundos e cansados, cajado de madeira na mão

---

ARQUIVOS FORNECIDOS:

TEXTO NARRADO:
${textoNarrado}

PERSONAGENS:
${personagens}

---

Agora crie o arquivo TAKES completo seguindo EXATAMENTE o formato especificado acima.`
    : lang === 'en'
    ? `You will create a TAKES file dividing the narrated text into visual scenes of 60-90 characters each.

GOAL: Create a visual guide for AI image/video generation, ensuring character consistency.

FILE STRUCTURE:

========================================
CHARACTER BANK
========================================

[Extract ALL characters from the "characters" file below and list them here]

CHARACTER 1: [Name]
Visual Anchor: [Complete visual description copied from characters file]

CHARACTER 2: [Name]
Visual Anchor: [Complete visual description copied from characters file]

[... all characters ...]

========================================
TAKES (60-90 characters each)
========================================

TAKE 1 (X characters)
Scene: [Visual scene description in 60-90 characters]
Characters present: [List of characters appearing]
└─ CHARACTER ANCHOR: [Name: visual description from bank]

TAKE 2 (X characters)
Scene: [Visual scene description in 60-90 characters]
Characters present: [List of characters appearing]
└─ CHARACTER ANCHOR: [Name: visual description from bank]

[... continue for all scenes ...]

---

CRITICAL RULES:

1. CHARACTER BANK:
   - Copy EXACTLY the descriptions from the provided "characters" file
   - Don't invent or modify descriptions
   - List ALL mentioned characters

2. TAKES DIVISION:
   - Each take = 1 distinct visual scene
   - Each description must be 60-90 CHARACTERS
   - Count characters and include number in parentheses
   - Focus on VISUAL ELEMENTS (what is seen, not heard)

3. CHARACTER ANCHOR:
   - For EACH take, identify which characters appear
   - Copy visual description from bank to ensure consistency
   - If no characters, write "No human characters"

4. VISUAL NARRATIVE:
   - Think in camera angles (close-up, wide shot, etc)
   - Describe setting, lighting, actions
   - Be specific and direct

---

PROVIDED FILES:

NARRATED TEXT:
${textoNarrado}

CHARACTERS:
${personagens}

---

Now create the complete TAKES file following EXACTLY the format specified above.`
    : `Vas a crear un archivo TAKES dividiendo el texto narrado en escenas visuales de 60-90 caracteres cada una.

OBJETIVO: Crear una guía visual para generación de imágenes/videos con IA, garantizando consistencia de personajes.

[Similar structure in Spanish...]`;

  return instructions;
}
