import type { QueryCtx, MutationCtx } from "../_generated/server"

export async function getEventSettings(ctx: QueryCtx | MutationCtx) {
  return await ctx.db.query("eventSettings").first()
}

export async function requireEventSettings(ctx: QueryCtx | MutationCtx) {
  const settings = await getEventSettings(ctx)
  if (!settings) {
    throw new Error("Event not initialized")
  }
  return settings
}
