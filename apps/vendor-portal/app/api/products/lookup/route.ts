import { NextResponse } from "next/server"
import {
  barcodeChecksumError,
  findVendorBarcodeOwner,
  getPortalAccountById,
  lookupBarcode,
  normalizeBarcode,
} from "@workspace/vendor-onboarding"

import { allowBarcodeLookup } from "@/lib/auth/rate-limit"
import { getPortalSession } from "@/lib/auth/session"

export async function GET(request: Request) {
  const session = await getPortalSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const account = await getPortalAccountById(session.accountId)
  if (!account || account.status !== "active") {
    return NextResponse.json({ error: "Portal account unavailable" }, { status: 403 })
  }
  if (!allowBarcodeLookup(session.accountId)) {
    return NextResponse.json(
      { error: "Too many lookups. Try again later." },
      { status: 429 }
    )
  }

  const barcode = normalizeBarcode(
    new URL(request.url).searchParams.get("barcode") ?? ""
  )
  const checksum = barcodeChecksumError(barcode)
  if (checksum) {
    return NextResponse.json({ error: checksum }, { status: 400 })
  }

  const owner = await findVendorBarcodeOwner(session.vendorId, barcode)
  if (owner) {
    const place =
      owner.where === "live"
        ? `live SKU ${owner.sku}`
        : `draft vendor SKU ${owner.vendorSku}`
    return NextResponse.json(
      { error: `This barcode already exists as ${place}` },
      { status: 409 }
    )
  }

  const result = await lookupBarcode(barcode)
  return NextResponse.json(result)
}
