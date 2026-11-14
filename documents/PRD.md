# WORKLEDGER — Product Requirements Document (PRD)

**Version:** 1.2

**Status:** Finalized for v1 build

**Related:** TechSpec.md, Schema.md, AppFlow.md

---

## 1. Stack

```text
Frontend        React + JavaScript + Vite
Styling         Tailwind CSS + shadcn/ui
Backend/DB/Auth Supabase (PostgreSQL + Auth + Row Level Security)
Serverless      Supabase Edge Functions — AI only
AI              Google Gemini API
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
                   |-- /api/ai/ask --> Gemini API (session verified)
```

The Gemini API key exists only inside the serverless function, never in frontend code.

The frontend communicates with PostgreSQL through the Supabase client, which enforces Row Level Security.

---

## 3. Entities

```text
User -- Clients -- Projects -- Tasks / Invoices
```

Full table definitions live in `Schema.md`.

---

## 4. Data Ownership

`clients` and `projects` tables have a `user_id` column referencing `auth.users`.

`tasks` and `invoices` tables do **not** have a `user_id` column. Their ownership is established strictly through:

- `tasks.project_id -> projects.user_id`
- `invoices.project_id -> projects.user_id`

Ownership is enforced primarily by **Supabase RLS policies** (row-level, DB-enforced) rather than manual backend checks. For `tasks` and `invoices`, RLS policies verify ownership by joining through the parent project (`projects.user_id = auth.uid()`).

A query for another user's data returns nothing, regardless of the request.

---

## 5. Business Rules

- Project status: `Planning` / `Active` / `Completed`.
- Every project belongs to a client.
- Every task and invoice belongs to a project.
- When editing a task or invoice, reassignment to another project owned by the authenticated user is allowed via a project dropdown. Reassigning to another user's project is strictly prohibited.
- Task due dates are required.
- Invoice amounts must be positive.
- Invoice status is `Paid` / `Unpaid`.
- Currency is fixed to INR.
- No cascade deletes.
- A client with linked projects cannot be deleted.
- A project with linked tasks or invoices cannot be deleted (tasks/invoices can be deleted or reassigned to another project first).
- Completed tasks/projects are excluded from incomplete/active counts.
- Financial totals are always computed live from invoice records, never cached.
- AI responses use only the authenticated user's data.

---

## 6. Dashboard Logic

The dashboard features exactly 3 summary cards:

1. **Active Projects** = projects where status = Active
2. **Upcoming Deadlines** = incomplete tasks (`is_done = false`) due from today through today + 7 days (`today <= due_date <= today + 7 days`)
3. **Total Unpaid** = SUM(amount) where invoice status = Unpaid (`is_paid = false`)

**Overdue Tasks** = incomplete tasks where `due_date < today`. These are displayed as a distinct list/indicator on the dashboard (pinned to the top of deadlines, styled in red) rather than as a fourth summary card.

All dashboard values are computed live via Supabase queries at request time and never cached.

---

## 7. Overload Warning

An informational warning banner triggered when:

- There are at least **3 incomplete tasks** (`is_done = false`).
- Tasks are spread across at least **2 distinct Active projects** (tasks belonging to `Planning` or `Completed` projects do not count).
- Task due dates fall inside a rolling **3-day window**, precisely defined as:
  - **Today**, **today + 1 day**, and **today + 2 days** (`today <= due_date <= today + 2 days`).
- Overdue tasks from before today (`due_date < today`) do **NOT** count toward the overload calculation.

The calculation is performed client-side from data already fetched for the dashboard.

It must not:

- Block task creation.
- Block project creation.
- Change project status.
- Modify data.

The warning is informational only.

---

## 8. AI Assistant

The AI assistant is read-only in v1.

```text
Question
  -> Serverless function (/api/ai/ask)
  -> Verify session
  -> Fetch user's data using service role key server-side
  -> Build context using instructions, data, and question
  -> Send context to Gemini API
  -> Return answer
```

### AI Rules

- Processing occurs only server-side.
- The Gemini API key is never exposed to the frontend.
- AI is scoped only to the current authenticated user's data.
- AI cannot create records.
- AI cannot edit records.
- AI cannot delete records.
- AI must not invent missing information.
- AI failures must surface a clear error.
- No chat history is stored in v1.
- AI requests are stateless.
- No user's data can enter another user's AI context.
- Every data fetch must be scoped to the authenticated user.

---

## 9. Security

- Supabase Auth is required for all private data.
- RLS is the primary ownership-check mechanism.
- Manual per-request backend checks are not required for normal CRUD.
- Passwords are handled entirely by Supabase Auth.
- Gemini API and service-role keys live only in serverless function environment variables.
- `.env` files must never be committed.
- User sessions are verified for `/api/ai/ask` before any data fetch or AI call.
- Every data fetch is scoped to the authenticated user.
- One user's data must never enter another user's AI context.
- The frontend must never receive the Supabase service-role key.
- Rate limiting may be added to the AI endpoint later.

---

## 10. API Surface

Standard CRUD operations for Clients, Projects, Tasks, Invoices, and Dashboard data use direct Supabase client calls from the frontend.

No hand-written REST routes are required for CRUD operations.

Only one custom endpoint exists, serverless:

```text
POST /api/ai/ask

Body: { question }

Returns: { answer }

(Authenticated via user session JWT)
```

Column-level definitions (types, constraints, nullability) for every entity are in `Schema.md`. There is no separate custom API request/response shape to define beyond that, since CRUD goes directly through the Supabase client library against these tables rather than through hand-written endpoints.

---

## 11. Code Structure

```text
src/
  |-- components/
  |-- pages/
  |-- layouts/
  |-- hooks/
  |-- utils/
  |-- lib/
  |     `-- supabaseClient.js

supabase/
  |-- migrations/     (versioned SQL schema)
  |-- policies/       (RLS definitions)
  `-- functions/
        `-- ai-ask/
```

### File Extensions

Use JavaScript files:

```text
.js   -> JavaScript logic
.jsx  -> React components
```

### Code Organization

Keep business logic such as:

- Overload calculations
- Dashboard aggregation
- Invoice calculations
- Date filtering
- Validation helpers

inside `src/lib/` or `src/utils/`.

Do not place complex business logic directly inside UI components.

---

## 12. Testing

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
10. AI data isolation.
11. Invalid-input handling.

Correctness and isolation matter more than test count.

---

## 13. Development

```bash
npm install

npm run dev

supabase db push

supabase functions deploy ai-ask

npm test

npm run build
```

Use:

- JavaScript
- ESLint
- Prettier
- Fail-fast environment variable validation

---

## 14. Environment Variables

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY=   # server-side only
GEMINI_API_KEY=              # server-side only
```

Only the two `VITE_` keys are safe in the frontend bundle:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

All other keys must remain server-side.

---

## 15. Future Compatibility

Room for:

- PWA support
- Mobile responsiveness
- Offline storage
- Data export/import
- Calendar integration
- Client portal
- Team collaboration
- AI write actions
- Advanced analytics
- Invoice PDF generation
- Migration to a dedicated Express/Prisma backend if RLS becomes limiting

None of these features should complicate the v1 MVP.

---

## 16. Technical Principle

> **Build the simplest architecture that keeps freelancer data secure, deadlines visible, invoices accurate, and the application maintainable.**
