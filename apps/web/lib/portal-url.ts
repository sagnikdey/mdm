const PRODUCTION_PORTAL_URL = "https://mdm-vendor-portal.vercel.app"

export function getVendorPortalUrl() {
  const fromEnv = process.env.VENDOR_PORTAL_URL?.trim().replace(/\/$/, "")
  if (fromEnv) return fromEnv
  if (process.env.VERCEL) return PRODUCTION_PORTAL_URL
  return "http://localhost:3002"
}
