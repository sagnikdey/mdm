import type {
  AddressData,
  ApplicationStatus,
  CategoriesData,
  CompanyData,
  ContactData,
  DocumentRecord,
  InvitationStatus,
  PaymentData,
  VendorApplication,
  VendorInvitation,
} from "./types"

type InvitationRow = {
  id: string
  token_hash: string
  invited_email: string
  invited_company: string | null
  status: InvitationStatus
  expires_at: Date | string
  invited_by_email: string
  application_id: string | null
  redeemed_at: Date | string | null
  created_at: Date | string
}

type ApplicationRow = {
  id: string
  owner_email: string
  status: ApplicationStatus
  current_step: number
  legal_name: string | null
  company_data: CompanyData
  contact_data: ContactData
  address_data: AddressData
  payment_data: PaymentData
  categories_data: CategoriesData
  documents_data: DocumentRecord[]
  submitted_at: Date | string | null
  reviewed_at: Date | string | null
  reviewer_email: string | null
  reviewer_notes: string | null
  promoted_vendor_id: string | null
  created_at: Date | string
  updated_at: Date | string
}

function toIso(value: Date | string | null | undefined): string | null {
  if (!value) return null
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString()
}

export function mapInvitation(row: InvitationRow): VendorInvitation {
  return {
    id: row.id,
    tokenHash: row.token_hash,
    invitedEmail: row.invited_email,
    invitedCompany: row.invited_company,
    status: row.status,
    expiresAt: toIso(row.expires_at)!,
    invitedByEmail: row.invited_by_email,
    applicationId: row.application_id,
    redeemedAt: toIso(row.redeemed_at),
    createdAt: toIso(row.created_at)!,
  }
}

function normalizeCompany(data: Partial<CompanyData> | null | undefined): CompanyData {
  return {
    legalName: data?.legalName ?? "",
    dbaName: data?.dbaName,
    taxId: data?.taxId,
    vendorCategory: data?.vendorCategory ?? "beverages",
    website: data?.website,
  }
}

function normalizeContact(
  data: Partial<ContactData> | null | undefined,
  ownerEmail: string
): ContactData {
  return {
    contactPerson: data?.contactPerson ?? "",
    email: data?.email ?? ownerEmail,
    phone: data?.phone ?? "",
    title: data?.title,
  }
}

function normalizeAddress(data: Partial<AddressData> | null | undefined): AddressData {
  return {
    street: data?.street ?? "",
    city: data?.city ?? "",
    state: data?.state ?? "",
    zipCode: data?.zipCode ?? "",
    country: data?.country,
  }
}

function normalizePayment(data: Partial<PaymentData> | null | undefined): PaymentData {
  return {
    paymentTerms: data?.paymentTerms ?? "Net 30",
    minimumOrderQuantity: data?.minimumOrderQuantity ?? 1,
    preferredPaymentMethod: data?.preferredPaymentMethod,
  }
}

function normalizeCategories(
  data: Partial<CategoriesData> | null | undefined
): CategoriesData {
  return {
    categories: Array.isArray(data?.categories) ? data.categories : [],
    notes: data?.notes,
  }
}

export function mapApplication(row: ApplicationRow): VendorApplication {
  return {
    id: row.id,
    ownerEmail: row.owner_email,
    status: row.status,
    currentStep: row.current_step,
    legalName: row.legal_name,
    companyData: normalizeCompany(row.company_data),
    contactData: normalizeContact(row.contact_data, row.owner_email),
    addressData: normalizeAddress(row.address_data),
    paymentData: normalizePayment(row.payment_data),
    categoriesData: normalizeCategories(row.categories_data),
    documentsData: Array.isArray(row.documents_data) ? row.documents_data : [],
    submittedAt: toIso(row.submitted_at),
    reviewedAt: toIso(row.reviewed_at),
    reviewerEmail: row.reviewer_email,
    reviewerNotes: row.reviewer_notes,
    promotedVendorId: row.promoted_vendor_id,
    createdAt: toIso(row.created_at)!,
    updatedAt: toIso(row.updated_at)!,
  }
}

export type { InvitationRow, ApplicationRow }
