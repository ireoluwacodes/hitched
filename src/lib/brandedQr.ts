import QRCode from "qrcode"
import { APP_LOGO_PATH } from "@/lib/branding"

const LOGO_RATIO = 0.22
const LOGO_PAD_RATIO = 0.12

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export async function generateBrandedQrDataUrl(
  url: string,
  size = 400
): Promise<string> {
  const qrDataUrl = await QRCode.toDataURL(url, {
    errorCorrectionLevel: "H",
    margin: 2,
    width: size,
  })

  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")
  if (!ctx) return qrDataUrl

  const qrImage = await loadImage(qrDataUrl)
  ctx.drawImage(qrImage, 0, 0, size, size)

  const logoSize = Math.round(size * LOGO_RATIO)
  const pad = Math.round(logoSize * LOGO_PAD_RATIO)
  const x = (size - logoSize) / 2
  const y = (size - logoSize) / 2

  const logoImage = await loadImage(APP_LOGO_PATH)

  ctx.fillStyle = "#ffffff"
  ctx.fillRect(x - pad, y - pad, logoSize + pad * 2, logoSize + pad * 2)
  ctx.drawImage(logoImage, x, y, logoSize, logoSize)

  return canvas.toDataURL("image/png")
}
