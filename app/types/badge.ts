export interface BadgeLine {
  text: string;
  size: number;
  color: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  alignment: 'left' | 'center' | 'right';
  fontFamily: string;
}

export interface BadgeImage {
  src: string;
  x: number;
  y: number;
  scale: number;
}

export interface BadgeLine {
  text: string;
  size: number;
  color: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  alignment: 'left' | 'center' | 'right';
  fontFamily: string;
}

export interface BadgeImage {
  src: string;
  x: number;
  y: number;
  scale: number;
}

export interface Badge {
  templateId?: string;
  lines: BadgeLine[];
  backgroundColor: string;
  backing: 'pin' | 'magnetic' | 'adhesive';
  backgroundImage?: BadgeImage;
  logo?: BadgeImage;
}

export interface BadgeEditorPanelProps {
  badge: Badge;
  onLineChange: (index: number, changes: Partial<BadgeLine>) => void;
  onAlignmentChange: (index: number, alignment: string) => void;
  onBackgroundColorChange: (color: string) => void;
  onRemoveLine: (index: number) => void;
  showRemove: boolean;
  maxLines: number;
  addLineButton: React.ReactNode;
  resetButton: React.ReactNode;
  multiBadgeButton: React.ReactNode;
  editable?: boolean;
}

export interface BadgeDesignerProps {
  productId?: string;
  onBadgeChange?: (badge: Badge) => void;
  initialBadge?: Badge;
} 