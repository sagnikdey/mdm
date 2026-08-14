import type {
  Category,
  CategoryTreeNode,
  InventoryRecord,
  Product,
  SearchResult,
  Store,
  StoreProductAvailability,
  StoreVendorRelationship,
  Vendor,
} from "@/lib/types"

type ApiResponse<T> = {
  success: boolean
  data?: T
  count?: number
  error?: string
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  })

  const json = (await response.json()) as ApiResponse<T>

  if (!response.ok || !json.success) {
    throw new Error(json.error ?? `Request failed: ${response.status}`)
  }

  return json.data as T
}

export const storesAPI = {
  list: () => request<Store[]>("/api/stores"),
  get: (id: string) => request<Store>(`/api/stores/${id}`),
  create: (store: Store) =>
    request<Store>("/api/stores", {
      method: "POST",
      body: JSON.stringify(store),
    }),
  update: (id: string, updates: Partial<Store>) =>
    request<Store>(`/api/stores/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    }),
  delete: (id: string) =>
    request<void>(`/api/stores/${id}`, { method: "DELETE" }),
}

export const vendorsAPI = {
  list: () => request<Vendor[]>("/api/vendors"),
  get: (id: string) => request<Vendor>(`/api/vendors/${id}`),
  create: (vendor: Vendor) =>
    request<Vendor>("/api/vendors", {
      method: "POST",
      body: JSON.stringify(vendor),
    }),
  update: (id: string, updates: Partial<Vendor>) =>
    request<Vendor>(`/api/vendors/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    }),
  delete: (id: string) =>
    request<void>(`/api/vendors/${id}`, { method: "DELETE" }),
}

export const productsAPI = {
  list: () => request<Product[]>("/api/products"),
  get: (sku: string) => request<Product>(`/api/products/${sku}`),
  create: (product: Product) =>
    request<Product>("/api/products", {
      method: "POST",
      body: JSON.stringify(product),
    }),
  update: (sku: string, updates: Partial<Product>) =>
    request<Product>(`/api/products/${sku}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    }),
  delete: (sku: string) =>
    request<void>(`/api/products/${sku}`, { method: "DELETE" }),
}

export const categoriesAPI = {
  list: () => request<Category[]>("/api/categories"),
  tree: () => request<CategoryTreeNode[]>("/api/categories?tree=true"),
}

export const inventoryAPI = {
  list: () => request<InventoryRecord[]>("/api/inventory"),
  get: (id: string) => request<InventoryRecord>(`/api/inventory/${id}`),
  getByStore: (storeId: string) =>
    request<InventoryRecord[]>(`/api/inventory?storeId=${storeId}`),
  create: (record: InventoryRecord) =>
    request<InventoryRecord>("/api/inventory", {
      method: "POST",
      body: JSON.stringify(record),
    }),
  update: (id: string, updates: Partial<InventoryRecord>) =>
    request<InventoryRecord>(`/api/inventory/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    }),
}

export const relationshipsAPI = {
  list: () => request<StoreVendorRelationship[]>("/api/relationships"),
  getByStore: (storeId: string) =>
    request<StoreVendorRelationship[]>(
      `/api/relationships?storeId=${storeId}`
    ),
  getByVendor: (vendorId: string) =>
    request<StoreVendorRelationship[]>(
      `/api/relationships?vendorId=${vendorId}`
    ),
}

export const availabilityAPI = {
  list: () => request<StoreProductAvailability[]>("/api/availability"),
  getByStore: (storeId: string) =>
    request<StoreProductAvailability[]>(
      `/api/availability?storeId=${storeId}`
    ),
  getBySku: (sku: string) =>
    request<StoreProductAvailability[]>(`/api/availability?sku=${sku}`),
}

export async function searchAPI(query: string): Promise<SearchResult[]> {
  const params = new URLSearchParams({ q: query })
  return request<SearchResult[]>(`/api/search?${params.toString()}`)
}
