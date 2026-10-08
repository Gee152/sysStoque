# Documentação de Código — StockFlow

## Estrutura do Projeto

```
sysStoque/
├── api/                             # Vercel serverless entry point
│   └── index.ts                     # Strips /api prefix, loads bootstrap from estoque/dist
├── estoque/                         # Backend (Express + TypeORM + PostgreSQL)
│   ├── docker-compose.yml           # PostgreSQL 15 para dev local
│   ├── .env                         # DATABASE_URL, JWT_SECRET, SUPABASE_* configs
│   ├── package.json
│   └── src/
│       ├── index.ts
│       ├── delivery/
│       │   ├── cmd/bootstrap.ts     # Express setup, CORS, DB init
│       │   ├── controllers/
│       │   │   ├── AuthController.ts      # register, login, markOnboardingDone
│       │   │   ├── ProductController.ts
│       │   │   ├── MovementController.ts
│       │   │   ├── ClientFlowController.ts # create, list, track, findByContact, updateStatus
│       │   │   └── UploadController.ts
│       │   ├── middlewares/
│       │   │   ├── authMiddleware.ts # JWT verify, sets req.userId
│       │   │   └── errorHandler.ts
│       │   ├── response/
│       │   │   └── response.ts      # SuccessResponse — extractData por KEYS
│       │   ├── router/
│       │   │   └── router.ts        # Rotas + DI de repositórios
│       │   └── validators/          # Zod schemas (não usados no pipeline)
│       ├── domain/
│       │   ├── association/
│       │   │   ├── association.ts   # User, Product, ProductVariant, Movement, ClientFlow
│       │   │   └── error.ts
│       │   ├── repository/
│       │   │   ├── product.ts       # 9 interfaces segregadas
│       │   │   ├── movement.ts      # 3 interfaces
│       │   │   ├── user.ts          # 5 interfaces + UpdateUserOnboardingRepository
│       │   │   └── clientFlow.ts    # 6 interfaces
│       │   ├── ucio/
│       │   │   ├── Product.ts
│       │   │   ├── User.ts
│       │   │   ├── Movement.ts
│       │   │   ├── ProductVariant.ts
│       │   │   └── ClientFlow.ts    # Request/Response DTOs para todos os use cases
│       │   ├── usecase/
│       │   │   ├── CreateProduct.ts
│       │   │   ├── ListProducts.ts
│       │   │   ├── UpdateProduct.ts
│       │   │   ├── DeleteProduct.ts
│       │   │   ├── ShareProduct.ts
│       │   │   ├── RegisterMovement.ts
│       │   │   ├── ListMovements.ts
│       │   │   ├── GetDashboardData.ts
│       │   │   ├── CreateClientFlow.ts
│       │   │   ├── ListClientFlows.ts
│       │   │   ├── TrackClientFlow.ts
│       │   │   └── UpdateClientFlowStatus.ts
│       │   └── validate/
│       │       ├── common.ts
│       │       ├── product.ts
│       │       ├── movement.ts
│       │       └── clientFlow.ts    # Validação de lead/contato + regras de status
│       └── infra/
│           ├── auth/
│           │   ├── JwtService.ts
│           │   └── PasswordService.ts
│           ├── database/
│           │   ├── data-source.ts
│           │   ├── entities/
│           │   │   ├── UserEntity.ts           # + onboardingDone column
│           │   │   ├── ProductEntity.ts
│           │   │   ├── ProductVariantEntity.ts
│           │   │   ├── MovementEntity.ts
│           │   │   └── ClientFlowEntity.ts     # trackingToken, currentStatus (enum), nextFollowUpAt
│           │   ├── transforme/
│           │   │   ├── user.transformer.ts     # + onboardingDone mapping
│           │   │   ├── product.transformer.ts
│           │   │   ├── movement.transformer.ts
│           │   │   └── clientFlow.transformer.ts # Entity ↔ Association
│           │   ├── ProductRepositoryImpl.ts
│           │   ├── MovementRepositoryImpl.ts
│           │   ├── UserRepositoryImpl.ts        # + markOnboardingDone
│           │   └── ClientFlowRepositoryImpl.ts  # 6 métodos (CRUD + findByToken + findByContact)
│           └── storage/
│               └── SupabaseService.ts
└── frontend/                       # React + Vite + Tailwind
    ├── public/
    │   ├── manifest.json
    │   ├── sw.js                   # Service worker (cache strategies)
    │   └── icons/
    │       ├── icon-192.svg
    │       └── icon-512.svg
    ├── src/
    │   ├── main.tsx
    │   ├── App.tsx                 # Layout, nav, modo escuro, NotificationProvider + onboarding state
    │   ├── index.css               # Tailwind, utilities h-dynamic, pb-safe, overscroll-behavior
    │   ├── types.ts                # Product, Movement, ClientFlow, ClientFlowStatus, DashboardMetrics
    │   ├── services/
    │   │   └── api.ts              # Cliente HTTP + findClientFlowByContact, trackClientFlow, markOnboardingDone
    │   └── components/
    │       ├── AuthScreen.tsx
    │       ├── DashboardView.tsx
    │       ├── ProductsView.tsx
    │       ├── MovementsView.tsx
    │       ├── KanbanView.tsx      # Pipeline de vendas com 4 colunas, drag, modais
    │       ├── ShareLeadModal.tsx  # Compartilhar produto com lead tracking
    │       ├── Onboarding.tsx      # Tutorial interativo (45 passos)
    │       ├── SharedProductView.tsx
    │       ├── Notification.tsx
    │       └── PwaInstallBanner.tsx
    ├── vite.config.ts
    └── server.ts
```

