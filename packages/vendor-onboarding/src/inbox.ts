import { listPendingProductInboxItems } from "./catalog"
import { listPendingInboxItems as listPendingProfileInboxItems } from "./profile-edits"

export async function listAllPendingInboxItems() {
  const [profiles, products] = await Promise.all([
    listPendingProfileInboxItems(),
    listPendingProductInboxItems(),
  ])
  return [...profiles, ...products].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )
}
