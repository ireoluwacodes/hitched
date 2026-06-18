import { query, mutation } from "./_generated/server"
import { v } from "convex/values"
import { requireAdminSession } from "./lib/auth"
import { generateToken } from "./lib/crypto"
import { getEventSettings } from "./lib/settings"
import { resolveProductName } from "./lib/branding"

export const getByToken = query({
  args: { qrToken: v.string() },
  handler: async (ctx, { qrToken }) => {
    const table = await ctx.db
      .query("tables")
      .withIndex("by_qrToken", (q) => q.eq("qrToken", qrToken))
      .unique()

    if (!table) return null

    const settings = await getEventSettings(ctx)

    return {
      table,
      orderingOpen: settings?.orderingOpen ?? false,
      eventName: settings?.eventName,
      productName: resolveProductName(settings?.productName),
    }
  },
})

export const list = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, { sessionToken }) => {
    await requireAdminSession(ctx, sessionToken)
    const tables = await ctx.db.query("tables").collect()
    return tables.sort((a, b) => a.number - b.number)
  },
})

export const setCount = mutation({
  args: {
    count: v.number(),
    sessionToken: v.string(),
  },
  handler: async (ctx, { count, sessionToken }) => {
    await requireAdminSession(ctx, sessionToken)

    if (count < 1) {
      throw new Error("Table count must be at least 1")
    }

    const existing = await ctx.db.query("tables").collect()
    const existingCount = existing.length

    if (count <= existingCount) {
      return {
        created: 0,
        total: existingCount,
        message:
          count < existingCount
            ? "Cannot decrease table count. Additive only."
            : "No new tables needed.",
      }
    }

    const maxNumber = existing.reduce((max, t) => Math.max(max, t.number), 0)

    for (let i = maxNumber + 1; i <= count; i++) {
      await ctx.db.insert("tables", {
        number: i,
        qrToken: generateToken(),
      })
    }

    return {
      created: count - existingCount,
      total: count,
      message: `Added ${count - existingCount} table(s).`,
    }
  },
})