---

## Backend — Arquitetura em Camadas (Clean Architecture)

### 1. Delivery (`src/delivery/`)

#### `cmd/bootstrap.ts`
Inicializa Express, CORS, JSON parser, inicializa TypeORM e sobe servidor na porta configurada (default `3333`).

#### Controllers (`controllers/`)

| Controller | Use Cases | Repositórios |
|---|---|---|
| `AuthController` | RegisterUser, AuthenticateUser, **markOnboardingDone** | CreateUserRepository, GetLoginUserRepository, **UpdateUserOnboardingRepository** |
| `ProductController` | Create, List, Update, Delete, Share | CreateProduct, CreateVariant, FindProductById, FindByUserId, UpdateProduct, DeleteProduct, DeleteVariants, FindUserById, CreateMovement |
| `MovementController` | Register, List, GetDashboardData | FindVariantById, UpdateVariantStock, CreateMovement, FindMovementsByUserId, GetDashboardData |
| **`ClientFlowController`** | **Create, List, Track, findByContact, UpdateStatus** | **CreateClientFlowRepository, FindClientFlowByTokenRepository, FindClientFlowByContactRepository, ListClientFlowsByUserIdRepository, UpdateClientFlowRepository** |
| `UploadController` | — (upload para Supabase Storage) | — |

#### Router (`router/router.ts`)
Define todas as rotas e instancia controllers com suas dependências.

| Método | Rota | Auth | Descrição |
|--------|------|:----:|-----------|
| GET | `/health` | Não | Health check |
| POST | `/auth/register` | Não | Registrar usuário (retorna JWT) |
| POST | `/auth/login` | Não | Login (retorna JWT) |
| PATCH | `/auth/onboarding` | JWT | Marcar onboarding como concluído |
| GET | `/products` | JWT | Listar produtos + variantes |
| POST | `/products` | JWT | Criar produto (com variantes + movimento IN) |
| PUT | `/products/:id` | JWT | Atualizar produto (recria variantes) |
| DELETE | `/products/:id` | JWT | Deletar produto |
| GET | `/products/:id/share` | Não | Produto público (compartilhável) |
| POST | `/upload` | JWT | Upload de imagem única |
| POST | `/upload/multiple` | JWT | Upload de múltiplas imagens |
| POST | `/movements` | JWT | Registrar movimentação |
| GET | `/movements` | JWT | Listar movimentações |
| GET | `/dashboard` | JWT | Dashboard com métricas |
| POST | `/client-flow` | JWT | Criar lead |
| GET | `/client-flow` | JWT | Listar leads do usuário |
| GET | `/client-flow/find-by-contact/:contact` | JWT | Buscar lead por telefone |
| PATCH | `/client-flow/:id/status` | JWT | Atualizar status do lead |
| PUT | `/client-flow/track/:token` | Não | Rastrear lead por token |

