import { Badge } from '../../types/badge';
import { computeBadgeLayout, BadgeLayout } from '../layoutEngine';

export interface PreviewRendererOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'image/png' | 'image/jpeg' | 'image/webp';
  useLayoutEngine?: boolean;
}

/**
 * Renders a badge preview using the unified layout engine
 */
export class PreviewRenderer {
  /**
   * Renders badge to canvas using the layout engine
   */
  static async renderToCanvas(
    badge: Badge,
    options: PreviewRendererOptions = {}
  ): Promise<HTMLCanvasElement> {
    const {
      width = 300,
      height = 100,
      useLayoutEngine = true
    } = options;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    // Set canvas dimensions
    canvas.width = width;
    canvas.height = height;

    if (useLayoutEngine) {
      return this.renderWithLayoutEngine(canvas, ctx, badge, options);
    } else {
      return this.renderLegacy(canvas, ctx, badge, options);
    }
  }

  /**
   * Renders using the new layout engine
   */
  private static async renderWithLayoutEngine(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    badge: Badge,
    options: PreviewRendererOptions
  ): Promise<HTMLCanvasElement> {
    const { width, height } = canvas;

    // Compute layout using the unified engine
    const layout = computeBadgeLayout(badge, {
      forceFontSize: false // Allow auto-scaling
    });

    // Validate layout
    const validation = this.validateLayout(layout);
    if (!validation.valid) {
      console.warn('Layout validation issues:', validation.issues);
    }

    // Fill background
    ctx.fillStyle = badge.backgroundColor || '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // Add border
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, width - 2, height - 2);

    // Scale layout to canvas dimensions
    const scaleX = width / layout.badgeWidth;
    const scaleY = height / layout.badgeHeight;
    const scale = Math.min(scaleX, scaleY);

    // Apply scaling
    ctx.save();
    ctx.scale(scale, scale);

    // Draw each line from the layout
    for (const line of layout.lines) {
      if (!line.text) continue; // Skip empty lines

             // Set font properties
       const fontWeight = line.bold ? 'bold' : 'normal';
       const fontStyle = line.italic ? 'italic' : 'normal';
       ctx.font = `${fontStyle} ${fontWeight} ${line.fontSize}px ${line.fontFamily}`;
      ctx.fillStyle = line.color;
      ctx.textAlign = line.alignment;
      ctx.textBaseline = 'top';

      // Draw text
      ctx.fillText(line.text, line.x, line.y);
    }

    ctx.restore();
    return canvas;
  }

  /**
   * Legacy rendering method (for comparison/testing)
   */
  private static async renderLegacy(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    badge: Badge,
    options: PreviewRendererOptions
  ): Promise<HTMLCanvasElement> {
    const { width, height } = canvas;

    // Fill background
    ctx.fillStyle = badge.backgroundColor || '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // Add border
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, width - 2, height - 2);

    // Calculate text positioning
    const padding = Math.max(8, width * 0.04);
    const availableWidth = width - (padding * 2);
    const availableHeight = height - (padding * 2);

    // Calculate total text height and positioning
    const totalTextHeight = badge.lines.reduce((sum, line) => {
      return sum + (line.size * 1.3);
    }, 0);

    let currentY = padding + (availableHeight - totalTextHeight) / 2;

    // Draw each line of text
    badge.lines.forEach((line) => {
      // Set font properties
      const fontStyle = line.italic ? 'italic ' : '';
      const fontWeight = line.bold ? 'bold ' : '';
      const fontSize = Math.min(line.size, height * 0.4);
      ctx.font = `${fontStyle}${fontWeight}${fontSize}px ${line.fontFamily}`;
      ctx.fillStyle = line.color;
      ctx.textAlign = line.alignment as CanvasTextAlign;
      ctx.textBaseline = 'top';

      // Calculate x position based on alignment
      let x: number;
      switch (line.alignment) {
        case 'left':
          x = padding;
          break;
        case 'right':
          x = width - padding;
          break;
        default: // center
          x = width / 2;
          break;
      }

      // Truncate text if it's too long
      let displayText = line.text;
      const maxWidth = availableWidth - 4;
      while (ctx.measureText(displayText).width > maxWidth && displayText.length > 0) {
        displayText = displayText.slice(0, -1);
      }

      // Draw text
      ctx.fillText(displayText, x, currentY);

      // Move to next line
      currentY += fontSize * 1.3;
    });

    return canvas;
  }

  /**
   * Validates layout for rendering
   */
  private static validateLayout(layout: BadgeLayout): { valid: boolean; issues: string[] } {
    const issues: string[] = [];
    
    if (layout.totalHeight > layout.badgeHeight) {
      issues.push(`Total text height (${layout.totalHeight}px) exceeds badge height (${layout.badgeHeight}px)`);
    }

    layout.lines.forEach((line, index) => {
      if (line.width > layout.badgeWidth - 28) {
        issues.push(`Line ${index + 1} width (${line.width}px) exceeds available width`);
      }
    });

    return {
      valid: issues.length === 0,
      issues
    };
  }

  /**
   * Renders badge to data URL
   */
  static async renderToDataURL(
    badge: Badge,
    options: PreviewRendererOptions = {}
  ): Promise<string> {
    const {
      quality = 0.9,
      format = 'image/png'
    } = options;

    try {
      const canvas = await this.renderToCanvas(badge, options);
      return canvas.toDataURL(format, quality);
    } catch (error) {
      console.error('Error rendering badge to data URL:', error);
      throw error;
    }
  }

  /**
   * Renders badge to blob
   */
  static async renderToBlob(
    badge: Badge,
    options: PreviewRendererOptions = {}
  ): Promise<Blob> {
    const {
      format = 'image/png'
    } = options;

    try {
      const canvas = await this.renderToCanvas(badge, options);
      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        }, format);
      });
    } catch (error) {
      console.error('Error rendering badge to blob:', error);
      throw error;
    }
  }

  /**
   * Compares layout engine vs legacy rendering
   */
  static async compareRendering(
    badge: Badge,
    options: PreviewRendererOptions = {}
  ): Promise<{
    layoutEngine: HTMLCanvasElement;
    legacy: HTMLCanvasElement;
    differences: string[];
  }> {
    const layoutEngine = await this.renderToCanvas(badge, { ...options, useLayoutEngine: true });
    const legacy = await this.renderToCanvas(badge, { ...options, useLayoutEngine: false });

    const differences: string[] = [];
    
    // Compare canvas dimensions
    if (layoutEngine.width !== legacy.width || layoutEngine.height !== legacy.height) {
      differences.push('Canvas dimensions differ');
    }

    // Compare pixel data (simplified comparison)
    const layoutCtx = layoutEngine.getContext('2d');
    const legacyCtx = legacy.getContext('2d');
    
    if (layoutCtx && legacyCtx) {
      const layoutData = layoutCtx.getImageData(0, 0, layoutEngine.width, layoutEngine.height);
      const legacyData = legacyCtx.getImageData(0, 0, legacy.width, legacy.height);
      
      if (layoutData.data.length !== legacyData.data.length) {
        differences.push('Pixel data length differs');
      }
    }

    return {
      layoutEngine,
      legacy,
      differences
    };
  }
}
