import { NextResponse } from "next/server"
import {
  getPortalAccountById,
  getPortalLoginTokenByHash,
  hashToken,
  markPortalLoginTokenUsed,
  touchPortalLogin,
} from "@workspace/vendor-onboarding"

import { allowVerifyAttempt } from "@/lib/auth/rate-limit"
import { applyPortalSessionCookie } from "@/lib/auth/session"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const token = url.searchParams.get("token") ?? ""
  const origin = url.origin
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"

  if (!token || !allowVerifyAttempt(ip)) {
    return NextResponse.redirect(`${origin}/login?error=invalid`)
  }

  const record = await getPortalLoginTokenByHash(hashToken(token))
  if (!record || record.usedAt || new Date(record.expiresAt) < new Date()) {
    return NextResponse.redirect(`${origin}/login?error=invalid`)
  }

  const account = await getPortalAccountById(record.accountId)
  if (!account || account.status !== "active") {
    return NextResponse.redirect(`${origin}/login?error=suspended`)
  }

  await markPortalLoginTokenUsed(record.id)
  await touchPortalLogin(account.id)

  const response = NextResponse.redirect(`${origin}/dashboard`)
  return applyPortalSessionCookie(response, {
    accountId: account.id,
    vendorId: account.vendorId,
    email: account.email,
  })
}
