# Tasks: Employee Leave Management System

**Spec:** [spec.md](spec.md) | **Plan:** [plan.md](plan.md)  
**Status:** To implement

**Workflow:** After each phase, commit and push to GitHub, then continue. See [IMPLEMENT-WORKFLOW.md](IMPLEMENT-WORKFLOW.md).

---

## Format

- `[P]` = Can run in parallel (different files, no dependencies)
- `[Story]` = Feature area: Auth, Leave, Balances, Users
- Paths: `backend/`, `frontend/` per [plan.md](plan.md)

---

## Phase 1: Setup & Foundation

- [x] T001 Create project structure: `backend/`, `frontend/`, root config files
- [x] T002 Backend: Python venv, `requirements.txt`, FastAPI app in `backend/app/main.py`
- [x] T003 Frontend: Vite + React + Tailwind, `frontend/package.json`, `vite.config.js`
- [x] T004 [P] Backend config: `backend/app/config.py` (env, secret key, data file path)
- [x] T005 [P] Frontend env: `frontend/.env.example` with `VITE_API_URL`
- [x] T006 Store: `backend/app/store.py` — load/save JSON, users, leave_types, leave_requests, leave_balances, audit_logs
- [x] T007 Auth: `backend/app/auth.py` — JWT create/verify, `get_current_user`, `require_roles`
- [x] T008 [P] Models: `backend/app/models.py` — Enums Role, LeaveRequestStatus (pending, approved, rejected, cancelled)
- [x] T009 Seed: `backend/scripts/seed_db.py` — demo users (admin, manager, employee), leave types, initial balances

---

## Phase 2: Authentication (Auth)

**Goal:** Users can log in with email/password and receive a JWT; frontend stores token and sends it on API calls.

- [x] T010 [Auth] POST `/api/auth/login` — validate credentials, return JWT (`backend/app/routers/auth.py`)
- [x] T011 [Auth] GET `/api/auth/me` — return current user from JWT (`backend/app/routers/auth.py`)
- [x] T012 [Auth] Frontend: `AuthContext` — login, logout, `api()` helper, token in localStorage (`frontend/src/context/AuthContext.jsx`)
- [x] T013 [Auth] Frontend: Login page — form, redirect after login (`frontend/src/pages/Login.jsx`)
- [x] T014 [Auth] Frontend: Protected routes and role-based redirect (`frontend/src/App.jsx`)

---

## Phase 3: Leave Types (Admin)

**Goal:** Admin can create/update leave types; all authenticated users can list active leave types. Support unpaid/loss-of-pay (e.g. default_days_per_year = 0).

- [x] T015 [P] GET `/api/leave-types` — list (optional active_only) (`backend/app/routers/leave_types.py`)
- [x] T016 POST `/api/leave-types` — create (admin only)
- [x] T017 GET `/api/leave-types/{id}` — get one
- [x] T018 PATCH `/api/leave-types/{id}` — update (admin only)
- [x] T019 Frontend: Leave type dropdown in Request Leave page (uses `/api/leave-types`) (`frontend/src/pages/LeaveRequest.jsx`)

---

## Phase 4: Leave Requests (Leave)

**Goal:** Submit, list, get, approve/reject, cancel (owner pending only). Validate date (end ≥ start), overlap (same user+leave_type), balance (skip for unpaid); clear error messages; rejection reason visible to owner.

- [ ] T020 [Leave] POST `/api/leave-requests` — create; validate end_date ≥ start_date, no overlap same user+leave_type, sufficient balance (skip if leave type unpaid/zero entitlement); return clear error message on validation failure (`backend/app/routers/leave_requests.py`)
- [ ] T021 [Leave] GET `/api/leave-requests` — list (own or reportees for manager; any for admin); query status, my_only; MVP no year filter (`backend/app/routers/leave_requests.py`)
- [ ] T022 [Leave] GET `/api/leave-requests/{id}` — get one (owner or manager/admin) (`backend/app/routers/leave_requests.py`)
- [ ] T023 [Leave] POST `/api/leave-requests/{id}/approve` — approve/reject (manager/admin); body approved, rejection_reason (optional); store rejection_reason; update balance on approve (skip add_used_days for unpaid leave type) (`backend/app/routers/leave_requests.py`)
- [ ] T024 [Leave] Store: `get_or_create_balance`, `add_used_days` (skip for zero-entitlement type), audit log on approve/reject (`backend/app/store.py`)
- [ ] T025 [Leave] PATCH `/api/leave-requests/{id}` — cancel (owner only, pending only); set status cancelled; audit log; no balance change (`backend/app/routers/leave_requests.py`, `backend/app/store.py`)
- [ ] T026 [Leave] Frontend: Request Leave page — form, submit to POST `/api/leave-requests`; show validation errors (date, overlap, insufficient balance) (`frontend/src/pages/LeaveRequest.jsx`)
- [ ] T027 [Leave] Frontend: My Requests page — list, status, leave type name, **rejection reason when rejected**, **Cancel** for own pending requests (`frontend/src/pages/LeaveHistory.jsx`)
- [ ] T028 [Leave] Frontend: Approvals page — pending list, Approve/Reject with optional rejection reason (manager/admin) (`frontend/src/pages/Approvals.jsx`)

