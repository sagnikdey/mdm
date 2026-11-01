import { Plus } from "lucide-react"
import Link from "next/link"

import {
  getAnnotatedPacket,
  getPortalAccountById,
  listVendorProducts,
} from "@workspace/vendor-onboarding"

import { ProductsTable } from "@/app/(portal)/products/products-table"
import { requireVendorSession } from "@/lib/auth/session"
import { Button } from "@sagui/ui"

export default async function ProductsPage() {
  const session = await requireVendorSession()
  const account = await getPortalAccountById(session.accountId)
  const allowedCategoryIds = account?.allowedCategoryIds ?? []

  const [products, packet] = await Promise.all([
    listVendorProducts(session.vendorId),
    getAnnotatedPacket(session.vendorId, allowedCategoryIds),
  ])

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="mt-1 text-fg-muted">
            Live catalog. New items go into a draft packet, then MDM review.
          </p>
        </div>
        <Button asChild>
          <Link href="/products/add">
            <Plus className="size-4" />
            Add products
          </Link>
        </Button>
      </div>

      {packet ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-container border border-border-default bg-bg-muted px-4 py-3 text-sm">
          <p>
            {packet.status === "pending"
              ? `${packet.itemCount} products waiting for MDM review.`
              : `${packet.itemCount} products in your draft packet.`}
          </p>
          <Button asChild size="sm" variant="outline">
            <Link href="/products/review">Open packet</Link>
          </Button>
        </div>
      ) : null}

      <ProductsTable products={products} />
    </div>
  )
}
