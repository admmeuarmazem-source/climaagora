# 🌤️ ClimaAgora IA — Plataforma Meteorológica & Painel Administrativo Master

Plataforma meteorológica avançada e segura com previsão de tempo baseada em inteligência artificial multi-modelo e consenso heurístico cooperativo (coordenando **Google Gemini 3.5**, **Anthropic Claude**, **OpenAI ChatGPT-4o**, **xAI Grok-2** e **DeepSeek V3**).

A plataforma inclui um painel administrativo completo para controle total e monitoramento de satélites, calibrações, assinantes e inteligência artificial.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Framer Motion.
- **Visualização de Dados**: Recharts (com gráficos de área customizados para monitoramento hídrico e janelas de estresse).
- **Backend**: Node.js, Express, TypeScript (compilado em CJS de alta velocidade via Esbuild).
- **IA & Modelagem**: Google GenAI SDK (Gemini 3.5 Flash), Claude (Anthropic) e multi-modelos integrados no motor matemático de fusão.
- **Banco de Dados**: Firebase Firestore & Firebase Auth.

---

## 🌾 Monitoramento Ambiental & Janelas de Risco de Seca

A plataforma agora conta com um módulo robusto de **Balanço Hídrico e Risco de Seca** na seção de monitoramento ambiental:
- **Gráfico de Área Comparativo**: Compara o *Volume Mensal de Precipitação Projetado* com as *Taxas de Evapotranspiração* de forma dinâmica para cada cidade sintonizada.
- **Janelas de Risco de Seca**: Destaca visualmente em vermelho e laranja os meses em que a evapotranspiração supera a precipitação projetada, indicando períodos críticos de perda de água no solo (estresse hídrico).
- **Recomendações Agronômicas Proativas**: Exibe informativos técnicos inteligentes com base no nível de estresse hídrico calculado para a localidade.

---

## 💻 Configuração para o VS Code (Ambiente de Desenvolvimento)

Para garantir a melhor experiência de desenvolvimento no **VS Code**, siga estes passos:

1. **Extensões Recomendadas**:
   - [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) — Para autocomplete das classes Tailwind.
   - [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) — Para auto-formatação.
   - [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) — Para validação estática do código TypeScript.

2. **Configurações Locais**:
   O arquivo `.vscode/settings.json` já foi gerado na raiz do projeto com as seguintes diretrizes configuradas para automatizar a lintagem e formatação ao salvar:
   - Formatação automática ao salvar (`editor.formatOnSave`).
   - Correção de erros do ESLint ao salvar (`editor.codeActionsOnSave`).

3. **Iniciando o Servidor de Desenvolvimento**:
   ```bash
   # Instale as dependências
   npm install

   # Crie e configure o seu arquivo .env com a sua chave da API do Gemini
   cp .env.example .env

   # Inicie em modo desenvolvimento (servidor Express + Vite integrado)
   npm run dev
   ```

---

## 🐙 Guia de Publicação no GitHub

Para guardar o seu projeto de forma segura e versionada no **GitHub**:

1. **Crie um repositório vazio** no seu painel do GitHub (sem adicionar README, .gitignore ou licença).
2. Na sua máquina local, abra a pasta do projeto no terminal e execute:
   ```bash
   # Inicializa o repositório Git local
   git init

   # Adiciona todos os arquivos (o .gitignore já está configurado para ocultar a node_modules e .env)
   git add .

   # Realiza o primeiro commit
   git commit -m "feat: implementado fuso horário local e integração cooperativa do Claude"

   # Define o branch principal como main
   git branch -M main

   # Conecte ao seu repositório remoto no GitHub (substitua pelo seu link)
   git remote add origin https://github.com/SEU_USUARIO/NOME_DO_REPOSITORIO.git

   # Envia os arquivos para o GitHub
   git push -u origin main
   ```

---

## ⚡ Guia de Deploy na Cloudflare

Para implantar esta aplicação de alto desempenho na infraestrutura global da Cloudflare:

### Opção A: Deploy Frontend Estático (Cloudflare Pages)
Se você optar por rodar apenas o frontend estático e apontar para uma API externa (ou se desmembrar as rotas do Express):
1. Acesse o painel da **Cloudflare** > **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
2. Selecione o repositório do GitHub que você acabou de subir.
3. Configure os seguintes parâmetros de build:
   - **Framework Preset**: `Vite` (ou escolha `None`)
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. Clique em **Save and Deploy**. A Cloudflare distribuirá seu frontend estático globalmente em menos de 1 minuto!

### Opção B: Deploy Full-Stack (Cloudflare Pages + Cloudflare Workers)
Como esta plataforma utiliza uma API Express para ocultar e proteger chaves de API confidenciais (como as chaves do Gemini e Claude) contra exposição no navegador, você pode implantar a API como um **Cloudflare Worker** ou contêiner (como **Cloud Run / VPS**), e o frontend estático no **Cloudflare Pages**.

#### 1. API Express em um Worker (usando `@cloudflare/workers-honeycomb` ou similar)
- Você pode converter o seu backend Express usando adaptadores serverless para rodar dentro dos Workers da Cloudflare de forma extremamente barata e rápida.
- Adicione as chaves de API (como `GEMINI_API_KEY`) diretamente no painel de configurações de ambiente do Worker na Cloudflare.

#### 2. Configurando as Variáveis de Ambiente na Cloudflare
Não se esqueça de adicionar as seguintes variáveis seguras nas configurações do Cloudflare Pages / Workers:
- `GEMINI_API_KEY` — Chave secreta de IA obtida do Google AI Studio.

---

## 🔒 Acesso Padrão ao Painel Administrativo

As credenciais pré-configuradas de segurança administrativa (com 2FA ativo) são as seguintes:

- **E-mail Administrativo**: `admmeuarmazem@gmail.com`
- **Usuário**: `Admin`
- **Senha Secreta**: `Admin2130`
- **Autenticação 2FA (6 dígitos)**: `123456`
- **CAPTCHA**: Operação matemática simples dinâmica de segurança.
