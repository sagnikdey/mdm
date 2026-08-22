# MDM Vendor Portal — Architecture Plan

The **third app** in your Turborepo: `apps/vendor-portal`. Approved vendors log in here to manage their profile, submit and maintain their product catalog, and work purchase orders from stores. It's the ongoing-use counterpart to the one-time onboarding wizard.

Decisions locked in from our conversation:

- **Every vendor edit flows through admin approval** — mirrors the `vendor_applications` → `vendors` pattern already established in onboarding. Master data integrity stays non-negotiable.
- **One seat per vendor** in v1 — a single login per vendor company, keyed on the email that owned the application.
- **v1 scope** — settings (vendor profile edits), product catalog (add/edit/deactivate), and full order lifecycle (acknowledge → ship → delivered).
- **Auth (MVP)** — magic-link only, no passwords. Vendor enters their email; we send a short-lived signed link; clicking it mints a `jose` session cookie. Same hashed-token primitive as the onboarding invite flow, reused for every login.
- **Product ingestion** — single-item form plus CSV bulk upload in Shopify's product-export format. Vendor downloads a sample CSV pre-populated with example rows, edits, reuploads. No product images in MVP; Vercel Blob when they land later.
- **Category constraint** — vendors can only submit products in categories they selected during onboarding. New categories are an MDM-side decision, not a vendor request. Enforced server-side on every submission.

---

## Part 1: Where This App Fits

```
                     ┌──────────────────────────────────────────────────────┐
                     │                    Turborepo                         │
                     ├──────────────────────────────────────────────────────┤
                     │                                                      │
  app.company        │  apps/web         apps/onboarding   apps/vendor-portal│  vendors.company
  ───────────────►   │  (MDM/admin)      (invite wizard)   (approved vendor) │  ◄──────────────
                     │       │                 │                  │          │
                     │       │  approves       │                  │          │
                     │       │  application    │                  │          │
                     │       │       └─────────┴──── handoff ────►│          │
                     │       │  reviews vendor submissions ◄──────┤          │
                     │       │                                    │          │
                     │       └────────────────────┬───────────────┘          │
                     │                            ▼                          │
                     │             packages/db  (@workspace/db)              │
                     │             packages/ui  (@workspace/ui)              │
                     └──────────────────────────────────────────────────────┘
                                                 │
                                                 ▼
                                          PostgreSQL (shared)
```

Three apps, three deploys, three domains. They coordinate only through the shared database and through the shared `packages/db` schema — no app calls another app's code. That's the same blast-radius reasoning behind splitting off the onboarding app, applied one more time.

**Why a third app and not a route group inside `apps/web`:**

- Different threat model. The vendor portal is authenticated but faces the outside internet; the MDM stays on your internal admin domain. Splitting deploys keeps a vendor-portal vulnerability from touching MDM.
- Different auth surface. MDM uses staff auth; the portal uses vendor-scoped `jose` sessions. Keeping them in separate apps means neither middleware has to branch on user type.
- Independent scaling and rate-limiting. When 400 vendors hit "sync catalog" at 9am, that shouldn't queue behind your internal admin traffic.

---

## Part 2: The Handoff — Approval Creates a Portal Account

The moment `promoteToVendor()` runs in the onboarding approval flow (Part 11 of your onboarding guide), one additional side effect fires: create a `vendor_portal_accounts` row and email a magic-link that logs the vendor straight in. There's no separate "set password" step — the first login link is just the same mechanism the vendor will use every time they come back.

```typescript
// lib/onboarding/promote.ts  (extending the version in the onboarding guide)
export async function promoteToVendor(applicationId: string) {
  return db.transaction(async (tx) => {
    const app = await tx.query.vendorApplications.findFirst({
      where: eq(vendorApplications.id, applicationId),
      with: { contacts: true, addresses: true },
    });
    if (!app) throw new Error('Application not found');

    // 1. Create the master vendor record (existing behaviour)
    const [vendor] = await tx.insert(vendors).values({ /* … */ }).returning();

    // 2. NEW: create the portal account, seeded with the categories
    //    the vendor listed during onboarding.
    const [account] = await tx.insert(vendorPortalAccounts).values({
      vendorId: vendor.vendorId,
      email: app.ownerEmail,
      status: 'active',
      allowedCategoryIds: app.suppliedCategories ?? [],
    }).returning();

    // 3. NEW: mint a first-login magic-link token and email it.
    //    Longer TTL (14 days) than a regular login token because
    //    the vendor may not check email for a while after approval.
    await issueLoginToken(tx, account.id, {
      ttlMs: 14 * 24 * 60 * 60 * 1000,
      purpose: 'welcome',
    });

    return vendor;
  });
}
```

