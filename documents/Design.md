# Design.md — WORKLEDGER

Visual and interaction design system. Built on Tailwind CSS + shadcn/ui. This is the reference for how screens described in AppFlow.md should actually look and behave. Tokens and component treatments below reflect the approved Final Design System (deep pine/ink teal, flat/bordered surfaces, data-dense layout) — not generic shadcn/Tailwind defaults.

## 1. Design Principles

- **Calm, not busy.** This is a tool a freelancer checks daily; it should feel like a clean desk, not a dashboard full of gauges.
- **Status at a glance.** Color and typography should let the user understand "am I okay?" in under 3 seconds on the Main Dashboard.
- **Warnings are noticeable, not alarming.** The Overload Warning should stand out without feeling like an error state — it's a heads-up, not a failure.
- **Dense where it helps, spacious where it matters.** Lists (tasks, invoices) can be compact; the dashboard's key numbers get room to breathe.
- **Professional and editorial, not "AI SaaS."** Flat surfaces, borders over shadows, restrained color, strong typography — the product should read as a deliberately designed business tool, not a template dashboard. No gradients, no glassmorphism, no glow/pulse effects, no decorative illustrations.

## 2. Design Tokens (Color System)

Approved final palette — fixed set, no additional accent colors without a clear functional reason.

| Token | Value | Usage |
|---|---|---|
| `--background` | `#FAFAF8` | page background |
| `--foreground` | `#14161A` | primary text |
| `--muted` | `#6B7078` | secondary text, muted labels |
| `--border` | `#E3E1DC` | dividers, card borders, table rules |
| `--card` | `#FFFFFF` | card/panel backgrounds |
| `--primary` | `#1F3D3A` | primary actions, active nav indicator, links |
| `--status-overdue` | `#C23B22` | overdue tasks, unpaid invoice indicator |
| `--status-paid` | `#2F6E4F` | paid invoices, active/healthy indicators |
| `--status-warning` | `#8A6508` | Overload Warning only — reserved exclusively for this |

Project status (Planning / Active / Completed) uses `--muted`, `--primary`, and `--status-paid` respectively, expressed as text + left-border, not filled pills (see Section 5).

No gradients anywhere. No color is reused decoratively — red, gold, and green each mean exactly one thing throughout the app.

## 3. Typography

- **Headings / display:** Archivo, 600–700 weight.
- **Body / UI text:** Inter.
- **Financial / numeric data:** JetBrains Mono, used selectively — invoice amounts, dates, and counts where alignment and precision matter. Not used for general body text.
- **Scale:**
  - Page titles: `text-2xl font-semibold` (Archivo)
  - Section headers (e.g. "Upcoming Deadlines"): `text-lg font-medium` (Archivo)
  - Body / list items: `text-sm` (Inter)
  - Muted/secondary text (dates, client names under project names): `text-xs` (Inter), `var(--muted)`
  - Financial figures (Total Unpaid, invoice amounts, task counts): `text-xl font-medium tabular-nums` (JetBrains Mono) — not oversized hero-stat treatment.

No paid fonts. All three are freely available (Google Fonts / open license).

## 4. Layout

- **Shell:** persistent left sidebar (desktop), flat (no shadow, `1px solid var(--border)` right edge), with nav items in fixed order: Dashboard, Clients, Projects, Tasks, Invoices, AI Assistant, Logout. Collapses to a bottom tab bar or hamburger drawer on mobile.
- **Spacing system:** strict 8px base unit — 4/8/16/24/32/48px only. No arbitrary padding values.
- **Grid:** 12-column grid for dashboard and list layouts. Summary cards use `grid-cols-1 md:grid-cols-3 gap-4`, collapsing to 1 column on mobile.
- **Max content width:** `max-w-6xl mx-auto` on main content area, so the app doesn't stretch uncomfortably wide on large monitors.
- **Radius:** 4–6px consistently across all components — never `rounded-2xl`/`rounded-3xl`.
- **Shadows:** none on static content (cards, rows, panels). Reserved only for true overlays — modals, dropdowns, popovers. Static hierarchy is communicated through borders, spacing, and dividers, not elevation.

## 5. Core Components (shadcn/ui primitives to use)

| UI need | shadcn/ui component | Treatment |
|---|---|---|
| Buttons | `Button` (variants: default, outline, destructive, ghost) | Flat fill or outline, 4–6px radius, no gradient |
| Client/Project/Task/Invoice forms | `Dialog` (modal) or `Sheet` (slide-over) + `Input`, `Textarea`, `Select` (includes Project selector for reassigning tasks/invoices) | Flat, bordered, no shadow beyond the overlay itself |
| Status indicator | `Badge`, `outline` variant | Text label + thin colored left border — not a solid filled pill |
| Project cards, dashboard summary cards | `Card` | Flat: `1px solid var(--border)`, no shadow, 4–6px radius |
| Task list rows | `Checkbox` + plain flex row, not a full DataTable (keeps it lightweight) | No per-task card wrapper — compact single-line rows |
| Clients table, Invoices | `Table` | Table-first, not card-first — especially for Invoices (ledger-style, with a totals row) |
| Confirm delete | `AlertDialog` | — |
| AI Assistant panel | `Sheet` (right-side slide-over) containing a scrollable message list + `Textarea`/`Input` + `Button` | Rectangular message containers (4–6px radius, not full pill bubbles), styled identically to the rest of the app |
| Toasts (save/delete confirmations) | `Sonner` or shadcn `Toast` | Flat, bordered, no glow |
| Nav | custom sidebar using `Button` (ghost variant) + `lucide-react` icons | Active state = left-border accent in `--primary` + bold text, not a filled/glowing pill |

