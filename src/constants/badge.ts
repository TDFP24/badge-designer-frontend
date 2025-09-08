import type { Badge } from "../types/badge";

export const BADGE_CONSTANTS = {
  MAX_LINES: 4,
  MIN_FONT_SIZE: 8,
  BADGE_WIDTH: 300,
  BADGE_HEIGHT: 100,
} as const;

export const INITIAL_BADGE: Badge = {
  templateId: 'rect-1x3',
  backgroundColor: '#FFFFFF',
  backing: 'pin',
  lines: [
    { text: 'Your Badge Text', size: 18, color: '#000000', bold: false, italic: false, underline: false, fontFamily: 'Roboto', alignment: 'center' },
  ],
  backgroundImage: undefined,
  logo: undefined,
};