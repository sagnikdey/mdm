import { redirect } from "next/navigation"

import { getVendorSession } from "@/lib/session"
import { getOnboardingApplication } from "@/app/onboarding/actions"
import { OnboardingWizard } from "@/components/onboarding-wizard"

export default async function OnboardingPage() {
  const session = await getVendorSession()
  if (!session) redirect("/expired?reason=no_session")

  const application = await getOnboardingApplication()

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl p-6">
      <div className="mb-6">
        <p className="m-0 text-xs uppercase tracking-wide text-fg-muted">
          Vendor onboarding
        </p>
        <h1 className="m-0 text-3xl font-bold text-fg-default">Welcome</h1>
        <p className="m-0 mt-1 text-fg-muted">
          Complete all steps to submit your application as{" "}
          <span className="font-medium text-fg-default">{session.email}</span>
        </p>
      </div>
      <OnboardingWizard application={application} />
    </main>
  )
}
