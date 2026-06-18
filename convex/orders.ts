import { query, mutation } from "./_generated/server"
import { v } from "convex/values"
import { orderStatus } from "./schema"
import { requireAdminSession } from "./lib/auth"
import { generateToken } from "./lib/crypto"
import { getEventSettings } from "./lib/settings"

async function snapshotItemNames(
  ctx: { db: { get: (id: import("./_generated/dataModel").Id<"menuItems">) => Promise<{ name: string } | null> } },
  itemIds: import("./_generated/dataModel").Id<"menuItems">[]
) {
  const names: string[] = []
  for (const itemId of itemIds) {
    const item = await ctx.db.get(itemId)
    if (!item) {
      throw new Error("Menu item not found")
    }
    names.push(item.name)
  }
  return names
}

export const listLive = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, { sessionToken }) => {
    await requireAdminSession(ctx, sessionToken)
    const orders = await ctx.db.query("orders").collect()
    return orders.sort((a, b) => a.createdAt - b.createdAt)
  },
})

export const getByGuestToken = query({
  args: {
    orderId: v.id("orders"),
    guestEditToken: v.string(),
  },
  handler: async (ctx, { orderId, guestEditToken }) => {
    const order = await ctx.db.get(orderId)
    if (!order || order.guestEditToken !== guestEditToken) {
      return null
    }
    return order
  },
})

export const listByGuestTokens = query({
  args: {
    tokens: v.array(
      v.object({
        orderId: v.id("orders"),
        guestEditToken: v.string(),
      })
    ),
  },
  handler: async (ctx, { tokens }) => {
    const orders = await Promise.all(
      tokens.map(async ({ orderId, guestEditToken }) => {
        const order = await ctx.db.get(orderId)
        if (!order || order.guestEditToken !== guestEditToken) {
          return null
        }
        return order
      })
    )
    return orders
      .filter((o): o is NonNullable<typeof o> => o !== null)
      .sort((a, b) => b.createdAt - a.createdAt)
  },
})

export const submit = mutation({
  args: {
    tableId: v.id("tables"),
    guestName: v.string(),
    itemIds: v.array(v.id("menuItems")),
  },
  handler: async (ctx, { tableId, guestName, itemIds }) => {
    const settings = await getEventSettings(ctx)
    if (!settings?.orderingOpen) {
      throw new Error("Ordering is currently closed")
    }

    if (itemIds.length === 0) {
      throw new Error("Select at least one item")
    }

    const trimmedName = guestName.trim()
    if (!trimmedName) {
      throw new Error("Name is required")
    }

    const table = await ctx.db.get(tableId)
    if (!table) {
      throw new Error("Table not found")
    }

    for (const itemId of itemIds) {
      const item = await ctx.db.get(itemId)
      if (!item?.isAvailable) {
        throw new Error(`"${item?.name ?? "Item"}" is sold out`)
      }
    }

    const itemNamesSnapshot = await snapshotItemNames(ctx, itemIds)
    const now = Date.now()
    const guestEditToken = generateToken()

    const orderId = await ctx.db.insert("orders", {
      tableId,
      tableNumber: table.number,
      guestName: trimmedName,
      itemIds,
      itemNamesSnapshot,
      status: "pending",
      guestEditToken,
      createdAt: now,
      updatedAt: now,
    })

    return { orderId, guestEditToken }
  },
})

export const edit = mutation({
  args: {
    orderId: v.id("orders"),
    guestEditToken: v.string(),
    guestName: v.string(),
    itemIds: v.array(v.id("menuItems")),
  },
  handler: async (ctx, { orderId, guestEditToken, guestName, itemIds }) => {
    const order = await ctx.db.get(orderId)
    if (!order || order.guestEditToken !== guestEditToken) {
      throw new Error("Order not found")
    }

    if (order.status !== "pending") {
      throw new Error("Order can no longer be edited")
    }

    if (itemIds.length === 0) {
      throw new Error("Select at least one item")
    }

    const trimmedName = guestName.trim()
    if (!trimmedName) {
      throw new Error("Name is required")
    }

    for (const itemId of itemIds) {
      const item = await ctx.db.get(itemId)
      if (!item?.isAvailable) {
        throw new Error(`"${item?.name ?? "Item"}" is sold out`)
      }
    }

    const itemNamesSnapshot = await snapshotItemNames(ctx, itemIds)

    await ctx.db.patch(orderId, {
      guestName: trimmedName,
      itemIds,
      itemNamesSnapshot,
      updatedAt: Date.now(),
    })
  },
})

export const updateStatus = mutation({
  args: {
    sessionToken: v.string(),
    orderId: v.id("orders"),
    status: orderStatus,
  },
  handler: async (ctx, { sessionToken, orderId, status }) => {
    await requireAdminSession(ctx, sessionToken)
    await ctx.db.patch(orderId, { status, updatedAt: Date.now() })
  },
})

export const bulkUpdateStatusByTable = mutation({
  args: {
    sessionToken: v.string(),
    tableId: v.id("tables"),
    status: orderStatus,
  },
  handler: async (ctx, { sessionToken, tableId, status }) => {
    await requireAdminSession(ctx, sessionToken)

    const orders = await ctx.db
      .query("orders")
      .withIndex("by_table", (q) => q.eq("tableId", tableId))
      .collect()

    const now = Date.now()
    for (const order of orders) {
      if (order.status !== status) {
        await ctx.db.patch(order._id, { status, updatedAt: now })
      }
    }

    return orders.length
  },
})

export const remove = mutation({
  args: {
    sessionToken: v.string(),
    orderId: v.id("orders"),
  },
  handler: async (ctx, { sessionToken, orderId }) => {
    await requireAdminSession(ctx, sessionToken)
    const order = await ctx.db.get(orderId)
    if (!order) {
      throw new Error("Order not found")
    }
    await ctx.db.delete(orderId)
  },
})

export const removeByGuest = mutation({
  args: {
    orderId: v.id("orders"),
    guestEditToken: v.string(),
  },
  handler: async (ctx, { orderId, guestEditToken }) => {
    const order = await ctx.db.get(orderId)
    if (!order || order.guestEditToken !== guestEditToken) {
      throw new Error("Order not found")
    }
    if (order.status !== "pending") {
      throw new Error("Order can no longer be cancelled")
    }
    await ctx.db.delete(orderId)
  },
})