From the vendor's side the experience is: click approval email → land on `vendors.company.com/auth/verify?token=…` → session cookie set → redirected to dashboard. Every return visit uses the same link mechanism, just with a shorter TTL.

---

## Part 3: The Staging Pattern, Generalized

You've already committed to the "everything through admin approval" model, which means the vendor portal is essentially *four* staging queues plus a set of read-only master views. Every vendor write lands in a staging table with a status field; admin acts on it in the MDM; a promotion step updates the master row.

```
   Vendor action                Staging table                  On approval →
   ─────────────                ─────────────                  ─────────────
   Edit contact/address    →    vendor_profile_edits      →    UPDATE vendors
   Add new products (bulk) →    product_submissions       →    INSERT products
                                + product_submission_items
   Edit existing product   →    product_edits             →    UPDATE products
   Deactivate a product    →    product_edits (special)   →    UPDATE products SET is_active=false
```

Order lifecycle is different — vendors act directly on existing `orders` rows within a bounded set of allowed transitions (see Part 6). That's not "creating new master data," it's "advancing a lifecycle you already own," so the approval-gate pattern doesn't apply there.

### 3.1 New tables (add to `packages/db/src/schema/vendor-portal.ts`)

```typescript
import {
  pgTable, uuid, serial, integer, varchar, text, timestamp,
  jsonb, boolean, pgEnum, decimal,
} from 'drizzle-orm/pg-core';
import { vendors } from './mdm.js';

// ---- Account ----
export const portalAccountStatus = pgEnum('portal_account_status', [
  'active', 'suspended',
]);

export const vendorPortalAccounts = pgTable('vendor_portal_accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  vendorId: integer('vendor_id').notNull().references(() => vendors.vendorId, { onDelete: 'cascade' }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  status: portalAccountStatus('status').notNull().default('active'),
  // The categories this vendor is allowed to submit products in.
  // Seeded on approval from vendor_applications.suppliedCategories.
  // Admin can widen this later in the MDM.
  allowedCategoryIds: jsonb('allowed_category_ids').$type<number[]>().notNull().default([]),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// One row per magic-link ever issued. Single-use — usedAt is set on redemption.
export const vendorPortalLoginTokens = pgTable('vendor_portal_login_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  accountId: uuid('account_id').notNull().references(() => vendorPortalAccounts.id, { onDelete: 'cascade' }),
  tokenHash: varchar('token_hash', { length: 64 }).notNull().unique(),
  purpose: varchar('purpose', { length: 32 }).notNull().default('login'),  // login | welcome
  expiresAt: timestamp('expires_at').notNull(),
  usedAt: timestamp('used_at'),
  requestedFromIp: varchar('requested_from_ip', { length: 45 }),  // for abuse review
  createdAt: timestamp('created_at').defaultNow(),
});

// ---- Staging: profile edits ----
export const submissionStatus = pgEnum('submission_status', [
  'pending', 'approved', 'rejected',
]);

export const vendorProfileEdits = pgTable('vendor_profile_edits', {
  id: uuid('id').defaultRandom().primaryKey(),
  vendorId: integer('vendor_id').notNull().references(() => vendors.vendorId, { onDelete: 'cascade' }),
  submittedBy: varchar('submitted_by', { length: 255 }).notNull(), // vendor account email
  proposedChanges: jsonb('proposed_changes').notNull(),            // { field: newValue, ... }
  currentSnapshot: jsonb('current_snapshot').notNull(),            // vendors row at submit time
  status: submissionStatus('status').notNull().default('pending'),
  reviewNote: text('review_note'),
  reviewedBy: varchar('reviewed_by', { length: 255 }),
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ---- Staging: new products (batch-oriented) ----
export const productSubmissions = pgTable('product_submissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  vendorId: integer('vendor_id').notNull().references(() => vendors.vendorId, { onDelete: 'cascade' }),
  submittedBy: varchar('submitted_by', { length: 255 }).notNull(),
  source: varchar('source', { length: 32 }).notNull(),  // 'single_form' | 'csv_upload'
  status: submissionStatus('status').notNull().default('pending'),
  itemCount: integer('item_count').notNull(),
  reviewNote: text('review_note'),
  reviewedBy: varchar('reviewed_by', { length: 255 }),
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const productSubmissionItems = pgTable('product_submission_items', {
  id: serial('id').primaryKey(),
  submissionId: uuid('submission_id').notNull().references(() => productSubmissions.id, { onDelete: 'cascade' }),

  // The proposed product (mirrors columns on products, but vendor-scoped)
  proposedSku: varchar('proposed_sku', { length: 50 }).notNull(),
  productName: varchar('product_name', { length: 255 }).notNull(),
  categoryId: integer('category_id'),
  vendorSku: varchar('vendor_sku', { length: 100 }).notNull(),
  description: text('description'),
  unitOfMeasure: varchar('unit_of_measure', { length: 50 }),
  unitsPerCase: integer('units_per_case').default(1),
  wholesalePrice: decimal('wholesale_price', { precision: 10, scale: 2 }).notNull(),
  weight: decimal('weight', { precision: 8, scale: 3 }),
  barcode: varchar('barcode', { length: 50 }),
  manufacturer: varchar('manufacturer', { length: 255 }),
  // imageKey deferred to post-MVP (Vercel Blob)

  // Per-item review — admin can approve a batch with some rejected items
  itemStatus: submissionStatus('item_status').notNull().default('pending'),
  itemNote: text('item_note'),
  createdSku: varchar('created_sku', { length: 50 }),  // populated after promotion
});

// ---- Staging: edits to already-live products ----
export const productEdits = pgTable('product_edits', {
  id: uuid('id').defaultRandom().primaryKey(),
  vendorId: integer('vendor_id').notNull().references(() => vendors.vendorId, { onDelete: 'cascade' }),
  sku: varchar('sku', { length: 50 }).notNull(),      // FK to products.sku
  submittedBy: varchar('submitted_by', { length: 255 }).notNull(),
  editType: varchar('edit_type', { length: 32 }).notNull(),  // 'update' | 'deactivate'
  proposedChanges: jsonb('proposed_changes').notNull(),
  currentSnapshot: jsonb('current_snapshot').notNull(),
  status: submissionStatus('status').notNull().default('pending'),
  reviewNote: text('review_note'),
  reviewedBy: varchar('reviewed_by', { length: 255 }),
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('created_at').defaultNow(),
});
```

