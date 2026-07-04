# CareerPilot AI

CareerPilot AI is a production-ready AI SaaS platform foundation for career guidance workflows. This repository intentionally contains architecture, configuration, and runnable scaffolding only. Product features will be built on top of this base.

## Monorepo Structure

```text
careerpilot-ai/
  frontend/   React 19, Vite, TypeScript, Tailwind CSS, shadcn/ui-ready
  backend/    FastAPI, SQLAlchemy, Pydantic, JWT, LangChain, ChromaDB-ready
  docs/       Architecture and engineering notes
```

## Prerequisites

- Node.js 22+
- npm 10+
- Python 3.11+

## Environment Setup

Create local env files from the examples:

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

Set `GEMINI_API_KEY` before using AI services.

## Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`.

## Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

On Windows PowerShell:

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API runs at `http://localhost:8000`, with OpenAPI docs at `http://localhost:8000/docs`.

## Root Scripts

```bash
npm run dev
npm run build
npm run typecheck
npm run lint
npm run backend:dev
```

## Current Scope

Included:

- Monorepo layout
- Vite React TypeScript application shell
- Tailwind CSS and shadcn/ui-compatible aliases
- FastAPI application factory and API router structure
- SQLAlchemy database setup for SQLite
- Pydantic settings
- JWT utilities
- LangChain and ChromaDB service placeholders
- Environment templates
- Documentation baseline

Not included yet:

- User-facing SaaS features
- Authentication flows
- Billing
- AI product workflows
- Production deployment manifests

## Engineering Principles

- Keep feature code isolated by domain.
- Keep shared infrastructure in `core`.
- Keep API boundaries versioned under `/api/v1`.
- Prefer typed contracts on both frontend and backend.
- Treat AI providers and vector stores as replaceable service adapters.

