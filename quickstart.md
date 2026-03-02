# Quickstart: Employee Leave Management System

**Spec:** [spec.md](spec.md) | **Plan:** [plan.md](plan.md)

---

## Prerequisites

- Python 3.10+
- Node 18+ and npm (or pnpm/yarn)
- (Optional) Git

---

## 1. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env         # Set SECRET_KEY, optional DATA_FILE
python -m scripts.seed_db    # Creates data.json, demo users and leave types
uvicorn app.main:app --reload --port 8000
```

Backend: http://127.0.0.1:8000  
API docs: http://127.0.0.1:8000/docs

---

## 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env         # VITE_API_URL=http://127.0.0.1:8000 or /api if using proxy
npm run dev
```

Frontend: http://localhost:5173 (or per Vite)

---

## 3. Demo logins

| Role     | Email                | Password  |
|----------|----------------------|-----------|
| Admin    | admin@example.com    | admin123  |
| Manager  | manager@example.com  | admin123  |
| Employee | employee@example.com | admin123  |

---

## 4. Verify

1. Log in as **employee** → Request Leave, My Requests, My Balances.
2. Log in as **manager** → Approvals (reportees’ pending), view reportees’ balances.
3. Log in as **admin** → User management, Leave types, Approve any request, view any balance.

---

## Config

- **Backend:** `.env` — `SECRET_KEY` (required), `DATA_FILE` (optional, default `data.json`).
- **Frontend:** `.env` — `VITE_API_URL` (e.g. `http://127.0.0.1:8000` or `/api` with Vite proxy).
