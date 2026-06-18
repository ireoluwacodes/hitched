import { useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { QRCodeSVG } from "qrcode.react"
import { api } from "@convex-api/_generated/api"
import { getAdminSession } from "@/lib/adminSession"
import { buildTableUrl, getAppOrigin } from "@/lib/qrUrl"
import { QrPdfExport } from "@/components/admin/QrPdfExport"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

export function TablesPage() {
  const sessionToken = getAdminSession() ?? ""
  const tables = useQuery(api.tables.list, { sessionToken })
  const setCount = useMutation(api.tables.setCount)
  const [desiredCount, setDesiredCount] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const currentCount = tables?.length ?? 0

  async function handleGenerate() {
    const count = Number(desiredCount)
    if (!count || count < 1) {
      toast.error("Enter a valid table count")
      return
    }

    if (count < currentCount) {
      toast.error("Cannot decrease table count. Additive only.")
      return
    }

    setIsGenerating(true)
    try {
      const result = await setCount({ sessionToken, count })
      toast.success(result.message)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update tables")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-2xl font-medium">Tables & QR codes</h1>
        <p className="text-sm text-muted-foreground">
          Generate table QR codes for printing on table cards.
        </p>
      </div>

      <div className="flex max-w-md flex-col gap-4 rounded-lg border border-border p-4">
        <div className="flex flex-col gap-2">
          <Label>Table count</Label>
          <Input
            type="number"
            min={1}
            placeholder={String(currentCount || 10)}
            value={desiredCount}
            onChange={(e) => setDesiredCount(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Currently {currentCount} table(s). Increasing count adds new tables only.
          </p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button disabled={isGenerating}>
              {currentCount === 0 ? "Generate tables" : "Add tables"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {Number(desiredCount) < currentCount
                  ? "Cannot decrease tables"
                  : "Confirm table generation"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {Number(desiredCount) < currentCount
                  ? "Table count is additive only. Existing tables and their QR codes will not be removed."
                  : `This will ensure ${desiredCount || currentCount} tables exist. New tables get fresh QR tokens.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleGenerate}>Confirm</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {tables && tables.length > 0 && (
        <>
          <p className="text-sm text-muted-foreground">
            QR codes open{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{getAppOrigin()}</code>
            {" "}— phone must be on the same Wi‑Fi.
          </p>
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-medium">Preview</h2>
            <QrPdfExport tables={tables} />
          </div>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {tables.map((table) => (
              <div
                key={table._id}
                className="flex flex-col items-center gap-2 rounded-lg border border-border p-4"
              >
                <QRCodeSVG value={buildTableUrl(table.qrToken)} size={160} />
                <p className="font-heading text-sm font-medium">
                  {table.label ?? `Table ${table.number}`}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
