# Desafio Stoix - Sistema de Gerenciamento de Tarefas

Sistema simples de gerenciamento de tarefas, com backend em Node.js/TypeScript e frontend em React/TypeScript.

## Arquitetura

```
desafio-stoix/
├── apps/
│   ├── backend/          # API RESTful em Node.js + Express + TypeScript
│   │   ├── src/          # Código fonte
│   │   ├── prisma/       # Schema e migrations do banco
│   │   ├── Dockerfile    # Container de produção do backend
│   │   └── package.json
│   └── frontend/         # Interface em React + Vite + TypeScript
│       ├── src/
│       └── package.json
├── docker-compose.yml    # Orquestração backend + PostgreSQL
├── package.json          # Scripts do workspace raiz
└── README.md
```

## Tecnologias

### Backend

- **Node.js** com TypeScript
- **Express** - Framework web
- **Prisma ORM** - Gerenciamento de banco de dados
- **PostgreSQL** - Banco de dados relacional
- **CSRF Protection** - Segurança contra ataques CSRF
- **CORS** - Configuração de origens permitidas

### Frontend

- **React** com TypeScript
- **Vite** - Build tool e dev server
- **TailwindCSS** - Estilização
- **Fetch API** - Comunicação com backend

## Pré-requisitos

Escolha uma das opções abaixo:

### Desenvolvimento Local

- Node.js 18 ou superior
- npm 9 ou superior
- PostgreSQL 14 ou superior

## Configuração

### 1. Clone o repositório

```bash
git clone <repository-url>
cd desafio-stoix
```

### 2. Configure as variáveis de ambiente

Copie o arquivo de exemplo e ajuste conforme necessário:

```bash
cp .env.example .env
```

**Variáveis disponíveis:**

```env
# Backend
PORT=4000

# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=tasks
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tasks

# CORS/Frontend
FRONTEND_ORIGIN=http://localhost:5173
```

## Desenvolvimento Local

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar banco de dados

Certifique-se de ter o PostgreSQL rodando localmente ou via Docker:

### 3. Executar migrations

```bash
cd apps/backend
npx prisma migrate deploy
# ou para desenvolvimento com histórico
npx prisma migrate dev
```

### 4. Iniciar aplicações

**Backend:**

```bash
npm run dev:backend
# Servidor rodando em http://localhost:4000
```

**Frontend:**

```bash
npm run dev:frontend
# Interface rodando em http://localhost:5173
```

## Build para Produção

### Backend

```bash
npm run build:backend
# Arquivos compilados em apps/backend/dist/
```

### Frontend

```bash
npm run build:frontend
# Arquivos estáticos em apps/frontend/dist/
```

## API Endpoints

### Autenticação CSRF

```http
GET /csrf-token
```

Retorna um token CSRF que deve ser incluído no header `x-csrf-token` para operações de mutação.

**Resposta:**

```json
{
  "csrfToken": "token-aqui",
  "header": "x-csrf-token"
}
```

### Tarefas

#### Listar todas as tarefas

```http
GET /api/tasks
```

**Resposta:**

```json
[
  {
    "id": 1,
    "title": "Título da tarefa",
    "description": "Descrição detalhada",
    "completed": false,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

#### Buscar tarefa por ID

```http
GET /api/tasks/:id
```

#### Criar nova tarefa

```http
POST /api/tasks
Content-Type: application/json
x-csrf-token: <token>

{
  "title": "Nova tarefa",
  "description": "Descrição opcional"
}
```

#### Atualizar tarefa

```http
PUT /api/tasks/:id
Content-Type: application/json
x-csrf-token: <token>

{
  "title": "Título atualizado",
  "description": "Nova descrição",
  "completed": true
}
```

#### Deletar tarefa

```http
DELETE /api/tasks/:id
x-csrf-token: <token>
```

## Schema do Banco de Dados

```prisma
model Task {
  id          Int      @id @default(autoincrement())
  title       String
  description String   @default("")
  completed   Boolean  @default(false)
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
}
```

## Scripts Disponíveis

### Workspace raiz

```bash
npm run dev:backend          # Inicia backend em modo desenvolvimento
npm run dev:frontend         # Inicia frontend em modo desenvolvimento
npm run build:backend        # Build do backend
npm run build:frontend       # Build do frontend
```

### Backend (apps/backend)

```bash
npm run dev                  # Desenvolvimento com hot-reload
npm run build                # Compilar TypeScript
npm run start                # Iniciar versão compilada
npm run prisma:generate      # Gerar Prisma Client
npm run prisma:migrate       # Executar migrations
```

### Frontend (apps/frontend)

```bash
npm run dev                  # Servidor de desenvolvimento
npm run build                # Build para produção
npm run preview              # Preview do build
```

## Licença

Este projeto foi desenvolvido como parte do Desafio Stoix.
