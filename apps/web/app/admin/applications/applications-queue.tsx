"use client"

import Link from "next/link"
import { useMemo, useState } from "react"

import type {
  ApplicationStatus,
  VendorApplication,
} from "@workspace/vendor-onboarding/types"
import { FilterChips } from "@workspace/ui/components/filter-chips"
import { Badge } from "@workspace/ui/components/badge"
import { GlassCard } from "@workspace/ui/components/glass-card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"

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
      label: STATUS_LABELS[status],
      count: status === "all" ? total : countMap[status] ?? 0,
    }))
  }, [counts])

  const filtered =
    filter === "all"
      ? applications
      : applications.filter((application) => application.status === filter)

  return (
    <GlassCard>
      <div className="space-y-4 px-(--card-spacing)">
        <FilterChips options={options} value={filter} onChange={setFilter} />

        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length ? (
                filtered.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell>
                      <Link
                        href={`/admin/applications/${application.id}`}
                        className="font-medium hover:underline"
                      >
                        {application.companyData.legalName ||
                          application.legalName ||
                          application.ownerEmail}
                      </Link>
                    </TableCell>
                    <TableCell>{application.ownerEmail}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          application.status === "approved"
                            ? "active"
                            : "inactive"
                        }
                      >
                        {application.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    No applications in this queue.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </GlassCard>
  )
}
