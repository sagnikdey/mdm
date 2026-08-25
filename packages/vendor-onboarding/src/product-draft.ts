import { query, withTransaction } from "./db"
import { getProductSubmission, listVendorProducts } from "./catalog"
import { ensureProductOnboardingSchema } from "./portal-schema"
import type { ProductSubmission, ProductSubmissionItem } from "./portal-types"
import {
  findDuplicateKeys,
  normalizeProposedProduct,
  PACKET_ITEM_CAP,
  validatePackLinks,
  validateProposedProduct,
  type ProposedProduct,
} from "./product-fields"

type SubmissionRow = {
  id: string
  vendor_id: string
  submitted_by: string
  source: string
  status: "draft" | "pending" | "approved" | "rejected"
  item_count: number
  review_note: string | null
  reviewed_by: string | null
  reviewed_at: Date | string | null
  created_at: Date | string
}

const ITEM_COLUMNS = `
  submission_id, proposed_sku, product_name, brand, manufacturer, category_id,
  vendor_sku, description, unit_of_measure, units_per_case, wholesale_price,
  weight, weight_unit, barcode, no_barcode, pack_type, pack_size,
  base_unit_vendor_sku
`

function itemValues(submissionId: string, item: ProposedProduct) {
  return [
    submissionId,
    item.vendorSku,
    item.productName,
    item.brand,
    item.manufacturer || null,
    item.categoryId,
    item.vendorSku,
    item.description,
    item.unitOfMeasure,
    item.unitsPerCase,
    item.wholesalePrice,
    item.weight,
    item.weightUnit,
    item.noBarcode ? "" : item.barcode,
    item.noBarcode,
    item.packType,
    item.packSize,
    item.baseUnitVendorSku || null,
  ]
}

export async function findVendorBarcodeOwner(
  vendorId: string,
  barcode: string,
  excludeItemId?: number
) {
  const digits = barcode.replace(/\D/g, "")
  if (!digits) return null

  const live = await query<{ sku: string; vendor_sku: string }>(
    `SELECT sku, vendor_sku FROM products
     WHERE vendor_id = $1 AND barcode = $2 AND barcode <> ''`,
    [vendorId, digits]
  )
  if (live.rows[0]) {
    return {
      where: "live" as const,
      sku: live.rows[0].sku,
      vendorSku: live.rows[0].vendor_sku,
    }
  }

  const pending = await query<{
    id: number
    vendor_sku: string
    status: string
  }>(
    `SELECT i.id, i.vendor_sku, s.status
     FROM product_submission_items i
     JOIN product_submissions s ON s.id = i.submission_id
     WHERE s.vendor_id = $1
       AND s.status IN ('draft', 'pending')
       AND i.barcode = $2
       AND i.no_barcode = false
       AND ($3::int IS NULL OR i.id <> $3)
     LIMIT 1`,
    [vendorId, digits, excludeItemId ?? null]
  )
  if (pending.rows[0]) {
    return {
      where:
        pending.rows[0].status === "pending"
          ? ("pending" as const)
          : ("draft" as const),
      sku: null as string | null,
      vendorSku: pending.rows[0].vendor_sku,
      itemId: pending.rows[0].id,
    }
  }
  return null
}

async function liveKeys(vendorId: string) {
  const products = await listVendorProducts(vendorId)
  return {
    skus: new Set(products.map((product) => product.vendorSku.toLowerCase())),
    barcodes: new Set(
      products
        .map((product) => product.barcode)
        .filter((barcode) => barcode.length > 0)
    ),
  }
}

