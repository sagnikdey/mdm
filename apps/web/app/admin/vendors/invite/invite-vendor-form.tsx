"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { Input } from "@sagui/ui"

import { createVendorInvitation } from "@/app/admin/vendors/invite/actions"
import { CopyLinkBox } from "@/components/copy-link-box"
import { EntityFormLayout } from "@/components/entities/entity-form-layout"
import { useToast } from "@/components/toast-provider"

export function InviteVendorForm() {
  const router = useRouter()
  const showToast = useToast()
  const [email, setEmail] = useState("")
  const [company, setCompany] = useState("")
  const [inviteUrl, setInviteUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  async function onSubmit(event: React.FormEvent<HTMLElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setSendError(null)
    try {
      const result = await createVendorInvitation({
        email,
        company: company || undefined,
      })
      setInviteUrl(result.inviteUrl)
      showToast({
        title: "Invitation sent",
        description: `Sent to ${email}. Use the onboarding link to start the vendor portal.`,
      })
      router.refresh()
    } catch (error) {
      setSendError(error instanceof Error ? error.message : "Failed to send invitation")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <EntityFormLayout
      title="Invite a vendor"
      description="Creates a single-use, 14-day invite link for the onboarding portal."
      cancelHref="/admin/applications"
      isSubmitting={isSubmitting}
      submitLabel="Send invitation"
      error={sendError}
      onSubmit={onSubmit}
    >
      <Input
        label="Vendor email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        label="Company name (optional)"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
      />
      {inviteUrl ? (
        <CopyLinkBox
          title="Vendor onboarding link"
          url={inviteUrl}
          copiedMessage="Onboarding link copied"
          openLabel="Open onboarding"
        />
      ) : null}
    </EntityFormLayout>
  )
}
