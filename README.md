# StockFlow (sysStoque)

> Sistema inteligente e moderno de controle de estoque, catálogo de produtos com variantes e pipeline de vendas (CRM) integrado.

---

## ⚡ Quick Start (< 5 minutos)

### Pré-requisitos
- [Node.js](https://nodejs.org/) (v18+ ou v20+)
- [npm](https://www.npmjs.com/) ou gerenciador de pacotes equivalente
- [Docker](https://www.docker.com/) (opcional, para rodar o PostgreSQL localmente)

---

### Passo 1: Configurar o Backend (`estoque`)

1. Entre na pasta do backend:
   ```bash
   cd estoque
   ```

2. Crie o arquivo `.env` a partir do modelo:
   ```bash
   cp .env.example .env
   ```

3. Suba o banco de dados PostgreSQL local via Docker (ou utilize uma instância do Supabase):
   ```bash
   docker compose up -d
   ```
   > **Nota:** Caso utilize o Docker local, a variável `DATABASE_URL` no `.env` já aponta para `postgresql://user:password@localhost:5432/estoque`.

4. Instale as dependências e inicie o backend em modo desenvolvimento:
   ```bash
   npm install
   npm run dev
   ```
   *O servidor iniciará em `http://localhost:3333`.*

---

### Passo 2: Configurar o Frontend (`frontend`)

1. Em um **novo terminal**, acesse a pasta do frontend:
   ```bash
   cd frontend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie o servidor Vite:
   ```bash
   npm run dev
   ```
   *A aplicação estará acessível em `http://localhost:5173`.*

> **Dica:** O Vite já está configurado com proxy reverso em `frontend/vite.config.ts`, redirecionando automaticamente chamadas `/api/*` para `http://localhost:3333`.

---

## 🚀 Funcionalidades

- **📦 Gestão de Produtos & Variantes**:
  - Cadastro de produtos por categoria (Vestuário, Periféricos, Eletrônicos, etc.).
  - Múltiplas variantes dinâmicas por produto (tamanho, cor, preço individual e estoque inicial).
  - Upload de fotos por variante com armazenamento em nuvem via Supabase Storage.
  - Compartilhamento público de produtos via link direto e botão de envio para WhatsApp.

- **📊 Movimentações & Auditoria de Estoque**:
  - Registro de entradas (`IN`) e saídas (`OUT`) com motivos predefinidos ou personalizados.
  - Registro automático de entrada ao cadastrar novo produto com estoque inicial.
  - Validação estrita de saldo para evitar estoque negativo.
  - Histórico cronológico detalhado com rastreabilidade de usuário e data.

- **📈 Dashboard & Métricas em Tempo Real**:
  - KPIs: valor total em estoque, total de unidades, produtos cadastrados e alerta de estoque crítico (≤ 5 unidades).
  - **Análise Curva ABC**: classificação automática de produtos por faturamento (Classe A: 80%, Classe B: 15%, Classe C: 5%).
  - Visão gráfica de distribuição financeira e quantitativa por categoria.

- **🎯 Pipeline de Vendas & CRM (Kanban)**:
  - Fluxo em 4 estágios: `Enviado` ➔ `Negociando` ➔ `Notas` ➔ `Fechado`.
  - Geração de tokens de rastreamento para links compartilhados com clientes.
  - Busca inteligente de leads por telefone (WhatsApp no formato E.164).
  - Agendamento de data de retorno/follow-up e registro de observações por etapa.

- **📱 Experiência Mobile & PWA**:
  - Design responsivo mobile-first com transições suaves (Motion).
  - Suporte a instalação como aplicativo (PWA com Service Worker e Web App Manifest).
  - Alternância entre tema Claro e Escuro (Dark Mode).
  - Tutorial interativo (Onboarding) para novos usuários.

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologias |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Motion (Framer Motion) |
| **Backend** | Node.js, Express, TypeScript, TypeORM, Zod, bcryptjs, jsonwebtoken, Multer |
| **Banco de Dados** | PostgreSQL (local via Docker ou gerenciado via Supabase) |
| **Storage** | Supabase Storage (bucket `products`) |
| **Testes E2E** | Playwright |
| **Deploy** | Vercel (monorepo com Serverless Functions via `api/index.ts`) |

---

## 📂 Estrutura do Repositório

```text
sysStoque/
├── api/                  # Ponto de entrada Serverless para deploy na Vercel
│   └── index.ts          # Encaminha requisições /api para o backend compilado
├── estoque/              # Backend (Clean Architecture / DDD)
│   ├── docker-compose.yml# Container do PostgreSQL local
│   ├── .env.example      # Exemplo de configuração de variáveis de ambiente
│   ├── src/
│   │   ├── delivery/     # Controllers, rotas Express e middlewares
│   │   ├── domain/       # Casos de uso, entidades de negócio e interfaces de repositório
│   │   └── infra/        # TypeORM Data Source, repositórios, bcrypt e JWT
│   └── package.json
├── frontend/             # Frontend SPA (React + Vite)
│   ├── public/           # PWA manifest, service worker e ícones
│   ├── src/
│   │   ├── components/   # Telas (Dashboard, Produtos, Movimentações, Kanban, Onboarding)
│   │   ├── services/     # Cliente HTTP (Fetch API com interceptor de autenticação)
│   │   ├── types.ts      # Definições de tipos TypeScript compartilhadas
│   │   └── App.tsx       # Componente raiz e controle de navegação
│   ├── vite.config.ts    # Configuração do Vite com proxy para /api
│   └── package.json
└── vercel.json           # Orquestração de build e rotas para Vercel
```

---

## ⚙️ Variáveis de Ambiente (`estoque/.env`)

| Variável | Descrição | Exemplo / Padrão |
|---|---|---|
| `PORT` | Porta onde o backend será executado | `3333` |
| `NODE_ENV` | Ambiente de execução (`development` ou `production`) | `development` |
| `DATABASE_URL` | String de conexão com o PostgreSQL | `postgresql://user:password@localhost:5432/estoque` |
| `JWT_SECRET` | Chave secreta para assinatura dos tokens JWT | `stockflow-jwt-secret-dev` |
| `JWT_EXPIRES_IN` | Tempo de expiração do token | `7d` |
| `CORS_ORIGIN` | Origem autorizada para requisições CORS | `http://localhost:5173` |
| `SUPABASE_URL` | URL do projeto Supabase (Storage de imagens) | `https://xxxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Chave anônima / pública do Supabase | `sb_publishable_...` |
| `SUPABASE_STORAGE_BUCKET` | Nome do bucket para imagens | `products` |

---

## 📜 Scripts Disponíveis

### Backend (`estoque/`)
- `npm run dev`: Inicia o servidor com hot-reload usando `tsx watch`.
- `npm run build`: Compila o TypeScript gerando bundles em `dist/` com `tsup`.
- `npm run start`: Executa o backend a partir do build compilado.
- `npm run typecheck`: Executa verificação de tipos (`tsc --noEmit`).

### Frontend (`frontend/`)
- `npm run dev`: Inicia o servidor de desenvolvimento do Vite (`localhost:5173`).
- `npm run build`: Cria a build otimizada para produção em `dist/`.
- `npm run preview`: Visualiza localmente a build de produção.
- `npm run test`: Executa os testes automatizados com Playwright.
- `npm run test:ui`: Abre a interface gráfica interativa do Playwright.

---

## ☁️ Deploy na Vercel

O projeto está estruturado para deploy contínuo na Vercel através do arquivo [vercel.json](file:///c:/Users/gabri/OneDrive/Documentos/projetos/sysStoque/vercel.json):
1. O backend é compilado e servido via Vercel Serverless Function através de [api/index.ts](file:///c:/Users/gabri/OneDrive/Documentos/projetos/sysStoque/api/index.ts).
2. O frontend é construído estaticamente para `frontend/dist`.
3. Certifique-se de configurar as variáveis de ambiente (`DATABASE_URL`, `JWT_SECRET`, `SUPABASE_*`) no painel da Vercel.

---

## 📄 Licença

Este projeto é desenvolvido para fins de controle e gestão de estoque. Consulte os arquivos de código para detalhes específicos de licença.
