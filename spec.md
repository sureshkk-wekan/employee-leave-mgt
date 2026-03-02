# Application Specification: Employee Leave Management System

**Version:** 1.0  
**Status:** Draft  
**Focus:** Three roles — Admin, Manager, Employee

---

## 1. Overview

The **Employee Leave Management System** is a web application for organizations to manage employee leave requests, approvals, and leave balances. Users log in by **role**: **Admin**, **Manager**, or **Employee**. Employees submit leave requests; managers approve or reject them; admins manage the system and users. The system tracks leave balances per leave type.

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
| **Manager**| Team manager           | Approve/reject leave for **reportees only** (users whose manager_id is this user); view own and reportees’ leave requests; view own leave balance. Cannot manage leave types or other users. |
| **Employee** | Staff member         | Submit leave requests; view **own** requests and **own** leave balances only. Cannot approve requests or access other users’ data. |

- **Authentication:** Email + password; JWT issued on login.
- **Authorization:** Enforced at API and UI (e.g. Approvals page and user/leave-type management only for allowed roles).

---

## 4. Role Summary (Quick Reference)

- **Admin:** Users CRUD, Leave types CRUD, Approve any request, View any balance.
- **Manager:** Approve reportees’ requests, View own + reportees’ requests, View own balance.
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
- **List / Get one:** GET leave-requests — own for Employee; own + reportees for Manager; any for Admin.
- **Approve / Reject:** POST `/api/leave-requests/{id}/approve` — **Manager** (reportees only) or **Admin** (any).

### 5.4 Leave balances

- **List:** GET `/api/leave-balances` — own for Employee/Manager; Admin may pass `user_id` to view any user’s balance.

### 5.5 Users

- **List / Create / Get / Update:** GET, POST, GET by id, PATCH `/api/users` — **Admin only**. Employee can GET own profile via `/api/auth/me` or GET `/api/users/{own_id}` if allowed.

---

## 6. Data Model (conceptual)

- **users:** id, email, hashed_password, full_name, **role** (admin \| manager \| employee), manager_id (nullable), is_active.
- **leave_types:** id, name, code, default_days_per_year, allow_carry_over, is_active.
- **leave_requests:** id, user_id, leave_type_id, start_date, end_date, reason, status, approved_by_id, approved_at, rejection_reason, created_at, updated_at.
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
| POST …/approve                | ✓ (any) | ✓ (reportees) | — |
| GET /api/leave-balances (own)| ✓     | ✓       | ✓        |
| GET /api/leave-balances (user_id) | ✓ | —      | —        |
| GET/POST/PATCH /api/users     | ✓     | —       | Self only (if offered) |

---

## 8. UI by role

- **Login:** One page; email + password; redirect to dashboard by role.
- **Layout:** Header with nav; show only links the role is allowed to use (e.g. Approvals and User/Leave type management for Manager/Admin as per table above).
- **Dashboard:** Welcome and shortcuts (Request Leave, My Requests, My Balances; Approvals for Manager/Admin; User/Leave type management for Admin).
- **Request Leave:** Form (leave type, dates, reason) — all roles that can submit (typically Employee/Manager/Admin as employees).
- **My Requests:** Current user’s requests and status.
- **My Balances:** Current user’s balances per leave type/year.
- **Approvals:** Pending list and Approve/Reject — Manager (reportees) and Admin (all).
- **User management / Leave types:** Only Admin.

---

This specification defines the three roles (Admin, Manager, Employee) and their permissions for the Employee Leave Management System.
