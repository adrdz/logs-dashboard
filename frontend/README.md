# Frontend

Next.js 14 (App Router) · React 18 · TypeScript · MUI v5 · TanStack Query v5
· Storybook 10 · Playwright

---

## Folder structure

Each component lives in its **own folder** with its companion files colocated
(`.tsx`, `.css`, `.stories.tsx`, `index.ts`).

```
.storybook/                 # Storybook config + Vitest setup
e2e/                        # Playwright end-to-end specs (one per view/flow)
src/
├── styles/
│   ├── tokens.css          # CSS design tokens (:root + [data-theme="dark"])
│   └── globals.css         # imports tokens; base body + .app-main
├── app/
│   ├── layout.tsx          # root layout — anti-FOUC script, AppShell, Providers
│   ├── providers.tsx       # QueryClient + ThemeMode context + MUI ThemeProvider
│   ├── page.tsx            # "/" Summary (analytics dashboard)
│   ├── _components/        # Summary page view-local components
│   │   ├── SectionSummary/   # composite: cards block
│   │   └── SectionTrend/     # composite: interval controls + trend chart
│   ├── about/
│   │   └── page.tsx        # "/about" static page
│   └── logs/
│       ├── page.tsx
│       ├── _components/
│       │   └── TableLogs/        # single widget: DataGrid
│       └── [id]/page.tsx
├── components/
│   ├── layout/             # app shell / nav — AppShell/, Header/, Sidebar/, MobileMenu/, ThemeToggle/
│   ├── modal/              # ModalBase/, ModalCreateLog/
│   ├── form/               # input-collection components — Logs/, Filters/
│   └── info/               # display / data-visualization components
│       ├── chip/
│       │   └── Severity/   # ChipSeverity
│       └── chart/
│           ├── Trend/      # ChartTrend
│           └── Histogram/  # ChartHistogram
└── lib/
    ├── api.ts
    ├── constants.ts
    ├── theme.ts
    ├── types.ts
    └── hooks/
```

---

## Naming conventions

### Domain folders hold members; the barrel adds the prefix

Filenames within a domain are short and context-free. The `index.ts` barrel
names them with the domain prefix so call-sites are unambiguous:

```ts
// components/form/index.ts
export { default as FormLogs }    from "./Logs";
export { default as FormFilters } from "./Filters";
export type { FilterValues }      from "./Filters";

// components/info/chip/index.ts
export { default as ChipSeverity } from "./Severity";

// components/info/chart/index.ts
export { default as ChartTrend }     from "./Trend";
export { default as ChartHistogram } from "./Histogram";
```

**Never repeat the parent folder name in the filename.**

```
✓  form/Logs/Logs.tsx        → exported as FormLogs
✗  form/Logs/FormLogs.tsx    ← stutter — redundant
```

### Per-component folders

**Every component lives in its own folder**, holding its implementation plus
any companion files (`.css`, `.stories.tsx`) and an `index.ts` barrel. The
folder gives context; the filename stays short; the barrel adds the prefix.

```
form/
├── Logs/
│   ├── Logs.tsx
│   ├── Logs.stories.tsx
│   └── index.ts          # export { default as FormLogs } from "./Logs"
└── Filters/
    ├── Filters.tsx
    ├── Filters.stories.tsx
    └── index.ts

info/chart/
├── Trend/
│   ├── Trend.tsx
│   ├── Trend.stories.tsx
│   └── index.ts          # export { default as ChartTrend } from "./Trend"
└── Histogram/
    ├── Histogram.tsx
    ├── Histogram.stories.tsx
    └── index.ts
```

The category barrel (`info/chart/index.ts`) then just re-exports its members
(`export * from "./Trend"`).

### View-local naming (`_components/`)

Use `Section*` / `Panel*` / `Detail*` **only** for composites that bundle
several elements to simplify the parent page. Name single-widget extractions
after what they are:

```
app/logs/_components/
└── TableLogs/               ← single widget (DataGrid), named for what it is

app/_components/             ← Summary page ("/") view-local components
├── SectionSummary/          ← composite: summary cards block
└── SectionTrend/            ← composite: interval controls + trend chart
```

---

## Shared vs page-local components

| Where | Rule |
|---|---|
| `components/` | Used by ≥ 2 pages **or** a clear general reuse case |
| `app/.../  _components/` | Used exclusively by one page |

Start local. Promote to shared only after proven reuse.

---

## `//#region` code organization

Every component file uses VS Code–foldable region markers. Only include
sections that are non-trivial:

```tsx
//#region Imports … //#endregion
//#region Types … //#endregion
//#region Constants … //#endregion

export default function Component(props: Props) {
  //#region State … //#endregion
  //#region Derived … //#endregion
  //#region Handlers … //#endregion

  //#region Render
  return ( ... );
  //#endregion
}
```

---

## Styling

### Approach: hybrid (CSS tokens + BEM for simple components; MUI for complex widgets)

Simple, custom components (header, sidebar, mobile menu, chips, cards, toggles)
are styled with **plain CSS + BEM**, colocated with the component:

```
layout/Sidebar/
├── Sidebar.tsx
├── Sidebar.css    ← colocated BEM stylesheet
└── index.ts
```

MUI components (DataGrid, X-Charts, date-pickers, Select, Dialog) stay as-is.
Emotion/`sx` inside MUI-dependent files is acceptable. Avoid `sx` on plain HTML
elements — use BEM CSS instead.

### BEM convention

```css
.sidebar {}               /* Block */
.sidebar__link {}         /* Element */
.sidebar__link--active {} /* Modifier */
```

