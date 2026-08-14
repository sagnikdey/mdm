import { Plus } from "lucide-react"
import Link from "next/link"

import { ProductsTable } from "@/components/tables/ProductsTable"
import { Button } from "@workspace/ui/components/button"

export default function ProductsPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Products</h2>
          <p className="mt-1 text-muted-foreground">
            Manage product catalog and SKUs
          </p>
        </div>
        <Button asChild>
          <Link href="/products/new">
            <Plus className="size-4" />
            New Product
          </Link>
        </Button>
      </div>

      <ProductsTable />
    </div>
  )
}
