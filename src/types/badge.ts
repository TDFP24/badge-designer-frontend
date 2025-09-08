export type TextAlign = 'left' | 'center' | 'right';

export interface BadgeLine {
  text: string;
  size: number;
  color: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  fontFamily: string;
  alignment: TextAlign;
}

export interface BadgeImage {
  src: string;
  x: number;
  y: number;
  scale: number; // 1.0 = natural pixels
}

export interface TemplateMaskRect {
  type: 'rect';
  rx?: number;
  ry?: number;
}

export interface TemplateMaskPath {
  type: 'path';
  d: string;
  /**
   * The original coordinate system (from the source SVG's viewBox).
   * Used to fit the path uniformly into our safe box.
   * Example: [0, 0, 4000, 2819.44]
   */
  sourceViewBox: [number, number, number, number];
}

export type TemplateMask = TemplateMaskRect | TemplateMaskPath;

export interface Template {
  id: string;
  name: string;
  artboardWidth: number;   // px
  artboardHeight: number;  // px
  safeInset?: number;      // px
  mask: TemplateMask;
}

export interface Badge {
  templateId?: string;
  backgroundColor: string;
  backing: 'pin' | 'magnetic' | 'adhesive';
  lines: BadgeLine[];
  backgroundImage?: BadgeImage;
  logo?: BadgeImage;
}