export function annotatePacket(
  packet: ProductSubmission,
  allowedCategoryIds: string[],
  live: { skus: Set<string>; barcodes: Set<string> }
): ProductSubmission {
  const proposed = packet.items.map((item) =>
    normalizeProposedProduct({
      vendorSku: item.vendorSku,
      productName: item.productName,
      brand: item.brand,
      manufacturer: item.manufacturer,
      categoryId: item.categoryId ?? "",
      description: item.description,
      unitOfMeasure: item.unitOfMeasure,
      unitsPerCase: item.unitsPerCase,
      wholesalePrice: item.wholesalePrice,
      weight: item.weight,
      weightUnit: item.weightUnit,
      barcode: item.barcode,
      noBarcode: item.noBarcode,
      packType: item.packType,
      packSize: item.packSize,
      baseUnitVendorSku: item.baseUnitVendorSku,
    })
  )
  const packLinks = validatePackLinks(proposed, live.skus)
  const dupes = findDuplicateKeys(proposed)

  const items = packet.items.map((item, index) => {
    const row = proposed[index]!
    const errors = [
      ...validateProposedProduct(row, allowedCategoryIds),
      ...(packLinks.get(row.vendorSku) ?? []),
    ]
    const skuKey = row.vendorSku.toLowerCase()
    if (live.skus.has(skuKey)) {
      errors.push(
        `Vendor SKU "${row.vendorSku}" already exists in your live catalog`
      )
    }
    if (!row.noBarcode && row.barcode && live.barcodes.has(row.barcode)) {
      errors.push(`Barcode ${row.barcode} already exists in your live catalog`)
    }
    for (const dupe of dupes) {
      if (
        (row.vendorSku && dupe.toLowerCase().includes(skuKey)) ||
        (row.barcode && dupe.includes(row.barcode))
      ) {
        if (!errors.includes(dupe)) errors.push(dupe)
      }
    }
    return { ...item, errors }
  })

  return { ...packet, items, itemCount: items.length }
}

export async function getVendorActivePacket(vendorId: string) {
  await ensureProductOnboardingSchema()
  const result = await query<SubmissionRow>(
    `SELECT * FROM product_submissions
     WHERE vendor_id = $1 AND status IN ('draft', 'pending')
     ORDER BY CASE status WHEN 'pending' THEN 0 ELSE 1 END, created_at DESC
     LIMIT 1`,
    [vendorId]
  )
  const row = result.rows[0]
  if (!row) return undefined
  return getProductSubmission(row.id)
}

export async function getOrCreateDraft(input: {
  vendorId: string
  submittedBy: string
  source?: string
}) {
  await ensureProductOnboardingSchema()
  const existing = await getVendorActivePacket(input.vendorId)
  if (existing?.status === "pending") {
    throw new Error("A packet is already waiting for MDM review")
  }
  if (existing?.status === "draft") return existing

  const created = await query<SubmissionRow>(
    `INSERT INTO product_submissions (
      vendor_id, submitted_by, source, status, item_count
    ) VALUES ($1, $2, $3, 'draft', 0)
    RETURNING *`,
    [input.vendorId, input.submittedBy, input.source ?? "single_form"]
  )
  return getProductSubmission(created.rows[0]!.id)
}

async function refreshItemCount(
  txQuery: typeof query,
  submissionId: string,
  source?: string
) {
  await txQuery(
    `UPDATE product_submissions SET
      item_count = (
        SELECT COUNT(*) FROM product_submission_items WHERE submission_id = $1
      ),
      source = COALESCE($2, source)
     WHERE id = $1`,
    [submissionId, source ?? null]
  )
}

function mergeSource(current: string, incoming: string) {
  if (!current || current === incoming) return incoming
  return "mixed"
}

