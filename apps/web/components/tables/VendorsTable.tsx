"use client"

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"

import { Badge, Skeleton, SortableDataTable } from "@sagui/ui"

import { EntityRowActions } from "@/components/entities/entity-row-actions"
import { vendorsAPI } from "@/lib/api-client"

export function VendorsTable() {
  const { data: vendors = [], isLoading } = useQuery({
    queryKey: ["vendors"],
    queryFn: () => vendorsAPI.list(),
  })

  const rows = useMemo(
    () =>
      vendors.map((vendor) => ({
        vendorId: vendor.vendorId,
        vendorName: vendor.vendorName,
        vendorCategory: vendor.vendorCategory,
        contactPerson: vendor.contactPerson,
        email: vendor.email,
        paymentTerms: vendor.paymentTerms,
        status: vendor.isActive ? "Active" : "Inactive",
      })),
    [vendors]
  )

  if (isLoading) return <Skeleton label="Loading vendors" lines={5} />

  return (
    <SortableDataTable
      caption="Vendors"
      rows={rows}
      rowKey="vendorId"
      itemName={{ one: "vendor", other: "vendors" }}
      searchable
      searchPlaceholder="Search vendors..."
      viewOptions
      pageSize={10}
      columns={[
        {
          key: "vendorName",
          label: "Vendor Name",
          hideable: false,
          render: (value, row) => (
            <Link href={`/vendors/${row.vendorId}`} className="font-medium hover:underline">
              {String(value)}
            </Link>
          ),
        },
        {
          key: "vendorCategory",
          label: "Category",
          filterable: true,
          render: (value) => <span className="capitalize">{String(value)}</span>,
        },
        { key: "contactPerson", label: "Contact" },
        { key: "email", label: "Email" },
        { key: "paymentTerms", label: "Payment Terms" },
        {
          key: "status",
          label: "Status",
          filterable: true,
          render: (value) => (
            <Badge tone={value === "Active" ? "success" : "neutral"}>{String(value)}</Badge>
          ),
        },
        {
          key: "actions",
          label: "Actions",
          sortable: false,
          searchable: false,
          hideable: false,
          render: (_value, row) => (
            <EntityRowActions
              viewHref={`/vendors/${row.vendorId}`}
              editHref={`/vendors/${row.vendorId}/edit`}
              entityLabel="Vendor"
              queryKey={["vendors"]}
              onDelete={() => vendorsAPI.delete(row.vendorId)}
            />
          ),
        },
      ]}
    />
  )
}
