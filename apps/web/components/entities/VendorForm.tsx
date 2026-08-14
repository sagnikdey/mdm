"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { EntityFormLayout } from "@/components/entities/entity-form-layout"
import { vendorsAPI } from "@/lib/api-client"
import { vendorSchema, type VendorFormValues } from "@/lib/schemas/vendor.schema"
import type { Vendor } from "@/lib/types"
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

type VendorFormProps = {
  initialValues?: Vendor
  mode: "create" | "edit"
}

export function VendorForm({ initialValues, mode }: VendorFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  async function onSubmit(values: VendorFormValues) {
    setIsSubmitting(true)
    try {
      const payload = values as Vendor
      if (mode === "create") {
        await vendorsAPI.create(payload)
        toast.success("Vendor created")
      } else {
        await vendorsAPI.update(values.vendorId, payload)
        toast.success("Vendor updated")
      }
      router.push(`/vendors/${values.vendorId}`)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save vendor")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <EntityFormLayout
      title={mode === "create" ? "New Vendor" : "Edit Vendor"}
      description="Manage vendor contact and payment details."
      cancelHref={mode === "create" ? "/vendors" : `/vendors/${initialValues?.vendorId}`}
      isSubmitting={isSubmitting}
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FieldGroup>
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="vendorId">Vendor ID</FieldLabel>
            <FieldContent>
              <Input id="vendorId" {...form.register("vendorId")} disabled={mode === "edit"} />
              <FieldError errors={[form.formState.errors.vendorId]} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="vendorName">Vendor Name</FieldLabel>
            <FieldContent>
              <Input id="vendorName" {...form.register("vendorName")} />
              <FieldError errors={[form.formState.errors.vendorName]} />
            </FieldContent>
          </Field>
        </div>

        <Field>
          <FieldLabel>Category</FieldLabel>
          <FieldContent>
            <Select
              value={form.watch("vendorCategory")}
              onValueChange={(value) => form.setValue("vendorCategory", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {["beverages", "snacks", "food"].map((category) => (
                  <SelectItem key={category} value={category} className="capitalize">
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldContent>
        </Field>

        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="contactPerson">Contact Person</FieldLabel>
            <FieldContent>
              <Input id="contactPerson" {...form.register("contactPerson")} />
              <FieldError errors={[form.formState.errors.contactPerson]} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="phone">Phone</FieldLabel>
            <FieldContent>
              <Input id="phone" {...form.register("phone")} />
              <FieldError errors={[form.formState.errors.phone]} />
            </FieldContent>
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <FieldContent>
            <Input id="email" type="email" {...form.register("email")} />
            <FieldError errors={[form.formState.errors.email]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="address">Address</FieldLabel>
          <FieldContent>
            <Textarea id="address" {...form.register("address")} />
            <FieldError errors={[form.formState.errors.address]} />
          </FieldContent>
        </Field>

        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="paymentTerms">Payment Terms</FieldLabel>
            <FieldContent>
              <Input id="paymentTerms" {...form.register("paymentTerms")} />
              <FieldError errors={[form.formState.errors.paymentTerms]} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="minimumOrderQuantity">Minimum Order Qty</FieldLabel>
            <FieldContent>
              <Input
                id="minimumOrderQuantity"
                type="number"
                {...form.register("minimumOrderQuantity", { valueAsNumber: true })}
              />
              <FieldError errors={[form.formState.errors.minimumOrderQuantity]} />
            </FieldContent>
          </Field>
        </div>

        <Field orientation="horizontal">
          <Checkbox
            id="isActive"
            checked={form.watch("isActive")}
            onCheckedChange={(checked) => form.setValue("isActive", checked === true)}
          />
          <FieldLabel htmlFor="isActive">Active vendor</FieldLabel>
        </Field>
      </FieldGroup>
    </EntityFormLayout>
  )
}
