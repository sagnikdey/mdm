import { productsAPI } from "@/lib/api"
import { apiError, apiSuccess } from "@/lib/api-response"
import type { Product } from "@/lib/types"

type RouteParams = { params: Promise<{ sku: string }> }

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { sku } = await params
    const product = await productsAPI.get(sku)
    if (!product) return apiError("Product not found", 404)
    return apiSuccess(product)
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to get product")
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { sku } = await params
    const updates = (await request.json()) as Partial<Product>
    const product = await productsAPI.update(sku, updates)
    if (!product) return apiError("Product not found", 404)
    return apiSuccess(product)
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to update product", 400)
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { sku } = await params
    await productsAPI.delete(sku)
    return apiSuccess({ sku })
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to delete product")
  }
}
