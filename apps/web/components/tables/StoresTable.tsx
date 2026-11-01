"use client"

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"

import { Badge, Skeleton, SortableDataTable } from "@sagui/ui"

import { EntityRowActions } from "@/components/entities/entity-row-actions"
import { storesAPI } from "@/lib/api-client"

export function StoresTable() {
  const { data: stores = [], isLoading } = useQuery({
    queryKey: ["stores"],
    queryFn: () => storesAPI.list(),
  })

  const rows = useMemo(
    () =>
      stores.map((store) => ({
        storeId: store.storeId,
        storeName: store.storeName,
        location: `${store.city}, ${store.state}`,
        region: store.region,
        storeType: store.storeType,
        manager: store.manager,
        status: store.isActive ? "Active" : "Inactive",
      })),
    [stores]
  )

  if (isLoading) return <Skeleton label="Loading stores" lines={5} />

  return (
    <SortableDataTable
      caption="Stores"
      rows={rows}
      rowKey="storeId"
      itemName={{ one: "store", other: "stores" }}
      searchable
      searchPlaceholder="Search stores..."
      viewOptions
      pageSize={10}
      columns={[
        {
          key: "storeName",
          label: "Store Name",
          hideable: false,
          render: (value, row) => (
            <Link href={`/stores/${row.storeId}`} className="font-medium hover:underline">
              {String(value)}
            </Link>
          ),
        },
        { key: "location", label: "Location" },
        { key: "region", label: "Region", filterable: true },
        {
          key: "storeType",
          label: "Type",
          filterable: true,
          render: (value) => <span className="capitalize">{String(value)}</span>,
        },
        { key: "manager", label: "Manager" },
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
              viewHref={`/stores/${row.storeId}`}
              editHref={`/stores/${row.storeId}/edit`}
              entityLabel="Store"
              queryKey={["stores"]}
              onDelete={() => storesAPI.delete(row.storeId)}
            />
          ),
        },
      ]}
    />
  )
}