### 3.2 Why the shape looks like this

**The `currentSnapshot` column matters.** Between the time the vendor submits an edit and the time an admin approves it, another approved edit could have modified the master row. Storing the snapshot lets the reviewer see a real diff and gives you a natural conflict-detection point: if `vendors.updatedAt > edit.createdAt`, warn the reviewer before they promote.

**Batch-and-items for product submissions.** A vendor uploading a 200-row CSV wants one submission the admin can approve or reject as a unit, but the admin needs line-level control (approve 195, reject the 5 with duplicate barcodes). One `product_submissions` row per upload, many `product_submission_items` under it, per-item status.

**Deactivation is an edit, not a separate table.** A soft-delete is just an edit whose `proposedChanges` is `{ isActive: false }`, so `product_edits` covers it with `editType = 'deactivate'`. Keeps the reviewer workflow uniform.

**Proposed SKU vs created SKU.** The vendor proposes a SKU, but your MDM may have its own SKU-assignment rules or need to reject a duplicate. `proposedSku` is what the vendor typed; `createdSku` is what actually got inserted into `products` on promotion. This lets the vendor's UI show "Your submission for BEV-COLA-24 was approved as PRD0037."

---

## Part 4: Auth Model in Detail

Magic-link only, no passwords. The whole model is: vendor enters email → we email a short-lived signed link → clicking it verifies the token and mints a session cookie. Every visit uses the same mechanism; the "welcome" email from approval is just a login link with a longer TTL.

**Files (in `apps/vendor-portal`):**

```
lib/
├── auth/
│   ├── session.ts        # jose sign/verify (session cookie); ports directly from onboarding
│   ├── tokens.ts         # magic-link issuance + redemption
│   └── email.ts          # thin wrapper: "here is your login link"
middleware.ts             # protects everything except /login and /auth/*
```

**Session shape:**

```typescript
export interface VendorPortalSession {
  accountId: string;
  vendorId: number;   // pre-resolved so every query can filter by it without a join
  email: string;
}
```

**Middleware guards everything vendor-scoped:**

