import type { MutationCtx, QueryCtx } from "../_generated/server"

const SESSION_DURATION_MS = 24 * 60 * 60 * 1000

export async function requireAdminSession(
  ctx: QueryCtx | MutationCtx,
  sessionToken: string
) {
  const session = await ctx.db
    .query("adminSessions")
    .withIndex("by_token", (q) => q.eq("token", sessionToken))
    .unique()

  if (!session || session.expiresAt <= Date.now()) {
    throw new Error("Unauthorized")
  }

  return session
}

export function getSessionExpiry(): number {
  return Date.now() + SESSION_DURATION_MS
}
