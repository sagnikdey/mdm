"use client"

import { useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import type {
  CatalogCategory,
  CatalogProduct,
  ProductSubmissionItem,
} from "@workspace/vendor-onboarding/portal-types"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  GlassTabs,
  GlassTabsContent,
  GlassTabsList,
  GlassTabsTrigger,
} from "@workspace/ui/components/glass-tabs"
import {
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardHeader,
  GlassCardTitle,
} from "@workspace/ui/components/glass-card"

import { PortalProductForm } from "@/app/(portal)/products/product-form"
import type { PortalProductValues } from "@/lib/schemas/product"

type AddProductsProps = {
  categories: CatalogCategory[]
  liveProducts: CatalogProduct[]
  draftVendorSkus: string[]
  editItem?: ProductSubmissionItem
  locked?: boolean
  allowedNames: string[]
}

export function AddProducts({
  categories,
  liveProducts,
  draftVendorSkus,
  editItem,
  locked,
  allowedNames,
}: AddProductsProps) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [lookingUp, setLookingUp] = useState(false)
  const [barcode, setBarcode] = useState(editItem?.barcode ?? "")
  const [lookupDefaults, setLookupDefaults] = useState<Partial<PortalProductValues>>()
  const [autoFilled, setAutoFilled] = useState<string[]>([])

  const editDefaults = useMemo<Partial<PortalProductValues> | undefined>(() => {
    if (!editItem) return undefined
    return {
      productName: editItem.productName,
      brand: editItem.brand,
      manufacturer: editItem.manufacturer,
      categoryId: editItem.categoryId ?? "",
      vendorSku: editItem.vendorSku,
      description: editItem.description,
      unitOfMeasure: editItem.unitOfMeasure,
      unitsPerCase: editItem.unitsPerCase,
      wholesalePrice: editItem.wholesalePrice,
      weight: editItem.weight,
      weightUnit: editItem.weightUnit as PortalProductValues["weightUnit"],
      barcode: editItem.barcode,
      noBarcode: editItem.noBarcode,
      packType: editItem.packType as PortalProductValues["packType"],
      packSize: editItem.packSize,
      baseUnitVendorSku: editItem.baseUnitVendorSku,
    }
  }, [editItem])

  async function uploadFile(file: File) {
    setUploading(true)
    try {
      const body = new FormData()
      body.set("file", file)
      const response = await fetch("/api/submissions/products/upload", {
        method: "POST",
        body,
      })
      const payload = (await response.json()) as {
        error?: string
        added?: number
        unknownColumns?: string[]
      }
      if (!response.ok) throw new Error(payload.error ?? "Upload failed")
      if (payload.unknownColumns?.length) {
        toast.message(`Ignored columns: ${payload.unknownColumns.join(", ")}`)
      }
      toast.success(`Added ${payload.added} products to your draft`)
      router.push("/products/review")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed")
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  async function lookup() {
    setLookingUp(true)
    try {
      const response = await fetch(
        `/api/products/lookup?barcode=${encodeURIComponent(barcode)}`
      )
      const payload = (await response.json()) as {
        error?: string
        match?: boolean
        productName?: string
        brand?: string
        manufacturer?: string
        description?: string
        weight?: number | null
        weightUnit?: PortalProductValues["weightUnit"] | null
        barcode?: string
      }
      if (!response.ok) throw new Error(payload.error ?? "Lookup failed")
      const filled: string[] = ["barcode"]
      const defaults: Partial<PortalProductValues> = {
        barcode: payload.barcode ?? barcode,
        noBarcode: false,
      }
      if (payload.match) {
        if (payload.productName) {
          defaults.productName = payload.productName
          filled.push("productName")
        }
        if (payload.brand) {
          defaults.brand = payload.brand
          filled.push("brand")
        }
        if (payload.manufacturer) {
          defaults.manufacturer = payload.manufacturer
          filled.push("manufacturer")
        }
        if (payload.description) {
          defaults.description = payload.description
          filled.push("description")
        }
        if (payload.weight != null) {
          defaults.weight = payload.weight
          filled.push("weight")
        }
        if (payload.weightUnit) defaults.weightUnit = payload.weightUnit
        toast.success("Check the auto-filled fields against the product you sell")
      } else {
        toast.message("No match. Enter the rest by hand.")
      }
      setLookupDefaults(defaults)
      setAutoFilled(filled)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lookup failed")
    } finally {
      setLookingUp(false)
    }
  }

  const defaultTab = editItem ? "manual" : "bulk"

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-muted/40 px-4 py-3 text-sm">
        You&apos;re approved to submit in:{" "}
        <span className="font-medium">
          {allowedNames.length ? allowedNames.join(", ") : "none yet"}
        </span>
        . Need another category? Contact your MDM buyer — they widen this on
        the vendor record.
      </div>

      <GlassTabs defaultValue={defaultTab}>
        <GlassTabsList>
          <GlassTabsTrigger value="bulk">Bulk upload</GlassTabsTrigger>
          <GlassTabsTrigger value="barcode">Barcode</GlassTabsTrigger>
          <GlassTabsTrigger value="manual">Manual</GlassTabsTrigger>
        </GlassTabsList>

        <GlassTabsContent value="bulk" className="text-sm">
          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle>Excel or CSV</GlassCardTitle>
              <GlassCardDescription>
                Download the template for your allowed categories, fill the
                Products sheet, then upload. Rows are saved to your draft —
                nothing goes to MDM until you send for review.
              </GlassCardDescription>
            </GlassCardHeader>
            <GlassCardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="outline">
                  <a href="/api/products/template">Download template</a>
                </Button>
                <Button
                  type="button"
                  disabled={locked || uploading}
                  onClick={() => fileRef.current?.click()}
                >
                  {uploading ? "Uploading..." : "Upload .xlsx or .csv"}
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".xlsx,.csv"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (file) void uploadFile(file)
                  }}
                />
              </div>
              {locked ? (
                <p className="text-muted-foreground">
                  This packet is waiting for MDM. You can add more after they
                  decide.
                </p>
              ) : null}
            </GlassCardContent>
          </GlassCard>
        </GlassTabsContent>

        <GlassTabsContent value="barcode">
          <GlassCard className="mb-6">
            <GlassCardHeader>
              <GlassCardTitle>Scan or type barcode</GlassCardTitle>
              <GlassCardDescription>
                Hardware scanners just work in this field. We look up Open Food
                Facts, then you finish vendor SKU, wholesale, category, and pack.
              </GlassCardDescription>
            </GlassCardHeader>
            <GlassCardContent className="flex flex-col gap-3 sm:flex-row">
              <Input
                autoFocus
                placeholder="Scan or type barcode"
                value={barcode}
                disabled={locked}
                onChange={(event) => setBarcode(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault()
                    void lookup()
                  }
                }}
              />
              <Button
                type="button"
                disabled={locked || lookingUp || !barcode.trim()}
                onClick={() => void lookup()}
              >
                {lookingUp ? "Looking up..." : "Look up"}
              </Button>
            </GlassCardContent>
          </GlassCard>
          {lookupDefaults ? (
            <PortalProductForm
              key={JSON.stringify(lookupDefaults)}
              categories={categories}
              liveProducts={liveProducts}
              draftVendorSkus={draftVendorSkus}
              defaultValues={lookupDefaults}
              autoFilled={autoFilled}
              locked={locked}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              No camera needed. Type or paste if you don&apos;t have a scanner.
            </p>
          )}
        </GlassTabsContent>

        <GlassTabsContent value="manual">
          <PortalProductForm
            key={editItem?.id ?? "new"}
            categories={categories}
            liveProducts={liveProducts}
            draftVendorSkus={draftVendorSkus.filter(
              (sku) => sku !== editItem?.vendorSku
            )}
            defaultValues={editDefaults}
            itemId={editItem?.id}
            locked={locked}
          />
        </GlassTabsContent>
      </GlassTabs>
    </div>
  )
}
