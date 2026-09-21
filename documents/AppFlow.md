# AppFlow.md — WORKLEDGER

Screen-by-screen user flow. This describes what the user sees and does, and how screens connect — not implementation details (see TechSpec.md for that).

## 1. Flow Map (high level)

```mermaid
flowchart TD
    A[Landing / Login] -->|new user| B[Signup]
    A -->|existing user| C[Login]
    B --> D[Main Dashboard]
    C --> D[Main Dashboard]
    D --> E[Clients List]
    D --> F[Projects Dashboard]
    D --> T[Tasks - global view]
    D --> V[Invoices - global view]
    D --> G[AI Assistant]
    E --> E1[Client Detail]
    E1 --> F1[Project Detail]
    F --> F1[Project Detail]
    F1 --> H[Tasks - inline on project]
    F1 --> I[Invoices - inline on project]
    T -.->|same underlying data| H
    V -.->|same underlying data| I
    D -->|deadline cluster detected| J[Overload Warning Banner]
    K[Scheduled Cron Job] -.->|daily, out of band| L[Reminder Email to User]
```

## 2. Auth Flow

**Entry point:** unauthenticated users land on `/login`.

1. **Login screen** — email + password fields, "Log in" button, link to Signup, link to "Forgot password."
2. **Signup screen** — email + password (+ confirm password), "Create account" button, link back to Login.
3. On successful login/signup → redirect to **Main Dashboard** (`/dashboard`).
4. On failed login → inline error message, stay on screen.
5. **Forgot password** → email input → Supabase sends reset link → user sets new password → redirect to Login.
6. Logout available from a persistent nav (top bar or sidebar) → clears session → redirect to `/login`.
7. All routes except `/login`, `/signup`, `/forgot-password` require an authenticated session; unauthenticated access redirects to `/login`.

## 3. Main Dashboard (`/dashboard`)

The landing page after login. Shows, top to bottom:

1. **Overload Warning banner** (only rendered if a cluster is detected) — e.g. "⚠ 4 tasks due within 3 days across 3 projects." Clicking it scrolls to / filters the Upcoming Deadlines section.
2. **Summary cards** (3 across on desktop, stacked on mobile):
   - Active Projects (count)
   - Upcoming Deadlines (count, next 7 days)
   - Total Unpaid (sum, currency-formatted)
3. **Active Projects list** — compact cards/rows: project name, client name, status pill, task progress (e.g. "3/7 done"), unpaid amount for that project. Clicking a project → Project Detail.
4. **Upcoming Deadlines list** — flat list of tasks due in next 7 days, sorted soonest first, each showing task title, due date, and parent project name (clickable → Project Detail). Overdue tasks (past due, not done) are visually distinct (e.g. red) and shown at the top regardless of the 7-day window.
5. **Persistent nav** (sidebar or top bar) present on every authenticated screen, in fixed order: Dashboard, Clients, Projects, Tasks, Invoices, AI Assistant, Logout.
6. **AI Assistant entry point** — a nav item that opens the chat assistant (see Section 7).

## 4. Clients (`/clients`)

1. **Clients List** — table or card list of all clients: name, company, email. "Add Client" button top-right.
2. **Add/Edit Client** — modal or inline form: name (required), email, company, notes. Save → returns to Clients List with new/updated row visible.
3. **Client Detail** (`/clients/:id`) — shows client info plus a list of that client's projects (name, status, quick link). "Edit" and "Delete" actions.
4. **Delete Client** — if the client has any projects, deletion is blocked with a message: "This client has N project(s). Delete or reassign them first." If zero projects, confirm dialog → delete → return to Clients List.

## 5. Projects (`/projects`)

1. **Projects Dashboard** — all projects, grouped or filterable by status column (Planning / Active / Completed) — a simple kanban-style or filtered-list view (implementation choice left to Design.md). "Add Project" button.
2. **Add/Edit Project** — form: name (required), client (dropdown, required), status (dropdown, defaults to Planning). Save → appears in the pipeline at the correct status.
3. **Change status** — from the dashboard (e.g. drag between columns, or a status dropdown on the card) — Planning → Active → Completed. No forced order enforcement beyond the three defined states; user can move freely between any of the three.
4. **Project Detail** (`/projects/:id`) — the hub screen for one project:
   - Header: project name, client (link to Client Detail), status control, Edit/Delete project actions.
   - **Tasks section**: list of tasks (title, due date, done checkbox), "Add Task" inline form. Overdue/undone tasks visually flagged.
   - **Invoices section**: list of invoices (amount, date, paid/unpaid toggle), "Add Invoice" inline form.
