# Documentação Funcional — StockFlow

## Visão Geral

Sistema de Controle de Estoque inteligente com suporte a:
- Gestão de produtos com múltiplas variantes (tamanho/cor)
- Upload de imagens por variante (Supabase Storage)
- Movimentações de entrada e saída com atualização automática de estoque
- Criação de produto já registra entrada inicial no histórico de movimentações
- Dashboard com KPIs, análise ABC e métricas por categoria
- **Pipeline de vendas (Kanban)** com rastreamento de leads por link público
- Compartilhamento público de produtos via link com WhatsApp
- **Tutorial interativo** com dados mockados para novos usuários
- Interface responsiva mobile-first com PWA

---

## Funcionalidades

### 1. Autenticação
- **Login**: POST `/auth/login` com email + senha → retorna JWT + user `{id, name, email, onboardingDone}`
- **Registro**: POST `/auth/register` com name, email, senha → bcrypt hash (12 rounds) → retorna JWT + user
- **Sessão**: Token JWT no `localStorage` (`stockflow_token`); user em `stockflow_user`
- **Segurança**: bcryptjs (cost 12), jsonwebtoken (expiração 7 dias, segredo `JWT_SECRET`), middleware `authMiddleware` valida e seta `req.userId`
- **Onboarding**: Flag `onboarding_done` no UserEntity; PATCH `/auth/onboarding` (auth) marca como true; frontend verifica `user.onboardingDone` no login
- **Logout**: Remove tokens do localStorage + limpa estado global

### 2. Dashboard (Resumo)
- **Valor total do estoque**: Soma de `preço × estoque` de todas as variantes (calculado no frontend via `getDashboard`)
- **Totais**: Produtos, variantes, unidades em estoque
- **Alerta de estoque crítico**: Variantes com ≤ 5 unidades (contagem exibida no card)
- **Fluxo de movimentação (30 dias)**: Entradas vs Saídas (quantidade) — dados de `/movements` agregados no frontend
- **Análise ABC (30 dias)**: Classificação por receita de vendas (OUT × sale_price):
  - **Classe A**: Top 80% da receita
  - **Classe B**: 80–95% da receita
  - **Classe C**: Bottom 5% da receita
  - Calculado no backend (`MovementRepositoryImpl.classifyABC`) via query SQL com LEFT JOIN movements OUT
- **Valores por categoria**: Agrupamento de estoque (qtd) e valor financeiro por categoria do produto
- **Movimentações recentes**: Últimas 15 (backend) / 15 (frontend) com detalhes de produto, variante, tipo, qtd, motivo

### 3. Produtos
- **Cadastro**: Nome, categoria (Vestuário, Periféricos, Utensílios, Eletrônicos, Papelaria, Outros), descrição opcional
- **Variantes**: Grade dinâmica com **nome** (ex: "Azul / M"), preço de venda, estoque inicial, imagem opcional; backend armazena como `size` + `color` (default "default"); se nenhuma variante, cria "Padrão"
- **Preços**: Frontend envia `salePrice` por variante; backend persiste `cost_price` (custo) e `sale_price` (venda) no produto, e `price` na variante
- **Imagens**: Upload individual por variante; armazenamento no Supabase Storage (bucket `products`), formatos JPG/PNG/GIF/WebP/SVG, limite 10MB (multer memoryStorage)
- **Busca**: Por nome ou descrição (client-side filter)
- **Filtro**: Por categoria
- **Edição**: Altera dados do produto e **recria variantes** (deleta antigas + cria novas)
- **Exclusão**: Remove produto + variantes + movimentos associados (cascata, com confirmação)
- **Movimentação rápida**: Botões IN/OUT direto na lista de variantes (chama `createMovement`)
- **Compartilhamento com rastreamento**: Botão abre `ShareLeadModal` → cria lead no pipeline + gera link `/compartilhar/:id?track=:token` copiado ao clipboard + botão WhatsApp

### 4. Movimentações
- **Registro manual**: Modal com seleção de produto → variante → tipo (IN/OUT) → quantidade → motivo (presets: "Compra", "Venda", "Ajuste de inventário", "Devolução", "Perda", "Outro" + texto livre)
- **Registro automático**: Ao criar produto com variantes `stock > 0`, registra movimento IN por variante com motivo "Entrada inicial por criação de produto" (`CreateProduct.ts:45-50`)
- **Validação de estoque**: Saídas (OUT) bloqueadas se `quantidade > variant.stock` — erro: "Saldo insuficiente. Estoque atual: X" (`RegisterMovement.ts:28-30`)
- **Atualização de estoque**: IN soma, OUT subtrai; persistido via `UpdateVariantStockRepository` (`RegisterMovement.ts:41-44`)
- **Filtros**: Por tipo (Entradas/Saídas/Todas) e busca textual por nome produto/variante/motivo
- **Histórico**: Lista cronológica (últimas 50) com JOIN: produto, variante (size/color), tipo, quantidade, motivo, usuário, data

