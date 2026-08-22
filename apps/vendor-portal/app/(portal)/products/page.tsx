import { Plus } from "lucide-react"
import Link from "next/link"

import {
  getPortalAccountById,
  listCategoriesByIds,
  listPendingCatalogItems,
  listVendorProducts,
} from "@workspace/vendor-onboarding"

import { ProductsTable } from "@/app/(portal)/products/products-table"
import { requireVendorSession } from "@/lib/auth/session"
import { Button } from "@workspace/ui/components/button"

export default async function ProductsPage() {
  const session = await requireVendorSession()
  const account = await getPortalAccountById(session.accountId)
  const allowedCategoryIds = account?.allowedCategoryIds ?? []

  const [products, pending, categories] = await Promise.all([
    listVendorProducts(session.vendorId),
    listPendingCatalogItems(session.vendorId),
    listCategoriesByIds(allowedCategoryIds),
  ])

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Products</h2>
          <p className="mt-1 text-muted-foreground">
            Live catalog plus submissions waiting for MDM review
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/products/new">
            <Plus data-icon="inline-start" />
            New Product
          </Link>
        </Button>
      </div>

      <ProductsTable
        products={products}
        pending={pending}
        categories={categories}
      />
    </div>
  )
}