---

### 2. Domain (`src/domain/`)

#### Association (`association/`)

Classes de domínio: `UserAssociation`, `ProductAssociation`, `ProductVariantAssociation`, `MovementAssociation`, **`ClientFlowAssociation`** (id, trackingToken, productId, clientName, clientContact, userId, description, currentStatus, nextFollowUpAt, createdAt, updatedAt).

#### Repository (`repository/`)

**clientFlow.ts** (6 interfaces):
- `CreateClientFlowRepository` — cria novo fluxo
- `FindClientFlowByTokenRepository` — busca por token de rastreamento
- `FindClientFlowByIdRepository` — busca por ID
- `UpdateClientFlowRepository` — atualiza status/descrição/data de retorno
- `ListClientFlowsByUserIdRepository` — lista por usuário
- `FindClientFlowByContactRepository` — busca por contato

**user.ts** — inclui `UpdateUserOnboardingRepository` com método `markOnboardingDone(userID): Promise<void>`

#### Use Cases (`usecase/`)

| Use Case | Fluxo |
|---|---|
| **CreateProduct** | Valida → cria produto → cria variantes → registra movimento IN se stock > 0 |
| **ListProducts** | Busca por userId, retorna `{ products, variants }` |
| **UpdateProduct** | Valida → verifica ownership → atualiza → deleta/recria variantes |
| **DeleteProduct** | Valida → deleta variantes → deleta produto |
| **RegisterMovement** | Valida → verifica variante → verifica estoque (OUT) → cria movimento → atualiza stock |
| **ListMovements** | Lista com JOINs (productName, variantSize, variantColor) |
| **GetDashboardData** | Métricas agregadas + análise ABC |
| **CreateClientFlow** | Valida dados (nome, contato E.164, productId) → gera trackingToken UUID → persiste |
| **ListClientFlows** | Lista fluxos por userId |
| **TrackClientFlow** | Busca por token; se status = ENVIADO, avança para NEGOCIANDO |
| **UpdateClientFlowStatus** | Valida status; se for NOTAS, exige description + nextFollowUpAt futura |

#### Validate (`validate/clientFlow.ts`)
- `CreateClientFlowValidate` — nome, contato E.164, productId, userId
- `UpdateClientFlowStatusValidate` — status válido; NOTAS requer description + nextFollowUpAt futura

---

### 3. Infrastructure (`src/infra/`)

#### Entities
- `ClientFlowEntity` — tabela `client_flow`: id (UUID), trackingToken (único), productId, clientName, clientContact, description, currentStatus (enum: ENVIADO/NEGOCIANDO/FECHADO/NOTAS), nextFollowUpAt, userId, createdAt, updatedAt
- `UserEntity` — coluna `onboarding_done` (boolean, default false)

#### Repositories
- `ClientFlowRepositoryImpl.ts` — implementa 6 interfaces (TypeORM)
- `UserRepositoryImpl.ts` — método `markOnboardingDone`

#### Transformers
- `clientFlow.transformer.ts` — `toClientFlowDomain` / `toClientFlowEntity`
- `user.transformer.ts` — mapeia `onboardingDone`

---

## Frontend

### Layout Responsivo (Mobile + PWA)

| Contexto | Layout |
|---|---|
| Mobile (< 1024px) | Container `h-dynamic` com scroll, nav `fixed bottom-0` com `pb-safe` |
| Desktop (≥ 1024px) | Sidebar fixa 64px + main content scrollável |
| PWA Standalone | Mesmo layout mobile; overscroll-behavior none; font-size 16px inputs |

