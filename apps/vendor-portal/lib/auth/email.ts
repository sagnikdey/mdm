export async function sendPortalLoginEmail(input: {
  to: string
  loginUrl: string
  expiresAt: Date
  purpose: "login" | "welcome"
}) {
  console.log("[vendor-portal-login]", {
    to: input.to,
    purpose: input.purpose,
    loginUrl: input.loginUrl,
    expiresAt: input.expiresAt.toISOString(),
  })
}
