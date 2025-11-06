# 📜 Gerador de Roteiros Bíblicos

Aplicação web profissional para gerar roteiros completos de documentários bíblicos usando IA.

## 🎯 O que faz?

Gera automaticamente **5 arquivos profissionais** para documentários bíblicos:

1. **01_Roteiro_Estruturado.txt** (Português) - Estrutura completa com HOOK + 6 ATOS + CONCLUSÃO
2. **02_Trilha_Sonora.txt** (PT/EN) - Direção musical para cada seção
3. **03_Texto_Narrado.txt** (Inglês) - Mínimo 8,500 palavras para narração
4. **04_Personagens_Descricoes.txt** (Inglês) - Descrições para IA de imagens
5. **05_Titulo_Descricao.txt** (Português) - Títulos e descrição para YouTube

## 🚀 Como Usar

### Pré-requisitos

- Node.js 18+ instalado
- Chave API do Google Gemini (gratuita)

### Instalação

1. **Instalar dependências:**
```bash
npm install
```

2. **Configurar API Key:**

Crie o arquivo `.env.local` na raiz do projeto:
```bash
GEMINI_API_KEY=sua_chave_aqui
```

**Obter chave gratuita:** https://makersuite.google.com/app/apikey

3. **Iniciar aplicação:**
```bash
npm run dev
```

4. **Abrir no navegador:**
```
http://localhost:3000
```

## 📝 Como Gerar um Roteiro

1. **Preencher o formulário:**
   - Título do vídeo
   - Sinopse (2-3 parágrafos descrevendo tema e abordagem)
   - Base de conhecimento (opcional - referências, citações, dados)

2. **Clicar em "Gerar Roteiro Completo"**

3. **Aguardar 5-10 minutos** (a IA gerará os 5 arquivos em sequência)

4. **Baixar:**
   - Download completo (.zip) ou
   - Downloads individuais por arquivo

## 🎨 Funcionalidades

- ✅ Geração automática de 5 arquivos profissionais
- ✅ Progresso em tempo real (Server-Sent Events)
- ✅ Preview de cada arquivo no navegador
- ✅ Download individual ou em lote (.zip)
- ✅ Validação de qualidade (mínimo 8500 palavras)
- ✅ Estatísticas detalhadas
- ✅ Interface moderna e responsiva
- ✅ Dark mode automático

## 🛠️ Tecnologias

- **Next.js 14** - Framework React
- **TypeScript** - Type safety
- **Tailwind CSS** - Estilização
- **Google Gemini AI** - Geração de conteúdo
- **Server-Sent Events** - Progresso em tempo real
- **JSZip** - Compactação de arquivos

## 📦 Estrutura do Projeto

```
/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Página principal
│   │   ├── layout.tsx            # Layout
│   │   ├── globals.css           # Estilos globais
│   │   └── api/
│   │       └── generate/
│   │           └── route.ts      # API de geração
│   ├── components/
│   │   ├── InputForm.tsx         # Formulário
│   │   ├── ProgressBar.tsx       # Barra de progresso
│   │   ├── FilePreview.tsx       # Preview
│   │   └── DownloadButtons.tsx   # Downloads
│   ├── lib/
│   │   ├── gemini.ts             # Config Gemini API
│   │   ├── prompts.ts            # Templates de prompts
│   │   └── validators.ts         # Validações
│   └── types/
│       └── index.ts              # TypeScript types
├── package.json
├── tsconfig.json
└── .env.local                    # API keys (criar)
```

## 🔄 Migração para Claude API (Futura)

Para trocar de Gemini para Claude:

1. Instalar SDK:
```bash
npm install @anthropic-ai/sdk
```

2. Atualizar `.env.local`:
```
ANTHROPIC_API_KEY=sua_chave_claude
```

3. Modificar `src/lib/gemini.ts` para usar Claude SDK

## ⚙️ Comandos

```bash
npm run dev      # Desenvolvimento
npm run build    # Build para produção
npm start        # Rodar produção
npm run lint     # Linter
```

## 🚀 Deploy

### Vercel (Recomendado - Grátis)

```bash
npm install -g vercel
vercel
```

Adicionar `GEMINI_API_KEY` nas variáveis de ambiente do Vercel.

## 📄 Licença

Uso pessoal e comercial permitido.

## 🤝 Suporte

Para dúvidas ou problemas, abra uma issue no repositório.

---

**Desenvolvido com ❤️ para criadores de conteúdo bíblico**
