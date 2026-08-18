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
