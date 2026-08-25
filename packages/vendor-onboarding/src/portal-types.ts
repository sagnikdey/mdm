export type PortalAccountStatus = "active" | "suspended"
export type SubmissionStatus = "draft" | "pending" | "approved" | "rejected"
export type LoginTokenPurpose = "login" | "welcome"

export type VendorProfileFields = {
  vendorName: string
  vendorCategory: string
  contactPerson: string
  email: string
  phone: string
  address: string
  paymentTerms: string
  minimumOrderQuantity: number
}

export type VendorPortalAccount = {
  id: string
  vendorId: string
  email: string
  status: PortalAccountStatus
  allowedCategoryIds: string[]
  lastLoginAt: string | null
  createdAt: string
}

export type VendorPortalLoginToken = {
  id: string
  accountId: string
  tokenHash: string
  purpose: LoginTokenPurpose
  expiresAt: string
  usedAt: string | null
  requestedFromIp: string | null
  createdAt: string
}

export type VendorSubmissionInboxItem = {
  id: string
  type: "profile_edit" | "product_submission"
  vendorId: string
  vendorName: string
  submittedBy: string
  createdAt: string
  href: string
}

export type CatalogProduct = {
  sku: string
  productName: string
  brand: string
  manufacturer: string
  categoryId: string
  categoryName: string
  vendorSku: string
  description: string
  unitOfMeasure: string
  unitsPerCase: number
  wholesalePrice: number
  weight: number
  weightUnit: string
  barcode: string
  packType: string
  packSize: number
  baseUnitSku: string | null
  isActive: boolean
}

export type ProductSubmissionItem = {
  id: number
  submissionId: string
  proposedSku: string
  productName: string
  brand: string
  manufacturer: string
  categoryId: string | null
  vendorSku: string
  description: string
  unitOfMeasure: string
  unitsPerCase: number
  wholesalePrice: number
  weight: number
  weightUnit: string
  barcode: string
  noBarcode: boolean
  packType: string
  packSize: number
  baseUnitVendorSku: string
  itemStatus: SubmissionStatus
  itemNote: string | null
  createdSku: string | null
  errors: string[]
}

export type ProductSubmission = {
  id: string
  vendorId: string
  submittedBy: string
  source: string
  status: SubmissionStatus
  itemCount: number
  reviewNote: string | null
  reviewedBy: string | null
  reviewedAt: string | null
  createdAt: string
  items: ProductSubmissionItem[]
}

export type CatalogCategory = {
  categoryId: string
  categoryName: string
}

export type VendorProfileEdit = {
  id: string
  vendorId: string
  submittedBy: string
  proposedChanges: Partial<VendorProfileFields>
  currentSnapshot: VendorProfileFields
  status: SubmissionStatus
  reviewNote: string | null
  reviewedBy: string | null
  reviewedAt: string | null
  createdAt: string
}
