# Application Specification: Employee Leave Management System

**Version:** 1.0  
**Status:** Draft  
**Focus:** Three roles — Admin, Manager, Employee

---

## 1. Overview

The **Employee Leave Management System** is a web application for organizations to manage employee leave requests, approvals, and leave balances. Users log in by **role**: **Admin**, **Manager**, or **Employee**. Employees submit leave requests; managers approve or reject them; admins manage the system and users. The system tracks leave balances per leave type.

---

## Clarifications

### Session 2026-03-02

- Q: For a given employee, can two leave requests overlap in date range (same or different leave type), or must the system reject overlapping requests? → A: Allow overlap only across different leave types; reject if same leave type overlaps.
- Q: Should a Manager be able to view their reportees’ leave balances (read-only), or only their own? → A: Yes — Manager can view reportees’ leave balances (read-only).
- Q: Should the spec explicitly require user-facing error and empty states (e.g. validation errors, “No pending requests”, “Insufficient balance”)? → A: Yes — Require clear user-facing error messages and empty-state copy.
- Q: Should employees be explicitly allowed to GET their own user record (e.g. GET /api/users/{id} when id is the current user)? → A: Yes — Employee can GET own user only (read-only); Admin can GET any user.
- Q: When remaining balance is less than the requested days, should the system always reject the request and show a clear message, or allow negative balance for some leave types? → A: Reject the request and show a clear message (e.g. “Insufficient leave balance”); never allow negative balance.
- Q: Should an employee (or the request owner) be able to cancel/withdraw their own pending leave request? → A: Yes — Request owner can cancel their own pending request; no balance change.
- Q: Should the spec state explicitly that end date must be ≥ start date (and optionally that both must be today or in the future), or leave it only in error handling? → A: Yes — State in §5.3: end date must be ≥ start date; past dates optional / implementation choice.
- Q: Should Manager/Admin be able to cancel/withdraw a reportee’s (or any) pending request, in addition to approve/reject? → A: No — Only the request owner can cancel pending; Manager/Admin only approve or reject.
- Q: Should the rejection reason (when Manager/Admin provide it) be visible to the request owner (e.g. on My Requests)? → A: Yes — Rejection reason is visible to the request owner (e.g. on My Requests / request detail).
- Q: Should the API (and UI) support filtering leave requests by year (e.g. query param year), or is “all / current year only” enough for MVP? → A: No — For MVP, list all or current year only; no year filter.

---

## 2. Scope

- **In scope:** Leave requests (create, list, approve/reject), leave types (CRUD by admin), leave balances (view, auto-update on approval), user management (admin), authentication (JWT), role-based access for all three roles.
- **Out of scope (MVP):** Payroll, attendance, full HRIS, LDAP/SAML/SSO, calendar view.

---

## 3. Roles & Permissions

Three roles with distinct permissions:

| Role        | Description            | Permissions |
|------------|------------------------|-------------|
| **Admin**  | System administrator   | Full access: manage users (CRUD), manage leave types (CRUD), approve or reject any leave request, view any user’s leave balance and requests. |
| **Manager**| Team manager           | Approve/reject leave for **reportees only** (users whose manager_id is this user); view own and reportees’ leave requests; view **own and reportees’ leave balances** (read-only). Cannot manage leave types or other users. |
| **Employee** | Staff member         | Submit leave requests; view **own** requests and **own** leave balances only. Cannot approve requests or access other users’ data. |

- **Authentication:** Email + password; JWT issued on login.
- **Authorization:** Enforced at API and UI (e.g. Approvals page and user/leave-type management only for allowed roles).

---

## 4. Role Summary (Quick Reference)

- **Admin:** Users CRUD, Leave types CRUD, Approve any request, View any balance.
- **Manager:** Approve reportees’ requests, View own + reportees’ requests, View own + reportees’ balances.
- **Employee:** Submit requests, View own requests, View own balance.

---

## 5. Core Features (by role)

### 5.1 Authentication (all roles)

- Login: POST `/api/auth/login` (email, password) → JWT.
- Current user: GET `/api/auth/me` → profile (id, email, full_name, role, manager_id, is_active).

### 5.2 Leave types

- **List:** GET `/api/leave-types` — any authenticated user.
- **Create / Update:** POST/PATCH leave-types — **Admin only**.

### 5.3 Leave requests

