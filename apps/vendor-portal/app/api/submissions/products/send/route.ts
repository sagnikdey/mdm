import { NextResponse } from "next/server"
import {
  getPortalAccountById,
  sendDraftForReview,
} from "@workspace/vendor-onboarding"

import { getPortalSession } from "@/lib/auth/session"

export async function POST() {
  const session = await getPortalSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const account = await getPortalAccountById(session.accountId)
  if (!account || account.status !== "active") {
    return NextResponse.json({ error: "Portal account unavailable" }, { status: 403 })
  }

  try {
    const packet = await sendDraftForReview({
      vendorId: session.vendorId,
      allowedCategoryIds: account.allowedCategoryIds,
    })
    return NextResponse.json({ ok: true, packet })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not send" },
      { status: 400 }
    )
  }
}
