import { query, mutation } from "./_generated/server"
import { v } from "convex/values"
import { getSessionExpiry, requireAdminSession } from "./lib/auth"
import { generateSalt, generateToken, hashPin } from "./lib/crypto"
import { getEventSettings } from "./lib/settings"
import { resolveProductName } from "./lib/branding"

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
    await requireAdminSession(ctx, sessionToken)
    const settings = await getEventSettings(ctx)
    if (!settings) return null
    return {
      orderingOpen: settings.orderingOpen,
      eventName: settings.eventName,
      productName: resolveProductName(settings.productName),
    }
  },
})

export const verifyPin = mutation({
  args: { pin: v.string() },
  handler: async (ctx, { pin }) => {
    const settings = await getEventSettings(ctx)
    if (!settings) {
      throw new Error("Event not initialized")
    }

    const pinHash = await hashPin(pin, settings.pinSalt)
    if (pinHash !== settings.pinHash) {
      throw new Error("Invalid PIN")
    }

    const sessionToken = generateToken()
    await ctx.db.insert("adminSessions", {
      token: sessionToken,
      expiresAt: getSessionExpiry(),
    })

    return { sessionToken }
  },
})

export const initEvent = mutation({
  args: {
    pin: v.string(),
    eventName: v.optional(v.string()),
  },
  handler: async (ctx, { pin, eventName }) => {
    const existing = await getEventSettings(ctx)
    if (existing) {
      throw new Error("Event already initialized")
    }

    const pinSalt = generateSalt()
    const pinHash = await hashPin(pin, pinSalt)

    await ctx.db.insert("eventSettings", {
      pinHash,
      pinSalt,
      eventName,
      orderingOpen: true,
    })

    return { success: true }
  },
})

export const setPin = mutation({
  args: {
    sessionToken: v.string(),
    newPin: v.string(),
  },
  handler: async (ctx, { sessionToken, newPin }) => {
    await requireAdminSession(ctx, sessionToken)
    const settings = await getEventSettings(ctx)
    if (!settings) {
      throw new Error("Event not initialized")
    }

    const pinSalt = generateSalt()
    const pinHash = await hashPin(newPin, pinSalt)

    await ctx.db.patch(settings._id, { pinHash, pinSalt })
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
    await requireAdminSession(ctx, sessionToken)
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
