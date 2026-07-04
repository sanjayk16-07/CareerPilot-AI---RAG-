# Architecture

CareerPilot AI starts as a modular monorepo with separate frontend and backend applications. The initial foundation prioritizes clear boundaries, typed contracts, replaceable AI infrastructure, and simple local development.

## Frontend

- `src/app` contains app-level providers and routing.
- `src/components/ui` contains shadcn/ui-compatible primitives.
- `src/components/layout` contains app shell components.
- `src/features` is reserved for future feature modules.
- `src/lib` contains shared utilities and API clients.
- `src/types` contains frontend-wide TypeScript types.

## Backend

- `app/api/v1` contains versioned API routers.
- `app/core` contains configuration, database, and security infrastructure.
- `app/models` contains SQLAlchemy ORM models.
- `app/schemas` contains Pydantic request and response contracts.
- `app/services` contains external service adapters and business orchestration.

## Data

SQLite is configured for local development and early product validation. SQLAlchemy keeps the database layer portable for a future managed relational database.

## AI

Gemini, LangChain, and ChromaDB are represented as service adapters. Feature-specific chains, prompts, retrievers, and vector collections should live behind these adapters instead of leaking provider code into routers.

