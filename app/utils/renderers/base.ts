import { Badge } from '../../types/badge';
import { BadgeLayout } from '../layoutEngine';

/**
 * Base renderer interface that all renderers must implement
 */
export interface Renderer {
  /**
   * Render a badge using the provided layout
   */
  render(layout: BadgeLayout, badge: Badge): Promise<Buffer | string>;
  
  /**
   * Get the renderer name for identification
   */
  getName(): string;
  
  /**
   * Get the output format/mime type
   */
  getOutputFormat(): string;
  
  /**
   * Validate if the renderer can handle the given badge
   */
  canRender(badge: Badge): boolean;
}

/**
 * Base renderer class with common functionality
 */
export abstract class BaseRenderer implements Renderer {
  protected fontManager: any;
  
  constructor() {
    // Initialize font manager reference
    this.fontManager = null;
  }

  /**
   * Abstract method that must be implemented by subclasses
   */
  abstract render(layout: BadgeLayout, badge: Badge): Promise<Buffer | string>;
  
  /**
   * Abstract method that must be implemented by subclasses
   */
  abstract getName(): string;
  
  /**
   * Abstract method that must be implemented by subclasses
   */
  abstract getOutputFormat(): string;
  
  /**
   * Default implementation - can be overridden
   */
  canRender(badge: Badge): boolean {
    return badge && badge.lines && badge.lines.length > 0;
  }
  
  /**
   * Convert CSS color to RGB values
   */
  protected cssColorToRgb(color: string): [number, number, number] {
    if (!color) return [0, 0, 0];
    
    const normalizedColor = color.trim().toLowerCase();
    
    if (normalizedColor.startsWith('rgb')) {
      const rgbArr = normalizedColor.match(/\d+/g)?.map(Number) || [0, 0, 0];
      return [rgbArr[0] / 255, rgbArr[1] / 255, rgbArr[2] / 255];
    }
    
    if (normalizedColor.startsWith('#')) {
      let hex = normalizedColor.slice(1);
      if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
      const num = parseInt(hex, 16);
      return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];
    }
    
    // Fallback to black
    return [0, 0, 0];
  }
  
  /**
   * Convert CSS color to hex format
   */
  protected cssColorToHex(color: string): string {
    if (!color) return '#000000';
    
    const normalizedColor = color.trim().toLowerCase();
    
    if (normalizedColor.startsWith('rgb')) {
      const [r, g, b] = normalizedColor.match(/\d+/g)?.map(Number) || [0, 0, 0];
      return (
        '#' +
        r.toString(16).padStart(2, '0') +
        g.toString(16).padStart(2, '0') +
        b.toString(16).padStart(2, '0')
      ).toUpperCase();
    }
    
    if (normalizedColor.startsWith('#')) {
      let hex = normalizedColor.slice(1);
      if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
      return ('#' + hex).toUpperCase();
    }
    
    return '#000000';
  }
  
  /**
   * Convert pixels to points
   */
  protected pxToPt(px: number): number {
    return px * 0.75;
  }
  
  /**
   * Convert points to pixels
   */
  protected ptToPx(pt: number): number {
    return pt / 0.75;
  }
  
  /**
   * Validate layout before rendering
   */
  protected validateLayout(layout: BadgeLayout): void {
    if (!layout || !layout.lines) {
      throw new Error('Invalid layout: missing lines');
    }
    
    if (layout.totalHeight > layout.badgeHeight) {
      console.warn('Layout warning: text height exceeds badge height');
    }
    
    for (let i = 0; i < layout.lines.length; i++) {
      const line = layout.lines[i];
      if (line.x + line.width > layout.badgeWidth) {
        console.warn(`Layout warning: line ${i + 1} extends beyond badge width`);
      }
    }
  }
  
  /**
   * Get font weight string for rendering
   */
  protected getFontWeight(bold: boolean): string {
    return bold ? 'bold' : 'normal';
  }
  
  /**
   * Get font style string for rendering
   */
  protected getFontStyle(italic: boolean): string {
    return italic ? 'italic' : 'normal';
  }
}
