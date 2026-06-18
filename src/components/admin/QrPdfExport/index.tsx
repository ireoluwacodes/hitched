import { useState } from "react"
import { jsPDF } from "jspdf"
import { HugeiconsIcon } from "@hugeicons/react"
import { Download01Icon, Loading03Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { buildTableUrl } from "@/lib/qrUrl"
import { generateBrandedQrDataUrl } from "@/lib/brandedQr"
import type { IQrPdfExportProps } from "./@types"

const PAGE_WIDTH = 210
const PAGE_HEIGHT = 297
const QR_SIZE = 130

export function QrPdfExport({ tables }: IQrPdfExportProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  async function handleDownload() {
    setIsGenerating(true)
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })

      for (let i = 0; i < tables.length; i++) {
        const table = tables[i]

        if (i > 0) {
          doc.addPage()
        }

        const url = buildTableUrl(table.qrToken)
        const dataUrl = await generateBrandedQrDataUrl(url, 800)

        const qrX = (PAGE_WIDTH - QR_SIZE) / 2
        const blockHeight = QR_SIZE + 28
        const startY = (PAGE_HEIGHT - blockHeight) / 2

        doc.addImage(dataUrl, "PNG", qrX, startY, QR_SIZE, QR_SIZE)

        const label = table.label ? `${table.label}` : `Table ${table.number}`
        doc.setFontSize(22)
        doc.setFont("helvetica", "bold")
        const labelWidth = doc.getTextWidth(label)
        doc.text(label, (PAGE_WIDTH - labelWidth) / 2, startY + QR_SIZE + 14)

        doc.setFontSize(11)
        doc.setFont("helvetica", "normal")
        const subtitle = "Scan to view menu and order"
        const subtitleWidth = doc.getTextWidth(subtitle)
        doc.text(subtitle, (PAGE_WIDTH - subtitleWidth) / 2, startY + QR_SIZE + 24)
      }

      doc.save("table-qr-codes.pdf")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button variant="outline" onClick={handleDownload} disabled={isGenerating || tables.length === 0}>
      {isGenerating ? (
        <>
          <HugeiconsIcon icon={Loading03Icon} strokeWidth={2} className="animate-spin" />
          Generating…
        </>
      ) : (
        <>
          <HugeiconsIcon icon={Download01Icon} strokeWidth={2} className="size-4" />
          Download PDF
        </>
      )}
    </Button>
  )
}
