import type {
  Category,
  InventoryRecord,
  Product,
  Store,
  StoreProductAvailability,
  StoreVendorRelationship,
  Vendor,
} from "@/lib/types"

export type StoreRow = {
  store_id: string
  store_name: string
  address: string
  city: string
  state: string
  zip_code: string
  region: string | null
  store_type: string
  square_footage: number | null
  manager: string | null
  manager_phone: string | null
  is_active: boolean
}

export type OperatingHoursRow = {
  day_name: string
  hours: string
}

export type VendorRow = {
  vendor_id: string
  vendor_name: string
  vendor_category: string
  contact_person: string | null
  email: string
  phone: string
  address: string
  payment_terms: string | null
  minimum_order_quantity: number | null
  is_active: boolean
}

export type CategoryRow = {
  category_id: string
  category_name: string
  parent_category_id: string | null
  description: string | null
}

export type ProductRow = {
  sku: string
  product_name: string
  brand: string | null
  manufacturer: string | null
  category_id: string
  vendor_id: string
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

export type RelationshipRow = {
  relationship_id: string
  store_id: string
  vendor_id: string
  vendor_representative: string | null
  vendor_phone: string | null
  delivery_frequency: string | null
  delivery_days: string[] | null
  is_active: boolean
}

export type AvailabilityRow = {
  availability_id: string
  store_id: string
  sku: string
  retail_price: string | number
  is_available: boolean
  min_stock_level: number | null
  max_stock_level: number | null
  reorder_point: number | null
}

export type InventoryRow = {
  inventory_id: string
  store_id: string
  sku: string
  current_quantity: number | null
  unit_of_measure: string | null
  last_count_date: Date | string | null
  next_count_date: Date | string | null
}

export function mapOperatingHours(
  rows: OperatingHoursRow[]
): Record<string, string> {
  return rows.reduce<Record<string, string>>((acc, row) => {
    acc[row.day_name] = row.hours
    return acc
  }, {})
}

export function mapStore(row: StoreRow, hours: OperatingHoursRow[] = []): Store {
  return {
    storeId: row.store_id,
    storeName: row.store_name,
    address: row.address,
    city: row.city,
    state: row.state,
    zipCode: row.zip_code,
    region: row.region ?? "",
    storeType: row.store_type as Store["storeType"],
    operatingHours: mapOperatingHours(hours),
    squareFootage: row.square_footage ?? 0,
    manager: row.manager ?? "",
    managerPhone: row.manager_phone ?? "",
    isActive: row.is_active,
  }
}

export function mapVendor(row: VendorRow): Vendor {
  return {
    vendorId: row.vendor_id,
    vendorName: row.vendor_name,
    vendorCategory: row.vendor_category,
    contactPerson: row.contact_person ?? "",
    email: row.email,
    phone: row.phone,
    address: row.address,
    paymentTerms: row.payment_terms ?? "",
    isActive: row.is_active,
    minimumOrderQuantity: row.minimum_order_quantity ?? 1,
  }
}

export function mapCategory(row: CategoryRow): Category {
  return {
    categoryId: row.category_id,
    categoryName: row.category_name,
    parentCategoryId: row.parent_category_id,
    description: row.description ?? "",
  }
}

export function mapProduct(row: ProductRow): Product {
  return {
    sku: row.sku,
    productName: row.product_name,
    brand: row.brand ?? "",
    manufacturer: row.manufacturer ?? "",
    categoryId: row.category_id,
    vendorId: row.vendor_id,
    vendorSku: row.vendor_sku,
    description: row.description ?? "",
    unitOfMeasure: row.unit_of_measure ?? "",
    unitsPerCase: row.units_per_case ?? 1,
    wholesalePrice: Number(row.wholesale_price),
    weight: Number(row.weight ?? 0),
    weightUnit: row.weight_unit ?? "lb",
    barcode: row.barcode ?? "",
    packType: row.pack_type ?? "case",
    packSize: row.pack_size ?? row.units_per_case ?? 1,
    baseUnitSku: row.base_unit_sku,
    isActive: row.is_active,
  }
}

export function mapRelationship(row: RelationshipRow): StoreVendorRelationship {
  return {
    relationshipId: row.relationship_id,
    storeId: row.store_id,
    vendorId: row.vendor_id,
    vendorRepresentative: row.vendor_representative ?? "",
    vendorPhone: row.vendor_phone ?? "",
    deliveryFrequency: row.delivery_frequency ?? "",
    deliveryDays: row.delivery_days ?? [],
    isActive: row.is_active,
  }
}

export function mapAvailability(
  row: AvailabilityRow
): StoreProductAvailability {
  return {
    availabilityId: row.availability_id,
    storeId: row.store_id,
    sku: row.sku,
    retailPrice: Number(row.retail_price),
    isAvailable: row.is_available,
    minStockLevel: row.min_stock_level ?? 0,
    maxStockLevel: row.max_stock_level ?? 0,
    reorderPoint: row.reorder_point ?? 0,
  }
}

function toDateString(value: Date | string | null | undefined): string {
  if (!value) return new Date().toISOString()
  if (value instanceof Date) return value.toISOString()
  return new Date(value).toISOString()
}

export function mapInventory(row: InventoryRow): InventoryRecord {
  return {
    inventoryId: row.inventory_id,
    storeId: row.store_id,
    sku: row.sku,
    currentQuantity: row.current_quantity ?? 0,
    unitOfMeasure: row.unit_of_measure ?? "",
    lastCountDate: toDateString(row.last_count_date),
    nextCountDate: toDateString(row.next_count_date),
  }
}
