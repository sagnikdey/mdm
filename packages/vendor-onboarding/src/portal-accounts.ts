import { query } from "./db"
import type {
  PortalAccountStatus,
  VendorPortalAccount,
} from "./portal-types"

type AccountRow = {
  id: string
  vendor_id: string
  email: string
  status: PortalAccountStatus
  allowed_category_ids: string[] | string
  last_login_at: Date | string | null
  created_at: Date | string
}

function asIso(value: Date | string | null) {
  if (!value) return null
  return value instanceof Date ? value.toISOString() : value
}

function parseCategoryIds(value: AccountRow["allowed_category_ids"]) {
  if (Array.isArray(value)) return value.map(String)
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed.map(String) : []
    } catch {
      return []
    }
  }
  return []
}

function mapAccount(row: AccountRow): VendorPortalAccount {
  return {
    id: row.id,
    vendorId: row.vendor_id,
    email: row.email,
    status: row.status,
    allowedCategoryIds: parseCategoryIds(row.allowed_category_ids),
    lastLoginAt: asIso(row.last_login_at),
    createdAt: asIso(row.created_at) ?? new Date().toISOString(),
  }
}

export async function resolveAllowedCategoryIds(names: string[]) {
  if (!names.length) return []
  const result = await query<{ category_id: string }>(
    `WITH RECURSIVE tree AS (
       SELECT category_id
       FROM categories
       WHERE lower(category_name) = ANY($1::text[])
       UNION
       SELECT c.category_id
       FROM categories c
       JOIN tree t ON c.parent_category_id = t.category_id
     )
     SELECT category_id FROM tree`,
    [names.map((name) => name.toLowerCase())]
  )
  return result.rows.map((row) => row.category_id)
}

export async function createPortalAccount(input: {
  vendorId: string
  email: string
  allowedCategoryIds?: string[]
}) {
  const result = await query<AccountRow>(
    `INSERT INTO vendor_portal_accounts (vendor_id, email, allowed_category_ids)
     VALUES ($1, $2, $3::jsonb)
     ON CONFLICT (vendor_id) DO UPDATE SET
       email = EXCLUDED.email,
       allowed_category_ids = EXCLUDED.allowed_category_ids
     RETURNING *`,
    [
      input.vendorId,
      input.email.toLowerCase(),
      JSON.stringify(input.allowedCategoryIds ?? []),
    ]
  )
  return mapAccount(result.rows[0]!)
}

export async function getPortalAccountByEmail(email: string) {
  const result = await query<AccountRow>(
    `SELECT * FROM vendor_portal_accounts WHERE email = $1`,
    [email.toLowerCase()]
  )
  const row = result.rows[0]
  return row ? mapAccount(row) : undefined
}

export async function getPortalAccountById(id: string) {
  const result = await query<AccountRow>(
    `SELECT * FROM vendor_portal_accounts WHERE id = $1`,
    [id]
  )
  const row = result.rows[0]
  return row ? mapAccount(row) : undefined
}

export async function getPortalAccountByVendorId(vendorId: string) {
  const result = await query<AccountRow>(
    `SELECT * FROM vendor_portal_accounts WHERE vendor_id = $1`,
    [vendorId]
  )
  const row = result.rows[0]
  return row ? mapAccount(row) : undefined
}

export async function updatePortalAccountCategories(
  vendorId: string,
  allowedCategoryIds: string[]
) {
  const result = await query<AccountRow>(
    `UPDATE vendor_portal_accounts
     SET allowed_category_ids = $2::jsonb
     WHERE vendor_id = $1
     RETURNING *`,
    [vendorId, JSON.stringify(allowedCategoryIds)]
  )
  const row = result.rows[0]
  return row ? mapAccount(row) : undefined
}

export async function getVendorSnapshot(vendorId: string) {
  const result = await query<{
    vendor_id: string
    vendor_name: string
    vendor_category: string
    contact_person: string
    email: string
    phone: string
    address: string
    payment_terms: string
    minimum_order_quantity: number
  }>(
    `SELECT vendor_id, vendor_name, vendor_category, contact_person, email, phone,
            address, payment_terms, minimum_order_quantity
     FROM vendors WHERE vendor_id = $1`,
    [vendorId]
  )
  const row = result.rows[0]
  if (!row) return undefined
  return {
    vendorName: row.vendor_name,
    vendorCategory: row.vendor_category,
    contactPerson: row.contact_person,
    email: row.email,
    phone: row.phone,
    address: row.address,
    paymentTerms: row.payment_terms,
    minimumOrderQuantity: row.minimum_order_quantity,
  }
}

export async function touchPortalLogin(accountId: string) {
  await query(
    `UPDATE vendor_portal_accounts SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1`,
    [accountId]
  )
}
