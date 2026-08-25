export const PACKET_ITEM_CAP = 120
export const PACKET_FILE_SIZE_CAP = 5 * 1024 * 1024

export const PACK_TYPES = ["single", "multi_pack", "case"] as const
export const WEIGHT_UNITS = ["lb", "oz", "g", "kg"] as const

export type PackType = (typeof PACK_TYPES)[number]
export type WeightUnit = (typeof WEIGHT_UNITS)[number]

export type ProposedProduct = {
  vendorSku: string
  productName: string
  brand: string
  manufacturer: string
  categoryId: string
  description: string
  unitOfMeasure: string
  unitsPerCase: number
  wholesalePrice: number
  weight: number
  weightUnit: WeightUnit
  barcode: string
  noBarcode: boolean
  packType: PackType
  packSize: number
  baseUnitVendorSku: string
}

export type FieldError = { field?: string; message: string }

function isPackType(value: string): value is PackType {
  return (PACK_TYPES as readonly string[]).includes(value)
}

function isWeightUnit(value: string): value is WeightUnit {
  return (WEIGHT_UNITS as readonly string[]).includes(value)
}

export function gtinCheckDigit(withoutCheck: string) {
  let sum = 0
  let multiplier = 3
  for (let i = withoutCheck.length - 1; i >= 0; i -= 1) {
    sum += Number(withoutCheck[i]) * multiplier
    multiplier = multiplier === 3 ? 1 : 3
  }
  return String((10 - (sum % 10)) % 10)
}

export function normalizeBarcode(raw: string) {
  return raw.replace(/\D/g, "")
}

export function barcodeChecksumError(code: string) {
  if (!/^\d{8}$|^\d{12}$|^\d{13}$|^\d{14}$/.test(code)) {
    return "Barcode must be 8, 12, 13, or 14 digits"
  }
  const body = code.slice(0, -1)
  const check = code.slice(-1)
  if (gtinCheckDigit(body) !== check) {
    const kind =
      code.length === 12
        ? "UPC-A"
        : code.length === 13
          ? "EAN-13"
          : code.length === 8
            ? "EAN-8"
            : "GTIN-14"
    return `This looks like a ${kind} but the check digit is wrong — did you mis-type?`
  }
  return null
}

function asNumber(value: unknown, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return fallback
}

export function normalizeProposedProduct(
  input: object
): ProposedProduct {
  const rec = input as Record<string, unknown>
  const packTypeRaw = String(rec.packType ?? "case").trim().toLowerCase()
  const weightUnitRaw = String(rec.weightUnit ?? "lb").trim().toLowerCase()
  const noBarcode = Boolean(rec.noBarcode)
  const barcode = noBarcode ? "" : normalizeBarcode(String(rec.barcode ?? ""))

  return {
    vendorSku: String(rec.vendorSku ?? "").trim(),
    productName: String(rec.productName ?? "").trim(),
    brand: String(rec.brand ?? "").trim(),
    manufacturer: String(rec.manufacturer ?? "").trim(),
    categoryId: String(rec.categoryId ?? "").trim(),
    description: String(rec.description ?? "").trim(),
    unitOfMeasure: String(rec.unitOfMeasure ?? "case").trim() || "case",
    unitsPerCase: Math.max(1, Math.round(asNumber(rec.unitsPerCase, 1))),
    wholesalePrice: asNumber(rec.wholesalePrice, 0),
    weight: asNumber(rec.weight, 0),
    weightUnit: isWeightUnit(weightUnitRaw) ? weightUnitRaw : "lb",
    barcode,
    noBarcode,
    packType: isPackType(packTypeRaw) ? packTypeRaw : "case",
    packSize: Math.max(1, Math.round(asNumber(rec.packSize, 1))),
    baseUnitVendorSku: String(rec.baseUnitVendorSku ?? "").trim(),
  }
}

export function validateProposedProduct(
  item: ProposedProduct,
  allowedCategoryIds: string[]
): string[] {
  const errors: string[] = []

  if (!item.productName) errors.push("Product name is required")
  if (!item.brand) errors.push("Brand is required")
  if (!item.vendorSku) errors.push("Vendor SKU is required")
  if (!item.categoryId) errors.push("Category is required")
  else if (!allowedCategoryIds.includes(item.categoryId)) {
    errors.push("Category is not approved for this vendor")
  }

  if (!isPackType(item.packType)) {
    errors.push("Pack type must be single, multi_pack, or case")
  }
  if (item.packType === "single" && item.packSize !== 1) {
    errors.push("A single unit must have pack size 1")
  }
  if (item.packType === "single" && item.baseUnitVendorSku) {
    errors.push("A single unit cannot link to a base unit")
  }
  if (item.unitsPerCase < 1) errors.push("Units per case must be at least 1")
  if (item.packSize < 1) errors.push("Pack size must be at least 1")

  if (!(item.wholesalePrice > 0) || item.wholesalePrice >= 10000) {
    errors.push("Wholesale price must be greater than 0 and less than 10,000")
  }
  if (item.weight < 0) errors.push("Weight cannot be negative")
  if (!isWeightUnit(item.weightUnit)) {
    errors.push("Weight unit must be lb, oz, g, or kg")
  }

  if (item.noBarcode) {
    if (item.barcode) errors.push("Clear the barcode when No barcode is checked")
  } else {
    const barcodeError = barcodeChecksumError(item.barcode)
    if (barcodeError) errors.push(barcodeError)
  }

  return errors
}

export function validatePackLinks(
  items: ProposedProduct[],
  liveVendorSkus: Set<string>
): Map<string, string[]> {
  const packetSkus = new Set(items.map((item) => item.vendorSku.toLowerCase()))
  const extra = new Map<string, string[]>()

  for (const item of items) {
    if (!item.baseUnitVendorSku) continue
    const key = item.baseUnitVendorSku.toLowerCase()
    const exists = packetSkus.has(key) || liveVendorSkus.has(key)
    if (!exists) {
      extra.set(item.vendorSku, [
        `Base unit vendor SKU "${item.baseUnitVendorSku}" was not found in this packet or your live catalog`,
      ])
    }
  }

  return extra
}

export function findDuplicateKeys(items: ProposedProduct[]) {
  const vendorSkus = new Map<string, number>()
  const barcodes = new Map<string, number>()
  const errors: string[] = []

  for (const item of items) {
    const skuKey = item.vendorSku.toLowerCase()
    vendorSkus.set(skuKey, (vendorSkus.get(skuKey) ?? 0) + 1)
    if (!item.noBarcode && item.barcode) {
      barcodes.set(item.barcode, (barcodes.get(item.barcode) ?? 0) + 1)
    }
  }

  for (const [sku, count] of vendorSkus) {
    if (count > 1) errors.push(`Vendor SKU "${sku}" is used more than once in this packet`)
  }
  for (const [barcode, count] of barcodes) {
    if (count > 1) errors.push(`Barcode ${barcode} is used more than once in this packet`)
  }

  return errors
}
