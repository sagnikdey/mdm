import { query } from "./db"
import { generateRawToken, hashToken } from "./tokens"
import type { LoginTokenPurpose, VendorPortalLoginToken } from "./portal-types"

type TokenRow = {
  id: string
  account_id: string
  token_hash: string
  purpose: LoginTokenPurpose
  expires_at: Date | string
  used_at: Date | string | null
  requested_from_ip: string | null
  created_at: Date | string
}

function asIso(value: Date | string | null) {
  if (!value) return null
  return value instanceof Date ? value.toISOString() : value
}

function mapToken(row: TokenRow): VendorPortalLoginToken {
  return {
    id: row.id,
    accountId: row.account_id,
    tokenHash: row.token_hash,
    purpose: row.purpose,
    expiresAt: asIso(row.expires_at) ?? new Date().toISOString(),
    usedAt: asIso(row.used_at),
    requestedFromIp: row.requested_from_ip,
    createdAt: asIso(row.created_at) ?? new Date().toISOString(),
  }
}

export async function issuePortalLoginToken(input: {
  accountId: string
  purpose?: LoginTokenPurpose
  ttlMs: number
  requestedFromIp?: string
}) {
  const rawToken = generateRawToken()
  const tokenHash = hashToken(rawToken)
  const expiresAt = new Date(Date.now() + input.ttlMs)

  await query(
    `INSERT INTO vendor_portal_login_tokens (
      account_id, token_hash, purpose, expires_at, requested_from_ip
    ) VALUES ($1, $2, $3, $4, $5)`,
    [
      input.accountId,
      tokenHash,
      input.purpose ?? "login",
      expiresAt,
      input.requestedFromIp ?? null,
    ]
  )

  return { rawToken, expiresAt }
}

export async function getPortalLoginTokenByHash(tokenHash: string) {
  const result = await query<TokenRow>(
    `SELECT * FROM vendor_portal_login_tokens WHERE token_hash = $1`,
    [tokenHash]
  )
  const row = result.rows[0]
  return row ? mapToken(row) : undefined
}

export async function markPortalLoginTokenUsed(id: string) {
  await query(
    `UPDATE vendor_portal_login_tokens SET used_at = CURRENT_TIMESTAMP WHERE id = $1`,
    [id]
  )
}
