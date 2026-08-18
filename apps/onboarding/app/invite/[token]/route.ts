import { NextResponse } from "next/server"
import {
  createApplication,
  getInvitationByTokenHash,
  hashToken,
  updateInvitation,
} from "@workspace/vendor-onboarding"

import { applyVendorSessionCookie } from "@/lib/session"

type RouteParams = { params: Promise<{ token: string }> }

export async function GET(request: Request, { params }: RouteParams) {
  const { token } = await params
  const tokenHash = hashToken(token)
  const invite = await getInvitationByTokenHash(tokenHash)
  const origin = new URL(request.url).origin

  if (!invite) {
    return NextResponse.redirect(`${origin}/expired?reason=invalid`)
  }

  if (invite.status === "revoked") {
    return NextResponse.redirect(`${origin}/expired?reason=revoked`)
  }

  if (invite.status === "redeemed") {
    if (invite.applicationId) {
      const response = NextResponse.redirect(`${origin}/onboarding`)
      return applyVendorSessionCookie(response, {
        email: invite.invitedEmail,
        applicationId: invite.applicationId,
      })
    }
    return NextResponse.redirect(`${origin}/expired?reason=used`)
  }

  if (new Date(invite.expiresAt) < new Date()) {
    await updateInvitation(invite.id, { status: "expired" })
    return NextResponse.redirect(`${origin}/expired?reason=expired`)
  }

  const application = await createApplication(
    invite.invitedEmail,
    invite.invitedCompany ?? undefined
  )

  await updateInvitation(invite.id, {
    status: "redeemed",
    applicationId: application.id,
    redeemedAt: new Date(),
  })

  const response = NextResponse.redirect(`${origin}/onboarding`)
  return applyVendorSessionCookie(response, {
    email: invite.invitedEmail,
    applicationId: application.id,
  })
}
