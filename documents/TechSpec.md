# WORKLEDGER — Technical Specification (TechSpec)

**Version:** 1.2
**Status:** Finalized for v1 build
**Related:** PRD.md, Schema.md, AppFlow.md

## 1. Stack

```text
Frontend        React + JavaScript + Vite
Styling         Tailwind CSS
UI              shadcn/ui
Backend/DB/Auth Supabase (PostgreSQL + Auth + Row Level Security)
Serverless      Supabase Edge Functions — AI + Email only
Email           Resend
Scheduler       Supabase pg_cron
AI              Anthropic Claude API
Testing         Vitest
Versioning      Git + GitHub
Deployment      Vercel + Supabase
```

No standalone Express/Node backend and no ORM (Prisma) are used in v1. Standard CRUD goes directly from the frontend to Supabase via its client library, secured by Row Level Security — this removes an entire layer of hand-written routes/controllers for basic data operations, which keeps the build achievable at your current experience level.

---

## 2. Architecture

```text
React Frontend
      |
      |-- Supabase client library (direct calls) --> Supabase (Postgres + Auth + RLS)
      |         used for: all Client / Project / Task / Invoice CRUD
      |
      |-- HTTPS calls --> Serverless Edge Functions
                |
                |-- /api/ai/ask         --> Anthropic Claude API (session verified)
                |-- /api/reminders/run  --> Resend (daily pg_cron trigger with CRON_SECRET)
```

External services:

```text
Supabase Auth   → Authentication
Supabase RLS    → Per-user data isolation (replaces manual ownership checks in app code)
Resend          → Email reminders
Claude API      → AI assistant
```

Frontend never holds the Anthropic, Resend, or CRON_SECRET API keys — those exist only inside the serverless functions. Frontend never connects to PostgreSQL directly, only through Supabase's client library, which itself enforces RLS.

---

## 3. Core Entities

```text
User
Client
Project
Task
Invoice
```

Relationships:

```text
User (auth.users)
 ├── Clients
 └── Projects

Client
 └── Projects

Project
 ├── Tasks
 └── Invoices
```

Detailed table definitions live in Schema.md.

---

## 4. Data Ownership

`clients` and `projects` tables contain a `user_id` column referencing `auth.users`.

`tasks` and `invoices` tables do **not** have a `user_id` column. Their user ownership is established strictly through their parent project:
* `tasks.project_id -> projects.user_id`
* `invoices.project_id -> projects.user_id`

```text
User → Client → Project → Task / Invoice
```

Ownership is enforced primarily through **Supabase Row Level Security policies** (database-level), not hand-written backend checks — a query for another user's data simply returns nothing, regardless of what the frontend requests. For `tasks` and `invoices`, RLS policies join to `projects` to verify that `projects.user_id = auth.uid()`.

Users can access only their own:

* Clients
* Projects
* Tasks
* Invoices
* Dashboard data
* AI assistant context

---

## 5. Business Rules

* Project status can be `Planning`, `Active`, or `Completed`.
* Every project must belong to a client.
* Every task must belong to a project.
* Every invoice must belong to a project.
* When editing a task or invoice, reassignment to another project owned by the authenticated user is allowed via a project dropdown. Reassignment to another user's project is strictly prohibited.
* Task due dates are required and must be valid dates.
* Invoice amounts must be positive.
* Invoice status can be `Paid` or `Unpaid`.
* A client with linked projects cannot be deleted.
* A project with linked tasks or invoices cannot be deleted (no cascade deletes in v1; tasks/invoices can be deleted or reassigned to another project first).
* Completed tasks must not be counted as incomplete.
* Completed projects should not be counted as active.
* Financial totals must be calculated from invoice records, not cached values.
* AI responses must use only the authenticated user's data.
* Invoice currency is fixed (INR) — no per-invoice currency selection in v1.

---

## 6. Dashboard Logic

The dashboard features exactly 3 summary cards:
1. **Active Projects** = Projects where status = Active
2. **Upcoming Deadlines** = Incomplete tasks (`is_done = false`) due from today through today + 7 days (`today <= due_date <= today + 7 days`)
3. **Total Unpaid Amount** = SUM(amount where invoice status = Unpaid)

**Overdue Tasks** = Incomplete tasks where due date is before today (`due_date < today`). These are highlighted and pinned to the top of the upcoming list in red, rather than forming a 4th summary card.

All dashboard values are computed from live queries (via the Supabase client) at request time — never cached — to avoid stale data.

---

## 7. Overload Warning

An overload warning is shown when:

```text
Incomplete tasks >= 3
AND
Active projects >= 2 (tasks spread across them)
AND
Tasks due within a rolling 3-day window:
  today, today + 1 day, and today + 2 days (today <= due_date <= today + 2 days)
```

Rules:
* Only incomplete tasks (`is_done = false`) are considered.
* Tasks must belong to at least 2 distinct `Active` projects. Tasks in `Planning` or `Completed` projects do not count.
* Overdue tasks from before today (`due_date < today`) do **NOT** count toward the overload calculation.
* Computed client-side from data already fetched for the dashboard — no separate backend service needed.

It must not:

* Block task creation
* Block project creation
* Change project status
* Automatically delete or modify data

---

## 8. Email Reminders

A scheduled **serverless function** (triggered by Supabase pg_cron) runs once daily at a fixed time.

It will:

