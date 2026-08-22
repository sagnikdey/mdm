export async function sendPortalWelcomeEmail(input: {
  to: string
  loginUrl: string
  expiresAt: Date
}) {
  console.log("[vendor-portal-welcome]", {
    to: input.to,
    loginUrl: input.loginUrl,
    expiresAt: input.expiresAt.toISOString(),
  })
}

export async function sendInvitationEmail(input: {
  to: string
  company?: string
  inviteUrl: string
  expiresAt: Date
}) {
  console.log("[vendor-invite]", {
    to: input.to,
    company: input.company,
    inviteUrl: input.inviteUrl,
    expiresAt: input.expiresAt.toISOString(),
  })
}
