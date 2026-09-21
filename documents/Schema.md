# WorkLedger — Database Schema

**Version:** 1.1
**Status:** Aligned to TRD v1.1
**Related:** PRD.md, TechSpec.md (both currently hold TRD content — see Tracker.md Open Issues)

## 1. Database

**PostgreSQL** (via Supabase)

WorkLedger is a single-user-per-account application. Each freelancer has their own login, but there is no shared/multi-role data — every record belongs to exactly one user. Authentication and the `users` table are handled entirely by Supabase Auth (`auth.users`); no custom `users` table is defined here.

All standard CRUD reaches these tables directly from the frontend via the Supabase client library — there is no hand-written Express/ORM layer. Ownership is enforced by Row Level Security (RLS), not application code (per TRD Section 4).

---

# 2. Entity Overview

```text
auth.users (Supabase Auth)
   │
   ▼
Client
   │
   ▼
Project
   │
   ├──────────────┐
   │              │
   ▼              ▼
Task           Invoice
```

Core tables:

```text
clients
projects
tasks
invoices
```

---

# 3. clients

Represents a freelancer's client — a business relationship, not a login.

Examples:

```text
Acme Studio
Riya Sharma (Freelance Writer Referral)
Bluepeak Consulting
```

### Columns

| Column     | Type        | Notes                                |
| ---------- | ----------- | ------------------------------------- |
| id         | UUID        | Primary key, default gen_random_uuid()|
| user_id    | UUID        | FK → auth.users, owner of this record |
| name       | VARCHAR     | Client name, NOT NULL                 |
| email      | VARCHAR     | Nullable                              |
| company    | VARCHAR     | Nullable                              |
| notes      | TEXT        | Nullable                              |
| created_at | TIMESTAMPTZ | Creation time                         |

Example:

```text
id: 1
name: Acme Studio
company: Acme Inc.
email: hello@acme.io
```

---

# 4. projects

A body of work for a client. Moves through a fixed status pipeline.

### Columns

| Column     | Type        | Notes                                          |
| ---------- | ----------- | ----------------------------------------------- |
| id         | UUID        | Primary key                                     |
| user_id    | UUID        | FK → auth.users, owner of this record           |
| client_id  | UUID        | FK → clients, NOT NULL                          |
| name       | VARCHAR     | Project name, NOT NULL                          |
| status     | ENUM        | Planning / Active / Completed, default Planning |
| created_at | TIMESTAMPTZ | Creation time                                   |

Examples:

```text
Website Redesign     → Acme Studio     → Active
Brand Guidelines Doc  → Bluepeak Consulting → Planning
Q2 Content Calendar   → Riya Sharma     → Completed
```

Business rule: every project must belong to a client. `client_id` is `NOT NULL`.

---

# 5. tasks

A single unit of work inside a project, with a required due date.

### Columns

| Column     | Type        | Notes                                     |
| ---------- | ----------- | -------------------------------------------|
| id         | UUID        | Primary key                                |
| project_id | UUID        | FK → projects, NOT NULL                    |
| title      | VARCHAR     | Task description, NOT NULL                 |
| due_date   | DATE        | **NOT NULL** — due dates are required per business rules |
| is_done    | BOOLEAN     | Default false                              |
| created_at | TIMESTAMPTZ | Creation time                              |

Examples:

```text
Task: Deliver homepage mockup
Due: 2026-09-25
Done: false

Task: Send final invoice
Due: 2026-09-30
Done: false
```

A completed task (`is_done = true`) must never be counted in incomplete/overdue calculations — enforced in query logic, not a schema constraint.

---

# 6. invoices

Tracks money owed for a project. No transfers table — WorkLedger tracks billing status, not cash movement between accounts. Currency is fixed to INR for v1 (no per-invoice currency column).

### Columns

| Column        | Type          | Notes                                    |
| ------------- | ------------- | ------------------------------------------|
| id            | UUID          | Primary key                               |
| project_id    | UUID          | FK → projects, NOT NULL                   |
| amount        | NUMERIC(10,2) | INR, CHECK (amount > 0)                   |
| invoice_date  | DATE          | Default current_date                      |
| is_paid       | BOOLEAN       | Default false                             |
| created_at    | TIMESTAMPTZ   | Creation time                             |

Example:

```text
Invoice: ₹15,000
Project: Website Redesign
Paid: false
```

---

# 7. Relationships

```text
auth.users
   │
   ├───────────────< clients
   │
   └───────────────< projects

clients
   │
   └───────────────< projects

projects
   │
   ├───────────────< tasks
   │
   └───────────────< invoices
```