5. **Delete Project** — if the project has any tasks or invoices, deletion is blocked with a message: "This project has tasks/invoices. Delete or reassign them first." (no cascade deletes in v1). If it has none, confirm dialog → delete → return to Projects Dashboard.

## 6. Tasks (`/tasks`) and Invoices (`/invoices`) — global screens, plus inline on Project Detail

Tasks and invoices are each manageable in two places, both reading/writing the same underlying data:

**Inline on Project Detail** (scoped to one project):
- Add task: title + due date → appears in the project's task list.
- Toggle done/not done: single click/checkbox, updates immediately (optimistic UI acceptable).
- Edit/delete task: via row actions (pencil/trash icon) on each task row.
- Add/edit/delete invoice the same way, in the Invoices section of Project Detail.

**Global Tasks screen** (`/tasks`, cross-project):
- Flat list of every task across every project, with the parent project name shown per row (clickable → Project Detail).
- Filter/sort by due date, done/not done, and project.
- Same add/toggle/edit/delete actions as the inline version — a change made here is immediately reflected inline on that task's Project Detail, and vice versa, since both read/write the same `tasks` table.

**Global Invoices screen** (`/invoices`, cross-project):
- Flat list of every invoice across every project, with the parent project name shown per row (clickable → Project Detail).
- Filter/sort by paid/unpaid status and date.
- Same add/toggle/edit/delete actions as the inline version, same underlying data as above.

Tasks feed the Main Dashboard's "Upcoming Deadlines" and the Overload Warning logic regardless of which screen was used to create/edit them.

## 7. AI Assistant

1. Opens as a **slide-over panel or modal** (not a full page navigation) so the user can ask a question without losing their place — accessible from any authenticated screen via nav item or floating button.
2. Simple chat UI: message history (user + assistant turns), text input, "Send" button.
3. On send: frontend sends the question to the backend; backend fetches the current user's Client/Project/Task/Invoice data from Supabase, packages it as context, and calls the Claude API; response streams or returns and is rendered in the chat panel.
4. Assistant answers only — no buttons to create/edit records from chat in v1.
5. Chat history does not need to persist across sessions in v1 (in-memory for the session is sufficient); persisting it is an acceptable stretch goal, not a requirement.
6. Empty state: a few suggested example questions shown before the user's first message (e.g. "How much am I owed?", "What's due this week?").

## 8. Automated Email Reminders (no UI screen — background flow)

1. A scheduled cron job runs daily (time TBD in TechSpec.md/ImplementationPlan.md).
2. For the single user, it queries tasks with due_date within the next N days (default 2) where is_done = false.
3. If the result set is non-empty, it sends one summary email (via Resend/SendGrid) listing each task, its due date, and its project name.
4. If the result set is empty, no email is sent that day.
5. This flow has no in-app screen; it is entirely automated and delivered outside the app (to the user's inbox).

## 9. Error / Empty States (applies across screens)

- **No clients yet**: Clients List shows an empty state with a prompt to add the first client.
- **No projects yet**: Projects Dashboard shows an empty state with a prompt to add the first project (disabled/hinted if no clients exist yet, since a project requires a client).
- **No tasks/invoices on a project**: Project Detail shows a lightweight empty state per section, not an error.
- **Global Tasks/Invoices screens with nothing yet**: same lightweight empty-state pattern, prompting the user to add a project first if none exist yet.
- **Dashboard with no active projects**: summary cards show zero states; no Overload Warning; Upcoming Deadlines shows "Nothing due — you're clear."
- **AI Assistant with no data at all**: assistant should say so plainly rather than fabricate an answer (e.g. "You don't have any projects yet, so I don't have anything to report on.").