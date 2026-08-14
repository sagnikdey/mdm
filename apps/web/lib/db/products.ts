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
      sku, product_name, category_id, vendor_id, vendor_sku, description,
      unit_of_measure, units_per_case, wholesale_price, weight, barcode, is_active
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
    [
      product.sku,
      product.productName,
      product.categoryId,
      product.vendorId,
      product.vendorSku,
      product.description,
      product.unitOfMeasure,
      product.unitsPerCase,
      product.wholesalePrice,
      product.weight,
      product.barcode,
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
      product_name = $2, category_id = $3, vendor_id = $4, vendor_sku = $5,
      description = $6, unit_of_measure = $7, units_per_case = $8,
      wholesale_price = $9, weight = $10, barcode = $11, is_active = $12,
      updated_at = CURRENT_TIMESTAMP
    WHERE sku = $1`,
    [
      sku,
      merged.productName,
      merged.categoryId,
      merged.vendorId,
      merged.vendorSku,
      merged.description,
      merged.unitOfMeasure,
      merged.unitsPerCase,
      merged.wholesalePrice,
      merged.weight,
      merged.barcode,
      merged.isActive,
    ]
  )

  return getProduct(sku)
}

export async function deleteProduct(sku: string): Promise<void> {
  await query(`DELETE FROM products WHERE sku = $1`, [sku])
}
