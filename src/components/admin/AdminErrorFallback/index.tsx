import { Button } from "@/components/ui/button"
import { clearAdminSession } from "@/lib/adminSession"

interface IAdminErrorFallbackProps {
  message?: string
}

export function AdminErrorFallback({
  message = "Something went wrong loading this page.",
}: IAdminErrorFallbackProps) {
  function handleSignOut() {
    clearAdminSession()
    window.location.href = "/admin"
  }

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="font-heading text-lg font-medium">Couldn&apos;t load admin page</p>
      <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
        <Button onClick={handleSignOut}>Sign out</Button>
      </div>
    </div>
  )
}
