import templatesJson from "../data/templates.local.json";
import type { Template } from "../types/badge";

const TEMPLATES: Template[] = templatesJson as Template[];

export function getTemplates(): Template[] {
  return TEMPLATES;
}

export function getTemplateById(id?: string): Template {
  const fallback = TEMPLATES[0];
  if (!id) return fallback;
  return TEMPLATES.find(t => t.id === id) ?? fallback;
}

export type { Template };