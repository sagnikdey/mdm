"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { EntityFormLayout } from "@/components/entities/entity-form-layout"
import { categoriesAPI, productsAPI, vendorsAPI } from "@/lib/api-client"
import { productSchema, type ProductFormValues } from "@/lib/schemas/product.schema"
import type { Category, Product, Vendor } from "@/lib/types"
import { Checkbox } from "@workspace/ui/components/checkbox"
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

type ProductFormProps = {
  initialValues?: Product
  mode: "create" | "edit"
}

export function ProductForm({ initialValues, mode }: ProductFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
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
      categoryId: "",
      vendorId: "",
      vendorSku: "",
      description: "",
      unitOfMeasure: "case",
      unitsPerCase: 1,
      wholesalePrice: 0,
      weight: 0,
      barcode: "",
      isActive: true,
    },
  })

  async function onSubmit(values: ProductFormValues) {
    setIsSubmitting(true)
    try {
      const payload = values as Product
      if (mode === "create") {
        await productsAPI.create(payload)
        toast.success("Product created")
      } else {
        await productsAPI.update(values.sku, payload)
        toast.success("Product updated")
      }
      router.push(`/products/${values.sku}`)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save product")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <EntityFormLayout
      title={mode === "create" ? "New Product" : "Edit Product"}
      description="Manage product catalog details and pricing."
      cancelHref={mode === "create" ? "/products" : `/products/${initialValues?.sku}`}
      isSubmitting={isSubmitting}
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FieldGroup>
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="sku">SKU</FieldLabel>
            <FieldContent>
              <Input id="sku" {...form.register("sku")} disabled={mode === "edit"} />
              <FieldError errors={[form.formState.errors.sku]} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="productName">Product Name</FieldLabel>
            <FieldContent>
              <Input id="productName" {...form.register("productName")} />
              <FieldError errors={[form.formState.errors.productName]} />
            </FieldContent>
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
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
                    <SelectItem key={category.categoryId} value={category.categoryId}>
                      {category.categoryName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[form.formState.errors.categoryId]} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel>Vendor</FieldLabel>
            <FieldContent>
              <Select
                value={form.watch("vendorId")}
                onValueChange={(value) => form.setValue("vendorId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.vendorId} value={vendor.vendorId}>
                      {vendor.vendorName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[form.formState.errors.vendorId]} />
            </FieldContent>
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="vendorSku">Vendor SKU</FieldLabel>
          <FieldContent>
            <Input id="vendorSku" {...form.register("vendorSku")} />
            <FieldError errors={[form.formState.errors.vendorSku]} />
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
              <Input id="unitsPerCase" type="number" {...form.register("unitsPerCase", { valueAsNumber: true })} />
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
              <Input id="weight" type="number" step="0.01" {...form.register("weight", { valueAsNumber: true })} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="barcode">Barcode</FieldLabel>
            <FieldContent>
              <Input id="barcode" {...form.register("barcode")} />
            </FieldContent>
          </Field>
        </div>

        <Field orientation="horizontal">
          <Checkbox
            id="isActive"
            checked={form.watch("isActive")}
            onCheckedChange={(checked) => form.setValue("isActive", checked === true)}
          />
          <FieldLabel htmlFor="isActive">Active product</FieldLabel>
        </Field>
      </FieldGroup>
    </EntityFormLayout>
  )
}
