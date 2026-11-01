import { Plus } from "lucide-react"
import Link from "next/link"

import { StoresTable } from "@/components/tables/StoresTable"
import { Button } from "@sagui/ui"

export default function StoresPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Stores</h1>
          <p className="mt-1 text-fg-muted">
            Manage all store locations
          </p>
        </div>
        <Button asChild>
          <Link href="/stores/new">
            <Plus className="size-4" />
            New Store
          </Link>
        </Button>
      </div>

      <StoresTable />
    </div>
  )
}
 