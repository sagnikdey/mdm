"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { EntityRowActions } from "@/components/entities/entity-row-actions"
import type { InventoryRecord } from "@/lib/types"

export type InventoryRow = InventoryRecord & {
  storeName: string
  productName: string
}

export const inventoryColumns: ColumnDef<InventoryRow>[] = [
  {
    accessorKey: "storeName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Store" />
    ),
    filterFn: (row, id, value) => value === row.getValue(id),
  },
  {
    accessorKey: "productName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Product" />
    ),
  },
  {
    accessorKey: "sku",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="SKU" />
    ),
  },
  {
    id: "quantity",
    accessorFn: (row) => `${row.currentQuantity} ${row.unitOfMeasure}`,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Quantity" />
    ),
  },
  {
    accessorKey: "lastCountDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Count" />
    ),
    cell: ({ row }) =>
      format(new Date(row.getValue("lastCountDate")), "MMM d, yyyy"),
  },
  {
    accessorKey: "nextCountDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Next Count" />
    ),
    cell: ({ row }) =>
      format(new Date(row.getValue("nextCountDate")), "MMM d, yyyy"),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const record = row.original
      return (
        <EntityRowActions
          viewHref={`/inventory/${record.inventoryId}`}
          editHref={`/inventory/${record.inventoryId}/edit`}
          entityLabel="Inventory record"
          queryKey={["inventory"]}
        />
      )
    },
  },
]

export function buildInventoryFilters(records: InventoryRow[]) {
  const stores = [...new Set(records.map((r) => r.storeName))]

  return [
    {
      columnId: "storeName",
      title: "Stores",
      options: stores.map((s) => ({ label: s, value: s })),
    },
  ]
}
