"use client"

import type { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"

export type CatalogRow = {
  id: string
  kind: "live" | "pending"
  productName: string
  sku: string
  vendorSku: string
  categoryName: string
  wholesalePrice: number
  status: "active" | "inactive" | "pending"
}

export const catalogColumns: ColumnDef<CatalogRow>[] = [
  {
    accessorKey: "productName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Product" />
    ),
    cell: ({ row }) =>
      row.original.kind === "live" ? (
        <Link
          href={`/products/${row.original.sku}`}
          className="font-medium hover:underline"
        >
          {row.getValue("productName")}
        </Link>
      ) : (
        <span className="font-medium">{row.getValue("productName")}</span>
      ),
  },
  {
    accessorKey: "sku",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="SKU" />
    ),
  },
  {
    accessorKey: "vendorSku",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Vendor SKU" />
    ),
  },
  {
    accessorKey: "categoryName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category" />
    ),
    filterFn: (row, id, value) => value === row.getValue(id),
  },
  {
    accessorKey: "wholesalePrice",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Wholesale" />
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("wholesalePrice"))
      return `$${amount.toFixed(2)}`
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as CatalogRow["status"]
      const label =
        status === "pending"
          ? "Pending review"
          : status === "active"
            ? "Active"
            : "Inactive"
      return (
        <Badge variant={status === "active" ? "active" : "inactive"}>
          {label}
        </Badge>
      )
    },
    filterFn: (row, id, value) => String(row.getValue(id)) === value,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      if (row.original.kind !== "live") return null
      return (
        <Button asChild variant="ghost" size="sm">
          <Link href={`/products/${row.original.sku}`}>View</Link>
        </Button>
      )
    },
  },
]

export function buildCatalogFilters(rows: CatalogRow[]) {
  const categories = [...new Set(rows.map((row) => row.categoryName))]

  return [
    {
      columnId: "categoryName",
      title: "Categories",
      options: categories.map((category) => ({
        label: category,
        value: category,
      })),
    },
    {
      columnId: "status",
      title: "Status",
      options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
        { label: "Pending review", value: "pending" },
      ],
    },
  ]
}
