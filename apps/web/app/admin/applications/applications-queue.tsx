"use client"

import Link from "next/link"
import { useMemo, useState } from "react"

import type {
  ApplicationStatus,
  VendorApplication,
} from "@workspace/vendor-onboarding/types"
import { Badge, ChipGroup, SortableDataTable } from "@sagui/ui"

type ApplicationsQueueProps = {
  applications: VendorApplication[]
  counts: Array<{ status: ApplicationStatus; count: number }>
}

const STATUS_LABELS: Record<ApplicationStatus | "all", string> = {
  all: "All",
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under Review",
  needs_info: "Needs Info",
  approved: "Approved",
  rejected: "Rejected",
}

export function ApplicationsQueue({
  applications,
  counts,
}: ApplicationsQueueProps) {
  const [filter, setFilter] = useState<ApplicationStatus | "all">("all")

  const options = useMemo(() => {
    const total = counts.reduce((sum, item) => sum + item.count, 0)
    const countMap = Object.fromEntries(
      counts.map((item) => [item.status, item.count])
    )

    return (
      [
        "all",
        "submitted",
        "under_review",
        "needs_info",
        "approved",
        "rejected",
      ] as const
    ).map((status) => ({
      value: status,
      label: `${STATUS_LABELS[status]} (${status === "all" ? total : countMap[status] ?? 0})`,
    }))
  }, [counts])

  const rows = applications
    .filter((application) => filter === "all" || application.status === filter)
    .map((application) => ({
      id: application.id,
      company:
        application.companyData.legalName ||
        application.legalName ||
        application.ownerEmail,
      email: application.ownerEmail,
      status: application.status.replace("_", " "),
    }))

  return (
    <div className="space-y-4">
      <ChipGroup
        label="Filter by status"
        multiple={false}
        options={options}
        value={[filter]}
        onValueChange={(value) =>
          setFilter((value[0] as ApplicationStatus | "all" | undefined) ?? "all")
        }
      />
      <SortableDataTable
        caption="Vendor applications"
        rows={rows}
        rowKey={(row) => String(row.id)}
        itemName={{ one: "application", other: "applications" }}
        emptyMessage="No applications in this queue."
        pageSize={10}
        columns={[
          {
            key: "company",
            label: "Company",
            render: (value, row) => (
              <Link href={`/admin/applications/${row.id}`} className="font-medium hover:underline">
                {String(value)}
              </Link>
            ),
          },
          { key: "email", label: "Email" },
          {
            key: "status",
            label: "Status",
            render: (value) => (
              <Badge tone={value === "approved" ? "success" : "neutral"}>{String(value)}</Badge>
            ),
          },
        ]}
      />
    </div>
  )
}
