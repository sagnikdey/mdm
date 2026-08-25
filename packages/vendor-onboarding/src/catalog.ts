import { query, withTransaction } from "./db"
import { ensureProductOnboardingSchema } from "./portal-schema"
import type {
  CatalogCategory,
  CatalogProduct,
  ProductSubmission,
  ProductSubmissionItem,
  SubmissionStatus,
  VendorSubmissionInboxItem,
} from "./portal-types"
import { normalizeProposedProduct } from "./product-fields"

type ProductRow = {
  sku: string
  product_name: string
  brand: string | null
  manufacturer: string | null
  category_id: string
  category_name: string | null
  vendor_sku: string
  description: string | null
  unit_of_measure: string | null
  units_per_case: number | null
  wholesale_price: string | number
  weight: string | number | null
  weight_unit: string | null
  barcode: string | null
  pack_type: string | null
  pack_size: number | null
  base_unit_sku: string | null
  is_active: boolean
}

type ItemRow = {
  id: number
  submission_id: string
  proposed_sku: string
  product_name: string
  brand: string | null
  manufacturer: string | null
  category_id: string | null
  vendor_sku: string
  description: string | null
  unit_of_measure: string | null
  units_per_case: number | null
  wholesale_price: string | number
  weight: string | number | null
  weight_unit: string | null
  barcode: string | null
  no_barcode: boolean | null
  pack_type: string | null
  pack_size: number | null
  base_unit_vendor_sku: string | null
  item_status: SubmissionStatus
  item_note: string | null
  created_sku: string | null
}

type SubmissionRow = {
  id: string
  vendor_id: string
  submitted_by: string
  source: string
  status: SubmissionStatus
  item_count: number
  review_note: string | null
  reviewed_by: string | null
  reviewed_at: Date | string | null
  created_at: Date | string
}

function asIso(value: Date | string | null) {
  if (!value) return null
  return value instanceof Date ? value.toISOString() : value
}

function asNumber(value: string | number | null, fallback = 0) {
  if (value === null || value === undefined) return fallback
  return Number(value)
}

export function mapProduct(row: ProductRow): CatalogProduct {
  return {
    sku: row.sku,
    productName: row.product_name,
    brand: row.brand ?? "",
    manufacturer: row.manufacturer ?? "",
    categoryId: row.category_id,
    categoryName: row.category_name ?? row.category_id,
    vendorSku: row.vendor_sku,
    description: row.description ?? "",
    unitOfMeasure: row.unit_of_measure ?? "",
    unitsPerCase: row.units_per_case ?? 1,
    wholesalePrice: asNumber(row.wholesale_price),
    weight: asNumber(row.weight),
    weightUnit: row.weight_unit ?? "lb",
    barcode: row.barcode ?? "",
    packType: row.pack_type ?? "case",
    packSize: row.pack_size ?? row.units_per_case ?? 1,
    baseUnitSku: row.base_unit_sku,
    isActive: row.is_active,
  }
}

export function mapItem(row: ItemRow): ProductSubmissionItem {
  const proposed = normalizeProposedProduct({
    vendorSku: row.vendor_sku,
    productName: row.product_name,
    brand: row.brand ?? "",
    manufacturer: row.manufacturer ?? "",
    categoryId: row.category_id ?? "",
    description: row.description ?? "",
    unitOfMeasure: row.unit_of_measure ?? "",
    unitsPerCase: asNumber(row.units_per_case, 1),
    wholesalePrice: asNumber(row.wholesale_price),
    weight: asNumber(row.weight),
    weightUnit: row.weight_unit ?? "lb",
    barcode: row.barcode ?? "",
    noBarcode: Boolean(row.no_barcode),
    packType: row.pack_type ?? "case",
    packSize: asNumber(row.pack_size, 1),
    baseUnitVendorSku: row.base_unit_vendor_sku ?? "",
  })

  return {
    id: row.id,
    submissionId: row.submission_id,
    proposedSku: row.proposed_sku,
    productName: proposed.productName,
    brand: proposed.brand,
    manufacturer: proposed.manufacturer,
    categoryId: row.category_id,
    vendorSku: proposed.vendorSku,
    description: proposed.description,
    unitOfMeasure: proposed.unitOfMeasure,
    unitsPerCase: proposed.unitsPerCase,
    wholesalePrice: proposed.wholesalePrice,
    weight: proposed.weight,
    weightUnit: proposed.weightUnit,
    barcode: proposed.barcode,
    noBarcode: proposed.noBarcode,
    packType: proposed.packType,
    packSize: proposed.packSize,
    baseUnitVendorSku: proposed.baseUnitVendorSku,
    itemStatus: row.item_status,
    itemNote: row.item_note,
    createdSku: row.created_sku,
    errors: [],
  }
}

