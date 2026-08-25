import "server-only"

import { query } from "@/lib/db"
import { mapProduct, type ProductRow } from "@/lib/db/mappers"
import type { Product } from "@/lib/types"

export async function listProducts(): Promise<Product[]> {
  const result = await query<ProductRow>(
    `SELECT * FROM products ORDER BY product_name`
  )
  return result.rows.map(mapProduct)
}

export async function getProduct(sku: string): Promise<Product | undefined> {
  const result = await query<ProductRow>(`SELECT * FROM products WHERE sku = $1`, [
    sku,
  ])
  const row = result.rows[0]
  return row ? mapProduct(row) : undefined
}

export async function createProduct(product: Product): Promise<Product> {
  await query(
    `INSERT INTO products (
      sku, product_name, brand, manufacturer, category_id, vendor_id, vendor_sku,
      description, unit_of_measure, units_per_case, wholesale_price, weight,
      weight_unit, barcode, pack_type, pack_size, base_unit_sku, is_active
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
    [
      product.sku,
      product.productName,
      product.brand,
      product.manufacturer,
      product.categoryId,
      product.vendorId,
      product.vendorSku,
      product.description,
      product.unitOfMeasure,
      product.unitsPerCase,
      product.wholesalePrice,
      product.weight,
      product.weightUnit || "lb",
      product.barcode,
      product.packType || "case",
      product.packSize || product.unitsPerCase || 1,
      product.baseUnitSku,
      product.isActive,
    ]
  )
  return product
}

export async function updateProduct(
  sku: string,
  updates: Partial<Product>
): Promise<Product | undefined> {
  const existing = await getProduct(sku)
  if (!existing) return undefined

  const merged = { ...existing, ...updates }

  await query(
    `UPDATE products SET
      product_name = $2, brand = $3, manufacturer = $4, category_id = $5,
      vendor_id = $6, vendor_sku = $7, description = $8, unit_of_measure = $9,
      units_per_case = $10, wholesale_price = $11, weight = $12, weight_unit = $13,
      barcode = $14, pack_type = $15, pack_size = $16, base_unit_sku = $17,
      is_active = $18, updated_at = CURRENT_TIMESTAMP
    WHERE sku = $1`,
    [
      sku,
      merged.productName,
      merged.brand,
      merged.manufacturer,
      merged.categoryId,
      merged.vendorId,
      merged.vendorSku,
      merged.description,
      merged.unitOfMeasure,
      merged.unitsPerCase,
      merged.wholesalePrice,
      merged.weight,
      merged.weightUnit || "lb",
      merged.barcode,
      merged.packType || "case",
      merged.packSize || merged.unitsPerCase || 1,
      merged.baseUnitSku,
      merged.isActive,
    ]
  )

  return getProduct(sku)
}

export async function deleteProduct(sku: string): Promise<void> {
  await query(`DELETE FROM products WHERE sku = $1`, [sku])
}
