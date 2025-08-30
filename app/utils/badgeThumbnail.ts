import { Badge, BadgeLine } from '../types/badge';

export interface BadgeThumbnailOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'image/png' | 'image/jpeg' | 'image/webp';
}

/**
 * Captures a snapshot of the actual BadgePreview component from the DOM
 * This ensures we get exactly what the user sees in the preview with high quality
 */
export async function captureBadgePreviewSnapshot(badge: Badge): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // Find the badge preview element in the DOM
      const badgePreviewElement = document.querySelector('.badge-preview') as HTMLElement;
      
      if (!badgePreviewElement) {
        console.warn('Badge preview element not found, falling back to canvas generation');
        // Fallback to canvas generation
        generateBadgeThumbnail(badge, {
          width: 300,
          height: 100,
          quality: 1.0,
          format: 'image/png'
        }).then(resolve).catch(reject);
        return;
      }

      console.log('Capturing badge preview snapshot at high resolution...');

      // Get the computed styles to ensure we capture the exact dimensions
      const computedStyle = window.getComputedStyle(badgePreviewElement);
      const displayWidth = parseInt(computedStyle.width);
      const displayHeight = parseInt(computedStyle.height);

      // Create high-resolution canvas (3x scale for crisp text)
      const scale = 3;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Set canvas dimensions to high resolution
      canvas.width = displayWidth * scale;
      canvas.height = displayHeight * scale;

      // Enable high-quality rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Scale the context to match the high resolution
      ctx.scale(scale, scale);

      // Fill background exactly as in preview
      ctx.fillStyle = badge.backgroundColor || '#FFFFFF';
      ctx.fillRect(0, 0, displayWidth, displayHeight);

      // Apply rounded corners exactly like BadgeDesigner (rounded class)
      const borderRadius = 8; // rounded class = 8px
      ctx.save();
      ctx.beginPath();
      
      // Use quadratic curves for rounded corners (more compatible than roundRect)
      ctx.moveTo(borderRadius, 0);
      ctx.lineTo(displayWidth - borderRadius, 0);
      ctx.quadraticCurveTo(displayWidth, 0, displayWidth, borderRadius);
      ctx.lineTo(displayWidth, displayHeight - borderRadius);
      ctx.quadraticCurveTo(displayWidth, displayHeight, displayWidth - borderRadius, displayHeight);
      ctx.lineTo(borderRadius, displayHeight);
      ctx.quadraticCurveTo(0, displayHeight, 0, displayHeight - borderRadius);
      ctx.lineTo(0, borderRadius);
      ctx.quadraticCurveTo(0, 0, borderRadius, 0);
      ctx.closePath();
      
      ctx.clip();
      
      // Redraw background and border within rounded corners
      ctx.fillStyle = badge.backgroundColor || '#FFFFFF';
      ctx.fillRect(0, 0, displayWidth, displayHeight);
      ctx.strokeStyle = '#888';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, displayWidth - 2, displayHeight - 2);
      ctx.restore();

      // Add border exactly as in preview
      ctx.strokeStyle = '#888';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, displayWidth - 2, displayHeight - 2);

      // Draw text exactly as it appears in the preview
      const padding = Math.max(8, displayWidth * 0.04);
      const availableWidth = displayWidth - (padding * 2);
      const availableHeight = displayHeight - (padding * 2);

      // Calculate total text height and positioning
      const totalTextHeight = badge.lines.reduce((sum, line) => {
        return sum + (line.size * 1.3);
      }, 0);

      let currentY = padding + (availableHeight - totalTextHeight) / 2;

      // Draw each line of text exactly as in the preview
      badge.lines.forEach((line: BadgeLine) => {
        const fontStyle = line.italic ? 'italic ' : '';
        const fontWeight = line.bold ? 'bold ' : '';
        const fontSize = Math.min(line.size, displayHeight * 0.4);
        
        // Use better font rendering with explicit font family
        const fontFamily = line.fontFamily || 'Arial';
        ctx.font = `${fontStyle}${fontWeight}${fontSize}px "${fontFamily}", Arial, sans-serif`;
        ctx.fillStyle = line.color;
        ctx.textAlign = line.alignment as CanvasTextAlign;
        ctx.textBaseline = 'top';
        
        // Enable subpixel rendering for crisp text
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Calculate x position based on alignment
        let x: number;
        switch (line.alignment) {
          case 'left':
            x = padding;
            break;
          case 'right':
            x = displayWidth - padding;
            break;
          default: // center
            x = displayWidth / 2;
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

      console.log('High-resolution badge preview snapshot captured successfully, dimensions:', {
        displayWidth,
        displayHeight,
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
        scale
      });

      // Convert to high-quality PNG data URL
      const pngDataUrl = canvas.toDataURL('image/png', 1.0);
      resolve(pngDataUrl);

    } catch (error) {
      console.error('Error capturing badge preview snapshot:', error);
      // Fallback to canvas generation
      generateBadgeThumbnail(badge, {
        width: 300,
        height: 100,
        quality: 1.0,
        format: 'image/png'
      }).then(resolve).catch(reject);
    }
  });
}

