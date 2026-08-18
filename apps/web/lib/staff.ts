export function getStaffEmail() {
  return process.env.STAFF_EMAIL ?? "admin@convenience-store.com"
}

export async function requireStaff() {
  return { email: getStaffEmail() }
}
