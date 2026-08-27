import "server-only"

import { Pool, type QueryResultRow } from "pg"

import { getDatabaseUrl } from "@/lib/env"

const globalForPg = globalThis as unknown as { pgPool?: Pool }

function sslConfig(connectionString: string) {
  if (/sslmode=disable/i.test(connectionString)) return undefined
  if (/(localhost|127\.0\.0\.1)/i.test(connectionString)) return undefined
  return { rejectUnauthorized: false }
}

function getPool() {
  if (!globalForPg.pgPool) {
    const connectionString = getDatabaseUrl()
    globalForPg.pgPool = new Pool({
      connectionString,
      max: 10,
      ssl: sslConfig(connectionString),
    })
  }

  return globalForPg.pgPool
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
) {
  try {
    return await getPool().query<T>(text, params)
  } catch (error) {
    console.error("Database query error:", { text, error })
    throw error
  }
}

export function getPoolInstance() {
  return getPool()
}
