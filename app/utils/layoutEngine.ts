import { Badge, BadgeLine } from '../types/badge';
import { BADGE_CONSTANTS } from '../constants/badge';

export interface TextLineLayout {
  text: string;
  fontSize: number;
  x: number;
  y: number;
  width: number;
  height: number;
  fontFamily: string;
  bold: boolean;
  italic: boolean;
  alignment: 'left' | 'center' | 'right';
  color: string;
}

export interface BadgeLayout {
  lines: TextLineLayout[];
  totalHeight: number;
  layoutHash: string;
  badgeWidth: number;
  badgeHeight: number;
  backgroundColor: string;
}

export interface LayoutOptions {
  minFontSize?: number;
  maxFontSize?: number;
  padding?: number;
  lineGap?: number;
  forceFontSize?: boolean; // If true, don't auto-scale
}

/**
 * Measures text width using canvas context
 */
function measureTextWidth(
  text: string,
  fontSize: number,
  fontFamily: string,
  bold: boolean,
  italic: boolean
): number {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return 0;
  
  const fontWeight = bold ? 'bold' : 'normal';
  const fontStyle = italic ? 'italic' : 'normal';
  context.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
  return context.measureText(text).width;
}

/**
 * Fits text into a single line, auto-scaling font size if needed
 */
function fitTextIntoLine(
  text: string,
  maxWidth: number,
  fontFamily: string,
  options: LayoutOptions & {
    bold?: boolean;
    italic?: boolean;
    initialFontSize?: number;
  }
): { fontSize: number; width: number } {
  const {
    minFontSize = BADGE_CONSTANTS.MIN_FONT_SIZE,
    maxFontSize = BADGE_CONSTANTS.MAX_FONT_SIZE,
    bold = false,
    italic = false,
    initialFontSize,
    forceFontSize = false
  } = options;

  let fontSize = initialFontSize || maxFontSize;
  
  if (forceFontSize) {
    // Don't auto-scale, just measure at the given size
    const width = measureTextWidth(text, fontSize, fontFamily, bold, italic);
    return { fontSize, width };
  }

  // Auto-scale down if text is too wide
  while (fontSize > minFontSize) {
    const width = measureTextWidth(text, fontSize, fontFamily, bold, italic);
    if (width <= maxWidth) break;
    fontSize--;
  }

  const finalWidth = measureTextWidth(text, fontSize, fontFamily, bold, italic);
  return { fontSize, width: finalWidth };
}

/**
 * Main layout function that computes the complete badge layout
 */
