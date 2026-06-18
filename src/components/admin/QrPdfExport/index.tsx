import { useState } from "react"
import { jsPDF } from "jspdf"
import QRCode from "qrcode"
import { HugeiconsIcon } from "@hugeicons/react"
import { Download01Icon, Loading03Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { buildTableUrl } from "@/lib/qrUrl"
import type { IQrPdfExportProps } from "./@types"

const CARD_WIDTH = 60
const CARD_HEIGHT = 80
const QR_SIZE = 45
const COLS = 3
const MARGIN_X = 15
const MARGIN_Y = 20
const GAP_X = 10
const GAP_Y = 15

export function QrPdfExport({ tables }: IQrPdfExportProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  async function handleDownload() {
    setIsGenerating(true)
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })

      for (let i = 0; i < tables.length; i++) {
        const table = tables[i]
        const col = i % COLS
        const row = Math.floor((i % (COLS * 3)) / COLS)

        if (i > 0 && i % (COLS * 3) === 0) {
          doc.addPage()
        }

        const x = MARGIN_X + col * (CARD_WIDTH + GAP_X)
        const y = MARGIN_Y + row * (CARD_HEIGHT + GAP_Y)

        doc.setDrawColor(200)
        doc.roundedRect(x, y, CARD_WIDTH, CARD_HEIGHT, 2, 2)

        const url = buildTableUrl(table.qrToken)
        const dataUrl = await QRCode.toDataURL(url, { margin: 1, width: 200 })
        const qrX = x + (CARD_WIDTH - QR_SIZE) / 2
        doc.addImage(dataUrl, "PNG", qrX, y + 8, QR_SIZE, QR_SIZE)

        doc.setFontSize(14)
        doc.setFont("helvetica", "bold")
        const label = table.label ? `${table.label}` : `Table ${table.number}`
        const textWidth = doc.getTextWidth(label)
        doc.text(label, x + (CARD_WIDTH - textWidth) / 2, y + CARD_HEIGHT - 10)

        doc.setFontSize(8)
        doc.setFont("helvetica", "normal")
        const subtitle = "Scan to order"
        const subWidth = doc.getTextWidth(subtitle)
        doc.text(subtitle, x + (CARD_WIDTH - subWidth) / 2, y + CARD_HEIGHT - 4)
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
