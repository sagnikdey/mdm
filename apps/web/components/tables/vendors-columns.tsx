"use client"

import type { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"

import { Badge } from "@workspace/ui/components/badge"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { EntityRowActions } from "@/components/entities/entity-row-actions"
import { vendorsAPI } from "@/lib/api-client"
import type { Vendor } from "@/lib/types"

export const vendorColumns: ColumnDef<Vendor>[] = [
  {
    accessorKey: "vendorName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Vendor Name" />
    ),
    cell: ({ row }) => (
      <Link
        href={`/vendors/${row.original.vendorId}`}
        className="font-medium hover:underline"
      >
        {row.getValue("vendorName")}
      </Link>
    ),
  },
  {
    accessorKey: "vendorCategory",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category" />
    ),
    cell: ({ row }) => (
      <span className="capitalize">{row.getValue("vendorCategory")}</span>
    ),
    filterFn: (row, id, value) => value === row.getValue(id),
  },
  {
    accessorKey: "contactPerson",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Contact" />
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
  },
  {
    accessorKey: "paymentTerms",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Payment Terms" />
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
      const vendor = row.original
      return (
        <EntityRowActions
          viewHref={`/vendors/${vendor.vendorId}`}
          editHref={`/vendors/${vendor.vendorId}/edit`}
          entityLabel="Vendor"
          queryKey={["vendors"]}
          onDelete={() => vendorsAPI.delete(vendor.vendorId)}
        />
      )
    },
  },
]

export const vendorFilters = [
  {
    columnId: "vendorCategory",
    title: "Categories",
    options: [
      { label: "Beverages", value: "beverages" },
      { label: "Snacks", value: "snacks" },
      { label: "Food", value: "food" },
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
