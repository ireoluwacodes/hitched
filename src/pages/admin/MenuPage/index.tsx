import { useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@convex-api/_generated/api"
import type { Doc } from "@convex-api/_generated/dataModel"
import { getAdminSession } from "@/lib/adminSession"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { MenuItemDialog } from "@/components/admin/MenuItemDialog"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, PencilEdit01Icon, Delete02Icon } from "@hugeicons/core-free-icons"
import { toast } from "sonner"

export function MenuPage() {
  const sessionToken = getAdminSession() ?? ""
  const menu = useQuery(api.menu.getActiveMenu)
  const toggleAvailability = useMutation(api.menuMutations.toggleAvailability)
  const deleteItem = useMutation(api.menuMutations.deleteItem)
  const upsertCategory = useMutation(api.menuMutations.upsertCategory)
  const deleteCategory = useMutation(api.menuMutations.deleteCategory)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Doc<"menuItems"> | null>(null)
  const [defaultCategoryId, setDefaultCategoryId] = useState<string | undefined>()
  const [newCategoryName, setNewCategoryName] = useState("")

  function openAddItem(categoryId: string) {
    setEditingItem(null)
    setDefaultCategoryId(categoryId)
    setDialogOpen(true)
  }

  function openEditItem(item: Doc<"menuItems">) {
    setEditingItem(item)
    setDefaultCategoryId(undefined)
    setDialogOpen(true)
  }

  async function handleToggle(itemId: Doc<"menuItems">["_id"], isAvailable: boolean) {
    await toggleAvailability({ sessionToken, itemId, isAvailable })
  }

  async function handleDeleteItem(itemId: Doc<"menuItems">["_id"]) {
    await deleteItem({ sessionToken, itemId })
    toast.success("Item deleted")
  }

  async function handleAddCategory() {
    if (!newCategoryName.trim()) return
    const sortOrder = menu?.length ?? 0
    await upsertCategory({
      sessionToken,
      name: newCategoryName.trim(),
      sortOrder,
    })
    setNewCategoryName("")
    toast.success("Category added")
  }

  const flatCategories = menu ?? []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-medium">Menu</h1>
          <p className="text-sm text-muted-foreground">
            Manage categories and items. Toggle availability to 86 sold-out dishes.
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="New category name"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          className="max-w-xs"
        />
        <Button variant="outline" onClick={handleAddCategory}>
          Add category
        </Button>
      </div>

      {flatCategories.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No menu items yet. Add a category to get started.
        </p>
      ) : (
        flatCategories.map((category) => (
          <Card key={category._id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-heading text-lg">{category.name}</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openAddItem(category._id)}>
                  <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="size-3.5" />
                  Add item
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-destructive">
                      <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} className="size-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete category?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will delete all items in &quot;{category.name}&quot;.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteCategory({ sessionToken, categoryId: category._id })}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {category.items.length === 0 ? (
                <p className="text-sm text-muted-foreground">No items in this category.</p>
              ) : (
                category.items.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between gap-4 rounded-md border border-border px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium ${!item.isAvailable ? "line-through opacity-60" : ""}`}>
                        {item.name}
                      </p>
                      {item.description && (
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={item.isAvailable}
                          onCheckedChange={(checked) => handleToggle(item._id, checked)}
                        />
                        <Label className="text-xs text-muted-foreground">Available</Label>
                      </div>
                      <Button variant="ghost" size="icon-sm" onClick={() => openEditItem(item)}>
                        <HugeiconsIcon icon={PencilEdit01Icon} strokeWidth={2} className="size-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon-sm" className="text-destructive">
                            <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} className="size-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete item?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Remove &quot;{item.name}&quot; from the menu?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteItem(item._id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        ))
      )}

      <MenuItemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        sessionToken={sessionToken}
        categories={flatCategories}
        item={editingItem}
        defaultCategoryId={defaultCategoryId as never}
      />
    </div>
  )
}
