export type TAdminRole = "super_admin" | "staff" | "server"

export const ADMIN_ROLE_LABELS: Record<TAdminRole, string> = {
  super_admin: "Super admin",
  staff: "Staff",
  server: "Server",
}
