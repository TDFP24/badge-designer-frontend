import React, { useMemo } from "react";
import type { Badge, Template } from "../types/badge";
import { renderBadgeToSvgString } from "../utils/renderSvg";

export function BadgeSvgRenderer({ badge, template, debug = false }: {badge: Badge; template: Template; debug?: boolean;}) {
  const svg = useMemo(() => renderBadgeToSvgString(badge, template), [badge, template]);

  if (debug) {
    // eslint-disable-next-line no-console
    console.log("[BadgeSvgRenderer] props", { badge, template, debug });
  }

  return (
    <div className="border rounded p-2 bg-white inline-block">
      <div dangerouslySetInnerHTML={{ __html: svg }} />
    </div>
  );
}

export default BadgeSvgRenderer;