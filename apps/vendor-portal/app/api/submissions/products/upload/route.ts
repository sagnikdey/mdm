import { NextResponse } from "next/server"
import {
  appendDraftItems,
  getPortalAccountById,
  listCategoriesByIds,
} from "@workspace/vendor-onboarding"

import { getPortalSession } from "@/lib/auth/session"
import { parseProductFile } from "@/lib/product-file"

export async function POST(request: Request) {
  const session = await getPortalSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const account = await getPortalAccountById(session.accountId)
  if (!account || account.status !== "active") {
    return NextResponse.json({ error: "Portal account unavailable" }, { status: 403 })
  }

  const form = await request.formData()
  const file = form.get("file")
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose an .xlsx or .csv file" }, { status: 400 })
  }

  const name = file.name.toLowerCase()
  if (!name.endsWith(".xlsx") && !name.endsWith(".csv")) {
    return NextResponse.json(
      { error: "Upload an Excel (.xlsx) or CSV (.csv) file" },
      { status: 400 }
    )
  }

  try {
    const categories = await listCategoriesByIds(account.allowedCategoryIds)
    const buffer = Buffer.from(await file.arrayBuffer())
    const parsed = parseProductFile(buffer, file.name, categories)
    if (!parsed.items.length) {
      return NextResponse.json({ error: "No product rows found" }, { status: 400 })
    }

    const packet = await appendDraftItems({
      vendorId: session.vendorId,
      submittedBy: session.email,
      allowedCategoryIds: account.allowedCategoryIds,
      source: name.endsWith(".csv") ? "csv_upload" : "xlsx_upload",
      items: parsed.items,
    })

    return NextResponse.json({
      ok: true,
      packet,
      unknownColumns: parsed.unknownColumns,
      added: parsed.items.length,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 400 }
    )
  }
}