```typescript
// apps/vendor-portal/middleware.ts
export const config = {
  matcher: [
    '/((?!login|auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

**The three routes that do all the work:**

`POST /api/auth/request` — vendor submits their email on `/login`. Look up the account. If it exists and is `active`, mint a login token (32 random bytes → base64url raw token → SHA-256 hash stored), 15-minute TTL, purpose `login`, and email the link `${VENDOR_PORTAL_URL}/auth/verify?token=<raw>`. If the email doesn't match any account, **still return the same success response** — never reveal whether an email is registered. That's the one leak worth being careful about here.

`GET /auth/verify?token=…` — the redemption endpoint. Hash the incoming token, look it up in `vendor_portal_login_tokens`. Reject if missing, used, expired, or the account is suspended. On success: mark the token used, update `lastLoginAt`, mint the `jose` session cookie (7-day sliding expiry), redirect to `/dashboard`.

`POST /api/auth/logout` — clears the session cookie. That's it.

The "welcome" email from `promoteToVendor()` uses the exact same token table with `purpose='welcome'` and a 14-day TTL — the redemption endpoint doesn't need to care about the distinction; it's only there for observability ("did they ever click the first email?").

**Every server action and route handler starts with:**

```typescript
const session = await requireVendorSession();
// session.vendorId is now trustworthy — use it in every WHERE clause
```

The critical invariant: no query in this app ever accepts `vendorId` from the client. It always comes from the session. That's the single line of defense between vendor A and vendor B's data.

**Why this is safe enough for MVP:** the security posture is essentially "possession of the email account = access to the portal," which is the same posture you'd have with password + reset flow anyway (whoever controls the inbox can trigger a reset). Skipping the password step removes an entire class of bugs (weak passwords, credential stuffing, reset flows, storage) at the cost of a short login round-trip each session. For a vendor logging in a few times a week to work orders, that trade is fine. When multi-user support arrives post-MVP, this is also the right foundation to add SSO on top of.

---

## Part 5: Product Catalog Module

The catalog is the heart of the portal and the module most likely to be used every week. Three surfaces:

**Catalog list (`/catalog`)** — a table of the vendor's live products (rows from `products WHERE vendor_id = session.vendorId`) with three status badges: "Live" (approved and active), "Pending edits" (has a row in `product_edits` with status='pending'), and "Deactivated." Each row has an Edit button. A "+ Add products" button opens the add flow.

**Pending submissions (`/catalog/pending`)** — a table of the vendor's `product_submissions` rows, grouped by batch, so a vendor can see "your CSV upload from 2 days ago: 195 approved, 5 rejected, view details." Rejected items show the reviewer's note.

**Add products flow (`/catalog/add`)** — two tabs:

- **Single item** — a shadcn form matching the columns on `product_submission_items`. The category dropdown is populated **only** from `session.allowedCategoryIds` — a vendor approved for beverages can't add a bakery product without an MDM-side category expansion first. No image field for MVP.
- **Bulk CSV (Shopify format)** — a dropzone that accepts Shopify's standard product-export CSV. The vendor downloads a sample file (pre-populated with a few example rows in the exact format Shopify exports), edits the rows, and reuploads. The client parses it (Papaparse), maps Shopify columns to our schema, shows a preview table with per-row inline validation errors, and lets the vendor fix issues in-line before submitting. On submit, one `product_submissions` row is inserted and N `product_submission_items` rows in a single transaction.

**Edit an existing product (`/catalog/[sku]/edit`)** — a form pre-populated from the current `products` row. On save, insert a `product_edits` row (never touch `products` directly). If a pending edit already exists for that SKU, block the form and tell the vendor "you have a pending edit — either wait for review or cancel it." This avoids two edits stacking on the same product with unclear precedence.

### 5.1 CSV — Shopify format mapping

Shopify's product CSV is the de facto standard among suppliers who already sell online, so meeting them where they are dramatically reduces friction. The vendor exports from Shopify (or edits our sample), uploads, done — no reformatting.

The sample file `vendor-products-template.csv` shipped as a static asset from `/catalog/add` includes two or three fully-populated example rows so the vendor sees exactly what "good" looks like.

| Shopify column         | Maps to `product_submission_items` field | Notes                                              |
|------------------------|-------------------------------------------|----------------------------------------------------|
| `Handle`               | (ignored)                                 | Shopify URL slug; not meaningful here              |
| `Title`                | `productName`                             |                                                    |
| `Body (HTML)`          | `description`                             | Client strips HTML tags before submit              |
| `Vendor`               | (ignored)                                 | Always the session vendor; never trust the file    |
| `Product Category`     | `categoryId`                              | Looked up server-side against allowed categories   |
| `Type`                 | (fallback for `Product Category`)         | Used if `Product Category` is empty                |
| `Variant SKU`          | `vendorSku`                               | Their SKU, not ours                                |
| `Variant Grams`        | `weight` (converted to lbs)               | Client-side conversion in preview                  |
| `Variant Price`        | `wholesalePrice`                          |                                                    |
| `Variant Barcode`      | `barcode`                                 |                                                    |
| `Image Src`            | (ignored in MVP)                          | Reserved for post-MVP Vercel Blob integration      |

Not sourced from CSV, filled server-side:

- `proposedSku` — auto-assigned by MDM on approval (see Part 7 promotion logic), never accepted from the vendor.
- `unitOfMeasure`, `unitsPerCase`, `manufacturer` — not in the standard Shopify export. Optional extra columns; if absent, defaults apply (`unit`, `1`, null). If a vendor needs to set these, they can add the columns to the CSV or use the single-item form.

**Enforcement rules on parse:**

- Unknown columns are ignored with a warning shown in preview ("we ignored these columns: Gift Card, SEO Title…") — this is safer than rejecting because Shopify exports include a lot of columns we don't need.
- Missing *required* Shopify columns (Title, Variant Price) fail the whole upload.
- Category lookup happens server-side using a case-insensitive match against the vendor's `allowedCategoryIds`. A row with a category the vendor isn't approved for is flagged in preview with a specific error ("You're not approved to submit in category 'Bakery Items'. Contact your MDM admin to add this category.") — the vendor can fix the category or drop the row.

### 5.2 What the vendor never sees on the CSV

Notably absent from both the CSV columns *and* the single-item form:

- **`sku`** — the MDM assigns this on approval (`PRD` + auto-increment; the vendor's `Variant SKU` is preserved separately in `vendor_sku` for their reference).
- **`retail_price`** — set per-store via `store_product_availability`, not vendor-owned.
- **`vendor_id`** — always from session, never from client.

Not letting vendors set those anywhere is what keeps the master model clean.

---

## Part 6: Order Lifecycle Module

Orders are already created by MDM staff (or eventually a store app) in the `orders` and `order_items` tables. The vendor's job is to work them through the lifecycle. Reading the existing schema, the status field already supports the states you need — just formalise the transitions.

```
   Store places order          Vendor acknowledges     Vendor ships          Vendor confirms delivery
   ─────────────────           ───────────────────     ────────────          ────────────────────────
     pending             →         confirmed        →    shipped         →       delivered

                                       │
                                       │  (vendor declines — with reason)
                                       ▼
                                   cancelled
