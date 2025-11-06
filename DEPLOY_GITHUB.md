# 🚀 DEPLOY NO GITHUB - PASSO A PASSO

## ✅ STATUS ATUAL
- [x] Git inicializado
- [x] Commit inicial feito (24 arquivos, 9554 linhas)
- [x] Arquivos sensíveis protegidos (.env.local no .gitignore)
- [ ] Criar repositório no GitHub
- [ ] Push para GitHub
- [ ] Deploy na Vercel

---

## 📋 OPÇÃO 1: CRIAR REPO MANUALMENTE (RECOMENDADO - 2 MIN)

### Passo 1: Criar repositório no GitHub

1. **Acesse:** https://github.com/new

2. **Preencha:**
   - **Repository name:** `gerador-roteiros-biblicos`
   - **Description:** `🎬 Gerador de roteiros profissionais para documentários bíblicos usando IA`
   - **Visibility:** Public (ou Private se preferir)
   - **❌ NÃO** marque "Add a README file"
   - **❌ NÃO** marque ".gitignore"
   - **❌ NÃO** marque "Choose a license"

3. **Clique:** "Create repository"

### Passo 2: Conectar e fazer Push

Após criar o repo, **COPIE E COLE** estes comandos no terminal:

```bash
cd "c:\Users\tharc\Videos\GERADOR PROFISSIONAL DE ROTEIROS"

# Adicionar o remote (SUBSTITUA "SEU_USUARIO" pelo seu username do GitHub)
git remote add origin https://github.com/SEU_USUARIO/gerador-roteiros-biblicos.git

# Renomear branch para main (padrão do GitHub)
git branch -M main

# Fazer push
git push -u origin main
```

**IMPORTANTE:** Substitua `SEU_USUARIO` pelo seu username do GitHub!

---

## 📋 OPÇÃO 2: CRIAR REPO VIA COMANDO (RÁPIDO - 30 SEG)

Se você tem **GitHub CLI** instalado:

```bash
cd "c:\Users\tharc\Videos\GERADOR PROFISSIONAL DE ROTEIROS"

# Criar repo e fazer push automaticamente
gh repo create gerador-roteiros-biblicos --public --source=. --remote=origin --push
```

**Não tem GitHub CLI?** Instale: https://cli.github.com/

---

## 🔐 AUTENTICAÇÃO

Se o Git pedir **credenciais** durante o push:

### Opção A: Personal Access Token (Recomendado)

1. **Gerar token:** https://github.com/settings/tokens/new
2. **Scopes necessários:**
   - ✅ `repo` (acesso completo a repositórios)
3. **Copiar o token gerado**
4. **No prompt de senha:** Cole o token (não sua senha do GitHub)

### Opção B: SSH Key

```bash
# Gerar chave SSH
ssh-keygen -t ed25519 -C "seu_email@example.com"

# Adicionar ao ssh-agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Mostrar chave pública (copie e adicione em: https://github.com/settings/keys)
cat ~/.ssh/id_ed25519.pub
```

Depois use SSH URL:
```bash
git remote set-url origin git@github.com:SEU_USUARIO/gerador-roteiros-biblicos.git
```

---

## 🌐 DEPLOY NA VERCEL (GRÁTIS E AUTOMÁTICO)

Após fazer push no GitHub:

### Método 1: Via Site (MAIS FÁCIL)

1. **Acesse:** https://vercel.com/new
2. **Faça login** com sua conta GitHub
3. **Import o repositório:** `gerador-roteiros-biblicos`
4. **Configure:**
   - **Framework Preset:** Next.js (detectado automaticamente)
   - **Root Directory:** `./`
   - **Build Command:** `npm run build` (padrão)
   - **Environment Variables:**
     - Key: `GEMINI_API_KEY`
     - Value: [SUA CHAVE API DO GEMINI]
5. **Clique:** "Deploy"

**Pronto!** Em 2-3 minutos seu app estará no ar com URL tipo:
`https://gerador-roteiros-biblicos.vercel.app`

### Método 2: Via CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
cd "c:\Users\tharc\Videos\GERADOR PROFISSIONAL DE ROTEIROS"
vercel

# Adicionar variável de ambiente
vercel env add GEMINI_API_KEY
```

---

## 📦 COMANDOS PRONTOS (COPIE TUDO DE UMA VEZ)

**IMPORTANTE:** Substitua `SEU_USUARIO` e `SUA_API_KEY`!

```bash
# Navegar para a pasta
cd "c:\Users\tharc\Videos\GERADOR PROFISSIONAL DE ROTEIROS"

# Adicionar remote (SUBSTITUIR SEU_USUARIO)
git remote add origin https://github.com/SEU_USUARIO/gerador-roteiros-biblicos.git

# Renomear branch
git branch -M main

# Push
git push -u origin main

# Deploy na Vercel (após push)
vercel --prod
```

---

## ✅ VERIFICAÇÃO PÓS-DEPLOY

Após deploy na Vercel:

1. **Teste o app:** Abra a URL da Vercel
2. **Verifique variável de ambiente:**
   - Settings → Environment Variables
   - Deve ter: `GEMINI_API_KEY`
3. **Teste uma geração:**
   - Preencha formulário
   - Clique "Gerar Roteiro"
   - Verifique se funciona

---

## 🔄 ATUALIZAÇÕES FUTURAS

Para atualizar o app no GitHub/Vercel:

```bash
# Fazer alterações no código...

# Stage, commit e push
git add .
git commit -m "Descrição da mudança"
git push origin main
```

**A Vercel fará deploy automático** a cada push! 🚀

---

## 🛠️ TROUBLESHOOTING

### ❌ "remote origin already exists"
```bash
git remote remove origin
# Depois adicione novamente com o comando correto
```

### ❌ "Authentication failed"
- Use Personal Access Token ao invés de senha
- Ou configure SSH key

### ❌ Erro no deploy da Vercel
- Verifique se `GEMINI_API_KEY` está configurada
- Verifique logs em: Vercel Dashboard → Deployments → Ver logs

### ❌ "Port 3000 already in use" (local)
```bash
npm run dev -- -p 3001
```

---

## 📊 RESUMO TÉCNICO

### O que será publicado:
- ✅ Código fonte completo
- ✅ Documentação (README, COMECE_AQUI, etc)
- ✅ Configurações (package.json, tsconfig, etc)
- ❌ **node_modules** (ignorado)
- ❌ **.env.local** (ignorado - SEGURO!)

### O que vai pro Vercel:
- ✅ App Next.js buildado
- ✅ API routes funcionando
- ✅ Static assets otimizados
- ✅ GEMINI_API_KEY como env var

---

## 🎯 PRÓXIMO PASSO

1. **AGORA:** Crie o repo no GitHub (link acima)
2. **EM SEGUIDA:** Execute os comandos de push
3. **DEPOIS:** Deploy na Vercel
4. **PRONTO:** Compartilhe o link!

---

**Qualquer dúvida, me chame!** 🚀

Bom almoço! 🍽️
