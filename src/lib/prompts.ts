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

export function buildTextoNarradoHookPrompt(roteiro: string, input: ScriptInput): string {
  return `${INSTRUCOES_BASE}

ROTEIRO ESTRUTURADO - SEÇÃO HOOK:
${roteiro.match(/HOOK[\s\S]*?(?=ATO I|$)/i)?.[0] || 'HOOK não encontrado'}

TAREFA: Expandir o HOOK em texto narrado fluído em INGLÊS para YouTube.

META: 400-500 palavras

CARACTERÍSTICAS ESSENCIAIS:
- Escrito em primeira pessoa do plural ("we") ou segunda pessoa ("you")
- Tom conversacional mas autoritativo
- Parágrafos de 3-5 frases para facilitar narração
- Criar MISTÉRIO e CURIOSIDADE imediatos
- Engajar o espectador nos primeiros 10 segundos

TEMPLATE DE ABERTURA:
"What's the difference between [conceito A] and [conceito B]?
Between [comparação concreta] and [comparação abstrata]?

Let's talk about [introduzir protagonista/evento com descrição impactante].
[Nome]. [Descrição em duas palavras].

But what if I told you that [revelação surpreendente]?
That [fato específico que contradiz expectativas]?

Over the next 55 minutes, we're going to [ação específica].
You're about to discover [descoberta principal].

Prepare yourself to [experiência emocional/intelectual].
This is [redefinição do tema].
Let's begin."

IMPORTANTE:
- NÃO usar bullets ou listas
- Texto CORRIDO em parágrafos
- Transições suaves
- Linguagem simples e envolvente
- Criar senso de urgência

Escreva APENAS a seção OPENING - THE HOOK em inglês, formatado assim:

OPENING - THE HOOK (0:00-2:30)

[Texto completo aqui em parágrafos corridos]
`;
}

export function buildTextoNarradoAtoPrompt(
  roteiro: string,
  atoNumber: number,
  atoTitle: string,
  timestamps: string
): string {
  const atoRomanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI'];
  const atoRoman = atoRomanNumerals[atoNumber - 1];

  const atoRegex = new RegExp(`ATO ${atoRoman}[\\s\\S]*?(?=ATO ${atoRomanNumerals[atoNumber] || 'CONCLUSÃO'}|CONCLUSÃO|$)`, 'i');
  const atoContent = roteiro.match(atoRegex)?.[0] || `ATO ${atoRoman} não encontrado`;

  return `${INSTRUCOES_BASE}

ROTEIRO ESTRUTURADO - ATO ${atoRoman}:
${atoContent}

TAREFA: Expandir o ATO ${atoRoman} em texto narrado fluído em INGLÊS.

META: 1,000-1,250 palavras

TÉCNICAS NARRATIVAS OBRIGATÓRIAS:

1. ANCORAGEM EM DADOS:
"Archaeological evidence shows..."
"The numbers are staggering: [estatística]"
"Recent discoveries at [local] revealed..."

2. CRIAÇÃO DE IMAGENS MENTAIS:
"Imagine [descrição sensorial vívida]"
"Picture [cena específica]"

3. QUESTIONAMENTO RETÓRICO:
"But why would [questão lógica]?"
"How could [impossibilidade aparente]?"

4. REVELAÇÃO PROGRESSIVA:
"This is where it gets interesting..."
"But here's what they don't tell you..."

5. CONEXÕES CONTEMPORÂNEAS:
"We still see this today in..."
"The modern parallel would be..."

ESTRUTURA:
- Introduzir claramente o tema do ato
- Desenvolver cada argumento listado no roteiro estruturado
- Adicionar exemplos concretos e específicos
- Incluir detalhes históricos, arqueológicos, ou textuais
- Usar storytelling: criar cenas, descrever situações
- Fazer transições suaves entre argumentos
- Concluir conectando ao próximo ato

IMPORTANTE:
- NÃO usar bullets ou listas
- Texto CORRIDO em parágrafos de 3-5 frases
- Tom informativo mas ENVOLVENTE
- Linguagem simples, evitar jargão acadêmico
- Usar narrativa, não apenas exposição

Escreva APENAS o ACT ${atoNumber === 1 ? 'ONE' : atoNumber === 2 ? 'TWO' : atoNumber === 3 ? 'THREE' : atoNumber === 4 ? 'FOUR' : atoNumber === 5 ? 'FIVE' : 'SIX'} em inglês, formatado assim:

ACT ${atoNumber === 1 ? 'ONE' : atoNumber === 2 ? 'TWO' : atoNumber === 3 ? 'THREE' : atoNumber === 4 ? 'FOUR' : atoNumber === 5 ? 'FIVE' : 'SIX'} - ${atoTitle} (${timestamps})

[Texto completo aqui em parágrafos corridos]
`;
}

