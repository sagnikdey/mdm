"use client"

import { useMemo } from "react"
import Link from "next/link"

import type { VendorSubmissionInboxItem } from "@workspace/vendor-onboarding/portal-types"
import { Alert, Badge, Button, Skeleton, SortableDataTable } from "@sagui/ui"

import { usePendingSubmissions } from "@/app/admin/vendor-submissions/use-pending-submissions"

const TYPE_LABELS: Record<VendorSubmissionInboxItem["type"], string> = {
  profile_edit: "Profile edit",
  product_submission: "Product submission",
}

export function SubmissionsInbox() {
  const { data: items = [], isLoading } = usePendingSubmissions()

  const rows = useMemo(
    () =>
      items.map((item) => ({
        key: `${item.type}-${item.href}`,
        typeLabel: TYPE_LABELS[item.type],
        vendorName: item.vendorName,
        submittedBy: item.submittedBy,
        createdAt: item.createdAt,
        href: item.href,
      })),
    [items]
  )

  if (isLoading) return <Skeleton label="Loading submissions" lines={5} />

  return (
    <div className="space-y-4">
      {rows.length ? (
        <Alert
          tone="info"
          title={`${rows.length} submission${rows.length === 1 ? "" : "s"} waiting for review`}
        >
          Profile edits and product additions stay pending until you approve or reject them.
        </Alert>
      ) : null}

      <SortableDataTable
        caption="Vendor submissions"
        rows={rows}
        rowKey="key"
        itemName={{ one: "submission", other: "submissions" }}
        emptyMessage="No submissions waiting."
        searchable
        searchPlaceholder="Search submissions..."
        viewOptions
        pageSize={10}
        columns={[
          {
            key: "typeLabel",
            label: "Type",
            filterable: true,
            render: (value) => <Badge>{String(value)}</Badge>,
          },
          {
            key: "vendorName",
            label: "Vendor",
            hideable: false,
            render: (value, row) => (
              <Link href={row.href} className="font-medium hover:underline">
                {String(value)}
              </Link>
            ),
          },
          { key: "submittedBy", label: "Submitted by" },
          {
            key: "createdAt",
            label: "Submitted",
            searchable: false,
            render: (value) => new Date(String(value)).toLocaleString(),
          },
          {
            key: "actions",
            label: "Actions",
            sortable: false,
            searchable: false,
            hideable: false,
            render: (_value, row) => (
              <Button asChild variant="ghost" size="sm">
                <Link href={row.href}>Review</Link>
              </Button>
            ),
          },
        ]}
      />
    </div>
  )
}
