import { NextResponse } from "next/server"
import {
  createProfileEdit,
  getVendorSnapshot,
} from "@workspace/vendor-onboarding"

import { getPortalSession } from "@/lib/auth/session"

export async function POST(request: Request) {
  const session = await getPortalSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const current = await getVendorSnapshot(session.vendorId)
  if (!current) {
    return NextResponse.json({ error: "Vendor not found" }, { status: 404 })
  }

  const body = (await request.json()) as Partial<typeof current>
  const proposedChanges = {
    vendorName: String(body.vendorName ?? current.vendorName).trim(),
    vendorCategory: current.vendorCategory,
    contactPerson: String(body.contactPerson ?? current.contactPerson).trim(),
    email: String(body.email ?? current.email).trim(),
    phone: String(body.phone ?? current.phone).trim(),
    address: String(body.address ?? current.address).trim(),
    paymentTerms: String(body.paymentTerms ?? current.paymentTerms).trim(),
    minimumOrderQuantity: Number(
      body.minimumOrderQuantity ?? current.minimumOrderQuantity
    ),
  }

  try {
    const edit = await createProfileEdit({
      vendorId: session.vendorId,
      submittedBy: session.email,
      proposedChanges,
      currentSnapshot: current,
    })
    return NextResponse.json({ ok: true, id: edit.id })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Submit failed" },
      { status: 400 }
    )
  }
}