export function computeBadgeLayout(
  badge: Badge,
  options: LayoutOptions = {}
): BadgeLayout {
  const {
    minFontSize = BADGE_CONSTANTS.MIN_FONT_SIZE,
    maxFontSize = BADGE_CONSTANTS.MAX_FONT_SIZE,
    padding = 14, // matches current px-4 equivalent
    lineGap = 6,
    forceFontSize = false
  } = options;

  const badgeWidth = BADGE_CONSTANTS.BADGE_WIDTH;
  const badgeHeight = BADGE_CONSTANTS.BADGE_HEIGHT;
  const availableWidth = badgeWidth - (padding * 2);

  const layoutLines: TextLineLayout[] = [];
  let totalHeight = 0;

  // Process each line
  badge.lines.forEach((line: BadgeLine, lineIndex: number) => {
    const cleanText = (line.text || '').replace(/^"|"$/g, '').trim();
    
    if (!cleanText) {
      // Empty line - add minimal height
      layoutLines.push({
        text: '',
        fontSize: minFontSize,
        x: padding,
        y: 0, // Will be calculated below
        width: 0,
        height: minFontSize * BADGE_CONSTANTS.LINE_HEIGHT_MULTIPLIER,
        fontFamily: line.fontFamily || BADGE_CONSTANTS.DEFAULT_FONT,
        bold: line.bold || false,
        italic: line.italic || false,
        alignment: line.alignment || 'center',
        color: line.color || BADGE_CONSTANTS.DEFAULT_COLOR
      });
      totalHeight += minFontSize * BADGE_CONSTANTS.LINE_HEIGHT_MULTIPLIER;
      return;
    }

    // Fit text to line
    const { fontSize, width } = fitTextIntoLine(cleanText, availableWidth, line.fontFamily || BADGE_CONSTANTS.DEFAULT_FONT, {
      minFontSize,
      maxFontSize,
      bold: line.bold || false,
      italic: line.italic || false,
      initialFontSize: line.size,
      forceFontSize
    });

    const lineHeight = fontSize * BADGE_CONSTANTS.LINE_HEIGHT_MULTIPLIER;
    
    // Calculate x position based on alignment
    let x = padding;
    if (line.alignment === 'center') {
      x = padding + (availableWidth - width) / 2;
    } else if (line.alignment === 'right') {
      x = badgeWidth - padding - width;
    }

    layoutLines.push({
      text: cleanText,
      fontSize,
      x,
      y: 0, // Will be calculated below
      width,
      height: lineHeight,
      fontFamily: line.fontFamily || BADGE_CONSTANTS.DEFAULT_FONT,
      bold: line.bold || false,
      italic: line.italic || false,
      alignment: line.alignment || 'center',
      color: line.color || BADGE_CONSTANTS.DEFAULT_COLOR
    });

    totalHeight += lineHeight;
    if (lineIndex < badge.lines.length - 1) {
      totalHeight += lineGap;
    }
  });

  // Calculate y positions (center vertically)
  const startY = (badgeHeight + totalHeight) / 2;
  let currentY = startY;

  layoutLines.forEach((line) => {
    line.y = currentY - line.fontSize * 0.7; // Adjust for text baseline
    currentY -= line.height;
    if (line.height > 0) {
      currentY -= lineGap; // Add gap between lines
    }
  });

  // Generate layout hash for caching
  const layoutData = {
    badge: {
      backgroundColor: badge.backgroundColor,
      lines: badge.lines.map(l => ({
        text: l.text,
        size: l.size,
        color: l.color,
        bold: l.bold,
        italic: l.italic,
        fontFamily: l.fontFamily,
        alignment: l.alignment
      }))
    },
    layoutVersion: '1.0'
  };

  const layoutHash = btoa(JSON.stringify(layoutData)).slice(0, 16); // Simple hash for now

  return {
    lines: layoutLines,
    totalHeight,
    layoutHash,
    badgeWidth,
    badgeHeight,
    backgroundColor: badge.backgroundColor
  };
}

/**
 * Validates if a layout fits within badge dimensions
 */
export function validateLayout(layout: BadgeLayout): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  if (layout.totalHeight > layout.badgeHeight) {
    issues.push(`Total text height (${layout.totalHeight}px) exceeds badge height (${layout.badgeHeight}px)`);
  }

  layout.lines.forEach((line, index) => {
    if (line.width > layout.badgeWidth - 28) { // Account for padding
      issues.push(`Line ${index + 1} width (${line.width}px) exceeds available width`);
    }
  });

  return {
    valid: issues.length === 0,
    issues
  };
}

/**
 * Converts layout to different units (px to pt, etc.)
 */
export function convertLayoutUnits(layout: BadgeLayout, targetUnit: 'px' | 'pt'): BadgeLayout {
  const conversionFactor = targetUnit === 'pt' ? 0.75 : 1.33; // px to pt conversion
  
  return {
    ...layout,
    lines: layout.lines.map(line => ({
      ...line,
      fontSize: Math.round(line.fontSize * conversionFactor),
      x: Math.round(line.x * conversionFactor),
      y: Math.round(line.y * conversionFactor),
      width: Math.round(line.width * conversionFactor),
      height: Math.round(line.height * conversionFactor)
    })),
    totalHeight: Math.round(layout.totalHeight * conversionFactor),
    badgeWidth: Math.round(layout.badgeWidth * conversionFactor),
    badgeHeight: Math.round(layout.badgeHeight * conversionFactor)
  };
}
