"use client"

import { useQuery } from "@tanstack/react-query"

import { DataTable } from "@/components/data-table/data-table"
import { storeColumns, storeFilters } from "@/components/tables/stores-columns"
import { storesAPI } from "@/lib/api-client"
import { Skeleton } from "@workspace/ui/components/skeleton"

export function StoresTable() {
  const { data: stores = [], isLoading } = useQuery({
    queryKey: ["stores"],
    queryFn: () => storesAPI.list(),
  })

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    )
  }

  return (
    <DataTable
      columns={storeColumns}
      data={stores}
      searchKey="storeName"
      searchPlaceholder="Search stores..."
      filters={storeFilters}
    />
  )
}
