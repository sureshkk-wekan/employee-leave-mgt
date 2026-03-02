# Implementation Plan: Employee Leave Management System

**Date:** 2026-03-02 | **Spec:** [spec.md](spec.md)  
**Status:** To implement

---

## Summary

Web application for managing employee leave requests, approvals, and balances. Users authenticate by role (**Admin**, **Manager**, **Employee**). Backend exposes a REST API (FastAPI); frontend is a React SPA (Vite + Tailwind). Persistence is an in-memory store with JSON file (`backend/data.json`); no database. JWT used for authentication; role-based access enforced at API and UI.

---

## Technical Context

| Item | Choice |
|------|--------|
| **Language/Version** | Python 3.10+, JavaScript (React 18) |
| **Backend** | FastAPI, Pydantic v2, python-jose (JWT), passlib (bcrypt) |
| **Frontend** | React 18, Vite, Tailwind CSS, React Router |
| **Storage** | In-memory + JSON file (`backend/data.json`); no database |
| **Testing** | (Optional) pytest (backend), Vitest/React Testing Library (frontend) |
| **Target Platform** | Web (browser); backend runs on Linux/Windows/macOS |
| **Project Type** | Web application (frontend + backend) |
| **Constraints** | No Redux; functional components and hooks only; Tailwind for styling |

---

## Roles (from spec)

- **Admin:** Full access — users CRUD, leave types CRUD, approve any request, view any balance.
- **Manager:** Approve reportees’ requests; view own + reportees’ requests; view own balance.
- **Employee:** Submit requests; view own requests; view own balance.

Auth: JWT; all leave/approval endpoints require authentication. Persistence: JSON store; leave types as data.

---

## Project Structure

### Documentation

```text
.
├── spec.md                    # Application specification (roles, features, API)
├── plan.md                    # This file
├── tasks.md                   # Task list / implementation checklist
├── speckit-specify-prompt.md  # Prompt for /speckit.specify
└── README.md                  # Quick start and project overview
```

### Source Code (to create)

```text
backend/
├── app/
│   ├── main.py              # FastAPI app, CORS, router includes
│   ├── config.py            # Settings (env, secret, data_file)
│   ├── auth.py              # JWT create/verify, get_current_user, require_roles
│   ├── models.py            # Enums: Role, LeaveRequestStatus
│   ├── store.py             # In-memory + JSON persistence (users, leave_types, etc.)
│   ├── routers/
│   │   ├── auth.py          # POST /login, GET /me
│   │   ├── users.py         # CRUD users (admin only)
│   │   ├── leave_types.py   # CRUD leave types (admin), list (all)
│   │   ├── leave_requests.py # Create, list, get, approve/reject
│   │   └── leave_balances.py# List balances
│   └── schemas/             # Pydantic request/response models
├── scripts/
│   └── seed_db.py           # Seed users, leave types, initial balances
├── requirements.txt
├── .env.example
└── data.json                # (Generated) JSON store

frontend/
├── src/
│   ├── main.jsx
│   ├── App.jsx              # Routes, ProtectedRoute, role-based nav
│   ├── index.css            # Tailwind
│   ├── context/
│   │   └── AuthContext.jsx  # Auth state, login, logout, api()
│   ├── components/
│   │   └── Layout.jsx       # Header, nav by role, outlet
│   └── pages/
│       ├── Login.jsx
│       ├── Dashboard.jsx
│       ├── LeaveRequest.jsx
│       ├── LeaveHistory.jsx
│       ├── Approvals.jsx    # Manager/Admin
│       └── Balances.jsx
├── package.json
├── vite.config.js           # Proxy /api to backend
├── tailwind.config.js
└── .env.example             # VITE_API_URL
```

**Structure decision:** Monorepo with `backend/` and `frontend/`; backend uses a single JSON store (no DB process); frontend uses Vite proxy to backend in development.
