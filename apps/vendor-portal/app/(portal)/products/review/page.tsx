import Link from "next/link"

import {
  getAnnotatedPacket,
  getPortalAccountById,
  listCategoriesByIds,
} from "@workspace/vendor-onboarding"

import { ReviewPacket } from "@/app/(portal)/products/review/review-packet"
import { requireVendorSession } from "@/lib/auth/session"
import { Button } from "@workspace/ui/components/button"

export default async function ReviewPacketPage() {
  const session = await requireVendorSession()
  const account = await getPortalAccountById(session.accountId)
  const allowedCategoryIds = account?.allowedCategoryIds ?? []
  const [packet, categories] = await Promise.all([
    getAnnotatedPacket(session.vendorId, allowedCategoryIds),
    listCategoriesByIds(allowedCategoryIds),
  ])

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Review packet</h2>
          <p className="mt-1 text-muted-foreground">
            Send once when the list is complete. MDM approves or returns the
            whole packet.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/products">Live catalog</Link>
        </Button>
      </div>
      {packet ? (
        <ReviewPacket packet={packet} categories={categories} />
      ) : (
        <p className="text-sm text-muted-foreground">
          No draft yet.{" "}
          <Link href="/products/add" className="underline">
            Add products
          </Link>{" "}
          first.
        </p>
      )}
    </div>
  )
}
