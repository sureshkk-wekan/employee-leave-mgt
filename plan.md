# Implementation Plan: Employee Leave Management System

**Branch:** main | **Date:** 2026-03-02 | **Spec:** [spec.md](spec.md)  
**Input:** Feature specification (root-level spec)

---

## Summary

Web application for managing employee leave requests, approvals, and balances. Users authenticate by role (**Admin**, **Manager**, **Employee**). Backend exposes a REST API (FastAPI); frontend is a React SPA (Vite + Tailwind). Persistence is an in-memory store with JSON file (`backend/data.json`); no database. JWT for authentication; role-based access enforced at API and UI. Key behaviors: owner can cancel own pending request; end date ≥ start date; reject overlapping same leave type, allow across types; reject insufficient balance with clear message; unpaid/loss-of-pay leave types supported; rejection reason visible to owner; clear error and empty states in UI.

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

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Aligned with [.specify/memory/constitution.md](.specify/memory/constitution.md):

- **Roles:** Admin, Manager, Employee — enforced at API and UI.
- **Auth:** JWT; all leave/approval endpoints require authentication.
- **Persistence:** JSON store (no DB); policy as data (leave types in store).
- **Audit:** Log material actions (request created, approved, rejected, cancelled, balance adjusted) with actor and timestamp.
- **Stack:** React (Vite) + Tailwind; FastAPI + Pydantic; no class components; no manual styling.
- **Scope:** Leave requests, approvals, balances, basic policy configuration; no payroll, attendance, full HRIS.

---

## Business Rules (from spec)

- **Dates:** End date ≥ start date; reject with clear message otherwise. Past dates: implementation choice.
- **Overlap:** Reject if same employee + same leave type overlaps (pending or approved); allow overlap across different leave types.
- **Balance:** Reject if remaining balance < requested days; show clear message; never allow negative balance. Unpaid/loss-of-pay leave types do not require or consume balance.
- **Cancel:** Only request owner can cancel own pending request (e.g. PATCH status to cancelled); Manager/Admin only approve or reject.
- **Rejection reason:** Stored and visible to request owner (e.g. My Requests / detail).
- **Leave list (MVP):** No year filter; show all or current year only.
- **Errors/empty:** Validation errors, empty states, and API errors must surface clear user-facing messages; show loading state.

---

## Project Structure

### Documentation (repo root)

```text
.
├── spec.md                    # Application specification (roles, features, API, clarifications)
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
│   ├── store.py             # In-memory + JSON persistence (users, leave_types, leave_requests, leave_balances, audit_logs)
│   ├── routers/
│   │   ├── auth.py          # POST /login, GET /me
│   │   ├── users.py         # CRUD users (admin); GET by id (admin any, self read-only)
│   │   ├── leave_types.py   # CRUD leave types (admin), list (all)
│   │   ├── leave_requests.py # Create, list, get, approve/reject, cancel (owner pending only)
│   │   └── leave_balances.py # List balances (own; manager reportees; admin any)
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
│       ├── LeaveHistory.jsx  # My Requests; Cancel pending; show rejection reason
│       ├── Approvals.jsx     # Manager/Admin
│       └── Balances.jsx     # Own; Manager can view reportees
├── package.json
├── vite.config.js           # Proxy /api to backend
├── tailwind.config.js
└── .env.example             # VITE_API_URL
```

**Structure decision:** Monorepo with `backend/` and `frontend/`; backend uses a single JSON store (no DB process); frontend uses Vite proxy to backend in development.

---

## Complexity Tracking

No constitution violations. Single backend, single frontend, JSON persistence as per constitution (simplicity over scale).
