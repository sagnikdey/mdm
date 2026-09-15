import "server-only"

import { resolveDatabaseUrl } from "@workspace/vendor-onboarding/pg-connection"

export function getDatabaseUrl(): string {
  try {
    return resolveDatabaseUrl()
  } catch {
    throw new Error(
      "DATABASE_URL is not set. Add it to apps/web/.env.local or connect Neon on Vercel (see MDM-Database-Implementation-Guide.md)."
    )
  }
}
