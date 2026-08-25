# MDM Vendor Portal — Product Onboarding Module

How an approved vendor adds products through `apps/vendor-portal`. All three entry paths write into one **draft** submission. The vendor clicks **Send for review** once. MDM reviews that packet as a unit.

This document replaces the earlier intake spec. It is aligned with the tables and forms that already exist (`products`, `product_submissions`, `product_submission_items`, `/products/new`).

---

## Locked decisions

| Topic | v1 decision |
|---|---|
| Sellable unit | Vendor chooses. They may submit **case only**, or **case and the matching single**. Same underlying drink can be one SKU or two. |
| Bulk files | Native column schema. Accept **`.xlsx` and `.csv`**. Not Shopify-format mapping. |
| Master fields | Only columns MDM can store, show, and approve. See Part 6. |
| Duplicate barcode | **Error.** Unique per vendor across live catalog + draft + pending. Cross-vendor duplicates are allowed. |
| Barcode lookup | **Open Food Facts only.** No UPCitemDB in v1. Miss → manual form with barcode filled. |
| Review | Vendor accumulates, then **Send for review** once. Admin **approves or rejects the whole packet**. No per-item decisions. Expected size: ~30 products, hard cap **120**. |
| Category | One **leaf** `category_id`. No separate subcategory field. Constrained to `allowedCategoryIds`. |
| Images | Still post-MVP. |
| Camera scan | Deferred. Typing and hardware scanners (keystrokes) are enough. |
| Compliance pack | Ingredients, allergens, nutrition facts, hazmat, ABV, certifications, dimensions, tags, MSRP — **out of v1**. |

---

## Part 1: How intake works

The vendor is not sending a review request on every row. They are building a draft catalog, then submitting it.

```
  Add (bulk / barcode / manual)  →  draft submission (editable)
                                           │
                                  Send for review
                                           │
                                  status = pending
                                           │
                              MDM: Approve all  |  Reject all
                                           │
                         INSERT products     items return to draft
                         (auto PRD SKU)      with the review note
```

**Rules**

- At most **one draft** and at most **one pending** packet per vendor.
- If a packet is pending, the vendor can look at it but cannot add, edit, or send again until MDM decides.
- Reject puts the packet back to **draft** with `review_note` visible. The vendor fixes and resends.
- Approve promotes every item. MDM assigns `PRD` + zero-padded increment. Vendor SKU stays on `products.vendor_sku`.

Routes stay under `/products` (already shipped), not `/catalog`:

| Route | Role |
|---|---|
| `/products` | Live SKUs + a banner if a draft or pending packet exists |
| `/products/add` | Three tabs: Bulk, Barcode, Manual. Writes into the draft |
| `/products/review` | Draft contents, row actions, **Send for review** |
| `/products/[sku]` | Live product (read-only in v1; edits are a later portal module) |

Allowed-categories banner on `/products/add`:

> You're approved to submit in: **Soft Drinks, Chips & Crisps**. Need another category? Contact your MDM buyer — they widen this on the vendor record.

No self-service category expansion.

---

## Part 2: Pack model — case, or case and single

MDM already treats a product as an **orderable SKU**. Seed data is a case (`units_per_case = 24`). Vendors who only sell cases keep that model. Vendors who also sell the inner unit submit a second SKU and link it.

| Vendor sells | What they submit |
|---|---|
| Case only | One row. `pack_type = case`, `pack_size = 24`, `units_per_case = 24`, `base_unit_vendor_sku` empty. |
| Case and single | Two rows. Single: `pack_type = single`, `pack_size = 1`. Case: `pack_type = case`, `pack_size = 24`, `base_unit_vendor_sku` = the single's vendor SKU. |
| Consumer multi-pack (6-pack) as its own sellable SKU | `pack_type = multi_pack`. Optional link to the single if they also sell it. |

`units_per_case` is the operational order quantity (what a store PO line buys). `pack_size` is how many consumer units are inside that SKU. For case-only they are the same number.

`multi_pack` vs `case` is labels only in v1. No inventory rollup, substitution, or per-oz pricing yet. Capture the link so we do not have to backfill later.

On approval, resolve `base_unit_vendor_sku` → `products.base_unit_sku` by `vendor_id` + `vendor_sku` (live or another item in this same packet). If the base row was not in the packet and is not live, approve the case with `base_unit_sku = null` and a note. The vendor can link later via product edit (post-v1).

---

## Part 3: Three entry paths

`/products/add` — segmented control, this order:

