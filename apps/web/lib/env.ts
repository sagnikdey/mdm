import "server-only"

export function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL

  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add it to apps/web/.env.local (see MDM-Database-Implementation-Guide.md)."
    )
  }

  return url
}
