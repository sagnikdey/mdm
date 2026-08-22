"use client"

import { useMemo } from "react"
import { InboxIcon } from "lucide-react"

import { DataTable } from "@/components/data-table/data-table"
import {
  submissionColumns,
  submissionFilters,
  TYPE_LABELS,
  type SubmissionRow,
} from "@/app/admin/vendor-submissions/submissions-columns"
import { usePendingSubmissions } from "@/app/admin/vendor-submissions/use-pending-submissions"
import { Skeleton } from "@workspace/ui/components/skeleton"

export function SubmissionsInbox() {
  const { data: items = [], isLoading } = usePendingSubmissions()

  const rows = useMemo<SubmissionRow[]>(
    () =>
      items.map((item) => ({
        ...item,
        typeLabel: TYPE_LABELS[item.type],
      })),
    [items]
  )

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {rows.length ? (
        <div
          role="status"
          className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4"
        >
          <InboxIcon className="mt-0.5 size-4 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-medium">
              {rows.length} submission{rows.length === 1 ? "" : "s"} waiting
              for review
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Profile edits and product additions stay pending until you
              approve or reject them.
            </p>
          </div>
        </div>
      ) : null}

      <DataTable
        columns={submissionColumns}
        data={rows}
        searchKey="vendorName"
        searchPlaceholder="Search submissions..."
        filters={submissionFilters}
      />
    </div>
  )
}
