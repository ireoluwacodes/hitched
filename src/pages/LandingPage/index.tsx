import { Link } from "react-router-dom"
import { useQuery } from "convex/react"
import { api } from "@convex-api/_generated/api"
import { AppLogo } from "@/components/AppLogo"
import { Button } from "@/components/ui/button"
import { resolveProductName } from "@/lib/branding"

export function LandingPage() {
  const settings = useQuery(api.eventSettings.getPublic)
  const productName = resolveProductName(settings?.productName)

  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6 text-center">
      <div className="flex max-w-md flex-col items-center gap-6">
        <AppLogo className="size-24" />
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-3xl font-medium">{productName}</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Scan the QR code on your table to browse the menu and place your order.
            No app download needed.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to="/admin">Staff login</Link>
        </Button>
      </div>
    </div>
  )
}
