"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Checkbox, Input, Select } from "@sagui/ui"

import { EntityFormLayout } from "@/components/entities/entity-form-layout"
import { useToast } from "@/components/toast-provider"
import { storesAPI } from "@/lib/api-client"
import {
  defaultOperatingHours,
  storeSchema,
  type StoreFormValues,
} from "@/lib/schemas/store.schema"
import type { Store } from "@/lib/types"

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const

const REGION_OPTIONS = ["Central", "North", "South", "West"].map((region) => ({
  value: region,
  label: region,
}))

const STORE_TYPE_OPTIONS = [
  { value: "standalone", label: "Standalone" },
  { value: "kiosk", label: "Kiosk" },
  { value: "express", label: "Express" },
]

type StoreFormProps = {
  initialValues?: Store
  mode: "create" | "edit"
}

export function StoreForm({ initialValues, mode }: StoreFormProps) {
  const router = useRouter()
  const showToast = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const form = useForm<StoreFormValues>({
    resolver: zodResolver(storeSchema),
    defaultValues: initialValues ?? {
      storeId: "",
      storeName: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      region: "Central",
      storeType: "standalone",
      operatingHours: defaultOperatingHours,
      squareFootage: 1000,
      manager: "",
      managerPhone: "",
      isActive: true,
    },
  })
  const { errors } = form.formState

  async function onSubmit(values: StoreFormValues) {
    setIsSubmitting(true)
    setSaveError(null)
    try {
      const payload = values as Store
      if (mode === "create") {
        await storesAPI.create(payload)
        showToast({ title: "Store created" })
      } else {
        await storesAPI.update(values.storeId, payload)
        showToast({ title: "Store updated" })
      }
      router.push(`/stores/${values.storeId}`)
      router.refresh()
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Failed to save store")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <EntityFormLayout
      title={mode === "create" ? "New Store" : "Edit Store"}
      description="Manage store location details and operating hours."
      cancelHref={mode === "create" ? "/stores" : `/stores/${initialValues?.storeId}`}
      isSubmitting={isSubmitting}
      error={saveError}
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <div className="grid items-start gap-4 md:grid-cols-2">
        <Input label="Store ID" error={errors.storeId?.message} {...form.register("storeId")} disabled={mode === "edit"} />
        <Input label="Store Name" error={errors.storeName?.message} {...form.register("storeName")} />
      </div>

      <Input label="Address" error={errors.address?.message} {...form.register("address")} />

      <div className="grid items-start gap-4 md:grid-cols-3">
        <Input label="City" error={errors.city?.message} {...form.register("city")} />
        <Input label="State" error={errors.state?.message} {...form.register("state")} />
        <Input label="ZIP Code" error={errors.zipCode?.message} {...form.register("zipCode")} />
      </div>

      <div className="grid items-start gap-4 md:grid-cols-3">
        <Select
          label="Region"
          placeholder="Select region"
          value={form.watch("region")}
          options={REGION_OPTIONS}
          error={errors.region?.message}
          onValueChange={(value) => form.setValue("region", value)}
        />
        <Select
          label="Store Type"
          placeholder="Select type"
          value={form.watch("storeType")}
          options={STORE_TYPE_OPTIONS}
          onValueChange={(value) =>
            form.setValue("storeType", value as StoreFormValues["storeType"])
          }
        />
        <Input
          label="Square Footage"
          type="number"
          error={errors.squareFootage?.message}
          {...form.register("squareFootage", { valueAsNumber: true })}
        />
      </div>

      <div className="grid items-start gap-4 md:grid-cols-2">
        <Input label="Manager" error={errors.manager?.message} {...form.register("manager")} />
        <Input label="Manager Phone" error={errors.managerPhone?.message} {...form.register("managerPhone")} />
      </div>

      <fieldset className="m-0 grid min-w-0 gap-4 border-0 p-0 md:grid-cols-2">
        <legend className="mb-2 p-0 text-sm font-medium">Operating Hours</legend>
        {DAYS.map((day) => (
          <Input
            key={day}
            label={`${day[0]!.toUpperCase()}${day.slice(1)}`}
            placeholder="06:00-23:00"
            {...form.register(`operatingHours.${day}`)}
          />
        ))}
      </fieldset>

      <Checkbox
        label="Active store"
        checked={form.watch("isActive")}
        onCheckedChange={(checked) => form.setValue("isActive", checked === true)}
      />
    </EntityFormLayout>
  )
}
