"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Input, Select } from "@sagui/ui"

import { EntityFormLayout } from "@/components/entities/entity-form-layout"
import { useToast } from "@/components/toast-provider"
import { inventoryAPI, productsAPI, storesAPI } from "@/lib/api-client"
import {
  inventorySchema,
  type InventoryFormValues,
} from "@/lib/schemas/inventory.schema"
import type { InventoryRecord, Product, Store } from "@/lib/types"

type InventoryFormProps = {
  initialValues?: InventoryRecord
  mode: "create" | "edit"
}

export function InventoryForm({ initialValues, mode }: InventoryFormProps) {
  const router = useRouter()
  const showToast = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [stores, setStores] = useState<Store[]>([])
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    void Promise.all([storesAPI.list(), productsAPI.list()]).then(
      ([storeList, productList]) => {
        setStores(storeList)
        setProducts(productList)
      }
    )
  }, [])

  const form = useForm<InventoryFormValues>({
    resolver: zodResolver(inventorySchema),
    defaultValues: initialValues
      ? {
          ...initialValues,
          lastCountDate: initialValues.lastCountDate.slice(0, 10),
          nextCountDate: initialValues.nextCountDate.slice(0, 10),
        }
      : {
          inventoryId: "",
          storeId: "",
          sku: "",
          currentQuantity: 0,
          unitOfMeasure: "case",
          lastCountDate: new Date().toISOString().slice(0, 10),
          nextCountDate: new Date(Date.now() + 30 * 86400000)
            .toISOString()
            .slice(0, 10),
        },
  })
  const { errors } = form.formState

  async function onSubmit(values: InventoryFormValues) {
    setIsSubmitting(true)
    setSaveError(null)
    try {
      const payload: InventoryRecord = {
        ...values,
        lastCountDate: new Date(values.lastCountDate).toISOString(),
        nextCountDate: new Date(values.nextCountDate).toISOString(),
      }

      if (mode === "create") {
        await inventoryAPI.create(payload)
        showToast({ title: "Inventory record created" })
      } else {
        await inventoryAPI.update(values.inventoryId, payload)
        showToast({ title: "Inventory record updated" })
      }
      router.push(`/inventory/${values.inventoryId}`)
      router.refresh()
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Failed to save inventory record"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <EntityFormLayout
      title={mode === "create" ? "New Inventory Record" : "Edit Inventory Record"}
      description="Track stock levels and count schedules."
      cancelHref={
        mode === "create" ? "/inventory" : `/inventory/${initialValues?.inventoryId}`
      }
      isSubmitting={isSubmitting}
      error={saveError}
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <Input
        label="Inventory ID"
        error={errors.inventoryId?.message}
        {...form.register("inventoryId")}
        disabled={mode === "edit"}
      />

      <div className="grid items-start gap-4 md:grid-cols-2">
        <Select
          label="Store"
          placeholder="Select store"
          value={form.watch("storeId")}
          options={stores.map((store) => ({ value: store.storeId, label: store.storeName }))}
          error={errors.storeId?.message}
          onValueChange={(value) => form.setValue("storeId", value)}
        />
        <Select
          label="Product SKU"
          placeholder="Select product"
          value={form.watch("sku")}
          options={products.map((product) => ({
            value: product.sku,
            label: `${product.sku} — ${product.productName}`,
          }))}
          error={errors.sku?.message}
          onValueChange={(value) => {
            form.setValue("sku", value)
            const product = products.find((item) => item.sku === value)
            if (product) {
              form.setValue("unitOfMeasure", product.unitOfMeasure)
            }
          }}
        />
      </div>

      <div className="grid items-start gap-4 md:grid-cols-2">
        <Input
          label="Current Quantity"
          type="number"
          error={errors.currentQuantity?.message}
          {...form.register("currentQuantity", { valueAsNumber: true })}
        />
        <Input label="Unit of Measure" error={errors.unitOfMeasure?.message} {...form.register("unitOfMeasure")} />
      </div>

      <div className="grid items-start gap-4 md:grid-cols-2">
        <Input label="Last Count Date" type="date" error={errors.lastCountDate?.message} {...form.register("lastCountDate")} />
        <Input label="Next Count Date" type="date" error={errors.nextCountDate?.message} {...form.register("nextCountDate")} />
      </div>
    </EntityFormLayout>
  )
}