* Authenticate via a pre-shared **`CRON_SECRET`** header provided by pg_cron (does **not** require a logged-in user session).
* Query, per user via the Supabase Service Role key, incomplete tasks with `due_date <= today + 2 days` (this naturally includes overdue tasks).
* Skip the user if no relevant tasks exist.
* Otherwise build one summary email (task title, project name, due date) and send it via **Resend**.

Email credentials (`RESEND_API_KEY`), `CRON_SECRET`, and the Service Role key live only inside the serverless function's environment — never in frontend code.

---

## 9. AI Assistant

The AI assistant is read-only in v1.

```text
User Question
      ↓
Serverless Function (/api/ai/ask)
      ↓
Verify Supabase session
      ↓
Fetch user's data via Supabase (service role key, server-side only)
      ↓
Build context (system instructions + user data + question)
      ↓
Claude API
      ↓
Return Answer
```

The assistant may answer questions such as:

* Which tasks are due this week?
* What is my total unpaid amount?
* Which projects are active?
* Which client has the most projects?
* Am I overloaded?

Rules:

* AI requests are processed only through the serverless function — never client-side.
* The Anthropic API key must never be exposed to the frontend.
* The AI can access only the current user's data.
* The AI cannot create, edit, or delete records.
* The AI must not invent missing information.
* Chat history is not persisted in v1 — each session is stateless.
* The application should clearly surface AI service failures (e.g., "assistant is unavailable, try again") rather than fail silently.

---

## 10. Security

* Authentication required for all private data (Supabase Auth).
* Row Level Security policies enforce that users can access only their own records — this is the primary ownership-check mechanism in v1, replacing manual per-request checks in application code.
* Passwords are never stored or handled manually — Supabase Auth owns credential storage.
* Secrets (Anthropic key, Resend API key, CRON_SECRET, Supabase service role key) live only in serverless function environment variables — never in frontend bundles.
* `.env` files must not be committed.
* `/api/ai/ask` verifies the user's active session token before doing any data fetch or AI call.
* `/api/reminders/run` verifies the `CRON_SECRET` header before processing (does not require a user session).
* Rate limiting may be added to the AI endpoint if needed.
* One user's data must never be included in another user's AI context — enforced by scoping every data fetch to the authenticated `user_id`.

---

## 11. API Surface

Standard CRUD (Clients, Projects, Tasks, Invoices, Dashboard) is handled by **direct Supabase client calls from the frontend** — see Schema.md for the full column-level shape of each table. There are no hand-written Express routes for these, so there is no separate request/response contract beyond what Schema.md already defines.

Only two custom HTTP endpoints exist, both served by serverless functions:

```text
POST /api/ai/ask
  Body: { question: string }
  Returns: { answer: string }
  (Authenticated via user session JWT)

[scheduled, not user-facing]
/api/reminders/run
  Triggered daily by Supabase pg_cron
  (Authenticated via CRON_SECRET header)
```, not user-facing]
/api/reminders/run
  Triggered daily by cron — no client calls this directly
```

---

## 12. Code Structure

Since there's no custom backend for CRUD, the codebase is simpler than a traditional REST-API project:

```text
src/
 ├── components/
 ├── pages/
 ├── layouts/
 ├── lib/
 │    └── supabaseClient.js       (Supabase client init)
 ├── hooks/
 └── utils/

supabase/
 ├── migrations/                  (SQL schema, version-controlled)
 ├── policies/                    (RLS policy definitions)
 └── functions/
      ├── ai-ask/                 (serverless function: AI chat)
      └── reminders-run/          (serverless function: daily email job)
```

Keep business logic (overload warning calculation, dashboard aggregation) in small, testable utility functions under `src/lib/` or `src/utils/` — not scattered inside UI components.

---

## 13. Testing

Test critical application logic:

* Authentication and protected routes
* RLS-based data isolation (a user cannot read/write another user's rows)
* Client CRUD
* Project CRUD (including delete-blocked-by-children rule)
* Task completion and overdue detection
* Invoice status updates and unpaid-total calculation
* Dashboard aggregation values
* Overload warning trigger conditions
* Email reminder filtering logic (which tasks qualify)
* AI user-data isolation (no cross-user leakage in context)
* Invalid input handling on all forms

Data isolation and business correctness matter more than test count — prioritize the RLS/ownership tests above all else, since that's the one thing that's genuinely dangerous to get wrong.

---

## 14. Development

Database schema changes are managed through Supabase's SQL migrations (version-controlled in `supabase/migrations/`).

Example commands:

```bash
npm install
npm run dev
supabase db push          # apply migrations
supabase functions deploy ai-ask
supabase functions deploy reminders-run
npm test
npm run build
```

Use:

* ESLint
* Prettier
* Environment variable validation (fail fast if a required key is missing)

---

## 15. Environment Variables

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY=   # server-side only, used in serverless functions
RESEND_API_KEY=              # server-side only
ANTHROPIC_API_KEY=           # server-side only
CRON_SECRET=                 # server-side only
```

Never commit real secrets to GitHub. Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are safe to expose to the frontend — everything else stays inside serverless function environments.

---

## 16. Future Compatibility

The architecture should leave room for:

* PWA support
* Mobile responsive improvements
* Offline storage
* Background synchronization
* Data export/import
* Calendar integration
* Client portal
* Team collaboration
* AI write actions
* Migrating from direct-Supabase CRUD to a dedicated backend (Express/Prisma), if the project later needs more custom server-side logic than RLS can express

These features should not complicate the MVP.

---

## 17. Technical Principle

> **Build the simplest architecture that keeps freelancer data secure, deadlines visible, invoices accurate, and the application maintainable.**