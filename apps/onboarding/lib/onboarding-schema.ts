import { z } from "zod"

import type { VendorApplication } from "@workspace/vendor-onboarding/types"

export type FieldErrors = Record<string, string>

const requiredText = (message: string) => z.string().trim().min(1, message)

const companyStepSchema = z.object({
  legalName: requiredText("Legal company name is required"),
  vendorCategory: requiredText("Primary category is required"),
})

const contactStepSchema = z.object({
  contactPerson: requiredText("Contact person is required"),
  phone: requiredText("Phone is required"),
})

const addressStepSchema = z.object({
  street: requiredText("Street address is required"),
  city: requiredText("City is required"),
  state: requiredText("State is required"),
  zipCode: requiredText("ZIP code is required").regex(
    /^\d{5}(-\d{4})?$/,
    "Enter a valid 5-digit ZIP code"
  ),
})

const paymentStepSchema = z.object({
  paymentTerms: requiredText("Payment terms are required"),
  minimumOrderQuantity: z
    .number({ error: "Minimum order quantity is required" })
    .int("Minimum order quantity must be a whole number")
    .min(1, "Minimum order quantity must be at least 1"),
})

const categoriesStepSchema = z.object({
  categories: z.array(z.string()).min(1, "Select at least one category"),
})

function flattenIssues(error: z.ZodError): FieldErrors {
  const errors: FieldErrors = {}
  for (const issue of error.issues) {
    const key = issue.path.map(String).join(".")
    if (key && !errors[key]) {
      errors[key] = issue.message
    }
  }
  return errors
}

function parse(
  schema: z.ZodType,
  data: unknown
): { ok: true } | { ok: false; errors: FieldErrors } {
  const result = schema.safeParse(data)
  if (result.success) return { ok: true }
  return { ok: false, errors: flattenIssues(result.error) }
}

export function validateOnboardingStep(
  step: number,
  application: VendorApplication
): { ok: true } | { ok: false; errors: FieldErrors } {
  switch (step) {
    case 1:
      return parse(companyStepSchema, application.companyData)
    case 2:
      return parse(contactStepSchema, application.contactData)
    case 3:
      return parse(addressStepSchema, application.addressData)
    case 4:
      return parse(paymentStepSchema, application.paymentData)
    case 5:
      return parse(categoriesStepSchema, application.categoriesData)
    default:
      return { ok: true }
  }
}

export function getFirstInvalidOnboardingStep(
  application: VendorApplication
): { step: number; errors: FieldErrors } | null {
  for (const step of [1, 2, 3, 4, 5] as const) {
    const result = validateOnboardingStep(step, application)
    if (!result.ok) {
      return { step, errors: result.errors }
    }
  }
  return null
}