- **Create:** POST `/api/leave-requests` — any authenticated user (typically Employee).
- **Date rule:** End date must be **≥ start date**. Whether past dates are allowed (e.g. for backdated leave) is an implementation choice; validation must reject end date before start date and show a clear message.
- **List / Get one:** GET leave-requests — own for Employee; own + reportees for Manager; any for Admin. For MVP, no year filter on list (show all or current year only).
- **Approve / Reject:** POST `/api/leave-requests/{id}/approve` — **Manager** (reportees only) or **Admin** (any). Optional rejection_reason is stored and **visible to the request owner** (e.g. on My Requests or request detail).
- **Overlapping dates:** Reject a new request if its date range overlaps with an existing (pending or approved) request for the **same employee and same leave type**. Overlapping dates across **different leave types** are allowed.
- **Insufficient balance:** Reject a new request if remaining balance (for that leave type and year) is less than the requested days. Show a clear user-facing message (e.g. “Insufficient leave balance”). Never allow negative balance.
- **Loss of pay (unpaid leave):** A leave type may be designated as unpaid / loss of pay (e.g. no entitlement or zero default_days). For such leave types, requests do not require or consume paid balance; approval workflow still applies. Overlapping-date rules apply per leave type as above.
- **Cancel pending:** The **request owner** may cancel their own **pending** request (e.g. PATCH to set status to cancelled, or dedicated cancel action). Only the owner may cancel a pending request; Manager/Admin may only approve or reject, not cancel others’ requests. No balance adjustment on cancel. Approved/rejected requests are not cancelled by the owner through this flow.

### 5.4 Leave balances

- **List:** GET `/api/leave-balances` — own for Employee; own and reportees (e.g. via `user_id` for reportees) for Manager; Admin may pass `user_id` to view any user’s balance.

### 5.5 Users

- **List / Create / Update:** GET (list), POST, PATCH `/api/users` — **Admin only**.
- **Get one:** GET `/api/users/{id}` — **Admin** (any user); **Employee/Manager** (own id only, read-only). Profile is also available via GET `/api/auth/me`.

---

## 6. Data Model (conceptual)

- **users:** id, email, hashed_password, full_name, **role** (admin \| manager \| employee), manager_id (nullable), is_active.
- **leave_types:** id, name, code, default_days_per_year, allow_carry_over, is_active.
- **leave_requests:** id, user_id, leave_type_id, start_date, end_date, reason, status (pending | approved | rejected | cancelled), approved_by_id, approved_at, rejection_reason, created_at, updated_at.
- **leave_balances:** id, user_id, leave_type_id, year, entitlement_days, carried_over_days, used_days.

---

## 7. API access by role

| Endpoint / action              | Admin | Manager | Employee |
|-------------------------------|-------|---------|----------|
| POST /api/auth/login          | ✓     | ✓       | ✓        |
| GET /api/auth/me              | ✓     | ✓       | ✓        |
| GET /api/leave-types          | ✓     | ✓       | ✓        |
| POST/PATCH /api/leave-types   | ✓     | —       | —        |
| POST /api/leave-requests      | ✓     | ✓       | ✓        |
| GET /api/leave-requests (own) | ✓     | ✓       | ✓        |
| GET /api/leave-requests (team/any) | ✓ (any) | ✓ (reportees) | — |
| POST …/approve                | ✓ (any) | ✓ (reportees) | —        |
| PATCH /api/leave-requests/{id} (cancel pending) | — | — | ✓ (own, pending only) |
| GET /api/leave-balances (own)| ✓     | ✓       | ✓        |
| GET /api/leave-balances (user_id) | ✓ (any) | ✓ (reportees only) | —        |
| GET /api/users (list)         | ✓     | —       | —        |
| POST/PATCH /api/users         | ✓     | —       | —        |
| GET /api/users/{id}           | ✓ (any) | ✓ (own only) | ✓ (own only, read-only) |

---

## 8. UI by role

- **Login:** One page; email + password; redirect to dashboard by role.
- **Layout:** Header with nav; show only links the role is allowed to use (e.g. Approvals and User/Leave type management for Manager/Admin as per table above).
- **Dashboard:** Welcome and shortcuts (Request Leave, My Requests, My Balances; Approvals for Manager/Admin; User/Leave type management for Admin).
- **Request Leave:** Form (leave type, dates, reason) — all roles that can submit (typically Employee/Manager/Admin as employees).
- **My Requests:** Current user’s requests and status; show Cancel for own pending requests where allowed. When a request is rejected, show the rejection reason to the request owner.
- **My Balances:** Current user’s balances per leave type/year; Manager may also view reportees’ balances (read-only).
- **Approvals:** Pending list and Approve/Reject — Manager (reportees) and Admin (all).
- **User management / Leave types:** Only Admin.

---

## 9. Error handling and empty states

The system **MUST** show clear, user-facing messages so users understand what went wrong or that there is no data.

- **Validation errors:** Display specific messages for invalid input (e.g. end date before start date, insufficient leave balance, overlapping dates for same leave type). Avoid generic “validation failed” without reason.
- **Empty states:** When a list has no items, show explicit copy instead of a blank area, e.g. “No pending requests”, “No leave requests yet”, “No leave balances for this year”.
- **API errors:** Failed requests (e.g. 4xx/5xx) must surface a user-friendly message in the UI (e.g. “Could not submit request. Please try again.” or the message returned by the API when provided).
- **Loading:** Indicate loading state when fetching data so users know the system is working.

---

This specification defines the three roles (Admin, Manager, Employee) and their permissions for the Employee Leave Management System.
