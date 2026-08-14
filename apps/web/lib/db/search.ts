import "server-only"

import { query } from "@/lib/db"
import type { EntityType, SearchResult } from "@/lib/types"

type SearchRow = {
  type: EntityType
  id: string
  title: string
  subtitle: string
}

export async function universalSearch(searchQuery: string): Promise<SearchResult[]> {
  const trimmed = searchQuery.trim()
  if (!trimmed) return []

  const searchTerm = `%${trimmed}%`

  const result = await query<SearchRow>(
    `
    SELECT 'store'::text AS type, store_id AS id, store_name AS title,
           city || ', ' || state AS subtitle
    FROM stores
    WHERE store_name ILIKE $1 OR city ILIKE $1 OR region ILIKE $1 OR manager ILIKE $1
    UNION ALL
    SELECT 'vendor'::text, vendor_id, vendor_name, COALESCE(email, '')
    FROM vendors
    WHERE vendor_name ILIKE $1 OR email ILIKE $1 OR contact_person ILIKE $1
    UNION ALL
    SELECT 'product'::text, sku, product_name, sku
    FROM products
    WHERE product_name ILIKE $1 OR sku ILIKE $1 OR barcode ILIKE $1
    UNION ALL
    SELECT 'inventory'::text, inventory_id, 'Inventory: ' || sku,
           store_id || ' • Qty ' || current_quantity::text
    FROM inventory
    WHERE sku ILIKE $1 OR store_id ILIKE $1
    ORDER BY type, title
    LIMIT 20
    `,
    [searchTerm]
  )

  return result.rows.map((row, index) => ({
    id: row.id,
    type: row.type,
    title: row.title,
    subtitle: row.subtitle,
    data: { id: row.id, type: row.type },
    matchedFields: [trimmed],
    relevanceScore: 20 - index,
  }))
}
