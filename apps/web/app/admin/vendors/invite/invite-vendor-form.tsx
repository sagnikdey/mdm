"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { createVendorInvitation } from "@/app/admin/vendors/invite/actions"
import { Button } from "@workspace/ui/components/button"
import { FormLayout } from "@workspace/ui/components/form-layout"
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"

export function InviteVendorForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [company, setCompany] = useState("")
  const [inviteUrl, setInviteUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function copyInviteUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url)
      toast.success("Onboarding link copied")
    } catch {
      toast.error("Could not copy link")
    }
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setIsSubmitting(true)
    try {
      const result = await createVendorInvitation({
        email,
        company: company || undefined,
      })
      setInviteUrl(result.inviteUrl)
      toast.success("Invitation sent", {
        description: `Sent to ${email}. Use the onboarding link to start the vendor portal.`,
        duration: 8000,
        action: {
          label: "Copy link",
          onClick: () => {
            void copyInviteUrl(result.inviteUrl)
          },
        },
      })
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send invitation")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <FormLayout
      title="Invite a vendor"
      description="Creates a single-use, 14-day invite link for the onboarding portal."
      cancelHref="/admin/applications"
      isSubmitting={isSubmitting}
      submitLabel="Send invitation"
      submittingLabel="Creating..."
      onSubmit={onSubmit}
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">Vendor email</FieldLabel>
          <FieldContent>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel htmlFor="company">Company name (optional)</FieldLabel>
          <FieldContent>
            <Input
              id="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </FieldContent>
        </Field>
        {inviteUrl ? (
          <div className="space-y-2 rounded-lg border bg-muted/40 p-3">
            <p className="text-sm font-medium">Vendor onboarding link</p>
            <p className="text-xs break-all text-muted-foreground">{inviteUrl}</p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void copyInviteUrl(inviteUrl)}
              >
                Copy link
              </Button>
              <Button type="button" size="sm" asChild>
                <a href={inviteUrl} target="_blank" rel="noreferrer">
                  Open onboarding
                </a>
              </Button>
            </div>
          </div>
        ) : null}
      </FieldGroup>
    </FormLayout>
  )
}
