import type { Id } from "@convex-api/_generated/dataModel"

export interface IMenuItemOption {
  _id: Id<"menuItems">
  name: string
  description?: string
  isAvailable: boolean
}

export interface IMenuCategorySection {
  _id: Id<"menuCategories">
  name: string
  items: IMenuItemOption[]
}

export type TSelectedItemsByCategory = Partial<
  Record<Id<"menuCategories">, Id<"menuItems">>
>

export interface IOrderFormProps {
  guestName: string
  tableNumber?: number
  selectedIds: TSelectedItemsByCategory
  childSelectedIds?: TSelectedItemsByCategory
  categories: IMenuCategorySection[]
  isSubmitting: boolean
  canSubmit: boolean
  submitLabel?: string
  hasChild?: boolean
  childOrderMode?: "combined" | "whole_order"
  showTableField?: boolean
  guestNameLabel?: string
  onGuestNameChange: (name: string) => void
  onHasChildChange?: (value: boolean) => void
  onSelectItem: (categoryId: Id<"menuCategories">, itemId: Id<"menuItems">) => void
  onSelectChildItem?: (categoryId: Id<"menuCategories">, itemId: Id<"menuItems">) => void
  onSubmit: () => void
}
