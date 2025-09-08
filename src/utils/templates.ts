// Safe template utilities: always return a valid template

export type BadgeTemplate = {
  id: string;
  name: string;
  artboardWidth: number;
  artboardHeight: number;
  safeInset?: number;
  mask?: { type: "rect"; rx?: number; ry?: number }
       | { type: "ellipse" }
       | { type: "path"; d: string };
};

// Hard fallback: used if nothing is loaded or ID isn't found
export const DEFAULT_TEMPLATE: BadgeTemplate = {
  id: "rect-1x3",
  name: "Rectangle 1×3 (fallback)",
  artboardWidth: 300,
  artboardHeight: 100,
  safeInset: 6,
  mask: { type: "rect", rx: 4, ry: 4 }
};

// Local in-memory registry (populated once)
let _templates: BadgeTemplate[] | null = null;

// Optional: import your local JSON if you have it
// If not present, we'll still work with DEFAULT_TEMPLATE.
export function loadLocalTemplates(): BadgeTemplate[] {
  try {
    // If you have a JSON file like src/data/templates.local.json, uncomment this:
    // const raw = require("../data/templates.local.json");
    // const arr = Array.isArray(raw) ? raw : (raw?.templates ?? []);
    // _templates = [DEFAULT_TEMPLATE, ...arr];
    _templates = [DEFAULT_TEMPLATE]; // minimal but safe
  } catch {
    _templates = [DEFAULT_TEMPLATE];
  }
  return _templates!;
}

export function getTemplates(): BadgeTemplate[] {
  if (!_templates) loadLocalTemplates();
  return _templates!;
}

export function getTemplateById(id?: string | null): BadgeTemplate {
  if (!_templates) loadLocalTemplates();
  const t = _templates!.find(t => t.id === id);
  return t ?? DEFAULT_TEMPLATE;
}