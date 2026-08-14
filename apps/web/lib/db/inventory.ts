import "server-only"

import { query } from "@/lib/db"
import { mapInventory, type InventoryRow } from "@/lib/db/mappers"
import type { InventoryRecord } from "@/lib/types"

export async function listInventory(): Promise<InventoryRecord[]> {
  const result = await query<InventoryRow>(
    `SELECT * FROM inventory ORDER BY inventory_id`
  )
  return result.rows.map(mapInventory)
}

export async function getInventoryRecord(
  id: string
): Promise<InventoryRecord | undefined> {
  const result = await query<InventoryRow>(
    `SELECT * FROM inventory WHERE inventory_id = $1`,
    [id]
  )
  const row = result.rows[0]
  return row ? mapInventory(row) : undefined
}

export async function getInventoryByStore(
  storeId: string
): Promise<InventoryRecord[]> {
  const result = await query<InventoryRow>(
    `SELECT * FROM inventory WHERE store_id = $1 ORDER BY sku`,
    [storeId]
  )
  return result.rows.map(mapInventory)
}

export async function createInventoryRecord(
  record: InventoryRecord
): Promise<InventoryRecord> {
  await query(
    `INSERT INTO inventory (
      inventory_id, store_id, sku, current_quantity, unit_of_measure,
      last_count_date, next_count_date
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      record.inventoryId,
      record.storeId,
      record.sku,
      record.currentQuantity,
      record.unitOfMeasure,
      record.lastCountDate.slice(0, 10),
      record.nextCountDate.slice(0, 10),
    ]
  )
  return record
}

export async function updateInventoryRecord(
  id: string,
  updates: Partial<InventoryRecord>
): Promise<InventoryRecord | undefined> {
  const existing = await getInventoryRecord(id)
  if (!existing) return undefined

  const merged = { ...existing, ...updates }

  await query(
    `UPDATE inventory SET
      store_id = $2, sku = $3, current_quantity = $4, unit_of_measure = $5,
      last_count_date = $6, next_count_date = $7, updated_at = CURRENT_TIMESTAMP
    WHERE inventory_id = $1`,
    [
      id,
      merged.storeId,
      merged.sku,
      merged.currentQuantity,
      merged.unitOfMeasure,
      merged.lastCountDate.slice(0, 10),
      merged.nextCountDate.slice(0, 10),
    ]
  )

  return getInventoryRecord(id)
}

export async function getNextInventoryId(): Promise<string> {
  const result = await query<{ inventory_id: string }>(
    `SELECT inventory_id FROM inventory WHERE inventory_id ~ '^INV[0-9]+$' ORDER BY inventory_id DESC LIMIT 1`
  )
  const last = result.rows[0]?.inventory_id
  if (!last) return "INV001"
  const num = parseInt(last.replace("INV", ""), 10) + 1
  return `INV${String(num).padStart(3, "0")}`
}
