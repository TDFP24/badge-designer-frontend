import React from "react";
import type { Badge, Template } from "../types/badge";

export const DebugPanel = ({ badge, template }: {badge: Badge; template: Template;}) => {
  return (
    <details className="mt-2">
      <summary className="cursor-pointer text-sm">Debug</summary>
      <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
        {JSON.stringify({
          template: {
            id: template.id,
            artboard: `${template.artboardWidth}×${template.artboardHeight}`,
            safeInset: template.safeInset ?? 0,
            maskType: template.mask.type
          },
          badge
        }, null, 2)}
      </pre>
    </details>
  );
};
