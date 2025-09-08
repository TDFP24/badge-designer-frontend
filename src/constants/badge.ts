import { Badge } from "../types/badge";
import { DEFAULT_TEMPLATE } from "../utils/templates";

export const BADGE_CONSTANTS = {
  WIDTH: 300, // not strictly needed by SVG now; template controls width/height
  HEIGHT: 100,
  MAX_LINES: 4
};

export const INITIAL_BADGE: Badge = {
  templateId: DEFAULT_TEMPLATE.id,
  backgroundColor: "#FFFFFF",
  backing: "pin",
  lines: [
    { text: "Your Badge Text", size: 18, color: "#000000", bold: false, italic: false, underline: false, fontFamily: "Roboto", alignment: "center" }
  ],
  // images start undefined
};