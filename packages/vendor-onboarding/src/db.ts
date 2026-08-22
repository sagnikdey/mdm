import { Pool, type QueryResultRow } from "pg"

const globalForPg = globalThis as unknown as { onboardingPool?: Pool }

function getDatabaseUrl() {
  const raw = process.env["DATABASE_URL"]?.trim()
  const url = raw?.replace(/^["']|["']$/g, "")
  if (!url) {
    throw new Error("DATABASE_URL is required")
  }
  if (!/^postgres(ql)?:\/\//i.test(url)) {
    throw new Error("DATABASE_URL must be a postgres:// connection string")
  }
  return url
}

export function getPool() {
  if (!globalForPg.onboardingPool) {
    globalForPg.onboardingPool = new Pool({
      connectionString: getDatabaseUrl(),
      max: 10,
    })
  }

  return globalForPg.onboardingPool
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
) {
  return getPool().query<T>(text, params)
}
