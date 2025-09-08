// app/components/BadgeSvgRenderer.tsx
import React, { useMemo } from "react";
import type { Badge } from "~/types/badge";
import type { BadgeTemplate } from "~/utils/templates";
import { renderBadgeToSvgString } from "~/utils/renderSvg";

type Props = {
  badge: Badge;
  template: BadgeTemplate;
  debug?: boolean;
};

export const BadgeSvgRenderer: React.FC<Props> = ({ badge, template, debug }) => {
  const svg = useMemo(() => {
    try {
      return renderBadgeToSvgString(badge, template, { preview: true });
    } catch (e) {
      console.error("[BadgeSvgRenderer] render error", e);
      return `<svg width="${template?.artboardWidth || 300}" height="${template?.artboardHeight || 100}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#fee2e2"/><text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" fill="#b91c1c" font-family="monospace" font-size="12">Render error</text></svg>`;
    }
  }, [badge, template]);

  const w = template.artboardWidth;
  const h = template.artboardHeight;

  return (
    <div style={{ width: w, height: h, border: '1px solid transparent' }}>
      <div
        dangerouslySetInnerHTML={{ __html: renderBadgeToSvgString(badge, template, { preview: true }) }}
        style={{ width: w, height: h }}
      />
      {debug && (
        <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
{JSON.stringify({
  templateId: badge.templateId,
  artboard: { w: template.artboardWidth, h: template.artboardHeight },
  lines: badge.lines?.length ?? 0,
  hasBgImg: !!badge.backgroundImage && typeof badge.backgroundImage === "object",
  hasLogo: !!badge.logo && typeof badge.logo === "object"
}, null, 2)}
        </pre>
      )}
    </div>
  );
};