function mapSubmission(
  row: SubmissionRow,
  items: ProductSubmissionItem[]
): ProductSubmission {
  return {
    id: row.id,
    vendorId: row.vendor_id,
    submittedBy: row.submitted_by,
    source: row.source,
    status: row.status,
    itemCount: row.item_count,
    reviewNote: row.review_note,
    reviewedBy: row.reviewed_by,
    reviewedAt: asIso(row.reviewed_at),
    createdAt: asIso(row.created_at) ?? new Date().toISOString(),
    items,
  }
}

export async function listCategoriesByIds(ids: string[]) {
  if (!ids.length) return [] as CatalogCategory[]
  const result = await query<{ category_id: string; category_name: string }>(
    `SELECT category_id, category_name
     FROM categories
     WHERE category_id = ANY($1::text[])
     ORDER BY category_name`,
    [ids]
  )
  return result.rows.map((row) => ({
    categoryId: row.category_id,
    categoryName: row.category_name,
  }))
}

export async function listVendorProducts(vendorId: string) {
  const result = await query<ProductRow>(
    `SELECT p.*, c.category_name
     FROM products p
     LEFT JOIN categories c ON c.category_id = p.category_id
     WHERE p.vendor_id = $1
     ORDER BY p.product_name`,
    [vendorId]
  )
  return result.rows.map(mapProduct)
}

export async function getVendorProduct(vendorId: string, sku: string) {
  const result = await query<ProductRow>(
    `SELECT p.*, c.category_name
     FROM products p
     LEFT JOIN categories c ON c.category_id = p.category_id
     WHERE p.vendor_id = $1 AND p.sku = $2`,
    [vendorId, sku]
  )
  const row = result.rows[0]
  return row ? mapProduct(row) : undefined
}

export async function listPendingCatalogItems(vendorId: string) {
  const result = await query<ItemRow & { created_at: Date | string }>(
    `SELECT i.*, s.created_at
     FROM product_submission_items i
     JOIN product_submissions s ON s.id = i.submission_id
     WHERE s.vendor_id = $1 AND s.status = 'pending' AND i.item_status = 'pending'
     ORDER BY s.created_at DESC`,
    [vendorId]
  )
  return result.rows.map((row) => ({
    ...mapItem(row),
    createdAt: asIso(row.created_at) ?? new Date().toISOString(),
  }))
}

export async function getProductSubmission(id: string) {
  const submission = await query<SubmissionRow>(
    `SELECT * FROM product_submissions WHERE id = $1`,
    [id]
  )
  const row = submission.rows[0]
  if (!row) return undefined

  const items = await query<ItemRow>(
    `SELECT * FROM product_submission_items
     WHERE submission_id = $1
     ORDER BY id`,
    [id]
  )

  return mapSubmission(row, items.rows.map(mapItem))
}

async function nextProductSku(
  txQuery: typeof query
) {
  const result = await txQuery<{ n: number | string | null }>(
    `SELECT COALESCE(MAX(CAST(SUBSTRING(sku FROM 4) AS INT)), 0) + 1 AS n
     FROM products
     WHERE sku ~ '^PRD[0-9]+$'`
  )
  const n = Number(result.rows[0]?.n ?? 1)
  return `PRD${String(n).padStart(3, "0")}`
}

export async function listPendingProductInboxItems(): Promise<
  VendorSubmissionInboxItem[]
> {
  const result = await query<
    SubmissionRow & { vendor_name: string | null }
  >(
    `SELECT s.*, v.vendor_name
     FROM product_submissions s
     LEFT JOIN vendors v ON v.vendor_id = s.vendor_id
     WHERE s.status = 'pending'
     ORDER BY s.created_at ASC`
  )
  return result.rows.map((row) => ({
    id: row.id,
    type: "product_submission" as const,
    vendorId: row.vendor_id,
    vendorName: row.vendor_name ?? row.vendor_id,
    submittedBy: row.submitted_by,
    createdAt: asIso(row.created_at) ?? new Date().toISOString(),
    href: `/admin/vendor-submissions/product-submissions/${row.id}`,
  }))
}

