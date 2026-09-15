import "server-only"

import { Pool, type QueryResultRow } from "pg"

import { getDatabaseUrl } from "@/lib/env"
import { pgPoolConnectionOptions } from "@workspace/vendor-onboarding/pg-connection"

const globalForPg = globalThis as unknown as { pgPool?: Pool }

function getPool() {
  if (!globalForPg.pgPool) {
    globalForPg.pgPool = new Pool({
      ...pgPoolConnectionOptions(getDatabaseUrl()),
      max: 10,
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
