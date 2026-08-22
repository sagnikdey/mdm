type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

function hit(key: string, limit: number, windowMs: number) {
  const now = Date.now()
  const current = buckets.get(key)
  if (!current || current.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  if (current.count >= limit) return false
  current.count += 1
  return true
}

const HOUR = 60 * 60 * 1000

export function allowLoginRequest(email: string, ip: string) {
  return hit(`email:${email.toLowerCase()}`, 3, HOUR) && hit(`ip:${ip}`, 10, HOUR)
}

export function allowVerifyAttempt(ip: string) {
  return hit(`verify:${ip}`, 30, HOUR)
}
