import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export const orderStatus = v.union(
  v.literal("pending"),
  v.literal("preparing"),
  v.literal("served")
)

export default defineSchema({
  tables: defineTable({
    number: v.number(),
    label: v.optional(v.string()),
    qrToken: v.string(),
  })
    .index("by_number", ["number"])
    .index("by_qrToken", ["qrToken"]),

  menuCategories: defineTable({
    name: v.string(),
    sortOrder: v.number(),
  }),

  menuItems: defineTable({
    categoryId: v.id("menuCategories"),
    name: v.string(),
    description: v.optional(v.string()),
    isAvailable: v.boolean(),
    sortOrder: v.number(),
  }).index("by_category", ["categoryId"]),

  orders: defineTable({
    tableId: v.id("tables"),
    tableNumber: v.number(),
    guestName: v.string(),
    itemIds: v.array(v.id("menuItems")),
    itemNamesSnapshot: v.array(v.string()),
    status: orderStatus,
    guestEditToken: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_table", ["tableId"])
    .index("by_createdAt", ["createdAt"]),

  eventSettings: defineTable({
    pinHash: v.string(),
    pinSalt: v.string(),
    eventName: v.optional(v.string()),
    productName: v.optional(v.string()),
    orderingOpen: v.boolean(),
  }),

  adminSessions: defineTable({
    token: v.string(),
    expiresAt: v.number(),
  }).index("by_token", ["token"]),
})
