"use client"

import type { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"

import { Badge } from "@workspace/ui/components/badge"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { EntityRowActions } from "@/components/entities/entity-row-actions"
import { storesAPI } from "@/lib/api-client"
import type { Store } from "@/lib/types"

export const storeColumns: ColumnDef<Store>[] = [
  {
    accessorKey: "storeName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Store Name" />
    ),
    cell: ({ row }) => (
      <Link
        href={`/stores/${row.original.storeId}`}
        className="font-medium hover:underline"
      >
        {row.getValue("storeName")}
      </Link>
    ),
  },
  {
    id: "location",
    accessorFn: (row) => `${row.city}, ${row.state}`,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Location" />
    ),
  },
  {
    accessorKey: "region",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Region" />
    ),
    filterFn: (row, id, value) => value === row.getValue(id),
  },
  {
    accessorKey: "storeType",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => (
      <span className="capitalize">{row.getValue("storeType")}</span>
    ),
    filterFn: (row, id, value) => value === row.getValue(id),
  },
  {
    accessorKey: "manager",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Manager" />
    ),
  },
  {
    accessorKey: "isActive",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean
      return (
        <Badge variant={isActive ? "active" : "inactive"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      )
    },
    filterFn: (row, id, value) => String(row.getValue(id)) === value,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const store = row.original
      return (
        <EntityRowActions
          viewHref={`/stores/${store.storeId}`}
          editHref={`/stores/${store.storeId}/edit`}
          entityLabel="Store"
          queryKey={["stores"]}
          onDelete={() => storesAPI.delete(store.storeId)}
        />
      )
    },
  },
]

export const storeFilters = [
  {
    columnId: "region",
    title: "Regions",
    options: [
      { label: "Central", value: "Central" },
      { label: "North", value: "North" },
      { label: "South", value: "South" },
      { label: "West", value: "West" },
    ],
  },
  {
    columnId: "storeType",
    title: "Types",
    options: [
      { label: "Standalone", value: "standalone" },
      { label: "Kiosk", value: "kiosk" },
      { label: "Express", value: "express" },
    ],
  },
  {
    columnId: "isActive",
    title: "Status",
    options: [
      { label: "Active", value: "true" },
      { label: "Inactive", value: "false" },
    ],
  },
]