## 6. Key Screen Patterns

### Dashboard summary cards
Exactly three flat, bordered `Card` components in a row (`1px solid var(--border)`, no shadow, 4–6px radius):
1. **Active Projects**: small muted label on top ("Active Projects", Inter), count below in JetBrains Mono (`text-xl font-medium tabular-nums`), `Briefcase` outline icon top-right.
2. **Upcoming Deadlines**: small muted label on top ("Upcoming Deadlines"), count (incomplete tasks due today through today + 7 days) in JetBrains Mono, `Clock` outline icon top-right. Overdue tasks are not a 4th card; they are pinned to the top of the Upcoming Deadlines list, flagged in `--status-overdue` text (not a filled background).
3. **Total Unpaid**: small muted label on top ("Total Unpaid"), formatted INR currency (`₹`) in JetBrains Mono, `DollarSign` (or Indian Rupee) outline icon top-right.

None of the three cards use oversized hero-stat styling — figures stay at the restrained `text-xl font-medium tabular-nums` scale defined in Section 3.

### Overload Warning banner
Bordered notice bar, no background fill: `border-left: 4px solid var(--status-warning)`, with a small warning icon (`TriangleAlert`, outline style, lucide-react) and a one-line message in Inter (triggered by ≥3 incomplete tasks across ≥2 distinct `Active` projects due within today, today + 1, or today + 2; overdue tasks excluded). Dismissible for the session (not permanently) via a small "×" — reappears next login if the condition still holds.

### Project status pipeline (Projects Dashboard)
Three columns (Planning / Active / Completed) as a simple responsive layout — `grid-cols-1 md:grid-cols-3` — each column a vertical stack of flat, bordered project `Card`s (no shadow). A status `Select` dropdown on each card is used for v1 to keep interactions simple and dependable without requiring a drag-and-drop library.

### Task rows
Compact flex row, no card wrapper: `Checkbox` — title (strikethrough + muted when done, Inter) — due date (right-aligned, `--status-overdue` if overdue, JetBrains Mono) — row actions (edit/delete icons, outline style). Editing opens a dialog allowing changes to title, due date, and **Project reassignment** (via `Select` dropdown of user's projects).

### Invoices — table-first
A `Table`, not a card or row list: columns for amount (JetBrains Mono, right-aligned), date, project, paid/unpaid status (`Badge`, outline variant, left-border colored — paid in `--status-paid`, unpaid in `--status-overdue`, clickable to toggle), row actions. A totals row at the bottom styled like a ledger close-out (`border-top: 2px solid var(--foreground)`, bold JetBrains Mono total). This applies to both the inline Project Detail invoices section and the global Invoices screen. Editing opens a dialog allowing changes to amount, date, paid status, and **Project reassignment** (via `Select` dropdown of user's projects).

### AI Assistant panel
Right-side `Sheet`, ~400px wide on desktop, full-screen on mobile, containing a scrollable message list + `Textarea`/`Input` + `Button`. Message containers are rectangular (4–6px radius, `1px solid var(--border)`), not pill-shaped bubbles. User and assistant messages are both styled with WorkLedger's own palette (`--primary` for user messages, `--card`/`--border` for assistant messages) — no purple, no gradient, no sparkle or magic-wand iconography anywhere in this panel. Suggested-question chips are outline `Button`s (size sm) matching the rest of the app's button style, shown above the input when the conversation is empty. The panel should read as a feature *of* WorkLedger, not a bolted-on third-party AI widget.

## 7. Empty States

Consistent pattern across Clients, Projects, Tasks, Invoices: centered outline icon (muted, lucide-react) + one-line message (Inter) + a single primary `Button` to create the first item. No illustrations/graphics needed — keep it simple and on-brand with the rest of the app's restraint.

## 8. Responsive Behavior

- Breakpoint strategy: mobile-first, `md:` (768px) as the primary breakpoint where sidebar nav appears and multi-column grids activate.
- Tables (Clients list, Invoices) collapse to stacked bordered rows below `md`.
- AI Assistant `Sheet` goes full-screen below `md`.

## 9. Motion

Minimal and functional only: 150–200ms ease transitions on hover, focus, and toggle state changes. No entrance animations, no scroll-triggered reveals, no hover-lift on static cards, no pulsing or glowing effects anywhere in the app.

## 10. Accessibility Notes

- All status color coding (Badge, banner) must pair color with text/icon, never color alone.
- The approved palette (`--primary` `#1F3D3A` on `--background` `#FAFAF8`, `--foreground` `#14161A` on `--card` `#FFFFFF`, and all three status colors) must be verified at implementation time to meet 4.5:1+ contrast against their respective backgrounds before shipping — the earlier Tailwind-default palette met this bar, and the new palette must be checked against the same standard rather than assumed.
- Interactive elements (Checkbox, Badge toggles) need visible focus states — shadcn/ui's defaults handle this; don't override focus rings.
- Form inputs always have associated `Label` components, not placeholder-only labeling.