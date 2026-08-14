import { z } from "zod"

export const vendorSchema = z.object({
  vendorId: z.string().min(1, "Vendor ID is required"),
  vendorName: z.string().min(1, "Vendor name is required"),
  vendorCategory: z.string().min(1, "Category is required"),
  contactPerson: z.string().min(1, "Contact person is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().min(1, "Address is required"),
  paymentTerms: z.string().min(1, "Payment terms are required"),
  minimumOrderQuantity: z.number().min(1),
  isActive: z.boolean(),
})

export type VendorFormValues = z.infer<typeof vendorSchema>
