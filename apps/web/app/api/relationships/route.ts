import {
  getAvailabilityBySku,
  getAvailabilityByStore,
  getRelationshipsByStore,
  getRelationshipsByVendor,
  listAvailability,
  listRelationships,
} from "@/lib/db/relationships"
import { apiError, apiSuccess } from "@/lib/api-response"
import { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const storeId = request.nextUrl.searchParams.get("storeId")
    const vendorId = request.nextUrl.searchParams.get("vendorId")

    if (storeId) {
      return apiSuccess(await getRelationshipsByStore(storeId))
    }

    if (vendorId) {
      return apiSuccess(await getRelationshipsByVendor(vendorId))
    }

    return apiSuccess(await listRelationships())
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to list relationships")
  }
}

export async function POST() {
  return apiError("Not implemented", 501)
}
