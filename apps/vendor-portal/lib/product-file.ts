import * as XLSX from "xlsx"

import type { CatalogCategory, CatalogProduct } from "@workspace/vendor-onboarding/portal-types"
import {
  normalizeProposedProduct,
  PACKET_FILE_SIZE_CAP,
  PACKET_ITEM_CAP,
  type ProposedProduct,
} from "@workspace/vendor-onboarding/product-fields"

export const PRODUCT_FILE_HEADERS = [
  "product_name",
  "brand",
  "manufacturer",
  "vendor_sku",
  "barcode",
  "no_barcode",
  "category",
  "pack_type",
  "pack_size",
  "base_unit_vendor_sku",
  "unit_of_measure",
  "units_per_case",
  "wholesale_price",
  "weight",
  "weight_unit",
  "description",
] as const

const REQUIRED_HEADERS = [
  "product_name",
  "brand",
  "vendor_sku",
  "category",
  "pack_type",
  "pack_size",
  "unit_of_measure",
  "units_per_case",
  "wholesale_price",
  "weight",
  "weight_unit",
] as const

function truthy(value: unknown) {
  const raw = String(value ?? "")
    .trim()
    .toLowerCase()
  return ["1", "true", "yes", "y"].includes(raw)
}

function cell(row: Record<string, unknown>, key: string) {
  const match = Object.keys(row).find(
    (header) => header.trim().toLowerCase() === key
  )
  return match ? row[match] : ""
}

export function parseProductFile(
  buffer: Buffer,
  filename: string,
  categories: CatalogCategory[]
) {
  if (buffer.byteLength > PACKET_FILE_SIZE_CAP) {
    throw new Error("File is larger than 5 MB")
  }

  const lower = filename.toLowerCase()
  const workbook = lower.endsWith(".csv")
    ? XLSX.read(buffer.toString("utf8"), { type: "string" })
    : XLSX.read(buffer, { type: "buffer" })

  const sheetName =
    workbook.SheetNames.find((name) => name.toLowerCase() === "products") ??
    workbook.SheetNames[0]
  if (!sheetName) throw new Error("The file has no sheets")
  const sheet = workbook.Sheets[sheetName]
  if (!sheet) throw new Error("The products sheet is empty")

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
    raw: false,
  })

  const headers = rows[0]
    ? Object.keys(rows[0]).map((header) => header.trim().toLowerCase())
    : []
  const missing = REQUIRED_HEADERS.filter((header) => !headers.includes(header))
  if (missing.length) {
    throw new Error(`Missing required columns: ${missing.join(", ")}`)
  }

  const unknownColumns = headers.filter(
    (header) =>
      header &&
      !(PRODUCT_FILE_HEADERS as readonly string[]).includes(header) &&
      header !== "type hint"
  )

  const byName = new Map(
    categories.map((category) => [
      category.categoryName.trim().toLowerCase(),
      category.categoryId,
    ])
  )

  const items: ProposedProduct[] = []
  let skippedEmpty = 0

  for (const row of rows) {
    const productName = String(cell(row, "product_name")).trim()
    const vendorSku = String(cell(row, "vendor_sku")).trim()
    const brand = String(cell(row, "brand")).trim()
    if (
      (!productName && !vendorSku && !brand) ||
      productName.toLowerCase().includes("(required)") ||
      vendorSku.toLowerCase().includes("unique per vendor")
    ) {
      skippedEmpty += 1
      continue
    }

    const categoryRaw = String(cell(row, "category")).trim()
    const categoryId =
      byName.get(categoryRaw.toLowerCase()) ??
      categories.find((category) => category.categoryId === categoryRaw)
        ?.categoryId ??
      ""

    items.push(
      normalizeProposedProduct({
        productName,
        brand,
        manufacturer: String(cell(row, "manufacturer")),
        vendorSku,
        barcode: String(cell(row, "barcode")),
        noBarcode: truthy(cell(row, "no_barcode")),
        categoryId,
        packType: String(cell(row, "pack_type")),
        packSize: Number(cell(row, "pack_size") || 1),
        baseUnitVendorSku: String(cell(row, "base_unit_vendor_sku")),
        unitOfMeasure: String(cell(row, "unit_of_measure") || "case"),
        unitsPerCase: Number(cell(row, "units_per_case") || 1),
        wholesalePrice: Number(cell(row, "wholesale_price") || 0),
        weight: Number(cell(row, "weight") || 0),
        weightUnit: String(cell(row, "weight_unit") || "lb"),
        description: String(cell(row, "description")),
      })
    )
  }

  if (items.length > PACKET_ITEM_CAP) {
    throw new Error(
      `Split this into a smaller upload (max ${PACKET_ITEM_CAP}).`
    )
  }

  return { items, unknownColumns, skippedEmpty }
}

