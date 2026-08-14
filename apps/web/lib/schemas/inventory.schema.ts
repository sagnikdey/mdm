import { z } from "zod"

export const inventorySchema = z.object({
  inventoryId: z.string().min(1, "Inventory ID is required"),
  storeId: z.string().min(1, "Store is required"),
  sku: z.string().min(1, "SKU is required"),
  currentQuantity: z.number().min(0),
  unitOfMeasure: z.string().min(1, "Unit of measure is required"),
  lastCountDate: z.string().min(1, "Last count date is required"),
  nextCountDate: z.string().min(1, "Next count date is required"),
})

export type InventoryFormValues = z.infer<typeof inventorySchema>
