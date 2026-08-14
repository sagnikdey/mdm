import "server-only"

import { query } from "@/lib/db"
import { mapVendor, type VendorRow } from "@/lib/db/mappers"
import type { Vendor } from "@/lib/types"

export async function listVendors(): Promise<Vendor[]> {
  const result = await query<VendorRow>(
    `SELECT * FROM vendors ORDER BY vendor_name`
  )
  return result.rows.map(mapVendor)
}

export async function getVendor(id: string): Promise<Vendor | undefined> {
  const result = await query<VendorRow>(
    `SELECT * FROM vendors WHERE vendor_id = $1`,
    [id]
  )
  const row = result.rows[0]
  return row ? mapVendor(row) : undefined
}

export async function createVendor(vendor: Vendor): Promise<Vendor> {
  await query(
    `INSERT INTO vendors (
      vendor_id, vendor_name, vendor_category, contact_person, email, phone,
      address, payment_terms, minimum_order_quantity, is_active
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      vendor.vendorId,
      vendor.vendorName,
      vendor.vendorCategory,
      vendor.contactPerson,
      vendor.email,
      vendor.phone,
      vendor.address,
      vendor.paymentTerms,
      vendor.minimumOrderQuantity,
      vendor.isActive,
    ]
  )
  return vendor
}

export async function updateVendor(
  id: string,
  updates: Partial<Vendor>
): Promise<Vendor | undefined> {
  const existing = await getVendor(id)
  if (!existing) return undefined

  const merged = { ...existing, ...updates }

  await query(
    `UPDATE vendors SET
      vendor_name = $2, vendor_category = $3, contact_person = $4, email = $5,
      phone = $6, address = $7, payment_terms = $8, minimum_order_quantity = $9,
      is_active = $10, updated_at = CURRENT_TIMESTAMP
    WHERE vendor_id = $1`,
    [
      id,
      merged.vendorName,
      merged.vendorCategory,
      merged.contactPerson,
      merged.email,
      merged.phone,
      merged.address,
      merged.paymentTerms,
      merged.minimumOrderQuantity,
      merged.isActive,
    ]
  )

  return getVendor(id)
}

export async function deleteVendor(id: string): Promise<void> {
  await query(`DELETE FROM vendors WHERE vendor_id = $1`, [id])
}

export async function getNextVendorId(): Promise<string> {
  const result = await query<{ vendor_id: string }>(
    `SELECT vendor_id FROM vendors WHERE vendor_id ~ '^VEN[0-9]+$' ORDER BY vendor_id DESC LIMIT 1`
  )
  const last = result.rows[0]?.vendor_id
  if (!last) return "VEN001"
  const num = parseInt(last.replace("VEN", ""), 10) + 1
  return `VEN${String(num).padStart(3, "0")}`
}
