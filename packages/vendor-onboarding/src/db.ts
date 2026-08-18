import { Pool, type QueryResultRow } from "pg"

const globalForPg = globalThis as unknown as { onboardingPool?: Pool }

export function getPool() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error("DATABASE_URL is required")
  }

  if (!globalForPg.onboardingPool) {
    globalForPg.onboardingPool = new Pool({ connectionString: url, max: 10 })
  }

  return globalForPg.onboardingPool
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
) {
  return getPool().query<T>(text, params)
}
