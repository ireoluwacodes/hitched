import type { TAdminRole } from "@/lib/adminRoles"

const SESSION_KEY = "hitched_admin_session"
const ROLE_KEY = "hitched_admin_role"

export function getAdminSession(): string | null {
  return sessionStorage.getItem(SESSION_KEY)
}

export function getAdminRole(): TAdminRole | null {
  const role = sessionStorage.getItem(ROLE_KEY)
  if (role === "super_admin" || role === "staff" || role === "server") {
    return role
  }
  return null
}

export function setAdminSession(token: string, role: TAdminRole): void {
  sessionStorage.setItem(SESSION_KEY, token)
  sessionStorage.setItem(ROLE_KEY, role)
}

export function clearAdminSession(): void {
  sessionStorage.removeItem(SESSION_KEY)
  sessionStorage.removeItem(ROLE_KEY)
}

export function isSuperAdmin(): boolean {
  return getAdminRole() === "super_admin"
}

export function isStaff(): boolean {
  return getAdminRole() === "staff"
}
