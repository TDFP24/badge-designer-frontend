import { Badge } from '../../types/badge';
import { BadgeLayout } from '../layoutEngine';
import { BaseRenderer } from './base';
import { fontManager } from '../fontManager';

/**
 * Preview renderer options
 */
export interface PreviewRendererOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'image/png' | 'image/jpeg' | 'image/webp';
  includeBorder?: boolean;
  borderColor?: string;
  borderWidth?: number;
}

/**
 * Preview renderer for generating badge preview images
 */
export class PreviewRenderer extends BaseRenderer {
  private options: PreviewRendererOptions;

  constructor(options: PreviewRendererOptions = {}) {
    super();
    this.options = {
      width: 300,
      height: 100,
      quality: 0.9,
      format: 'image/png',
      includeBorder: true,
      borderColor: '#888',
      borderWidth: 2,
      ...options
    };
  }

  getName(): string {
    return 'PreviewRenderer';
  }

  getOutputFormat(): string {
    return this.options.format || 'image/png';
  }

  async render(layout: BadgeLayout, badge: Badge): Promise<string> {
    this.validateLayout(layout);

    return new Promise((resolve, reject) => {
      try {
        // Create canvas element
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Set canvas dimensions
        canvas.width = this.options.width!;
        canvas.height = this.options.height!;

        // Scale factor to convert from layout coordinates to canvas coordinates
        const scaleX = canvas.width / layout.badgeWidth;
        const scaleY = canvas.height / layout.badgeHeight;

        // Fill background
        ctx.fillStyle = layout.backgroundColor || '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add border if requested
        if (this.options.includeBorder) {
          ctx.strokeStyle = this.options.borderColor!;
          ctx.lineWidth = this.options.borderWidth!;
          ctx.strokeRect(
            this.options.borderWidth! / 2,
            this.options.borderWidth! / 2,
            canvas.width - this.options.borderWidth!,
            canvas.height - this.options.borderWidth!
          );
        }

        // Draw each line of text
        for (const lineLayout of layout.lines) {
          if (!lineLayout.text) continue;

          const originalLine = lineLayout.originalLine;
          
          // Scale coordinates to canvas size
          const x = lineLayout.x * scaleX;
          const y = lineLayout.y * scaleY;
          const fontSize = lineLayout.fontSize * scaleX;

          // Set font properties
          const fontWeight = this.getFontWeight(originalLine.bold || false);
          const fontStyle = this.getFontStyle(originalLine.italic || false);
          const fontFamily = originalLine.fontFamily || 'Roboto';
          
          ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
          ctx.fillStyle = originalLine.color || '#000000';
          ctx.textAlign = originalLine.alignment || 'center';
          ctx.textBaseline = 'top';

          // Draw text
          ctx.fillText(lineLayout.text, x, y);
        }

        // Convert to data URL
        try {
          const dataUrl = canvas.toDataURL(this.options.format, this.options.quality);
          resolve(dataUrl);
        } catch (error) {
          console.error('Error converting canvas to data URL:', error);
          // Try with lower quality
          try {
            const fallbackDataUrl = canvas.toDataURL('image/png', 0.5);
            resolve(fallbackDataUrl);
          } catch (fallbackError) {
            reject(fallbackError);
          }
        }

      } catch (error) {
        console.error('Error in preview renderer:', error);
        reject(error);
      }
    });
  }

  /**
   * Generate a thumbnail version of the badge
   */
  async renderThumbnail(layout: BadgeLayout, badge: Badge, width: number = 100, height: number = 50): Promise<string> {
    const thumbnailOptions: PreviewRendererOptions = {
      ...this.options,
      width,
      height,
      quality: 0.7, // Lower quality for thumbnails
      includeBorder: true,
      borderWidth: 1
    };

    const thumbnailRenderer = new PreviewRenderer(thumbnailOptions);
    return thumbnailRenderer.render(layout, badge);
  }

  /**
   * Generate a full-size version of the badge
   */
  async renderFullSize(layout: BadgeLayout, badge: Badge, width: number = 900, height: number = 300): Promise<string> {
    const fullSizeOptions: PreviewRendererOptions = {
      ...this.options,
      width,
      height,
      quality: 0.95, // Higher quality for full-size
      includeBorder: true,
      borderWidth: 3
    };

    const fullSizeRenderer = new PreviewRenderer(fullSizeOptions);
    return fullSizeRenderer.render(layout, badge);
  }
}

/**
 * Global preview renderer instance
 */
export const previewRenderer = new PreviewRenderer();
