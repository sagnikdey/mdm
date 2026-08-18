# MDM — Delightful UI Component Mapping

Where to bring "nice & fun" interactions into the MDM and vendor onboarding apps, using [Beautiful UI](https://www.beautifului.dev/) (MIT, copy-paste, shadcn-based) and similar sources. Mapped to your actual repo: Turborepo, `apps/web` (MDM) + `apps/onboarding` (invite-only), shared `@workspace/ui`.

> Beautiful UI is MIT-licensed and copy-paste. Its components are built on shadcn-style primitives and CSS variables, so they slot into your existing `@workspace/ui` package with no framework friction. Copy the real component source from the site; the snippets below are illustrative placements in your stack, not reproductions of their code.

> Happy accident: Beautiful UI's demo dataset is a creamery/supplier-management app (vendors, reorders, cold-chain onboarding, seasonal demand). Several components are effectively pre-designed for your exact domain.

---

## Part 1: How to Think About This

Not every Beautiful UI component fits. Roughly half are **AI-agent primitives** (thinking traces, streaming text, tool chips, prompt bar) that only make sense once you add an AI copilot. The other half are **data-app primitives** (records tables, filter chips, approval cards, insight cards) that fit your MDM *today*.

So the recommendations are tiered:

- **Tier 1 — Do these first.** Direct 1:1 fits that upgrade screens you already have.
- **Tier 2 — High-delight workflow moments.** Turn dull states (approvals, bulk jobs, reorder prompts) into satisfying ones.
- **Tier 3 — Onboarding & data-quality polish.**
- **Tier 4 — Later, if you add an AI assistant.** The agent-native components become relevant then.

---

## Part 2: Tier 1 — Direct Fits (Do First)

### Records Table → your vendors / products / stores grids
**Where:** `apps/web/app/(routes)/vendors/`, `products/`, `stores/` — replacing the plain shadcn `<Table>` in `StoresTable`, `VendorsTable`, etc.

This is your biggest single win. Beautiful UI's **Records Table** is a CRM-style grid with per-row avatars, inline tag chips, sortable columns, a relationship-strength column, and a summary footer row ("26 count · 44% average · 19 links"). Their demo is *literally a vendor list* — company, categories, last interaction, connection strength, website link.

Map it to vendors like this:

| Beautiful UI column | Your vendor field |
|---------------------|-------------------|
| Company + avatar | `vendorName` + generated initial |
| Categories (tag chips) | `vendorCategory` / supplied categories |
| Last interaction | most recent order/delivery date |
| Connection strength | derive from `rating` + order recency ("Very strong" → "Weak") |
| Links | `website` |
| Footer summary | count, avg rating, active count |

The footer summary row and the tag chips alone make your data feel alive versus a static table.

### Search → your universal Cmd+K search
**Where:** upgrade the existing `UniversalSearch` / `useSearch` in `apps/web`.

Beautiful UI's **Search** is a command palette with live filtering, suggested queries, and a designed empty state. You already built token-based search with grouped results and Cmd+K — this is a visual upgrade, not a rewrite. Adopt their:
- Suggested-query rows for the empty state ("Find waffle cone suppliers" → "Find beverage vendors", "Low stock at Airport Express").
- Live-filter animation and keyboard affordances.
- Grouped result styling (you already group by entity type).

### Filter Table (status chips) → onboarding review queue + order status
**Where:** `apps/web/app/admin/applications/` (review queue) and any order-status view.

**Filter Table** uses status chips that reorganize live data ("All 5 · To do 2 · In Progress 2 · Completed 1"). This is a perfect fit for your onboarding state machine:

```
All 24 · Submitted 6 · Under Review 4 · Needs Info 3 · Approved 9 · Rejected 2
```

Clicking a chip filters the application list in place. Same pattern applies to order status (pending/confirmed/shipped/delivered).

### Sidebar Nav → your MDM sidebar
**Where:** replace/enhance `apps/web/components/layout/Sidebar.tsx`.

Beautiful UI's **Sidebar Nav** adds a workspace header, an inline `/` quick-search, a "New task" affordance, and count badges per section ("Agent tasks 4"). Map the badges to live counts — "Low stock 7", "Pending approvals 6", "Expiring docs 3" — so the nav doubles as an alert surface.

---

## Part 3: Tier 2 — High-Delight Workflow Moments

### Approval Card → admin vendor approval
**Where:** `apps/web/app/admin/applications/[id]/` — the reviewer's decision UI.

**Approval Card** renders a human-in-the-loop question with distinct action buttons. This maps exactly onto your approve / needs-info / reject decision from the onboarding guide. Instead of three plain buttons, the reviewer sees a framed question ("Approve National Beverage Co. as a vendor?") with the options as first-class choices. It makes the highest-stakes action in the whole system feel deliberate.

### Task Rows → onboarding submission + bulk jobs
**Where:** onboarding submit confirmation, JSON→DB migration, bulk validation runs.

**Task Rows** show live agent task status — running, failed, completed — with nested sub-steps. Their demo row is uncannily on-point: *"Verified vendor records · 12 suppliers · Completed → Matched tax and contact IDs 12/12 → Flagged stale records 0."*

Use it for:
- The moment a vendor hits **Submit** — show "Validating application → Checking documents → Notifying reviewers" as animated rows.
- Your **JSON→PostgreSQL migration** script's progress.
- Any **bulk data-quality** sweep (dedup, completeness checks).

### Recommendation Card → low-stock reorder suggestions
**Where:** `apps/web` low-stock / inventory dashboard.

**Recommendation Card** is an agent suggestion with a **confidence meter** and Accept / alternatives actions. The demo is *"Want me to place this restock order? Reorder waffle cones from cone_king with lead time 7_days"* with "High confidence" and alternative options.

This is your low-stock alert view, elevated: instead of a passive table row, surface *"Reorder 100 cases of Cola Classic from National Beverage Co. (lead time 2 days)?"* with a confidence bar derived from reorder point vs. current quantity, plus alternatives. Even without AI, you can compute a rule-based "confidence" from stock velocity.

### Insight Cards → analytics dashboards
**Where:** `apps/web` dashboards for vendor performance, inventory value, category performance.

**Insight Cards** are paged cards with scrub-ready live charts and a headline finding ("The worst performer is Rocky Road, down -6% / -$2,453.44"). Point them at your existing analytics queries:
- "Highest-value store: Airport Express — $48k retail inventory."
- "Worst on-time vendor: Snack Master Inc. — 72%."
- "Fastest-moving category at Dallas Central: Energy Drinks."

### Loading State → everywhere async
**Where:** onboarding step transitions, table loads, migration, search.

The pixel-grid **Loading State** with shimmer and elapsed time ("Churning 0.0s") is a small touch that makes waits feel intentional. Swap it in for your skeleton loaders on table fetches and the onboarding "Saving…" transitions.

---

## Part 4: Tier 3 — Onboarding & Data-Quality Polish

### Context Cards → compliance document display (onboarding)
**Where:** `apps/onboarding` document step + `apps/web` application review.

**Context Cards** show retrieved knowledge chunks with source badges. The demo literally shows *"Vendor onboarding rule — Cold-chain certification must be verified before a new dairy can be added"* and a *"Dairy Onboarding SOP.pdf"* source. Use this exact pattern to display a vendor's uploaded compliance docs (W-9, COI, food-safety cert) as source-tagged cards in the reviewer's view — with the PDF/CSV badge, file name, and a short extract.

### Diff Table → data cleanup & migration preview
**Where:** `apps/web` bulk-edit / dedup tools, and the JSON→DB migration.

**Diff Table** sweeps proposed edits through tabular data with inline highlighted changes ("Proposed menu cleanup"). Use it to preview:
- Deduplication merges ("Coca-Cola Inc." → "Coca Cola" consolidation).
- Bulk category re-assignments.
- The JSON→PostgreSQL migration, so you *see* what will change before committing.

### Fine-tune Card → product/store detail editing
**Where:** `apps/web` product and store detail pages.

**Fine-tune Card** is an inspector for adjusting properties (layout, radius, opacity, type). Repurpose the inspector pattern for editing a product's attributes (price, min/max stock, reorder point) with live-updating controls rather than a flat form.

---

## Part 5: Tier 4 — Later, If You Add an AI Copilot

These are agent-native and only pay off once there's an assistant in the app. Park them for now, but they're a natural "phase 2" if you add an MDM copilot ("ask about your data," "draft a reorder," "explain this vendor's performance"):

- **Thinking** (expandable reasoning traces)
- **Streaming Text** (answers with inline sources + follow-ups)
- **Prompt Bar** (@ sources, / commands, model picker, dictation) — could become the input for a data-Q&A assistant
- **Chat** (tabbed conversation panel)
- **Tool Chips** (compact tool-call chips)
- **Code Block** (streaming code)
- **Selection Actions** (highlight → hand to agent)

If you ever wire an LLM over your Postgres (text-to-SQL for "which vendors are late in the South region?"), the Prompt Bar + Streaming Text + Context Cards trio becomes the whole interface.

---

## Part 6: Where It Lives in the Monorepo

Because both apps share `@workspace/ui`, add reusable components there once and consume from both:

```
packages/ui/src/components/
├── records-table.tsx        # Tier 1 — vendors/products/stores
├── command-search.tsx       # Tier 1 — universal search
├── filter-chips.tsx         # Tier 1 — review queue / order status
├── sidebar-nav.tsx          # Tier 1 — MDM nav
├── approval-card.tsx        # Tier 2 — vendor approval
├── task-rows.tsx            # Tier 2 — submit / migration / bulk jobs
├── recommendation-card.tsx  # Tier 2 — reorder suggestions
├── insight-card.tsx         # Tier 2 — analytics
├── loading-state.tsx        # Tier 2 — async everywhere
├── context-card.tsx         # Tier 3 — compliance docs
└── diff-table.tsx           # Tier 3 — cleanup / migration preview
```

App-specific wiring stays in each app:

```
apps/web/
├── app/(routes)/vendors/         → RecordsTable
├── app/admin/applications/       → FilterChips + ApprovalCard + ContextCard
├── app/(dashboards)/             → InsightCard + RecommendationCard
└── components/layout/Sidebar.tsx → SidebarNav

apps/onboarding/
├── app/onboarding/               → LoadingState (step transitions), TaskRows (submit)
└── app/onboarding/steps/documents → ContextCard (uploaded docs)
```

Install command targets `@workspace/ui` (npm workspaces, matching your repo):

```bash
npx shadcn@latest add <primitive> -c packages/ui
```

Then paste Beautiful UI's component source into `packages/ui/src/components/*` and import via `@workspace/ui/components/records-table` in either app.

---

## Part 7: Keeping It On-Brand (Design Tokens)

To stop the app from looking like a pile of pasted components:

1. **Unify on your CSS variables.** Beautiful UI uses shadcn-style tokens (`--background`, `--foreground`, `--muted`, etc.). Make sure your `packages/ui` theme defines these once so every pasted component inherits your palette.
2. **Pick one accent and one radius.** Convenience-store MDM leans utilitarian — a single confident accent (say a warm amber, nodding at the retail/food domain) plus a consistent `--radius` ties Records Table, Approval Card, and Insight Card together.
3. **Reserve motion for meaning.** Use the shimmer/elapsed-time loaders and Task Rows animations for genuine state changes (saving, validating, migrating). Don't animate static content — "fun" that fires on every render becomes noise.
4. **Density matters for MDM.** These components default to generous spacing (they're designed for AI chat surfaces). For data-dense grids, tighten row height and padding so a reviewer can scan 26 vendors without scrolling.

---

## Part 8: Suggested Build Order

**First pass (visible wins in a day or two):**
1. Records Table → vendors grid
2. Filter chips → onboarding review queue
3. Sidebar Nav with live count badges

**Second pass (workflow delight):**
4. Approval Card → vendor approval decision
5. Recommendation Card → low-stock reorder prompts
6. Task Rows → onboarding submit + migration progress
7. Loading State → replace skeletons

**Third pass (polish):**
8. Insight Cards → analytics dashboards
9. Context Cards → compliance doc review
10. Diff Table → migration preview + dedup

**Phase 2 (only with an AI copilot):**
11. Prompt Bar + Streaming Text + Thinking + Chat

---

## Summary

- **Best immediate fit:** Records Table (vendors), Command Search (your Cmd+K), Filter Chips (review queue), Sidebar Nav — all Tier 1, all replacing screens you already have.
- **Biggest delight-per-effort:** Approval Card (vendor decisions), Recommendation Card (reorder prompts), Task Rows (submit/migration) — they turn your dullest moments into satisfying ones, and the demo data is already your domain.
- **Where it goes:** shared components in `packages/ui`, app-specific wiring in `apps/web` and `apps/onboarding`.
- **Skip for now:** the AI-agent components (Prompt Bar, Streaming Text, Thinking, Chat) until you add a copilot — then they become a ready-made interface.
- **Keep it coherent:** unify on your shadcn tokens, one accent + one radius, motion only for real state changes, tighten density for data grids.
