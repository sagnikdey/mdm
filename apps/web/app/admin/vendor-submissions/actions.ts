"use server"

import {
  getProductSubmission,
  getProfileEdit,
  getVendorUpdatedAt,
  listAllPendingInboxItems,
  listCategoriesByIds,
  promoteProductSubmission,
  promoteProfileEdit,
  rejectProductSubmission,
  rejectProfileEdit,
  updatePortalAccountCategories,
} from "@workspace/vendor-onboarding"

import { requireStaff } from "@/lib/staff"

export async function fetchPendingSubmissions() {
  await requireStaff()
  return listAllPendingInboxItems()
}

export async function fetchProfileEditReview(id: string) {
  await requireStaff()
  const edit = await getProfileEdit(id)
  if (!edit) throw new Error("Profile edit not found")
  const vendorUpdatedAt = await getVendorUpdatedAt(edit.vendorId)
  const hasConflict = Boolean(
    vendorUpdatedAt &&
      new Date(vendorUpdatedAt).getTime() > new Date(edit.createdAt).getTime()
  )
  return { edit, vendorUpdatedAt, hasConflict }
}

export async function approveProfileEdit(id: string, notes?: string) {
  const staff = await requireStaff()
  return promoteProfileEdit({
    editId: id,
    reviewerEmail: staff.email,
    reviewNote: notes,
  })
}

export async function rejectPendingProfileEdit(id: string, notes?: string) {
  const staff = await requireStaff()
  return rejectProfileEdit({
    editId: id,
    reviewerEmail: staff.email,
    reviewNote: notes,
  })
}

export async function fetchProductSubmissionReview(id: string) {
  await requireStaff()
  const submission = await getProductSubmission(id)
  if (!submission) throw new Error("Product submission not found")
  const categoryIds = submission.items
    .map((item) => item.categoryId)
    .filter((value): value is string => Boolean(value))
  const categories = await listCategoriesByIds([...new Set(categoryIds)])
  return { submission, categories }
}

export async function approveProductSubmission(id: string, notes?: string) {
  const staff = await requireStaff()
  return promoteProductSubmission({
    submissionId: id,
    reviewerEmail: staff.email,
    reviewNote: notes,
  })
}

export async function rejectPendingProductSubmission(id: string, notes?: string) {
  const staff = await requireStaff()
  return rejectProductSubmission({
    submissionId: id,
    reviewerEmail: staff.email,
    reviewNote: notes,
  })
}

export async function saveVendorAllowedCategories(
  vendorId: string,
  allowedCategoryIds: string[]
) {
  await requireStaff()
  const account = await updatePortalAccountCategories(
    vendorId,
    allowedCategoryIds
  )
  if (!account) throw new Error("Portal account not found")
  return account
}