Cardinality:

```text
one client   → many projects
one project  → many tasks
one project  → many invoices
one user     → many clients, many projects
```

A task or invoice always belongs to exactly one project. A project always belongs to exactly one client and one user.

---

# 8. Derived Values (not stored — computed live on every read, per TRD Section 6)

Active Projects:

```text
projects WHERE status = 'Active' AND user_id = <current user>
```

Upcoming Tasks (Dashboard, next 7 days):

```text
tasks WHERE is_done = false
   AND due_date <= current_date + 7
```

Overdue Tasks:

```text
tasks WHERE is_done = false
   AND due_date < current_date
```

Total Unpaid Amount (per project or across all projects):

```text
SUM(invoices.amount) WHERE invoices.is_paid = false
   [AND invoices.project_id = <project>]        -- per-project view
   [AND project.user_id = <current user>]       -- dashboard-wide view
```

Overload Warning (per TRD Section 7 — exact condition):

```text
incomplete tasks >= 3
AND those tasks span >= 2 distinct Active projects
AND all fall within the same rolling 3-day window
```

Computed client-side from data already fetched for the dashboard, or in a lightweight Supabase view/function — not a separate backend service, and never a stored/cached flag.

All of the above are always computed from live queries at request time — never cached — per TRD Section 6, to avoid stale dashboard data.

---

# 9. Important Constraints

### Amount

```text
invoices.amount > 0
```

Stored as `NUMERIC(10,2)`, fixed currency INR for v1 (per TRD Section 5 — no per-invoice currency selection).

### Status

```text
projects.status ∈ { Planning, Active, Completed }
```

Enforced with a CHECK constraint (or Postgres ENUM type).

### Due Dates

```text
tasks.due_date IS NOT NULL
```

Required and must be a valid date — enforced at the column level (`NOT NULL`) plus form validation on the frontend.

### Client Deletion

```text
A client cannot be deleted while it still has projects.
(client_id FK uses ON DELETE RESTRICT)
```

### Project Deletion

```text
A project cannot be deleted while it still has tasks or invoices.
NO CASCADE DELETES in v1 (per TRD Section 5).
(project_id FK on tasks and invoices uses ON DELETE RESTRICT, not CASCADE)
```

This is a deliberate change from an earlier draft of this schema, which used `ON DELETE CASCADE` — the TRD explicitly rules that out to avoid silently destroying task/invoice history when a project is removed. The UI must guide the user to delete/reassign a project's tasks and invoices first.

### Foreign Keys

Projects, tasks, and invoices must reference existing, non-deleted parent records at all times.

### Row Level Security

Every table (`clients`, `projects`, `tasks`, `invoices`) has RLS enabled and is the **primary** ownership-enforcement mechanism (per TRD Section 4 and 10) — not a backup to application-level checks. `tasks` and `invoices` don't store `user_id` directly; ownership is checked by joining through `projects.user_id = auth.uid()`. A query for another user's data returns nothing, regardless of what the frontend requests.

---

# 10. Example Data

### Clients

```text
Acme Studio
Bluepeak Consulting
```

### Projects

```text
Website Redesign     → Acme Studio          → Active
Brand Guidelines Doc  → Bluepeak Consulting  → Planning
```

### Tasks

```text
Deliver homepage mockup   → Website Redesign   → due 2026-09-25 → not done
Send final invoice        → Website Redesign   → due 2026-09-30 → not done
```

### Invoices

```text
₹15,000  → Website Redesign  → unpaid
₹8,000   → Brand Guidelines Doc → paid
```

---

# 11. Source of Truth

Tasks and invoices are the source of truth for deadlines and billing status. Dashboard numbers (Active Projects, Upcoming Tasks, Overdue Tasks, Total Unpaid) and the Overload Warning are always derived live from these tables — nothing is cached or duplicated (per TRD Section 6). If a cached/materialized value is introduced later for performance, it must remain fully recomputable from the underlying records.

---

# 12. Future Expansion

The schema can later be extended with, per TRD Section 16:

```text
Data export/import
Calendar integration
Client portal / second login role
Team collaboration (would require re-introducing a proper multi-tenant model)
AI write actions (would not need new tables, only new write paths)
Recurring tasks
Multi-currency invoicing (would add a currency column to invoices)
```

No multi-tenant/team structure is required unless WorkLedger is eventually turned into a shared, multi-freelancer application.

---

# 13. Schema Principle

> **Every task and invoice must trace back to exactly one project, one client, and one user — no orphaned records, no ambiguous ownership, and no silent data loss on delete.**