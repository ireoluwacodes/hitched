import { mutation } from "./_generated/server"
import { v } from "convex/values"
import { requireRole } from "./lib/auth"

export const upsertCategory = mutation({
  args: {
    sessionToken: v.string(),
    categoryId: v.optional(v.id("menuCategories")),
    name: v.string(),
    sortOrder: v.number(),
  },
  handler: async (ctx, { sessionToken, categoryId, name, sortOrder }) => {
    await requireRole(ctx, sessionToken, ["super_admin", "staff"])

    if (categoryId) {
      await ctx.db.patch(categoryId, { name, sortOrder })
      return categoryId
    }

    return await ctx.db.insert("menuCategories", { name, sortOrder })
  },
})

export const deleteCategory = mutation({
  args: {
    sessionToken: v.string(),
    categoryId: v.id("menuCategories"),
  },
  handler: async (ctx, { sessionToken, categoryId }) => {
    await requireRole(ctx, sessionToken, ["super_admin", "staff"])

    const items = await ctx.db
      .query("menuItems")
      .withIndex("by_category", (q) => q.eq("categoryId", categoryId))
      .collect()

    for (const item of items) {
      await ctx.db.delete(item._id)
    }

    await ctx.db.delete(categoryId)
  },
})

export const upsertItem = mutation({
  args: {
    sessionToken: v.string(),
    itemId: v.optional(v.id("menuItems")),
    categoryId: v.id("menuCategories"),
    name: v.string(),
    description: v.optional(v.string()),
    sortOrder: v.number(),
    isAvailable: v.boolean(),
  },
  handler: async (
    ctx,
    { sessionToken, itemId, categoryId, name, description, sortOrder, isAvailable }
  ) => {
    await requireRole(ctx, sessionToken, ["super_admin", "staff"])

    if (itemId) {
      await ctx.db.patch(itemId, {
        categoryId,
        name,
        description,
        sortOrder,
        isAvailable,
      })
      return itemId
    }

    return await ctx.db.insert("menuItems", {
      categoryId,
      name,
      description,
      sortOrder,
      isAvailable,
    })
  },
})

export const deleteItem = mutation({
  args: {
    sessionToken: v.string(),
    itemId: v.id("menuItems"),
  },
  handler: async (ctx, { sessionToken, itemId }) => {
    await requireRole(ctx, sessionToken, ["super_admin", "staff"])
    await ctx.db.delete(itemId)
  },
})

export const toggleAvailability = mutation({
  args: {
    sessionToken: v.string(),
    itemId: v.id("menuItems"),
    isAvailable: v.boolean(),
  },
  handler: async (ctx, { sessionToken, itemId, isAvailable }) => {
    await requireRole(ctx, sessionToken, ["super_admin", "staff"])
    await ctx.db.patch(itemId, { isAvailable })
  },
})
