import type { TAdminRole } from "@/lib/adminRoles"

export function canAccessDashboard(role: TAdminRole | null): boolean {
  return role === "super_admin" || role === "staff"
}

export function canAccessMenu(role: TAdminRole | null): boolean {
  return role === "super_admin" || role === "staff"
}

export function canAccessTablesPage(role: TAdminRole | null): boolean {
  return role === "super_admin"
}

export function canAccessSettings(role: TAdminRole | null): boolean {
  return role === "super_admin"
}

export function canListTablesForFilter(role: TAdminRole | null): boolean {
  return canAccessDashboard(role) || role === "server"
}
