import { InventoryForm } from "@/components/entities/InventoryForm"
import { inventoryAPI } from "@/lib/api"

export default async function NewInventoryPage() {
  const inventoryId = await inventoryAPI.getNextId()

  return (
    <InventoryForm
      mode="create"
      initialValues={{
        inventoryId,
        storeId: "",
        sku: "",
        currentQuantity: 0,
        unitOfMeasure: "case",
        lastCountDate: new Date().toISOString(),
        nextCountDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      }}
    />
  )
}
