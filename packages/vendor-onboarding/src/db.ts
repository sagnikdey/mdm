import "server-only"

import { Pool, type QueryResultRow } from "pg"

import { pgPoolConnectionOptions, resolveDatabaseUrl } from "./pg-connection"

const globalForPg = globalThis as unknown as { onboardingPool?: Pool }

export function getPool() {
  if (!globalForPg.onboardingPool) {
    globalForPg.onboardingPool = new Pool({
      ...pgPoolConnectionOptions(resolveDatabaseUrl()),
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
