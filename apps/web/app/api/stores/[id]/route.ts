import { storesAPI } from "@/lib/api"
import { apiError, apiSuccess } from "@/lib/api-response"
import type { Store } from "@/lib/types"

type RouteParams = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const store = await storesAPI.get(id)
    if (!store) return apiError("Store not found", 404)
    return apiSuccess(store)
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to get store")
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const updates = (await request.json()) as Partial<Store>
    const store = await storesAPI.update(id, updates)
    if (!store) return apiError("Store not found", 404)
    return apiSuccess(store)
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to update store", 400)
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    await storesAPI.delete(id)
    return apiSuccess({ id })
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to delete store")
  }
}
