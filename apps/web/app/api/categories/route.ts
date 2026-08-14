import { categoriesAPI } from "@/lib/api"
import { apiError, apiSuccess } from "@/lib/api-response"
import { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const tree = request.nextUrl.searchParams.get("tree") === "true"
    const data = tree ? await categoriesAPI.tree() : await categoriesAPI.list()
    return apiSuccess(data)
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to list categories")
  }
}
