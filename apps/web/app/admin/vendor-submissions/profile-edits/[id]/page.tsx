import Link from "next/link"
import { notFound } from "next/navigation"

import { fetchProfileEditReview } from "@/app/admin/vendor-submissions/actions"
import { ProfileEditReview } from "@/app/admin/vendor-submissions/profile-edits/[id]/profile-edit-review"
import { Button } from "@sagui/ui"

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function ProfileEditReviewPage({ params }: PageProps) {
  const { id } = await params

  let review
  try {
    review = await fetchProfileEditReview(id)
  } catch {
    notFound()
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Profile edit review</h1>
          <p className="mt-1 text-fg-muted">
            Compare the live vendor record with the proposed changes
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/vendor-submissions">Back to inbox</Link>
        </Button>
      </div>
      <ProfileEditReview
        edit={review.edit}
        hasConflict={review.hasConflict}
      />
    </div>
  )
}
