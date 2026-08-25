import {
  getPortalAccountById,
  listCategoriesByIds,
  listVendorProducts,
} from "@workspace/vendor-onboarding"

import { getPortalSession } from "@/lib/auth/session"
import { buildTemplateWorkbook } from "@/lib/product-file"

export async function GET() {
  const session = await getPortalSession()
  if (!session) {
    return new Response("Unauthorized", { status: 401 })
  }
  const account = await getPortalAccountById(session.accountId)
  if (!account || account.status !== "active") {
    return new Response("Portal account unavailable", { status: 403 })
  }

  const [categories, products] = await Promise.all([
    listCategoriesByIds(account.allowedCategoryIds),
    listVendorProducts(session.vendorId),
  ])
  const buffer = buildTemplateWorkbook(categories, products)

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition":
        'attachment; filename="vendor-products-template.xlsx"',
    },
  })
}
