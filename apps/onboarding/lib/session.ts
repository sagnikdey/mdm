import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import type { NextResponse } from "next/server"

const COOKIE = "vendor_session"
const MAX_AGE = 60 * 60 * 24 * 7

export type VendorSession = {
  email: string
  applicationId: string
}

function getSecret() {
  const secret = process.env["ONBOARDING_SESSION_SECRET"]?.trim()
  if (!secret) {
    throw new Error("ONBOARDING_SESSION_SECRET is required")
  }
  return new TextEncoder().encode(secret)
}

async function signVendorSession(session: VendorSession) {
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

export async function applyVendorSessionCookie(
  response: NextResponse,
  session: VendorSession
) {
  const token = await signVendorSession(session)
  response.cookies.set(COOKIE, token, cookieOptions)
  return response
}

/** Use in Server Actions only */
export async function createVendorSession(session: VendorSession) {
  const token = await signVendorSession(session)
  ;(await cookies()).set(COOKIE, token, cookieOptions)
}

export async function getVendorSession(): Promise<VendorSession | null> {
  const token = (await cookies()).get(COOKIE)?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, getSecret())
    return {
      email: payload.email as string,
      applicationId: payload.applicationId as string,
    }
  } catch {
    return null
  }
}

export { COOKIE, getSecret }
