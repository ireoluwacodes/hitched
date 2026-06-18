import { useEffect, useMemo, useState } from "react"
import { AppLogo } from "@/components/AppLogo"
import { cn } from "@/lib/utils"
import type { IGuestIntroSplashProps } from "./@types"

const TYPE_MS = 95
const PAUSE_AFTER_MS = 700

export function GuestIntroSplash({ productName, eventName, onComplete }: IGuestIntroSplashProps) {
  const brand = useMemo(() => productName.toLowerCase(), [productName])
  const [phase, setPhase] = useState<"logo" | "type" | "exit">("logo")
  const [typed, setTyped] = useState("")
  const [logoVisible, setLogoVisible] = useState(false)

  useEffect(() => {
    const showLogo = requestAnimationFrame(() => setLogoVisible(true))
    const startType = window.setTimeout(() => setPhase("type"), 600)
    return () => {
      cancelAnimationFrame(showLogo)
      clearTimeout(startType)
    }
  }, [])

  useEffect(() => {
    if (phase !== "type") return

    let index = 0
    const interval = window.setInterval(() => {
      index += 1
      setTyped(brand.slice(0, index))
      if (index >= brand.length) {
        clearInterval(interval)
        window.setTimeout(() => setPhase("exit"), PAUSE_AFTER_MS)
      }
    }, TYPE_MS)

    return () => clearInterval(interval)
  }, [phase, brand])

  useEffect(() => {
    if (phase !== "exit") return
    const timer = window.setTimeout(onComplete, 450)
    return () => clearTimeout(timer)
  }, [phase, onComplete])

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center bg-background transition-opacity duration-500",
        phase === "exit" && "pointer-events-none opacity-0"
      )}
    >
      <div
        className={cn(
          "mb-8 transition-all duration-700 ease-out",
          logoVisible ? "scale-100 opacity-100" : "scale-90 opacity-0"
        )}
      >
        <AppLogo className="size-28" alt="" />
      </div>

      <p
        className="font-heading text-5xl font-medium tracking-tight text-foreground italic"
        aria-label={productName}
      >
        {typed}
        <span
          className={cn(
            "ml-0.5 inline-block w-[2px] translate-y-0.5 bg-primary",
            phase === "type" && typed.length < brand.length
              ? "h-[0.85em] animate-pulse"
              : "h-0"
          )}
        />
      </p>

      {eventName && (
        <p
          className={cn(
            "mt-6 max-w-xs px-6 text-center text-sm text-muted-foreground transition-opacity duration-500",
            typed.length === brand.length ? "opacity-100" : "opacity-0"
          )}
        >
          {eventName}
        </p>
      )}
    </div>
  )
}
