"use client"

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"

import { Skeleton, SortableDataTable } from "@sagui/ui"

import { EntityRowActions } from "@/components/entities/entity-row-actions"
import { inventoryAPI, productsAPI, storesAPI } from "@/lib/api-client"

const formatDate = (value: unknown) => format(new Date(String(value)), "MMM d, yyyy")

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

  const rows = useMemo(
    () =>
      inventory.map((record) => ({
        inventoryId: record.inventoryId,
        storeName:
          stores.find((s) => s.storeId === record.storeId)?.storeName ??
          record.storeId,
        productName:
          products.find((p) => p.sku === record.sku)?.productName ?? record.sku,
        sku: record.sku,
        quantity: `${record.currentQuantity} ${record.unitOfMeasure}`,
        lastCountDate: record.lastCountDate,
        nextCountDate: record.nextCountDate,
      })),
    [inventory, stores, products]
  )

  if (inventoryLoading) return <Skeleton label="Loading inventory" lines={5} />

  return (
    <SortableDataTable
      caption="Inventory"
      rows={rows}
      rowKey="inventoryId"
      itemName={{ one: "record", other: "records" }}
      searchable
      searchPlaceholder="Search inventory..."
      viewOptions
      pageSize={10}
      columns={[
        { key: "storeName", label: "Store", filterable: true },
        { key: "productName", label: "Product", hideable: false },
        { key: "sku", label: "SKU", width: "10%" },
        { key: "quantity", label: "Quantity" },
        { key: "lastCountDate", label: "Last Count", searchable: false, render: formatDate },
        { key: "nextCountDate", label: "Next Count", searchable: false, render: formatDate },
        {
          key: "actions",
          label: "Actions",
          sortable: false,
          searchable: false,
          hideable: false,
          render: (_value, row) => (
            <EntityRowActions
              viewHref={`/inventory/${row.inventoryId}`}
              editHref={`/inventory/${row.inventoryId}/edit`}
              entityLabel="Inventory record"
              queryKey={["inventory"]}
            />
          ),
        },
      ]}
    />
  )
}
