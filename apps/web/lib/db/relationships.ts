import "server-only"

import { query } from "@/lib/db"
import {
  mapAvailability,
  mapRelationship,
  type AvailabilityRow,
  type RelationshipRow,
} from "@/lib/db/mappers"
import type {
  StoreProductAvailability,
  StoreVendorRelationship,
} from "@/lib/types"

export async function listRelationships(): Promise<StoreVendorRelationship[]> {
  const result = await query<RelationshipRow>(
    `SELECT * FROM store_vendor_relationships ORDER BY relationship_id`
  )
  return result.rows.map(mapRelationship)
}

export async function getRelationshipsByStore(
  storeId: string
): Promise<StoreVendorRelationship[]> {
  const result = await query<RelationshipRow>(
    `SELECT * FROM store_vendor_relationships WHERE store_id = $1`,
    [storeId]
  )
  return result.rows.map(mapRelationship)
}

export async function getRelationshipsByVendor(
  vendorId: string
): Promise<StoreVendorRelationship[]> {
  const result = await query<RelationshipRow>(
    `SELECT * FROM store_vendor_relationships WHERE vendor_id = $1`,
    [vendorId]
  )
  return result.rows.map(mapRelationship)
}

export async function listAvailability(): Promise<StoreProductAvailability[]> {
  const result = await query<AvailabilityRow>(
    `SELECT * FROM store_product_availability ORDER BY availability_id`
  )
  return result.rows.map(mapAvailability)
}

export async function getAvailabilityByStore(
  storeId: string
): Promise<StoreProductAvailability[]> {
  const result = await query<AvailabilityRow>(
    `SELECT * FROM store_product_availability WHERE store_id = $1`,
    [storeId]
  )
  return result.rows.map(mapAvailability)
}

export async function getAvailabilityBySku(
  sku: string
): Promise<StoreProductAvailability[]> {
  const result = await query<AvailabilityRow>(
    `SELECT * FROM store_product_availability WHERE sku = $1`,
    [sku]
  )
  return result.rows.map(mapAvailability)
}