export async function appendDraftItems(input: {
  vendorId: string
  submittedBy: string
  allowedCategoryIds: string[]
  source: string
  items: ProposedProduct[]
}) {
  if (!input.items.length) throw new Error("Add at least one product")
  await ensureProductOnboardingSchema()

  await withTransaction(async (txQuery) => {
    const pending = await txQuery<SubmissionRow>(
      `SELECT * FROM product_submissions
       WHERE vendor_id = $1 AND status = 'pending'
       FOR UPDATE`,
      [input.vendorId]
    )
    if (pending.rows[0]) {
      throw new Error("A packet is already waiting for MDM review")
    }

    let draft = await txQuery<SubmissionRow>(
      `SELECT * FROM product_submissions
       WHERE vendor_id = $1 AND status = 'draft'
       FOR UPDATE`,
      [input.vendorId]
    )
    if (!draft.rows[0]) {
      draft = await txQuery<SubmissionRow>(
        `INSERT INTO product_submissions (
          vendor_id, submitted_by, source, status, item_count
        ) VALUES ($1, $2, $3, 'draft', 0)
        RETURNING *`,
        [input.vendorId, input.submittedBy, input.source]
      )
    }

    const header = draft.rows[0]!
    const existingItems = await txQuery<{
      vendor_sku: string
      barcode: string | null
      no_barcode: boolean | null
    }>(
      `SELECT vendor_sku, barcode, no_barcode
       FROM product_submission_items WHERE submission_id = $1`,
      [header.id]
    )

    if (existingItems.rows.length + input.items.length > PACKET_ITEM_CAP) {
      throw new Error(
        `Packet cannot exceed ${PACKET_ITEM_CAP} products. Split this into a smaller upload.`
      )
    }

    const live = await liveKeys(input.vendorId)

    for (const item of input.items) {
      const normalized = normalizeProposedProduct(item)
      const errors = validateProposedProduct(
        normalized,
        input.allowedCategoryIds
      )
      if (errors.length) throw new Error(errors[0])
      if (live.skus.has(normalized.vendorSku.toLowerCase())) {
        throw new Error(
          `Vendor SKU "${normalized.vendorSku}" already exists in your live catalog`
        )
      }
      if (
        !normalized.noBarcode &&
        normalized.barcode &&
        live.barcodes.has(normalized.barcode)
      ) {
        throw new Error(
          `Barcode ${normalized.barcode} already exists in your live catalog`
        )
      }
      if (
        existingItems.rows.some(
          (row) =>
            row.vendor_sku.toLowerCase() === normalized.vendorSku.toLowerCase()
        )
      ) {
        throw new Error(
          `Vendor SKU "${normalized.vendorSku}" is already in this packet`
        )
      }
      if (
        !normalized.noBarcode &&
        normalized.barcode &&
        existingItems.rows.some(
          (row) => !row.no_barcode && row.barcode === normalized.barcode
        )
      ) {
        throw new Error(
          `Barcode ${normalized.barcode} is already in this packet`
        )
      }
    }

    const packErrors = validatePackLinks(
      input.items.map((item) => normalizeProposedProduct(item)),
      new Set([
        ...live.skus,
        ...existingItems.rows.map((row) => row.vendor_sku.toLowerCase()),
        ...input.items.map((item) =>
          normalizeProposedProduct(item).vendorSku.toLowerCase()
        ),
      ])
    )
    for (const item of input.items) {
      const extra = packErrors.get(normalizeProposedProduct(item).vendorSku)
      if (extra?.length) throw new Error(extra[0])
    }

    for (const item of input.items) {
      const normalized = normalizeProposedProduct(item)
      await txQuery(
        `INSERT INTO product_submission_items (${ITEM_COLUMNS})
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
        itemValues(header.id, normalized)
      )
    }

    await refreshItemCount(
      txQuery,
      header.id,
      mergeSource(header.source, input.source)
    )
  })

  return getVendorActivePacket(input.vendorId)
}

export async function updateDraftItem(input: {
  vendorId: string
  itemId: number
  allowedCategoryIds: string[]
  values: ProposedProduct
}) {
  await ensureProductOnboardingSchema()
  const packet = await getVendorActivePacket(input.vendorId)
  if (!packet) throw new Error("No draft packet")
  if (packet.status !== "draft") {
    throw new Error("This packet is waiting for MDM review")
  }
  const current = packet.items.find((item) => item.id === input.itemId)
  if (!current) throw new Error("Item not in this packet")

  const normalized = normalizeProposedProduct(input.values)
  const errors = validateProposedProduct(normalized, input.allowedCategoryIds)
  if (errors.length) throw new Error(errors[0])

  const live = await liveKeys(input.vendorId)
  if (live.skus.has(normalized.vendorSku.toLowerCase())) {
    throw new Error(
      `Vendor SKU "${normalized.vendorSku}" already exists in your live catalog`
    )
  }
  if (
    !normalized.noBarcode &&
    normalized.barcode &&
    live.barcodes.has(normalized.barcode)
  ) {
    throw new Error(
      `Barcode ${normalized.barcode} already exists in your live catalog`
    )
  }

  const sibling = packet.items.filter((item) => item.id !== input.itemId)
  if (
    sibling.some(
      (item) => item.vendorSku.toLowerCase() === normalized.vendorSku.toLowerCase()
    )
  ) {
    throw new Error(
      `Vendor SKU "${normalized.vendorSku}" is already in this packet`
    )
  }
  if (
    !normalized.noBarcode &&
    normalized.barcode &&
    sibling.some((item) => !item.noBarcode && item.barcode === normalized.barcode)
  ) {
    throw new Error(`Barcode ${normalized.barcode} is already in this packet`)
  }

  await query(
    `UPDATE product_submission_items SET
      proposed_sku = $2, product_name = $3, brand = $4, manufacturer = $5,
      category_id = $6, vendor_sku = $7, description = $8, unit_of_measure = $9,
      units_per_case = $10, wholesale_price = $11, weight = $12, weight_unit = $13,
      barcode = $14, no_barcode = $15, pack_type = $16, pack_size = $17,
      base_unit_vendor_sku = $18
     WHERE id = $1`,
    [
      input.itemId,
      normalized.vendorSku,
      normalized.productName,
      normalized.brand,
      normalized.manufacturer || null,
      normalized.categoryId,
      normalized.vendorSku,
      normalized.description,
      normalized.unitOfMeasure,
      normalized.unitsPerCase,
      normalized.wholesalePrice,
      normalized.weight,
      normalized.weightUnit,
      normalized.noBarcode ? "" : normalized.barcode,
      normalized.noBarcode,
      normalized.packType,
      normalized.packSize,
      normalized.baseUnitVendorSku || null,
    ]
  )

  return getVendorActivePacket(input.vendorId)
}

export async function deleteDraftItem(vendorId: string, itemId: number) {
  await ensureProductOnboardingSchema()
  const packet = await getVendorActivePacket(vendorId)
  if (!packet) throw new Error("No draft packet")
  if (packet.status !== "draft") {
    throw new Error("This packet is waiting for MDM review")
  }
  if (!packet.items.some((item) => item.id === itemId)) {
    throw new Error("Item not in this packet")
  }

  await withTransaction(async (txQuery) => {
    await txQuery(`DELETE FROM product_submission_items WHERE id = $1`, [itemId])
    await refreshItemCount(txQuery, packet.id)
  })
  return getVendorActivePacket(vendorId)
}

export async function sendDraftForReview(input: {
  vendorId: string
  allowedCategoryIds: string[]
}) {
  await ensureProductOnboardingSchema()
  const packet = await getVendorActivePacket(input.vendorId)
  if (!packet) throw new Error("Add at least one product before sending")
  if (packet.status === "pending") {
    throw new Error("This packet is already waiting for review")
  }
  if (packet.items.length < 1 || packet.items.length > PACKET_ITEM_CAP) {
    throw new Error(`Send between 1 and ${PACKET_ITEM_CAP} products`)
  }

  const live = await liveKeys(input.vendorId)
  const annotated = annotatePacket(packet, input.allowedCategoryIds, live)
  const firstError = annotated.items.find((item) => item.errors.length)
  if (firstError) {
    throw new Error(`${firstError.productName}: ${firstError.errors[0]}`)
  }

  await query(
    `UPDATE product_submissions SET status = 'pending', reviewed_at = NULL
     WHERE id = $1 AND status = 'draft'`,
    [packet.id]
  )
  return getVendorActivePacket(input.vendorId)
}

export async function getAnnotatedPacket(
  vendorId: string,
  allowedCategoryIds: string[]
) {
  const packet = await getVendorActivePacket(vendorId)
  if (!packet) return undefined
  const live = await liveKeys(vendorId)
  return annotatePacket(packet, allowedCategoryIds, live)
}

export function itemToProposed(item: ProductSubmissionItem): ProposedProduct {
  return normalizeProposedProduct({
    vendorSku: item.vendorSku,
    productName: item.productName,
    brand: item.brand,
    manufacturer: item.manufacturer,
    categoryId: item.categoryId ?? "",
    description: item.description,
    unitOfMeasure: item.unitOfMeasure,
    unitsPerCase: item.unitsPerCase,
    wholesalePrice: item.wholesalePrice,
    weight: item.weight,
    weightUnit: item.weightUnit,
    barcode: item.barcode,
    noBarcode: item.noBarcode,
    packType: item.packType,
    packSize: item.packSize,
    baseUnitVendorSku: item.baseUnitVendorSku,
  })
}