### 5. Leads & Kanban (Vendas)
- **Pipeline visual**: 4 colunas — Enviado → Negociando → Notas → Fechado (cores: azul, âmbar, roxo, esmeralda)
- **Criação de lead**: Modal com select de produto, nome do cliente, WhatsApp (formato E.164), observação opcional → POST `/client-flow` gera `trackingToken` UUID
- **Compartilhamento com rastreamento**: Gera link público `/compartilhar/:productId?track=:token`; ao abrir, PUT `/client-flow/track/:token` registra tracking
- **Busca por telefone (RN-004)**: No modal de compartilhamento, ao digitar telefone, busca lead existente via GET `/client-flow/find-by-contact/:contact`; se encontrado, preenche nome automaticamente
- **Drag & drop** (desktop): Arrasta cards entre colunas usando HTML5 Drag API
- **Botão "Avançar"** (mobile/desktop): Alternativa ao drag — avança para próximo estágio sequencial (ENVIADO→NEGOCIANDO→NOTAS→FECHADO)
- **Modal de movimento**: Ao mover (drag ou avançar), abre modal exigindo observação; se alvo = NOTAS, exige também data de retorno futura (validação client + server RN-001/002)
- **Edição de lead**: Botão lápis abre modal para adicionar observação + alterar data de retorno (mantém status atual)
- **Atualização otimista**: UI atualiza imediatamente; rollback automático em caso de falha na API
- **Tracking automático (RN-003)**: Quando cliente abre link, se status = ENVIADO, backend avança para NEGOCIANDO
- **Histórico no card**: Exibe timeline de atualizações com status, descrição, timestamp; indica data de retorno se houver

### 6. Notificações (Toast)
- Substitui `alert()` nativo por notificações visuais na tela
- 4 tipos: sucesso (verde), erro (vermelho), aviso (amarelo), info (índigo)
- Auto-dismiss após 4 segundos
- Botão para fechar manualmente
- Presente em todas as operações: criar, editar, excluir produtos, leads e movimentações

### 7. Tutorial Interativo (Onboarding)
- **Gatilho**: Exibido automaticamente para novos usuários no primeiro login (controlado por flag `onboarding_done` no servidor, verificado via `user.onboardingDone`)
- **Cobertura**: **46 passos** guiados por todas as telas — produtos (cadastro, variantes, imagem, preço, estoque, salvamento), movimentações (seleção produto/variante, tipo, quantidade, motivo, registro), vendas/kanban (lead: produto, nome, contato, descrição, submissão, cards, movimento entre colunas), dashboard (KPIs, estoque crítico, fluxo, categorias, atividades) e modo escuro
- **Destaque visual**: Efeito de spotlight com blur cutout ao redor do elemento alvo (4 regiões com `backdrop-blur-[3px]` + anel highlight indigo)
- **Auto-navegação**: Alterna entre abas (`onNavigateTab`) e abre/fecha modais automaticamente conforme avança
- **Polling de estabilidade**: Aguarda posição do elemento estabilizar (300 tentativas, intervalo `requestAnimationFrame`) antes de mostrar tooltip
- **Auto-clique**: Clica automaticamente em botões como "Adicionar Variante" (`autoClick: true`)
- **Dados mockados**: Cria produto temporário "Produto Exemplo" com variante "Padrão" (R$ 99,90, estoque 10) ao iniciar; deleta ao finalizar ou pular
- **Limpeza automática**: Ao finalizar/pular, dados mockados são removidos via `deleteProduct` e lista recarregada
- **Lock de scroll**: `body.style.overflow = "hidden"` durante tutorial

### 8. Compartilhamento Público
- **Rota**: `/compartilhar/:productId?track=:trackingToken` (sem autenticação, detectado em `App.tsx:88-100`)
- **Dados**: GET `/products/:id/share` retorna produto público com variantes, preços, estoque, imagem, telefone do vendedor
- **UI**: Seleção de variante (dropdown), input quantidade, cálculo total (preço × qtd), indicador disponibilidade (estoque > 0)
- **WhatsApp**: Botão "Comprar via WhatsApp" abre `wa.me/:phone?text=...` com mensagem pré-formatada contendo link
- **Tracking**: Se `track` token presente, PUT `/client-flow/track/:token` ao carregar → RN-003 (ENVIADO→NEGOCIANDO)
- **Responsivo**: Layout mobile-first, touch targets adequados

