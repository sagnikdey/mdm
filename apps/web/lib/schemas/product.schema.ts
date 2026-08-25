import { z } from "zod"

export const productSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  productName: z.string().min(1, "Product name is required"),
  brand: z.string(),
  manufacturer: z.string(),
  categoryId: z.string().min(1, "Category is required"),
  vendorId: z.string().min(1, "Vendor is required"),
  vendorSku: z.string().min(1, "Vendor SKU is required"),
  description: z.string(),
  unitOfMeasure: z.string().min(1, "Unit of measure is required"),
  unitsPerCase: z.number().min(1),
  wholesalePrice: z.number().min(0),
  weight: z.number().min(0),
  weightUnit: z.string().min(1),
  barcode: z.string(),
  packType: z.string().min(1),
  packSize: z.number().min(1),
  baseUnitSku: z.string().nullable(),
  isActive: z.boolean(),
})

export type ProductFormValues = z.infer<typeof productSchema>
