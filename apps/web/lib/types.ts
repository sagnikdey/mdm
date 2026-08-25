export interface Store {
  storeId: string
  storeName: string
  address: string
  city: string
  state: string
  zipCode: string
  region: string
  storeType: "standalone" | "kiosk" | "express"
  operatingHours: Record<string, string>
  squareFootage: number
  manager: string
  managerPhone: string
  isActive: boolean
}

export interface Vendor {
  vendorId: string
  vendorName: string
  vendorCategory: string
  contactPerson: string
  email: string
  phone: string
  address: string
  paymentTerms: string
  isActive: boolean
  minimumOrderQuantity: number
}

export interface Category {
  categoryId: string
  categoryName: string
  parentCategoryId: string | null
  description: string
}

export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[]
}

export interface Product {
  sku: string
  productName: string
  brand: string
  manufacturer: string
  categoryId: string
  vendorId: string
  vendorSku: string
  description: string
  unitOfMeasure: string
  unitsPerCase: number
  wholesalePrice: number
  weight: number
  weightUnit: string
  barcode: string
  packType: string
  packSize: number
  baseUnitSku: string | null
  isActive: boolean
}

export interface StoreVendorRelationship {
  relationshipId: string
  storeId: string
  vendorId: string
  vendorRepresentative: string
  vendorPhone: string
  deliveryFrequency: string
  deliveryDays: string[]
  isActive: boolean
}

export interface StoreProductAvailability {
  availabilityId: string
  storeId: string
  sku: string
  retailPrice: number
  isAvailable: boolean
  minStockLevel: number
  maxStockLevel: number
  reorderPoint: number
}

export interface InventoryRecord {
  inventoryId: string
  storeId: string
  sku: string
  currentQuantity: number
  unitOfMeasure: string
  lastCountDate: string
  nextCountDate: string
}

export type EntityType = "store" | "vendor" | "product" | "inventory"

export interface SearchResult {
  id: string
  type: EntityType
  title: string
  subtitle: string
  data: Record<string, unknown>
  matchedFields: string[]
  relevanceScore: number
}

export interface SearchFilters {
  entityType?: EntityType[]
  region?: string[]
  isActive?: boolean
  dateRange?: {
    start: Date
    end: Date
  }
}

export interface MdmData {
  metadata: {
    version: string
    lastUpdated: string
    source: string
    dataTypes: string[]
  }
  stores: Store[]
  vendors: Vendor[]
  categories: Category[]
  products: Product[]
  storeVendorRelationships: StoreVendorRelationship[]
  storeProductAvailability: StoreProductAvailability[]
  inventory: InventoryRecord[]
}
