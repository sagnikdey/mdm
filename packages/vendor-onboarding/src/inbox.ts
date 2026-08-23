import { listPendingProductInboxItems } from "./catalog"
import { isMissingRelation } from "./portal-schema"
import { listPendingInboxItems as listPendingProfileInboxItems } from "./profile-edits"

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
