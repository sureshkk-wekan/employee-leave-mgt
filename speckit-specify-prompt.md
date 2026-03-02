# Speckit / Specify Prompt: Employee Leave Management (3 Roles)

Use this text as the **feature description** when running the Cursor command **`/speckit.specify`** (or when using Specify to generate a specification). Copy the block below into the command or chat.

---

## Prompt (copy below)

```text
Build an Employee Leave Management web application with three roles: Admin, Manager, and Employee.

**Roles and permissions:**
- **Admin**: Full system access. Can create/update/delete users and leave types; approve or reject any leave request; view any user's leave balance and requests.
- **Manager**: Can approve or reject leave requests only for their reportees (employees who report to them). Can view own and reportees' leave requests; view own leave balance. Cannot manage leave types or other users.
- **Employee**: Can submit leave requests and view only their own requests and leave balances. Cannot approve requests or see other users' data.

**Core features:**
- Authentication: email and password login; issue JWT; all leave and approval endpoints require authentication.
- Leave types: configurable types (e.g. annual, sick, unpaid) with default days per year and optional carry-over; only Admin can create/update leave types; all authenticated users can list active leave types.
- Leave requests: employees submit requests with leave type, start date, end date, and optional reason; validate balance and date range on submit; only pending requests can be approved or rejected; Manager can approve only reportees, Admin can approve any; on approval, deduct days from the relevant leave balance.
- Leave balances: each user has balance per leave type per year (entitlement, used, remaining); employees and managers see own balance; Admin can view any user's balance.
- User management: Admin can list, create, get, and update users (including role, manager_id, is_active). Users have role (admin | manager | employee) and optional manager_id for reportee relationship.

**Out of scope for MVP:** Payroll, attendance clock-in/out, full HRIS, LDAP/SAML/SSO; calendar view can be a later enhancement.

**Success:** Users can log in by role; employees submit leave; managers approve reportees' requests; admins manage users and leave types and approve any request; everyone sees appropriate leave balances. Enforce permissions at both API and UI (e.g. Approvals and user/leave-type management only for allowed roles).
```

---

## Shorter prompt (minimal)

If you prefer a shorter input for `/speckit.specify`:

```text
Employee Leave Management app with three roles. Admin: full access (users, leave types, approve any request, view any balance). Manager: approve/reject leave for reportees only, view own and reportees' requests, own balance. Employee: submit leave requests, view own requests and own balance only. Auth with JWT; leave types configurable by admin; leave requests with balance validation; on approve, deduct from balance. Enforce roles at API and UI.
```

---

## Usage

1. In Cursor, run **`/speckit.specify`** (or open the speckit.specify command).
2. Paste either the **full prompt** or the **shorter prompt** as the feature description.
3. The agent will create a branch, load the spec template, and generate a specification (e.g. in `specs/<number>-<short-name>/spec.md`) with user scenarios, requirements, success criteria, and optional checklist.
4. Follow up with **`/speckit.plan`** to generate the technical plan and **`/speckit.tasks`** to generate tasks.

If your project uses **Specify** (`.specify/` folder and scripts), ensure you run the command from the repository root so that `create-new-feature.sh` and templates resolve correctly.
