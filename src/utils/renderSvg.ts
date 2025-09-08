import type { Badge, BadgeImage } from "../types/badge";

type TemplateMask =
  | { type: "rect"; rx?: number; ry?: number }
  | { type: "oval" };

type Template = {
  id: string;
  name: string;
  artboardWidth?: number;
  artboardHeight?: number;
  safeInset?: number;
  mask?: TemplateMask;
  // Legacy keys support
  artboard_width?: number;
  artboard_height?: number;
  safe_inset?: number;
};

const num = (v: any, d = 0) => (Number.isFinite(v) ? Number(v) : d);

function maskElement(template: Template, w: number, h: number) {
  const m = template.mask ?? { type: "rect", rx: 0, ry: 0 };
  if (m.type === "oval") {
    return `<ellipse cx="${w / 2}" cy="${h / 2}" rx="${w / 2}" ry="${h / 2}" />`;
  }
  const rx = num(m.rx, 0);
  const ry = num(m.ry, rx);
  return `<rect x="0" y="0" width="${w}" height="${h}" rx="${rx}" ry="${ry}" />`;
}

function outlineElement(template: Template, w: number, h: number) {
  const m = template.mask ?? { type: "rect", rx: 0, ry: 0 };
  if (m.type === "oval") {
    return `<ellipse cx="${w / 2}" cy="${h / 2}" rx="${w / 2}" ry="${h / 2}" fill="none" stroke="#888" stroke-width="2" />`;
  }
  const rx = num(m.rx, 0);
  const ry = num(m.ry, rx);
  return `<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="${rx}" ry="${ry}" fill="none" stroke="#888" stroke-width="2" />`;
}

function positionedImage(img: BadgeImage) {
  const x = num(img.x, 0);
  const y = num(img.y, 0);
  const s = num(img.scale, 1);
  // Note: we don't set width/height here; we rely on the image's intrinsic size,
  // letting scale handle size. This avoids stretching outside the clip.
  return `
    <g transform="translate(${x}, ${y}) scale(${s})">
      <image href="${img.src}" x="0" y="0" preserveAspectRatio="xMidYMid meet" />
    </g>
  `;
}

export function renderBadgeToSvgString(badge: Badge, template?: Template) {
  const w = num(template?.artboardWidth ?? template?.artboard_width, 300);
  const h = num(template?.artboardHeight ?? template?.artboard_height, 100);
  const inset = num(template?.safeInset ?? template?.safe_inset, 6);

  const clipId = `clip-${template?.id ?? "fallback"}`;
  const bgColor = badge.backgroundColor || "#FFFFFF";

  // Layers INSIDE clip
  const bgColorLayer = `<rect width="${w}" height="${h}" fill="${bgColor}" />`;

  let bgImageLayer = "";
  if (badge.backgroundImage) {
    if (typeof badge.backgroundImage === "string") {
      // Full-bleed but clipped by mask
      bgImageLayer = `<image href="${badge.backgroundImage}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice" />`;
    } else {
      bgImageLayer = positionedImage(badge.backgroundImage);
    }
  }

  let logoLayer = "";
  if (badge.logo) {
    logoLayer = positionedImage(badge.logo);
  }

  const lines = badge.lines ?? [];
  const lh = 1.3;
  const totalH = lines.reduce((s, l) => s + num(l.size, 14) * lh, 0);
  let cursorY = (h - totalH) / 2 + num(lines[0]?.size, 14);

  const textLayers = lines
    .map((l) => {
      const size = num(l.size, 14);
      const color = l.color || "#000";
      const weight = l.bold ? "bold" : "normal";
      const style = l.italic ? "italic" : "normal";
      const deco = l.underline ? "underline" : "none";
      const family = l.fontFamily || "Arial";
      const align = l.alignment === "left" || l.alignment === "right" ? l.alignment : "center";

      let x = w / 2;
      let anchor = "middle";
      if (align === "left") {
        x = inset;
        anchor = "start";
      } else if (align === "right") {
        x = w - inset;
        anchor = "end";
      }

      const el = `
        <text
          x="${x}" y="${cursorY}"
          fill="${color}"
          font-size="${size}"
          font-weight="${weight}"
          font-style="${style}"
          text-decoration="${deco}"
          font-family="${family}"
          text-anchor="${anchor}"
          dominant-baseline="alphabetic"
        >${escapeXml(l.text || "")}</text>
      `;
      cursorY += size * lh;
      return el;
    })
    .join("");

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <clipPath id="${clipId}">
      ${maskElement(template ?? { id: "fallback", name: "fallback" }, w, h)}
    </clipPath>
  </defs>

  <!-- Everything below is clipped to shape -->
  <g clip-path="url(#${clipId})">
    ${bgColorLayer}
    ${bgImageLayer}
    ${logoLayer}
    ${textLayers}
  </g>

  <!-- Outline always on top -->
  ${outlineElement(template ?? { id: "fallback", name: "fallback" }, w, h)}
</svg>
  `;
}

function escapeXml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}