### Tipos (`types.ts`)

```typescript
interface ClientFlow {
  id: string
  trackingToken: string
  productId: string
  productName?: string
  clientName: string
  clientContact: string
  description?: string
  currentStatus: ClientFlowStatus
  nextFollowUpAt?: string
  userId: string
  createdAt: string
  updatedAt: string
}

type ClientFlowStatus = 'ENVIADO' | 'NEGOCIANDO' | 'NOTAS' | 'FECHADO'
```

### Serviço API (`services/api.ts`)

Funções adicionais para ClientFlow:
- `createClientFlow(data)` — POST `/client-flow`
- `listClientFlows()` — GET `/client-flow`
- `findClientFlowByContact(contact)` — GET `/client-flow/find-by-contact/:contact`
- `updateClientFlowStatus(id, data)` — PATCH `/client-flow/:id/status`
- `trackClientFlow(token)` — PUT `/client-flow/track/:token`

Funções de onboarding:
- `markOnboardingDone()` — PATCH `/auth/onboarding`

### Componentes

| Componente | Descrição |
|---|---|
| `App.tsx` | Raiz com `<NotificationProvider>`, navegação por abas, estado global (auth, products, movements, **clientFlows**, dark mode, **onboarding**), renderiza KanbanView e gerencia visibilidade do Onboarding |
| `AuthScreen.tsx` | Login/Registro com toggle; inputs `text-[16px]` para evitar zoom iOS |
| `DashboardView.tsx` | KPIs, gráficos, movimentações recentes |
| `ProductsView.tsx` | CRUD de produtos com variantes, share button (abre `ShareLeadModal`), movimentação rápida IN/OUT |
| `MovementsView.tsx` | Lista de movimentações, filtro IN/OUT/ALL, modal de registro com motivos predefinidos |
| **`KanbanView.tsx`** | Pipeline visual com 4 colunas (Enviado/Negociando/Notas/Fechado), drag & drop, modal de criação de lead, modal de movimento (com observação + data de retorno), modal de edição (lápis), atualização otimista com rollback |
| **`ShareLeadModal.tsx`** | Modal de compartilhamento: input de telefone com formatação, busca automática de lead existente (preenche nome), criação de lead via API, cópia automática do link trackeado, botões copiar/WhatsApp |
| **`Onboarding.tsx`** | Tutorial guiado (45 passos) com spotlight + blur cutout, auto-navegação entre abas, abertura/fechamento automático de modais, dados mockados (cria/deleta), polling de estabilidade de elemento, scroll lock |
| `SharedProductView.tsx` | Página pública (sem auth): seleção de variante, quantidade, total, botão WhatsApp, tracking automático de lead |
| `Notification.tsx` | Provider + hook + componente de toast animado (success/error/warning/info) |
| `PwaInstallBanner.tsx` | Banner de instalação PWA (2s delay, re-aparece 7 dias, fallback iOS) |

### KanbanView — Detalhes

**Fluxo de operação**:
1. **Criar lead**: Modal com select de produto (dropdown), nome do cliente, contato WhatsApp, observação opcional → POST `/client-flow`
2. **Mover card**: Drag & drop (desktop) ou botão "Avançar →" (mobile/touch) → modal de movimento com observação (obrigatório para "Notas" + data de retorno futura) → PATCH `/client-flow/:id/status`
3. **Editar card**: Ícone lápis → modal edita observação e data de retorno → PATCH `/client-flow/:id/status` (mantém mesmo status)
4. **Atualização otimista**: Estado local atualiza imediatamente; rollback em caso de falha na API

### Onboarding — Detalhes

**Gatilho**: Exibido quando `user.onboardingDone === false` (verificado no servidor via GET `/auth/login`).

**Cobertura** (45 passos):
1. Boas-vindas (card central)
2-4. Navegação (abas: Produtos, Movimentações, Vendas, Dashboard)
5-13. Cadastro de produto (nome, categoria, variante, imagem, preço, estoque, submit)
14-23. Movimentações (seleção de produto/variante, tipo, quantidade, motivo, submit)
24-31. Vendas/Kanban (lead: produto, nome, contato, descrição, submit, navegação nas colunas)
32-36. Dashboard (visão geral: cards, estoque crítico, fluxo, categorias, atividades)
37-39. Modo escuro
40-45. Conclusão

