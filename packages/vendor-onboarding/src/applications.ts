import { query } from "./db"
import { mapApplication, type ApplicationRow } from "./mappers"
import type {
  AddressData,
  ApplicationStatus,
  CategoriesData,
  CompanyData,
  ContactData,
  DocumentRecord,
  PaymentData,
  VendorApplication,
} from "./types"

export async function createApplication(ownerEmail: string, legalName?: string) {
  const result = await query<ApplicationRow>(
    `INSERT INTO vendor_applications (owner_email, legal_name, contact_data)
     VALUES ($1, $2, $3::jsonb)
     RETURNING *`,
    [
      ownerEmail.toLowerCase(),
      legalName ?? null,
      JSON.stringify({ contactPerson: "", email: ownerEmail.toLowerCase(), phone: "" }),
    ]
  )
  return mapApplication(result.rows[0]!)
}

export async function getApplication(id: string) {
  const result = await query<ApplicationRow>(
    `SELECT * FROM vendor_applications WHERE id = $1`,
    [id]
  )
  const row = result.rows[0]
  return row ? mapApplication(row) : undefined
}

export async function listApplications(status?: ApplicationStatus) {
  const result = status
    ? await query<ApplicationRow>(
        `SELECT * FROM vendor_applications WHERE status = $1 ORDER BY updated_at DESC`,
        [status]
      )
    : await query<ApplicationRow>(
        `SELECT * FROM vendor_applications ORDER BY updated_at DESC`
      )
  return result.rows.map(mapApplication)
}

export async function countApplicationsByStatus() {
  const result = await query<{ status: ApplicationStatus; count: string }>(
    `SELECT status, COUNT(*)::text AS count FROM vendor_applications GROUP BY status`
  )
  return result.rows.map((row) => ({
    status: row.status,
    count: parseInt(row.count, 10),
  }))
}

export async function updateApplicationStep(
  id: string,
  input: {
    currentStep: number
    companyData?: CompanyData
    contactData?: ContactData
    addressData?: AddressData
    paymentData?: PaymentData
    categoriesData?: CategoriesData
    documentsData?: DocumentRecord[]
    legalName?: string
  }
) {
  const result = await query<ApplicationRow>(
    `UPDATE vendor_applications SET
      current_step = $2,
      company_data = COALESCE($3::jsonb, company_data),
      contact_data = COALESCE($4::jsonb, contact_data),
      address_data = COALESCE($5::jsonb, address_data),
      payment_data = COALESCE($6::jsonb, payment_data),
      categories_data = COALESCE($7::jsonb, categories_data),
      documents_data = COALESCE($8::jsonb, documents_data),
      legal_name = COALESCE($9, legal_name),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *`,
    [
      id,
      input.currentStep,
      input.companyData ? JSON.stringify(input.companyData) : null,
      input.contactData ? JSON.stringify(input.contactData) : null,
      input.addressData ? JSON.stringify(input.addressData) : null,
      input.paymentData ? JSON.stringify(input.paymentData) : null,
      input.categoriesData ? JSON.stringify(input.categoriesData) : null,
      input.documentsData ? JSON.stringify(input.documentsData) : null,
      input.legalName ?? null,
    ]
  )
  return mapApplication(result.rows[0]!)
}

export async function submitApplication(id: string) {
  const result = await query<ApplicationRow>(
    `UPDATE vendor_applications SET
      status = 'submitted',
      submitted_at = CURRENT_TIMESTAMP,
      current_step = 8,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *`,
    [id]
  )
  return mapApplication(result.rows[0]!)
}

export async function reviewApplication(
  id: string,
  input: {
    status: Extract<ApplicationStatus, "under_review" | "needs_info" | "approved" | "rejected">
    reviewerEmail: string
    reviewerNotes?: string
    promotedVendorId?: string
  }
) {
  const result = await query<ApplicationRow>(
    `UPDATE vendor_applications SET
      status = $2,
      reviewer_email = $3,
      reviewer_notes = $4,
      promoted_vendor_id = $5,
      reviewed_at = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *`,
    [
      id,
      input.status,
      input.reviewerEmail,
      input.reviewerNotes ?? null,
      input.promotedVendorId ?? null,
    ]
  )
  return mapApplication(result.rows[0]!)
}

export type { VendorApplication }
