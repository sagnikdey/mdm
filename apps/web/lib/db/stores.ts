import "server-only"

import { query } from "@/lib/db"
import {
  mapOperatingHours,
  mapStore,
  type OperatingHoursRow,
  type StoreRow,
} from "@/lib/db/mappers"
import type { Store } from "@/lib/types"

async function getOperatingHours(storeId: string): Promise<OperatingHoursRow[]> {
  const result = await query<OperatingHoursRow>(
    `SELECT day_name, hours FROM operating_hours WHERE store_id = $1 ORDER BY hours_id`,
    [storeId]
  )
  return result.rows
}

export async function listStores(): Promise<Store[]> {
  const result = await query<StoreRow>(
    `SELECT * FROM stores ORDER BY store_name`
  )

  return Promise.all(
    result.rows.map(async (row) => {
      const hours = await getOperatingHours(row.store_id)
      return mapStore(row, hours)
    })
  )
}

export async function getStore(id: string): Promise<Store | undefined> {
  const result = await query<StoreRow>(`SELECT * FROM stores WHERE store_id = $1`, [
    id,
  ])
  const row = result.rows[0]
  if (!row) return undefined

  const hours = await getOperatingHours(id)
  return mapStore(row, hours)
}

export async function createStore(store: Store): Promise<Store> {
  await query(
    `INSERT INTO stores (
      store_id, store_name, address, city, state, zip_code, region, store_type,
      square_footage, manager, manager_phone, is_active
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
    [
      store.storeId,
      store.storeName,
      store.address,
      store.city,
      store.state,
      store.zipCode,
      store.region,
      store.storeType,
      store.squareFootage,
      store.manager,
      store.managerPhone,
      store.isActive,
    ]
  )

  for (const [dayName, hours] of Object.entries(store.operatingHours)) {
    await query(
      `INSERT INTO operating_hours (store_id, day_name, hours) VALUES ($1, $2, $3)`,
      [store.storeId, dayName, hours]
    )
  }

  return store
}

export async function updateStore(
  id: string,
  updates: Partial<Store>
): Promise<Store | undefined> {
  const existing = await getStore(id)
  if (!existing) return undefined

  const merged = { ...existing, ...updates }

  await query(
    `UPDATE stores SET
      store_name = $2, address = $3, city = $4, state = $5, zip_code = $6,
      region = $7, store_type = $8, square_footage = $9, manager = $10,
      manager_phone = $11, is_active = $12, updated_at = CURRENT_TIMESTAMP
    WHERE store_id = $1`,
    [
      id,
      merged.storeName,
      merged.address,
      merged.city,
      merged.state,
      merged.zipCode,
      merged.region,
      merged.storeType,
      merged.squareFootage,
      merged.manager,
      merged.managerPhone,
      merged.isActive,
    ]
  )

  if (updates.operatingHours) {
    await query(`DELETE FROM operating_hours WHERE store_id = $1`, [id])
    for (const [dayName, hours] of Object.entries(merged.operatingHours)) {
      await query(
        `INSERT INTO operating_hours (store_id, day_name, hours) VALUES ($1, $2, $3)`,
        [id, dayName, hours]
      )
    }
  }

  return getStore(id)
}

export async function deleteStore(id: string): Promise<void> {
  await query(`DELETE FROM stores WHERE store_id = $1`, [id])
}

export async function getNextStoreId(): Promise<string> {
  const result = await query<{ store_id: string }>(
    `SELECT store_id FROM stores WHERE store_id ~ '^STR[0-9]+$' ORDER BY store_id DESC LIMIT 1`
  )
  const last = result.rows[0]?.store_id
  if (!last) return "STR001"
  const num = parseInt(last.replace("STR", ""), 10) + 1
  return `STR${String(num).padStart(3, "0")}`
}

export { mapOperatingHours }
