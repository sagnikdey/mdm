import { NextResponse, type NextRequest } from "next/server"
import { jwtVerify } from "jose"

import { COOKIE, getSecret } from "@/lib/auth/session"

export async function middleware(req: NextRequest) {
  const token = req.cookies.get(COOKIE)?.value
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  try {
    await jwtVerify(token, getSecret())
    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL("/login", req.url))
  }
}

export const config = {
  matcher: ["/((?!login|auth|_next/static|_next/image|favicon.ico|api/auth).*)"],
}