export function buildTextoNarradoConclusaoPrompt(roteiro: string): string {
  const conclusaoContent = roteiro.match(/CONCLUSÃO[\s\S]*$/i)?.[0] || 'CONCLUSÃO não encontrada';

  return `${INSTRUCOES_BASE}

ROTEIRO ESTRUTURADO - CONCLUSÃO:
${conclusaoContent}

TAREFA: Expandir a CONCLUSÃO em texto narrado fluído em INGLÊS.

META: 600-700 palavras

ESTRUTURA DA CONCLUSÃO:

1. RECAPITULAÇÃO (2-3 parágrafos):
- Resumir os pontos principais brevemente
- Conectar os atos em uma narrativa coesa

2. TRANSIÇÃO PARA FÉ (1 parágrafo):
"But beyond all the analysis..."
"When we step back from the evidence..."

3. AFIRMAÇÃO DE FÉ E MISTÉRIO (3-4 parágrafos):
- Reconhecer os limites da ciência
- Afirmar que milagres existem e o sobrenatural é real
- Explicar como a análise FORTALECE a fé
- A Palavra de Deus permanece verdadeira e autoritativa

4. MENSAGEM FINAL (2 parágrafos):
- Encorajamento para aprofundar a própria fé
- Call to action para reflexão espiritual
- Frase de impacto final

TEMPLATE:
"We've explored [tema] from multiple angles. We've examined [aspectos].
And what have we discovered?

That the more deeply we investigate, the more the grandeur of the biblical narrative reveals itself.
Yes, we can find natural explanations for some elements. Yes, there are parallels in other cultures.
But this doesn't diminish biblical truth - on the contrary, it confirms that God has always been speaking to humanity in multiple forms.

Science has its limits. It can tell us how, but it cannot explain the perfect timing, the divine hand orchestrating these mechanisms.

In the end, faith isn't about having all the answers. It's about trusting the One who does.
Miracles exist. The supernatural is real. And the Word of God remains true and authoritative.

May this intellectual journey strengthen your spiritual journey. May the questions lead to a deeper faith.
And may you discover, as many before us, that the more we question sincerely, the more God's truth reveals itself."

IMPORTANTE:
- Tom INSPIRADOR e ESPERANÇOSO
- Equilibrar análise crítica com afirmação de fé
- Linguagem eloquente mas acessível
- Terminar com impacto emocional

Escreva APENAS a seção CONCLUSION em inglês, formatado assim:

CONCLUSION - FAITH AND MYSTERY (52:30-55:00)

[Texto completo aqui em parágrafos corridos]
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

export function buildTituloPrompt(roteiro: string, input: ScriptInput): string {
  return `${INSTRUCOES_BASE}

ROTEIRO COMPLETO:
${roteiro}

TAREFA: Criar títulos para YouTube e descrição completa em PORTUGUÊS.

ESTRUTURA DO ARQUIVO:

OPÇÕES DE TÍTULOS PARA YOUTUBE
================================================

OPÇÃO 1: [45-60 caracteres, clickbait moderado, com emoji]
OPÇÃO 2: [45-60 caracteres, mais direto, questão provocativa]
OPÇÃO 3: [45-60 caracteres, foco em revelação/descoberta]
OPÇÃO 4: [45-60 caracteres, controverso mas verdadeiro]
OPÇÃO 5: [45-60 caracteres, promessa de resposta definitiva]

TÍTULO RECOMENDADO: [Indicar qual dos 5 e explicar por quê em 1 linha]


DESCRIÇÃO COMPLETA PARA YOUTUBE
================================================

[Parágrafo introdutório de 2-3 linhas resumindo o vídeo de forma impactante]

Neste documentário, você vai descobrir:
✓ [Ponto principal 1 - específico e impactante]
✓ [Ponto principal 2 - específico e impactante]
✓ [Ponto principal 3 - específico e impactante]
✓ [Ponto principal 4 - específico e impactante]
✓ [Ponto principal 5 - específico e impactante]

TIMESTAMPS:
0:00 - Introdução: [Breve descrição do hook]
2:30 - [Título do Ato I extraído do roteiro]
7:30 - [Título do Ato II extraído do roteiro]
15:30 - [Título do Ato III extraído do roteiro]
25:30 - [Título do Ato IV extraído do roteiro]
37:30 - [Título do Ato V extraído do roteiro]
45:30 - [Título do Ato VI extraído do roteiro]
52:30 - Conclusão: [Breve descrição]

📚 FONTES E REFERÊNCIAS:
[Listar 3-5 principais fontes mencionadas ou usadas]

🔔 Inscreva-se no canal para mais documentários bíblicos
👍 Deixe seu like se este conteúdo foi útil
💬 Comente abaixo suas reflexões

#[hashtag1] #[hashtag2] #[hashtag3] #[hashtag4] #[hashtag5]


IDEIAS PARA THUMBNAIL
================================================

THUMBNAIL OPÇÃO 1:
Conceito: [Descrever a ideia visual principal em 2-3 linhas]
Elementos:
- [Elemento visual 1]
- [Elemento visual 2]
- Texto em destaque: "[TEXTO CURTO E IMPACTANTE]"
- Esquema de cores: [cores principais]
- Estilo: [fotorrealista/artístico/dramático]

THUMBNAIL OPÇÃO 2:
Conceito: [Descrever ideia visual diferente em 2-3 linhas]
Elementos:
- [Elemento visual 1]
- [Elemento visual 2]
- Texto em destaque: "[TEXTO ALTERNATIVO]"
- Esquema de cores: [cores principais]
- Estilo: [fotorrealista/artístico/dramático]

DIRETRIZES PARA TÍTULOS:
✓ 45-60 caracteres
✓ Palavra-chave no início
✓ Provocativo mas honesto
✓ Criar curiosidade
✓ Pode usar 1 emoji estratégico
`;
}
