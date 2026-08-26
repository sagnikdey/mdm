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

type VerifyFailure = "invalid" | "expired" | "suspended" | "config" | "unavailable" | "rate_limited"

function fail(origin: string, error: VerifyFailure) {
  return NextResponse.redirect(`${origin}/login?error=${error}`)
}

function readToken(url: URL, form?: FormData) {
  const fromForm = form?.get("token")
  if (typeof fromForm === "string" && fromForm.trim()) return fromForm.trim()
  return url.searchParams.get("token")?.trim() ?? ""
}

function isExpired(expiresAt: string) {
  const ms = Date.parse(expiresAt)
  return Number.isNaN(ms) || ms <= Date.now()
}

function missingConfig() {
  const missing: string[] = []
  if (!process.env["DATABASE_URL"]?.trim()) missing.push("DATABASE_URL")
  if (!process.env["VENDOR_PORTAL_SESSION_SECRET"]?.trim()) {
    missing.push("VENDOR_PORTAL_SESSION_SECRET")
  }
  return missing
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

async function resolveLogin(rawToken: string) {
  const record = await loadToken(hashToken(rawToken))
  if (!record) return { ok: false as const, error: "invalid" as const }
  if (isExpired(record.expiresAt)) {
    return { ok: false as const, error: "expired" as const }
  }

  const account = await getPortalAccountById(record.accountId)
  if (!account || account.status !== "active") {
    return { ok: false as const, error: "suspended" as const }
  }

  return { ok: true as const, record, account }
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const origin = url.origin
  const token = readToken(url)

  if (!token) return fail(origin, "invalid")

  const missing = missingConfig()
  if (missing.length) {
    console.error(
      `[vendor-portal-verify] Missing env on vendor-portal Vercel project: ${missing.join(", ")}`
    )
    return fail(origin, "config")
  }

  try {
    const result = await resolveLogin(token)
    if (!result.ok) return fail(origin, result.error)
    const continueUrl = new URL("/auth/continue", origin)
    continueUrl.searchParams.set("token", token)
    return NextResponse.redirect(continueUrl)
  } catch (error) {
    console.error("[vendor-portal-verify]", error)
    return fail(origin, "unavailable")
  }
}

export async function POST(request: Request) {
  const url = new URL(request.url)
  const origin = url.origin
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"

  if (!allowVerifyAttempt(ip)) return fail(origin, "rate_limited")

  const missing = missingConfig()
  if (missing.length) {
    console.error(
      `[vendor-portal-verify] Missing env on vendor-portal Vercel project: ${missing.join(", ")}`
    )
    return fail(origin, "config")
  }

  try {
    const form = await request.formData().catch(() => undefined)
    const token = readToken(url, form)
    if (!token) return fail(origin, "invalid")

    const result = await resolveLogin(token)
    if (!result.ok) return fail(origin, result.error)

    const response = NextResponse.redirect(`${origin}/dashboard`)
    await applyPortalSessionCookie(response, {
      accountId: result.account.id,
      vendorId: result.account.vendorId,
      email: result.account.email,
    })
    if (!result.record.usedAt) {
      await markPortalLoginTokenUsed(result.record.id)
    }
    await touchPortalLogin(result.account.id)
    return response
  } catch (error) {
    console.error("[vendor-portal-verify]", error)
    return fail(origin, "unavailable")
  }
}
