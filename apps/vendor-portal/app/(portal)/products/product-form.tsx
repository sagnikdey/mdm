"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import type {
  CatalogCategory,
  CatalogProduct,
} from "@workspace/vendor-onboarding/portal-types"
import {
  Checkbox,
  Input,
  Panel,
  PanelContent,
  PanelDescription,
  PanelHeader,
  PanelTitle,
  Select,
  Textarea,
} from "@sagui/ui"

import { FormPage, FormSection } from "@/components/entities/form-page"
import { useToast } from "@/components/toast-provider"
import {
  emptyPortalProduct,
  portalProductSchema,
  type PortalProductValues,
} from "@/lib/schemas/product"

const PACK_TYPE_OPTIONS = [
  { value: "single", label: "Single unit" },
  { value: "multi_pack", label: "Multi-pack" },
  { value: "case", label: "Case" },
]

const WEIGHT_UNIT_OPTIONS = ["lb", "oz", "g", "kg"].map((value) => ({
  value,
  label: value,
}))

export function PortalProductForm({
  categories,
  liveProducts = [],
  draftVendorSkus = [],
  defaultValues,
  autoFilled = [],
  itemId,
  locked,
  cancelHref = "/products/review",
}: {
  categories: CatalogCategory[]
  liveProducts?: CatalogProduct[]
  draftVendorSkus?: string[]
  defaultValues?: Partial<PortalProductValues>
  autoFilled?: string[]
  itemId?: number
  locked?: boolean
  cancelHref?: string
}) {
  const router = useRouter()
  const showToast = useToast()
  const [saveError, setSaveError] = useState<string | null>(null)
  const form = useForm<PortalProductValues>({
    resolver: zodResolver(portalProductSchema),
    defaultValues: { ...emptyPortalProduct(), ...defaultValues },
  })
  const { errors } = form.formState

  const noBarcode = form.watch("noBarcode")
  const packType = form.watch("packType")

  useEffect(() => {
    if (packType === "single") {
      form.setValue("packSize", 1)
      form.setValue("baseUnitVendorSku", "")
    }
  }, [form, packType])

  useEffect(() => {
    if (noBarcode) form.setValue("barcode", "")
  }, [form, noBarcode])

  const baseOptions = [
    ...liveProducts
      .filter((product) => product.packType === "single")
      .map((product) => product.vendorSku),
    ...draftVendorSkus,
  ].filter((sku, index, all) => sku && all.indexOf(sku) === index)

  function autoFilledNote(field: string) {
    return autoFilled.includes(field) ? "From Open Food Facts" : undefined
  }

  async function onSubmit(values: PortalProductValues) {
    if (locked) return
    setSaveError(null)
    const path = itemId
      ? `/api/submissions/products/items/${itemId}`
      : "/api/submissions/products"
    const response = await fetch(path, {
      method: itemId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    })
    const payload = (await response.json()) as { error?: string }
    if (!response.ok) {
      setSaveError(payload.error ?? "Could not save")
      return
    }
    showToast({ title: itemId ? "Row updated" : "Added to draft packet" })
    router.push("/products/review")
    router.refresh()
  }

  if (!categories.length) {
    return (
      <Panel as="section">
        <PanelHeader>
          <PanelTitle as="h2">New Product</PanelTitle>
          <PanelDescription>
            Your buyer has not assigned product categories yet.
          </PanelDescription>
        </PanelHeader>
        <PanelContent>
          <p className="text-sm text-fg-muted">
            Contact MDM staff to add allowed categories before submitting
            products.
          </p>
        </PanelContent>
      </Panel>
    )
  }

  return (
    <FormPage
      eyebrow="Products / Packet"
      title={itemId ? "Edit draft product" : "Add to packet"}
      description="Saved to your draft. Send the whole packet for MDM review when you are done."
      cancelHref={cancelHref}
      isSubmitting={form.formState.isSubmitting}
      submitLabel={itemId ? "Save row" : "Add to packet"}
      error={saveError}
      hideFooter={locked}
      onSubmit={locked ? undefined : form.handleSubmit(onSubmit)}
    >
      <FormSection
        number="01"
        title="Pack"
        description="How this product is packed and sold."
      >
        <div className="gap-6 md:grid-cols-2 grid items-start">
          <Select
            label="Pack type"
            value={packType}
            options={PACK_TYPE_OPTIONS}
            disabled={locked}
            onValueChange={(value) =>
              form.setValue(
                "packType",
                value as PortalProductValues["packType"]
              )
            }
          />
          <Input
            label="Pack size"
            type="number"
            disabled={locked || packType === "single"}
            error={errors.packSize?.message}
            {...form.register("packSize", { valueAsNumber: true })}
          />
        </div>

        {packType !== "single" ? (
          <Select
            label="Base unit vendor SKU (if you also sell the single)"
            placeholder="Not selling the single separately"
            value={form.watch("baseUnitVendorSku") || "__none"}
            options={[
              { value: "__none", label: "Not linked — case only" },
              ...baseOptions.map((sku) => ({ value: sku, label: sku })),
            ]}
            disabled={locked}
            onValueChange={(value) =>
              form.setValue(
                "baseUnitVendorSku",
                value === "__none" ? "" : value
              )
            }
          />
        ) : null}
      </FormSection>
      <FormSection
        number="02"
        title="Product details"
        description="What the product is and how it is identified."
      >
        <div className="gap-6 md:grid-cols-2 grid items-start">
          <Input
            label="Product name"
            description={autoFilledNote("productName")}
            disabled={locked}
            error={errors.productName?.message}
            {...form.register("productName")}
          />
          <Input
            label="Brand"
            description={autoFilledNote("brand")}
            disabled={locked}
            error={errors.brand?.message}
            {...form.register("brand")}
          />
        </div>

        <div className="gap-6 md:grid-cols-2 grid items-start">
          <Input
            label="Vendor SKU"
            disabled={locked}
            error={errors.vendorSku?.message}
            {...form.register("vendorSku")}
          />
          <Input
            label="Manufacturer"
            description={autoFilledNote("manufacturer")}
            disabled={locked}
            {...form.register("manufacturer")}
          />
        </div>

        <Select
          label="Category"
          placeholder="Select category"
          value={form.watch("categoryId")}
          options={categories.map((category) => ({
            value: category.categoryId,
            label: category.categoryName,
          }))}
          disabled={locked}
          error={errors.categoryId?.message}
          onValueChange={(value) => form.setValue("categoryId", value)}
        />

        <Checkbox
          label="No barcode"
          disabled={locked}
          checked={noBarcode}
          onCheckedChange={(checked) =>
            form.setValue("noBarcode", checked === true)
          }
        />

        <Input
          label="Barcode"
          description={autoFilledNote("barcode")}
          disabled={locked || noBarcode}
          error={errors.barcode?.message}
          {...form.register("barcode")}
        />

        <Textarea
          label="Description"
          description={autoFilledNote("description")}
          disabled={locked}
          {...form.register("description")}
        />
      </FormSection>
      <FormSection
        number="03"
        title="Pricing & weight"
        description="Units, wholesale price and weight."
      >
        <div className="gap-6 md:grid-cols-3 grid items-start">
          <Input
            label="Unit of measure"
            disabled={locked}
            {...form.register("unitOfMeasure")}
          />
          <Input
            label="Units per case"
            type="number"
            disabled={locked}
            {...form.register("unitsPerCase", { valueAsNumber: true })}
          />
          <Input
            label="Wholesale price"
            type="number"
            step="0.01"
            disabled={locked}
            error={errors.wholesalePrice?.message}
            {...form.register("wholesalePrice", { valueAsNumber: true })}
          />
        </div>

        <div className="gap-6 md:grid-cols-2 grid items-start">
          <Input
            label="Weight"
            description={autoFilledNote("weight")}
            type="number"
            step="0.01"
            disabled={locked}
            {...form.register("weight", { valueAsNumber: true })}
          />
          <Select
            label="Weight unit"
            value={form.watch("weightUnit")}
            options={WEIGHT_UNIT_OPTIONS}
            disabled={locked}
            onValueChange={(value) =>
              form.setValue(
                "weightUnit",
                value as PortalProductValues["weightUnit"]
              )
            }
          />
        </div>
      </FormSection>
    </FormPage>
  )
}
