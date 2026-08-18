import { createHash, randomBytes } from "node:crypto"

export function generateRawToken() {
  return randomBytes(32).toString("base64url")
}

export function hashToken(rawToken: string) {
  return createHash("sha256").update(rawToken).digest("hex")
}
