"use client"

import { useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"

import type {
  CatalogCategory,
  CatalogProduct,
  ProductSubmissionItem,
} from "@workspace/vendor-onboarding/portal-types"
import {
  Alert,
  Button,
  Input,
  Panel,
  PanelContent,
  PanelDescription,
  PanelHeader,
  PanelTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@sagui/ui"

import { PortalProductForm } from "@/app/(portal)/products/product-form"
import { useToast } from "@/components/toast-provider"
import type { PortalProductValues } from "@/lib/schemas/product"

type AddProductsProps = {
  categories: CatalogCategory[]
  liveProducts: CatalogProduct[]
  draftVendorSkus: string[]
  editItem?: ProductSubmissionItem
  locked?: boolean
  allowedNames: string[]
}

type LookupNotice = { tone: "info" | "danger"; title: string }

export function AddProducts({
  categories,
  liveProducts,
  draftVendorSkus,
  editItem,
  locked,
  allowedNames,
}: AddProductsProps) {
  const router = useRouter()
  const showToast = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [lookingUp, setLookingUp] = useState(false)
  const [lookupNotice, setLookupNotice] = useState<LookupNotice | null>(null)
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
    setUploadError(null)
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
      showToast({
        title: `Added ${payload.added} products to your draft`,
        description: payload.unknownColumns?.length
          ? `Ignored columns: ${payload.unknownColumns.join(", ")}`
          : undefined,
      })
      router.push("/products/review")
      router.refresh()
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed")
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  async function lookup() {
    setLookingUp(true)
    setLookupNotice(null)
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
        setLookupNotice({
          tone: "info",
          title: "Check the auto-filled fields against the product you sell",
        })
      } else {
        setLookupNotice({ tone: "info", title: "No match. Enter the rest by hand." })
      }
      setLookupDefaults(defaults)
      setAutoFilled(filled)
    } catch (error) {
      setLookupNotice({
        tone: "danger",
        title: error instanceof Error ? error.message : "Lookup failed",
      })
    } finally {
      setLookingUp(false)
    }
  }

  const defaultTab = editItem ? "manual" : "bulk"

  return (
    <div className="space-y-6">
      <div className="rounded-container border border-border-default bg-bg-muted px-4 py-3 text-sm">
        You&apos;re approved to submit in:{" "}
        <span className="font-medium">
          {allowedNames.length ? allowedNames.join(", ") : "none yet"}
        </span>
        . Need another category? Contact your MDM buyer — they widen this on
        the vendor record.
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList aria-label="How to add products">
          <TabsTrigger value="bulk">Bulk upload</TabsTrigger>
          <TabsTrigger value="barcode">Barcode</TabsTrigger>
          <TabsTrigger value="manual">Manual</TabsTrigger>
        </TabsList>

        <TabsContent value="bulk" className="pt-4 text-sm">
          <Panel>
            <PanelHeader>
              <PanelTitle as="h2">Excel or CSV</PanelTitle>
              <PanelDescription>
                Download the template for your allowed categories, fill the
                Products sheet, then upload. Rows are saved to your draft —
                nothing goes to MDM until you send for review.
              </PanelDescription>
            </PanelHeader>
            <PanelContent className="space-y-4">
              {uploadError ? <Alert tone="danger" title={uploadError} /> : null}
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="outline">
                  <a href="/api/products/template">Download template</a>
                </Button>
                <Button
                  type="button"
                  disabled={locked}
                  loading={uploading}
                  onClick={() => fileRef.current?.click()}
                >
                  Upload .xlsx or .csv
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".xlsx,.csv"
                  aria-label="Product file"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (file) void uploadFile(file)
                  }}
                />
              </div>
              {locked ? (
                <p className="text-fg-muted">
                  This packet is waiting for MDM. You can add more after they
                  decide.
                </p>
              ) : null}
            </PanelContent>
          </Panel>
        </TabsContent>

        <TabsContent value="barcode" className="space-y-6 pt-4">
          <Panel>
            <PanelHeader>
              <PanelTitle as="h2">Scan or type barcode</PanelTitle>
              <PanelDescription>
                Hardware scanners just work in this field. We look up Open Food
                Facts, then you finish vendor SKU, wholesale, category, and pack.
              </PanelDescription>
            </PanelHeader>
            <PanelContent className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="min-w-0 flex-1">
                  <Input
                    label="Barcode"
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
                </div>
                <Button
                  type="button"
                  disabled={locked || !barcode.trim()}
                  loading={lookingUp}
                  onClick={() => void lookup()}
                >
                  Look up
                </Button>
              </div>
              {lookupNotice ? (
                <Alert tone={lookupNotice.tone} title={lookupNotice.title} />
              ) : null}
            </PanelContent>
          </Panel>
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
            <p className="text-sm text-fg-muted">
              No camera needed. Type or paste if you don&apos;t have a scanner.
            </p>
          )}
        </TabsContent>

        <TabsContent value="manual" className="pt-4">
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
