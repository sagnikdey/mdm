"use server"

import {
  createInvitation,
  createPortalAccount,
  ensurePortalSchema,
  generateRawToken,
  hashToken,
  issuePortalLoginToken,
  listApplications,
  getApplication,
  getPortalAccountByVendorId,
  isMissingRelation,
  portalActionError,
  reviewApplication,
  resolveAllowedCategoryIds,
  countApplicationsByStatus,
  listInvitations,
  revokeInvitation,
} from "@workspace/vendor-onboarding"

import { sendInvitationEmail, sendPortalWelcomeEmail } from "@/lib/email"
import { getVendorPortalUrl } from "@/lib/portal-url"
import { requireStaff } from "@/lib/staff"
import { createVendor, getNextVendorId } from "@/lib/db/vendors"
import type { Vendor } from "@/lib/types"

const ONBOARDING_APP_URL =
  process.env.ONBOARDING_APP_URL ?? "http://localhost:3001"

async function issuePortalWelcome(input: {
  vendorId: string
  email: string
  categoryNames?: string[]
}) {
  const allowedCategoryIds = await resolveAllowedCategoryIds(
    input.categoryNames ?? []
  )
  const account = await createPortalAccount({
    vendorId: input.vendorId,
    email: input.email,
    allowedCategoryIds,
  })
  const { rawToken, expiresAt } = await issuePortalLoginToken({
    accountId: account.id,
    purpose: "welcome",
    ttlMs: 14 * 24 * 60 * 60 * 1000,
  })
  const loginUrl = `${getVendorPortalUrl()}/auth/verify?token=${rawToken}`
  await sendPortalWelcomeEmail({
    to: account.email,
    loginUrl,
    expiresAt,
  })
  return loginUrl
}

export async function createVendorInvitation(input: {
  email: string
  company?: string
}) {
  const staff = await requireStaff()
  const rawToken = generateRawToken()
  const tokenHash = hashToken(rawToken)

  await createInvitation({
    tokenHash,
    invitedEmail: input.email,
    invitedCompany: input.company,
    invitedByEmail: staff.email,
  })

  const inviteUrl = `${ONBOARDING_APP_URL}/invite/${rawToken}`
  const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)

  await sendInvitationEmail({
    to: input.email,
    company: input.company,
    inviteUrl,
    expiresAt,
  })

  return { ok: true as const, inviteUrl }
}

export async function fetchInvitations() {
  await requireStaff()
  return listInvitations()
}

export async function revokeVendorInvitation(id: string) {
  await requireStaff()
  await revokeInvitation(id)
  return { ok: true as const }
}

export async function fetchApplications(status?: string) {
  await requireStaff()
  if (!status || status === "all") return listApplications()
  return listApplications(status as Parameters<typeof listApplications>[0])
}

export async function fetchApplicationCounts() {
  await requireStaff()
  return countApplicationsByStatus()
}

export async function fetchApplication(id: string) {
  await requireStaff()
  const application = await getApplication(id)
  if (!application) throw new Error("Application not found")
  return application
}

export async function approveVendorApplication(id: string, notes?: string) {
  const staff = await requireStaff()
  const application = await getApplication(id)
  if (!application) throw new Error("Application not found")

  const vendorId = await getNextVendorId()
  const address = [
    application.addressData.street,
    application.addressData.city,
    application.addressData.state,
    application.addressData.zipCode,
  ]
    .filter(Boolean)
    .join(", ")

  const vendor: Vendor = {
    vendorId,
    vendorName: application.companyData.legalName || application.legalName || "New Vendor",
    vendorCategory: application.companyData.vendorCategory,
    contactPerson: application.contactData.contactPerson,
    email: application.contactData.email,
    phone: application.contactData.phone,
    address,
    paymentTerms: application.paymentData.paymentTerms,
    minimumOrderQuantity: application.paymentData.minimumOrderQuantity,
    isActive: true,
  }

  await createVendor(vendor)

  let welcomeUrl: string | null = null
  try {
    const portalEmail =
      application.ownerEmail || application.contactData.email
    if (portalEmail) {
      welcomeUrl = await issuePortalWelcome({
        vendorId,
        email: portalEmail,
        categoryNames: application.categoriesData?.categories ?? [],
      })
    }
  } catch (error) {
    console.error("[vendor-portal-welcome] skipped portal handoff", error)
  }

  const applicationResult = await reviewApplication(id, {
    status: "approved",
    reviewerEmail: staff.email,
    reviewerNotes: notes,
    promotedVendorId: vendorId,
  })

  return { ...applicationResult, welcomeUrl }
}

async function grantPortalAccessOnce(vendorId: string, email: string) {
  const existing = await getPortalAccountByVendorId(vendorId)
  if (existing) {
    const { rawToken, expiresAt } = await issuePortalLoginToken({
      accountId: existing.id,
      purpose: "welcome",
      ttlMs: 14 * 24 * 60 * 60 * 1000,
    })
    const loginUrl = `${getVendorPortalUrl()}/auth/verify?token=${rawToken}`
    await sendPortalWelcomeEmail({
      to: existing.email,
      loginUrl,
      expiresAt,
    })
    return { ok: true as const, loginUrl }
  }

  const loginUrl = await issuePortalWelcome({ vendorId, email })
  return { ok: true as const, loginUrl }
}

export async function grantVendorPortalAccess(vendorId: string, email: string) {
  await requireStaff()
  if (!email.trim()) {
    throw new Error("This vendor has no email. Add one before granting portal access.")
  }

  try {
    return await grantPortalAccessOnce(vendorId, email)
  } catch (error) {
    if (isMissingRelation(error)) {
      try {
        await ensurePortalSchema()
        return await grantPortalAccessOnce(vendorId, email)
      } catch (retryError) {
        throw portalActionError(retryError)
      }
    }
    throw portalActionError(error)
  }
}

export async function rejectVendorApplication(id: string, notes?: string) {
  const staff = await requireStaff()
  return reviewApplication(id, {
    status: "rejected",
    reviewerEmail: staff.email,
    reviewerNotes: notes,
  })
}

export async function requestVendorApplicationInfo(id: string, notes?: string) {
  const staff = await requireStaff()
  return reviewApplication(id, {
    status: "needs_info",
    reviewerEmail: staff.email,
    reviewerNotes: notes,
  })
}

export async function markApplicationUnderReview(id: string) {
  const staff = await requireStaff()
  return reviewApplication(id, {
    status: "under_review",
    reviewerEmail: staff.email,
  })
}
