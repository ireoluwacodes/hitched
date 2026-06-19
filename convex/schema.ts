import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export const orderStatus = v.union(
  v.literal("pending"),
  v.literal("preparing"),
  v.literal("ready_for_pickup"),
  v.literal("served")
)

export const orderSource = v.union(v.literal("guest"), v.literal("server"))

export const adminRole = v.union(
  v.literal("super_admin"),
  v.literal("staff"),
  v.literal("server")
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
    guestEditToken: v.optional(v.string()),
    guestDeviceId: v.optional(v.string()),
    orderSource: v.optional(orderSource),
    childItemIds: v.optional(v.array(v.id("menuItems"))),
    childItemNamesSnapshot: v.optional(v.array(v.string())),
    isForKid: v.optional(v.boolean()),
    serverDeviceId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_table", ["tableId"])
    .index("by_createdAt", ["createdAt"])
    .index("by_table_device", ["tableId", "guestDeviceId"])
    .index("by_server_device", ["serverDeviceId"]),

  eventSettings: defineTable({
    pinSalt: v.string(),
    superAdminPinHash: v.optional(v.string()),
    staffPinHash: v.optional(v.string()),
    serverPinHash: v.optional(v.string()),
    pinHash: v.optional(v.string()),
    eventName: v.optional(v.string()),
    productName: v.optional(v.string()),
    orderingOpen: v.boolean(),
  }),

  adminSessions: defineTable({
    token: v.string(),
    role: v.optional(adminRole),
    expiresAt: v.number(),
  }).index("by_token", ["token"]),
})
