"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import type { CatalogCategory, CatalogProduct } from "@workspace/vendor-onboarding/portal-types"
import { FormLayout } from "@workspace/ui/components/form-layout"
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Textarea } from "@workspace/ui/components/textarea"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Badge } from "@workspace/ui/components/badge"

import {
  emptyPortalProduct,
  portalProductSchema,
  type PortalProductValues,
} from "@/lib/schemas/product"

function AutoBadge({ show }: { show?: boolean }) {
  if (!show) return null
  return (
    <Badge variant="outline" className="ms-2 align-middle">
      From Open Food Facts
    </Badge>
  )
}

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
  const form = useForm<PortalProductValues>({
    resolver: zodResolver(portalProductSchema),
    defaultValues: { ...emptyPortalProduct(), ...defaultValues },
  })

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

  async function onSubmit(values: PortalProductValues) {
    if (locked) return
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
      toast.error(payload.error ?? "Could not save")
      return
    }
    toast.success(itemId ? "Row updated" : "Added to draft packet")
    router.push("/products/review")
    router.refresh()
  }

  if (!categories.length) {
    return (
      <FormLayout
        title="New Product"
        description="Your buyer has not assigned product categories yet."
        cancelHref="/products"
        contained={false}
      >
        <p className="text-sm text-muted-foreground">
          Contact MDM staff to add allowed categories before submitting
          products.
        </p>
      </FormLayout>
    )
  }

  return (
    <FormLayout
      title={itemId ? "Edit draft product" : "Add to packet"}
      description="Saved to your draft. Send the whole packet for MDM review when you are done."
      cancelHref={cancelHref}
      contained={false}
      isSubmitting={form.formState.isSubmitting}
      submitLabel={itemId ? "Save row" : "Add to packet"}
      submittingLabel="Saving..."
      onSubmit={locked ? undefined : form.handleSubmit(onSubmit)}
    >
      <FieldGroup>
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel>Pack type</FieldLabel>
            <FieldContent>
              <Select
                value={packType}
                onValueChange={(value) =>
                  form.setValue("packType", value as PortalProductValues["packType"])
                }
                disabled={locked}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single unit</SelectItem>
                  <SelectItem value="multi_pack">Multi-pack</SelectItem>
                  <SelectItem value="case">Case</SelectItem>
                </SelectContent>
              </Select>
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="packSize">Pack size</FieldLabel>
            <FieldContent>
              <Input
                id="packSize"
                type="number"
                disabled={locked || packType === "single"}
                {...form.register("packSize", { valueAsNumber: true })}
              />
              <FieldError errors={[form.formState.errors.packSize]} />
            </FieldContent>
          </Field>
        </div>

        {packType !== "single" ? (
          <Field>
            <FieldLabel>Base unit vendor SKU (if you also sell the single)</FieldLabel>
            <FieldContent>
              <Select
                value={form.watch("baseUnitVendorSku") || "__none"}
                onValueChange={(value) =>
                  form.setValue("baseUnitVendorSku", value === "__none" ? "" : value)
                }
                disabled={locked}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Not selling the single separately" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">Not linked — case only</SelectItem>
                  {baseOptions.map((sku) => (
                    <SelectItem key={sku} value={sku}>
                      {sku}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldContent>
          </Field>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="productName">
              Product name
              <AutoBadge show={autoFilled.includes("productName")} />
            </FieldLabel>
            <FieldContent>
              <Input id="productName" disabled={locked} {...form.register("productName")} />
              <FieldError errors={[form.formState.errors.productName]} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="brand">
              Brand
              <AutoBadge show={autoFilled.includes("brand")} />
            </FieldLabel>
            <FieldContent>
              <Input id="brand" disabled={locked} {...form.register("brand")} />
              <FieldError errors={[form.formState.errors.brand]} />
            </FieldContent>
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="vendorSku">Vendor SKU</FieldLabel>
            <FieldContent>
              <Input id="vendorSku" disabled={locked} {...form.register("vendorSku")} />
              <FieldError errors={[form.formState.errors.vendorSku]} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="manufacturer">
              Manufacturer
              <AutoBadge show={autoFilled.includes("manufacturer")} />
            </FieldLabel>
            <FieldContent>
              <Input
                id="manufacturer"
                disabled={locked}
                {...form.register("manufacturer")}
              />
            </FieldContent>
          </Field>
        </div>

        <Field>
          <FieldLabel>Category</FieldLabel>
          <FieldContent>
            <Select
              value={form.watch("categoryId")}
              onValueChange={(value) => form.setValue("categoryId", value)}
              disabled={locked}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.categoryId} value={category.categoryId}>
                    {category.categoryName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={[form.formState.errors.categoryId]} />
          </FieldContent>
        </Field>

        <Field orientation="horizontal">
          <Checkbox
            id="noBarcode"
            disabled={locked}
            checked={noBarcode}
            onCheckedChange={(checked) => form.setValue("noBarcode", checked === true)}
          />
          <FieldLabel htmlFor="noBarcode">No barcode</FieldLabel>
        </Field>

        <Field>
          <FieldLabel htmlFor="barcode">
            Barcode
            <AutoBadge show={autoFilled.includes("barcode")} />
          </FieldLabel>
          <FieldContent>
            <Input
              id="barcode"
              disabled={locked || noBarcode}
              {...form.register("barcode")}
            />
            <FieldError errors={[form.formState.errors.barcode]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="description">
            Description
            <AutoBadge show={autoFilled.includes("description")} />
          </FieldLabel>
          <FieldContent>
            <Textarea id="description" disabled={locked} {...form.register("description")} />
          </FieldContent>
        </Field>

        <div className="grid gap-4 md:grid-cols-3">
          <Field>
            <FieldLabel htmlFor="unitOfMeasure">Unit of measure</FieldLabel>
            <FieldContent>
              <Input
                id="unitOfMeasure"
                disabled={locked}
                {...form.register("unitOfMeasure")}
              />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="unitsPerCase">Units per case</FieldLabel>
            <FieldContent>
              <Input
                id="unitsPerCase"
                type="number"
                disabled={locked}
                {...form.register("unitsPerCase", { valueAsNumber: true })}
              />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="wholesalePrice">Wholesale price</FieldLabel>
            <FieldContent>
              <Input
                id="wholesalePrice"
                type="number"
                step="0.01"
                disabled={locked}
                {...form.register("wholesalePrice", { valueAsNumber: true })}
              />
              <FieldError errors={[form.formState.errors.wholesalePrice]} />
            </FieldContent>
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="weight">
              Weight
              <AutoBadge show={autoFilled.includes("weight")} />
            </FieldLabel>
            <FieldContent>
              <Input
                id="weight"
                type="number"
                step="0.01"
                disabled={locked}
                {...form.register("weight", { valueAsNumber: true })}
              />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel>Weight unit</FieldLabel>
            <FieldContent>
              <Select
                value={form.watch("weightUnit")}
                onValueChange={(value) =>
                  form.setValue(
                    "weightUnit",
                    value as PortalProductValues["weightUnit"]
                  )
                }
                disabled={locked}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lb">lb</SelectItem>
                  <SelectItem value="oz">oz</SelectItem>
                  <SelectItem value="g">g</SelectItem>
                  <SelectItem value="kg">kg</SelectItem>
                </SelectContent>
              </Select>
            </FieldContent>
          </Field>
        </div>
      </FieldGroup>
    </FormLayout>
  )
}
