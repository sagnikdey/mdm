"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import type { CatalogCategory, ProductSubmission } from "@workspace/vendor-onboarding/portal-types"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import {
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardHeader,
  GlassCardTitle,
} from "@workspace/ui/components/glass-card"

type ReviewPacketProps = {
  packet: ProductSubmission
  categories: CatalogCategory[]
}

export function ReviewPacket({ packet, categories }: ReviewPacketProps) {
  const router = useRouter()
  const [working, setWorking] = useState<number | "send" | null>(null)
  const locked = packet.status === "pending"
  const blocking = packet.items.some((item) => item.errors.length)
  const canSend =
    !locked && packet.items.length > 0 && packet.items.length <= 120 && !blocking

  function categoryName(id: string | null) {
    if (!id) return "—"
    return (
      categories.find((category) => category.categoryId === id)?.categoryName ??
      id
    )
  }

  async function remove(id: number) {
    setWorking(id)
    try {
      const response = await fetch(`/api/submissions/products/items/${id}`, {
        method: "DELETE",
      })
      const payload = (await response.json()) as { error?: string }
      if (!response.ok) throw new Error(payload.error ?? "Could not remove")
      toast.success("Row removed")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not remove")
    } finally {
      setWorking(null)
    }
  }

  async function send() {
    setWorking("send")
    try {
      const response = await fetch("/api/submissions/products/send", {
        method: "POST",
      })
      const payload = (await response.json()) as { error?: string }
      if (!response.ok) throw new Error(payload.error ?? "Could not send")
      toast.success("Sent for MDM review")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send")
    } finally {
      setWorking(null)
    }
  }

  return (
    <GlassCard>
      <GlassCardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <GlassCardTitle>Packet</GlassCardTitle>
          <GlassCardDescription>
            {locked
              ? "Waiting for MDM. You cannot edit until they approve or send it back."
              : `${packet.items.length} product${packet.items.length === 1 ? "" : "s"} in draft.`}
          </GlassCardDescription>
        </div>
        <Badge variant={locked ? "inactive" : "active"}>
          {locked ? "Pending review" : "Draft"}
        </Badge>
      </GlassCardHeader>
      <GlassCardContent className="space-y-4">
        {packet.reviewNote ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm">
            MDM note: {packet.reviewNote}
          </p>
        ) : null}
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Vendor SKU</TableHead>
                <TableHead>Barcode</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Pack</TableHead>
                <TableHead>Wholesale</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {packet.items.length ? (
                packet.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.productName}</TableCell>
                    <TableCell>{item.vendorSku}</TableCell>
                    <TableCell>
                      {item.noBarcode ? "None" : item.barcode || "—"}
                    </TableCell>
                    <TableCell>{categoryName(item.categoryId)}</TableCell>
                    <TableCell>
                      {item.packType} / {item.packSize}
                    </TableCell>
                    <TableCell>${item.wholesalePrice.toFixed(2)}</TableCell>
                    <TableCell>
                      {item.errors.length ? (
                        <span className="text-destructive">{item.errors[0]}</span>
                      ) : (
                        <span className="text-muted-foreground">Ready</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {locked ? null : (
                        <div className="flex justify-end gap-2">
                          <Button asChild size="sm" variant="ghost">
                            <Link href={`/products/add?itemId=${item.id}`}>
                              Edit
                            </Link>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={working === item.id}
                            onClick={() => void remove(item.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No products yet. Add from the Bulk, Barcode, or Manual tabs.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex flex-wrap justify-end gap-3">
          <Button asChild variant="outline">
            <Link href="/products/add">Add more</Link>
          </Button>
          <Button disabled={!canSend || working === "send"} onClick={() => void send()}>
            {working === "send" ? "Sending..." : "Send for review"}
          </Button>
        </div>
      </GlassCardContent>
    </GlassCard>
  )
}
