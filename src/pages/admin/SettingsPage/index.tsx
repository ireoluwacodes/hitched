import { useEffect, useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@convex-api/_generated/api"
import { getAdminSession, isSuperAdmin } from "@/lib/adminSession"
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
import type { TAdminRole } from "@/lib/adminRoles"
import { ADMIN_ROLE_LABELS } from "@/lib/adminRoles"

const PIN_ROLES: TAdminRole[] = ["super_admin", "staff", "server"]

export function SettingsPage() {
  const sessionToken = getAdminSession() ?? ""
  const superAdmin = isSuperAdmin()
  const settings = useQuery(api.eventSettings.getAdmin, { sessionToken })
  const updateSettings = useMutation(api.eventSettings.updateSettings)
  const setRolePin = useMutation(api.eventSettings.setRolePin)

  const [eventName, setEventName] = useState("")
  const [productName, setProductName] = useState("")
  const [orderingOpen, setOrderingOpen] = useState(true)
  const [pinValues, setPinValues] = useState<Record<TAdminRole, { value: string; confirm: string }>>({
    super_admin: { value: "", confirm: "" },
    staff: { value: "", confirm: "" },
    server: { value: "", confirm: "" },
  })
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
        ...(superAdmin ? { productName: productName.trim() || undefined } : {}),
        orderingOpen,
      })
      toast.success("Settings saved")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save settings")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleChangePin(role: TAdminRole) {
    const { value, confirm } = pinValues[role]
    if (value !== confirm) {
      toast.error("PINs do not match")
      return
    }
    if (value.length < 4) {
      toast.error("PIN must be at least 4 characters")
      return
    }
    try {
      await setRolePin({ sessionToken, role, newPin: value })
      setPinValues((prev) => ({
        ...prev,
        [role]: { value: "", confirm: "" },
      }))
      toast.success(`${ADMIN_ROLE_LABELS[role]} PIN updated`)
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
        {superAdmin && (
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
        )}

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

      {superAdmin && (
        <section className="flex flex-col gap-6 rounded-lg border border-border p-4">
          <div>
            <h2 className="font-heading text-lg font-medium">Access PINs</h2>
            <p className="text-sm text-muted-foreground">
              Super admin: full back office. Staff: dashboard and menu. Server: order-taking only.
            </p>
          </div>

          {PIN_ROLES.map((role) => (
            <div key={role} className="flex flex-col gap-3 border-t border-border pt-4 first:border-t-0 first:pt-0">
              <h3 className="text-sm font-medium">{ADMIN_ROLE_LABELS[role]}</h3>
              <div className="flex flex-col gap-2">
                <Label htmlFor={`${role}-pin`}>New PIN</Label>
                <Input
                  id={`${role}-pin`}
                  type="password"
                  value={pinValues[role].value}
                  onChange={(e) =>
                    setPinValues((prev) => ({
                      ...prev,
                      [role]: { ...prev[role], value: e.target.value },
                    }))
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor={`${role}-confirm`}>Confirm PIN</Label>
                <Input
                  id={`${role}-confirm`}
                  type="password"
                  value={pinValues[role].confirm}
                  onChange={(e) =>
                    setPinValues((prev) => ({
                      ...prev,
                      [role]: { ...prev[role], confirm: e.target.value },
                    }))
                  }
                />
              </div>
              <Button
                variant="outline"
                onClick={() => handleChangePin(role)}
                disabled={!pinValues[role].value}
              >
                Update {ADMIN_ROLE_LABELS[role]} PIN
              </Button>
            </div>
          ))}
        </section>
      )}
    </div>
  )
}
