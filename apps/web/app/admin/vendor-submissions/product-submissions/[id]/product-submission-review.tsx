"use client"

import { useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import type {
  CatalogCategory,
  ProductSubmission,
} from "@workspace/vendor-onboarding/portal-types"
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
  approveProductSubmission,
  rejectPendingProductSubmission,
} from "@/app/admin/vendor-submissions/actions"
import { PENDING_SUBMISSIONS_QUERY_KEY } from "@/app/admin/vendor-submissions/use-pending-submissions"

type ProductSubmissionReviewProps = {
  submission: ProductSubmission
  categories: CatalogCategory[]
}

export function ProductSubmissionReview({
  submission,
  categories,
}: ProductSubmissionReviewProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [notes, setNotes] = useState("")
  const [isWorking, setIsWorking] = useState(false)
  const isPending = submission.status === "pending"

  function categoryName(id: string | null) {
    if (!id) return "—"
    return (
      categories.find((category) => category.categoryId === id)?.categoryName ??
      id
    )
  }

  async function run(action: () => Promise<unknown>, successMessage: string) {
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
      <GlassCard>
        <GlassCardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <GlassCardTitle>Proposed products</GlassCardTitle>
              <GlassCardDescription>
                Submitted {new Date(submission.createdAt).toLocaleString()} by{" "}
                {submission.submittedBy}
              </GlassCardDescription>
            </div>
            <Badge
              variant={submission.status === "approved" ? "active" : "inactive"}
            >
              {submission.status}
            </Badge>
          </div>
        </GlassCardHeader>
        <GlassCardContent>
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Vendor SKU</TableHead>
                  <TableHead>Barcode</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Pack</TableHead>
                  <TableHead>Wholesale</TableHead>
                  <TableHead>MDM SKU</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submission.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.productName}
                    </TableCell>
                    <TableCell>{item.brand || "—"}</TableCell>
                    <TableCell>{item.vendorSku}</TableCell>
                    <TableCell>
                      {item.noBarcode ? "None" : item.barcode || "—"}
                    </TableCell>
                    <TableCell>{categoryName(item.categoryId)}</TableCell>
                    <TableCell>
                      {item.packType} / {item.packSize}
                      {item.baseUnitVendorSku
                        ? ` → ${item.baseUnitVendorSku}`
                        : ""}
                    </TableCell>
                    <TableCell>${item.wholesalePrice.toFixed(2)}</TableCell>
                    <TableCell>{item.createdSku ?? "Assigned on approve"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link href={`/vendors/${submission.vendorId}`}>
              Open vendor {submission.vendorId}
            </Link>
          </Button>
        </GlassCardContent>
      </GlassCard>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Review note</CardTitle>
            <CardDescription>
              Optional. Included if you reject the batch.
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
          description="Approved items are inserted into the product master with a new PRD SKU."
          question={`Approve this packet of ${submission.itemCount} product${submission.itemCount === 1 ? "" : "s"} for ${submission.vendorId}?`}
          actions={[
            {
              label: "Approve packet",
              onClick: () =>
                void run(
                  () => approveProductSubmission(submission.id, notes || undefined),
                  "Products added to catalog"
                ),
              disabled: isWorking || !isPending,
            },
            {
              label: "Reject packet",
              variant: "destructive",
              onClick: () =>
                void run(
                  () =>
                    rejectPendingProductSubmission(
                      submission.id,
                      notes || undefined
                    ),
                  "Packet returned to vendor"
                ),
              disabled: isWorking || !isPending,
            },
          ]}
        />
      </div>
    </div>
  )
}
