import { vendorsAPI } from "@/lib/api"
import { apiError, apiSuccess } from "@/lib/api-response"
import type { Vendor } from "@/lib/types"

type RouteParams = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const vendor = await vendorsAPI.get(id)
    if (!vendor) return apiError("Vendor not found", 404)
    return apiSuccess(vendor)
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to get vendor")
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const updates = (await request.json()) as Partial<Vendor>
    const vendor = await vendorsAPI.update(id, updates)
    if (!vendor) return apiError("Vendor not found", 404)
    return apiSuccess(vendor)
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to update vendor", 400)
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    await vendorsAPI.delete(id)
    return apiSuccess({ id })
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to delete vendor")
  }
}
