import { query, mutation } from "./_generated/server"
import { v } from "convex/values"
import { adminRole } from "./schema"
import { getSessionExpiry, requireRole } from "./lib/auth"
import { generateSalt, generateToken, hashPin } from "./lib/crypto"
import { getEventSettings } from "./lib/settings"
import { resolveProductName } from "./lib/branding"

async function createSession(
  ctx: { db: { insert: (table: "adminSessions", doc: { token: string; role: "super_admin" | "staff" | "server"; expiresAt: number }) => Promise<unknown> } },
  role: "super_admin" | "staff" | "server"
) {
  const sessionToken = generateToken()
  await ctx.db.insert("adminSessions", {
    token: sessionToken,
    role,
    expiresAt: getSessionExpiry(),
  })
  return { sessionToken, role }
}

export const getPublic = query({
  args: {},
  handler: async (ctx) => {
    const settings = await getEventSettings(ctx)
    if (!settings) return null
    return {
      orderingOpen: settings.orderingOpen,
      eventName: settings.eventName,
      productName: resolveProductName(settings.productName),
    }
  },
})

export const getAdmin = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, { sessionToken }) => {
    const session = await requireRole(ctx, sessionToken, ["super_admin"])
    const settings = await getEventSettings(ctx)
    if (!settings) return null
    return {
      orderingOpen: settings.orderingOpen,
      eventName: settings.eventName,
      productName: resolveProductName(settings.productName),
      role: session.role,
    }
  },
})

export const verifyAdminPin = mutation({
  args: { pin: v.string() },
  handler: async (ctx, { pin }) => {
    const settings = await getEventSettings(ctx)
    if (!settings) {
      return { success: false as const, reason: "not_initialized" as const }
    }

    if (!settings.staffPinHash || !settings.serverPinHash) {
      return { success: false as const, reason: "needs_migration" as const }
    }

    const pinHash = await hashPin(pin, settings.pinSalt)
    const superAdminPinHash = settings.superAdminPinHash ?? settings.pinHash

    if (superAdminPinHash && pinHash === superAdminPinHash) {
      const session = await createSession(ctx, "super_admin")
      return { success: true as const, ...session }
    }
    if (settings.staffPinHash && pinHash === settings.staffPinHash) {
      const session = await createSession(ctx, "staff")
      return { success: true as const, ...session }
    }

    return { success: false as const, reason: "invalid_pin" as const }
  },
})

export const verifyServerPin = mutation({
  args: { pin: v.string() },
  handler: async (ctx, { pin }) => {
    const settings = await getEventSettings(ctx)
    if (!settings) {
      return { success: false as const, reason: "not_initialized" as const }
    }

    if (!settings.serverPinHash) {
      return { success: false as const, reason: "needs_migration" as const }
    }

    const pinHash = await hashPin(pin, settings.pinSalt)
    if (pinHash !== settings.serverPinHash) {
      return { success: false as const, reason: "invalid_pin" as const }
    }

    const session = await createSession(ctx, "server")
    return { success: true as const, ...session }
  },
})

export const initEvent = mutation({
  args: {
    superAdminPin: v.string(),
    staffPin: v.string(),
    serverPin: v.string(),
    eventName: v.optional(v.string()),
  },
  handler: async (ctx, { superAdminPin, staffPin, serverPin, eventName }) => {
    const existing = await getEventSettings(ctx)
    if (existing) {
      throw new Error("Event already initialized")
    }

    const pinSalt = generateSalt()
    const [superAdminPinHash, staffPinHash, serverPinHash] = await Promise.all([
      hashPin(superAdminPin, pinSalt),
      hashPin(staffPin, pinSalt),
      hashPin(serverPin, pinSalt),
    ])

    await ctx.db.insert("eventSettings", {
      pinSalt,
      superAdminPinHash,
      staffPinHash,
      serverPinHash,
      eventName,
      orderingOpen: true,
    })

    return { success: true }
  },
})

export const setRolePin = mutation({
  args: {
    sessionToken: v.string(),
    role: adminRole,
    newPin: v.string(),
  },
  handler: async (ctx, { sessionToken, role, newPin }) => {
    await requireRole(ctx, sessionToken, ["super_admin"])
    const settings = await getEventSettings(ctx)
    if (!settings) {
      throw new Error("Event not initialized")
    }

    const pinHash = await hashPin(newPin, settings.pinSalt)
    const field =
      role === "super_admin"
        ? "superAdminPinHash"
        : role === "staff"
          ? "staffPinHash"
          : "serverPinHash"

    await ctx.db.patch(settings._id, { [field]: pinHash })
  },
})

export const updateSettings = mutation({
  args: {
    sessionToken: v.string(),
    eventName: v.optional(v.string()),
    productName: v.optional(v.string()),
    orderingOpen: v.optional(v.boolean()),
  },
  handler: async (ctx, { sessionToken, eventName, productName, orderingOpen }) => {
    await requireRole(ctx, sessionToken, ["super_admin"])
    const settings = await getEventSettings(ctx)
    if (!settings) {
      throw new Error("Event not initialized")
    }

    const patch: {
      eventName?: string
      productName?: string
      orderingOpen?: boolean
    } = {}
    if (eventName !== undefined) patch.eventName = eventName
    if (productName !== undefined) patch.productName = productName.trim() || undefined
    if (orderingOpen !== undefined) patch.orderingOpen = orderingOpen

    await ctx.db.patch(settings._id, patch)
  },
})
