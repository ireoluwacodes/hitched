import { Outlet } from "react-router-dom"
import { FontSizeControl } from "@/components/FontSizeControl"
import { useFontScale } from "@/hooks/useFontScale"

export function GuestLayout() {
  const { scale, setScale } = useFontScale()

  return (
    <div className="min-h-svh bg-background">
      <FontSizeControl scale={scale} onScaleChange={setScale} />
      <Outlet />
    </div>
  )
}
