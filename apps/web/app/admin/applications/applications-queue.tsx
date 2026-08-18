"use client"

import Link from "next/link"
import { useMemo, useState } from "react"

import type { ApplicationStatus, VendorApplication } from "@workspace/vendor-onboarding/types"
import { FilterChips } from "@workspace/ui/components/filter-chips"
import { Badge } from "@workspace/ui/components/badge"

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

export function ApplicationsQueue({ applications, counts }: ApplicationsQueueProps) {
  const [filter, setFilter] = useState<ApplicationStatus | "all">("all")

  const options = useMemo(() => {
    const total = counts.reduce((sum, item) => sum + item.count, 0)
    const countMap = Object.fromEntries(counts.map((item) => [item.status, item.count]))

    return (["all", "submitted", "under_review", "needs_info", "approved", "rejected"] as const).map(
      (status) => ({
        value: status,
        label: STATUS_LABELS[status],
        count: status === "all" ? total : countMap[status] ?? 0,
      })
    )
  }, [counts])

  const filtered =
    filter === "all"
      ? applications
      : applications.filter((application) => application.status === filter)

  return (
    <div className="space-y-4">
      <FilterChips options={options} value={filter} onChange={setFilter} />

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">No applications in this queue.</p>
        ) : (
          filtered.map((application) => (
            <Link
              key={application.id}
              href={`/admin/applications/${application.id}`}
              className="flex items-center justify-between rounded-lg border px-4 py-3 transition-colors hover:bg-muted/40"
            >
              <div>
                <p className="font-medium">
                  {application.companyData.legalName ||
                    application.legalName ||
                    application.ownerEmail}
                </p>
                <p className="text-xs text-muted-foreground">{application.ownerEmail}</p>
              </div>
              <Badge variant={application.status === "approved" ? "active" : "inactive"}>
                {application.status.replace("_", " ")}
              </Badge>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
