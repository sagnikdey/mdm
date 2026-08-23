import { NextResponse } from "next/server"
import {
  getPortalAccountByEmail,
  issuePortalLoginToken,
} from "@workspace/vendor-onboarding"

import { sendPortalLoginEmail } from "@/lib/auth/email"
import { allowLoginRequest } from "@/lib/auth/rate-limit"

const LOGIN_TTL_MS = 15 * 60 * 1000

function portalUrl(request: Request) {
  const fromEnv = process.env["VENDOR_PORTAL_URL"]?.trim().replace(/\/$/, "")
  if (fromEnv) return fromEnv
  return new URL(request.url).origin
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  const body = (await request.json().catch(() => null)) as { email?: string } | null
  const email = body?.email?.trim().toLowerCase() ?? ""

  if (!email || !allowLoginRequest(email, ip)) {
    return NextResponse.json({ ok: true })
  }

  const account = await getPortalAccountByEmail(email)
  if (!account || account.status !== "active") {
    return NextResponse.json({ ok: true })
  }

  const { rawToken, expiresAt } = await issuePortalLoginToken({
    accountId: account.id,
    purpose: "login",
    ttlMs: LOGIN_TTL_MS,
    requestedFromIp: ip,
  })

  await sendPortalLoginEmail({
    to: account.email,
    loginUrl: `${portalUrl(request)}/auth/verify?token=${rawToken}`,
    expiresAt,
    purpose: "login",
  })

  return NextResponse.json({ ok: true })
}
