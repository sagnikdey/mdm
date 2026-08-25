-- Vendor portal accounts, magic-link tokens, and staging tables.
-- Run after schema.sql and schema-onboarding.sql.

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