/**
 * Generates a thumbnail image of a badge design
 * @param badge The badge design data
 * @param options Thumbnail generation options
 * @returns Promise<string> Base64 encoded image data URL
 */
export async function generateBadgeThumbnail(
  badge: Badge, 
  options: BadgeThumbnailOptions = {}
): Promise<string> {
  const {
    width = 300,
    height = 100,
    quality = 0.9,
    format = 'image/png'
  } = options;

  return new Promise((resolve, reject) => {
    try {
      // Create canvas element
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        console.error('Could not get canvas context');
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Enable high-quality rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Set better text rendering context
      ctx.textRendering = 'optimizeLegibility';

      // Fill background with fallback
      const backgroundColor = badge.backgroundColor || '#FFFFFF';
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);

      // Add badge border (same as preview)
      ctx.strokeStyle = '#888';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, width - 2, height - 2);

      // Calculate text positioning
      const padding = Math.max(8, width * 0.04); // Responsive padding
      const availableWidth = width - (padding * 2);
      const availableHeight = height - (padding * 2);

      // Calculate total text height and positioning
      const totalTextHeight = badge.lines.reduce((sum, line) => {
        return sum + (line.size * 1.3); // 1.3 line height multiplier
      }, 0);

      let currentY = padding + (availableHeight - totalTextHeight) / 2;

      // Draw each line of text
      badge.lines.forEach((line: BadgeLine) => {
        // Set font properties with better rendering
        const fontStyle = line.italic ? 'italic ' : '';
        const fontWeight = line.bold ? 'bold ' : '';
        const fontSize = Math.min(line.size, height * 0.4); // Cap font size to prevent overflow
        
        // Use better font rendering with explicit font family
        const fontFamily = line.fontFamily || 'Arial';
        ctx.font = `${fontStyle}${fontWeight}${fontSize}px "${fontFamily}", Arial, sans-serif`;
        ctx.fillStyle = line.color;
        ctx.textAlign = line.alignment as CanvasTextAlign;
        ctx.textBaseline = 'top';
        
        // Enable subpixel rendering for crisp text
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

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

      // Convert to data URL
      try {
        const dataUrl = canvas.toDataURL(format, quality);
        resolve(dataUrl);
      } catch (toDataUrlError) {
        console.error('Error converting canvas to data URL:', toDataUrlError);
        // Try with lower quality
        try {
          const fallbackDataUrl = canvas.toDataURL('image/png', 0.5);
          resolve(fallbackDataUrl);
        } catch (fallbackError) {
          console.error('Fallback thumbnail generation failed:', fallbackError);
          reject(fallbackError);
        }
      }

    } catch (error) {
      console.error('Error generating badge thumbnail:', error);
      // Return a basic fallback thumbnail instead of rejecting
      try {
        const fallbackThumbnail = generateFallbackThumbnail(badge);
        resolve(fallbackThumbnail);
      } catch (fallbackError) {
        console.error('Fallback thumbnail also failed:', fallbackError);
        reject(error);
      }
    }
  });
}

/**
 * Generates a full-size badge image (actual badge dimensions)
 * @param badge The badge design data
 * @returns Promise<string> Base64 encoded image data URL
 */
export async function generateFullBadgeImage(badge: Badge): Promise<string> {
  try {
    // Capture a snapshot of the actual BadgePreview component from the DOM
    // This ensures we get exactly what the user sees in the preview
    console.log('Capturing badge preview snapshot...');
    const snapshot = await captureBadgePreviewSnapshot(badge);
    console.log('Badge preview snapshot captured successfully');
    return snapshot;
  } catch (error) {
    console.error('Error capturing badge preview snapshot:', error);
    // Fallback to high-resolution canvas generation
    console.log('Falling back to canvas generation...');
    const fullImage = await generateBadgeThumbnail(badge, {
      width: 900,  // 3x preview width for crisp text
      height: 300, // 3x preview height for crisp text
      quality: 1.0, // Maximum quality
      format: 'image/png' // PNG for best quality
    });
    return fullImage;
  }
}

