import { vendorsAPI } from "@/lib/api"
import { apiError, apiSuccess } from "@/lib/api-response"
import type { Vendor } from "@/lib/types"

export async function GET() {
  try {
    const vendors = await vendorsAPI.list()
    return apiSuccess(vendors)
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to list vendors")
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Vendor
    const vendor = await vendorsAPI.create(body)
    return apiSuccess(vendor, 201)
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to create vendor", 400)
  }
}
