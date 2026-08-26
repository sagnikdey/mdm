import "server-only"

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

function sslConfig(connectionString: string) {
  if (/sslmode=disable/i.test(connectionString)) return undefined
  if (/(localhost|127\.0\.0\.1)/i.test(connectionString)) return undefined
  return { rejectUnauthorized: false }
}

export function getPool() {
  if (!globalForPg.onboardingPool) {
    const connectionString = getDatabaseUrl()
    globalForPg.onboardingPool = new Pool({
      connectionString,
      max: 10,
      ssl: sslConfig(connectionString),
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

export async function withTransaction<T>(
  fn: (txQuery: typeof query) => Promise<T>
): Promise<T> {
  const client = await getPool().connect()
  const txQuery: typeof query = (text, params) => client.query(text, params)
  try {
    await client.query("BEGIN")
    const result = await fn(txQuery)
    await client.query("COMMIT")
    return result
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
  }
}
