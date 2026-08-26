import { redirect } from "next/navigation"

import { Button } from "@workspace/ui/components/button"
import { FormLayout } from "@workspace/ui/components/form-layout"

type PageProps = {
  searchParams: Promise<{ token?: string }>
}

export default async function ContinueLoginPage({ searchParams }: PageProps) {
  const { token } = await searchParams
  if (!token?.trim()) redirect("/login?error=invalid")

  return (
    <main className="flex min-h-screen items-center">
      <FormLayout
        title="Vendor portal"
        description="Confirm this login on this device. Email apps sometimes open the link before you do, which would otherwise use it up."
        footer={
          <form
            action="/auth/verify"
            method="post"
            className="flex justify-end border-t px-(--card-spacing) py-4"
          >
            <input type="hidden" name="token" value={token} />
            <Button type="submit" size="lg">
              Continue
            </Button>
          </form>
        }
      >
        <p className="text-sm text-muted-foreground">
          You&apos;ll stay signed in on this browser for 7 days.
        </p>
      </FormLayout>
    </main>
  )
}
