import { NextResponse } from "next/server"
import {
  appendDraftItems,
  getPortalAccountById,
  normalizeProposedProduct,
} from "@workspace/vendor-onboarding"

import { getPortalSession } from "@/lib/auth/session"
import { portalProductSchema } from "@/lib/schemas/product"

export async function POST(request: Request) {
  const session = await getPortalSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const account = await getPortalAccountById(session.accountId)
  if (!account || account.status !== "active") {
    return NextResponse.json({ error: "Portal account unavailable" }, { status: 403 })
  }

  const parsed = portalProductSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid product" },
      { status: 400 }
    )
  }

  try {
    const packet = await appendDraftItems({
      vendorId: session.vendorId,
      submittedBy: session.email,
      allowedCategoryIds: account.allowedCategoryIds,
      source: "single_form",
      items: [normalizeProposedProduct(parsed.data)],
    })
    return NextResponse.json({ ok: true, id: packet?.id, itemCount: packet?.itemCount })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Submit failed" },
      { status: 400 }
    )
  }
}
