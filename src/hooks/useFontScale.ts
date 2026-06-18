import { useCallback, useEffect, useState } from "react"
import { getFontScale, setFontScale } from "@/lib/fontScale"

export function useFontScale() {
  const [scale, setScaleState] = useState(getFontScale)

  useEffect(() => {
    document.documentElement.classList.add("font-scaled")
    document.documentElement.style.setProperty("--font-scale", String(scale))

    return () => {
      document.documentElement.classList.remove("font-scaled")
      document.documentElement.style.removeProperty("--font-scale")
    }
  }, [scale])

  const setScale = useCallback((next: number) => {
    setFontScale(next)
    setScaleState(next)
  }, [])

  return { scale, setScale }
}
