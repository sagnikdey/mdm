import { query } from "./db"

export const PORTAL_SCHEMA_SQL = `
DO $$ BEGIN
  CREATE TYPE portal_account_status AS ENUM ('active', 'suspended');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE submission_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS vendor_portal_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id VARCHAR(20) NOT NULL UNIQUE REFERENCES vendors(vendor_id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    status portal_account_status NOT NULL DEFAULT 'active',
    allowed_category_ids JSONB NOT NULL DEFAULT '[]',
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vendor_portal_accounts_vendor
  ON vendor_portal_accounts(vendor_id);

CREATE TABLE IF NOT EXISTS vendor_portal_login_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES vendor_portal_accounts(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    purpose VARCHAR(32) NOT NULL DEFAULT 'login',
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    requested_from_ip VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vendor_portal_login_tokens_hash
  ON vendor_portal_login_tokens(token_hash);

CREATE TABLE IF NOT EXISTS vendor_profile_edits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id VARCHAR(20) NOT NULL REFERENCES vendors(vendor_id) ON DELETE CASCADE,
    submitted_by VARCHAR(255) NOT NULL,
    proposed_changes JSONB NOT NULL,
    current_snapshot JSONB NOT NULL,
    status submission_status NOT NULL DEFAULT 'pending',
    review_note TEXT,
    reviewed_by VARCHAR(255),
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vendor_profile_edits_status
  ON vendor_profile_edits(status);

CREATE TABLE IF NOT EXISTS product_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id VARCHAR(20) NOT NULL REFERENCES vendors(vendor_id) ON DELETE CASCADE,
    submitted_by VARCHAR(255) NOT NULL,
    source VARCHAR(32) NOT NULL,
    status submission_status NOT NULL DEFAULT 'pending',
    item_count INT NOT NULL,
    review_note TEXT,
    reviewed_by VARCHAR(255),
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_submission_items (
    id SERIAL PRIMARY KEY,
    submission_id UUID NOT NULL REFERENCES product_submissions(id) ON DELETE CASCADE,
    proposed_sku VARCHAR(50) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    category_id VARCHAR(20),
    vendor_sku VARCHAR(100) NOT NULL,
    description TEXT,
    unit_of_measure VARCHAR(50),
    units_per_case INT DEFAULT 1,
    wholesale_price DECIMAL(10, 2) NOT NULL,
    weight DECIMAL(8, 3),
    barcode VARCHAR(50),
    manufacturer VARCHAR(255),
    brand VARCHAR(128),
    weight_unit VARCHAR(8) NOT NULL DEFAULT 'lb',
    pack_type VARCHAR(16) NOT NULL DEFAULT 'case',
    pack_size INT NOT NULL DEFAULT 1,
    base_unit_vendor_sku VARCHAR(100),
    no_barcode BOOLEAN NOT NULL DEFAULT false,
    item_status submission_status NOT NULL DEFAULT 'pending',
    item_note TEXT,
    created_sku VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS product_edits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id VARCHAR(20) NOT NULL REFERENCES vendors(vendor_id) ON DELETE CASCADE,
    sku VARCHAR(50) NOT NULL,
    submitted_by VARCHAR(255) NOT NULL,
    edit_type VARCHAR(32) NOT NULL,
    proposed_changes JSONB NOT NULL,
    current_snapshot JSONB NOT NULL,
    status submission_status NOT NULL DEFAULT 'pending',
    review_note TEXT,
    reviewed_by VARCHAR(255),
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_product_edits_status ON product_edits(status);
CREATE INDEX IF NOT EXISTS idx_product_submissions_status ON product_submissions(status);
`

export const PRODUCT_ONBOARDING_SQL = `
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'submission_status' AND e.enumlabel = 'draft'
  ) THEN
    ALTER TYPE submission_status ADD VALUE 'draft';
  END IF;
END $$;

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS brand VARCHAR(128),
  ADD COLUMN IF NOT EXISTS manufacturer VARCHAR(255),
  ADD COLUMN IF NOT EXISTS weight_unit VARCHAR(8) NOT NULL DEFAULT 'lb',
  ADD COLUMN IF NOT EXISTS pack_type VARCHAR(16) NOT NULL DEFAULT 'case',
  ADD COLUMN IF NOT EXISTS pack_size INT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS base_unit_sku VARCHAR(50);

DO $$ BEGIN
  ALTER TABLE products
    ADD CONSTRAINT products_base_unit_sku_fkey
    FOREIGN KEY (base_unit_sku) REFERENCES products(sku) ON DELETE SET NULL;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

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

CREATE UNIQUE INDEX IF NOT EXISTS products_vendor_sku_unique
  ON products (vendor_id, vendor_sku);

CREATE UNIQUE INDEX IF NOT EXISTS products_vendor_barcode_unique
  ON products (vendor_id, barcode)
  WHERE barcode IS NOT NULL AND barcode <> '';
`

export function isMissingRelation(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    String(error.code) === "42P01"
  )
}

export function portalActionError(error: unknown) {
  if (isMissingRelation(error)) {
    return new Error(
      "Vendor portal tables are missing on this database. Redeploy MDM after this fix, then try Grant portal access again."
    )
  }
  const code =
    typeof error === "object" && error && "code" in error
      ? String(error.code)
      : ""
  if (code === "23505") {
    return new Error(
      "That email already has a portal account on another vendor."
    )
  }
  if (error instanceof Error && error.message) {
    return new Error(error.message)
  }
  return new Error("Could not complete the portal action.")
}

export async function ensurePortalSchema() {
  await query(PORTAL_SCHEMA_SQL)
  await query(PRODUCT_ONBOARDING_SQL)
}

export async function ensureProductOnboardingSchema() {
  await query(PRODUCT_ONBOARDING_SQL)
}
