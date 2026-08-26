"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { Button } from "@workspace/ui/components/button"
import { Field, FieldContent, FieldLabel } from "@workspace/ui/components/field"
import { FormLayout } from "@workspace/ui/components/form-layout"
import { Input } from "@workspace/ui/components/input"

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const error = searchParams.get("error")

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    try {
      await fetch("/api/auth/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      router.push("/auth/sent")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center">
      <FormLayout
        title="Vendor portal"
        description="Enter the email on your approved vendor account. We'll send a one-time login link."
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        submitLabel="Send login link"
        submittingLabel="Sending..."
        footer={
          <div className="flex justify-end border-t px-(--card-spacing) py-4">
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send login link"}
            </Button>
          </div>
        }
      >
        {error === "invalid" ? (
          <p className="text-sm text-destructive">
            That login link is invalid. Ask MDM to grant portal access again,
            or request a new link below.
          </p>
        ) : null}
        {error === "expired" ? (
          <p className="text-sm text-destructive">
            That login link has expired. Request a new one below.
          </p>
        ) : null}
        {error === "suspended" ? (
          <p className="text-sm text-destructive">
            This portal account is suspended. Contact your buyer.
          </p>
        ) : null}
        {error === "config" ? (
          <p className="text-sm text-destructive">
            Vendor portal is missing DATABASE_URL or VENDOR_PORTAL_SESSION_SECRET
            on its Vercel project. Those must match MDM&apos;s production
            database.
          </p>
        ) : null}
        {error === "unavailable" ? (
          <p className="text-sm text-destructive">
            Could not reach the login database. Check that the vendor-portal
            Vercel project uses the same DATABASE_URL as MDM.
          </p>
        ) : null}
        {error === "rate_limited" ? (
          <p className="text-sm text-destructive">
            Too many login attempts. Wait a few minutes and request a new link.
          </p>
        ) : null}
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <FieldContent>
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </FieldContent>
        </Field>
      </FormLayout>
    </main>
  )
}
