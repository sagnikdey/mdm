import { listPendingProductInboxItems } from "./catalog"
import { listPendingInboxItems as listPendingProfileInboxItems } from "./profile-edits"

function isMissingRelation(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    String(error.code) === "42P01"
  )
}

async function safeList<T>(fn: () => Promise<T[]>) {
  try {
    return await fn()
  } catch (error) {
    if (isMissingRelation(error)) {
      console.error("[vendor-submissions] portal table missing", error)
      return []
    }
    throw error
  }
}

export async function listAllPendingInboxItems() {
  const [profiles, products] = await Promise.all([
    safeList(listPendingProfileInboxItems),
    safeList(listPendingProductInboxItems),
  ])
  return [...profiles, ...products].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )
}
