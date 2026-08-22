import { NextResponse } from "next/server"

import { clearPortalSessionCookie } from "@/lib/auth/session"

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/login", request.url), 303)
  return clearPortalSessionCookie(response)
}
