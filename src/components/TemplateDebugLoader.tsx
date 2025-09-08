import React from "react";
import { BadgeTemplate } from "../utils/templates";

type Props = {
  onLoad: (tmpl: BadgeTemplate) => void;
};

export default function TemplateDebugLoader({ onLoad }: Props) {
  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const txt = await file.text();
    // naive `d` extraction for a single <path d="...">
    const match = txt.match(/<path[^>]*d="([^"]+)"/i);
    const d = match?.[1];
    if (!d) {
      alert("No <path d=\"…\"> found in the SVG.");
      return;
    }
    const template: BadgeTemplate = {
      id: "debug-from-svg",
      name: "Debug (from SVG path)",
      artboardWidth: 300,
      artboardHeight: 100,
      safeInset: 6,
      mask: { type: "path", d }
    };
    onLoad(template);
  };

  return (
    <div className="flex items-center gap-2">
      <input type="file" accept=".svg" onChange={onFile} />
      <span className="text-xs text-gray-500">Quickly load mask path from an SVG exported by CorelDRAW</span>
    </div>
  );
}