---

## Phase 5: Leave Balances (Balances)

**Goal:** Users view leave balances; Manager can view reportees’ balances (read-only); Admin any user.

- [ ] T029 [Balances] GET `/api/leave-balances` — list own; Manager may pass user_id for reportees only; Admin may pass user_id for any; optional year (`backend/app/routers/leave_balances.py`)
- [ ] T030 [Balances] Frontend: My Balances page — list with remaining_days, leave type name; Manager: allow viewing reportees’ balances (e.g. dropdown or list) (`frontend/src/pages/Balances.jsx`)
- [ ] T031 [Balances] Seed: create initial leave_balances for all users and leave types for current year (`backend/scripts/seed_db.py`)

---

## Phase 6: User Management (Users / Admin)

**Goal:** Admin CRUD users; Employee/Manager GET own user (read-only).

- [ ] T032 [Users] GET `/api/users` — list (admin only) (`backend/app/routers/users.py`)
- [ ] T033 [Users] POST `/api/users` — create (admin only; hash password) (`backend/app/routers/users.py`)
- [ ] T034 [Users] GET `/api/users/{id}` — get one (admin any; Employee/Manager own id only, read-only) (`backend/app/routers/users.py`)
- [ ] T035 [Users] PATCH `/api/users/{id}` — update (admin only) (`backend/app/routers/users.py`)
- [ ] T036 [Users] Store: `update_user`, `update_user_password` for demo password sync (`backend/app/store.py`)

---

## Phase 7: UI & Integration

- [ ] T037 Layout: Header, nav (Dashboard, Request Leave, My Requests, My Balances, Approvals for manager/admin), user name, Logout (`frontend/src/components/Layout.jsx`)
- [ ] T038 Dashboard: Welcome and links to main actions (`frontend/src/pages/Dashboard.jsx`)
- [ ] T039 Frontend: Error messages, empty states (e.g. “No pending requests”, “No leave requests yet”), loading indicators on Request Leave, My Requests, Approvals, Balances (`frontend/src/pages/*.jsx`)
- [ ] T040 Vite proxy: `/api` → backend (e.g. `http://127.0.0.1:8000`) (`frontend/vite.config.js`)
- [ ] T041 CORS: Backend allows frontend origin (`backend/app/main.py`)
- [ ] T042 Demo credentials: All roles use password `admin123`; seed creates admin@example.com, manager@example.com, employee@example.com

---

## Phase 8: Documentation & Repo

- [ ] T043 README: Quick start, tech stack, project layout, demo logins, config (`README.md`)
- [ ] T044 spec.md, plan.md, tasks.md, data-model.md, quickstart.md, contracts/ — maintained per workflow

---

## Optional / Future

- [ ] T045 Add unit tests: leave balance logic, date and overlap validation (`backend/tests/`)
- [ ] T046 Add API integration tests: login → request → approve → balance; cancel pending (`backend/tests/`)
- [ ] T047 Add frontend tests: Login, ProtectedRoute, key flows (`frontend/src/`)
- [ ] T048 Calendar or list view of approved leave for planning
- [ ] T049 Optional: Switch persistence to SQLite/PostgreSQL (schema in plan/spec)

---

## Dependencies & Order

- **Phase 1** must be done first (store, auth, models, seed).
- **Phase 2** (Auth) blocks all authenticated features.
- **Phases 3–6** can be understood in order Leave Types → Leave Requests → Balances → Users; implementation may overlap.
- **Phase 7** ties frontend to backend (proxy, CORS, layout, error/empty/loading).
- **Phase 8** documents the current state.

---

## Verification Checklist

1. Run `backend/scripts/seed_db.py` — creates users and leave types.
2. Start backend: `uvicorn app.main:app --reload --port 8000` (from `backend/`).
3. Start frontend: `npm run dev` in `frontend/`.
4. Log in as admin@example.com / admin123, manager@example.com / admin123, employee@example.com / admin123.
5. As employee: submit leave request; cancel a pending request; as manager/admin: open Approvals, approve or reject (with reason); as employee: see rejection reason on My Requests; check My Balances.
6. As manager: view reportees’ leave balances. As admin: view any user’s balances and manage users/leave types.
