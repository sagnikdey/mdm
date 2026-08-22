"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import type { VendorProfileFields } from "@workspace/vendor-onboarding"
import { Field, FieldContent, FieldLabel } from "@workspace/ui/components/field"
import { FormLayout } from "@workspace/ui/components/form-layout"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"

export function ProfileEditForm({ profile }: { profile: VendorProfileFields }) {
  const router = useRouter()
  const [values, setValues] = useState(profile)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function set<K extends keyof VendorProfileFields>(
    key: K,
    value: VendorProfileFields[K]
  ) {
    setValues((current) => ({ ...current, [key]: value }))
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/submissions/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      const payload = (await response.json()) as { error?: string }
      if (!response.ok) throw new Error(payload.error ?? "Submit failed")
      toast.success("Profile edit submitted for review")
      router.push("/settings")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Submit failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <FormLayout
      title="Edit profile"
      description="MDM staff will review these changes before they go live."
      cancelHref="/settings"
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      submitLabel="Submit for review"
      submittingLabel="Submitting..."
    >
      <Field>
        <FieldLabel htmlFor="vendorName">Company name</FieldLabel>
        <FieldContent>
          <Input
            id="vendorName"
            value={values.vendorName}
            onChange={(event) => set("vendorName", event.target.value)}
          />
        </FieldContent>
      </Field>
      <Field>
        <FieldLabel htmlFor="contactPerson">Contact person</FieldLabel>
        <FieldContent>
          <Input
            id="contactPerson"
            value={values.contactPerson}
            onChange={(event) => set("contactPerson", event.target.value)}
          />
        </FieldContent>
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <FieldContent>
            <Input
              id="email"
              type="email"
              value={values.email}
              onChange={(event) => set("email", event.target.value)}
            />
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel htmlFor="phone">Phone</FieldLabel>
          <FieldContent>
            <Input
              id="phone"
              value={values.phone}
              onChange={(event) => set("phone", event.target.value)}
            />
          </FieldContent>
        </Field>
      </div>
      <Field>
        <FieldLabel htmlFor="address">Address</FieldLabel>
        <FieldContent>
          <Textarea
            id="address"
            value={values.address}
            onChange={(event) => set("address", event.target.value)}
          />
        </FieldContent>
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="paymentTerms">Payment terms</FieldLabel>
          <FieldContent>
            <Input
              id="paymentTerms"
              value={values.paymentTerms}
              onChange={(event) => set("paymentTerms", event.target.value)}
            />
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel htmlFor="minimumOrderQuantity">Minimum order</FieldLabel>
          <FieldContent>
            <Input
              id="minimumOrderQuantity"
              type="number"
              min={1}
              value={values.minimumOrderQuantity}
              onChange={(event) =>
                set("minimumOrderQuantity", Number(event.target.value) || 1)
              }
            />
          </FieldContent>
        </Field>
      </div>
    </FormLayout>
  )
}
