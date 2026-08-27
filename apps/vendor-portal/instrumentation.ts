export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return

  const { ensurePortalSchema } = await import("@workspace/vendor-onboarding")

  try {
    await ensurePortalSchema()
  } catch (error) {
    console.error("[vendor-portal] Failed to ensure portal schema:", error)
  }
}
