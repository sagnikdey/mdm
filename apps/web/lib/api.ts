import "server-only"

import {
  getCategory,
  getCategoryTree,
  listCategories,
} from "@/lib/db/categories"
import {
  createInventoryRecord,
  getInventoryByStore,
  getInventoryRecord,
  getNextInventoryId,
  listInventory,
  updateInventoryRecord,
} from "@/lib/db/inventory"
import {
  createProduct,
  deleteProduct,
  getProduct,
  listProducts,
  updateProduct,
} from "@/lib/db/products"
import {
  getAvailabilityBySku,
  getAvailabilityByStore,
  getRelationshipsByStore,
  getRelationshipsByVendor,
  listAvailability,
  listRelationships,
} from "@/lib/db/relationships"
import {
  createStore,
  deleteStore,
  getNextStoreId,
  getStore,
  listStores,
  updateStore,
} from "@/lib/db/stores"
import {
  createVendor,
  deleteVendor,
  getNextVendorId,
  getVendor,
  listVendors,
  updateVendor,
} from "@/lib/db/vendors"
import type {
  InventoryRecord,
  Product,
  Store,
  Vendor,
} from "@/lib/types"

export const storesAPI = {
  list: listStores,
  get: getStore,
  create: createStore,
  update: updateStore,
  delete: deleteStore,
  getNextId: getNextStoreId,
}

export const vendorsAPI = {
  list: listVendors,
  get: getVendor,
  create: createVendor,
  update: updateVendor,
  delete: deleteVendor,
  getNextId: getNextVendorId,
}

export const productsAPI = {
  list: listProducts,
  get: getProduct,
  create: createProduct,
  update: updateProduct,
  delete: deleteProduct,
}

export const categoriesAPI = {
  list: listCategories,
  get: getCategory,
  tree: getCategoryTree,
}

export const inventoryAPI = {
  list: listInventory,
  get: getInventoryRecord,
  getByStore: getInventoryByStore,
  create: createInventoryRecord,
  update: updateInventoryRecord,
  getNextId: getNextInventoryId,
}

export const relationshipsAPI = {
  list: listRelationships,
  getByStore: getRelationshipsByStore,
  getByVendor: getRelationshipsByVendor,
}

export const availabilityAPI = {
  list: listAvailability,
  getByStore: getAvailabilityByStore,
  getBySku: getAvailabilityBySku,
}

export type { Store, Vendor, Product, InventoryRecord }
