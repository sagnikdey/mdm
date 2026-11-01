"use client"

import Link from "next/link"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useState } from "react"

import type {
  VendorProfileEdit,
  VendorProfileFields,
} from "@workspace/vendor-onboarding/portal-types"
import {
  Alert,
  Badge,
  Button,
  Panel,
  PanelContent,
  PanelDescription,
  PanelHeader,
  PanelTitle,
  Textarea,
} from "@sagui/ui"
import {
  approveProfileEdit,
  rejectPendingProfileEdit,
} from "@/app/admin/vendor-submissions/actions"
import { PENDING_SUBMISSIONS_QUERY_KEY } from "@/app/admin/vendor-submissions/use-pending-submissions"
import { ReviewDecision } from "@/components/review-decision"
import { useToast } from "@/components/toast-provider"

const FIELD_LABELS: Record<keyof VendorProfileFields, string> = {
  vendorName: "Company",
  vendorCategory: "Category",
  contactPerson: "Contact",
  email: "Email",
  phone: "Phone",
  address: "Address",
  paymentTerms: "Payment terms",
  minimumOrderQuantity: "Minimum order",
}

const FIELDS = Object.keys(FIELD_LABELS) as Array<keyof VendorProfileFields>

function displayValue(value: string | number | undefined) {
  if (value === undefined || value === "") return "—"
  return String(value)
}

type ProfileEditReviewProps = {
  edit: VendorProfileEdit
  hasConflict: boolean
}

export function ProfileEditReview({
  edit,
  hasConflict,
}: ProfileEditReviewProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const showToast = useToast()
  const [notes, setNotes] = useState("")
  const [isWorking, setIsWorking] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const isPending = edit.status === "pending"

  async function run(
    action: () => Promise<unknown>,
    successMessage: string
  ) {
    setIsWorking(true)
    setActionError(null)
    try {
      await action()
      await queryClient.invalidateQueries({
        queryKey: PENDING_SUBMISSIONS_QUERY_KEY,
      })
      showToast({ title: successMessage })
      router.push("/admin/vendor-submissions")
      router.refresh()
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Action failed")
    } finally {
      setIsWorking(false)
    }
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[2fr_1fr]">
      <Panel as="section" className="min-w-0">
        <PanelHeader
          action={
            <Badge tone={edit.status === "approved" ? "success" : "neutral"}>
              {edit.status}
            </Badge>
          }
        >
          <PanelTitle as="h2">Current vs proposed</PanelTitle>
          <PanelDescription>
            Submitted {new Date(edit.createdAt).toLocaleString()} by{" "}
            {edit.submittedBy}
          </PanelDescription>
        </PanelHeader>
        <PanelContent className="space-y-4">
          {hasConflict && isPending ? (
            <Alert
              tone="danger"
              title="The vendor master changed after this edit was submitted."
            >
              Approving is blocked until you review the latest profile.
            </Alert>
          ) : null}
          {/* Field order carries meaning here, so this stays a plain table rather than a sortable one. */}
          <div className="overflow-x-auto rounded-control border border-border-default">
            <table className="w-full border-collapse text-left text-sm">
              <caption className="sr-only">Current and proposed profile values</caption>
              <thead>
                <tr className="border-b border-border-default text-fg-muted">
                  <th scope="col" className="px-4 py-3 font-medium">Field</th>
                  <th scope="col" className="px-4 py-3 font-medium">Current</th>
                  <th scope="col" className="px-4 py-3 font-medium">Proposed</th>
                </tr>
              </thead>
              <tbody>
                {FIELDS.map((field) => {
                  const current = edit.currentSnapshot[field]
                  const proposed = edit.proposedChanges[field] ?? current
                  const changed = String(proposed) !== String(current)
                  return (
                    <tr
                      key={field}
                      className={`border-b border-border-default last:border-b-0 ${changed ? "bg-bg-muted" : ""}`}
                    >
                      <th scope="row" className="px-4 py-3 font-medium">
                        {FIELD_LABELS[field]}
                      </th>
                      <td className="px-4 py-3">{displayValue(current)}</td>
                      <td className={`px-4 py-3 ${changed ? "font-semibold" : ""}`}>
                        {displayValue(proposed)}
                        {changed ? <span className="sr-only"> (changed)</span> : null}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href={`/vendors/${edit.vendorId}`}>Open vendor {edit.vendorId}</Link>
          </Button>
        </PanelContent>
      </Panel>

      <div className="space-y-4">
        {actionError ? <Alert tone="danger" title={actionError} /> : null}
        <Panel as="section">
          <PanelHeader>
            <PanelTitle as="h2">Review note</PanelTitle>
            <PanelDescription>
              Optional. Shown if you reject or want a record of the decision.
            </PanelDescription>
          </PanelHeader>
          <PanelContent>
            <Textarea
              label="Note"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              disabled={!isPending}
            />
          </PanelContent>
        </Panel>
        <ReviewDecision
          description="Approved changes update the vendor master immediately."
          question={`Apply this profile edit for ${edit.vendorId}?`}
          actions={[
            {
              label: "Approve",
              onClick: () =>
                void run(
                  () => approveProfileEdit(edit.id, notes || undefined),
                  "Profile edit approved"
                ),
              disabled: isWorking || !isPending || hasConflict,
            },
            {
              label: "Reject",
              variant: "danger",
              onClick: () =>
                void run(
                  () => rejectPendingProfileEdit(edit.id, notes || undefined),
                  "Profile edit rejected"
                ),
              disabled: isWorking || !isPending,
            },
          ]}
        />
      </div>
    </div>
  )
}
