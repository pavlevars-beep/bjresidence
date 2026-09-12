import QRCode from "qrcode";
import { siteConfig } from "@/config/site";

/** The one stable destination the printed/physical QR codes must always point to. */
export function getInfoPointUrl(): string {
  return `${siteConfig.url}/info-point`;
}

export async function generateQrPngDataUrl(text: string, opts?: { dark?: string; light?: string; size?: number }): Promise<string> {
  return QRCode.toDataURL(text, {
    width: opts?.size ?? 512,
    margin: 2,
    color: { dark: opts?.dark ?? "#1E1F1C", light: opts?.light ?? "#FFFFFF" },
    errorCorrectionLevel: "M",
  });
}

export async function generateQrSvgString(text: string, opts?: { dark?: string; light?: string }): Promise<string> {
  return QRCode.toString(text, {
    type: "svg",
    margin: 2,
    color: { dark: opts?.dark ?? "#1E1F1C", light: opts?.light ?? "#FFFFFF" },
    errorCorrectionLevel: "M",
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Composites a "branded" card (logo + QR + caption) entirely with the
 * browser's Canvas API — no server route, no new dependency, and the QR
 * modules themselves are drawn untouched (never overlaid) so scan
 * reliability is never traded for looks.
 */
export async function composeBrandedPng({
  qrDataUrl,
  captionLine1,
  captionLine2,
  background = "#F7F4EE",
  foreground = "#1E1F1C",
}: {
  qrDataUrl: string;
  captionLine1: string;
  captionLine2: string;
  background?: string;
  foreground?: string;
}): Promise<string> {
  const [qrImg, logoImg] = await Promise.all([loadImage(qrDataUrl), loadImage("/images/brand/icon-mark.png")]);

  const width = 900;
  const padding = 70;
  const logoSize = 84;
  const qrSize = width - padding * 2;
  const height = padding + logoSize + 28 + qrSize + 40 + 72 + padding;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas_unsupported");

  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  ctx.drawImage(logoImg, width / 2 - logoSize / 2, padding, logoSize, logoSize);

  ctx.drawImage(qrImg, padding, padding + logoSize + 28, qrSize, qrSize);

  ctx.fillStyle = foreground;
  ctx.textAlign = "center";
  ctx.font = "600 34px system-ui, sans-serif";
  ctx.fillText(captionLine1, width / 2, padding + logoSize + 28 + qrSize + 48);
  ctx.font = "400 24px system-ui, sans-serif";
  ctx.fillStyle = foreground + "aa";
  ctx.fillText(captionLine2, width / 2, padding + logoSize + 28 + qrSize + 84);

  return canvas.toDataURL("image/png");
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function downloadTextFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  downloadDataUrl(url, filename);
  URL.revokeObjectURL(url);
}
