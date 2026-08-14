import { productsAPI } from "@/lib/api"
import { apiError, apiSuccess } from "@/lib/api-response"
import type { Product } from "@/lib/types"

export async function GET() {
  try {
    const products = await productsAPI.list()
    return apiSuccess(products)
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to list products")
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Product
    const product = await productsAPI.create(body)
    return apiSuccess(product, 201)
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to create product", 400)
  }
}
