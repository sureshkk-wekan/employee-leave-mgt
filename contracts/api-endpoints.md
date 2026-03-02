# API Contracts: Employee Leave Management System

**Base path:** `/api`  
**Auth:** `Authorization: Bearer <JWT>` for all except `POST /auth/login`.  
**Spec:** [spec.md](spec.md) §5 and §7.

---

## Auth

| Method | Endpoint | Body | Response | Roles |
|--------|----------|------|----------|--------|
| POST | /auth/login | email, password | access_token | — |
| GET | /auth/me | — | user profile | Any |

---

## Leave types

| Method | Endpoint | Body | Roles |
|--------|----------|------|--------|
| GET | /leave-types | — | Any |
| POST | /leave-types | name, code, default_days_per_year, allow_carry_over | Admin |
| GET | /leave-types/{id} | — | Any |
| PATCH | /leave-types/{id} | name, code, default_days_per_year, allow_carry_over, is_active | Admin |

---

## Leave requests

| Method | Endpoint | Body | Roles |
|--------|----------|------|--------|
| POST | /leave-requests | leave_type_id, start_date, end_date, reason? | Any |
| GET | /leave-requests | status?, my_only? | Any (scope by role) |
| GET | /leave-requests/{id} | — | Owner / Manager / Admin |
| POST | /leave-requests/{id}/approve | approved, rejection_reason? | Manager / Admin |
| PATCH | /leave-requests/{id} | status: cancelled | Owner (pending only) |

**Validation (POST):** end_date ≥ start_date; no overlap same user+leave_type; sufficient balance (or unpaid type).

---

## Leave balances

| Method | Endpoint | Query | Roles |
|--------|----------|-------|--------|
| GET | /leave-balances | user_id? (admin any; manager reportees only), year? | Any (scope by role) |

---

## Users

| Method | Endpoint | Body | Roles |
|--------|----------|------|--------|
| GET | /users | — | Admin |
| POST | /users | email, password, full_name, role, manager_id? | Admin |
| GET | /users/{id} | — | Admin (any); Manager/Employee (own only, read-only) |
| PATCH | /users/{id} | full_name, role, manager_id, is_active | Admin |

---

Error responses: 4xx/5xx with user-facing message where applicable (see spec §9).
