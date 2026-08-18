"use server"

import {
  createInvitation,
  generateRawToken,
  hashToken,
  listApplications,
  getApplication,
  reviewApplication,
  countApplicationsByStatus,
  listInvitations,
  revokeInvitation,
} from "@workspace/vendor-onboarding"

import { sendInvitationEmail } from "@/lib/email"
import { requireStaff } from "@/lib/staff"
import { createVendor, getNextVendorId } from "@/lib/db/vendors"
import type { Vendor } from "@/lib/types"

const ONBOARDING_APP_URL =
  process.env.ONBOARDING_APP_URL ?? "http://localhost:3001"

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

  return reviewApplication(id, {
    status: "approved",
    reviewerEmail: staff.email,
    reviewerNotes: notes,
    promotedVendorId: vendorId,
  })
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
