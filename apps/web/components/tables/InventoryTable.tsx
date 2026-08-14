"use client"

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"

import { DataTable } from "@/components/data-table/data-table"
import {
  buildInventoryFilters,
  inventoryColumns,
  type InventoryRow,
} from "@/components/tables/inventory-columns"
import { inventoryAPI, productsAPI, storesAPI } from "@/lib/api-client"
import { Skeleton } from "@workspace/ui/components/skeleton"

export function InventoryTable() {
  const { data: inventory = [], isLoading: inventoryLoading } = useQuery({
    queryKey: ["inventory"],
    queryFn: () => inventoryAPI.list(),
  })

  const { data: stores = [] } = useQuery({
    queryKey: ["stores"],
    queryFn: () => storesAPI.list(),
  })

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => productsAPI.list(),
  })

  const rows = useMemo<InventoryRow[]>(
    () =>
      inventory.map((record) => ({
        ...record,
        storeName:
          stores.find((s) => s.storeId === record.storeId)?.storeName ??
          record.storeId,
        productName:
          products.find((p) => p.sku === record.sku)?.productName ?? record.sku,
      })),
    [inventory, stores, products]
  )

  const filters = useMemo(() => buildInventoryFilters(rows), [rows])

  if (inventoryLoading) {
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
      columns={inventoryColumns}
      data={rows}
      searchKey="productName"
      searchPlaceholder="Search inventory..."
      filters={filters}
    />
  )
}