### 9. Progressive Web App (PWA)
- **Instalação**: Banner em dispositivos mobile (2s após carregar)
- **iOS**: Instrução "Compartilhar → Adicionar à Tela de Início" (Safari)
- **Android**: Botão "Instalar" via evento `beforeinstallprompt` (Chrome)
- **Cache**: Service worker com cache-first para assets estáticos e network-first para HTML. Requisições `/api/*` nunca são cacheadas
- **Independência**: Roda em janela própria (`display: standalone`)
- **Persistência**: Banner dispensado fica oculto por 7 dias
- **Elastic scroll desabilitado**: `overscroll-behavior: none` para evitar efeito de esticar em mobile/PWA
- **Zoom de input**: `font-size: 16px !important` + `maximum-scale=1.0` + reflow ao fechar teclado para evitar zoom automático do iOS

---

## Regras de Negócio

| Regra | Descrição |
|-------|-----------|
| Estoque não negativo | Saídas bloqueadas se estoque < quantidade |
| Estoque crítico | Alerta visual quando ≤ 5 unidades |
| Movimentação IN automática | Criar produto com estoque > 0 registra entrada no histórico |
| Atualização de estoque | Toda movimentação IN/OUT atualiza o saldo da variante |
| Variante default | Se nenhuma variante for cadastrada, cria "Padrão" |
| Email único | Não permite cadastro com email já existente |
| Upload imagens | Apenas JPG, PNG, GIF, WebP, SVG; máximo 10MB |
| Compartilhamento | Link público não requer autenticação |
| Exclusão em cascata | Deletar produto remove todas as variantes |
| RN-001 — Notas | Mover para "Notas" exige descrição da objeção + data de retorno futura |
| RN-002 — Retorno | Data de retorno não pode estar no passado |
| RN-003 — Tracking | Ao abrir link compartilhado, se status = ENVIADO, avança para NEGOCIANDO automaticamente |
| RN-004 — Lead existente | Busca lead por telefone no compartilhamento; se existe, reaproveita nome do cliente |
| Onboarding único | Tutorial exibido apenas uma vez por conta (flag `onboarding_done` no servidor) |
| Mock temporário | Dados criados para o tutorial são deletados ao finalizar/pular |

---

## Experiência Mobile

- **Viewport**: `viewport-fit=cover` + `env(safe-area-inset-*)` para iPhones com notch/Dynamic Island; `maximum-scale=1.0` no meta viewport para evitar zoom
- **Altura dinâmica**: Classe `h-dynamic` usa `100dvh` com fallback `-webkit-fill-available` (evita corte na toolbar Safari iOS)
- **Nav fixa**: Barra inferior fixa (`fixed bottom-0`) com `pb-safe` (padding-bottom: env(safe-area-inset-bottom))
- **Zoom de input**: `font-size: 16px !important` em inputs/selects/textarea + listener `resize` faz `window.scrollTo(0, window.scrollY)` 400ms após resize (App.tsx:73-81) para resetar zoom iOS
- **Elastic scroll**: `overscroll-behavior: none` no html/body desabilita pull-to-refresh/overscroll em mobile e PWA
- **Touch targets**: Botões nav com `min-width: 56px` e `min-height: 44px` (acessibilidade WCAG)
- **Kanban mobile**: Botão "Avançar →" em cada card substitui drag & drop (HTML5 Drag API não funcional em touch)
- **Tema escuro**: Detecta `prefers-color-scheme` no mount; persiste em `localStorage.stockflow_dark`; aplica classe `dark` no `documentElement`
- **Reflow ao fechar teclado**: Hack de `scrollTo` + hidden input fallback garante viewport estável pós-teclado iOS

---

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 19 + TypeScript + Tailwind CSS 4 + Motion |
| Backend | Express.js + TypeScript + TypeORM |
| Banco | PostgreSQL (Supabase pooler :6543) |
| Storage | Supabase Storage (CDN para imagens, bucket `products`) |
| Auth | JWT próprio (jsonwebtoken, 7d, bcrypt cost 12) |
| PWA | Service Worker + Manifest JSON |
| Build | Vite + esbuild |
| Deploy | Vercel (Serverless Function + Static) |

---

## API Endpoints (Backend)

