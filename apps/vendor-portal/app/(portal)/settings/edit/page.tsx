import { redirect } from "next/navigation"

import {
  getPendingProfileEdit,
  getVendorSnapshot,
} from "@workspace/vendor-onboarding"

import { ProfileEditForm } from "@/app/(portal)/settings/edit/profile-edit-form"
import { requireVendorSession } from "@/lib/auth/session"

export default async function SettingsEditPage() {
  const session = await requireVendorSession()
  const [profile, pendingEdit] = await Promise.all([
    getVendorSnapshot(session.vendorId),
    getPendingProfileEdit(session.vendorId),
  ])

  if (!profile) redirect("/settings")
  if (pendingEdit) redirect("/settings")

  return <ProfileEditForm profile={profile} />
}