### Design tokens

`src/styles/tokens.css` is the single CSS source of truth. Import it via
`globals.css` (already done in `layout.tsx`).

```css
:root {
  --color-primary: #1976d2;
  --color-severity-error: #f44336;
  --bg-primary: #ffffff;
  --text-secondary: rgba(0,0,0,0.6);
  --space-md: 16px;
  /* ... */
}
```

**Two sources that must stay in sync:**
- `tokens.css` — `--color-severity-*` (used by BEM components)
- `lib/constants.ts` — `SEVERITY_COLORS` (used by MUI X-Charts, which needs JS values)
- `lib/theme.ts` — MUI palette (must mirror token colors as literals; `var()` won't work in MUI palette)

---

## Dark theme

The theme toggle in the header (and inside the mobile menu) flips between light and dark mode. It:

1. Persists the choice to `localStorage`.
2. Sets `data-theme="dark"` on `<html>`, activating the `[data-theme="dark"]`
   block in `tokens.css` (BEM surfaces update immediately).
3. Swaps the MUI theme via `ThemeProvider` (MUI widgets update on re-render).

An inline blocking `<script>` in `layout.tsx` reads `localStorage` before
hydration so token-based surfaces never flash.

The context and `useThemeMode()` hook live in `app/providers.tsx`:

```ts
import { useThemeMode } from "@/app/providers";

const { mode, toggle } = useThemeMode();
```

---

## Forms and filters

`FormLogs` — create/edit a log entry (MUI TextField, Select, DateTimePicker). On
the Logs List it is hosted in `ModalCreateLog` (built on the reusable
`ModalBase`); it is also reused for inline editing on the log detail page.  
`FormFilters` — filter panel used on `/logs` and `/` (Summary). The severity
control is opt-in via `showSeverity` (shown on the Logs List, hidden on Summary).
Exports the `FilterValues` type alongside the component:

```ts
import { FormFilters, type FilterValues } from "@/components/form";
```

---

## Hooks

Custom hooks live in `lib/hooks/`. Currently:

| Hook | Purpose |
|---|---|
| `useLogs` / `useLog` | paginated + single log queries |
| `useCreateLog` / `useUpdateLog` / `useDeleteLog` | mutations with cache invalidation |
| `useSummary` / `useTimeseries` / `useHistogram` | analytics queries |
| `useDebounce<T>` | debounce any value (used for search input) |

All are exported from `@/lib/hooks`.

---

## Component evolution ladder

```
Page component
     ↓  used on only one page → lives in app/.../_components/
Section / Panel / Detail  (composite) or  Widget  (single unit)
     ↓  needed by a second page
components/<domain>/
     ↓  generic enough to be framework-level
design system token / primitive
```

Do not skip rungs — start local, promote only when the need is demonstrated.

---

## Testing

Two layers, sharing one browser engine — **Playwright Chromium** powers both.

### Component tests = stories (Storybook + Vitest, in a real browser)

There are no separate `.test.tsx` files for components. Each component's
**`*.stories.tsx`** is the single source of truth: it documents the component
*and* functionally tests it. Interaction tests live in a story's `play`
function (`@storybook/test`'s `expect` / `userEvent`). The
`@storybook/addon-vitest` plugin compiles every story into a Vitest test and
runs it in **real Chromium via Playwright** — so MUI X-Charts and the DataGrid
render with genuine layout (impossible in jsdom).

```bash
npm test            # runs every story's play test in Chromium (single run)
npm run test:watch
```

`vitest.config.ts` defines two projects:
- **`unit`** — fast jsdom project for pure logic in `src/lib/**/*.test.ts`.
- **`storybook`** — the browser project that runs the stories.

### Storybook

```bash
npm run storybook        # dev catalog at http://localhost:6006
npm run build-storybook  # static build
```

- Framework: `@storybook/nextjs-vite` (Vite builder — required by the Vitest addon).
- A global decorator in `.storybook/preview.tsx` wraps every story in the app's
  runtime (`QueryClient` + a controlled `ThemeMode` context + the MUI theme),
  and a **Light / Dark toolbar toggle** drives the real theme tokens so you can
  preview either mode.
- `next/navigation` is auto-mocked by the framework; set the route per story via
  `parameters.nextjs.navigation.pathname`.

### End-to-end (Playwright)

View-level flows live in `e2e/` (mirroring the route tree). These run against
the **real backend**, so start the stack first (seeded DB required):

```bash
# from the repo root — backend + Postgres (seeded):
docker compose up            # or run uvicorn + scripts/seed.py locally

# then, in frontend/:
npm run test:e2e             # Playwright boots `next dev` and drives the app
npm run test:e2e:ui          # interactive UI mode
```

Specs: `logs` (list/filter/row-click), `dashboard` (summary + charts +
controls), `log-crud` (a self-cleaning create→edit→delete round-trip), and
`navigation` (routing + theme persistence). They assert structure and operate
on entries they create — never on exact seeded counts — so they stay
deterministic against the randomized seed data.

---

## Contributing

1. **New shared component?** Check if it can stay page-local first.
2. **New component?** Give it its own folder with `index.ts` (barrel adds the
   prefix) and a `*.stories.tsx` containing at least one `play` interaction test.
3. **Styling?** BEM + `tokens.css` for new components; MUI `sx` only inside
   MUI-dependent components.
4. **Regions?** Add `//#region` markers for any section with ≥ 3 items.
5. **New view/flow?** Add a Playwright spec under `e2e/`.
