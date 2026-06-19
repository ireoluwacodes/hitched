import { mutation } from "./_generated/server"
import { hashPin } from "./lib/crypto"
import { getEventSettings } from "./lib/settings"

export default mutation({
  args: {},
  handler: async (ctx) => {
    let deletedSessions = 0
    const sessions = await ctx.db.query("adminSessions").collect()
    for (const session of sessions) {
      if (!session.role) {
        await ctx.db.delete(session._id)
        deletedSessions += 1
      }
    }

    const settings = await getEventSettings(ctx)
    let migratedSettings = false

    if (settings && !settings.superAdminPinHash) {
      const pinSalt = settings.pinSalt
      const superAdminPinHash =
        settings.pinHash ?? (await hashPin("1234", pinSalt))
      const [staffPinHash, serverPinHash] = await Promise.all([
        hashPin("5678", pinSalt),
        hashPin("9999", pinSalt),
      ])

      await ctx.db.patch(settings._id, {
        superAdminPinHash,
        staffPinHash,
        serverPinHash,
      })
      migratedSettings = true
    }

    return { deletedSessions, migratedSettings }
  },
})
