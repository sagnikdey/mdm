import { Plus } from "lucide-react"
import Link from "next/link"

import {
  getAnnotatedPacket,
  getPortalAccountById,
  listCategoriesByIds,
  listVendorProducts,
} from "@workspace/vendor-onboarding"

import { ProductsTable } from "@/app/(portal)/products/products-table"
import { requireVendorSession } from "@/lib/auth/session"
import { Button } from "@workspace/ui/components/button"

export default async function ProductsPage() {
  const session = await requireVendorSession()
  const account = await getPortalAccountById(session.accountId)
  const allowedCategoryIds = account?.allowedCategoryIds ?? []

  const [products, categories, packet] = await Promise.all([
    listVendorProducts(session.vendorId),
    listCategoriesByIds(allowedCategoryIds),
    getAnnotatedPacket(session.vendorId, allowedCategoryIds),
  ])

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Products</h2>
          <p className="mt-1 text-muted-foreground">
            Live catalog. New items go into a draft packet, then MDM review.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/products/add">
            <Plus data-icon="inline-start" />
            Add products
          </Link>
        </Button>
      </div>

      {packet ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/40 px-4 py-3 text-sm">
          <p>
            {packet.status === "pending"
              ? `${packet.itemCount} products waiting for MDM review.`
              : `${packet.itemCount} products in your draft packet.`}
          </p>
          <Button asChild size="sm">
            <Link href="/products/review">Open packet</Link>
          </Button>
        </div>
      ) : null}

      <ProductsTable products={products} categories={categories} />
    </div>
  )
}
