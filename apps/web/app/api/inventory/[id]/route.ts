import { inventoryAPI } from "@/lib/api"
import { apiError, apiSuccess } from "@/lib/api-response"
import type { InventoryRecord } from "@/lib/types"

type RouteParams = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const record = await inventoryAPI.get(id)
    if (!record) return apiError("Inventory record not found", 404)
    return apiSuccess(record)
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to get inventory")
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const updates = (await request.json()) as Partial<InventoryRecord>
    const record = await inventoryAPI.update(id, updates)
    if (!record) return apiError("Inventory record not found", 404)
    return apiSuccess(record)
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to update inventory", 400)
  }
}
