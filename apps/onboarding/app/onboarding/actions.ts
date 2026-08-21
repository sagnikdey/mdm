"use server"

import {
  getApplication,
  submitApplication,
  updateApplicationStep,
  type AddressData,
  type CategoriesData,
  type CompanyData,
  type ContactData,
  type DocumentRecord,
  type PaymentData,
} from "@workspace/vendor-onboarding"

import { getFirstInvalidOnboardingStep } from "@/lib/onboarding-schema"
import { getVendorSession } from "@/lib/session"

async function requireSession() {
  const session = await getVendorSession()
  if (!session) throw new Error("Unauthorized")
  return session
}

export async function saveOnboardingStep(input: {
  step: number
  companyData?: CompanyData
  contactData?: ContactData
  addressData?: AddressData
  paymentData?: PaymentData
  categoriesData?: CategoriesData
  documentsData?: DocumentRecord[]
}) {
  const session = await requireSession()
  const application = await getApplication(session.applicationId)
  if (!application) throw new Error("Application not found")
  if (application.status !== "draft" && application.status !== "needs_info") {
    throw new Error("Application is no longer editable")
  }

  return updateApplicationStep(session.applicationId, {
    currentStep: input.step,
    companyData: input.companyData,
    contactData: input.contactData,
    addressData: input.addressData,
    paymentData: input.paymentData,
    categoriesData: input.categoriesData,
    documentsData: input.documentsData,
    legalName: input.companyData?.legalName ?? application.legalName ?? undefined,
  })
}

export async function submitOnboardingApplication() {
  const session = await requireSession()
  const application = await getApplication(session.applicationId)
  if (!application) throw new Error("Application not found")
  if (application.status !== "draft" && application.status !== "needs_info") {
    throw new Error("Application is no longer editable")
  }

  const invalid = getFirstInvalidOnboardingStep(application)
  if (invalid) {
    throw new Error("Please complete all required fields before submitting")
  }

  return submitApplication(session.applicationId)
}

export async function getOnboardingApplication() {
  const session = await requireSession()
  const application = await getApplication(session.applicationId)
  if (!application) throw new Error("Application not found")
  return application
}
