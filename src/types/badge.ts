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
  x: number; // badge-space pixels
  y: number; // badge-space pixels
  scale: number; // 1.0 = natural image size in badge-space
}

export interface Badge {
  templateId: string;
  lines: BadgeLine[];
  backgroundColor: string;
  backing: 'pin' | 'magnetic' | 'adhesive';
  backgroundImage?: BadgeImage;
  logo?: BadgeImage;
}
