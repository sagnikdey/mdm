import { query } from "./db"
import { ensureProductOnboardingSchema } from "./portal-schema"
import { normalizeBarcode } from "./product-fields"

const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000
const OFF_URL = "https://world.openfoodfacts.org/api/v2/product"

export type BarcodeLookupResult = {
  barcode: string
  match: boolean
  productName: string
  brand: string
  manufacturer: string
  description: string
  weight: number | null
  weightUnit: "g" | "kg" | "oz" | "lb" | null
  source: "openfoodfacts" | null
}

type CacheRow = {
  barcode: string
  payload: BarcodeLookupResult | string
  fetched_at: Date | string
}

function asResult(payload: CacheRow["payload"]): BarcodeLookupResult {
  if (typeof payload === "string") return JSON.parse(payload) as BarcodeLookupResult
  return payload
}

function parseQuantity(raw: unknown): {
  weight: number | null
  weightUnit: BarcodeLookupResult["weightUnit"]
} {
  if (typeof raw !== "string" || !raw.trim()) {
    return { weight: null, weightUnit: null }
  }
  const match = raw.trim().match(/([\d.]+)\s*(g|kg|oz|lb|l|ml)/i)
  if (!match) return { weight: null, weightUnit: null }
  const amount = Number(match[1])
  const unit = match[2]!.toLowerCase()
  if (unit === "g" || unit === "kg" || unit === "oz" || unit === "lb") {
    return { weight: amount, weightUnit: unit }
  }
  return { weight: null, weightUnit: null }
}

function mapOffProduct(
  barcode: string,
  product: Record<string, unknown>
): BarcodeLookupResult {
  const quantity = parseQuantity(product.quantity)
  return {
    barcode,
    match: true,
    productName: String(product.product_name ?? "").trim(),
    brand: String(product.brands ?? "")
      .split(",")[0]
      ?.trim() ?? "",
    manufacturer: String(product.manufacturing_places ?? "").trim(),
    description: String(
      product.generic_name ?? product.ingredients_text ?? ""
    ).trim(),
    weight: quantity.weight,
    weightUnit: quantity.weightUnit,
    source: "openfoodfacts",
  }
}

async function readCache(barcode: string) {
  const result = await query<CacheRow>(
    `SELECT barcode, payload, fetched_at FROM barcode_lookup_cache WHERE barcode = $1`,
    [barcode]
  )
  const row = result.rows[0]
  if (!row) return null
  const fetched =
    row.fetched_at instanceof Date
      ? row.fetched_at.getTime()
      : new Date(row.fetched_at).getTime()
  if (Date.now() - fetched > CACHE_TTL_MS) return null
  return asResult(row.payload)
}

async function writeCache(result: BarcodeLookupResult) {
  await query(
    `INSERT INTO barcode_lookup_cache (barcode, payload, source, fetched_at)
     VALUES ($1, $2::jsonb, 'openfoodfacts', CURRENT_TIMESTAMP)
     ON CONFLICT (barcode) DO UPDATE SET
       payload = EXCLUDED.payload,
       fetched_at = CURRENT_TIMESTAMP`,
    [result.barcode, JSON.stringify(result)]
  )
}

export async function lookupBarcode(barcodeRaw: string): Promise<BarcodeLookupResult> {
  await ensureProductOnboardingSchema()
  const barcode = normalizeBarcode(barcodeRaw)
  const empty: BarcodeLookupResult = {
    barcode,
    match: false,
    productName: "",
    brand: "",
    manufacturer: "",
    description: "",
    weight: null,
    weightUnit: null,
    source: null,
  }
  if (!barcode) return empty

  const cached = await readCache(barcode)
  if (cached) return { ...cached, barcode }

  const response = await fetch(`${OFF_URL}/${barcode}.json`, {
    headers: {
      "User-Agent":
        "MDM-Vendor-Portal/1.0 (product-onboarding; https://mdm-vendor-portal.vercel.app)",
      Accept: "application/json",
    },
  })
  if (!response.ok) return empty

  const json = (await response.json()) as {
    status?: number
    product?: Record<string, unknown>
  }
  if (json.status !== 1 || !json.product) {
    await writeCache(empty)
    return empty
  }

  const mapped = mapOffProduct(barcode, json.product)
  await writeCache(mapped)
  return mapped
}
