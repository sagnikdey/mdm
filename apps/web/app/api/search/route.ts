import { universalSearch } from "@/lib/db/search"
import { apiError, apiSuccess } from "@/lib/api-response"
import { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get("q") ?? ""
    const results = await universalSearch(q)
    return apiSuccess(results)
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Search failed")
  }
}
