# WORKLEDGER — Rules

**Version:** 1.0
**Status:** Draft

## 1. General

* WorkLedger is a single-user-per-account freelancer business tracker.
* Keep the application simple; do not add features without a reason.
* Web (desktop + responsive) is the primary platform.
* Data correctness (ownership, deadlines, invoice status) is more important than UI polish.
* Do not introduce unnecessary libraries, services, or architecture.
* JavaScript only — no TypeScript, no `.ts`/`.tsx` files. This is a deliberate scope decision, not an oversight.

---

## 2. Stack

* No custom Express/Node backend for CRUD.
* No ORM (no Prisma, no Drizzle).
* Frontend talks to Supabase directly via its client library.
* Only two custom endpoints exist: `/api/ai/ask` and `/api/reminders/run`, both Supabase Edge Functions.
* Do not add a new backend endpoint without first checking whether Supabase client + RLS can do it instead.

---

## 3. Clients, Projects, Tasks, Invoices

* A client is a business relationship — never a login.
* A project always belongs to exactly one client.
* A task always belongs to exactly one project.
* An invoice always belongs to exactly one project.
* Project status is one of: `Planning`, `Active`, `Completed` — nothing else.
* Task due dates are required, never optional.
* Invoice amounts must be greater than `0`.
* Invoice currency is fixed to INR — no per-invoice currency field.

---

## 4. Deleting

```text
Client with linked projects   → deletion BLOCKED
Project with linked tasks     → deletion BLOCKED
Project with linked invoices  → deletion BLOCKED
```

* No cascade deletes, anywhere, ever, in v1.
* Deleting a client or project must never silently delete its children.
* The UI must guide the user to remove/reassign children first — never delete-and-hope.

---

## 5. Dashboard Numbers

```text
Active Projects   = projects where status = Active
Upcoming Tasks    = incomplete tasks due within 7 days
Overdue Tasks     = incomplete tasks where due_date < today
Total Unpaid      = SUM(amount) where invoice status = Unpaid
```

* Always computed live from Supabase queries.
* Never cached, never stored, never stale-on-purpose.

---

## 6. Overload Warning

Trigger condition, exact:

```text
incomplete tasks >= 3
AND
those tasks span >= 2 distinct ACTIVE projects
AND
all fall within the same rolling 3-day window
```

* Do not loosen this to "any project status" — Planning/Completed projects never count toward the trigger.
* Computed client-side from data already fetched for the dashboard.
* Must never block task creation, block project creation, change project status, or modify data. Informational only.

---

## 7. Database

* PostgreSQL is the source database, via Supabase.
* No ORM — schema lives in `supabase/migrations/` as plain SQL.
* Database changes must use migrations, never a hand-edit in the Supabase dashboard.
* Use foreign keys for every relationship.
* All foreign keys use `ON DELETE RESTRICT` — never `CASCADE`.
* `tasks` and `invoices` have no `user_id` column — ownership is checked by joining through `projects.user_id`.
* Row Level Security is enabled on every table and is the primary ownership-check mechanism — not a backup to application code.

---

## 8. Backend (Edge Functions only)

* Frontend never connects directly to PostgreSQL — only through the Supabase client, which enforces RLS.
* `/api/ai/ask` and `/api/reminders/run` must verify the user's session before doing anything else.
* Never trust frontend validation alone — Edge Functions must not assume the caller already checked inputs.
* Business logic for AI context-building and reminder filtering belongs inside the Edge Function, not scattered across the frontend.
* Never expose database errors, stack traces, or secrets to the client.

---

## 9. AI Assistant

```text
Question
   ↓
/api/ai/ask (Edge Function)
   ↓
Verify session
   ↓
Fetch data scoped to auth.uid() only
   ↓
Claude API
   ↓
Answer
```

* Read-only. No AI code path may create, edit, or delete records — not even as an experiment.
* The Anthropic API key must never reach frontend code.
* Data passed into the AI's context must always be filtered by the current user — one unscoped query here is a real cross-account leak, not a cosmetic bug.
* On API failure, show a clear in-UI error. Never fail silently, never fabricate an answer from stale data.
* No chat history persistence required in v1.

---

## 10. Email Reminders

* Only `/api/reminders/run` may send email — no other code path calls Resend/SendGrid.
* Query: incomplete tasks where `due_date <= today + 2 days` (this naturally includes overdue tasks — no separate overdue branch needed).
* Skip the user entirely if nothing qualifies that day.
* One summary email per user per day — never one email per task.
* Email credentials live only in that function's environment.

---

## 11. Frontend

* Keep components small and reusable.
* Keep business logic out of UI components — overload calculation, dashboard aggregation, overdue detection, and date-window filtering live in `src/lib/` or `src/utils/` as small, testable functions.
* Always handle loading, empty, and error states.
* Prevent duplicate submissions (double-click on Add/Save).
* Match Design.md's component mapping — status pills are always `Badge`, confirm-deletes are always `AlertDialog`, never a raw `window.confirm()`.
* Amber is reserved exclusively for the Overload Warning; red always means overdue/unpaid — never repurposed decoratively elsewhere.
* Sidebar nav order is fixed: `Dashboard, Clients, Projects, Tasks, Invoices, AI Assistant, Logout`.

---

## 12. Security

* Passwords are never stored or handled manually — Supabase Auth owns credential storage.
* Never commit secrets or `.env`.
* Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` may appear in frontend-accessible env vars.
* `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `ANTHROPIC_API_KEY` are server-side only, inside Edge Functions.
* Validate ownership at the database layer (RLS), not just in application code.
* Never expose database credentials or the service-role key to the frontend.
* One user's data must never enter another user's AI context.

---

## 13. Code Quality

* Use JavaScript, not TypeScript.
* Use meaningful names.
* Avoid duplicated logic.
* Remove unused code and dependencies.
* Prefer simple solutions over clever ones.
* Use Vitest for tests — don't introduce Jest or another runner.

---

## 14. Before Adding a Feature

Ask:

```text
Does it solve a real problem?
        ↓
Does it fit WorkLedger's purpose?
        ↓
Can it be implemented simply, within the existing stack?
        ↓
Will it affect data ownership, deadlines, or invoice correctness?
```

If the feature adds complexity without meaningful value, don't add it. If it isn't covered by any doc (PRD/TechSpec/AppFlow/Schema), flag that it's undocumented before building it — the docs and the code should never quietly drift apart.

---

## 15. Core Principle

> **WorkLedger should remain a simple, reliable freelancer tracker — not become a project-management platform.**