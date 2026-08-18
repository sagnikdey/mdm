-- Vendor onboarding tables (run after schema.sql)

DO $$ BEGIN
  CREATE TYPE invitation_status AS ENUM ('pending', 'redeemed', 'expired', 'revoked');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE application_status AS ENUM (
    'draft', 'submitted', 'under_review', 'needs_info', 'approved', 'rejected'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS vendor_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    invited_email VARCHAR(255) NOT NULL,
    invited_company VARCHAR(255),
    status invitation_status NOT NULL DEFAULT 'pending',
    expires_at TIMESTAMP NOT NULL,
    invited_by_email VARCHAR(255) NOT NULL,
    application_id UUID,
    redeemed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vendor_invitations_email ON vendor_invitations(invited_email);
CREATE INDEX IF NOT EXISTS idx_vendor_invitations_status ON vendor_invitations(status);

CREATE TABLE IF NOT EXISTS vendor_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_email VARCHAR(255) NOT NULL,
    status application_status NOT NULL DEFAULT 'draft',
    current_step INT NOT NULL DEFAULT 1,
    legal_name VARCHAR(255),
    company_data JSONB NOT NULL DEFAULT '{}',
    contact_data JSONB NOT NULL DEFAULT '{}',
    address_data JSONB NOT NULL DEFAULT '{}',
    payment_data JSONB NOT NULL DEFAULT '{}',
    categories_data JSONB NOT NULL DEFAULT '{}',
    documents_data JSONB NOT NULL DEFAULT '[]',
    submitted_at TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewer_email VARCHAR(255),
    reviewer_notes TEXT,
    promoted_vendor_id VARCHAR(20) REFERENCES vendors(vendor_id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vendor_applications_status ON vendor_applications(status);
CREATE INDEX IF NOT EXISTS idx_vendor_applications_owner ON vendor_applications(owner_email);

ALTER TABLE vendor_invitations
  DROP CONSTRAINT IF EXISTS vendor_invitations_application_id_fkey;

ALTER TABLE vendor_invitations
  ADD CONSTRAINT vendor_invitations_application_id_fkey
  FOREIGN KEY (application_id) REFERENCES vendor_applications(id) ON DELETE SET NULL;
