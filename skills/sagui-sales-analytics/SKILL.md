---
name: sagui-sales-analytics
description: Build and extend the Sales Analytics Next.js app strictly on the SagUI design system. Use for any work in that project that touches UI, including new pages, dashboards, KPI cards, charts, tables, filters, forms, dialogs, layout, theming, styling, empty, loading and error states, and for reviewing UI code for design-system compliance. Covers project setup, installing and wiring @sagui/ui, picking the right SagUI component, tokens, accessibility and a pre-merge checklist.
---

# Sales Analytics on SagUI

Sales Analytics is a Next.js (App Router) app whose entire interface is built from **SagUI** (`@sagui/ui`). SagUI supplies the components, the design tokens, light and dark themes, motion and accessibility. This skill keeps every screen inside that system.

- Docs: https://sagui-docs.vercel.app
- Storybook: https://sagnikdey.github.io/sagui/
- MCP server (component lookup for AI tools): https://sagui-docs.vercel.app/api/mcp
- Source: https://github.com/sagnikdey/sagui

## The rules

Follow these on every change. The steps below explain how.

1. **A SagUI component first.** If SagUI has a component for the job, use it. Never rebuild buttons, inputs, selects, dialogs, tables, charts, badges or toasts by hand, and never add another UI kit (shadcn/ui, MUI, Chakra, Mantine, Ant, Headless UI, Recharts, Chart.js, Nivo, Tremor).
2. **Documented props only.** Look the component up before using it (Step 5). Do not invent variants, sizes or props.
3. **Tokens only.** Colors, type, radius, shadows and timing come from SagUI tokens. No hex, `rgb()`, `oklch()` or named colors in app code, and no Tailwind palette classes such as `bg-blue-500`, `text-gray-600` or `border-slate-200`.
4. **Compose, don't restyle.** Lay components out with Tailwind layout utilities (`grid`, `flex`, `gap-*`, `p-*`, `max-w-*`). Don't override a component's colors, radius, borders or font with `className`.
5. **Both themes, every time.** Everything must read correctly in light and dark. Tokens make this automatic; hard-coded colors break it.
6. **Accessible by default.** Every control has a label, every chart a `label`, every icon-only button an `aria-label`. Don't remove focus rings.
7. **Respect motion settings.** Use SagUI's built-in motion. Any custom animation uses `motion-safe:` or the `motion` library's reduced-motion handling.

## Step 1. Create the project

```bash
npx create-next-app@latest sales-analytics --ts --tailwind --app --eslint --no-src-dir --import-alias "@/*" --use-npm
cd sales-analytics
npm install lucide-react
```

This gives Next.js 16, React 19 and Tailwind CSS v4, which SagUI requires. `lucide-react` is the icon set SagUI uses; use it for every icon in the app.

## Step 2. Install SagUI

**Once `@sagui/ui` is published to npm:**

```bash
npm install @sagui/ui
```

**Until then**, install it from packed tarballs built from the SagUI repository. In a checkout of `github.com/sagnikdey/sagui`:

```bash
npm ci
npm run build -w @sagui/ui
npm pack -w @sagui/tokens -w @sagui/ui --pack-destination ../sales-analytics/vendor
```

Then in `sales-analytics`:

```bash
npm install ./vendor/sagui-tokens-0.1.0.tgz ./vendor/sagui-ui-0.1.0.tgz
```

Commit `vendor/` so teammates and CI install the same build. Install **both** tarballs: `@sagui/ui` imports its token stylesheet from `@sagui/tokens`. Repeat the pack and install to upgrade.

Do not add `transpilePackages`; the package ships compiled.

## Step 3. Replace `app/globals.css`

Delete everything create-next-app put in `app/globals.css`. Its `:root` colors, `@theme inline` block and `prefers-color-scheme` rule fight SagUI's tokens. Replace the whole file with:

```css title="app/globals.css"
@import "tailwindcss";
@import "@sagui/ui/styles.css";
@source "../node_modules/@sagui/ui/dist";

/* Inter and JetBrains Mono come from next/font (see app/layout.tsx). */
@theme {
  --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-jetbrains-mono), ui-monospace, monospace;
}

body {
  background: var(--color-background);
  color: var(--color-foreground);
  font-family: var(--font-sans);
}
```

