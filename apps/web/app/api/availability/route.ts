import {
  getAvailabilityBySku,
  getAvailabilityByStore,
  listAvailability,
} from "@/lib/db/relationships"
import { apiError, apiSuccess } from "@/lib/api-response"
import { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const storeId = request.nextUrl.searchParams.get("storeId")
    const sku = request.nextUrl.searchParams.get("sku")

    if (storeId) {
      return apiSuccess(await getAvailabilityByStore(storeId))
    }

    if (sku) {
      return apiSuccess(await getAvailabilityBySku(sku))
    }

    return apiSuccess(await listAvailability())
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to list availability")
  }
}