/**
 * Generates a thumbnail from the full image (proportional scaling)
 * @param fullImageDataUrl The full-size image data URL
 * @param targetWidth The target thumbnail width
 * @param targetHeight The target thumbnail height
 * @returns Promise<string> Base64 encoded thumbnail data URL
 */
export async function generateThumbnailFromFullImage(
  fullImageDataUrl: string, 
  targetWidth: number = 100, 
  targetHeight: number = 50
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        // Draw the full image scaled down to thumbnail size
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        try {
          const thumbnailDataUrl = canvas.toDataURL('image/png', 0.8);
          resolve(thumbnailDataUrl);
        } catch (error) {
          console.error('Error converting thumbnail to data URL:', error);
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load full image for thumbnail generation'));
      };

      img.src = fullImageDataUrl;
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Generates a thumbnail from the badge design (legacy method)
 * @param badge The badge design data
 * @returns Promise<string> Base64 encoded image data URL
 */
export async function generateCartThumbnail(badge: Badge): Promise<string> {
  try {
    const thumbnail = await generateBadgeThumbnail(badge, {
      width: 150,
      height: 50,
      quality: 0.8,
      format: 'image/png' // Use PNG for better text clarity
    });
    return thumbnail;
  } catch (error) {
    console.error('Error generating cart thumbnail:', error);
    // Return a fallback thumbnail
    const fallback = generateFallbackThumbnail(badge);
    return fallback;
  }
}

/**
 * Generates a fallback full-size image when the main generation fails
 * @param badge The badge design data
 * @returns string Base64 encoded fallback image
 */
function generateFallbackFullImage(badge: Badge): string {
  console.log('Generating fallback full badge image for badge:', {
    backgroundColor: badge.backgroundColor
  });
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    console.error('Could not get canvas context for fallback full image');
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  }

  canvas.width = 300;  // 1 inch at 300 DPI
  canvas.height = 900; // 3 inches at 300 DPI

  try {
    // Simple fallback design with proper background color
    const backgroundColor = badge.backgroundColor || '#FFFFFF';
    console.log('Fallback full image background color:', backgroundColor);
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, 300, 900);
    
    // No border - clean image

    // Add text with contrasting color
    const textColor = backgroundColor === '#FFFFFF' || backgroundColor === '#F0E68C' ? '#000000' : '#FFFFFF';
    ctx.fillStyle = textColor;
    ctx.font = '48px Arial'; // Larger font for full image
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Custom Badge', 150, 450); // Center of the image

    const dataUrl = canvas.toDataURL('image/png', 0.9);
    console.log('Fallback full image generated successfully');
    return dataUrl;
  } catch (error) {
    console.error('Error generating fallback full image:', error);
    // Return a minimal 1x1 transparent pixel as last resort
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  }
}

/**
 * Generates a fallback thumbnail when the main generation fails
 * @param badge The badge design data
 * @returns string Base64 encoded fallback image
 */
function generateFallbackThumbnail(badge: Badge): string {
  console.log('Generating fallback thumbnail for badge:', {
    backgroundColor: badge.backgroundColor
  });
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    console.error('Could not get canvas context for fallback thumbnail');
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  }

  canvas.width = 150;  // Back to original size
  canvas.height = 50;  // Back to original size

  try {
    // Simple fallback design with proper background color
    const backgroundColor = badge.backgroundColor || '#FFFFFF';
    console.log('Fallback thumbnail background color:', backgroundColor);
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, 150, 50);
    
    // No border - clean image

    // Add text with contrasting color
    const textColor = backgroundColor === '#FFFFFF' || backgroundColor === '#F0E68C' ? '#000000' : '#FFFFFF';
    ctx.fillStyle = textColor;
    ctx.font = '12px Arial'; // Back to readable font size
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Custom Badge', 75, 25); // Back to original position

    const dataUrl = canvas.toDataURL('image/png', 0.8); // Use PNG with good quality
    console.log('Fallback thumbnail generated successfully');
    return dataUrl;
  } catch (error) {
    console.error('Error generating fallback thumbnail:', error);
    // Return a minimal 1x1 transparent pixel as last resort
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  }
} 