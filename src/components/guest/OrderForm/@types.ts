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

export interface IOrderFormProps {
  guestName: string
  tableNumber: number
  selectedId: Id<"menuItems"> | null
  categories: IMenuCategorySection[]
  isSubmitting: boolean
  canSubmit: boolean
  submitLabel?: string
  onGuestNameChange: (name: string) => void
  onSelectItem: (itemId: Id<"menuItems">) => void
  onSubmit: () => void
}
