import { mutation } from "./_generated/server"
import { generateSalt, generateToken, hashPin } from "./lib/crypto"
import { getEventSettings } from "./lib/settings"

export default mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await getEventSettings(ctx)
    if (!existing) {
      const pinSalt = generateSalt()
      const pinHash = await hashPin("1234", pinSalt)
      await ctx.db.insert("eventSettings", {
        pinHash,
        pinSalt,
        eventName: "Ade & Chioma's Wedding",
        productName: "Hitched",
        orderingOpen: true,
      })
    }

    const tableCount = (await ctx.db.query("tables").collect()).length
    if (tableCount === 0) {
      for (let i = 1; i <= 10; i++) {
        await ctx.db.insert("tables", {
          number: i,
          qrToken: generateToken(),
        })
      }
    }

    const categoryCount = (await ctx.db.query("menuCategories").collect()).length
    if (categoryCount === 0) {
      const mainsId = await ctx.db.insert("menuCategories", {
        name: "Main",
        sortOrder: 0,
      })
      const drinksId = await ctx.db.insert("menuCategories", {
        name: "Drinks",
        sortOrder: 1,
      })
      const dessertId = await ctx.db.insert("menuCategories", {
        name: "Dessert",
        sortOrder: 2,
      })

      const mains = [
        { name: "Jollof Rice + Chicken", description: "Classic party jollof" },
        { name: "Fried Rice + Turkey", description: "Seasoned fried rice" },
        { name: "Amala + Ewedu", description: "With assorted meat" },
        { name: "Pounded Yam + Egusi", description: "Rich egusi soup" },
      ]

      for (let i = 0; i < mains.length; i++) {
        await ctx.db.insert("menuItems", {
          categoryId: mainsId,
          name: mains[i].name,
          description: mains[i].description,
          isAvailable: true,
          sortOrder: i,
        })
      }

      const drinks = ["Malt", "Coke", "Water", "Chapman"]
      for (let i = 0; i < drinks.length; i++) {
        await ctx.db.insert("menuItems", {
          categoryId: drinksId,
          name: drinks[i],
          isAvailable: true,
          sortOrder: i,
        })
      }

      const desserts = ["Ice Cream", "Small Chops"]
      for (let i = 0; i < desserts.length; i++) {
        await ctx.db.insert("menuItems", {
          categoryId: dessertId,
          name: desserts[i],
          isAvailable: true,
          sortOrder: i,
        })
      }
    }

    return { seeded: true }
  },
})
