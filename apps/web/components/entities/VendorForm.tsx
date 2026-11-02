"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Checkbox, Input, Select, Textarea } from "@sagui/ui"

import { FormPage, FormRow, FormSection } from "@/components/entities/form-page"
import { useToast } from "@/components/toast-provider"
import { vendorsAPI } from "@/lib/api-client"
import {
  vendorSchema,
  type VendorFormValues,
} from "@/lib/schemas/vendor.schema"
import type { Vendor } from "@/lib/types"

const CATEGORY_OPTIONS = [
  { value: "beverages", label: "Beverages" },
  { value: "snacks", label: "Snacks" },
  { value: "food", label: "Food" },
]

type VendorFormProps = {
  initialValues?: Vendor
  mode: "create" | "edit"
}

export function VendorForm({ initialValues, mode }: VendorFormProps) {
  const router = useRouter()
  const showToast = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const form = useForm<VendorFormValues>({
    resolver: zodResolver(vendorSchema),
    defaultValues: initialValues ?? {
      vendorId: "",
      vendorName: "",
      vendorCategory: "beverages",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      paymentTerms: "Net 30",
      minimumOrderQuantity: 1,
      isActive: true,
    },
  })
  const { errors } = form.formState

  async function onSubmit(values: VendorFormValues) {
    setIsSubmitting(true)
    setSaveError(null)
    try {
      const payload = values as Vendor
      if (mode === "create") {
        await vendorsAPI.create(payload)
        showToast({ title: "Vendor created" })
      } else {
        await vendorsAPI.update(values.vendorId, payload)
        showToast({ title: "Vendor updated" })
      }
      router.push(`/vendors/${values.vendorId}`)
      router.refresh()
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Failed to save vendor"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <FormPage
      eyebrow={mode === "create" ? "Vendors / New" : "Vendors / Edit"}
      title={mode === "create" ? "New Vendor" : "Edit Vendor"}
      description="Manage vendor contact and payment details."
      cancelHref={
        mode === "create" ? "/vendors" : `/vendors/${initialValues?.vendorId}`
      }
      isSubmitting={isSubmitting}
      submitLabel={mode === "create" ? "Create vendor" : "Save changes"}
      error={saveError}
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FormSection
        number="01"
        title="Vendor details"
        description="How this vendor is identified across master data."
      >
        <FormRow>
          <Input
            label="Vendor ID"
            error={errors.vendorId?.message}
            {...form.register("vendorId")}
            disabled={mode === "edit"}
          />
          <Input
            label="Vendor Name"
            error={errors.vendorName?.message}
            {...form.register("vendorName")}
          />
        </FormRow>
        <FormRow>
          <Select
            label="Category"
            placeholder="Select category"
            value={form.watch("vendorCategory")}
            options={CATEGORY_OPTIONS}
            onValueChange={(value) => form.setValue("vendorCategory", value)}
          />
        </FormRow>
      </FormSection>

      <FormSection
        number="02"
        title="Contact"
        description="Who to reach about orders and deliveries."
      >
        <FormRow>
          <Input
            label="Contact Person"
            error={errors.contactPerson?.message}
            {...form.register("contactPerson")}
          />
          <Input
            label="Phone"
            error={errors.phone?.message}
            {...form.register("phone")}
          />
        </FormRow>
        <FormRow>
          <Input
            label="Email"
            type="email"
            error={errors.email?.message}
            {...form.register("email")}
          />
          <Textarea
            label="Address"
            error={errors.address?.message}
            {...form.register("address")}
          />
        </FormRow>
      </FormSection>

      <FormSection
        number="03"
        title="Terms & status"
        description="Commercial terms, and whether this vendor is active."
      >
        <FormRow>
          <Input
            label="Payment Terms"
            error={errors.paymentTerms?.message}
            {...form.register("paymentTerms")}
          />
          <Input
            label="Minimum Order Qty"
            type="number"
            error={errors.minimumOrderQuantity?.message}
            {...form.register("minimumOrderQuantity", { valueAsNumber: true })}
          />
        </FormRow>
        <Checkbox
          label="Active vendor"
          checked={form.watch("isActive")}
          onCheckedChange={(checked) =>
            form.setValue("isActive", checked === true)
          }
        />
      </FormSection>
    </FormPage>
  )
}
