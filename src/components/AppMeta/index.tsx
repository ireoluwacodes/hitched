import { useMemo } from "react"
import { useLocation } from "react-router-dom"
import { useQuery } from "convex/react"
import { api } from "@convex-api/_generated/api"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { DEFAULT_META_DESCRIPTION, getAppLogoUrl, resolveProductName } from "@/lib/branding"

function titleForPath(pathname: string, productName: string): string {
  if (pathname === "/") {
    return `${productName} — Table ordering`
  }
  if (pathname === "/admin") {
    return `Staff login · ${productName}`
  }
  if (pathname.startsWith("/admin/dashboard")) {
    return `Dashboard · ${productName}`
  }
  if (pathname.startsWith("/admin/menu")) {
    return `Menu · ${productName}`
  }
  if (pathname.startsWith("/admin/tables")) {
    return `Tables & QR · ${productName}`
  }
  if (pathname.startsWith("/admin/settings")) {
    return `Settings · ${productName}`
  }
  if (pathname.includes("/order/")) {
    return `Edit order · ${productName}`
  }
  if (pathname.startsWith("/t/")) {
    return `Order · ${productName}`
  }
  return productName
}

export function AppMeta() {
  const { pathname } = useLocation()
  const settings = useQuery(api.eventSettings.getPublic)
  const productName = resolveProductName(settings?.productName)

  const title = useMemo(
    () => titleForPath(pathname, productName),
    [pathname, productName]
  )

  const description = useMemo(() => {
    if (settings?.eventName) {
      return `${settings.eventName} — ${DEFAULT_META_DESCRIPTION}`
    }
    return DEFAULT_META_DESCRIPTION
  }, [settings?.eventName])

  useDocumentMeta({ title, description, imageUrl: getAppLogoUrl() })

  return null
}
