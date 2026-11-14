# ImplementationPlan.md — WORKLEDGER

A phased build order. Each phase produces something runnable/demoable before moving to the next — no phase should leave the app in a broken state for long. Built against the finalized stack: React + JavaScript + Vite, Tailwind + shadcn/ui, Supabase (Postgres + Auth + RLS), Supabase Edge Functions for AI, Gemini API, Vercel deployment.

## Phase 0 — Project Setup

- Initialize Vite + React (JavaScript) project.
- Install Tailwind CSS, configure `tailwind.config.js`.
- Install and initialize shadcn/ui.
- Create Supabase project; grab `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Set up `.env` (never committed) and `src/lib/supabaseClient.js`.
- Set up ESLint + Prettier.
- Push empty repo to GitHub.
- **Done when:** blank app runs locally (`npm run dev`) and successfully pings Supabase (e.g. a trivial auth session check with no errors).

## Phase 1 — Auth

- Build Login and Signup screens (per AppFlow.md Section 2).
- Wire up Supabase Auth: signup, login, logout, session persistence.
- Add protected-route wrapper — redirect unauthenticated users to `/login`.
- Add Forgot Password flow (Supabase default reset-link flow).
- **Done when:** a user can sign up, get redirected to an (empty) dashboard, log out, and log back in. Unauthenticated access to `/dashboard` correctly redirects to `/login`.

## Phase 2 — Database Schema + RLS

- Write SQL migrations for `clients`, `projects`, `tasks`, `invoices` exactly per Schema.md (UUID PKs, `ON DELETE RESTRICT` on all four FK relationships, `NOT NULL` on `tasks.due_date`, CHECK constraints on `amount > 0` and `status` enum; NO `user_id` on `tasks` or `invoices`).
- Apply RLS policies on all four tables (direct `user_id` check on `clients`/`projects`; join-through-`projects.user_id` check on `tasks`/`invoices`, ensuring update policies on `tasks`/`invoices` also check that new `project_id` belongs to `auth.uid()`).
- Run `supabase db push` and confirm migrations apply cleanly.
- Manually test RLS in the Supabase SQL editor: confirm a query as User A cannot see User B's rows.
- **Done when:** schema is live, RLS is verified working via manual test, and this is the single source of truth going forward — no more schema changes without a new migration.

## Phase 3 — Clients CRUD

- Build Clients List, Add/Edit Client form, Client Detail screen (per AppFlow.md Section 4).
- Wire directly to Supabase client library — no custom backend route.
- Implement delete-blocked-by-projects rule (client with projects cannot be deleted).
- **Done when:** a logged-in user can create, view, edit, and delete clients (except when projects exist), and the empty state renders correctly with zero clients.

## Phase 4 — Projects CRUD + Status Pipeline

- Build Projects Dashboard (Planning/Active/Completed columns), Add/Edit Project form, Project Detail screen shell (per AppFlow.md Section 5, Design.md Section 6).
- Implement status changes (dropdown on project card).
- Implement delete-blocked-by-tasks/invoices rule (**no cascade deletes** — confirmed in Phase 2 schema).
- **Done when:** a user can create a project under a client, move it through all three statuses, and deletion is correctly blocked once it has tasks or invoices.

## Phase 5 — Tasks + Invoices CRUD

- Build Tasks section within Project Detail: add task (title + required due date), toggle done/not done, edit (including Project reassignment dropdown populated with user's projects), delete.
- Build Invoices section within Project Detail: add invoice (amount, date, paid/unpaid), toggle paid status, edit (including Project reassignment dropdown populated with user's projects), delete.
- Add the standalone **Tasks** and **Invoices** nav screens (global, cross-project list/filter views) — these query the same tables with a join to `projects` for the project name column, no schema change required.
- **Done when:** full task and invoice lifecycle works both from within a Project Detail page and from the global Tasks/Invoices screens (including moving items between projects), and both stay in sync (same underlying data).

## Phase 6 — Main Dashboard

- Build summary cards (exactly 3): Active Projects, Upcoming Deadlines (`today <= due_date <= today + 7`), Total Unpaid — all computed live via Supabase queries (per Schema.md Section 8 / TechSpec.md Section 6), never cached.
- Build Active Projects list and Upcoming Deadlines list (overdue tasks visually flagged in red and pinned to top).
- **Done when:** dashboard numbers are demonstrably correct against seeded test data (e.g. seed 2 clients, 3 projects, several tasks/invoices, and manually verify each number).

## Phase 7 — Overload Warning

- Implement the exact condition from TechSpec.md Section 7 / Schema.md Section 8: ≥3 incomplete tasks, spanning ≥2 distinct Active projects, within the rolling 3-day window (`today <= due_date <= today + 2 days`). Overdue tasks (`due_date < today`) do not count.
- Compute client-side from data already fetched for the dashboard (no new backend call).
- Build the warning banner (Design.md Section 6) — session-dismissible, reappears next login if condition still holds.
- **Done when:** the warning correctly appears and disappears against several manually-constructed test scenarios (cluster present, cluster absent, cluster in only one project — should NOT trigger).

## Phase 8 — AI Chat Assistant

- Build the `/api/ai/ask` Supabase Edge Function: verify session → fetch user's data with the service-role key (server-side only) → build context → call Gemini API → return answer.
- Build the AI Chat panel UI (slide-over `Sheet`, per Design.md Section 6) with suggested-question chips on empty state.
- Enforce: read-only, no cross-user data, clear error surfaced on AI service failure, no chat history persistence required.
- **Done when:** the assistant correctly answers the five example questions from TechSpec.md Section 9 against seeded test data, and cannot access another test user's data (verify with two accounts).

## Phase 9 — Testing Pass

- Follow the priority order from TechSpec.md Section 13: RLS isolation first, then CRUD, then delete-blocking, then overdue/unpaid calculations, then overload warning, then AI isolation, then invalid-input handling.
- Write Vitest tests for the pure business-logic utilities (overload calculation, dashboard aggregation, date filtering) living in `src/lib`/`src/utils` — these are the easiest to test in isolation and the most likely to have off-by-one bugs (e.g. "due today" boundary, rolling window edges).
- **Done when:** the Section 13 priority list has at least one passing test each, with RLS isolation and delete-blocking tests given the most scrutiny (per TechSpec.md: "the one thing that's genuinely dangerous to get wrong").

## Phase 10 — Polish + Deployment

- Responsive pass across all screens (Design.md Section 8).
- Empty states pass (Design.md Section 7 / AppFlow.md Section 9).
- Environment variable validation — fail fast on missing keys (TechSpec.md Section 14).
- Deploy frontend to Vercel, confirm the AI Edge Function is deployed (`supabase functions deploy ai-ask`).
- Final smoke test on the deployed URL: signup → full CRUD loop → dashboard → AI chat.
- **Done when:** the deployed app, not just localhost, passes the full smoke test end to end.

## Sequencing Notes

- Phases 0–2 are strictly sequential (can't build UI against a schema that doesn't exist yet).
- Phases 3–5 (Clients → Projects → Tasks/Invoices) follow the natural FK dependency order — you can't create a project without a client, or a task without a project.
- Phase 6 (Dashboard) depends on Phases 3–5 being functional, since it aggregates their data.
- Phase 7 (Overload Warning) depends on Phase 6's task-fetching logic already being in place.
- Phase 8 (AI Chat Assistant) depends on Phase 6 because it uses the same user data for context.
- Phase 9 (Testing) is written as a single late phase here for clarity, but in practice, write tests for each phase's business logic as you finish that phase, not all at the end — the plan groups it at the end only to describe *coverage priority*, not literal timing.
