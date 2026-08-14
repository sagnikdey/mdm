"use client"

import { useQuery } from "@tanstack/react-query"

import { DataTable } from "@/components/data-table/data-table"
import {
  vendorColumns,
  vendorFilters,
} from "@/components/tables/vendors-columns"
import { vendorsAPI } from "@/lib/api-client"
import { Skeleton } from "@workspace/ui/components/skeleton"

export function VendorsTable() {
  const { data: vendors = [], isLoading } = useQuery({
    queryKey: ["vendors"],
    queryFn: () => vendorsAPI.list(),
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
      columns={vendorColumns}
      data={vendors}
      searchKey="vendorName"
      searchPlaceholder="Search vendors..."
      filters={vendorFilters}
    />
  )
}