1. **Bulk upload** — `.xlsx` or `.csv`
2. **Barcode** — type or hardware-scan a UPC, auto-fill from Open Food Facts
3. **Manual** — empty form (already exists at `/products/new`; fold it into this page)

All three **append to the draft**. None of them call MDM by themselves.

### 3.1 Bulk — Excel and CSV

Same native columns. Template download is per-vendor because the Allowed Values sheet lists **that** vendor's leaf categories.

**Excel (`.xlsx`)**

- Sheet `Products`: header row, frozen legend row, three example rows, then data.
- Sheet `Allowed Values`: leaf category names (and ids), pack types, weight units.
- Sheet `Instructions`: required vs optional, pack linkage (`base_unit_vendor_sku` must match another row's `vendor_sku` or a live SKU).

**CSV (`.csv`)**

- Same header names as the Products sheet. No extra sheets. Allowed values are in the downloadable Excel; CSV users copy from there or from the on-page banner.

Upload: dropzone accepts `.xlsx` and `.csv`. **Server parses and validates** (SheetJS on the server for xlsx). Client may show a busy state; the preview is the draft table returned by the API. Do not trust a browser-only parse.

Preview is the draft itself (persisted), not an in-memory grid. Vendor can remove a row or open it in the manual form to fix it. **Send for review** stays disabled while any draft row has a blocking error.

Parser rules:

- Unknown columns: skip, show a notice listing them.
- Missing required columns: fail the file, name the columns.
- Empty rows: skip.
- Category match: case-insensitive against allowed **leaf names**; store `category_id`.
- Row cap: **120**. Over that, reject the file with "Split this into a smaller upload (max 120)."
- File size cap: **5 MB**, before parse.

Appending a file to a draft that already has rows is allowed, as long as the combined count stays ≤ 120. Duplicate `vendor_sku` or barcode against draft + live still errors.

### 3.2 Barcode — Open Food Facts only

1. Input auto-focused. Placeholder: "Scan or type barcode." Hardware scanners emit keystrokes + Enter. Camera is out of v1.
2. `GET /api/products/lookup?barcode=…` (session required).
3. Server: normalize digits → check `barcode_lookup_cache` → if miss, Open Food Facts `https://world.openfoodfacts.org/api/v2/product/{barcode}.json` with a contactable User-Agent → cache the **public** payload 30 days → return a normalized partial product.
4. Match: manual form, auto-filled fields badged "From Open Food Facts." Vendor must still set vendor SKU, wholesale, category, pack fields.
5. Miss: same form, barcode filled, everything else empty.
6. Save appends one draft item with `source = barcode_lookup`.

Lookup cache stores **public OFF fields only** (name, brand, quantity hint, barcode). Never cache another vendor's wholesale, vendor SKU, or draft row. Do not show "from cache" in the UI.

If the barcode already exists on this vendor's live catalog, draft, or pending packet: **do not lookup**. Return an error naming the existing vendor SKU / draft row.

Rate-limit lookup: 30 requests per account per hour.

### 3.3 Manual

Same field set as auto-fill, all empty. Pack type is the first question (case only vs also selling the single). Submit appends to the draft with `source = single_form`.

---

## Part 4: Send for review

`/products/review` is the working packet.

- Table of draft items (name, vendor SKU, barcode, category, pack type, wholesale, validation status).
- Remove row. Edit row (reopens the manual form).
- Blocking errors listed per row.
- Primary button: **Send for review** — enabled only when count is 1–120 and every row is valid.

On send, server re-runs every rule (including uniqueness) inside a transaction, then sets `product_submissions.status = 'pending'`. Vendor sees a read-only "Waiting for MDM" state.

Admin (`/admin/vendor-submissions/product-submissions/[id]`): one packet, the same columns that land on `products`, **Approve packet** or **Reject packet** with a note. No per-item toggles in v1. Promotion is already transactional and already assigns `PRD` SKUs.

One email (or console log, until mail is wired) per decision, never per item.

---

## Part 5: Validation

Runs in the form, again on file parse, and again on **Send for review**. Server is source of truth.

**Uniqueness (per vendor)**

- `vendor_sku` unique across live `products` + this vendor's draft/pending items.
- `barcode` unique across the same set when a barcode is present. Empty barcode is allowed only if **No barcode** is checked. Two "no barcode" rows are fine.

**Pack**

- `pack_type` is `single` | `multi_pack` | `case`.
- `pack_size` ≥ 1. If `single`, `pack_size` must be 1.
- `base_unit_vendor_sku` only when `pack_type != single`. Must match another row in this packet or a live product for this vendor. Broken link is a blocking error.
- `units_per_case` ≥ 1.

**Category**

- Leaf id in `allowedCategoryIds` (including descendants already expanded when the portal account was granted). Server-side always.

**Format**

- Wholesale: greater than 0, two decimals, less than 10,000.
- Barcode (when present): digits only, length 8, 12, 13, or 14, checksum valid. Wrong check digit gets a specific error.
- Weight: ≥ 0. `weight_unit` one of `lb`, `oz`, `g`, `kg`. Existing MDM rows are treated as `lb`.

**Send**

- Packet size 1–120.
- No pending packet already in flight.

---

## Part 6: v1 fields

Executive cut: **if MDM cannot store it and a reviewer cannot see it, the vendor does not enter it.**

Additive columns (nullable where noted) on `products` and `product_submission_items`. Existing seed rows keep working (`brand` null, `weight_unit = 'lb'`, `pack_type = 'case'`, `pack_size = units_per_case`).

### Identity

| Field | Req | Notes |
|---|---|---|
| Product name | Yes | Already on `products`. |
| Brand | Yes | New. Unbranded → `Generic`. |
| Manufacturer | No | Already on submission items; add to `products`. |
| Vendor SKU | Yes | Unique per vendor. |
| Barcode | Yes* | *Or check **No barcode**. Unique per vendor when present. |
| No barcode | — | Checkbox. Clears and disables barcode. |

Barcode type is derived from length in the UI. Do not store a separate column in v1.

### Classification and pack

| Field | Req | Notes |
|---|---|---|
| Category | Yes | Leaf `category_id` only. Allowed list. |
| Pack type | Yes | `single` \| `multi_pack` \| `case`. |
| Pack size | Yes | Consumer units inside this SKU. |
| Base unit vendor SKU | No | Required only if they also sell the inner unit. Staging column; becomes `products.base_unit_sku` on approve. |
| Unit of measure | Yes | Keep current meaning (`each`, `case`, …). |
| Units per case | Yes | Orderable quantity. |

### Commercial and physical

| Field | Req | Notes |
|---|---|---|
| Wholesale price | Yes | USD. Stores still set retail on `store_product_availability`. |
| Weight | Yes | Number. |
| Weight unit | Yes | Default `lb`. |
| Description | No | One field. No short/long split. |

### Explicitly not in v1

Subcategory, tags, age restriction, package type/material, size/volume, dimensions, color, MSRP, MOQ, lead time, extra case-pack quantity, country of origin, ingredients, allergens, nutrition facts, storage type, shelf life, hazmat, alcohol/nicotine, certifications, images, Shopify variant flattening.

`imageKey` stays reserved in comments only — no column until Blob.

---

## Part 7: Schema changes (additive)

Current `products` does not have brand, pack, or weight unit. Add them before the new form ships. No Drizzle. Raw SQL next to `apps/web/db/schema-vendor-portal.sql`.

```sql
-- products (additive)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS brand VARCHAR(128),
  ADD COLUMN IF NOT EXISTS manufacturer VARCHAR(255),
  ADD COLUMN IF NOT EXISTS weight_unit VARCHAR(8) NOT NULL DEFAULT 'lb',
  ADD COLUMN IF NOT EXISTS pack_type VARCHAR(16) NOT NULL DEFAULT 'case',
  ADD COLUMN IF NOT EXISTS pack_size INT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS base_unit_sku VARCHAR(50)
    REFERENCES products(sku) ON DELETE SET NULL;

-- product_submissions: draft working packet
ALTER TABLE product_submissions
  DROP CONSTRAINT IF EXISTS product_submissions_status_check;
-- status remains the submission_status enum; add 'draft'
ALTER TYPE submission_status ADD VALUE IF NOT EXISTS 'draft';

-- product_submission_items (additive)
ALTER TABLE product_submission_items
  ADD COLUMN IF NOT EXISTS brand VARCHAR(128),
  ADD COLUMN IF NOT EXISTS weight_unit VARCHAR(8) NOT NULL DEFAULT 'lb',
  ADD COLUMN IF NOT EXISTS pack_type VARCHAR(16) NOT NULL DEFAULT 'case',
  ADD COLUMN IF NOT EXISTS pack_size INT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS base_unit_vendor_sku VARCHAR(100),
  ADD COLUMN IF NOT EXISTS no_barcode BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS barcode_lookup_cache (
  barcode VARCHAR(14) PRIMARY KEY,
  payload JSONB NOT NULL,
  source VARCHAR(32) NOT NULL DEFAULT 'openfoodfacts',
  fetched_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

`source` on `product_submissions`: `xlsx_upload` | `csv_upload` | `barcode_lookup` | `single_form` | `mixed` (packet built from more than one path).

Promotion `INSERT` must write the new columns. MDM `ProductForm` should show them after approve so staff and portal stay on the same model.

Partial unique indexes (live catalog):

```sql
CREATE UNIQUE INDEX IF NOT EXISTS products_vendor_sku_unique
  ON products (vendor_id, vendor_sku);

CREATE UNIQUE INDEX IF NOT EXISTS products_vendor_barcode_unique
  ON products (vendor_id, barcode)
  WHERE barcode IS NOT NULL AND barcode <> '';
```

Draft uniqueness is enforced in application code on parse, save, and send (draft rows are not in `products` yet).

---

## Part 8: APIs (`apps/vendor-portal`)

| Method | Path | Behavior |
|---|---|---|
| GET | `/api/submissions/products/draft` | Get or create the vendor's draft packet |
| POST | `/api/submissions/products` | Append one manual/barcode item to draft |
| POST | `/api/submissions/products/upload` | Multipart file; server parse; append rows |
| PATCH | `/api/submissions/products/items/[id]` | Edit a draft row |
| DELETE | `/api/submissions/products/items/[id]` | Remove a draft row |
| POST | `/api/submissions/products/send` | Validate all, set pending |
| GET | `/api/products/lookup?barcode=` | OFF + cache. Never leaks account existence of *other* vendors. Does error if **this** vendor already owns the barcode. |
| GET | `/api/products/template.xlsx` | Personalized workbook |

Every handler starts with `requireVendorSession()`. `vendorId` never comes from the client.

---

## Part 9: Admin (keep it small)

The review UI already exists. v1 change is **packet-shaped**, not a new module.

- Inbox row = one vendor packet, item count, submitted-at.
- Detail = table of ≤ 120 rows, the v1 columns, pack link shown as vendor SKU.
- Actions: Approve packet / Reject packet + note.
- Approve runs existing `promoteProductSubmission`, extended to write brand/pack/weight_unit and resolve `base_unit_sku`.
- Reject sets items + header back to `draft` and stores `review_note`.

Conflict: if a live product with the same vendor SKU or barcode appeared after the draft was created, send and approve both fail with a named error. Vendor removes or changes the row.

---

## Part 10: UX flow

```
                    /products/add
                          │
              ┌───────────┼───────────┐
              ▼           ▼           ▼
           Bulk        Barcode      Manual
         .xlsx/.csv      OFF          form
              │           │           │
              └───────────┼───────────┘
                          ▼
                   Draft packet
                   /products/review
                          │
                  Send for review
                          │
                   MDM packet review
                          │
                   Approve / Reject
```

---

## Part 11: Closed questions

1. **Orderable unit** — vendor's choice: case only, or case plus single (and optional multi-pack as its own SKU).
2. **Bulk format** — native Excel and CSV. Shopify column mapping is not v1.
3. **Fields on `products`** — Part 6 only. Everything else waits.
4. **Same barcode this vendor** — hard error, including draft and pending.
5. **Same barcode another vendor** — allowed. Do not warn in v1.
6. **Barcode lookup** — Open Food Facts only. Paid / UPCitemDB later if miss rate is high.
7. **Review shape** — one Send for review, whole-packet approve/reject. Cap 120. No per-item admin UI.
8. **Camera** — deferred. ZXing if we add it later.
9. **OFF attribution** — badge auto-filled fields "From Open Food Facts." Cache is silent.
10. **Allergens / nutrition** — not collected in v1.
11. **Preview edits** — persisted on the draft row. Closing the tab does not lose the packet.
12. **Category conditionals** — not in v1 (no alcohol/tobacco/hazmat categories yet, and those fields are cut).

---

## Part 12: Build order

1. **SQL** — additive columns, `draft` status, barcode cache, unique indexes. Extend `promoteProductSubmission` so approve cannot drop new fields.
2. **Draft packet APIs** — get/create draft, append/edit/delete item, send. One packet per vendor.
3. **Expand the existing manual form** to the v1 field set + uniqueness errors. This is `/products/add` manual tab. Staging loop is already proven.
4. **`/products/review` + Send for review.** MDM packet approve/reject (no per-item).
5. **Excel + CSV** — template download, server parse, append to draft, 120 cap.
6. **Barcode lookup** — OFF + cache + auto-fill the same form.
7. **Pack linkage UI** — base-unit picker over live catalog + draft siblings.

Ship 1–4 before files or barcode. That is the architecture: draft → send → one review. Bulk and lookup are input methods on top.
