import { NextResponse } from "next/server"
import {
  ensurePortalSchema,
  getPortalAccountById,
  getPortalLoginTokenByHash,
  hashToken,
  isMissingRelation,
  markPortalLoginTokenUsed,
  touchPortalLogin,
} from "@workspace/vendor-onboarding"

import { allowVerifyAttempt } from "@/lib/auth/rate-limit"
import { applyPortalSessionCookie } from "@/lib/auth/session"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function invalid(origin: string) {
  return NextResponse.redirect(`${origin}/login?error=invalid`)
}

async function loadToken(tokenHash: string) {
  try {
    return await getPortalLoginTokenByHash(tokenHash)
  } catch (error) {
    if (!isMissingRelation(error)) throw error
    await ensurePortalSchema()
    return getPortalLoginTokenByHash(tokenHash)
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const token = url.searchParams.get("token") ?? ""
  const origin = url.origin
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"

  if (!token || !allowVerifyAttempt(ip)) {
    return invalid(origin)
  }

  if (!process.env["DATABASE_URL"]?.trim()) {
    console.error(
      "[vendor-portal-verify] DATABASE_URL is not set on the vendor-portal Vercel project"
    )
    return invalid(origin)
  }
  if (!process.env["VENDOR_PORTAL_SESSION_SECRET"]?.trim()) {
    console.error(
      "[vendor-portal-verify] VENDOR_PORTAL_SESSION_SECRET is not set on the vendor-portal Vercel project"
    )
    return invalid(origin)
  }

  try {
    const record = await loadToken(hashToken(token))
    if (!record || record.usedAt || new Date(record.expiresAt) < new Date()) {
      return invalid(origin)
    }

    const account = await getPortalAccountById(record.accountId)
    if (!account || account.status !== "active") {
      return NextResponse.redirect(`${origin}/login?error=suspended`)
    }

    const response = NextResponse.redirect(`${origin}/dashboard`)
    await applyPortalSessionCookie(response, {
      accountId: account.id,
      vendorId: account.vendorId,
      email: account.email,
    })
    await markPortalLoginTokenUsed(record.id)
    await touchPortalLogin(account.id)
    return response
  } catch (error) {
    console.error("[vendor-portal-verify]", error)
    return invalid(origin)
  }
}
