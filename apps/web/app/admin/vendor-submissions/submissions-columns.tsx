"use client"

import type { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"

import type { VendorSubmissionInboxItem } from "@workspace/vendor-onboarding/portal-types"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"

export const TYPE_LABELS: Record<VendorSubmissionInboxItem["type"], string> = {
  profile_edit: "Profile edit",
  product_submission: "Product submission",
}

export type SubmissionRow = VendorSubmissionInboxItem & {
  typeLabel: string
}

export const submissionColumns: ColumnDef<SubmissionRow>[] = [
  {
    accessorKey: "typeLabel",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => (
      <Badge variant="inactive">{row.original.typeLabel}</Badge>
    ),
    filterFn: (row, id, value) => value === row.getValue(id),
  },
  {
    accessorKey: "vendorName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Vendor" />
    ),
    cell: ({ row }) => (
      <Link
        href={row.original.href}
        className="font-medium hover:underline"
      >
        {row.getValue("vendorName")}
      </Link>
    ),
  },
  {
    accessorKey: "submittedBy",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Submitted by" />
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Submitted" />
    ),
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Button asChild variant="ghost" size="sm">
        <Link href={row.original.href}>Review</Link>
      </Button>
    ),
  },
]

export const submissionFilters = [
  {
    columnId: "typeLabel",
    title: "Types",
    options: [
      { label: "Profile edit", value: "Profile edit" },
      { label: "Product submission", value: "Product submission" },
    ],
  },
]
