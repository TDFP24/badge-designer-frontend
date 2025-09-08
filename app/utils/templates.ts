import templatesJson from "~/data/templates.local.json";

export type Template = {
  id: string;
  name: string;
  artboardWidth: number;
  artboardHeight: number;
  safeInset?: number;
  mask?:
    | { type: "rect"; rx?: number; ry?: number }
    | {
        type: "path";
        d: string;
        transform?: string;
        // optional hint to skip auto-bbox if we already know the original path's tight box
        sourceBox?: { x?: number; y?: number; width: number; height: number };
      };
};

const ALL_TEMPLATES: Template[] = (templatesJson as any)?.templates || [
  {
    id: "rect-1x3",
    name: 'Rectangle 1×3 (fallback)',
    artboardWidth: 300,
    artboardHeight: 100,
    safeInset: 6,
    mask: { type: 'rect', rx: 4, ry: 4 }
  }
];

export function getTemplates(): Template[] {
  // eslint-disable-next-line no-console
  console.log("[templates] getTemplates ->", ALL_TEMPLATES.map(t => t.id));
  return ALL_TEMPLATES;
}

export function getTemplateById(id?: string | null): Template {
  const found = ALL_TEMPLATES.find(t => t.id === id);
  if (!found) {
    // eslint-disable-next-line no-console
    console.warn("[templates] getTemplateById: not found:", id, "— using fallback rect-1x3");
    return ALL_TEMPLATES[0];
  }
  return found;
}