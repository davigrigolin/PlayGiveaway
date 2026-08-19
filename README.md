# Giveaway

Plataforma full-stack para criação e gerenciamento de sorteios (giveaways/raffles). Organizadores criam sorteios, compartilham um link público e acompanham as inscrições em tempo real; visitantes se inscrevem sem precisar de conta.

## Stack

**Backend**

- TypeScript
- Node.js
- Express
- Prisma ORM + PostgreSQL
- JWT (`jsonwebtoken`) para autenticação
- `bcryptjs` para hash de senha
- `zod` para validação de dados
- `helmet`, `cors`, `dotenv`

**Frontend**

- TypeScript
- React
- Vite
- React Router

## Funcionalidades

### Autenticação

- Cadastro de usuário com validação de nome, email e senha
- Hash de senha com bcrypt
- Login com geração de token JWT (`sub` = id do usuário)
- Middleware `ensureAuthenticated` protegendo rotas privadas

### Sorteios

- Criação, listagem e exclusão de sorteios
- Detalhamento privado do sorteio (dono)
- Fechamento de inscrições
- Sorteio de vencedores, com suporte a múltiplos ganhadores por sorteio
- Quantidade de ganhadores configurável (padrão: 1), validada para não ultrapassar o número de participantes
- Histórico de vencedores mantido no registro do sorteio
- Slug único gerado a partir do título + código aleatório
- Controle de status: `OPEN`, `CLOSED`, `DRAWN`

### Participantes

- Inscrição pública via slug (sem autenticação)
- Inscrição autenticada em sorteio interno
- Listagem de participantes por sorteio
- Bloqueio de email duplicado no mesmo sorteio

### Frontend

- Login e cadastro com validação de formulário
- Token JWT persistido em `localStorage`
- Dashboard com lista de sorteios do usuário
- Página de detalhes do sorteio (status, participantes, link público, ações de fechar/sortear, definição da quantidade de ganhadores)
- Página pública de participação (`/sorteio/:slug`), com exibição dos vencedores após o sorteio
- Rotas protegidas via `ProtectedRoute`

## Estrutura do projeto

```
sophi/
└── giveaway/
    ├── backend/
    │   ├── prisma/
    │   │   └── schema.prisma
    │   └── src/
    │       ├── controllers/
    │       ├── services/
    │       ├── routes.ts
    │       └── server.ts
    └── frontend/
        └── src/
            ├── pages/
            └── App.tsx
```

## Modelo de dados

**User**
| Campo | Tipo |
|---|---|
| id | string |
| name | string |
| email | string (único) |
| password_hash | string |
| created_at | datetime |

**Raffle**
| Campo | Tipo |
|---|---|
| id | string |
| user_id | string |
| title | string |
| description | string |
| slug | string (único) |
| status | OPEN \| CLOSED \| DRAWN |
| winner_id | string |
| created_at | datetime |

**Participant**
| Campo | Tipo |
|---|---|
| id | string |
| raffle_id | string |
| name | string |
| email | string |

Chave única composta: `(raffle_id, email)`

**Relacionamentos:** um usuário possui vários sorteios; um sorteio possui vários participantes.

## Rotas da API

### Autenticação

| Método | Rota        | Acesso  |
| ------ | ----------- | ------- |
| POST   | `/users`    | público |
| POST   | `/sessions` | público |

### Sorteios

| Método | Rota                   | Acesso    |
| ------ | ---------------------- | --------- |
| POST   | `/raffles`             | protegido |
| GET    | `/raffles`             | protegido |
| GET    | `/raffles/:id/details` | protegido |
| PATCH  | `/raffles/:id/draw`    | protegido |
| PATCH  | `/raffles/:id/close`   | protegido |
| DELETE | `/raffles/:id`         | protegido |

### Participantes

| Método | Rota                               | Acesso    |
| ------ | ---------------------------------- | --------- |
| POST   | `/api/giveaways/:slug/participate` | público   |
| POST   | `/raffles/:raffle_id/participants` | protegido |
| GET    | `/raffles/:id/participants`        | protegido |

Rotas protegidas exigem header `Authorization: Bearer <token>`.

## Rotas do frontend

| Rota                     | Descrição                                          |
| ------------------------ | -------------------------------------------------- |
| `/`                      | redireciona para `/dashboard` (logado) ou `/login` |
| `/login`                 | autenticação                                       |
| `/cadastro`              | criação de conta                                   |
| `/dashboard`             | lista de sorteios (protegido)                      |
| `/dashboard/sorteio/:id` | detalhes e gestão do sorteio (protegido)           |
| `/sorteio/:slug`         | página pública de participação                     |

## Como rodar o projeto

### Pré-requisitos

- Node.js
- PostgreSQL

### Backend

```bash
cd backend
npm install
```

Crie um arquivo `.env` com:

```
DATABASE_URL="postgresql://usuario:senha@localhost:5432/sophi_giveaway"
JWT_SECRET="sua_chave_secreta"
```

```bash
npx prisma migrate dev
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Roadmap

- Redesenho do frontend
- Verificação real de email dos participantes
- Autenticação em duas etapas (2FA)

## Licença

Projeto pessoal
