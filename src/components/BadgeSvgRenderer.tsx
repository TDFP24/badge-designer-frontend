import React, { useMemo } from "react";
import type { Badge } from "../types/badge";
import { renderBadgeToSvgString } from "../utils/renderSvg";
import { getTemplateById } from "../utils/templates";

type Props = { badge: Badge; className?: string };

const BadgeSvgRenderer: React.FC<Props> = ({ badge, className }) => {
  const template =
    getTemplateById(badge.templateId) ?? {
      id: "rect-1x3",
      name: "Rectangle 1×3 (fallback)",
      artboardWidth: 300,
      artboardHeight: 100,
      safeInset: 6,
      mask: { type: "rect", rx: 4, ry: 4 },
    };

  const svg = useMemo(() => renderBadgeToSvgString(badge, template), [badge, template]);

  return (
    <div
      className={className}
      style={{ display: "inline-block", lineHeight: 0 }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};

export default BadgeSvgRenderer;