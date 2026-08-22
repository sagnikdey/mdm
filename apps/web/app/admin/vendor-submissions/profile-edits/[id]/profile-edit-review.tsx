"use client"

import Link from "next/link"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import type {
  VendorProfileEdit,
  VendorProfileFields,
} from "@workspace/vendor-onboarding"
import { ApprovalCard } from "@workspace/ui/components/approval-card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Field, FieldContent, FieldLabel } from "@workspace/ui/components/field"
import {
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardHeader,
  GlassCardTitle,
} from "@workspace/ui/components/glass-card"
import { Textarea } from "@workspace/ui/components/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import {
  approveProfileEdit,
  rejectPendingProfileEdit,
} from "@/app/admin/vendor-submissions/actions"
import { PENDING_SUBMISSIONS_QUERY_KEY } from "@/app/admin/vendor-submissions/use-pending-submissions"

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
  const [notes, setNotes] = useState("")
  const [isWorking, setIsWorking] = useState(false)
  const isPending = edit.status === "pending"

  async function run(
    action: () => Promise<unknown>,
    successMessage: string
  ) {
    setIsWorking(true)
    try {
      await action()
      await queryClient.invalidateQueries({
        queryKey: PENDING_SUBMISSIONS_QUERY_KEY,
      })
      toast.success(successMessage)
      router.push("/admin/vendor-submissions")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action failed")
    } finally {
      setIsWorking(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="space-y-6">
        <GlassCard>
          <GlassCardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <GlassCardTitle>Current vs proposed</GlassCardTitle>
                <GlassCardDescription>
                  Submitted {new Date(edit.createdAt).toLocaleString()} by{" "}
                  {edit.submittedBy}
                </GlassCardDescription>
              </div>
              <Badge variant={edit.status === "approved" ? "active" : "inactive"}>
                {edit.status}
              </Badge>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            {hasConflict && isPending ? (
              <p className="mb-4 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                The vendor master changed after this edit was submitted.
                Approving is blocked until you review the latest profile.
              </p>
            ) : null}
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Field</TableHead>
                    <TableHead>Current</TableHead>
                    <TableHead>Proposed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {FIELDS.map((field) => {
                    const current = edit.currentSnapshot[field]
                    const proposed = edit.proposedChanges[field] ?? current
                    const changed = String(proposed) !== String(current)
                    return (
                      <TableRow
                        key={field}
                        className={changed ? "bg-primary/5" : undefined}
                      >
                        <TableCell className="font-medium">
                          {FIELD_LABELS[field]}
                        </TableCell>
                        <TableCell>{displayValue(current)}</TableCell>
                        <TableCell className={changed ? "font-medium" : undefined}>
                          {displayValue(proposed)}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link href={`/vendors/${edit.vendorId}`}>Open vendor {edit.vendorId}</Link>
            </Button>
          </GlassCardContent>
        </GlassCard>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Review note</CardTitle>
            <CardDescription>
              Optional. Shown if you reject or want a record of the decision.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Field>
              <FieldLabel htmlFor="review-note">Note</FieldLabel>
              <FieldContent>
                <Textarea
                  id="review-note"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  disabled={!isPending}
                />
              </FieldContent>
            </Field>
          </CardContent>
        </Card>
        <ApprovalCard
          title="Review decision"
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
              variant: "destructive",
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
