import { renderBadgeToSvgString } from "../../src/utils/renderSvg";
import type { Badge } from "../../src/types/badge";
import type { Template } from "../../src/utils/templates";
import { jsPDF } from "jspdf";

export function downloadBlob(data: Blob, filename: string) {
  const url = URL.createObjectURL(data);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadSVG(badge: Badge, template: Template, filename = "badge.svg") {
  const svg = renderBadgeToSvgString(badge, template);
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  downloadBlob(blob, filename);
}

export function downloadCDR(badge: Badge, template: Template, filename = "badge.cdr") {
  // CorelDRAW opens SVGs. This is the same SVG with a .cdr filename for now.
  const svg = renderBadgeToSvgString(badge, template);
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  downloadBlob(blob, filename);
}

export async function rasterizeToPNGDataUrl(badge: Badge, template: Template, scale = 2): Promise<string> {
  const svg = renderBadgeToSvgString(badge, template);
  const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const svgUrl = URL.createObjectURL(svgBlob);

  const img = new Image();
  const W = template.artboardWidth * scale;
  const H = template.artboardHeight * scale;

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = svgUrl;
  });

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context not available");
  ctx.drawImage(img, 0, 0, W, H);
  URL.revokeObjectURL(svgUrl);

  return canvas.toDataURL("image/png");
}

export async function downloadPNG(badge: Badge, template: Template, filename = "badge.png", scale = 2) {
  const dataUrl = await rasterizeToPNGDataUrl(badge, template, scale);
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  downloadBlob(blob, filename);
}

export async function downloadPDF(badge: Badge, template: Template, filename = "badge.pdf", scale = 3) {
  const dataUrl = await rasterizeToPNGDataUrl(badge, template, scale);
  const Wmm = (template.artboardWidth / 96) * 25.4;  // assuming 96dpi virtual CSS px
  const Hmm = (template.artboardHeight / 96) * 25.4;

  const doc = new jsPDF({
    orientation: Wmm > Hmm ? "landscape" : "portrait",
    unit: "mm",
    format: [Wmm, Hmm]
  });

  doc.addImage(dataUrl, "PNG", 0, 0, Wmm, Hmm);
  doc.save(filename);
}

export async function downloadTIFF(badge: Badge, template: Template, filename = "badge.tiff", scale = 4) {
  // Placeholder: export a high-res PNG but with .tiff extension for now
  const dataUrl = await rasterizeToPNGDataUrl(badge, template, scale);
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const fakeTiff = new File([blob], "badge.tiff", { type: "image/tiff" });
  downloadBlob(fakeTiff, filename);
}