The `@source` line makes Tailwind generate the classes SagUI's components use. Keep its path relative to this CSS file.

Add rules to this file only for app-wide layout. Never define colors here.

## Step 4. Fonts and theme in `app/layout.tsx`

SagUI's themes switch on `data-theme="light"` or `data-theme="dark"` on `<html>`. Set it before first paint so the page never flashes the wrong theme.

```tsx title="app/layout.tsx"
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" });

export const metadata: Metadata = { title: { default: "Sales Analytics", template: "%s · Sales Analytics" } };

/** Applies the saved or system theme before paint. */
const themeScript = `try{var t=localStorage.getItem("theme")||(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
```

A theme toggle is a SagUI `Button` with `size="icon"`, an `aria-label` and a lucide `Sun` or `Moon` icon. It sets `document.documentElement.dataset.theme` and saves the choice to `localStorage` under `theme`.

## Step 5. Look components up before using them

Connect your AI tool to the SagUI MCP server once. It answers from the live docs, so it always matches the current release.

```bash
claude mcp add --transport http --scope project sagui https://sagui-docs.vercel.app/api/mcp
```

Before building any piece of UI:

1. `search_components` with the need in plain words ("compare revenue by month", "filter by owner").
2. `get_component` for the chosen component. Read "When to use", "When not to use" and the API table, and copy prop names exactly.
3. `get_tokens` when you need a color, type, radius, elevation or motion value.

Without MCP, read the component's page at `https://sagui-docs.vercel.app/components/<slug>`, or its Markdown at `/components/<slug>/markdown`. The full catalog is at the end of this skill.

## Step 6. Structure the app

```text
app/
  layout.tsx                 fonts, theme script
  globals.css                Tailwind + SagUI only
  (app)/
    layout.tsx               app shell: header, navigation
    page.tsx                 Overview dashboard
    loading.tsx              page skeleton
    error.tsx                error state
    pipeline/page.tsx
    deals/page.tsx
    deals/[id]/page.tsx
    reps/page.tsx
    accounts/page.tsx
components/
  dashboard/                 client wrappers around SagUI charts and tables
  shell/                     header, nav, theme toggle
lib/
  sales.ts                   data access (server only)
  format.ts                  number, currency, date formatting
```

- **Data loads in server components** (`page.tsx`) and is passed down as plain serializable props.
- **Charts and tables live in small client wrappers.** SagUI components are client components. Importing one into a server component is fine, but a server component cannot pass functions such as `formatValue`, `formatTick` or a column `render` across the boundary. Put any SagUI component that needs a function prop in a `"use client"` file under `components/`, and pass it data only.
- **Filters live in the URL** (`?range=30d&owner=maya`), so views survive reloads and can be shared. Client controls update the URL with `router.replace`; the server page reads `searchParams` and refetches.
- **Row types are `type` aliases, not `interface`s.** `SortableDataTable` needs rows assignable to `Record<string, unknown>`, which interfaces are not.
- **Data must be deterministic during render.** No `Math.random()` or `Date.now()` in render paths; it causes hydration mismatches. Pass a fixed `now` where a component asks for one (for example `Timeline`).

## Step 7. Pick the component for each analytics job

| Need | Use | Notes |
| --- | --- | --- |
| Headline KPI with change | `MetricCard` | `value` is a number; `prefix`, `suffix`, `decimals`, `change` (string) and `context` (required) |
| KPI with a small trend | `Sparkline` | `value`, `change`, `tone` (`accent`, `success`, `warning`, `danger`) |
| Number that animates when it changes | `AnimatedCounter` | Inside your own layouts |
| Trend over time, several series | `LineChart` | `dashed` series for targets or the previous period; `loading` while refetching |
| One measure across days or a few categories | `BarChart` | Give each datum a short `axisLabel` |
| Share of a whole | `DonutChart` (up to ~6 parts), `WaffleChart` (percent units) | |
| Before and after per item | `SlopeChart` | Quarter over quarter by rep, region or channel |
| Composition over time | `Streamgraph` | Revenue by product line by week |
| Long daily series with zoom | `BrushChart` | A year of bookings, with launch `annotations` |
| Quota attainment, health | `Gauge` | Always add labelled `thresholds` |
| Activity by day | `ActivityHeatmap` | Calls, meetings or deals closed per day |
| Distribution by group | `Ridgeline` | Deal size or cycle length by segment |
| Hierarchy by size | `Treemap` | Revenue by region, then country |
| Records | `SortableDataTable` | `render` for badges and currency; `selectable` for bulk actions |
| Status in a cell | `Badge` | `tone`: `neutral`, `success`, `info`, `warning`, `danger` |
| Activity feed | `Timeline` | Deal history, audit log |
| Date range presets | `SegmentedControl` | 7, 30 and 90 days, QTD, YTD |
| Pick one filter value | `Select` (short lists), `Combobox` (long, searchable), `MorphSelect` (with icons or meta) | |
| Pick several values | `MultiSelect`, `ChipGroup` | Owners, regions, stages |
| Search a list | `SearchField` | |
| Switch views of one dataset | `Tabs` | In-page panels, not route navigation |
| Path to the current page | `Breadcrumb` | Pass `linkComponent={Link}` from `next/link` |
| Grouped content block | `Card` | |
| Nothing to show yet | `EmptyState` | With a next step in `action` |
| Persistent message | `Alert` | `tone`: `info`, `success`, `warning`, `danger` |
| Brief confirmation | `Toast` | After an action completes |
| Focused task | `Dialog` | Edit a deal, confirm a bulk change |
| Side detail | `Drawer` | Deal details beside the table |
| Mobile detail | `BottomSheet` | |
| Destructive action | `ConfirmMorph` | Asks in place, with undo |
| Async action with result | `ActionButton` | Export, sync, send report |
| Main action and alternatives | `SplitButton` | Export as CSV, XLSX or PDF |
| Person | `Avatar`, `AvatarGroup` | Owners and deal teams |
| Hint on hover or focus | `Tooltip` | Never the only place for important text |
| Section disclosure | `Accordion` | |
| Text effects | `TextShimmer` for "Generating report", `TextMorph` for changing labels | Use sparingly |

There is **no** date picker, sidebar, navigation menu, pagination, funnel chart or skeleton component. See "When SagUI has no component" below.

## Step 8. Build the Overview dashboard

This recipe is the reference pattern for every analytics page. It compiles and runs as written on Next.js 16.

```ts title="lib/format.ts"
const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

export const formatCurrency = (value: number) => currency.format(value);
export const formatCompactCurrency = (value: number) => `$${compact.format(value)}`;
export const formatChange = (ratio: number) => `${ratio >= 0 ? "+" : ""}${(ratio * 100).toFixed(1)}%`;
```

```ts title="lib/sales.ts"
export type Range = "7d" | "30d" | "90d";
export type Deal = { id: string; account: string; owner: string; stage: "Prospecting" | "Proposal" | "Negotiation" | "Won" | "Lost"; amount: number; closeDate: string };

/** Server only. Replace the sample values with real queries; keep the return shape. */
export async function getDashboard(range: Range) {
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  const end = Date.UTC(2026, 8, 21);
  const revenue = Array.from({ length: days }, (_, index) => {
    const time = end - (days - 1 - index) * 86_400_000;
    const date = new Date(time);
    return {
      key: date.toISOString().slice(0, 10),
      label: date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" }),
      axisLabel: index % Math.ceil(days / 5) === 0 ? date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }) : undefined,
      values: { revenue: 40_000 + index * 600 + (index % 7) * 1_500, target: 42_000 + index * 500 },
    };
  });
  const deals: Deal[] = [
    { id: "d1", account: "Acme", owner: "Maya Chen", stage: "Won", amount: 42_000, closeDate: "2026-09-18" },
    { id: "d2", account: "Globex", owner: "Leo Fischer", stage: "Negotiation", amount: 31_000, closeDate: "2026-09-30" },
    { id: "d3", account: "Initech", owner: "Priya Nair", stage: "Proposal", amount: 18_500, closeDate: "2026-10-12" },
  ];
  return {
    kpis: { revenue: 1_284_000, revenueChange: 0.124, deals: 42, dealsChange: 0.06, winRate: 0.315, winRateChange: 0.021 },
    revenue,
    pipeline: [
      { key: "prospecting", label: "Prospecting", axisLabel: "Prosp.", value: 412_000 },
      { key: "proposal", label: "Proposal", axisLabel: "Prop.", value: 268_000 },
      { key: "negotiation", label: "Negotiation", axisLabel: "Neg.", value: 191_000 },
      { key: "won", label: "Won", axisLabel: "Won", value: 134_000 },
    ],
    sources: [
      { key: "inbound", label: "Inbound", value: 540_000 },
      { key: "outbound", label: "Outbound", value: 380_000 },
      { key: "partners", label: "Partners", value: 220_000 },
      { key: "events", label: "Events", value: 144_000 },
    ],
    deals,
  };
}
```

```tsx title="components/dashboard/range-switch.tsx"
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SegmentedControl } from "@sagui/ui";

/** The date range lives in the URL, so it survives reloads and can be shared. */
export function RangeSwitch({ value }: { value: string }) {
  const router = useRouter();
  const params = useSearchParams();
  return (
    <SegmentedControl
      label="Date range"
      value={value}
      onValueChange={(next) => {
        const query = new URLSearchParams(params);
        query.set("range", next);
        router.replace(`?${query}`, { scroll: false });
      }}
      options={[{ value: "7d", label: "7 days" }, { value: "30d", label: "30 days" }, { value: "90d", label: "90 days" }]}
    />
  );
}
```

```tsx title="components/dashboard/revenue-chart.tsx"
"use client";

import { LineChart, type LineChartDatum } from "@sagui/ui";
import { formatCompactCurrency, formatCurrency } from "@/lib/format";

/** Client wrapper: the chart takes formatter functions, which a server component cannot pass down. */
export function RevenueChart({ data }: { data: LineChartDatum[] }) {
  return (
    <LineChart
      label="Revenue"
      data={data}
      series={[{ key: "revenue", label: "Revenue" }, { key: "target", label: "Target", dashed: true }]}
      formatValue={(value) => formatCurrency(value)}
      formatTick={formatCompactCurrency}
      height={260}
    />
  );
}
```

```tsx title="components/dashboard/breakdowns.tsx"
"use client";

import { BarChart, DonutChart, type BarChartDatum, type DonutChartDatum } from "@sagui/ui";
import { formatCompactCurrency, formatCurrency } from "@/lib/format";

export function PipelineByStage({ data, period }: { data: BarChartDatum[]; period: string }) {
  return <BarChart label="Pipeline by stage" period={period} data={data} categoryLabel="Stage" averageLabel="Average per stage" valueLabel="Stage total" formatValue={formatCompactCurrency} />;
}

export function RevenueBySource({ data }: { data: DonutChartDatum[] }) {
  return <DonutChart label="Revenue by source" data={data} formatValue={formatCurrency} totalLabel="Revenue" />;
}
```

```tsx title="components/dashboard/deals-table.tsx"
"use client";

import { Badge, SortableDataTable, type BadgeTone } from "@sagui/ui";
import type { Deal } from "@/lib/sales";
import { formatCurrency } from "@/lib/format";

const stageTone: Record<Deal["stage"], BadgeTone> = { Prospecting: "neutral", Proposal: "info", Negotiation: "warning", Won: "success", Lost: "danger" };

export function DealsTable({ deals }: { deals: Deal[] }) {
  return (
    <SortableDataTable
      caption="Open and recent deals"
      rows={deals}
      rowKey="id"
      defaultSort={{ key: "amount", direction: "desc" }}
      itemName={{ one: "deal", other: "deals" }}
      columns={[
        { key: "account", label: "Account" },
        { key: "owner", label: "Owner" },
        { key: "stage", label: "Stage", render: (value) => <Badge size="sm" tone={stageTone[value as Deal["stage"]]}>{String(value)}</Badge> },
        { key: "amount", label: "Amount", numeric: true, render: (value) => formatCurrency(Number(value)) },
        { key: "closeDate", label: "Close date" },
      ]}
    />
  );
}
```

```tsx title="app/(app)/page.tsx"
import { MetricCard } from "@sagui/ui";
import { getDashboard, type Range } from "@/lib/sales";
import { formatChange } from "@/lib/format";
import { RangeSwitch } from "@/components/dashboard/range-switch";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { PipelineByStage, RevenueBySource } from "@/components/dashboard/breakdowns";
import { DealsTable } from "@/components/dashboard/deals-table";

const ranges: Range[] = ["7d", "30d", "90d"];

export default async function OverviewPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const requested = (await searchParams).range as Range | undefined;
  const range: Range = requested && ranges.includes(requested) ? requested : "30d";
  const data = await getDashboard(range);
  const compared = `vs previous ${range.replace("d", " days")}`;
  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="type-overline text-muted-foreground">Sales</p>
          <h1 className="type-h1 mt-1">Overview</h1>
        </div>
        <RangeSwitch value={range} />
      </header>

      <section aria-label="Key metrics" className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Revenue" value={data.kpis.revenue / 1000} prefix="$" suffix="k" change={formatChange(data.kpis.revenueChange)} context={compared} />
        <MetricCard label="Deals won" value={data.kpis.deals} change={formatChange(data.kpis.dealsChange)} context={compared} />
        <MetricCard label="Win rate" value={data.kpis.winRate * 100} suffix="%" decimals={1} change={`+${(data.kpis.winRateChange * 100).toFixed(1)} pts`} context={compared} />
      </section>

      <section aria-labelledby="revenue-title" className="rounded-container border border-border bg-surface p-5 shadow-resting">
        <h2 id="revenue-title" className="type-h3 mb-4">Revenue against target</h2>
        <RevenueChart data={data.revenue} />
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section aria-labelledby="pipeline-title" className="rounded-container border border-border bg-surface p-5 shadow-resting">
          <h2 id="pipeline-title" className="type-h3 mb-4">Pipeline</h2>
          <PipelineByStage data={data.pipeline} period={`Last ${range.replace("d", " days")}`} />
        </section>
        <section aria-labelledby="sources-title" className="rounded-container border border-border bg-surface p-5 shadow-resting">
          <h2 id="sources-title" className="type-h3 mb-4">Sources</h2>
          <RevenueBySource data={data.sources} />
        </section>
      </div>

      <section aria-labelledby="deals-title" className="grid gap-4">
        <h2 id="deals-title" className="type-h2">Deals</h2>
        <DealsTable deals={data.deals} />
      </section>
    </main>
  );
}
```

Page layout rules:

- One `type-h1` per page, a `type-overline` eyebrow above it, and the page's filters on the same row.
- KPIs first, then the main trend, then breakdowns, then records.
- Chart panels are `rounded-container border border-border bg-surface p-5 shadow-resting`, each with a `type-h3` heading and an `aria-labelledby` link to it.
- Widths come from `max-w-7xl` for dashboards and `max-w-3xl` for forms and settings.
- Use `gap-4` inside a group and `gap-8` between groups.

## Step 9. Loading, empty and error states

Every data view handles all three.

```tsx title="app/(app)/loading.tsx"
/** SagUI has no skeleton component, so placeholders are built from tokens and pulse only when motion is allowed. */
export default function Loading() {
  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6" aria-busy="true" aria-label="Loading">
      <div className="h-12 w-48 rounded-control bg-muted motion-safe:animate-pulse" />
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((index) => <div key={index} className="h-32 rounded-container border border-border bg-surface motion-safe:animate-pulse" />)}
      </div>
      <div className="h-80 rounded-container border border-border bg-surface motion-safe:animate-pulse" />
    </main>
  );
}
```

```tsx title="app/(app)/error.tsx"
"use client";

import { Alert, Button } from "@sagui/ui";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto grid max-w-xl gap-4 px-4 py-16">
      <Alert tone="danger" title="This report didn't load">Check your connection, then try again.</Alert>
      <Button variant="outline" className="w-fit" onClick={reset}>Try again</Button>
    </main>
  );
}
```

- **Refetching an existing chart:** pass `loading` to `LineChart`, which dims the current lines instead of blanking them.
- **No data:** `EmptyState` with a `title`, a `description` that says why, and an `action` that leads somewhere. Charts also accept an `emptyLabel`. Tables accept an `emptyMessage`.
- **Action results:** `Toast` for brief confirmations ("Report exported"), `Alert` for anything that must stay visible.

## Step 10. Styling with tokens

Use these and nothing else for visual styling.

| Purpose | Use |
| --- | --- |
| Page and text | `bg-background`, `text-foreground` |
| Panels, cards, popovers | `bg-surface` |
| Quiet fills, secondary text | `bg-muted`, `text-muted-foreground` |
| Lines | `border-border`, and `border-border-strong` for emphasis |
| Main action, links, selection | `bg-primary`, `text-primary-foreground`, `text-primary` |
| Secondary emphasis | `bg-secondary`, `text-secondary-foreground` |
| Status | `text-success`, `text-warning`, `text-destructive` (and `bg-*` versions) |
| Charts you draw yourself | `--color-chart-1` to `--color-chart-4` (`bg-chart-1`, `text-chart-3` ...) |
| Focus | `ring-ring` |
| Type | `type-display`, `type-h1`, `type-h2`, `type-h3`, `type-title`, `type-body-lg`, `type-body`, `type-body-sm`, `type-label`, `type-caption`, `type-overline`, `type-code` |
| Corners | `rounded-control` (inputs, buttons), `rounded-container` (cards, panels), `rounded-overlay` (menus, dialogs), `rounded-pill` |
| Elevation | `shadow-resting` (panels), `shadow-raised` (hover), `shadow-floating` (menus, popovers), `shadow-overlay` (dialogs) |
| Timing | `duration-[var(--duration-fast)]`, `duration-[var(--duration-quick)]`, `duration-[var(--duration-standard)]`, with `ease-out-quint`, `ease-enter` or `ease-spring` |

- **Numbers** that line up or change use `tabular-nums`. Format with `Intl.NumberFormat`, never by string concatenation.
- **Durations need the arbitrary form.** Tailwind v4 has no theme namespace for durations, so `duration-fast` generates nothing.
- **Never** use Tailwind palette colors (`bg-white`, `text-black`, `bg-gray-100`, `text-blue-600`), arbitrary colors (`bg-[#0f172a]`), `dark:` color overrides, or inline `style={{ color }}`. Tokens already switch with the theme.
- **Radius and shadows** must come from the roles above, never `rounded-[13px]` or `shadow-[0_4px_...]`.
- **To change the brand** (for example a green primary or sharper corners), override the `--sg-*` source tokens once, in `globals.css` after the SagUI import. Do this only when the product decides it, and never per component. `get_tokens` with `overview` explains the layering.

## Step 11. Accessibility and motion

- Every input has a visible `label`. Every chart has a `label` naming what it measures. Every table has a `caption`.
- Icon-only buttons have an `aria-label`. Icons next to text are decorative; SagUI hides them.
- Status is never color alone. A `Badge` carries text, and a `Gauge` threshold carries a `label`.
- Headings follow the page outline (`h1`, then `h2`, then `h3`); pick the element for structure and the `type-*` class for the look.
- Don't remove or restyle focus rings, and don't put clickable `onClick` handlers on `div`s. Use `Button`, or a `next/link` `Link` for navigation.
- SagUI components already respect reduced motion. Custom animation uses `motion-safe:` utilities, or `useReducedMotion` from `motion/react`.
- Check both themes and a 375px-wide viewport before you finish.

## When SagUI has no component

Compose one from SagUI pieces and tokens. Don't import a component library.

- **App shell and navigation:** a header with `bg-background/85 backdrop-blur border-b border-border`, and nav built from `next/link` `Link`s styled `rounded-control px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground aria-[current=page]:bg-muted aria-[current=page]:text-foreground`. Set `aria-current="page"` on the active link.
- **Date picker:** offer presets with `SegmentedControl`, and a custom range with two `Input type="date"` fields until SagUI ships a date picker.
- **Pagination:** prefer `SortableDataTable` with server-side filtering and a "Load more" `Button`.
- **Funnel:** a `BarChart` of stage totals, or a `SlopeChart` for stage-to-stage conversion.
- **Skeletons:** `bg-muted` blocks with `motion-safe:animate-pulse`, as in Step 9.

Anything composed this way still follows the rules above. If a composition repeats in three places, propose it as a SagUI component instead of copying it.

## Before you finish: checklist

Run these from the project root. Each one should print nothing.

```bash
# Raw colors in app code
grep -rnE "#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(|oklch\(" app components lib --include='*.tsx' --include='*.ts'
# Tailwind palette colors instead of tokens
grep -rnE "\b(bg|text|border|ring|fill|stroke|from|to|via)-(white|black|slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)(-[0-9]{2,3})?\b" app components
# Other UI or chart libraries
grep -nE "\"(@mui|@chakra-ui|@mantine|antd|@headlessui|recharts|chart\.js|react-chartjs-2|@nivo|@tremor)" package.json
# Hand-rolled controls where a SagUI component exists
grep -rnE "<(button|select|table|dialog)[ >]" app components
# Duration classes that generate nothing in Tailwind v4
grep -rnE "\bduration-(fast|quick|standard|instant|considered)\b" app components
```

Then confirm:

- [ ] Every SagUI component was looked up (`get_component` or its docs page) and uses only documented props.
- [ ] Charts and tables that take function props are in `"use client"` wrappers; pages stay server components.
- [ ] Loading, empty and error states exist for each data view.
- [ ] Light and dark both checked, plus a 375px viewport.
- [ ] Keyboard only: every control is reachable, and focus is visible.
- [ ] `npm run build` passes with no type errors.

## Component catalog

All of these import from `@sagui/ui`. Call `get_component` with the name for props and examples.

#### Buttons

| Component | Use it for |
| --- | --- |
| `Button` | A clear, responsive action with a loading state, icons, and a label that morphs in place. |
| `ActionButton` | A compact button for frequent toolbar actions. |
| `SplitButton` | A primary action with a menu of nearby alternatives. |
| `ButtonGroup` | Related actions joined into one surface with hairline dividers: a hover highlight glides between segments, the pressed one answers in place, and an attached menu can close the row. |
| `FloatingButtonGroup` | Separate soft buttons in a quiet tray, with one shared highlight that morphs from button to button as you move, and a pressed state that settles in place. |
| `ExpandingButtonGroup` | Icon buttons in a compact group: the one you point at or focus grows to reveal its label while its neighbours slide aside, and an action confirms in place. |
| `CopyButton` | Copy a value with immediate confirmation. |
| `ConfirmMorph` | A destructive button that morphs into an inline confirmation, a spinner, and a result with undo. |

#### Inputs

| Component | Use it for |
| --- | --- |
| `Input` | A single line field with clear labels and useful states. |
| `Textarea` | A multiline field for notes, descriptions, and longer text. |
| `PasswordField` | Capture sensitive text with a visible reveal control. |
| `PasswordStrength` | Show how strong a new password is while it is typed. |
| `SearchField` | A recognizable search entry point with clear affordances. |
| `ExpandingSearch` | An icon that morphs into a search field with results beneath it. |
| `InlineEdit` | Rename in place: the text becomes a field without moving. |

#### Special inputs

| Component | Use it for |
| --- | --- |
| `NumberField` | Enter a bounded number with clear increment controls. |
| `MoneyInput` | A currency field with live grouping, stable width, rolling digits, and minor-unit output. |
| `PhoneInput` | A phone field with a country picker, formatting as you type, and E.164 output. |
| `TagInput` | Turn short text values into removable tags. |

#### Selection controls

| Component | Use it for |
| --- | --- |
| `Checkbox` | A binary choice with a precise, legible state. |
| `RadioGroup` | Choose one option from a visible set. |
| `RadioCards` | Selectable option cards with a sliding selection ring, price and description slots, and radio keyboard behavior. |
| `Select` | A compact choice field with a keyboard friendly menu. |
| `MorphSelect` | A select whose trigger grows into the list, with a gliding highlight and type-ahead. |
| `Combobox` | Search and select from a list without leaving the field. |
| `MultiSelect` | Select several values while keeping the field readable. |
| `Switch` | A tactile toggle for settings that take effect immediately. |
| `SegmentedControl` | Switch between a small set of related views. |
| `ChipGroup` | Filter by a few facets with chips that morph as you pick them. |

#### Navigation

| Component | Use it for |
| --- | --- |
| `Tabs` | Switch between related content in the same context. |
| `Breadcrumb` | Show where a page sits in a hierarchy. |

#### Disclosure

| Component | Use it for |
| --- | --- |
| `Accordion` | Progressively reveal supporting information in place. |

#### Data display

| Component | Use it for |
| --- | --- |
| `Avatar` | A compact identity marker for people and accounts. |
| `AvatarGroup` | Show a team or set of contributors in a small space. |
| `Badge` | A small label for status, category, or metadata. |

#### Charts

| Component | Use it for |
| --- | --- |
| `LineChart` | A multi-series line chart with a gliding crosshair, legend toggles, and paths that morph between ranges. |
| `BarChart` | Compare one measure across days and scrub any bar for its value. |
| `DonutChart` | A donut whose arcs morph between datasets, with the active value rolling into the center. |
| `Sparkline` | Show a compact trend beside a value. |
| `Gauge` | Show a value against a known range. |
| `Streamgraph` | Layered streams on a wiggle baseline that morph between ranges, with a layer you can isolate and read week by week. |
| `BrushChart` | A dense time series with an overview strip: drag a window to zoom, resize it by its handles, and read events in place. |
| `WaffleChart` | A ten by ten unit chart where every cell is one percent, and cells fly to their new group when the data changes. |
| `SlopeChart` | Before and after on two axes: lines draw in, rank moves sit beside each value, and switching datasets slides every line to its new slope. |
| `ActivityHeatmap` | See a year of activity at a glance, one square per day. |
| `Ridgeline` | Overlapping distributions, one ridge per group: hover to lift a ridge and read its quartiles, switch datasets and every curve morphs. |
| `Treemap` | A squarified treemap: click to drill and the tiles grow to fill the view, with a breadcrumb back and metrics that morph every tile. |

#### Tables and timeline

| Component | Use it for |
| --- | --- |
| `SortableDataTable` | Compare structured records with sortable columns. |
| `Timeline` | Follow what happened, newest first, grouped by day. |

#### Text effects

| Component | Use it for |
| --- | --- |
| `TextReveal` | Reveal a short piece of content with restrained motion. |
| `InViewTitle` | Bring a section title in as it scrolls into view. |
| `TextMorph` | Morph a label into its next state, letter by letter. |
| `TextShimmer` | Show ongoing work with a calm light across the words. |

#### Cards

| Component | Use it for |
| --- | --- |
| `Card` | A contained group of related content and actions. |
| `MetricCard` | A compact summary for a number that needs context. |
| `EmptyState` | A useful next step when there is nothing to show yet. |
| `AnimatedCounter` | Give changing totals a clear sense of movement. |

#### Messages

| Component | Use it for |
| --- | --- |
| `Alert` | A persistent message that helps people recover or continue. |
| `Toast` | Brief confirmation for a completed background action. |

#### Overlays

| Component | Use it for |
| --- | --- |
| `Dialog` | A focused surface for decisions that need attention. |
| `Drawer` | A temporary side surface for focused work. |
| `BottomSheet` | A sheet that rests at a peek or full height and follows your finger. |
| `Popover` | A small anchored surface for contextual information. |
| `Tooltip` | Short supporting text for unfamiliar controls. |
