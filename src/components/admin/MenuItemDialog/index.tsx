import { useState, useEffect } from "react"
import { useMutation } from "convex/react"
import { api } from "@convex-api/_generated/api"
import type { Id, Doc } from "@convex-api/_generated/dataModel"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface IMenuItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sessionToken: string
  categories: Doc<"menuCategories">[]
  item?: Doc<"menuItems"> | null
  defaultCategoryId?: Id<"menuCategories">
}

export function MenuItemDialog({
  open,
  onOpenChange,
  sessionToken,
  categories,
  item,
  defaultCategoryId,
}: IMenuItemDialogProps) {
  const upsertItem = useMutation(api.menuMutations.upsertItem)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [categoryId, setCategoryId] = useState<string>("")
  const [sortOrder, setSortOrder] = useState(0)
  const [isAvailable, setIsAvailable] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setName(item?.name ?? "")
      setDescription(item?.description ?? "")
      setCategoryId(item?.categoryId ?? defaultCategoryId ?? categories[0]?._id ?? "")
      setSortOrder(item?.sortOrder ?? 0)
      setIsAvailable(item?.isAvailable ?? true)
    }
  }, [open, item, defaultCategoryId, categories])

  async function handleSave() {
    if (!name.trim() || !categoryId) return
    setIsSaving(true)
    try {
      await upsertItem({
        sessionToken,
        itemId: item?._id,
        categoryId: categoryId as Id<"menuCategories">,
        name: name.trim(),
        description: description.trim() || undefined,
        sortOrder,
        isAvailable,
      })
      onOpenChange(false)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item ? "Edit item" : "Add item"}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat._id} value={cat._id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Sort order</Label>
            <Input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={isAvailable} onCheckedChange={setIsAvailable} />
            <Label>Available</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !name.trim()}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
