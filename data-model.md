# Data Model: Employee Leave Management System

**Source:** [spec.md](spec.md) §6 and business rules.

---

## Entities

### users

| Field | Type | Notes |
|-------|------|--------|
| id | string (UUID or int) | Primary key |
| email | string | Unique, used for login |
| hashed_password | string | bcrypt |
| full_name | string | |
| role | enum | admin \| manager \| employee |
| manager_id | string \| null | FK to users.id; reportee relationship |
| is_active | boolean | |

### leave_types

| Field | Type | Notes |
|-------|------|--------|
| id | string (UUID or int) | Primary key |
| name | string | e.g. Annual, Sick, Unpaid |
| code | string | e.g. ANNUAL, SICK, LOP |
| default_days_per_year | number | 0 for unpaid/loss-of-pay |
| allow_carry_over | boolean | |
| is_active | boolean | |

### leave_requests

| Field | Type | Notes |
|-------|------|--------|
| id | string (UUID or int) | Primary key |
| user_id | string | FK to users |
| leave_type_id | string | FK to leave_types |
| start_date | date | |
| end_date | date | Must be ≥ start_date |
| reason | string \| null | Optional |
| status | enum | pending \| approved \| rejected \| cancelled |
| approved_by_id | string \| null | FK to users |
| approved_at | datetime \| null | |
| rejection_reason | string \| null | Visible to request owner |
| created_at | datetime | |
| updated_at | datetime | |

### leave_balances

| Field | Type | Notes |
|-------|------|--------|
| id | string (UUID or int) | Primary key |
| user_id | string | FK to users |
| leave_type_id | string | FK to leave_types |
| year | number | e.g. 2026 |
| entitlement_days | number | From leave type or override |
| carried_over_days | number | |
| used_days | number | Increased on approval |

**Derived:** remaining_days = entitlement_days + carried_over_days - used_days. Never allow negative for paid leave types.

### audit_logs (constitution)

| Field | Type | Notes |
|-------|------|--------|
| id | string | |
| action | string | e.g. request_created, approved, rejected, cancelled |
| actor_id | string | FK to users |
| target_type | string | e.g. leave_request |
| target_id | string | |
| details | object \| null | |
| created_at | datetime | |

---

## Validation Rules

- **leave_requests:** end_date ≥ start_date; no overlap same user + same leave_type (pending/approved); sufficient balance for paid leave type (or leave type is unpaid).
- **leave_balances:** used_days ≤ entitlement_days + carried_over_days for paid types; unpaid types may have 0 entitlement and not consume balance.

---

## State Transitions (leave_requests.status)

- pending → approved (Manager/Admin approve)
- pending → rejected (Manager/Admin reject)
- pending → cancelled (owner only)

Approved/rejected are terminal for owner-driven cancel; no refund of used_days on cancel (cancel only applies to pending).
