import { Plus } from "lucide-react"
import Link from "next/link"

import { InventoryTable } from "@/components/tables/InventoryTable"
import { Button } from "@workspace/ui/components/button"

export default function InventoryPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Inventory</h2>
          <p className="mt-1 text-muted-foreground">
            Track stock levels across store locations
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/inventory/new">
            <Plus className="size-4" />
            New Record
          </Link>
        </Button>
      </div>

      <InventoryTable />
    </div>
  )
}
