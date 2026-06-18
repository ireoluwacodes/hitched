import { useEffect, useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@convex-api/_generated/api"
import { getAdminSession } from "@/lib/adminSession"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { toast } from "sonner"

export function SettingsPage() {
  const sessionToken = getAdminSession() ?? ""
  const settings = useQuery(api.eventSettings.getAdmin, { sessionToken })
  const updateSettings = useMutation(api.eventSettings.updateSettings)
  const setPin = useMutation(api.eventSettings.setPin)

  const [eventName, setEventName] = useState("")
  const [productName, setProductName] = useState("")
  const [orderingOpen, setOrderingOpen] = useState(true)
  const [newPin, setNewPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (settings) {
      setEventName(settings.eventName ?? "")
      setProductName(settings.productName ?? "")
      setOrderingOpen(settings.orderingOpen)
    }
  }, [settings])

  async function handleSaveSettings() {
    setIsSaving(true)
    try {
      await updateSettings({
        sessionToken,
        eventName: eventName.trim() || undefined,
        productName: productName.trim() || undefined,
        orderingOpen,
      })
      toast.success("Settings saved")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save settings")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleChangePin() {
    if (newPin !== confirmPin) {
      toast.error("PINs do not match")
      return
    }
    if (newPin.length < 4) {
      toast.error("PIN must be at least 4 characters")
      return
    }
    try {
      await setPin({ sessionToken, newPin })
      setNewPin("")
      setConfirmPin("")
      toast.success("PIN updated")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update PIN")
    }
  }

  return (
    <div className="flex max-w-lg flex-col gap-8">
      <div>
        <h1 className="font-heading text-2xl font-medium">Settings</h1>
        <p className="text-sm text-muted-foreground">Event configuration and access control.</p>
      </div>

      <section className="flex flex-col gap-4 rounded-lg border border-border p-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="product-name">Product name</Label>
          <Input
            id="product-name"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="Hitched"
          />
          <p className="text-xs text-muted-foreground">
            Shown in the sidebar, guest splash screen, and browser tab title.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="event-name">Event name</Label>
          <Input
            id="event-name"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            placeholder="Ade & Chioma's Wedding"
          />
        </div>

        <div className="flex items-center justify-between gap-4 rounded-md bg-muted/50 p-4">
          <div className="flex flex-col gap-1">
            <Label>Ordering open</Label>
            <p className="text-xs text-muted-foreground">
              When off, guests see a closed message instead of the menu.
            </p>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Switch checked={orderingOpen} onCheckedChange={setOrderingOpen} />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              Pausing stops new orders. Existing orders remain on the dashboard.
            </TooltipContent>
          </Tooltip>
        </div>

        <Button onClick={handleSaveSettings} disabled={isSaving}>
          Save settings
        </Button>
      </section>

      <section className="flex flex-col gap-4 rounded-lg border border-border p-4">
        <h2 className="font-heading text-lg font-medium">Change PIN</h2>
        <div className="flex flex-col gap-2">
          <Label htmlFor="new-pin">New PIN</Label>
          <Input
            id="new-pin"
            type="password"
            value={newPin}
            onChange={(e) => setNewPin(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="confirm-pin">Confirm PIN</Label>
          <Input
            id="confirm-pin"
            type="password"
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value)}
          />
        </div>
        <Button variant="outline" onClick={handleChangePin} disabled={!newPin}>
          Update PIN
        </Button>
      </section>
    </div>
  )
}
