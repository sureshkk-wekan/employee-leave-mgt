# Employee Leave Management System

Web app for leave requests, approvals, and balances. **Admin**, **Manager**, and **Employee** roles with JWT auth; REST API (FastAPI) and React SPA (Vite + Tailwind).

---

## Quick start

**Prerequisites:** Python 3.10+, Node 18+ (npm/pnpm/yarn).

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # set SECRET_KEY (required)
python -m scripts.seed_db   # creates data.json and demo users
uvicorn app.main:app --reload --port 8000
```

- API: http://127.0.0.1:8000  
- Docs: http://127.0.0.1:8000/api/docs  

### Frontend

```bash
cd frontend
npm install
cp .env.example .env        # VITE_API_URL=/api (proxy) or http://127.0.0.1:8000
npm run dev
```

- App: http://localhost:5173  

Vite proxies `/api` to the backend when `VITE_API_URL=/api` (default in `.env.example`).

---

## Demo logins

| Role     | Email                 | Password  |
|----------|-----------------------|-----------|
| Admin    | admin@example.com     | admin123  |
| Manager  | manager@example.com   | admin123  |
| Employee | employee@example.com  | admin123  |

---

## Tech stack

| Layer    | Stack |
|----------|--------|
| Backend  | Python 3.10+, FastAPI, Pydantic v2, python-jose (JWT), passlib (bcrypt) |
| Frontend | React 18, Vite, Tailwind CSS, React Router |
| Storage  | In-memory + JSON file (`backend/data.json`); no database |

---

## Project layout

```
├── spec.md                 # Application spec (roles, API, rules)
├── plan.md                 # Implementation plan
├── tasks.md                # Task checklist
├── data-model.md           # Entity and field reference
├── quickstart.md           # Detailed quick start and config
├── contracts/              # API contracts (e.g. api-endpoints.md)
├── backend/
│   ├── app/                # FastAPI app, auth, store, routers, schemas
│   ├── scripts/seed_db.py  # Seed users, leave types, balances
│   ├── requirements.txt
│   ├── .env.example
│   └── data.json           # (generated) JSON store
└── frontend/
    ├── src/                # React app (AuthContext, Layout, pages)
    ├── package.json
    ├── vite.config.js      # /api proxy to backend
    └── .env.example
```

---

## Config

- **Backend** (`.env`): `SECRET_KEY` (required), `DATA_FILE` (optional, default `data.json`), `ACCESS_TOKEN_EXPIRE_MINUTES` (optional).
- **Frontend** (`.env`): `VITE_API_URL` — use `/api` for Vite proxy to backend, or full URL (e.g. `http://127.0.0.1:8000`) when backend is elsewhere.

---

## Docs

- [spec.md](spec.md) — Features, roles, API, business rules  
- [plan.md](plan.md) — Technical plan and structure  
- [quickstart.md](quickstart.md) — Step-by-step run and verify  
- [data-model.md](data-model.md) — Data entities and fields  
- [contracts/api-endpoints.md](contracts/api-endpoints.md) — API endpoint reference  
