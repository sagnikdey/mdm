"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Checkbox, Input, Select, Textarea } from "@sagui/ui"

import { FormPage, FormSection } from "@/components/entities/form-page"
import { useToast } from "@/components/toast-provider"
import { categoriesAPI, productsAPI, vendorsAPI } from "@/lib/api-client"
import {
  productSchema,
  type ProductFormValues,
} from "@/lib/schemas/product.schema"
import type { Category, Product, Vendor } from "@/lib/types"

const PACK_TYPE_OPTIONS = [
  { value: "single", label: "Single" },
  { value: "multi_pack", label: "Multi-pack" },
  { value: "case", label: "Case" },
]

type ProductFormProps = {
  initialValues?: Product
  mode: "create" | "edit"
}

export function ProductForm({ initialValues, mode }: ProductFormProps) {
  const router = useRouter()
  const showToast = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])

  useEffect(() => {
    void Promise.all([categoriesAPI.list(), vendorsAPI.list()]).then(
      ([cats, vends]) => {
        setCategories(cats)
        setVendors(vends)
      }
    )
  }, [])

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: initialValues ?? {
      sku: "",
      productName: "",
      brand: "",
      manufacturer: "",
      categoryId: "",
      vendorId: "",
      vendorSku: "",
      description: "",
      unitOfMeasure: "case",
      unitsPerCase: 1,
      wholesalePrice: 0,
      weight: 0,
      weightUnit: "lb",
      barcode: "",
      packType: "case",
      packSize: 1,
      baseUnitSku: null,
      isActive: true,
    },
  })
  const { errors } = form.formState

  async function onSubmit(values: ProductFormValues) {
    setIsSubmitting(true)
    setSaveError(null)
    try {
      const payload = values as Product
      if (mode === "create") {
        await productsAPI.create(payload)
        showToast({ title: "Product created" })
      } else {
        await productsAPI.update(values.sku, payload)
        showToast({ title: "Product updated" })
      }
      router.push(`/products/${values.sku}`)
      router.refresh()
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Failed to save product"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <FormPage
      eyebrow={mode === "create" ? "Products / New" : "Products / Edit"}
      submitLabel={mode === "create" ? "Create product" : "Save changes"}
      title={mode === "create" ? "New Product" : "Edit Product"}
      description="Manage product catalog details and pricing."
      cancelHref={
        mode === "create" ? "/products" : `/products/${initialValues?.sku}`
      }
      isSubmitting={isSubmitting}
      error={saveError}
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FormSection
        number="01"
        title="Product details"
        description="How this product is identified and who supplies it."
      >
        <div className="gap-6 md:grid-cols-2 grid items-start">
          <Input
            label="SKU"
            error={errors.sku?.message}
            {...form.register("sku")}
            disabled={mode === "edit"}
          />
          <Input
            label="Product Name"
            error={errors.productName?.message}
            {...form.register("productName")}
          />
        </div>

        <div className="gap-6 md:grid-cols-2 grid items-start">
          <Input label="Brand" {...form.register("brand")} />
          <Input label="Manufacturer" {...form.register("manufacturer")} />
        </div>

        <div className="gap-6 md:grid-cols-2 grid items-start">
          <Select
            label="Category"
            placeholder="Select category"
            value={form.watch("categoryId")}
            options={categories.map((category) => ({
              value: category.categoryId,
              label: category.categoryName,
            }))}
            error={errors.categoryId?.message}
            onValueChange={(value) => form.setValue("categoryId", value)}
          />
          <Select
            label="Vendor"
            placeholder="Select vendor"
            value={form.watch("vendorId")}
            options={vendors.map((vendor) => ({
              value: vendor.vendorId,
              label: vendor.vendorName,
            }))}
            error={errors.vendorId?.message}
            onValueChange={(value) => form.setValue("vendorId", value)}
          />
        </div>

        <Input
          label="Vendor SKU"
          error={errors.vendorSku?.message}
          {...form.register("vendorSku")}
        />
        <Textarea label="Description" {...form.register("description")} />
      </FormSection>
      <FormSection
        number="02"
        title="Packaging & pricing"
        description="Pack, units, weight and wholesale price."
      >
        <div className="gap-6 md:grid-cols-3 grid items-start">
          <Select
            label="Pack type"
            value={form.watch("packType")}
            options={PACK_TYPE_OPTIONS}
            onValueChange={(value) => form.setValue("packType", value)}
          />
          <Input
            label="Pack size"
            type="number"
            {...form.register("packSize", { valueAsNumber: true })}
          />
          <Input
            label="Base unit SKU"
            value={form.watch("baseUnitSku") ?? ""}
            onChange={(event) =>
              form.setValue("baseUnitSku", event.target.value || null)
            }
          />
        </div>

        <div className="gap-6 md:grid-cols-3 grid items-start">
          <Input label="Unit of Measure" {...form.register("unitOfMeasure")} />
          <Input
            label="Units per Case"
            type="number"
            {...form.register("unitsPerCase", { valueAsNumber: true })}
          />
          <Input
            label="Wholesale Price"
            type="number"
            step="0.01"
            {...form.register("wholesalePrice", { valueAsNumber: true })}
          />
        </div>

        <div className="gap-6 md:grid-cols-3 grid items-start">
          <Input
            label="Weight"
            type="number"
            step="0.01"
            {...form.register("weight", { valueAsNumber: true })}
          />
          <Input label="Weight unit" {...form.register("weightUnit")} />
          <Input label="Barcode" {...form.register("barcode")} />
        </div>
      </FormSection>
      <FormSection
        number="03"
        title="Status"
        description="Whether this product is active."
      >
        <Checkbox
          label="Active product"
          checked={form.watch("isActive")}
          onCheckedChange={(checked) =>
            form.setValue("isActive", checked === true)
          }
        />
      </FormSection>
    </FormPage>
  )
}
