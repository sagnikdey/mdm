import { z } from "zod"

const operatingHoursSchema = z.object({
  monday: z.string().min(1, "Required"),
  tuesday: z.string().min(1, "Required"),
  wednesday: z.string().min(1, "Required"),
  thursday: z.string().min(1, "Required"),
  friday: z.string().min(1, "Required"),
  saturday: z.string().min(1, "Required"),
  sunday: z.string().min(1, "Required"),
})

export const storeSchema = z.object({
  storeId: z.string().min(1, "Store ID is required"),
  storeName: z.string().min(1, "Store name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().min(5, "ZIP code is required"),
  region: z.string().min(1, "Region is required"),
  storeType: z.enum(["standalone", "kiosk", "express"]),
  operatingHours: operatingHoursSchema,
  squareFootage: z.number().min(1, "Square footage is required"),
  manager: z.string().min(1, "Manager is required"),
  managerPhone: z.string().min(1, "Manager phone is required"),
  isActive: z.boolean(),
})

export type StoreFormValues = z.infer<typeof storeSchema>

export const defaultOperatingHours = {
  monday: "06:00-23:00",
  tuesday: "06:00-23:00",
  wednesday: "06:00-23:00",
  thursday: "06:00-23:00",
  friday: "06:00-23:00",
  saturday: "06:00-23:00",
  sunday: "07:00-23:00",
}
