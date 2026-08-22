"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import type { CatalogCategory } from "@workspace/vendor-onboarding"
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

import {
  portalProductSchema,
  type PortalProductValues,
} from "@/lib/schemas/product"

export function PortalProductForm({
  categories,
}: {
  categories: CatalogCategory[]
}) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const form = useForm<PortalProductValues>({
    resolver: zodResolver(portalProductSchema),
    defaultValues: {
      productName: "",
      categoryId: "",
      vendorSku: "",
      description: "",
      unitOfMeasure: "case",
      unitsPerCase: 1,
      wholesalePrice: 0,
      weight: 0,
      barcode: "",
    },
  })

  async function onSubmit(values: PortalProductValues) {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/submissions/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      const payload = (await response.json()) as { error?: string }
      if (!response.ok) throw new Error(payload.error ?? "Submit failed")
      toast.success("Product submitted for review")
      router.push("/products")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Submit failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!categories.length) {
    return (
      <FormLayout
        title="New Product"
        description="Your buyer has not assigned product categories yet."
        cancelHref="/products"
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
      title="New Product"
      description="MDM assigns the official SKU on approval. Use your own vendor SKU here."
      cancelHref="/products"
      isSubmitting={isSubmitting}
      submitLabel="Submit for review"
      submittingLabel="Submitting..."
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FieldGroup>
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="productName">Product Name</FieldLabel>
            <FieldContent>
              <Input id="productName" {...form.register("productName")} />
              <FieldError errors={[form.formState.errors.productName]} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="vendorSku">Vendor SKU</FieldLabel>
            <FieldContent>
              <Input id="vendorSku" {...form.register("vendorSku")} />
              <FieldError errors={[form.formState.errors.vendorSku]} />
            </FieldContent>
          </Field>
        </div>

        <Field>
          <FieldLabel>Category</FieldLabel>
          <FieldContent>
            <Select
              value={form.watch("categoryId")}
              onValueChange={(value) => form.setValue("categoryId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem
                    key={category.categoryId}
                    value={category.categoryId}
                  >
                    {category.categoryName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={[form.formState.errors.categoryId]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="description">Description</FieldLabel>
          <FieldContent>
            <Textarea id="description" {...form.register("description")} />
          </FieldContent>
        </Field>

        <div className="grid gap-4 md:grid-cols-3">
          <Field>
            <FieldLabel htmlFor="unitOfMeasure">Unit of Measure</FieldLabel>
            <FieldContent>
              <Input id="unitOfMeasure" {...form.register("unitOfMeasure")} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="unitsPerCase">Units per Case</FieldLabel>
            <FieldContent>
              <Input
                id="unitsPerCase"
                type="number"
                {...form.register("unitsPerCase", { valueAsNumber: true })}
              />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="wholesalePrice">Wholesale Price</FieldLabel>
            <FieldContent>
              <Input
                id="wholesalePrice"
                type="number"
                step="0.01"
                {...form.register("wholesalePrice", { valueAsNumber: true })}
              />
            </FieldContent>
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="weight">Weight (lbs)</FieldLabel>
            <FieldContent>
              <Input
                id="weight"
                type="number"
                step="0.01"
                {...form.register("weight", { valueAsNumber: true })}
              />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="barcode">Barcode</FieldLabel>
            <FieldContent>
              <Input id="barcode" {...form.register("barcode")} />
            </FieldContent>
          </Field>
        </div>
      </FieldGroup>
    </FormLayout>
  )
}
