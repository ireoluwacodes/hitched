import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useMutation, useQuery } from "convex/react"
import { api } from "@convex-api/_generated/api"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { setAdminSession } from "@/lib/adminSession"
import { resolveProductName } from "@/lib/branding"
import { AppLogo } from "@/components/AppLogo"

export function PinGatePage() {
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const settings = useQuery(api.eventSettings.getPublic)
  const verifyPin = useMutation(api.eventSettings.verifyPin)
  const navigate = useNavigate()
  const productName = resolveProductName(settings?.productName)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    try {
      const { sessionToken } = await verifyPin({ pin })
      setAdminSession(sessionToken)
      navigate("/admin/dashboard")
    } catch {
      setError("Invalid PIN")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-6">
        <AppLogo className="mx-auto size-20" />
        <div className="flex flex-col gap-1 text-center">
          <p className="font-heading text-lg font-medium">{productName}</p>
          <h1 className="font-heading text-2xl font-medium">Staff access</h1>
          <p className="text-sm text-muted-foreground">Enter the event PIN to continue.</p>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="pin">PIN</Label>
          <Input
            id="pin"
            type="password"
            inputMode="numeric"
            autoComplete="off"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
          />
          {error && (
            <Badge variant="destructive" className="w-fit">
              {error}
            </Badge>
          )}
        </div>
        <Button type="submit" disabled={!pin || isLoading}>
          Enter
        </Button>
      </form>
    </div>
  )
}
