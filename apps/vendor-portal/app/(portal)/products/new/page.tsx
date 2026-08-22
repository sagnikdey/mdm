import {
  getPortalAccountById,
  listCategoriesByIds,
} from "@workspace/vendor-onboarding"

import { PortalProductForm } from "@/app/(portal)/products/new/product-form"
import { requireVendorSession } from "@/lib/auth/session"

export default async function NewProductPage() {
  const session = await requireVendorSession()
  const account = await getPortalAccountById(session.accountId)
  const categories = await listCategoriesByIds(account?.allowedCategoryIds ?? [])

  return <PortalProductForm categories={categories} />
}
