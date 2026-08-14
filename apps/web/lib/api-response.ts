import { NextResponse } from "next/server"

export function apiSuccess<T>(data: T, status = 200) {
  const count = Array.isArray(data) ? data.length : undefined
  return NextResponse.json({ success: true, data, count }, { status })
}

export function apiError(message: string, status = 500) {
  return NextResponse.json({ success: false, error: message }, { status })
}
