"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import {
  approveVendorApplication,
  markApplicationUnderReview,
  rejectVendorApplication,
  requestVendorApplicationInfo,
} from "@/app/admin/vendors/invite/actions"
import type { VendorApplication } from "@workspace/vendor-onboarding/types"
import { ApprovalCard } from "@workspace/ui/components/approval-card"
import { ContextCard } from "@workspace/ui/components/context-card"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import Link from "next/link"
import { Button } from "@workspace/ui/components/button"

type ApplicationReviewPanelProps = {
  application: VendorApplication
}

export function ApplicationReviewPanel({ application }: ApplicationReviewPanelProps) {
  const router = useRouter()
  const [isWorking, setIsWorking] = useState(false)

  async function run(action: () => Promise<unknown>, successMessage: string) {
    setIsWorking(true)
    try {
      await action()
      toast.success(successMessage)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action failed")
    } finally {
      setIsWorking(false)
    }
  }

  const companyName =
    application.companyData.legalName || application.legalName || application.ownerEmail

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{companyName}</CardTitle>
            <CardDescription>{application.ownerEmail}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Status</span>
              <Badge>{application.status.replace("_", " ")}</Badge>
            </div>
            <p>
              <span className="text-muted-foreground">Contact:</span>{" "}
              {application.contactData.contactPerson} · {application.contactData.phone}
            </p>
            <p>
              <span className="text-muted-foreground">Address:</span>{" "}
              {application.addressData.street}, {application.addressData.city},{" "}
              {application.addressData.state} {application.addressData.zipCode}
            </p>
            <p>
              <span className="text-muted-foreground">Payment terms:</span>{" "}
              {application.paymentData.paymentTerms}
            </p>
            <p>
              <span className="text-muted-foreground">Categories:</span>{" "}
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
          </CardContent>
        </Card>

        <div className="grid gap-3 md:grid-cols-2">
          {application.documentsData.map((doc) => (
            <ContextCard
              key={doc.id}
              title={doc.name}
              source={doc.name}
              sourceType={doc.type.toUpperCase()}
              excerpt="Compliance document submitted during onboarding"
            />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <ApprovalCard
          title="Review decision"
          description="Promote approved vendors into the MDM vendor master."
          question={`Approve ${companyName} as a vendor?`}
          actions={[
            {
              label: "Approve",
              onClick: () =>
                void run(
                  () => approveVendorApplication(application.id),
                  "Vendor approved and promoted"
                ),
              disabled: isWorking || application.status === "approved",
            },
            {
              label: "Needs info",
              variant: "secondary",
              onClick: () =>
                void run(
                  () => requestVendorApplicationInfo(application.id, "Please provide additional documentation."),
                  "Requested more information"
                ),
              disabled: isWorking,
            },
            {
              label: "Reject",
              variant: "destructive",
              onClick: () =>
                void run(
                  () => rejectVendorApplication(application.id, "Application rejected."),
                  "Application rejected"
                ),
              disabled: isWorking || application.status === "rejected",
            },
          ]}
        />

        {application.status === "submitted" ? (
          <Button
            className="w-full"
            variant="outline"
            size="lg"
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
