import Link from "next/link"

import { ApplicationsQueue } from "@/app/admin/applications/applications-queue"
import {
  fetchApplicationCounts,
  fetchApplications,
} from "@/app/admin/vendors/invite/actions"
import { Button } from "@workspace/ui/components/button"

export default async function ApplicationsPage() {
  const [applications, counts] = await Promise.all([
    fetchApplications(),
    fetchApplicationCounts(),
  ])

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Vendor applications</h2>
          <p className="mt-1 text-muted-foreground">
            Review onboarding submissions and promote approved vendors into MDM
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/vendors/invite">Send invitation</Link>
        </Button>
      </div>

      <ApplicationsQueue applications={applications} counts={counts} />
    </div>
  )
}
