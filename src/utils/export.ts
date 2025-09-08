import { Badge } from "../types/badge";
import { renderBadgeToSvgString } from "./renderSvg";

export async function downloadSvg(badge: Badge): Promise<void> {
  const { svg } = renderBadgeToSvgString(badge, { templateId: badge.templateId });
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "badge.svg";
  a.click();
  URL.revokeObjectURL(a.href);
}

export async function downloadPng(badge: Badge, scale = 2): Promise<void> {
  const { svg, width, height } = renderBadgeToSvgString(badge, { templateId: badge.templateId });
  const svgUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);

  const img = new Image();
  img.crossOrigin = "anonymous";
  await new Promise<void>((res, rej) => {
    img.onload = () => res();
    img.onerror = (e) => rej(e);
    img.src = svgUrl;
  });

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  canvas.toBlob((blob) => {
    if (!blob) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "badge.png";
    a.click();
    URL.revokeObjectURL(a.href);
  }, "image/png");
}

async function postExport(format: "tiff" | "pdf" | "cdr", badge: Badge): Promise<void> {
  const { svg, width, height } = renderBadgeToSvgString(badge, { templateId: badge.templateId });

  // Select endpoint per format
  const endpoint = format === "tiff"
    ? "/export.tiff"
    : format === "pdf"
    ? "/export.pdf"
    : "/export.cdr";

  const r = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ svg, width, height, filename: `badge.${format === "cdr" ? "cdr" : format}` }),
  });

  if (!r.ok) throw new Error(`Export failed (${format})`);

  const blob = await r.blob();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `badge.${format === "cdr" ? "cdr" : format}`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export const downloadTiff = (badge: Badge) => postExport("tiff", badge);
export const downloadPdf = (badge: Badge) => postExport("pdf", badge);
// CDR = we ship the same SVG but with .cdr filename so Corel opens it
export const downloadCdr = (badge: Badge) => postExport("cdr", badge);