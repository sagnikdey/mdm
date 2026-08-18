import { query } from "./db"
import { mapInvitation, type InvitationRow } from "./mappers"
import type { VendorInvitation } from "./types"

const EXPIRY_DAYS = 14

export async function createInvitation(input: {
  tokenHash: string
  invitedEmail: string
  invitedCompany?: string
  invitedByEmail: string
}) {
  const expiresAt = new Date(Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000)

  const result = await query<InvitationRow>(
    `INSERT INTO vendor_invitations (
      token_hash, invited_email, invited_company, invited_by_email, expires_at
    ) VALUES ($1, $2, $3, $4, $5)
    RETURNING *`,
    [
      input.tokenHash,
      input.invitedEmail.toLowerCase(),
      input.invitedCompany ?? null,
      input.invitedByEmail,
      expiresAt,
    ]
  )

  return mapInvitation(result.rows[0]!)
}

export async function getInvitationByTokenHash(
  tokenHash: string
): Promise<VendorInvitation | undefined> {
  const result = await query<InvitationRow>(
    `SELECT * FROM vendor_invitations WHERE token_hash = $1`,
    [tokenHash]
  )
  const row = result.rows[0]
  return row ? mapInvitation(row) : undefined
}

export async function listInvitations() {
  const result = await query<InvitationRow>(
    `SELECT * FROM vendor_invitations ORDER BY created_at DESC`
  )
  return result.rows.map(mapInvitation)
}

export async function updateInvitation(
  id: string,
  updates: Partial<{
    status: VendorInvitation["status"]
    applicationId: string
    redeemedAt: Date
  }>
) {
  const sets: string[] = []
  const params: unknown[] = [id]
  let idx = 2

  if (updates.status) {
    sets.push(`status = $${idx++}`)
    params.push(updates.status)
  }
  if (updates.applicationId) {
    sets.push(`application_id = $${idx++}`)
    params.push(updates.applicationId)
  }
  if (updates.redeemedAt) {
    sets.push(`redeemed_at = $${idx++}`)
    params.push(updates.redeemedAt)
  }

  if (!sets.length) return

  await query(`UPDATE vendor_invitations SET ${sets.join(", ")} WHERE id = $1`, params)
}

export async function revokeInvitation(id: string) {
  await query(`UPDATE vendor_invitations SET status = 'revoked' WHERE id = $1`, [id])
}
