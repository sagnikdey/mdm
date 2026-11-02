"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import {
  Alert,
  Button,
  Input,
  Panel,
  PanelContent,
  PanelDescription,
  PanelFooter,
  PanelHeader,
  PanelTitle,
} from "@sagui/ui"

const LOGIN_ERRORS: Record<string, string> = {
  invalid:
    "That login link is invalid. Ask MDM to grant portal access again, or request a new link below.",
  expired: "That login link has expired. Request a new one below.",
  suspended: "This portal account is suspended. Contact your buyer.",
  config:
    "Vendor portal is missing DATABASE_URL or VENDOR_PORTAL_SESSION_SECRET on its Vercel project. Those must match MDM's production database.",
  unavailable:
    "Could not reach the login database. Check that the vendor-portal Vercel project uses the same DATABASE_URL as MDM.",
  rate_limited:
    "Too many login attempts. Wait a few minutes and request a new link.",
}

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const error = LOGIN_ERRORS[searchParams.get("error") ?? ""]

  async function onSubmit(event: React.FormEvent<HTMLElement>) {
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
    <main className="max-w-lg p-6 mx-auto flex min-h-screen items-center">
      <Panel
        as="form"
        elevation="resting"
        className="w-full overflow-hidden"
        onSubmit={onSubmit}
      >
        <PanelHeader className="p-6 md:p-10">
          <p className="mb-4 tracking-widest text-xs font-semibold text-accent-default uppercase">
            Vendor login
          </p>
          <PanelTitle as="h2" className="text-3xl font-semibold">
            Vendor portal
          </PanelTitle>
          <PanelDescription className="mt-1.5">
            Enter the email on your approved vendor account. We&apos;ll send a
            one-time login link.
          </PanelDescription>
        </PanelHeader>
        <PanelContent className="mx-6 gap-6 px-0 pt-7 pb-8 md:mx-10 grid border-t border-border-default">
          {error ? <Alert tone="danger" title={error} /> : null}
          <Input
            label="Email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </PanelContent>
        <PanelFooter className="px-6 py-7 md:px-10 bg-bg-canvas">
          <Button type="submit" loading={isSubmitting}>
            Send login link
          </Button>
        </PanelFooter>
      </Panel>
    </main>
  )
}
