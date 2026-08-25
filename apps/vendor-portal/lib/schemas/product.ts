import { z } from "zod"

import { PACK_TYPES, WEIGHT_UNITS } from "@workspace/vendor-onboarding/product-fields"

export const portalProductSchema = z
  .object({
    productName: z.string().min(1, "Product name is required"),
    brand: z.string().min(1, "Brand is required"),
    manufacturer: z.string(),
    categoryId: z.string().min(1, "Category is required"),
    vendorSku: z.string().min(1, "Vendor SKU is required"),
    description: z.string(),
    unitOfMeasure: z.string().min(1, "Unit of measure is required"),
    unitsPerCase: z.number().min(1),
    wholesalePrice: z.number(),
    weight: z.number().min(0),
    weightUnit: z.enum(WEIGHT_UNITS),
    barcode: z.string(),
    noBarcode: z.boolean(),
    packType: z.enum(PACK_TYPES),
    packSize: z.number().min(1),
    baseUnitVendorSku: z.string(),
  })
  .superRefine((value, ctx) => {
    if (!value.noBarcode && !value.barcode.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["barcode"],
        message: "Barcode is required, or check No barcode",
      })
    }
  })

export type PortalProductValues = z.infer<typeof portalProductSchema>

export const emptyPortalProduct = (): PortalProductValues => ({
  productName: "",
  brand: "",
  manufacturer: "",
  categoryId: "",
  vendorSku: "",
  description: "",
  unitOfMeasure: "case",
  unitsPerCase: 1,
  wholesalePrice: 0,
  weight: 0,
  weightUnit: "lb",
  barcode: "",
  noBarcode: false,
  packType: "case",
  packSize: 1,
  baseUnitVendorSku: "",
})
