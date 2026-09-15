const DATABASE_URL_ENV_KEYS = [
  "DATABASE_URL",
  "POSTGRES_URL",
  "POSTGRES_PRISMA_URL",
] as const

/** Vercel Neon sets POSTGRES_URL; apps expect DATABASE_URL. */
export function resolveDatabaseUrl(): string {
  for (const key of DATABASE_URL_ENV_KEYS) {
    let url = process.env[key]?.trim()
    if (!url) continue
    url = url.replace(/^["']|["']$/g, "")
    if (/^postgres(ql)?:\/\//i.test(url)) return url
  }
  throw new Error("DATABASE_URL is required")
}

export function hasDatabaseUrl(): boolean {
  try {
    resolveDatabaseUrl()
    return true
  } catch {
    return false
  }
}

/** pg v8 / pg-connection-string v2 warns when sslmode is prefer|require|verify-ca without uselibpqcompat. */
const LEGACY_PG_SSLMODE =
  /(?:^|[?&])sslmode=(?:prefer|require|verify-ca)(?:&|$)/i

export function normalizePgConnectionString(connectionString: string): string {
  if (/(?:^|[?&])uselibpqcompat=true(?:&|$)/i.test(connectionString)) {
    return connectionString
  }
  if (/(?:^|[?&])sslmode=verify-full(?:&|$)/i.test(connectionString)) {
    return connectionString
  }
  if (!LEGACY_PG_SSLMODE.test(connectionString)) {
    return connectionString
  }
  const separator = connectionString.includes("?") ? "&" : "?"
  return `${connectionString}${separator}uselibpqcompat=true`
}

export function pgSslConfig(connectionString: string) {
  if (/sslmode=disable/i.test(connectionString)) return undefined
  if (/(localhost|127\.0\.0\.1)/i.test(connectionString)) return undefined
  return { rejectUnauthorized: false as const }
}

export function pgPoolConnectionOptions(connectionString: string) {
  const normalized = normalizePgConnectionString(connectionString)
  return {
    connectionString: normalized,
    ssl: pgSslConfig(normalized),
  }
}
