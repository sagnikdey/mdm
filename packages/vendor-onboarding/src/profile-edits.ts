import { query, withTransaction } from "./db"
import type {
  SubmissionStatus,
  VendorProfileEdit,
  VendorProfileFields,
  VendorSubmissionInboxItem,
} from "./portal-types"

type EditRow = {
  id: string
  vendor_id: string
  submitted_by: string
  proposed_changes: VendorProfileFields | Partial<VendorProfileFields>
  current_snapshot: VendorProfileFields
  status: SubmissionStatus
  review_note: string | null
  reviewed_by: string | null
  reviewed_at: Date | string | null
  created_at: Date | string
}

function asIso(value: Date | string | null) {
  if (!value) return null
  return value instanceof Date ? value.toISOString() : value
}

function mapEdit(row: EditRow): VendorProfileEdit {
  return {
    id: row.id,
    vendorId: row.vendor_id,
    submittedBy: row.submitted_by,
    proposedChanges: row.proposed_changes,
    currentSnapshot: row.current_snapshot,
    status: row.status,
    reviewNote: row.review_note,
    reviewedBy: row.reviewed_by,
    reviewedAt: asIso(row.reviewed_at),
    createdAt: asIso(row.created_at) ?? new Date().toISOString(),
  }
}

export async function createProfileEdit(input: {
  vendorId: string
  submittedBy: string
  proposedChanges: Partial<VendorProfileFields>
  currentSnapshot: VendorProfileFields
}) {
  const pending = await query<{ id: string }>(
    `SELECT id FROM vendor_profile_edits
     WHERE vendor_id = $1 AND status = 'pending'
     LIMIT 1`,
    [input.vendorId]
  )
  if (pending.rows[0]) {
    throw new Error("A profile edit is already pending review")
  }

  const result = await query<EditRow>(
    `INSERT INTO vendor_profile_edits (
      vendor_id, submitted_by, proposed_changes, current_snapshot
    ) VALUES ($1, $2, $3::jsonb, $4::jsonb)
    RETURNING *`,
    [
      input.vendorId,
      input.submittedBy,
      JSON.stringify(input.proposedChanges),
      JSON.stringify(input.currentSnapshot),
    ]
  )
  return mapEdit(result.rows[0]!)
}

export async function listPendingProfileEdits() {
  const result = await query<EditRow>(
    `SELECT * FROM vendor_profile_edits WHERE status = 'pending' ORDER BY created_at ASC`
  )
  return result.rows.map(mapEdit)
}

export async function listPendingInboxItems(): Promise<
  VendorSubmissionInboxItem[]
> {
  const result = await query<EditRow & { vendor_name: string | null }>(
    `SELECT e.*, v.vendor_name
     FROM vendor_profile_edits e
     LEFT JOIN vendors v ON v.vendor_id = e.vendor_id
     WHERE e.status = 'pending'
     ORDER BY e.created_at ASC`
  )
  return result.rows.map((row) => ({
    id: row.id,
    type: "profile_edit" as const,
    vendorId: row.vendor_id,
    vendorName: row.vendor_name ?? row.vendor_id,
    submittedBy: row.submitted_by,
    createdAt: asIso(row.created_at) ?? new Date().toISOString(),
    href: `/admin/vendor-submissions/profile-edits/${row.id}`,
  }))
}

export async function getVendorUpdatedAt(vendorId: string) {
  const result = await query<{ updated_at: Date | string | null }>(
    `SELECT updated_at FROM vendors WHERE vendor_id = $1`,
    [vendorId]
  )
  return asIso(result.rows[0]?.updated_at ?? null)
}

export async function listProfileEditsForVendor(vendorId: string) {
  const result = await query<EditRow>(
    `SELECT * FROM vendor_profile_edits WHERE vendor_id = $1 ORDER BY created_at DESC`,
    [vendorId]
  )
  return result.rows.map(mapEdit)
}

