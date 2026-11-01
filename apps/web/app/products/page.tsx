import { Plus } from "lucide-react"
import Link from "next/link"

import { ProductsTable } from "@/components/tables/ProductsTable"
import { Button } from "@sagui/ui"

export default function ProductsPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="mt-1 text-fg-muted">
            Manage product catalog and SKUs
          </p>
        </div>
        {/* <Button asChild>
          <Link href="/products/new">
            <Plus data-icon="inline-start" />
            New Product
          </Link>
        </Button> */}
      </div>

      <ProductsTable />
    </div>
  )
}
