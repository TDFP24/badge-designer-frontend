import type { Badge, Template, TemplateMaskPath } from "../types/badge";

function esc(s: string) {
  return s.replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]!));
}

export function renderBadgeToSvgString(badge: Badge, template: Template): string {
  if (!template || !template.artboardWidth || !template.artboardHeight) {
    throw new Error("Invalid template");
  }

  const W = template.artboardWidth;
  const H = template.artboardHeight;
  // Ensure we have a numeric safe inset
  const safe = typeof template.safeInset === 'number' ? template.safeInset : 0;

  // Inner drawable area (we clip all user content to the mask, but we also use the safe box to position the path nicely)
  const innerX = safe;
  const innerY = safe;
  const innerW = W - safe * 2;
  const innerH = H - safe * 2;

  // Build mask shape
  let maskBody = "";
  if (template.mask.type === "rect") {
    const rx = template.mask.rx ?? 0;
    const ry = template.mask.ry ?? rx;
    maskBody = `<rect x="0" y="0" width="${W}" height="${H}" rx="${rx}" ry="${ry}" />`;
  } else {
    const mp = template.mask as TemplateMaskPath;
    const [vbX, vbY, vbW, vbH] = mp.sourceViewBox;
    const scale = Math.min(innerW / vbW, innerH / vbH);
    const tx = innerX + (innerW - vbW * scale) / 2 - vbX * scale;
    const ty = innerY + (innerH - vbH * scale) / 2 - vbY * scale;

    // Explicit fill + evenodd rule to ensure the clip region is recognized in all browsers
    maskBody = `<g transform="translate(${tx},${ty}) scale(${scale})">
      <path d="${mp.d}" fill="black" clip-rule="evenodd"/>
    </g>`;
  }

  // ClipPath id
  const clipId = `clip_${Math.random().toString(36).slice(2)}`;
  const cutId  = `cut_${Math.random().toString(36).slice(2)}`;

  // Background color (under everything, but still clipped)
  const bgColor = badge.backgroundColor || "#FFFFFF";

  // Images (optional)
  const bgImg = badge.backgroundImage;
  const logo  = badge.logo;

  // Helper: image tag (clipped)
  const imageTag = (img?: {src:string, x:number, y:number, scale:number}) => {
    if (!img) return "";
    // We draw images in badge coordinate space (artboard px) so x/y/scale are applied directly
    // Using preserveAspectRatio="none" because the user controls scale.
    return `<image href="${esc(img.src)}" x="${img.x}" y="${img.y}" transform="scale(${img.scale})" width="${W}" height="${H}" preserveAspectRatio="none" />`;
  };

  // Text lines (clipped)
  const lineHeightMult = 1.3;
  const totalTextHeight = badge.lines.reduce((acc, l) => acc + l.size * lineHeightMult, 0);
  let yCursor = H / 2 - totalTextHeight / 2;

  const textNodes = badge.lines.map((l) => {
    const anchor = l.alignment === "left" ? "start" : l.alignment === "right" ? "end" : "middle";
    const xPos = l.alignment === "left" ? safe + 8 : l.alignment === "right" ? W - safe - 8 : W / 2;
    const fontW = `${l.bold ? "bold " : ""}${l.italic ? "italic " : ""}${l.size}px ${esc(l.fontFamily || "Arial")}`;
    const out = `<text x="${xPos}" y="${yCursor + l.size}" text-anchor="${anchor}" fill="${esc(l.color)}" font="${esc(fontW)}">${esc(l.text)}</text>`;
    yCursor += l.size * lineHeightMult;
    return out;
  }).join("");

  // Cutline (top overlay) uses the same geometry as the mask (no scaling stroke)
  let cutBody = "";
  if (template.mask.type === "rect") {
    const rx = template.mask.rx ?? 0;
    const ry = template.mask.ry ?? rx;
    cutBody = `<rect x="0" y="0" width="${W}" height="${H}" rx="${rx}" ry="${ry}" 
      fill="none" stroke="#c14646" stroke-width="2" vector-effect="non-scaling-stroke"/>`;
  } else {
    const mp = template.mask as TemplateMaskPath;
    const [vbX, vbY, vbW, vbH] = mp.sourceViewBox;
    const scale = Math.min(innerW / vbW, innerH / vbH);
    const tx = innerX + (innerW - vbW * scale) / 2 - vbX * scale;
    const ty = innerY + (innerH - vbH * scale) / 2 - vbY * scale;
    cutBody = `<g transform="translate(${tx},${ty}) scale(${scale})">
      <path d="${mp.d}" fill="none" stroke="#c14646" stroke-width="2" vector-effect="non-scaling-stroke"/>
    </g>`;
  }

  // Safe guide (dashed rectangle) — visual aid only
  const safeGuide = `<rect x="${innerX}" y="${innerY}" width="${innerW}" height="${innerH}" fill="none" stroke="#e9b7b7" stroke-dasharray="6 6" />`;

  // Assemble
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <clipPath id="${clipId}" clipPathUnits="userSpaceOnUse">
      ${maskBody}
    </clipPath>
    <mask id="${cutId}">
      <rect x="0" y="0" width="${W}" height="${H}" fill="white"/>
    </mask>
  </defs>

  <!-- clipped content -->
  <g clip-path="url(#${clipId})">
    <rect x="0" y="0" width="${W}" height="${H}" fill="${esc(bgColor)}"/>
    ${imageTag(bgImg)}
    ${imageTag(logo)}
    ${textNodes}
  </g>

  <!-- overlays -->
  ${safe > 0 ? safeGuide : ""}
  ${cutBody}
</svg>`.trim();
}