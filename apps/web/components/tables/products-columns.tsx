"use client"

import type { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"

import { Badge } from "@workspace/ui/components/badge"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { EntityRowActions } from "@/components/entities/entity-row-actions"
import { productsAPI } from "@/lib/api-client"
import type { Product } from "@/lib/types"

export type ProductRow = Product & {
  categoryName: string
  vendorName: string
}

export const productColumns: ColumnDef<ProductRow>[] = [
  {
    accessorKey: "productName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Product" />
    ),
    cell: ({ row }) => (
      <Link
        href={`/products/${row.original.sku}`}
        className="font-medium hover:underline"
      >
        {row.getValue("productName")}
      </Link>
    ),
  },
  {
    accessorKey: "sku",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="SKU" />
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
    accessorKey: "vendorName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Vendor" />
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
      const product = row.original
      return (
        <EntityRowActions
          viewHref={`/products/${product.sku}`}
          editHref={`/products/${product.sku}/edit`}
          entityLabel="Product"
          queryKey={["products"]}
          onDelete={() => productsAPI.delete(product.sku)}
        />
      )
    },
  },
]

export function buildProductFilters(products: ProductRow[]) {
  const categories = [...new Set(products.map((p) => p.categoryName))]
  const vendors = [...new Set(products.map((p) => p.vendorName))]

  return [
    {
      columnId: "categoryName",
      title: "Categories",
      options: categories.map((c) => ({ label: c, value: c })),
    },
    {
      columnId: "vendorName",
      title: "Vendors",
      options: vendors.map((v) => ({ label: v, value: v })),
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
}
