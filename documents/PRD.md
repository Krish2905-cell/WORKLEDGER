# WORKLEDGER — TRD

**Version:** 1.2 (condensed)
**Status:** Finalized for v1 build
**Related:** PRD.md, TechSpec.md

---

## 1. Stack

```text
Frontend        React + JavaScript + Vite
Styling         Tailwind CSS + shadcn/ui
Backend/DB/Auth Supabase (PostgreSQL + Auth + Row Level Security)
Serverless      Supabase Edge Functions — AI + Email only
Email           Resend or SendGrid
AI              Anthropic Claude API
Testing         Vitest
Deployment      Vercel + Supabase
```

No standalone Express backend or ORM in v1. All CRUD goes directly from the frontend to Supabase via its client library, secured by Row Level Security. This removes an entire hand-written route/controller layer.

---

## 2. Architecture

```text
React Frontend
  |-- Supabase client (direct) --> Postgres + Auth + RLS   [all CRUD]
  |-- HTTPS --> Serverless Functions
                   |-- /api/ai/ask         --> Claude API
                   |-- /api/reminders/run  --> Resend/SendGrid (daily cron)
```

Anthropic and email API keys exist only inside serverless functions, never in frontend code.

The frontend communicates with PostgreSQL through the Supabase client, which enforces Row Level Security.

---

## 3. Entities

```text
User -- Clients -- Projects -- Tasks / Invoices
```

Full table definitions live in `Schema.md`.

---

## 4. Data Ownership

Every table has a `user_id` column.

Ownership is enforced primarily by **Supabase RLS policies** (row-level, DB-enforced) rather than manual backend checks.

A query for another user's data returns nothing, regardless of the request. Serverless functions additionally verify the session before any fetch.

---

## 5. Business Rules

* Project status: `Planning` / `Active` / `Completed`.
* Every project belongs to a client.
* Every task and invoice belongs to a project.
* Task due dates are required.
* Invoice amounts must be positive.
* Invoice status is `Paid` / `Unpaid`.
* Currency is fixed to INR.
* No cascade deletes.
* A client with linked projects cannot be deleted.
* A project with linked tasks or invoices cannot be deleted.
* Completed tasks/projects are excluded from incomplete/active counts.
* Financial totals are always computed live from invoice records, never cached.
* AI responses use only the authenticated user's data.

---

## 6. Dashboard Logic

```text
Active Projects   = projects where status = Active
Upcoming Tasks    = incomplete tasks due within 7 days
Overdue Tasks     = incomplete tasks where due_date < today
Total Unpaid      = SUM(amount) where invoice status = Unpaid
```

Computed live via Supabase queries at request time and never cached.

---

## 7. Overload Warning

Triggered when:

* There are at least **3 incomplete tasks**.
* Tasks are spread across at least **2 active projects**.
* Task due dates fall inside a rolling **3-day window**.

The calculation is performed client-side from data already fetched for the dashboard.

It must not:

* Block task creation.
* Block project creation.
* Change project status.
* Modify data.

The warning is informational only.

---

## 8. Email Reminders

A daily-scheduled serverless function runs using Supabase pg_cron or Vercel Cron.

The function:

1. Queries, per user, incomplete tasks.
2. Selects tasks with:

```text
due_date <= today + 2 days
```

3. Naturally includes overdue tasks.
4. Skips the user if no tasks qualify.
5. Sends one summary email via Resend or SendGrid if tasks qualify.

Email credentials live only in the serverless function's environment.

---

## 9. AI Assistant

The AI assistant is read-only in v1.

```text
Question
  -> Serverless function (/api/ai/ask)
  -> Verify session
  -> Fetch user's data using service role key server-side
  -> Build context using instructions, data, and question
  -> Send context to Claude API
  -> Return answer
```

### AI Rules

* Processing occurs only server-side.
* The Anthropic API key is never exposed to the frontend.
* AI is scoped only to the current authenticated user's data.
* AI cannot create records.
* AI cannot edit records.
* AI cannot delete records.
* AI must not invent missing information.
* AI failures must surface a clear error.
* No chat history is stored in v1.
* AI requests are stateless.
* No user's data can enter another user's AI context.
* Every data fetch must be scoped to the authenticated user.

---

## 10. Security

* Supabase Auth is required for all private data.
* RLS is the primary ownership-check mechanism.
* Manual per-request backend checks are not required for normal CRUD.
* Passwords are handled entirely by Supabase Auth.
* Anthropic, email, and service-role keys live only in serverless function environment variables.
* `.env` files must never be committed.
* Serverless functions verify the session before any data, AI, or email operation.
* Every data fetch is scoped to the authenticated user.
* One user's data must never enter another user's AI context.
* The frontend must never receive the Supabase service-role key.
* Rate limiting may be added to the AI endpoint later.

---

## 11. API Surface

Standard CRUD operations for Clients, Projects, Tasks, Invoices, and Dashboard data use direct Supabase client calls from the frontend.

No hand-written REST routes are required for CRUD operations.

Only two custom endpoints exist, both serverless:

```text
POST /api/ai/ask
Body: { question }
Returns: { answer }

/api/reminders/run
Scheduled endpoint for daily email reminders
```

Column-level definitions (types, constraints, nullability) for every entity are in `Schema.md`. There is no separate custom API request/response shape to define beyond that, since CRUD goes directly through the Supabase client library against these tables rather than through hand-written endpoints.

---

## 12. Code Structure

```text
src/
 |-- components/
 |-- pages/
 |-- layouts/
 |-- hooks/
 |-- utils/
 |-- lib/
 |     `-- supabaseClient.js
 |
supabase/
 |-- migrations/     (versioned SQL schema)
 |-- policies/       (RLS definitions)
 `-- functions/
      |-- ai-ask/
      `-- reminders-run/
```

### File Extensions

Use JavaScript files:

```text
.js   -> JavaScript logic
.jsx  -> React components
```

### Code Organization

Keep business logic such as:

* Overload calculations
* Dashboard aggregation
* Invoice calculations
* Date filtering
* Validation helpers

inside `src/lib/` or `src/utils/`.

Do not place complex business logic directly inside UI components.

---

## 13. Testing

Priority order:

1. RLS-based data isolation with no cross-user leakage.
2. Client CRUD.
3. Project CRUD.
4. Task CRUD.
5. Invoice CRUD.
6. Delete-blocked-by-children behavior.
7. Overdue task calculations.
8. Unpaid invoice calculations.
9. Overload warning triggers.
10. Email filtering logic.
11. AI data isolation.
12. Invalid-input handling.

Correctness and isolation matter more than test count.

---

## 14. Development

```bash
npm install
npm run dev
supabase db push
supabase functions deploy ai-ask
supabase functions deploy reminders-run
npm test
npm run build
```

Use:

* JavaScript
* ESLint
* Prettier
* Fail-fast environment variable validation

---

## 15. Environment Variables

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY=   # server-side only
RESEND_API_KEY=              # server-side only
ANTHROPIC_API_KEY=           # server-side only
```

Only the two `VITE_` keys are safe in the frontend bundle:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

All other keys must remain server-side.

---

## 16. Future Compatibility

Room for:

* PWA support
* Mobile responsiveness
* Offline storage
* Data export/import
* Calendar integration
* Client portal
* Team collaboration
* AI write actions
* Advanced analytics
* Invoice PDF generation
* Migration to a dedicated Express/Prisma backend if RLS becomes limiting

None of these features should complicate the v1 MVP.

---

## 17. Technical Principle

> **Build the simplest architecture that keeps freelancer data secure, deadlines visible, invoices accurate, and the application maintainable.**