import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useMutation, useQuery } from "convex/react"
import { api } from "@convex-api/_generated/api"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { setServerSession } from "@/lib/serverSession"
import { resolveProductName } from "@/lib/branding"
import { AppLogo } from "@/components/AppLogo"

const PIN_ERROR_MESSAGES: Record<string, string> = {
  invalid_pin: "Invalid server PIN",
  not_initialized: "Event not set up yet. Refresh the page to seed data.",
  needs_migration: "Database needs migration. Run: bunx convex run migrate:default",
}

export function ServerPinGatePage() {
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const settings = useQuery(api.eventSettings.getPublic)
  const verifyServerPin = useMutation(api.eventSettings.verifyServerPin)
  const navigate = useNavigate()
  const productName = resolveProductName(settings?.productName)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    try {
      const result = await verifyServerPin({ pin })
      if (!result.success) {
        setError(PIN_ERROR_MESSAGES[result.reason] ?? "Invalid server PIN")
        return
      }
      setServerSession(result.sessionToken)
      navigate("/server/order")
    } catch {
      setError("Could not sign in. Try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/30 p-6">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-6 rounded-2xl border border-border bg-card p-8 shadow-sm"
      >
        <AppLogo className="mx-auto size-16" />
        <div className="flex flex-col gap-1 text-center">
          <p className="font-heading text-lg font-medium">{productName}</p>
          <h1 className="font-heading text-2xl font-medium">Server station</h1>
          <p className="text-sm text-muted-foreground">
            Take orders for guests without a phone.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="server-pin">Server PIN</Label>
          <Input
            id="server-pin"
            type="password"
            inputMode="numeric"
            autoComplete="off"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="h-12 text-center text-lg tracking-widest"
          />
          {error && (
            <Badge variant="destructive" className="w-fit">
              {error}
            </Badge>
          )}
        </div>
        <Button type="submit" className="h-12 text-base" disabled={!pin || isLoading}>
          Start taking orders
        </Button>
      </form>
    </div>
  )
}
