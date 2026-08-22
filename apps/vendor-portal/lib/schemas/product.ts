import { z } from "zod"

export const portalProductSchema = z.object({
  productName: z.string().min(1, "Product name is required"),
  categoryId: z.string().min(1, "Category is required"),
  vendorSku: z.string().min(1, "Vendor SKU is required"),
  description: z.string(),
  unitOfMeasure: z.string().min(1, "Unit of measure is required"),
  unitsPerCase: z.number().min(1),
  wholesalePrice: z.number().min(0),
  weight: z.number().min(0),
  barcode: z.string(),
})

export type PortalProductValues = z.infer<typeof portalProductSchema>
