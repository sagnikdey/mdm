"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { CircleAlertIcon } from "lucide-react"

import type { CatalogCategory, ProductSubmission } from "@workspace/vendor-onboarding/portal-types"
import {
  Alert,
  Badge,
  Button,
  Panel,
  PanelContent,
  PanelDescription,
  PanelHeader,
  PanelTitle,
  SortableDataTable,
} from "@sagui/ui"

import { useToast } from "@/components/toast-provider"

type ReviewPacketProps = {
  packet: ProductSubmission
  categories: CatalogCategory[]
}

export function ReviewPacket({ packet, categories }: ReviewPacketProps) {
  const router = useRouter()
  const showToast = useToast()
  const [working, setWorking] = useState<number | "send" | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
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
    setActionError(null)
    try {
      const response = await fetch(`/api/submissions/products/items/${id}`, {
        method: "DELETE",
      })
      const payload = (await response.json()) as { error?: string }
      if (!response.ok) throw new Error(payload.error ?? "Could not remove")
      showToast({ title: "Row removed" })
      router.refresh()
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Could not remove")
    } finally {
      setWorking(null)
    }
  }

  async function send() {
    setWorking("send")
    setActionError(null)
    try {
      const response = await fetch("/api/submissions/products/send", {
        method: "POST",
      })
      const payload = (await response.json()) as { error?: string }
      if (!response.ok) throw new Error(payload.error ?? "Could not send")
      showToast({ title: "Sent for MDM review" })
      router.refresh()
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Could not send")
    } finally {
      setWorking(null)
    }
  }

  const rows = packet.items.map((item) => ({
    id: item.id,
    productName: item.productName,
    vendorSku: item.vendorSku,
    barcode: item.noBarcode ? "None" : item.barcode || "—",
    category: categoryName(item.categoryId),
    pack: `${item.packType} / ${item.packSize}`,
    wholesalePrice: item.wholesalePrice,
    status: item.errors[0] ?? "Ready",
    hasError: item.errors.length > 0,
  }))

  return (
    <Panel as="section">
      <PanelHeader
        action={
          <Badge tone={locked ? "warning" : "info"}>
            {locked ? "Pending review" : "Draft"}
          </Badge>
        }
      >
        <PanelTitle as="h2">Packet</PanelTitle>
        <PanelDescription>
          {locked
            ? "Waiting for MDM. You cannot edit until they approve or send it back."
            : `${packet.items.length} product${packet.items.length === 1 ? "" : "s"} in draft.`}
        </PanelDescription>
      </PanelHeader>
      <PanelContent className="space-y-4">
        {actionError ? <Alert tone="danger" title={actionError} /> : null}
        {packet.reviewNote ? (
          <Alert tone="warning" title="MDM note">
            {packet.reviewNote}
          </Alert>
        ) : null}
        <SortableDataTable
          caption="Products in this packet"
          rows={rows}
          rowKey={(row) => String(row.id)}
          itemName={{ one: "product", other: "products" }}
          emptyMessage="No products yet. Add from the Bulk, Barcode, or Manual tabs."
          columns={[
            {
              key: "productName",
              label: "Product",
              render: (value, row) => (
                <span className="block py-2">
                  <span className="block font-medium">{String(value)}</span>
                  <span className="block text-xs text-fg-muted">
                    {`SKU ${row.vendorSku} · Barcode ${row.barcode}`}
                  </span>
                </span>
              ),
            },
            { key: "category", label: "Category", width: "14%" },
            { key: "pack", label: "Pack", width: "12%" },
            {
              key: "wholesalePrice",
              label: "Wholesale",
              width: "12%",
              numeric: true,
              render: (value) => `$${Number(value).toFixed(2)}`,
            },
            {
              key: "status",
              label: "Status",
              width: "18%",
              render: (value, row) =>
                row.hasError ? (
                  <span className="flex items-start gap-1 py-2 text-danger-default">
                    <CircleAlertIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
                    {String(value)}
                  </span>
                ) : (
                  <span className="text-fg-muted">{String(value)}</span>
                ),
            },
            {
              key: "actions",
              label: "Actions",
              width: "22%",
              sortable: false,
              searchable: false,
              render: (_value, row) =>
                locked ? null : (
                  <div className="flex flex-wrap gap-1">
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/products/add?itemId=${row.id}`}>Edit</Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      loading={working === row.id}
                      onClick={() => void remove(row.id)}
                    >
                      Remove
                    </Button>
                  </div>
                ),
            },
          ]}
        />
        <div className="flex flex-wrap justify-end gap-3">
          <Button asChild variant="outline">
            <Link href="/products/add">Add more</Link>
          </Button>
          <Button
            disabled={!canSend}
            loading={working === "send"}
            onClick={() => void send()}
          >
            Send for review
          </Button>
        </div>
      </PanelContent>
    </Panel>
  )
}
