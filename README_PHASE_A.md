# PocketJob — Phase A: Backend Scaffold

This is a minimal backend starter with **Node.js + TypeScript + Express + Prisma (Postgres)** and Docker for the DB.

## Prereqs
- Node.js 18+
- Docker Desktop (running)

## 1) Start Postgres
```bash
docker compose up -d db
```

## 2) Configure env
```bash
cp .env.example .env
# edit values if needed (defaults work with Docker compose)
```

## 3) Install deps & generate client
```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run dev
```

Server runs on **http://localhost:4000**  
Health endpoint: **GET /health** → `{ "ok": true }`

## Common commands
```bash
# In backend/
npm run dev           # dev server (TS)
npm run build         # compile to JS
npm start             # run compiled build
npx prisma studio     # DB UI (optional)
```

## Notes
- Prisma schema matches the V1 data model subset for Applications, Listings, Companies, EmailThreads/Messages, Tags, Notes, ActivityLog, User, Organization.
- Row-Level Security will be enforced at the app layer first (org_id scoping), and later at DB-level when we add policies.
- Next phases will add auth, tokens, and more endpoints.