export async function getProfileEdit(id: string) {
  const result = await query<EditRow>(
    `SELECT * FROM vendor_profile_edits WHERE id = $1`,
    [id]
  )
  const row = result.rows[0]
  return row ? mapEdit(row) : undefined
}

export async function getPendingProfileEdit(vendorId: string) {
  const result = await query<EditRow>(
    `SELECT * FROM vendor_profile_edits
     WHERE vendor_id = $1 AND status = 'pending'
     ORDER BY created_at DESC
     LIMIT 1`,
    [vendorId]
  )
  const row = result.rows[0]
  return row ? mapEdit(row) : undefined
}

export async function cancelPendingProfileEdit(vendorId: string, email: string) {
  await query(
    `UPDATE vendor_profile_edits
     SET status = 'rejected',
         review_note = 'Cancelled by vendor',
         reviewed_by = $2,
         reviewed_at = CURRENT_TIMESTAMP
     WHERE vendor_id = $1 AND status = 'pending'`,
    [vendorId, email]
  )
}

export async function promoteProfileEdit(input: {
  editId: string
  reviewerEmail: string
  reviewNote?: string
}) {
  return withTransaction(async (txQuery) => {
    const editResult = await txQuery<EditRow>(
      `SELECT * FROM vendor_profile_edits WHERE id = $1 FOR UPDATE`,
      [input.editId]
    )
    const edit = editResult.rows[0]
    if (!edit) throw new Error("Edit not found")
    if (edit.status !== "pending") throw new Error("Already reviewed")

    const current = await txQuery<{ updated_at: Date | string }>(
      `SELECT updated_at FROM vendors WHERE vendor_id = $1`,
      [edit.vendor_id]
    )
    const updatedAt = current.rows[0]?.updated_at
    if (updatedAt) {
      const masterTime = new Date(updatedAt).getTime()
      const submittedTime = new Date(edit.created_at).getTime()
      if (masterTime > submittedTime) {
        throw new Error(
          "Vendor record changed since this edit was submitted. Review the latest profile before approving."
        )
      }
    }

    const changes = edit.proposed_changes
    await txQuery(
      `UPDATE vendors SET
        vendor_name = COALESCE($2, vendor_name),
        vendor_category = COALESCE($3, vendor_category),
        contact_person = COALESCE($4, contact_person),
        email = COALESCE($5, email),
        phone = COALESCE($6, phone),
        address = COALESCE($7, address),
        payment_terms = COALESCE($8, payment_terms),
        minimum_order_quantity = COALESCE($9, minimum_order_quantity),
        updated_at = CURRENT_TIMESTAMP
       WHERE vendor_id = $1`,
      [
        edit.vendor_id,
        changes.vendorName ?? null,
        changes.vendorCategory ?? null,
        changes.contactPerson ?? null,
        changes.email ?? null,
        changes.phone ?? null,
        changes.address ?? null,
        changes.paymentTerms ?? null,
        changes.minimumOrderQuantity ?? null,
      ]
    )

    await txQuery(
      `UPDATE vendor_profile_edits SET
        status = 'approved',
        reviewed_by = $2,
        review_note = $3,
        reviewed_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [input.editId, input.reviewerEmail, input.reviewNote ?? null]
    )

    return mapEdit({
      ...edit,
      status: "approved",
      reviewed_by: input.reviewerEmail,
      review_note: input.reviewNote ?? null,
      reviewed_at: new Date(),
    })
  })
}

export async function rejectProfileEdit(input: {
  editId: string
  reviewerEmail: string
  reviewNote?: string
}) {
  const result = await query<EditRow>(
    `UPDATE vendor_profile_edits SET
      status = 'rejected',
      reviewed_by = $2,
      review_note = $3,
      reviewed_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND status = 'pending'
     RETURNING *`,
    [input.editId, input.reviewerEmail, input.reviewNote ?? null]
  )
  const row = result.rows[0]
  if (!row) throw new Error("Edit not found or already reviewed")
  return mapEdit(row)
}
