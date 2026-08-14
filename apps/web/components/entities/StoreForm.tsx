"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { EntityFormLayout } from "@/components/entities/entity-form-layout"
import { storesAPI } from "@/lib/api-client"
import {
  defaultOperatingHours,
  storeSchema,
  type StoreFormValues,
} from "@/lib/schemas/store.schema"
import type { Store } from "@/lib/types"
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

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const

type StoreFormProps = {
  initialValues?: Store
  mode: "create" | "edit"
}

export function StoreForm({ initialValues, mode }: StoreFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  async function onSubmit(values: StoreFormValues) {
    setIsSubmitting(true)
    try {
      const payload = values as Store
      if (mode === "create") {
        await storesAPI.create(payload)
        toast.success("Store created")
      } else {
        await storesAPI.update(values.storeId, payload)
        toast.success("Store updated")
      }
      router.push(`/stores/${values.storeId}`)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save store")
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
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FieldGroup>
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="storeId">Store ID</FieldLabel>
            <FieldContent>
              <Input id="storeId" {...form.register("storeId")} disabled={mode === "edit"} />
              <FieldError errors={[form.formState.errors.storeId]} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="storeName">Store Name</FieldLabel>
            <FieldContent>
              <Input id="storeName" {...form.register("storeName")} />
              <FieldError errors={[form.formState.errors.storeName]} />
            </FieldContent>
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="address">Address</FieldLabel>
          <FieldContent>
            <Input id="address" {...form.register("address")} />
            <FieldError errors={[form.formState.errors.address]} />
          </FieldContent>
        </Field>

        <div className="grid gap-4 md:grid-cols-3">
          <Field>
            <FieldLabel htmlFor="city">City</FieldLabel>
            <FieldContent>
              <Input id="city" {...form.register("city")} />
              <FieldError errors={[form.formState.errors.city]} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="state">State</FieldLabel>
            <FieldContent>
              <Input id="state" {...form.register("state")} />
              <FieldError errors={[form.formState.errors.state]} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="zipCode">ZIP Code</FieldLabel>
            <FieldContent>
              <Input id="zipCode" {...form.register("zipCode")} />
              <FieldError errors={[form.formState.errors.zipCode]} />
            </FieldContent>
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Field>
            <FieldLabel>Region</FieldLabel>
            <FieldContent>
              <Select
                value={form.watch("region")}
                onValueChange={(value) => form.setValue("region", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {["Central", "North", "South", "West"].map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[form.formState.errors.region]} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel>Store Type</FieldLabel>
            <FieldContent>
              <Select
                value={form.watch("storeType")}
                onValueChange={(value) =>
                  form.setValue("storeType", value as StoreFormValues["storeType"])
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standalone">Standalone</SelectItem>
                  <SelectItem value="kiosk">Kiosk</SelectItem>
                  <SelectItem value="express">Express</SelectItem>
                </SelectContent>
              </Select>
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="squareFootage">Square Footage</FieldLabel>
            <FieldContent>
              <Input id="squareFootage" type="number" {...form.register("squareFootage", { valueAsNumber: true })} />
              <FieldError errors={[form.formState.errors.squareFootage]} />
            </FieldContent>
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="manager">Manager</FieldLabel>
            <FieldContent>
              <Input id="manager" {...form.register("manager")} />
              <FieldError errors={[form.formState.errors.manager]} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="managerPhone">Manager Phone</FieldLabel>
            <FieldContent>
              <Input id="managerPhone" {...form.register("managerPhone")} />
              <FieldError errors={[form.formState.errors.managerPhone]} />
            </FieldContent>
          </Field>
        </div>

        <FieldGroup>
          <FieldLabel>Operating Hours</FieldLabel>
          {DAYS.map((day) => (
            <Field key={day}>
              <FieldLabel htmlFor={day} className="capitalize">
                {day}
              </FieldLabel>
              <FieldContent>
                <Input
                  id={day}
                  {...form.register(`operatingHours.${day}`)}
                  placeholder="06:00-23:00"
                />
              </FieldContent>
            </Field>
          ))}
        </FieldGroup>

        <Field orientation="horizontal">
          <Checkbox
            id="isActive"
            checked={form.watch("isActive")}
            onCheckedChange={(checked) => form.setValue("isActive", checked === true)}
          />
          <FieldLabel htmlFor="isActive">Active store</FieldLabel>
        </Field>
      </FieldGroup>
    </EntityFormLayout>
  )
}
