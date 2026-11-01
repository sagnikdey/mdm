"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import type { VendorProfileFields } from "@workspace/vendor-onboarding/portal-types"
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
  Textarea,
} from "@sagui/ui"

import { useToast } from "@/components/toast-provider"

export function ProfileEditForm({ profile }: { profile: VendorProfileFields }) {
  const router = useRouter()
  const showToast = useToast()
  const [values, setValues] = useState(profile)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  function set<K extends keyof VendorProfileFields>(
    key: K,
    value: VendorProfileFields[K]
  ) {
    setValues((current) => ({ ...current, [key]: value }))
  }

  async function onSubmit(event: React.FormEvent<HTMLElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const response = await fetch("/api/submissions/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      const payload = (await response.json()) as { error?: string }
      if (!response.ok) throw new Error(payload.error ?? "Submit failed")
      showToast({ title: "Profile edit submitted for review" })
      router.push("/settings")
      router.refresh()
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Submit failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl p-6">
      <Panel as="form" onSubmit={onSubmit}>
        <PanelHeader>
          <PanelTitle as="h2" className="type-h1">Edit profile</PanelTitle>
          <PanelDescription>
            MDM staff will review these changes before they go live.
          </PanelDescription>
        </PanelHeader>
        <PanelContent className="grid gap-5">
          {submitError ? <Alert tone="danger" title={submitError} /> : null}
          <Input
            label="Company name"
            value={values.vendorName}
            onChange={(event) => set("vendorName", event.target.value)}
          />
          <Input
            label="Contact person"
            value={values.contactPerson}
            onChange={(event) => set("contactPerson", event.target.value)}
          />
          <div className="grid items-start gap-4 sm:grid-cols-2">
            <Input
              label="Email"
              type="email"
              value={values.email}
              onChange={(event) => set("email", event.target.value)}
            />
            <Input
              label="Phone"
              value={values.phone}
              onChange={(event) => set("phone", event.target.value)}
            />
          </div>
          <Textarea
            label="Address"
            value={values.address}
            onChange={(event) => set("address", event.target.value)}
          />
          <div className="grid items-start gap-4 sm:grid-cols-2">
            <Input
              label="Payment terms"
              value={values.paymentTerms}
              onChange={(event) => set("paymentTerms", event.target.value)}
            />
            <Input
              label="Minimum order"
              type="number"
              min={1}
              value={values.minimumOrderQuantity}
              onChange={(event) =>
                set("minimumOrderQuantity", Number(event.target.value) || 1)
              }
            />
          </div>
        </PanelContent>
        <PanelFooter>
          <Button asChild variant="outline">
            <Link href="/settings">Cancel</Link>
          </Button>
          <Button type="submit" loading={isSubmitting}>
            Submit for review
          </Button>
        </PanelFooter>
      </Panel>
    </div>
  )
}