```

**Vendor-permitted transitions in v1:**

| From        | To         | Vendor-side action                                       |
|-------------|------------|----------------------------------------------------------|
| pending     | confirmed  | "Acknowledge" — locks in commitment, no changes          |
| pending     | cancelled  | "Decline" — vendor picks a reason (OOS, MOQ not met…)    |
| confirmed   | shipped    | "Mark shipped" — captures actual ship date + tracking     |
| shipped     | delivered  | "Confirm delivered" — sets `actual_delivery_date`         |

Later, when a store app exists, `delivered` becomes store-side confirmation instead — but v1 lets the vendor close the loop because there's nothing on the receiving end yet.

**Schema additions to the existing `orders` table** (minor — additive columns):

```typescript
// In packages/db/src/schema/mdm.ts, add to orders table:
trackingNumber: varchar('tracking_number', { length: 100 }),
carrier: varchar('carrier', { length: 100 }),
shippedAt: timestamp('shipped_at'),
vendorDeclineReason: varchar('vendor_decline_reason', { length: 255 }),
```

**Portal routes:**

- `/orders` — table of all orders for this vendor, filterable by status. Default view: "needs action" (pending + confirmed + shipped).
- `/orders/[orderNumber]` — order detail with line items (`order_items` join to `products`), delivery address (from `stores`), and the action button appropriate to current status.

**Per-item receiving is out of scope for v1.** The `order_items.received_quantity` column exists on your schema and is genuinely useful, but it's a receiving-side concern — either store staff or MDM staff should populate it. Adding it to the vendor portal creates a "vendor claims all 100 units shipped, store received 92" reconciliation problem that's better left to the eventual store app. For v1, "shipped" and "delivered" are order-level, not line-item-level.

**A guardrail worth adding:** on the "mark shipped" action, validate that all order lines have a product with `is_active = true` and that the vendor still owns those products. It'll almost never fail, but if it does, you've caught a data drift bug before it becomes a delivery dispute.

---

## Part 7: Admin Side — Review Queues in `apps/web`

Everything the vendor portal writes to staging tables has to be reviewable in the MDM. This is a new module in `apps/web`, structured similarly to the vendor application review queue from your onboarding guide.

```
apps/web/app/admin/
├── vendor-submissions/
│   ├── page.tsx                         # unified inbox — all pending items across all vendors
│   ├── profile-edits/
│   │   └── [id]/page.tsx                # review a profile edit
│   ├── product-submissions/
│   │   └── [id]/page.tsx                # review a product batch — per-item approve/reject
│   └── product-edits/
│       └── [id]/page.tsx                # review an edit on an existing product (with diff)
```

**Unified inbox** matters because reviewers should think in terms of "what's waiting for me?" rather than "which of four queues do I check?" One table, three columns: submission type, vendor, submitted-at. Filter by type when needed.

**The diff view is the killer feature.** For every edit-style submission, show a side-by-side "current vs. proposed" using `currentSnapshot` from the staging row. Highlight the fields that actually changed. This makes review take seconds instead of minutes and dramatically reduces mistakes.

**Promotion happens in a transaction, always** — same shape as `promoteToVendor()` in your onboarding guide:

```typescript
// apps/web/lib/vendor-submissions/promote-profile-edit.ts
export async function promoteProfileEdit(editId: string, reviewerEmail: string) {
  return db.transaction(async (tx) => {
    const edit = await tx.query.vendorProfileEdits.findFirst({
      where: eq(vendorProfileEdits.id, editId),
    });
    if (!edit) throw new Error('Edit not found');
    if (edit.status !== 'pending') throw new Error('Already reviewed');

    // Conflict check — did the master row change since submission?
    const current = await tx.query.vendors.findFirst({
      where: eq(vendors.vendorId, edit.vendorId),
    });
    if (current && current.updatedAt > edit.createdAt) {
      throw new ConflictError('Vendor record modified since this edit was submitted');
    }

    await tx.update(vendors)
      .set(edit.proposedChanges as Partial<typeof vendors.$inferInsert>)
      .where(eq(vendors.vendorId, edit.vendorId));

    await tx.update(vendorProfileEdits)
      .set({ status: 'approved', reviewedBy: reviewerEmail, reviewedAt: new Date() })
      .where(eq(vendorProfileEdits.id, editId));
  });
}
```

Product-submission promotion is more involved because it's batch + per-item, but same shape: for every item marked `approved` in the batch, insert into `products` (**auto-assigning `sku` as `PRD` + zero-padded auto-increment** from a dedicated sequence — the vendor's proposed SKU only ever populates `products.vendor_sku`), write the assigned SKU back to `product_submission_items.createdSku` so the vendor can see it, mark the batch approved. Items marked `rejected` stay in place with their note.

**Notifications are batched, not per-item.** When a reviewer completes a product-submission decision (approving 195 items and rejecting 5, say), that fires **one** email to the vendor: "Your submission from Aug 20 has been reviewed. 195 products approved, 5 needing changes. View details →". Never 200 emails. The notification service takes the whole submission and its items and renders a summary; per-item detail lives behind the link. Same rule for profile edits — one email per decision.

---

## Part 8: File & Route Layout for `apps/vendor-portal`

```
apps/vendor-portal/
├── app/
│   ├── login/page.tsx                   # single form: enter email → we send a link
│   ├── auth/
│   │   ├── verify/page.tsx              # redeems ?token=… → session → /dashboard
│   │   └── sent/page.tsx                # "check your email" confirmation screen
│   ├── (portal)/                        # route group — all pages under here are auth-gated
│   │   ├── layout.tsx                   # shared shell with nav
│   │   ├── dashboard/page.tsx           # summary — orders needing action, pending submissions
│   │   ├── settings/
│   │   │   ├── page.tsx                 # current profile (read-only view)
│   │   │   └── edit/page.tsx            # edit form → creates a vendor_profile_edits row
│   │   ├── catalog/
│   │   │   ├── page.tsx                 # live products list
│   │   │   ├── pending/page.tsx         # submissions in review
│   │   │   ├── add/page.tsx             # tabs: single item | CSV
│   │   │   └── [sku]/edit/page.tsx      # edit an existing product
│   │   └── orders/
│   │       ├── page.tsx                 # order list, default filter "needs action"
│   │       └── [orderNumber]/page.tsx   # detail + action button
│   └── api/
│       ├── auth/
│       │   ├── request/route.ts         # POST — issue a magic link, email it
│       │   └── logout/route.ts
│       ├── submissions/
│       │   ├── profile/route.ts         # POST — create profile-edit submission
│       │   ├── products/route.ts        # POST — create batch submission
│       │   └── product-edits/route.ts   # POST — create per-SKU edit
│       └── orders/
│           └── [orderNumber]/
│               ├── acknowledge/route.ts
│               ├── decline/route.ts
│               ├── ship/route.ts
│               └── deliver/route.ts
│       # NOTE: /api/uploads/product-image deferred to post-MVP (Vercel Blob)
├── lib/
│   ├── auth/                            # session, tokens (Part 4)
│   ├── csv/
│   │   ├── sample.ts                    # generates the Shopify-format sample CSV
│   │   ├── parse.ts                     # Papaparse + Shopify→schema mapping + Zod
│   │   └── schema.ts                    # row schema (shared with single-item form)
│   ├── submissions/                     # server actions that create staging rows
│   └── orders/                          # state-machine guard functions
├── middleware.ts
├── next.config.mjs
└── package.json
```

---

## Part 9: Deployment

Three Vercel (or equivalent) projects pointed at the same repo, different root directories, different domains:

| Project             | Root                 | Domain                    | Extra env                                                      |
|---------------------|----------------------|---------------------------|----------------------------------------------------------------|
| `mdm-web`           | `apps/web`           | `app.company.com`         | Staff auth, `ONBOARDING_APP_URL`, `VENDOR_PORTAL_URL`          |
| `mdm-onboarding`    | `apps/onboarding`    | `onboarding.company.com`  | `ONBOARDING_SESSION_SECRET`                                    |
| `mdm-vendor-portal` | `apps/vendor-portal` | `vendors.company.com`     | `VENDOR_PORTAL_SESSION_SECRET` (Vercel Blob token added post-MVP)  |

All three share `DATABASE_URL`. The MDM knows both public app URLs so it can build activation and invitation links; the public apps know nothing about the MDM.

---

## Part 10: Security Checklist

- [ ] Every server action starts with `requireVendorSession()`; `vendorId` never comes from the client.
- [ ] Every query touching vendor data has `WHERE vendor_id = session.vendorId` — this is your tenant isolation. Consider a lint rule or a wrapping helper that enforces it.
- [ ] Magic-link tokens: 32 random bytes, base64url, stored as SHA-256, single-use. TTL 15 min for regular logins, 14 days for the "welcome" token from approval.
- [ ] `POST /api/auth/request` returns the same success response whether or not the email is registered — never leak account existence.
- [ ] Session cookie: httpOnly, secure, sameSite=lax, signed with `VENDOR_PORTAL_SESSION_SECRET`; secret is different from the onboarding app's secret. 7-day sliding expiry.
- [ ] Rate limit `/api/auth/request` (3 per email per hour, 10 per IP per hour). Rate limit `/auth/verify` on failed redemptions per IP to blunt token guessing (though 32 bytes makes brute-force infeasible).
- [ ] Log `requestedFromIp` on every issued token so you can spot abuse patterns later.
- [ ] CSV upload size cap (e.g. 5MB) enforced before parse; row cap of 5,000 enforced during parse (raise later if needed).
- [ ] **Category enforcement is server-side, not client-side.** Every incoming `product_submission_items` row is validated against `session.allowedCategoryIds`; a row referencing a category the vendor isn't approved for is rejected regardless of what the client sent.
- [ ] Admin actions on submissions are transactional and check `status = 'pending'` inside the transaction to prevent double-approval races.
- [ ] Audit log entries written for every promotion (extends your existing `audit_log` table).

---

## Part 11: Build Order

1. **Extend `packages/db`** with `vendor-portal.ts` (accounts, activations, all four staging tables) plus the additive columns on `orders`. Generate + run migration.
2. **Scaffold `apps/vendor-portal`** — new Next.js app in the workspace, depends on `@workspace/ui` and `@workspace/db`.
3. **Port auth from `apps/onboarding`** — session helpers, plus the two new routes (`/api/auth/request` and `/auth/verify`) and the `/login` and `/auth/sent` screens. Small surface, mostly copy-and-adapt.
4. **Extend `promoteToVendor()`** in `apps/web` to create the portal account and issue the welcome login token. Test end-to-end: approve an application, receive email, click link, land in dashboard.
5. **Ship Settings first** — read-only profile view + edit form + `POST /api/submissions/profile`. This proves the whole staging-and-approve loop with the smallest possible surface.
6. **Ship the admin review queue for profile edits** in `apps/web`. Now approval closes the loop.
7. **Add Catalog — read side** (`/catalog` list of live products). No writes yet.
8. **Add single-item Add Product flow** + admin review for `product_submissions` with promotion into `products`.
9. **Add CSV bulk upload** — client-side parse with Papaparse, preview with inline validation, batch submit.
10. **Add product Edit + Deactivate flows** + admin diff-view review.
11. **Add Orders module** — list, detail, and the four state-transition actions. Each transition is its own route handler with a state-guard helper.
12. **Polish** — dashboard, notification emails on submission approve/reject, rate limiting.

Ship steps 1–6 as v0.5 (settings only). That's the earliest point at which the whole architecture is real and can be exercised end-to-end, and it's cheap to fix mistakes here before catalog and orders are built on top.

---

## Part 12: Closed Decisions & One New Prerequisite

All open questions from the previous draft have been resolved:

1. **Product images** — none in MVP; Vercel Blob when they land later. Schema and file layout reflect this (no `imageKey` column, no upload route).
2. **SKU assignment** — MDM auto-assigns on approval (`PRD` + zero-padded auto-increment). Vendor's proposed SKU only ever lives in `products.vendor_sku`.
3. **CSV format** — Shopify's standard product-export CSV. Vendor downloads a sample file with example rows, edits, reuploads. Client maps Shopify columns to our schema; unknown columns ignored with a warning.
4. **Notifications** — batched per decision. One reviewer action = one email, regardless of item count.
5. **Category management** — vendors are constrained to the categories they picked during onboarding (`vendorPortalAccounts.allowedCategoryIds`). No new-category requests from vendors in MVP.

**One new prerequisite this uncovered.**

Because vendors can only submit in their approved categories and there's no mechanism for them to request new ones, **the MDM needs a category management module** — a settings screen in `apps/web` where staff can create and edit categories, and (crucially) widen a vendor's `allowedCategoryIds` when they expand into new product lines. This isn't part of the vendor portal itself, but it's a hard prerequisite: without it, a vendor whose business grows into a new category has no path to add products in that category, and staff has no way to unblock them.

Suggested scope for that module (not spec'd out here, but flagging so it lands on your MDM backlog):

- CRUD on the existing `categories` table (respecting the hierarchical `parent_category_id` structure).
- On a vendor's detail page, an "Allowed categories" section — staff can add or remove category IDs from `vendorPortalAccounts.allowedCategoryIds` (writes should be audit-logged given they expand vendor capabilities).
- Guardrails on deactivating a category that has live products.

Consider building at least the "widen a vendor's allowed categories" piece before the vendor portal ships — otherwise the first vendor who needs an expanded category will require a database patch.

---

## Summary

- **Third app in the monorepo**: `apps/vendor-portal`, own domain, own auth, shares `@workspace/db` and `@workspace/ui`. Zero code shared with `apps/web`; they meet only at the database.
- **Handoff**: on vendor approval, the existing `promoteToVendor()` also creates a portal account and emails a magic-link (longer TTL for the first one). No passwords in MVP — every login is a fresh short-lived link.
- **Every vendor write goes through admin approval**: four staging tables (`vendor_profile_edits`, `product_submissions` + `product_submission_items`, `product_edits`) mirror the onboarding pattern. Master data never receives a direct vendor write.
- **Catalog module** supports both single-item entry and CSV bulk upload with client-side validation. Admin reviews batches with per-item control.
- **Order lifecycle** is direct-on-`orders` (not staging), bounded by a state machine: pending → confirmed → shipped → delivered, with decline available from pending.
- **Ship a settings-only v0.5 first** to exercise the whole staging + approval loop before catalog and orders are layered on top.
