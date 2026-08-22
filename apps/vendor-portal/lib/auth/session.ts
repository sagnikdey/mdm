import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import type { NextResponse } from "next/server"

const COOKIE = "vendor_portal_session"
const MAX_AGE = 60 * 60 * 24 * 7

export type VendorPortalSession = {
  accountId: string
  vendorId: string
  email: string
}

function getSecret() {
  const secret = process.env["VENDOR_PORTAL_SESSION_SECRET"]?.trim()
  if (secret) return new TextEncoder().encode(secret)
  if (process.env.NODE_ENV !== "production") {
    return new TextEncoder().encode("dev-vendor-portal-session-secret")
  }
  throw new Error("VENDOR_PORTAL_SESSION_SECRET is required")
}

async function signSession(session: VendorPortalSession) {
  return new SignJWT(session)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(getSecret())
}

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: MAX_AGE,
}

export async function applyPortalSessionCookie(
  response: NextResponse,
  session: VendorPortalSession
) {
  const token = await signSession(session)
  response.cookies.set(COOKIE, token, cookieOptions)
  return response
}

export async function getPortalSession(): Promise<VendorPortalSession | null> {
  const token = (await cookies()).get(COOKIE)?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return {
      accountId: payload.accountId as string,
      vendorId: payload.vendorId as string,
      email: payload.email as string,
    }
  } catch {
    return null
  }
}

export async function requireVendorSession() {
  const session = await getPortalSession()
  if (!session) redirect("/login")
  return session
}

export async function clearPortalSessionCookie(response: NextResponse) {
  response.cookies.set(COOKIE, "", { ...cookieOptions, maxAge: 0 })
  return response
}

export { COOKIE, getSecret }