| Método | Rota | Auth | Descrição |
|--------|------|:----:|-----------|
| GET | `/health` | Não | Health check |
| POST | `/auth/register` | Não | Registra usuário → retorna JWT + user |
| POST | `/auth/login` | Não | Login → retorna JWT + user (inclui `onboardingDone`) |
| PATCH | `/auth/onboarding` | JWT | Marca `onboarding_done = true` |
| GET | `/products` | JWT | Lista produtos + variantes do usuário |
| POST | `/products` | JWT | Cria produto + variantes + movimento IN automático |
| PUT | `/products/:id` | JWT | Atualiza produto (recria variantes) |
| DELETE | `/products/:id` | JWT | Deleta produto + variantes + movimentos (cascata) |
| GET | `/products/:id/share` | Não | Produto público para compartilhamento |
| POST | `/upload` | JWT | Upload imagem única (multer, 10MB, JPG/PNG/GIF/WebP/SVG) |
| POST | `/upload/multiple` | JWT | Upload múltiplo (até 10) |
| POST | `/movements` | JWT | Registra movimento IN/OUT (valida estoque) |
| GET | `/movements` | JWT | Lista movimentos (últimos 50, com JOINs) |
| GET | `/dashboard` | JWT | Métricas agregadas + análise ABC (30 dias) |
| POST | `/client-flow` | JWT | Cria lead (gera `trackingToken` UUID) |
| GET | `/client-flow` | JWT | Lista leads do usuário |
| GET | `/client-flow/find-by-contact/:contact` | JWT | Busca lead por telefone (E.164) |
| PATCH | `/client-flow/:id/status` | JWT | Atualiza status + observação + data retorno |
| PUT | `/client-flow/track/:token` | Não | Tracking: se ENVIADO → NEGOCIANDO |

---

## Modelo de Dados (Entidades TypeORM)

### `users` (UserEntity)
| Coluna | Tipo | Detalhes |
|--------|------|----------|
| id | UUID | PK, gerado app |
| name | varchar(255) | |
| email | varchar(255) | UNIQUE |
| password_hash | varchar(255) | bcrypt |
| phone | varchar(20) | nullable, E.164 |
| onboarding_done | boolean | default false |
| created_at / updated_at | timestamptz | auto |

### `products` (ProductEntity)
| Coluna | Tipo | Detalhes |
|--------|------|----------|
| id | UUID | PK |
| user_id | UUID | FK → users.id |
| name | varchar(255) | |
| description | text | nullable |
| category | varchar(100) | |
| cost_price | decimal(10,2) | default 0 |
| sale_price | decimal(10,2) | default 0 |
| image_url | varchar(500) | nullable |
| created_at / updated_at | timestamptz | auto |

### `product_variants` (ProductVariantEntity)
| Coluna | Tipo | Detalhes |
|--------|------|----------|
| id | UUID | PK |
| product_id | UUID | FK → products.id (cascade delete) |
| size | varchar(50) | ex: "M", "Único" |
| color | varchar(50) | default "default" |
| stock | int | default 0 |
| price | decimal(10,2) | preço de venda da variante |
| image_url | varchar(500) | nullable |
| created_at / updated_at | timestamptz | auto |

### `movements` (MovementEntity)
| Coluna | Tipo | Detalhes |
|--------|------|----------|
| id | UUID | PK |
| user_id | UUID | FK → users.id |
| product_id | UUID | FK → products.id |
| variant_id | UUID | FK → product_variants.id |
| type | enum | 'IN' \| 'OUT' |
| quantity | int | > 0 |
| reason | varchar(255) | |
| created_at | timestamptz | auto |

### `client_flow` (ClientFlowEntity)
| Coluna | Tipo | Detalhes |
|--------|------|----------|
| id | UUID | PK |
| tracking_token | UUID | UNIQUE, gerado no create |
| product_id | UUID | FK → products.id |
| user_id | UUID | FK → users.id |
| client_name | varchar(255) | |
| client_contact | varchar(20) | E.164 |
| description | text | nullable |
| current_status | enum | ENVIADO/NEGOCIANDO/NOTAS/FECHADO |
| next_follow_up_at | timestamptz | nullable (obrigatório se NOTAS) |
| updates | jsonb | Array de `{status, description, timestamp}` |
| created_at / updated_at | timestamptz | auto |

---

## Variáveis de Ambiente (Backend `estoque/.env`)

| Variável | Obrigatória | Descrição |
|----------|:---:|-----------|
| `PORT` | Não | Default 3333 |
| `NODE_ENV` | Não | `development` \| `production` (desliga `synchronize` TypeORM) |
| `DATABASE_URL` | Sim | PostgreSQL connection string (Supabase pooler :6543) |
| `JWT_SECRET` | Sim | Chave secreta JWT (mín. 32 chars) |
| `JWT_EXPIRES_IN` | Não | Default `7d` |
| `CORS_ORIGIN` | Não | Default `http://localhost:5173` |
| `SUPABASE_URL` | Sim | URL projeto Supabase |
| `SUPABASE_ANON_KEY` | Sim | Anon key Supabase |
| `SUPABASE_STORAGE_BUCKET` | Não | Default `products` |
