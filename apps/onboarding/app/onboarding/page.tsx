import { redirect } from "next/navigation"

import { getVendorSession } from "@/lib/session"
import { getOnboardingApplication } from "@/app/onboarding/actions"
import { OnboardingWizard } from "@/components/onboarding-wizard"

export default async function OnboardingPage() {
  const session = await getVendorSession()
  if (!session) redirect("/expired?reason=no_session")

  const application = await getOnboardingApplication()

  return (
    <main className="mx-auto min-h-screen max-w-6xl p-6">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Vendor onboarding
        </p>
        <h1 className="text-3xl font-bold">Welcome</h1>
        <p className="mt-1 text-muted-foreground">
          Complete all steps to submit your application as{" "}
          <span className="font-medium text-foreground">{session.email}</span>
        </p>
      </div>
      <OnboardingWizard application={application} />
    </main>
  )
}
