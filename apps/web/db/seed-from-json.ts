import { existsSync, readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

import pg from "pg"

import type { MdmData } from "../lib/types"

const __dirname = dirname(fileURLToPath(import.meta.url))

function loadEnvLocal() {
  const envPath = join(__dirname, "../.env.local")
  if (!existsSync(envPath)) return

  for (const line of readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue

    const separator = trimmed.indexOf("=")
    if (separator === -1) continue

    const key = trimmed.slice(0, separator).trim()
    let value = trimmed.slice(separator + 1).trim()

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    if (!process.env[key]) {
      process.env[key] = value
    }
  }
}

loadEnvLocal()

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.error("DATABASE_URL is required. Set it in apps/web/.env.local")
  process.exit(1)
}

const jsonPath = join(__dirname, "../../../convenience-store-mdm-sample.json")
const data = JSON.parse(readFileSync(jsonPath, "utf-8")) as MdmData

async function main() {
  const client = new pg.Client({ connectionString: databaseUrl })
  await client.connect()

  try {
    const schemaPath = join(__dirname, "schema.sql")
    const schema = readFileSync(schemaPath, "utf-8")
    await client.query(schema)

    console.log("Seeding categories...")
    for (const category of data.categories) {
      await client.query(
        `INSERT INTO categories (category_id, category_name, parent_category_id, description)
         VALUES ($1, $2, $3, $4)`,
        [
          category.categoryId,
          category.categoryName,
          category.parentCategoryId,
          category.description,
        ]
      )
    }

    console.log("Seeding vendors...")
    for (const vendor of data.vendors) {
      await client.query(
        `INSERT INTO vendors (
          vendor_id, vendor_name, vendor_category, contact_person, email, phone,
          address, payment_terms, minimum_order_quantity, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          vendor.vendorId,
          vendor.vendorName,
          vendor.vendorCategory,
          vendor.contactPerson,
          vendor.email,
          vendor.phone,
          vendor.address,
          vendor.paymentTerms,
          vendor.minimumOrderQuantity,
          vendor.isActive,
        ]
      )
    }

    console.log("Seeding stores...")
    for (const store of data.stores) {
      await client.query(
        `INSERT INTO stores (
          store_id, store_name, address, city, state, zip_code, region, store_type,
          square_footage, manager, manager_phone, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          store.storeId,
          store.storeName,
          store.address,
          store.city,
          store.state,
          store.zipCode,
          store.region,
          store.storeType,
          store.squareFootage,
          store.manager,
          store.managerPhone,
          store.isActive,
        ]
      )

      for (const [dayName, hours] of Object.entries(store.operatingHours)) {
        await client.query(
          `INSERT INTO operating_hours (store_id, day_name, hours) VALUES ($1, $2, $3)`,
          [store.storeId, dayName, hours]
        )
      }
    }

    console.log("Seeding products...")
    for (const product of data.products) {
      await client.query(
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
    }

    console.log("Seeding store-vendor relationships...")
    for (const rel of data.storeVendorRelationships) {
      await client.query(
        `INSERT INTO store_vendor_relationships (
          relationship_id, store_id, vendor_id, vendor_representative, vendor_phone,
          delivery_frequency, delivery_days, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          rel.relationshipId,
          rel.storeId,
          rel.vendorId,
          rel.vendorRepresentative,
          rel.vendorPhone,
          rel.deliveryFrequency,
          JSON.stringify(rel.deliveryDays),
          rel.isActive,
        ]
      )
    }

    console.log("Seeding store product availability...")
    for (const item of data.storeProductAvailability) {
      await client.query(
        `INSERT INTO store_product_availability (
          availability_id, store_id, sku, retail_price, is_available,
          min_stock_level, max_stock_level, reorder_point
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          item.availabilityId,
          item.storeId,
          item.sku,
          item.retailPrice,
          item.isAvailable,
          item.minStockLevel,
          item.maxStockLevel,
          item.reorderPoint,
        ]
      )
    }

    console.log("Seeding inventory...")
    for (const record of data.inventory) {
      await client.query(
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
    }

    const counts = await client.query(`
      SELECT 'categories' AS table_name, COUNT(*)::int AS count FROM categories
      UNION ALL SELECT 'vendors', COUNT(*)::int FROM vendors
      UNION ALL SELECT 'stores', COUNT(*)::int FROM stores
      UNION ALL SELECT 'products', COUNT(*)::int FROM products
      UNION ALL SELECT 'inventory', COUNT(*)::int FROM inventory
    `)

    console.log("Seed complete:")
    console.table(counts.rows)
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code?: string }).code === "42501"
    ) {
      console.error(
        "\nPermission denied for mdm_user on the public schema (common on PostgreSQL 15+).\n" +
          "Connect as postgres and run:\n\n" +
          "  psql -U postgres -d mdm_db\n" +
          "  GRANT ALL ON SCHEMA public TO mdm_user;\n" +
          "  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO mdm_user;\n" +
          "  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO mdm_user;\n"
      )
    }
    throw error
  } finally {
    await client.end()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