**Mecanismo**: 
- Usa `targetId` para identificar elementos DOM
- Polling de posição do elemento (30 tentativas, 300ms intervalo)
- `scrollIntoView({ behavior: 'smooth', block: 'center' })`
- Auto-clique em elementos (ex: "Adicionar Variante")
- Spotlight com `box-shadow` enorme + `clip-path: circle()` cutout
- Cria dados mockados (produto + variantes) ao entrar no tutorial; deleta ao finalizar ou pular

### Service Worker (`sw.js`)

| Tipo de requisição | Estratégia |
|---|---|
| `/api/*` | Não cacheia — sempre rede |
| Assets com hash (`*.js`, `*.css`, `*.svg`) | Cache-first com atualização em segundo plano |
| Demais (`/`, `/index.html`) | Network-first com fallback para cache |

Cache versionado (`stockflow-v2`).

---

## Fluxo de Dados

```
Usuário → Componente React → api.ts (fetch) → Vercel /api/*
                                                    ├─ api/index.ts (serverless)
                                                    ├─ delivery/ (roteamento Express)
                                                    ├─ domain/ (validação + regras)
                                                    └─ infra/ (TypeORM → Supabase PostgreSQL)
                                                           └─ Supabase Storage (imagens)
```

**Desenvolvimento:** Frontend `:5173` (Vite) → proxy `/api` → backend `:3333` (Express)
**Produção:** Frontend buildado (Vite output) + Serverless Function Vercel

---

## Variáveis de Ambiente

### Backend (`estoque/.env`)

| Variável | Default | Descrição |
|---|---|---|
| `PORT` | 3333 | Porta do servidor |
| `NODE_ENV` | development | production desliga TypeORM synchronize |
| `DATABASE_URL` | — | Connection string PostgreSQL (Supabase pooler :6543) |
| `JWT_SECRET` | — | Chave secreta JWT |
| `JWT_EXPIRES_IN` | 7d | Tempo de expiração do token |
| `CORS_ORIGIN` | http://localhost:5173 | Origens permitidas CORS |
| `SUPABASE_URL` | — | URL do projeto Supabase |
| `SUPABASE_ANON_KEY` | — | Anon key do Supabase |
| `SUPABASE_STORAGE_BUCKET` | products | Nome do bucket para uploads |

### Frontend
Nenhum `.env` — usa proxy Vite em dev, Vercel em produção.

---

## Deploy (Vercel)

`vercel.json`:
| Config | Valor |
|---|---|
| buildCommand | `cd estoque && npx tsc && cd ../frontend && npm run build` |
| outputDirectory | `frontend/dist` |
| installCommand | `cd api && npm install && cd ../estoque && npm install && cd ../frontend && npm install` |
| Rewrites | `/api/(.*)` → serverless function; `/(.*)` → `index.html` |

---

## Regras de Negócio no Código

| Regra | Localização |
|---|---|
| Estoque não negativo | `RegisterMovement.ts` — verifica `variant.stock >= quantity` |
| Movimentação IN automática | `CreateProduct.ts` — itera variantes com stock > 0 e chama `RegisterMovement` |
| RN-001 — Notas exige data | `UpdateClientFlowStatus.ts` — se status = NOTAS, valida description e nextFollowUpAt futura |
| RN-002 — Retorno futuro | `clientFlow.ts` validate — `nextFollowUpAt > new Date()` |
| RN-003 — Tracking auto-avança | `TrackClientFlow.ts` — se status = ENVIADO, muda para NEGOCIANDO |
| RN-004 — Lead existente | `ClientFlowController.findByContact` — busca lead por telefone |
| Onboarding único | `AuthController.markOnboardingDone` → `UserRepositoryImpl.markOnboardingDone` |
