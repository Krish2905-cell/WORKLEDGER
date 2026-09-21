# Design.md — WORKLEDGER

Visual and interaction design system. Built on Tailwind CSS + shadcn/ui. This is the reference for how screens described in AppFlow.md should actually look and behave.

## 1. Design Principles

- **Calm, not busy.** This is a tool a freelancer checks daily; it should feel like a clean desk, not a dashboard full of gauges.
- **Status at a glance.** Color and typography should let the user understand "am I okay?" in under 3 seconds on the Main Dashboard.
- **Warnings are noticeable, not alarming.** The Overload Warning should stand out without feeling like an error state — it's a heads-up, not a failure.
- **Dense where it helps, spacious where it matters.** Lists (tasks, invoices) can be compact; the dashboard's key numbers get room to breathe.

## 2. Color System

Using Tailwind's default palette + shadcn/ui theming tokens (CSS variables), so light/dark mode both work out of the box.

| Token | Usage | Light | Dark |
|---|---|---|---|
| `background` | page background | white / `slate-50` | `slate-950` |
| `foreground` | primary text | `slate-900` | `slate-50` |
| `primary` | primary actions, active nav item | `indigo-600` | `indigo-500` |
| `muted` | secondary text, borders | `slate-500` | `slate-400` |
| `card` | card/panel backgrounds | white | `slate-900` |

**Semantic colors** (status + alerts — kept consistent everywhere they appear):

| Meaning | Color | Used for |
|---|---|---|
| Planning | `slate-400` (neutral gray pill) | Project status pill |
| Active | `blue-500` | Project status pill |
| Completed | `green-500` | Project status pill |
| Overdue / unpaid | `red-500` / `red-50` bg | Overdue task rows, unpaid invoice badges |
| Paid | `green-600` | Paid invoice badge |
| Warning (Overload) | `amber-500` / `amber-50` bg | Overload Warning banner only — reserve amber exclusively for this so it keeps its meaning |

Do not reuse amber/red for anything decorative — the moment the user sees red or amber anywhere in the app, it should mean "this needs attention."

## 3. Typography

- **Font:** Inter (system-ui fallback) — comes free with Tailwind's default font stack, no extra loading needed.
- **Scale:**
  - Page titles: `text-2xl font-semibold`
  - Section headers (e.g. "Upcoming Deadlines"): `text-lg font-medium`
  - Body / list items: `text-sm`
  - Muted/secondary text (dates, client names under project names): `text-xs text-muted-foreground`
- Numbers that matter (Total Unpaid, deadline counts) get `text-3xl font-bold tabular-nums` on the dashboard summary cards — these are the numbers a freelancer glances at first.

## 4. Layout

- **Shell:** persistent left sidebar (desktop) with nav items, in fixed order — Dashboard, Clients, Projects, Tasks, Invoices, AI Assistant, Logout at the bottom. Collapses to a bottom tab bar or hamburger drawer on mobile.
- **Max content width:** `max-w-6xl mx-auto` on main content area, so the app doesn't stretch uncomfortably wide on large monitors.
- **Grid:** Dashboard summary cards use a 3-column grid (`grid-cols-1 md:grid-cols-3 gap-4`), collapsing to 1 column on mobile.
- **Spacing rhythm:** sections separated by `space-y-6` / `space-y-8`; card internal padding `p-4` to `p-6`.

## 5. Core Components (shadcn/ui primitives to use)

| UI need | shadcn/ui component |
|---|---|
| Buttons | `Button` (variants: default, outline, destructive, ghost) |
| Client/Project forms | `Dialog` (modal) or `Sheet` (slide-over) + `Input`, `Textarea`, `Select` |
| Status pill | `Badge` (custom color per status via className) |
| Project cards, dashboard summary cards | `Card` |
| Task list rows | `Checkbox` + plain flex row, not a full DataTable (keeps it lightweight) |
| Clients table | `Table` |
| Confirm delete | `AlertDialog` |
| AI Chat panel | `Sheet` (right-side slide-over) containing a scrollable message list + `Textarea`/`Input` + `Button` |
| Toasts (save/delete confirmations) | `Sonner` or shadcn `Toast` |
| Nav | custom sidebar using `Button` (ghost variant) + `lucide-react` icons |

## 6. Key Screen Patterns

### Dashboard summary cards
Three `Card` components in a row, each with: small muted label on top ("Active Projects"), big bold number below, optional small icon top-right (lucide-react: `Briefcase`, `Clock`, `DollarSign`).

### Overload Warning banner
Full-width banner directly under the page header, `bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-4`, with a small warning icon (`TriangleAlert` from lucide-react) and a one-line message. Dismissible for the session (not permanently) via a small "×" — reappears next login if the condition still holds.

### Project status pipeline (Projects Dashboard)
Three columns (Planning / Active / Completed) as a simple responsive layout — `grid-cols-1 md:grid-cols-3` — each column a vertical stack of project `Card`s. Full drag-and-drop is a nice-to-have, not required for v1; a status `Select` dropdown on each card is an acceptable and simpler alternative.

### Task rows
Compact flex row: `Checkbox` — title (strikethrough + muted when done) — due date (right-aligned, red text if overdue) — row actions (edit/delete icons, shown on hover on desktop, always visible on mobile).

### Invoice rows
Similar compact row: amount (bold) — date — `Badge` for Paid (green) / Unpaid (red, clickable to toggle) — row actions.

### AI Chat panel
Right-side `Sheet`, ~400px wide on desktop, full-screen on mobile. Message bubbles: user messages right-aligned with `bg-primary text-primary-foreground`, assistant messages left-aligned with `bg-muted`. Suggested-question chips shown as small `Button` (outline, size sm) above the input when the conversation is empty.

## 7. Empty States

Consistent pattern across Clients, Projects, Tasks, Invoices: centered icon (muted, large, lucide-react) + one-line message + a single primary `Button` to create the first item. No illustrations/graphics needed — keep it simple and on-brand with the rest of the app's restraint.

## 8. Responsive Behavior

- Breakpoint strategy: mobile-first, `md:` (768px) as the primary breakpoint where sidebar nav appears and multi-column grids activate.
- Tables (Clients list) collapse to stacked cards below `md`.
- AI Chat `Sheet` goes full-screen below `md`.

## 9. Accessibility Notes

- All status color coding (Badge, banner) must pair color with text/icon, never color alone (already satisfied by the patterns above).
- Interactive elements (Checkbox, Badge toggles) need visible focus states — shadcn/ui's defaults handle this; don't override focus rings.
- Form inputs always have associated `Label` components, not placeholder-only labeling.