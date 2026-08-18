import Link from "next/link"
import { notFound } from "next/navigation"

import { ApplicationReviewPanel } from "@/app/admin/applications/[id]/application-review-panel"
import { fetchApplication } from "@/app/admin/vendors/invite/actions"
import { Button } from "@workspace/ui/components/button"

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function ApplicationDetailPage({ params }: PageProps) {
  const { id } = await params

  let application
  try {
    application = await fetchApplication(id)
  } catch {
    notFound()
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Application review</h2>
          <p className="mt-1 text-muted-foreground">
            Evaluate onboarding submission and promote to vendor master
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/applications">Back to queue</Link>
        </Button>
      </div>

      <ApplicationReviewPanel application={application} />
    </div>
  )
}
