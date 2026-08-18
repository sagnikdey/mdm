"use client"

import { useState } from "react"
import { toast } from "sonner"

import { createVendorInvitation } from "@/app/admin/vendors/invite/actions"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"

export function InviteVendorForm() {
  const [email, setEmail] = useState("")
  const [company, setCompany] = useState("")
  const [inviteUrl, setInviteUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setIsSubmitting(true)
    try {
      const result = await createVendorInvitation({ email, company: company || undefined })
      setInviteUrl(result.inviteUrl)
      toast.success("Invitation created")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create invitation")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite a vendor</CardTitle>
        <CardDescription>
          Creates a single-use, 14-day invite link for the onboarding portal.
        </CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent>
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
              <div className="rounded-lg border bg-muted/40 p-3 text-xs break-all">
                Dev invite link: {inviteUrl}
              </div>
            ) : null}
          </FieldGroup>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Send invitation"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
