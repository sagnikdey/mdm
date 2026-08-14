"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { EntityFormLayout } from "@/components/entities/entity-form-layout"
import { inventoryAPI, productsAPI, storesAPI } from "@/lib/api-client"
import {
  inventorySchema,
  type InventoryFormValues,
} from "@/lib/schemas/inventory.schema"
import type { InventoryRecord, Product, Store } from "@/lib/types"
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

type InventoryFormProps = {
  initialValues?: InventoryRecord
  mode: "create" | "edit"
}

export function InventoryForm({ initialValues, mode }: InventoryFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
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

  async function onSubmit(values: InventoryFormValues) {
    setIsSubmitting(true)
    try {
      const payload: InventoryRecord = {
        ...values,
        lastCountDate: new Date(values.lastCountDate).toISOString(),
        nextCountDate: new Date(values.nextCountDate).toISOString(),
      }

      if (mode === "create") {
        await inventoryAPI.create(payload)
        toast.success("Inventory record created")
      } else {
        await inventoryAPI.update(values.inventoryId, payload)
        toast.success("Inventory record updated")
      }
      router.push(`/inventory/${values.inventoryId}`)
      router.refresh()
    } catch (error) {
      toast.error(
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
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="inventoryId">Inventory ID</FieldLabel>
          <FieldContent>
            <Input
              id="inventoryId"
              {...form.register("inventoryId")}
              disabled={mode === "edit"}
            />
            <FieldError errors={[form.formState.errors.inventoryId]} />
          </FieldContent>
        </Field>

        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel>Store</FieldLabel>
            <FieldContent>
              <Select
                value={form.watch("storeId")}
                onValueChange={(value) => form.setValue("storeId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select store" />
                </SelectTrigger>
                <SelectContent>
                  {stores.map((store) => (
                    <SelectItem key={store.storeId} value={store.storeId}>
                      {store.storeName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[form.formState.errors.storeId]} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel>Product SKU</FieldLabel>
            <FieldContent>
              <Select
                value={form.watch("sku")}
                onValueChange={(value) => {
                  form.setValue("sku", value)
                  const product = products.find((item) => item.sku === value)
                  if (product) {
                    form.setValue("unitOfMeasure", product.unitOfMeasure)
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.sku} value={product.sku}>
                      {product.sku} — {product.productName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[form.formState.errors.sku]} />
            </FieldContent>
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="currentQuantity">Current Quantity</FieldLabel>
            <FieldContent>
              <Input
                id="currentQuantity"
                type="number"
                {...form.register("currentQuantity", { valueAsNumber: true })}
              />
              <FieldError errors={[form.formState.errors.currentQuantity]} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="unitOfMeasure">Unit of Measure</FieldLabel>
            <FieldContent>
              <Input id="unitOfMeasure" {...form.register("unitOfMeasure")} />
              <FieldError errors={[form.formState.errors.unitOfMeasure]} />
            </FieldContent>
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="lastCountDate">Last Count Date</FieldLabel>
            <FieldContent>
              <Input id="lastCountDate" type="date" {...form.register("lastCountDate")} />
              <FieldError errors={[form.formState.errors.lastCountDate]} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="nextCountDate">Next Count Date</FieldLabel>
            <FieldContent>
              <Input id="nextCountDate" type="date" {...form.register("nextCountDate")} />
              <FieldError errors={[form.formState.errors.nextCountDate]} />
            </FieldContent>
          </Field>
        </div>
      </FieldGroup>
    </EntityFormLayout>
  )
}
