import { NextResponse } from "next/server"
import {
  deleteDraftItem,
  getPortalAccountById,
  normalizeProposedProduct,
  updateDraftItem,
} from "@workspace/vendor-onboarding"

import { getPortalSession } from "@/lib/auth/session"
import { portalProductSchema } from "@/lib/schemas/product"

type RouteContext = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getPortalSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const account = await getPortalAccountById(session.accountId)
  if (!account || account.status !== "active") {
    return NextResponse.json({ error: "Portal account unavailable" }, { status: 403 })
  }

  const itemId = Number((await context.params).id)
  if (!Number.isFinite(itemId)) {
    return NextResponse.json({ error: "Invalid item" }, { status: 400 })
  }

  const parsed = portalProductSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid product" },
      { status: 400 }
    )
  }

  try {
    const packet = await updateDraftItem({
      vendorId: session.vendorId,
      itemId,
      allowedCategoryIds: account.allowedCategoryIds,
      values: normalizeProposedProduct(parsed.data),
    })
    return NextResponse.json({ ok: true, packet })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Update failed" },
      { status: 400 }
    )
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getPortalSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const itemId = Number((await context.params).id)
  if (!Number.isFinite(itemId)) {
    return NextResponse.json({ error: "Invalid item" }, { status: 400 })
  }

  try {
    const packet = await deleteDraftItem(session.vendorId, itemId)
    return NextResponse.json({ ok: true, packet })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Delete failed" },
      { status: 400 }
    )
  }
}
