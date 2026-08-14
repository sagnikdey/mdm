import { storesAPI } from "@/lib/api"
import { apiError, apiSuccess } from "@/lib/api-response"
import type { Store } from "@/lib/types"

export async function GET() {
  try {
    const stores = await storesAPI.list()
    return apiSuccess(stores)
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to list stores")
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Store
    const store = await storesAPI.create(body)
    return apiSuccess(store, 201)
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to create store", 400)
  }
}
