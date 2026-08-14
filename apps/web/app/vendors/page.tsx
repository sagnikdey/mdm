import { Plus } from "lucide-react"
import Link from "next/link"

import { VendorsTable } from "@/components/tables/VendorsTable"
import { Button } from "@workspace/ui/components/button"

export default function VendorsPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Vendors</h2>
          <p className="mt-1 text-muted-foreground">
            Manage supplier relationships
          </p>
        </div>
        <Button asChild>
          <Link href="/vendors/new">
            <Plus className="size-4" />
            New Vendor
          </Link>
        </Button>
      </div>

      <VendorsTable />
    </div>
  )
}
