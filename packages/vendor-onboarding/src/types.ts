export type InvitationStatus = "pending" | "redeemed" | "expired" | "revoked"

export type ApplicationStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "needs_info"
  | "approved"
  | "rejected"

export type VendorInvitation = {
  id: string
  tokenHash: string
  invitedEmail: string
  invitedCompany: string | null
  status: InvitationStatus
  expiresAt: string
  invitedByEmail: string
  applicationId: string | null
  redeemedAt: string | null
  createdAt: string
}

export type CompanyData = {
  legalName: string
  dbaName?: string
  taxId?: string
  vendorCategory: string
  website?: string
}

export type ContactData = {
  contactPerson: string
  email: string
  phone: string
  title?: string
}

export type AddressData = {
  street: string
  city: string
  state: string
  zipCode: string
  country?: string
}

export type PaymentData = {
  paymentTerms: string
  minimumOrderQuantity: number
  preferredPaymentMethod?: string
}

export type CategoriesData = {
  categories: string[]
  notes?: string
}

export type DocumentRecord = {
  id: string
  name: string
  type: "w9" | "coi" | "food_safety" | "other"
  uploadedAt: string
}

export type VendorApplication = {
  id: string
  ownerEmail: string
  status: ApplicationStatus
  currentStep: number
  legalName: string | null
  companyData: CompanyData
  contactData: ContactData
  addressData: AddressData
  paymentData: PaymentData
  categoriesData: CategoriesData
  documentsData: DocumentRecord[]
  submittedAt: string | null
  reviewedAt: string | null
  reviewerEmail: string | null
  reviewerNotes: string | null
  promotedVendorId: string | null
  createdAt: string
  updatedAt: string
}

export const ONBOARDING_STEPS = [
  { id: 1, key: "company", title: "Company", description: "Legal entity details" },
  { id: 2, key: "contact", title: "Contact", description: "Primary contact person" },
  { id: 3, key: "address", title: "Address", description: "Business location" },
  { id: 4, key: "payment", title: "Payment", description: "Terms and ordering" },
  { id: 5, key: "categories", title: "Categories", description: "Product categories supplied" },
  { id: 6, key: "documents", title: "Documents", description: "Compliance uploads" },
  { id: 7, key: "review", title: "Review", description: "Verify your application" },
  { id: 8, key: "submit", title: "Submit", description: "Send for approval" },
] as const

export type StepKey = (typeof ONBOARDING_STEPS)[number]["key"]
