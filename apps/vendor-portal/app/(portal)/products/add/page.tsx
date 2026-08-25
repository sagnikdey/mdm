import {
  getAnnotatedPacket,
  getPortalAccountById,
  listCategoriesByIds,
  listVendorProducts,
} from "@workspace/vendor-onboarding"

import { formContainerClassName } from "@workspace/ui/components/form-layout"
import { cn } from "@workspace/ui/lib/utils"

import { AddProducts } from "@/app/(portal)/products/add/add-products"
import { requireVendorSession } from "@/lib/auth/session"

type PageProps = {
  searchParams: Promise<{ itemId?: string }>
}

export default async function AddProductsPage({ searchParams }: PageProps) {
  const session = await requireVendorSession()
  const { itemId } = await searchParams
  const account = await getPortalAccountById(session.accountId)
  const allowedCategoryIds = account?.allowedCategoryIds ?? []

  const [categories, liveProducts, packet] = await Promise.all([
    listCategoriesByIds(allowedCategoryIds),
    listVendorProducts(session.vendorId),
    getAnnotatedPacket(session.vendorId, allowedCategoryIds),
  ])

  const editId = itemId ? Number(itemId) : NaN
  const editItem = packet?.items.find((item) => item.id === editId)

  return (
    <div className={cn(formContainerClassName, "space-y-6 p-6")}>
      <div>
        <h2 className="text-3xl font-bold">Add products</h2>
        <p className="mt-1 text-muted-foreground">
          Build a draft packet, then send it once for MDM review.
        </p>
      </div>
      <AddProducts
        categories={categories}
        liveProducts={liveProducts}
        draftVendorSkus={packet?.items.map((item) => item.vendorSku) ?? []}
        editItem={editItem}
        locked={packet?.status === "pending"}
        allowedNames={categories.map((category) => category.categoryName)}
      />
    </div>
  )
}
