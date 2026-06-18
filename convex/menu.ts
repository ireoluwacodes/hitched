import { query } from "./_generated/server"

export const getActiveMenu = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db.query("menuCategories").collect()
    const sortedCategories = categories.sort((a, b) => a.sortOrder - b.sortOrder)

    const result = await Promise.all(
      sortedCategories.map(async (category) => {
        const items = await ctx.db
          .query("menuItems")
          .withIndex("by_category", (q) => q.eq("categoryId", category._id))
          .collect()

        return {
          ...category,
          items: items.sort((a, b) => a.sortOrder - b.sortOrder),
        }
      })
    )

    return result
  },
})
