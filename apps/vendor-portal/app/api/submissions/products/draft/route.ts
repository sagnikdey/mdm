import { NextResponse } from "next/server"
import {
  getAnnotatedPacket,
  getPortalAccountById,
} from "@workspace/vendor-onboarding"

import { getPortalSession } from "@/lib/auth/session"

export async function GET() {
  const session = await getPortalSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const account = await getPortalAccountById(session.accountId)
  if (!account || account.status !== "active") {
    return NextResponse.json({ error: "Portal account unavailable" }, { status: 403 })
  }

  const packet = await getAnnotatedPacket(
    session.vendorId,
    account.allowedCategoryIds
  )
  return NextResponse.json({ packet: packet ?? null })
}