export function buildTemplateWorkbook(
  categories: CatalogCategory[],
  liveProducts: CatalogProduct[]
) {
  const legend: Record<string, string> = {
    product_name: "text (required)",
    brand: "text (required)",
    manufacturer: "text",
    vendor_sku: "text (required, unique per vendor)",
    barcode: "digits (or check no_barcode)",
    no_barcode: "TRUE | FALSE",
    category: "exact name from Allowed Values",
    pack_type: "single | multi_pack | case",
    pack_size: "number of consumer units in this SKU",
    base_unit_vendor_sku: "vendor SKU of the single, if you also sell it",
    unit_of_measure: "each | case | ...",
    units_per_case: "orderable quantity",
    wholesale_price: "number > 0",
    weight: "number",
    weight_unit: "lb | oz | g | kg",
    description: "text",
  }

  const exampleCategory = categories[0]?.categoryName ?? "Soft Drinks"
  const examples = [
    {
      product_name: "Cola Classic 12oz can",
      brand: "Acme",
      manufacturer: "Acme Bottling",
      vendor_sku: "BEV-COLA-12-EA",
      barcode: "012345678905",
      no_barcode: "FALSE",
      category: exampleCategory,
      pack_type: "single",
      pack_size: 1,
      base_unit_vendor_sku: "",
      unit_of_measure: "each",
      units_per_case: 1,
      wholesale_price: 0.35,
      weight: 0.375,
      weight_unit: "lb",
      description: "Single 12oz can",
    },
    {
      product_name: "Cola Classic 12oz case",
      brand: "Acme",
      manufacturer: "Acme Bottling",
      vendor_sku: "BEV-COLA-12-CS",
      barcode: "012345678912",
      no_barcode: "FALSE",
      category: exampleCategory,
      pack_type: "case",
      pack_size: 24,
      base_unit_vendor_sku: "BEV-COLA-12-EA",
      unit_of_measure: "case",
      units_per_case: 24,
      wholesale_price: 8.4,
      weight: 9,
      weight_unit: "lb",
      description: "Case of 24 cans. Leave base_unit_vendor_sku empty for case-only.",
    },
    {
      product_name: "Salted chips 1.5oz",
      brand: "Acme",
      manufacturer: "",
      vendor_sku: "SNK-CHIP-15",
      barcode: "",
      no_barcode: "TRUE",
      category: exampleCategory,
      pack_type: "case",
      pack_size: 40,
      base_unit_vendor_sku: "",
      unit_of_measure: "case",
      units_per_case: 40,
      wholesale_price: 8.99,
      weight: 1.5,
      weight_unit: "oz",
      description: "Case only — no inner single SKU",
    },
  ]

  const workbook = XLSX.utils.book_new()
  const productsSheet = XLSX.utils.json_to_sheet([legend, ...examples], {
    header: [...PRODUCT_FILE_HEADERS],
  })
  XLSX.utils.book_append_sheet(workbook, productsSheet, "Products")

  const allowed = [
    ...categories.map((category) => ({
      list: "category",
      value: category.categoryName,
      id: category.categoryId,
    })),
    { list: "pack_type", value: "single", id: "" },
    { list: "pack_type", value: "multi_pack", id: "" },
    { list: "pack_type", value: "case", id: "" },
    { list: "weight_unit", value: "lb", id: "" },
    { list: "weight_unit", value: "oz", id: "" },
    { list: "weight_unit", value: "g", id: "" },
    { list: "weight_unit", value: "kg", id: "" },
    ...liveProducts.slice(0, 50).map((product) => ({
      list: "live_vendor_sku",
      value: product.vendorSku,
      id: product.sku,
    })),
  ]
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(allowed),
    "Allowed Values"
  )

  const instructions = [
    {
      step: "1",
      text: "Keep the header row. Delete the three example rows before submitting.",
    },
    {
      step: "2",
      text: "Category must match a name on Allowed Values for your vendor.",
    },
    {
      step: "3",
      text: "Case only: pack_type=case, leave base_unit_vendor_sku empty.",
    },
    {
      step: "4",
      text: "Case and single: add both rows. The case row's base_unit_vendor_sku is the single's vendor_sku.",
    },
    {
      step: "5",
      text: "CSV is the Products sheet only, same column names. Max 120 rows, 5 MB.",
    },
  ]
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(instructions),
    "Instructions"
  )

  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer
}
