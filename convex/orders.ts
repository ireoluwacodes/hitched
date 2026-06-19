import { query, mutation } from "./_generated/server"
import { v } from "convex/values"
import { orderStatus } from "./schema"
import { requireRole } from "./lib/auth"
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

async function validateOrderItems(
  ctx: { db: { get: (id: import("./_generated/dataModel").Id<"menuItems">) => Promise<{ name: string; isAvailable: boolean; categoryId: import("./_generated/dataModel").Id<"menuCategories"> } | null> } },
  itemIds: import("./_generated/dataModel").Id<"menuItems">[]
) {
  if (itemIds.length === 0) {
    throw new Error("Select at least one item")
  }

  const categories = new Set<import("./_generated/dataModel").Id<"menuCategories">>()

  for (const itemId of itemIds) {
    const item = await ctx.db.get(itemId)
    if (!item?.isAvailable) {
      throw new Error(`"${item?.name ?? "Item"}" is sold out`)
    }
    categories.add(item.categoryId)
  }

  if (categories.size !== itemIds.length) {
    throw new Error("Pick only one item per category")
  }
}

export const listLive = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, { sessionToken }) => {
    await requireRole(ctx, sessionToken, ["super_admin", "staff"])
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
    if (!order?.guestEditToken || order.guestEditToken !== guestEditToken) {
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
        if (!order?.guestEditToken || order.guestEditToken !== guestEditToken) {
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

export const getByDevice = query({
  args: {
    tableId: v.id("tables"),
    deviceId: v.string(),
  },
  handler: async (ctx, { tableId, deviceId }) => {
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_table_device", (q) =>
        q.eq("tableId", tableId).eq("guestDeviceId", deviceId)
      )
      .collect()

    const guestOrder = orders
      .filter((o) => o.orderSource !== "server")
      .sort((a, b) => b.createdAt - a.createdAt)[0]

    return guestOrder ?? null
  },
})

export const listByDevice = query({
  args: {
    tableId: v.id("tables"),
    deviceId: v.string(),
  },
  handler: async (ctx, { tableId, deviceId }) => {
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_table_device", (q) =>
        q.eq("tableId", tableId).eq("guestDeviceId", deviceId)
      )
      .collect()

    return orders
      .filter((o) => o.orderSource !== "server")
      .sort((a, b) => b.createdAt - a.createdAt)
  },
})

export const listByServerDevice = query({
  args: {
    sessionToken: v.string(),
    serverDeviceId: v.string(),
  },
  handler: async (ctx, { sessionToken, serverDeviceId }) => {
    await requireRole(ctx, sessionToken, ["server"])

    const deviceId = serverDeviceId.trim()
    if (!deviceId) return []

    const orders = await ctx.db
      .query("orders")
      .withIndex("by_server_device", (q) => q.eq("serverDeviceId", deviceId))
      .collect()

    const statusRank: Record<
      "pending" | "preparing" | "ready_for_pickup" | "served",
      number
    > = {
      ready_for_pickup: 0,
      preparing: 1,
      pending: 2,
      served: 3,
    }

    return orders
      .filter((order) => order.orderSource === "server")
      .sort((a, b) => {
        const statusDiff = statusRank[a.status] - statusRank[b.status]
        if (statusDiff !== 0) return statusDiff
        return b.createdAt - a.createdAt
      })
  },
})

export const submit = mutation({
  args: {
    tableId: v.id("tables"),
    guestName: v.string(),
    itemIds: v.array(v.id("menuItems")),
    childItemIds: v.optional(v.array(v.id("menuItems"))),
    guestDeviceId: v.string(),
  },
  handler: async (ctx, { tableId, guestName, itemIds, childItemIds = [], guestDeviceId }) => {
    const settings = await getEventSettings(ctx)
    if (!settings?.orderingOpen) {
      throw new Error("Ordering is currently closed")
    }

    const trimmedName = guestName.trim()
    if (!trimmedName) {
      throw new Error("Name is required")
    }

    const deviceId = guestDeviceId.trim()
    if (!deviceId) {
      throw new Error("Device ID is required")
    }

    const table = await ctx.db.get(tableId)
    if (!table) {
      throw new Error("Table not found")
    }

    const existing = await ctx.db
      .query("orders")
      .withIndex("by_table_device", (q) =>
        q.eq("tableId", tableId).eq("guestDeviceId", deviceId)
      )
      .collect()

    if (existing.some((o) => o.orderSource !== "server")) {
      throw new Error("You have already placed an order from this device")
    }

    await validateOrderItems(ctx, itemIds)

    if (childItemIds.length > 0) {
      await validateOrderItems(ctx, childItemIds)
    }

    const itemNamesSnapshot = await snapshotItemNames(ctx, itemIds)
    const childItemNamesSnapshot =
      childItemIds.length > 0 ? await snapshotItemNames(ctx, childItemIds) : undefined
    const now = Date.now()
    const guestEditToken = generateToken()

    const orderId = await ctx.db.insert("orders", {
      tableId,
      tableNumber: table.number,
      guestName: trimmedName,
      itemIds,
      itemNamesSnapshot,
      childItemIds: childItemIds.length > 0 ? childItemIds : undefined,
      childItemNamesSnapshot,
      status: "pending",
      guestEditToken,
      guestDeviceId: deviceId,
      orderSource: "guest",
      createdAt: now,
      updatedAt: now,
    })

    return { orderId, guestEditToken }
  },
})

export const submitByServer = mutation({
  args: {
    sessionToken: v.string(),
    tableId: v.id("tables"),
    guestName: v.string(),
    itemIds: v.array(v.id("menuItems")),
    isForKid: v.optional(v.boolean()),
    serverDeviceId: v.string(),
  },
  handler: async (
    ctx,
    { sessionToken, tableId, guestName, itemIds, isForKid, serverDeviceId }
  ) => {
    await requireRole(ctx, sessionToken, ["server"])

    const settings = await getEventSettings(ctx)
    if (!settings?.orderingOpen) {
      throw new Error("Ordering is currently closed")
    }

    const trimmedName = guestName.trim()
    if (!trimmedName) {
      throw new Error("Name is required")
    }

    const deviceId = serverDeviceId.trim()
    if (!deviceId) {
      throw new Error("Device ID is required")
    }

    const table = await ctx.db.get(tableId)
    if (!table) {
      throw new Error("Table not found")
    }

    await validateOrderItems(ctx, itemIds)

    const itemNamesSnapshot = await snapshotItemNames(ctx, itemIds)
    const now = Date.now()

    const orderId = await ctx.db.insert("orders", {
      tableId,
      tableNumber: table.number,
      guestName: trimmedName,
      itemIds,
      itemNamesSnapshot,
      status: "pending",
      orderSource: "server",
      serverDeviceId: deviceId,
      isForKid: isForKid ?? false,
      createdAt: now,
      updatedAt: now,
    })

    return { orderId }
  },
})

export const edit = mutation({
  args: {
    orderId: v.id("orders"),
    guestEditToken: v.string(),
    guestName: v.string(),
    itemIds: v.array(v.id("menuItems")),
    childItemIds: v.optional(v.array(v.id("menuItems"))),
  },
  handler: async (ctx, { orderId, guestEditToken, guestName, itemIds, childItemIds = [] }) => {
    const order = await ctx.db.get(orderId)
    if (!order?.guestEditToken || order.guestEditToken !== guestEditToken) {
      throw new Error("Order not found")
    }

    if (order.status !== "pending") {
      throw new Error("Order can no longer be edited")
    }

    const trimmedName = guestName.trim()
    if (!trimmedName) {
      throw new Error("Name is required")
    }

    await validateOrderItems(ctx, itemIds)

    if (childItemIds.length > 0) {
      await validateOrderItems(ctx, childItemIds)
    }

    const itemNamesSnapshot = await snapshotItemNames(ctx, itemIds)
    const childItemNamesSnapshot =
      childItemIds.length > 0 ? await snapshotItemNames(ctx, childItemIds) : undefined

    await ctx.db.patch(orderId, {
      guestName: trimmedName,
      itemIds,
      itemNamesSnapshot,
      childItemIds: childItemIds.length > 0 ? childItemIds : undefined,
      childItemNamesSnapshot,
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
    await requireRole(ctx, sessionToken, ["super_admin", "staff"])
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
    await requireRole(ctx, sessionToken, ["super_admin", "staff"])

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
    await requireRole(ctx, sessionToken, ["super_admin", "staff"])
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
    if (!order?.guestEditToken || order.guestEditToken !== guestEditToken) {
      throw new Error("Order not found")
    }
    if (order.status !== "pending") {
      throw new Error("Order can no longer be cancelled")
    }
    await ctx.db.delete(orderId)
  },
})
