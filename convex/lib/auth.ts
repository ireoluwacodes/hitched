import type { MutationCtx, QueryCtx } from "../_generated/server"
import type { Doc } from "../_generated/dataModel"
import { adminRole } from "../schema"

const SESSION_DURATION_MS = 24 * 60 * 60 * 1000

export type TAdminRole = NonNullable<Doc<"adminSessions">["role"]>

export async function requireAdminSession(
  ctx: QueryCtx | MutationCtx,
  sessionToken: string
) {
  const session = await ctx.db
    .query("adminSessions")
    .withIndex("by_token", (q) => q.eq("token", sessionToken))
    .unique()

  if (!session || session.expiresAt <= Date.now() || !session.role) {
    throw new Error("Unauthorized")
  }

  return session as Doc<"adminSessions"> & { role: TAdminRole }
}

export async function requireRole(
  ctx: QueryCtx | MutationCtx,
  sessionToken: string,
  allowedRoles: TAdminRole[]
) {
  const session = await requireAdminSession(ctx, sessionToken)
  if (!allowedRoles.includes(session.role)) {
    throw new Error("Forbidden")
  }
  return session
}

export function getSessionExpiry(): number {
  return Date.now() + SESSION_DURATION_MS
}

export { adminRole }
