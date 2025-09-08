// app/utils/renderSvg.ts
import type { Badge, BadgeImage } from "~/types/badge";
import type { BadgeTemplate } from "~/utils/templates";

// Helpers to render positioned images
const renderPositionedImage = (img: BadgeImage, zIndex: number) => {
  return `
    <g style="isolation:isolate" transform="translate(${img.x}, ${img.y}) scale(${img.scale})">
      <image href="${img.src}" preserveAspectRatio="none" style="image-rendering:optimizeQuality" />
    </g>
  `;
};

type RenderOpts = {
  preview?: boolean; // when true, show a visible outline stroke for complex masks
};

export function renderBadgeToSvgString(
  badge: Badge,
  template: BadgeTemplate,
  opts: RenderOpts = { preview: false }
) {
  if (!template) throw new Error("renderBadgeToSvgString: template is required");

  const { artboardWidth: W, artboardHeight: H, safeInset = 0 } = template;
  // Back-compat for any old code that used `safe`
  const safe = safeInset;

  function computePathBBox(d: string): { x: number; y: number; width: number; height: number } {
    // Try DOM measurement (browser only)
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      // make sure it's attached so getBBox works across browsers
      svg.setAttribute("width", "0");
      svg.setAttribute("height", "0");
      svg.style.position = "absolute";
      svg.style.opacity = "0";
      svg.style.pointerEvents = "none";

      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", d);
      svg.appendChild(path);
      document.body.appendChild(svg);
      try {
        const bbox = path.getBBox(); // tight bbox of the actual path geometry
        return { x: bbox.x, y: bbox.y, width: bbox.width, height: bbox.height };
      } catch {
        // fall through to default
      } finally {
        document.body.removeChild(svg);
      }
    }
    // default bbox if DOM is unavailable
    return { x: 0, y: 0, width: W, height: H };
  }

  let clipDef = "";
  let guideOverlay = "";
  let safeOverlay = "";

  // Fit content inside the *safe area* so the outline behaves like the frame edge
  const targetX = safeInset;
  const targetY = safeInset;
  const targetW = W - 2 * safeInset;
  const targetH = H - 2 * safeInset;

  if (template.mask?.type === "path" && template.mask.d) {
    const d = template.mask.d;

    // If a precise sourceBox is provided, use it; otherwise auto-measure
    const src =
      template.mask.sourceBox && template.mask.sourceBox.width && template.mask.sourceBox.height
        ? {
            x: template.mask.sourceBox.x ?? 0,
            y: template.mask.sourceBox.y ?? 0,
            width: template.mask.sourceBox.width,
            height: template.mask.sourceBox.height,
          }
        : computePathBBox(d);

    // uniform scale to fit bbox → target rect (safe area)
    const scale = Math.min(targetW / src.width, targetH / src.height);
    const tx = targetX + (targetW - src.width * scale) / 2 - src.x * scale;
    const ty = targetY + (targetH - src.height * scale) / 2 - src.y * scale;

    clipDef = `
      <clipPath id="badgeClip">
        <g transform="translate(${tx},${ty}) scale(${scale})">
          <path d="${d}" fill="white"/>
        </g>
      </clipPath>
    `;

    // Visible red outline (non-scaling stroke so it stays crisp)
    guideOverlay = `
      <g transform="translate(${tx},${ty}) scale(${scale})">
        <path d="${d}" fill="none" stroke="#c34f4f" stroke-width="2" vector-effect="non-scaling-stroke"/>
      </g>
    `;
  } else if (template.mask?.type === "rect") {
    const rx = template.mask.rx ?? 0;
    const ry = template.mask.ry ?? 0;
    clipDef = `
      <clipPath id="badgeClip">
        <rect x="${targetX}" y="${targetY}" width="${targetW}" height="${targetH}" rx="${rx}" ry="${ry}" />
      </clipPath>
    `;
    guideOverlay = `
      <rect x="${targetX}" y="${targetY}" width="${targetW}" height="${targetH}" rx="${rx}" ry="${ry}"
        fill="none" stroke="#c34f4f" stroke-width="2" />
    `;
  } else {
    // Fallback to full-rect if no mask defined
    clipDef = `<clipPath id="badgeClip"><rect x="0" y="0" width="${W}" height="${H}" /></clipPath>`;
    guideOverlay = `
      <rect x="0" y="0" width="${W}" height="${H}"
        fill="none" stroke="#c34f4f" stroke-width="2" />
    `;
  }

  // Optional dashed safe area overlay (helps visualize; keep if you like)
  safeOverlay = `
    <rect x="${safeInset}" y="${safeInset}"
          width="${W - 2 * safeInset}" height="${H - 2 * safeInset}"
          fill="none" stroke="#ef9a9a" stroke-width="1.5"
          stroke-dasharray="6 6"/>
  `;

  // Background color rect (will be clipped)
  const bgColorRect = `<rect x="0" y="0" width="${W}" height="${H}" fill="${badge.backgroundColor || "#FFFFFF"}" />`;

  // Optional background image (clipped)
  const bgImg = typeof badge.backgroundImage === "object"
    ? renderPositionedImage(badge.backgroundImage as BadgeImage, 1)
    : "";

  // Optional logo (clipped)
  const logo = typeof badge.logo === "object"
    ? renderPositionedImage(badge.logo as BadgeImage, 2)
    : "";

  // Text lines (rough placement; your existing text layout rules apply)
  const textLines = (badge.lines || []).map((line, i) => {
    // Simple vertical stack; your real project may lay these out differently
    const y = safeInset + (i + 1) * ((H - 2 * safeInset) / (badge.lines.length + 1));
    const anchor =
      line.alignment === "left" ? "start" :
      line.alignment === "right" ? "end" : "middle";
    const x =
      line.alignment === "left" ? safeInset :
      line.alignment === "right" ? (W - safeInset) :
      W / 2;

    const fontWeight = line.bold ? "700" : "400";
    const fontStyle = line.italic ? "italic" : "normal";
    const textDeco = line.underline ? "underline" : "none";
    const fill = line.color || "#000";

    return `
      <text
        x="${x}" y="${y}"
        fill="${fill}"
        font-family="${line.fontFamily || "Roboto"}"
        font-size="${line.size || 18}"
        font-weight="${fontWeight}"
        font-style="${fontStyle}"
        text-decoration="${textDeco}"
        text-anchor="${anchor}"
        dominant-baseline="middle"
        style="paint-order:stroke fill; stroke:#00000000"
      >${escapeXml(line.text || "")}</text>
    `;
  }).join("");

  // Build SVG
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    ${clipDef}
  </defs>

  <!-- Background fill clipped to badge shape -->
  <g clip-path="url(#badgeClip)">
    <rect x="0" y="0" width="${W}" height="${H}" fill="${badge.backgroundColor || '#FFFFFF'}" />
    <!-- background image + logo go here, also clipped -->
    ${bgImg}
    ${logo}
  </g>

  <!-- Visible cutline and safe area guides -->
  ${guideOverlay}
  ${safeOverlay}

  <!-- Text (also clipped) -->
  <g clip-path="url(#badgeClip)">
    ${textLines}
  </g>
</svg>
  `;
}

function escapeXml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}