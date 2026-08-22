import Link from "next/link"
import { notFound } from "next/navigation"

import { fetchProductSubmissionReview } from "@/app/admin/vendor-submissions/actions"
import { ProductSubmissionReview } from "@/app/admin/vendor-submissions/product-submissions/[id]/product-submission-review"
import { Button } from "@workspace/ui/components/button"

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function ProductSubmissionReviewPage({
  params,
}: PageProps) {
  const { id } = await params

  let review
  try {
    review = await fetchProductSubmissionReview(id)
  } catch {
    notFound()
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Product submission</h2>
          <p className="mt-1 text-muted-foreground">
            Approve to assign MDM SKUs and add products to the catalog
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/vendor-submissions">Back to inbox</Link>
        </Button>
      </div>
      <ProductSubmissionReview
        submission={review.submission}
        categories={review.categories}
      />
    </div>
  )
}
