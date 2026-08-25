-- Additive product-onboarding columns. Safe to re-run.
-- Requires schema.sql and schema-vendor-portal.sql.

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

UPDATE products
SET pack_size = units_per_case
WHERE pack_type = 'case'
  AND pack_size = 1
  AND units_per_case IS NOT NULL
  AND units_per_case > 1;

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