export async function promoteProductSubmission(input: {
  submissionId: string
  reviewerEmail: string
  reviewNote?: string
}) {
  await ensureProductOnboardingSchema()
  return withTransaction(async (txQuery) => {
    const submission = await txQuery<SubmissionRow>(
      `SELECT * FROM product_submissions WHERE id = $1 FOR UPDATE`,
      [input.submissionId]
    )
    const row = submission.rows[0]
    if (!row) throw new Error("Submission not found")
    if (row.status !== "pending") throw new Error("Already reviewed")

    const items = await txQuery<ItemRow>(
      `SELECT * FROM product_submission_items
       WHERE submission_id = $1
       ORDER BY id
       FOR UPDATE`,
      [input.submissionId]
    )

    const created = new Map<string, string>()

    for (const item of items.rows) {
      if (item.item_status !== "pending") continue
      if (!item.category_id) {
        throw new Error(`"${item.product_name}" is missing a category`)
      }

      const skuClash = await txQuery<{ sku: string }>(
        `SELECT sku FROM products WHERE vendor_id = $1 AND lower(vendor_sku) = lower($2)`,
        [row.vendor_id, item.vendor_sku]
      )
      if (skuClash.rows[0]) {
        throw new Error(
          `Vendor SKU "${item.vendor_sku}" already exists as ${skuClash.rows[0].sku}`
        )
      }
      if (item.barcode && !item.no_barcode) {
        const barcodeClash = await txQuery<{ sku: string }>(
          `SELECT sku FROM products
           WHERE vendor_id = $1 AND barcode = $2 AND barcode <> ''`,
          [row.vendor_id, item.barcode]
        )
        if (barcodeClash.rows[0]) {
          throw new Error(
            `Barcode ${item.barcode} already exists on ${barcodeClash.rows[0].sku}`
          )
        }
      }

      const sku = await nextProductSku(txQuery)
      await txQuery(
        `INSERT INTO products (
          sku, product_name, brand, manufacturer, category_id, vendor_id,
          vendor_sku, description, unit_of_measure, units_per_case,
          wholesale_price, weight, weight_unit, barcode, pack_type, pack_size,
          is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, true)`,
        [
          sku,
          item.product_name,
          item.brand,
          item.manufacturer,
          item.category_id,
          row.vendor_id,
          item.vendor_sku,
          item.description,
          item.unit_of_measure,
          item.units_per_case ?? 1,
          item.wholesale_price,
          item.weight,
          item.weight_unit ?? "lb",
          item.no_barcode ? "" : item.barcode,
          item.pack_type ?? "case",
          item.pack_size ?? item.units_per_case ?? 1,
        ]
      )
      created.set(item.vendor_sku.trim().toLowerCase(), sku)
      await txQuery(
        `UPDATE product_submission_items
         SET item_status = 'approved', created_sku = $2
         WHERE id = $1`,
        [item.id, sku]
      )
    }

    for (const item of items.rows) {
      const createdSku = created.get(item.vendor_sku.trim().toLowerCase())
      const baseKey = item.base_unit_vendor_sku?.trim().toLowerCase()
      if (!createdSku || !baseKey) continue
      let baseSku = created.get(baseKey) ?? null
      if (!baseSku) {
        const live = await txQuery<{ sku: string }>(
          `SELECT sku FROM products
           WHERE vendor_id = $1 AND lower(vendor_sku) = $2`,
          [row.vendor_id, baseKey]
        )
        baseSku = live.rows[0]?.sku ?? null
      }
      if (baseSku) {
        await txQuery(
          `UPDATE products SET base_unit_sku = $2 WHERE sku = $1`,
          [createdSku, baseSku]
        )
      }
    }

    await txQuery(
      `UPDATE product_submissions SET
        status = 'approved',
        reviewed_by = $2,
        review_note = $3,
        reviewed_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [input.submissionId, input.reviewerEmail, input.reviewNote ?? null]
    )

    const updatedItems = await txQuery<ItemRow>(
      `SELECT * FROM product_submission_items
       WHERE submission_id = $1
       ORDER BY id`,
      [input.submissionId]
    )

    return {
      id: row.id,
      vendorId: row.vendor_id,
      submittedBy: row.submitted_by,
      source: row.source,
      status: "approved" as const,
      itemCount: row.item_count,
      reviewNote: input.reviewNote ?? null,
      reviewedBy: input.reviewerEmail,
      reviewedAt: new Date().toISOString(),
      createdAt: asIso(row.created_at) ?? new Date().toISOString(),
      items: updatedItems.rows.map(mapItem),
    }
  })
}

export async function rejectProductSubmission(input: {
  submissionId: string
  reviewerEmail: string
  reviewNote?: string
}) {
  return withTransaction(async (txQuery) => {
    const result = await txQuery<SubmissionRow>(
      `UPDATE product_submissions SET
        status = 'draft',
        reviewed_by = $2,
        review_note = $3,
        reviewed_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND status = 'pending'
       RETURNING *`,
      [input.submissionId, input.reviewerEmail, input.reviewNote ?? null]
    )
    const row = result.rows[0]
    if (!row) throw new Error("Submission not found or already reviewed")

    await txQuery(
      `UPDATE product_submission_items
       SET item_status = 'pending', item_note = $2
       WHERE submission_id = $1`,
      [input.submissionId, input.reviewNote ?? null]
    )

    const updatedItems = await txQuery<ItemRow>(
      `SELECT * FROM product_submission_items
       WHERE submission_id = $1
       ORDER BY id`,
      [input.submissionId]
    )

    return {
      id: row.id,
      vendorId: row.vendor_id,
      submittedBy: row.submitted_by,
      source: row.source,
      status: "draft" as const,
      itemCount: row.item_count,
      reviewNote: input.reviewNote ?? null,
      reviewedBy: input.reviewerEmail,
      reviewedAt: new Date().toISOString(),
      createdAt: asIso(row.created_at) ?? new Date().toISOString(),
      items: updatedItems.rows.map(mapItem),
    }
  })
}
