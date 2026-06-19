import type { Id } from "@convex-api/_generated/dataModel"
import type { TSelectedItemsByCategory } from "@/components/guest/OrderForm/@types"

export function selectedIdsToArray(
  selectedIds: TSelectedItemsByCategory
): Id<"menuItems">[] {
  return Object.values(selectedIds).filter(
    (id): id is Id<"menuItems"> => id !== undefined
  )
}

export function hasSelectedItems(selectedIds: TSelectedItemsByCategory): boolean {
  return selectedIdsToArray(selectedIds).length > 0
}
