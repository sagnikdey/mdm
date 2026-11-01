"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import Link from "next/link"

import {
  approveVendorApplication,
  markApplicationUnderReview,
  rejectVendorApplication,
  requestVendorApplicationInfo,
} from "@/app/admin/vendors/invite/actions"
import type { VendorApplication } from "@workspace/vendor-onboarding/types"
import {
  Alert,
  Badge,
  Button,
  Card,
  Panel,
  PanelContent,
  PanelDescription,
  PanelHeader,
  PanelTitle,
} from "@sagui/ui"

import { CopyLinkBox } from "@/components/copy-link-box"
import { ReviewDecision } from "@/components/review-decision"
import { useToast } from "@/components/toast-provider"

type ApplicationReviewPanelProps = {
  application: VendorApplication
}

export function ApplicationReviewPanel({ application }: ApplicationReviewPanelProps) {
  const router = useRouter()
  const showToast = useToast()
  const [isWorking, setIsWorking] = useState(false)
  const [welcomeUrl, setWelcomeUrl] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  async function run(action: () => Promise<unknown>, successMessage: string) {
    setIsWorking(true)
    setActionError(null)
    try {
      const result = await action()
      const welcomeLink =
        result &&
        typeof result === "object" &&
        "welcomeUrl" in result &&
        typeof result.welcomeUrl === "string"
          ? result.welcomeUrl
          : null
      if (welcomeLink) setWelcomeUrl(welcomeLink)
      showToast({ title: successMessage })
      router.refresh()
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Action failed")
    } finally {
      setIsWorking(false)
    }
  }

  const companyName =
    application.companyData.legalName || application.legalName || application.ownerEmail

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="min-w-0 space-y-6">
        <Panel as="section">
          <PanelHeader>
            <PanelTitle as="h2">{companyName}</PanelTitle>
            <PanelDescription>{application.ownerEmail}</PanelDescription>
          </PanelHeader>
          <PanelContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-fg-muted">Status</span>
              <Badge>{application.status.replace("_", " ")}</Badge>
            </div>
            <p>
              <span className="text-fg-muted">Contact:</span>{" "}
              {application.contactData.contactPerson} · {application.contactData.phone}
            </p>
            <p>
              <span className="text-fg-muted">Address:</span>{" "}
              {application.addressData.street}, {application.addressData.city},{" "}
              {application.addressData.state} {application.addressData.zipCode}
            </p>
            <p>
              <span className="text-fg-muted">Payment terms:</span>{" "}
              {application.paymentData.paymentTerms}
            </p>
            <p>
              <span className="text-fg-muted">Categories:</span>{" "}
              {application.categoriesData.categories.length
                ? application.categoriesData.categories.join(", ")
                : "—"}
            </p>
            {application.promotedVendorId ? (
              <Button asChild variant="outline" size="sm">
                <Link href={`/vendors/${application.promotedVendorId}`}>
                  View promoted vendor {application.promotedVendorId}
                </Link>
              </Button>
            ) : null}
          </PanelContent>
        </Panel>

        <div className="grid gap-3 md:grid-cols-2">
          {application.documentsData.map((doc) => (
            <Card
              key={doc.id}
              title={doc.name}
              description="Compliance document submitted during onboarding"
              meta={doc.type.toUpperCase()}
            />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {actionError ? <Alert tone="danger" title={actionError} /> : null}
        <ReviewDecision
          description="Promote approved vendors into the MDM vendor master."
          question={`Approve ${companyName} as a vendor?`}
          actions={[
            {
              label: "Approve",
              onClick: () =>
                void run(
                  () => approveVendorApplication(application.id),
                  "Vendor approved. Portal welcome link issued."
                ),
              disabled: isWorking || application.status === "approved",
            },
            {
              label: "Needs info",
              variant: "outline",
              onClick: () =>
                void run(
                  () => requestVendorApplicationInfo(application.id, "Please provide additional documentation."),
                  "Requested more information"
                ),
              disabled: isWorking,
            },
            {
              label: "Reject",
              variant: "danger",
              onClick: () =>
                void run(
                  () => rejectVendorApplication(application.id, "Application rejected."),
                  "Application rejected"
                ),
              disabled: isWorking || application.status === "rejected",
            },
          ]}
        />

        {welcomeUrl ? (
          <Panel as="section">
            <PanelHeader>
              <PanelTitle as="h2">Vendor portal login</PanelTitle>
              <PanelDescription>
                Email is logged in this environment. Copy the 14-day welcome
                link for the vendor.
              </PanelDescription>
            </PanelHeader>
            <PanelContent>
              <CopyLinkBox
                title="Welcome link"
                url={welcomeUrl}
                copiedMessage="Portal login link copied"
                openLabel="Open portal"
              />
            </PanelContent>
          </Panel>
        ) : null}

        {application.status === "submitted" ? (
          <Button
            className="w-full"
            variant="outline"
            disabled={isWorking}
            onClick={() =>
              void run(
                () => markApplicationUnderReview(application.id),
                "Marked under review"
              )
            }
          >
            Mark under review
          </Button>
        ) : null}
      </div>
    </div>
  )
}
