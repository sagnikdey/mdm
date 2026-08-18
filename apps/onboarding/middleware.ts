import { NextResponse, type NextRequest } from "next/server"
import { jwtVerify } from "jose"

import { getSecret } from "@/lib/session"

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("vendor_session")?.value
  if (!token) {
    return NextResponse.redirect(new URL("/expired?reason=no_session", req.url))
  }

  try {
    await jwtVerify(token, getSecret())
    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL("/expired?reason=no_session", req.url))
  }
}

export const config = {
  matcher: ["/onboarding/:path*"],
}
