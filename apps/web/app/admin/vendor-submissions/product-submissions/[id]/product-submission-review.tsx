"use client"

import { useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import type {
  CatalogCategory,
  ProductSubmission,
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
  approveProductSubmission,
  rejectPendingProductSubmission,
} from "@/app/admin/vendor-submissions/actions"
import { PENDING_SUBMISSIONS_QUERY_KEY } from "@/app/admin/vendor-submissions/use-pending-submissions"
import { ReviewDecision } from "@/components/review-decision"
import { RecordTable } from "@/components/tables/record-table"
import { useToast } from "@/components/toast-provider"

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
  const showToast = useToast()
  const [notes, setNotes] = useState("")
  const [isWorking, setIsWorking] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
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
            <Badge tone={submission.status === "approved" ? "success" : "neutral"}>
              {submission.status}
            </Badge>
          }
        >
          <PanelTitle as="h2">Proposed products</PanelTitle>
          <PanelDescription>
            Submitted {new Date(submission.createdAt).toLocaleString()} by{" "}
            {submission.submittedBy}
          </PanelDescription>
        </PanelHeader>
        <PanelContent>
          <RecordTable
            caption="Proposed products"
            itemName={{ one: "product", other: "products" }}
            emptyMessage="No products in this packet."
            rows={submission.items.map((item) => ({
              id: String(item.id),
              product: item.productName,
              details: `${item.brand || "No brand"} · SKU ${item.vendorSku} · Barcode ${
                item.noBarcode ? "None" : item.barcode || "—"
              }`,
              category: categoryName(item.categoryId),
              pack: `${item.packType} / ${item.packSize}${
                item.baseUnitVendorSku ? ` → ${item.baseUnitVendorSku}` : ""
              }`,
              wholesale: `$${item.wholesalePrice.toFixed(2)}`,
              mdmSku: item.createdSku ?? "Assigned on approve",
            }))}
            columns={[
              { key: "product", label: "Product", secondaryKey: "details" },
              { key: "category", label: "Category", width: "16%" },
              { key: "pack", label: "Pack", width: "16%" },
              { key: "wholesale", label: "Wholesale", width: "14%" },
              { key: "mdmSku", label: "MDM SKU", width: "16%" },
            ]}
          />
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link href={`/vendors/${submission.vendorId}`}>
              Open vendor {submission.vendorId}
            </Link>
          </Button>
        </PanelContent>
      </Panel>

      <div className="space-y-4">
        {actionError ? <Alert tone="danger" title={actionError} /> : null}
        <Panel as="section">
          <PanelHeader>
            <PanelTitle as="h2">Review note</PanelTitle>
            <PanelDescription>
              Optional. Included if you reject the batch.
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
              variant: "danger",
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
