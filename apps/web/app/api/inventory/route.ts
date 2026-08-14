import { inventoryAPI } from "@/lib/api"
import { apiError, apiSuccess } from "@/lib/api-response"
import type { InventoryRecord } from "@/lib/types"
import { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const storeId = request.nextUrl.searchParams.get("storeId")
    if (storeId) {
      const records = await inventoryAPI.getByStore(storeId)
      return apiSuccess(records)
    }

    const records = await inventoryAPI.list()
    return apiSuccess(records)
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to list inventory")
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as InventoryRecord
    const record = await inventoryAPI.create(body)
    return apiSuccess(record, 201)
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to create inventory", 400)
  }
}
