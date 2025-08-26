import { Badge } from '../types/badge';

export interface FontData {
  family: string;
  weight: 'normal' | 'bold';
  style: 'normal' | 'italic';
  filePath: string;
  googleFontsUrl?: string;
}

export interface FontMetrics {
  ascent: number;
  descent: number;
  baseline: number;
  lineHeight: number;
  xHeight: number;
  capHeight: number;
}

// Map font names to their local file paths
const FONT_FILE_MAPPING: { [key: string]: FontData } = {
  // Roboto variants (flat structure)
  'Roboto': {
    family: 'Roboto',
    weight: 'normal',
    style: 'normal',
    filePath: '/Fonts/Roboto-Regular.ttf'
  },
  'Roboto-Bold': {
    family: 'Roboto',
    weight: 'bold',
    style: 'normal',
    filePath: '/Fonts/Roboto-Bold.ttf'
  },
  'Roboto-Italic': {
    family: 'Roboto',
    weight: 'normal',
    style: 'italic',
    filePath: '/Fonts/Roboto-Italic.ttf'
  },
  'Roboto-BoldItalic': {
    family: 'Roboto',
    weight: 'bold',
    style: 'italic',
    filePath: '/Fonts/Roboto-BoldItalic.ttf'
  },
  'Roboto-Medium': {
    family: 'Roboto',
    weight: 'normal',
    style: 'normal',
    filePath: '/Fonts/Roboto-Medium.ttf'
  },
  'Roboto-MediumItalic': {
    family: 'Roboto',
    weight: 'normal',
    style: 'italic',
    filePath: '/Fonts/Roboto-MediumItalic.ttf'
  },
  'Roboto-Light': {
    family: 'Roboto',
    weight: 'normal',
    style: 'normal',
    filePath: '/Fonts/Roboto-Light.ttf'
  },
  'Roboto-LightItalic': {
    family: 'Roboto',
    weight: 'normal',
    style: 'italic',
    filePath: '/Fonts/Roboto-LightItalic.ttf'
  },

  // Oswald variants
  'Oswald': {
    family: 'Oswald',
    weight: 'normal',
    style: 'normal',
    filePath: '/Fonts/Oswald/Oswald-Regular.ttf'
  },
  'Oswald-Bold': {
    family: 'Oswald',
    weight: 'bold',
    style: 'normal',
    filePath: '/Fonts/Oswald/Oswald-Bold.ttf'
  },
  'Oswald-Light': {
    family: 'Oswald',
    weight: 'normal',
    style: 'normal',
    filePath: '/Fonts/Oswald/Oswald-Light.ttf'
  },
  'Oswald-ExtraLight': {
    family: 'Oswald',
    weight: 'normal',
    style: 'normal',
    filePath: '/Fonts/Oswald/Oswald-ExtraLight.ttf'
  },

  // Open Sans variants
  'Open Sans': {
    family: 'Open Sans',
    weight: 'normal',
    style: 'normal',
    filePath: '/Fonts/Open_Sans/OpenSans-Regular.ttf'
  },
  'Open Sans-Bold': {
    family: 'Open Sans',
    weight: 'bold',
    style: 'normal',
    filePath: '/Fonts/Open_Sans/OpenSans-Bold.ttf'
  },
  'Open Sans-Italic': {
    family: 'Open Sans',
    weight: 'normal',
    style: 'italic',
    filePath: '/Fonts/Open_Sans/OpenSans-Italic.ttf'
  },
  'Open Sans-BoldItalic': {
    family: 'Open Sans',
    weight: 'bold',
    style: 'italic',
    filePath: '/Fonts/Open_Sans/OpenSans-BoldItalic.ttf'
  },

  // Lato variants
  'Lato': {
    family: 'Lato',
    weight: 'normal',
    style: 'normal',
    filePath: '/Fonts/Lato/Lato-Regular.ttf'
  },
  'Lato-Bold': {
    family: 'Lato',
    weight: 'bold',
    style: 'normal',
    filePath: '/Fonts/Lato/Lato-Bold.ttf'
  },
  'Lato-Italic': {
    family: 'Lato',
    weight: 'normal',
    style: 'italic',
    filePath: '/Fonts/Lato/Lato-Italic.ttf'
  },
  'Lato-BoldItalic': {
    family: 'Lato',
    weight: 'bold',
    style: 'italic',
    filePath: '/Fonts/Lato/Lato-BoldItalic.ttf'
  },

  // Montserrat variants
  'Montserrat': {
    family: 'Montserrat',
    weight: 'normal',
    style: 'normal',
    filePath: '/Fonts/Montserrat/Montserrat-Regular.ttf'
  },
  'Montserrat-Bold': {
    family: 'Montserrat',
    weight: 'bold',
    style: 'normal',
    filePath: '/Fonts/Montserrat/Montserrat-Bold.ttf'
  },
  'Montserrat-Italic': {
    family: 'Montserrat',
    weight: 'normal',
    style: 'italic',
    filePath: '/Fonts/Montserrat/Montserrat-Italic.ttf'
  },
  'Montserrat-BoldItalic': {
    family: 'Montserrat',
    weight: 'bold',
    style: 'italic',
    filePath: '/Fonts/Montserrat/Montserrat-BoldItalic.ttf'
  },

  // Source Sans 3 variants
  'Source Sans 3': {
    family: 'Source Sans 3',
    weight: 'normal',
    style: 'normal',
    filePath: '/Fonts/Source_Sans_3/SourceSans3-Regular.ttf'
  },
  'Source Sans 3-Bold': {
    family: 'Source Sans 3',
    weight: 'bold',
    style: 'normal',
    filePath: '/Fonts/Source_Sans_3/SourceSans3-Bold.ttf'
  },
  'Source Sans 3-Italic': {
    family: 'Source Sans 3',
    weight: 'normal',
    style: 'italic',
    filePath: '/Fonts/Source_Sans_3/SourceSans3-Italic.ttf'
  },
  'Source Sans 3-BoldItalic': {
    family: 'Source Sans 3',
    weight: 'bold',
    style: 'italic',
    filePath: '/Fonts/Source_Sans_3/SourceSans3-BoldItalic.ttf'
  },

  // Raleway variants
  'Raleway': {
    family: 'Raleway',
    weight: 'normal',
    style: 'normal',
    filePath: '/Fonts/Raleway/Raleway-Regular.ttf'
  },
  'Raleway-Bold': {
    family: 'Raleway',
    weight: 'bold',
    style: 'normal',
    filePath: '/Fonts/Raleway/Raleway-Bold.ttf'
  },
  'Raleway-Italic': {
    family: 'Raleway',
    weight: 'normal',
    style: 'italic',
    filePath: '/Fonts/Raleway/Raleway-Italic.ttf'
  },
  'Raleway-BoldItalic': {
    family: 'Raleway',
    weight: 'bold',
    style: 'italic',
    filePath: '/Fonts/Raleway/Raleway-BoldItalic.ttf'
  },

  // PT Sans variants
  'PT Sans': {
    family: 'PT Sans',
    weight: 'normal',
    style: 'normal',
    filePath: '/Fonts/PT_Sans/PTSans-Regular.ttf'
  },
  'PT Sans-Bold': {
    family: 'PT Sans',
    weight: 'bold',
    style: 'normal',
    filePath: '/Fonts/PT_Sans/PTSans-Bold.ttf'
  },
  'PT Sans-Italic': {
    family: 'PT Sans',
    weight: 'normal',
    style: 'italic',
    filePath: '/Fonts/PT_Sans/PTSans-Italic.ttf'
  },
  'PT Sans-BoldItalic': {
    family: 'PT Sans',
    weight: 'bold',
    style: 'italic',
    filePath: '/Fonts/PT_Sans/PTSans-BoldItalic.ttf'
  },

  // Merriweather variants
  'Merriweather': {
    family: 'Merriweather',
    weight: 'normal',
    style: 'normal',
    filePath: '/Fonts/Merriweather/Merriweather-Regular.ttf'
  },
  'Merriweather-Bold': {
    family: 'Merriweather',
    weight: 'bold',
    style: 'normal',
    filePath: '/Fonts/Merriweather/Merriweather-Bold.ttf'
  },
  'Merriweather-Italic': {
    family: 'Merriweather',
    weight: 'normal',
    style: 'italic',
    filePath: '/Fonts/Merriweather/Merriweather-Italic.ttf'
  },
  'Merriweather-BoldItalic': {
    family: 'Merriweather',
    weight: 'bold',
    style: 'italic',
    filePath: '/Fonts/Merriweather/Merriweather-BoldItalic.ttf'
  },

  // Noto Sans variants
  'Noto Sans': {
    family: 'Noto Sans',
    weight: 'normal',
    style: 'normal',
    filePath: '/Fonts/Noto_Sans/NotoSans-Regular.ttf'
  },
  'Noto Sans-Bold': {
    family: 'Noto Sans',
    weight: 'bold',
    style: 'normal',
    filePath: '/Fonts/Noto_Sans/NotoSans-Bold.ttf'
  },
  'Noto Sans-Italic': {
    family: 'Noto Sans',
    weight: 'normal',
    style: 'italic',
    filePath: '/Fonts/Noto_Sans/NotoSans-Italic.ttf'
  },
  'Noto Sans-BoldItalic': {
    family: 'Noto Sans',
    weight: 'bold',
    style: 'italic',
    filePath: '/Fonts/Noto_Sans/NotoSans-BoldItalic.ttf'
  },

  // Noto Serif variants
  'Noto Serif': {
    family: 'Noto Serif',
    weight: 'normal',
    style: 'normal',
    filePath: '/Fonts/Noto_Serif/NotoSerif-Regular.ttf'
  },
  'Noto Serif-Bold': {
    family: 'Noto Serif',
    weight: 'bold',
    style: 'normal',
    filePath: '/Fonts/Noto_Serif/NotoSerif-Bold.ttf'
  },
  'Noto Serif-Italic': {
    family: 'Noto Serif',
    weight: 'normal',
    style: 'italic',
    filePath: '/Fonts/Noto_Serif/NotoSerif-Italic.ttf'
  },
  'Noto Serif-BoldItalic': {
    family: 'Noto Serif',
    weight: 'bold',
    style: 'italic',
    filePath: '/Fonts/Noto_Serif/NotoSerif-BoldItalic.ttf'
  },

  // PT Serif variants
  'PT Serif': {
    family: 'PT Serif',
    weight: 'normal',
    style: 'normal',
    filePath: '/Fonts/PT_Serif/PTSerif-Regular.ttf'
  },
  'PT Serif-Bold': {
    family: 'PT Serif',
    weight: 'bold',
    style: 'normal',
    filePath: '/Fonts/PT_Serif/PTSerif-Bold.ttf'
  },
  'PT Serif-Italic': {
    family: 'PT Serif',
    weight: 'normal',
    style: 'italic',
    filePath: '/Fonts/PT_Serif/PTSerif-Italic.ttf'
  },
  'PT Serif-BoldItalic': {
    family: 'PT Serif',
    weight: 'bold',
    style: 'italic',
    filePath: '/Fonts/PT_Serif/PTSerif-BoldItalic.ttf'
  }
};

// Cache for loaded fonts
const fontCache = new Map<string, any>();

export class FontManager {
  /**
   * Get font data for a specific font family and style
   */
  static getFontData(fontFamily: string, bold: boolean = false, italic: boolean = false): FontData | null {
    // Create the font key based on family, weight, and style
    let fontKey = fontFamily;
    
    if (bold && italic) {
      fontKey = `${fontFamily}-BoldItalic`;
    } else if (bold) {
      fontKey = `${fontFamily}-Bold`;
    } else if (italic) {
      fontKey = `${fontFamily}-Italic`;
    }
    
    return FONT_FILE_MAPPING[fontKey] || FONT_FILE_MAPPING[fontFamily] || null;
  }

  /**
   * Load font for canvas rendering
   */
  static async loadFontForCanvas(fontFamily: string, bold: boolean = false, italic: boolean = false): Promise<void> {
    const fontData = this.getFontData(fontFamily, bold, italic);
    if (!fontData) {
      console.warn(`Font not found: ${fontFamily} (bold: ${bold}, italic: ${italic})`);
      return;
    }

    // For web canvas, we'll rely on CSS @font-face declarations
    // The fonts should be loaded via CSS in the root.tsx file
    console.log(`Font loaded for canvas: ${fontData.family} (${fontData.weight}, ${fontData.style})`);
  }

  /**
   * Embed font for PDF using local font files
   */
  static async embedFontForPDF(fontFamily: string, bold: boolean = false, italic: boolean = false, pdfDoc: any): Promise<any> {
    const fontData = this.getFontData(fontFamily, bold, italic);
    if (!fontData) {
      console.warn(`Font not found for PDF: ${fontFamily} (bold: ${bold}, italic: ${italic})`);
      return null;
    }

    const cacheKey = `${fontFamily}-${bold}-${italic}`;
    
    // Check cache first
    if (fontCache.has(cacheKey)) {
      return fontCache.get(cacheKey);
    }

    try {
      // Fetch the local font file
      const response = await fetch(fontData.filePath);
      if (!response.ok) {
        throw new Error(`Failed to fetch font: ${response.statusText}`);
      }
      
      const fontBytes = await response.arrayBuffer();
      
      // Embed the font
      const embeddedFont = await pdfDoc.embedFont(fontBytes);
      console.log(`Successfully embedded local font: ${fontData.family} (${fontData.weight}, ${fontData.style})`);
      
      // Cache the result
      fontCache.set(cacheKey, embeddedFont);
      return embeddedFont;
    } catch (error) {
      console.warn(`Failed to embed local font ${fontFamily}, falling back to system fonts:`, error);
      return null;
    }
  }

  /**
   * Get font metrics using a hidden canvas
   */
  static getFontMetrics(fontSize: number, fontFamily: string, bold: boolean = false, italic: boolean = false): FontMetrics {
    // Create a hidden canvas for measurement
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return {
        ascent: fontSize * 0.8,
        descent: fontSize * 0.2,
        baseline: fontSize * 0.8,
        lineHeight: fontSize * 1.2,
        xHeight: fontSize * 0.5,
        capHeight: fontSize * 0.7
      };
    }

    const fontData = this.getFontData(fontFamily, bold, italic);
    const fontString = `${italic ? 'italic ' : ''}${bold ? 'bold ' : ''}${fontSize}px ${fontData?.family || fontFamily}`;
    
    ctx.font = fontString;
    
    // Measure text metrics
    const metrics = ctx.measureText('M'); // Use 'M' for cap height
    const textMetrics = ctx.measureText('x'); // Use 'x' for x-height
    
    return {
      ascent: fontSize * 0.8,
      descent: fontSize * 0.2,
      baseline: fontSize * 0.8,
      lineHeight: fontSize * 1.2,
      xHeight: textMetrics.actualBoundingBoxAscent || fontSize * 0.5,
      capHeight: metrics.actualBoundingBoxAscent || fontSize * 0.7
    };
  }

  /**
   * Measure text width using a hidden canvas
   */
  static measureTextWidth(text: string, fontSize: number, fontFamily: string, bold: boolean = false, italic: boolean = false): number {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return text.length * fontSize * 0.6; // Fallback

    const fontData = this.getFontData(fontFamily, bold, italic);
    const fontString = `${italic ? 'italic ' : ''}${bold ? 'bold ' : ''}${fontSize}px ${fontData?.family || fontFamily}`;
    
    ctx.font = fontString;
    return ctx.measureText(text).width;
  }

  /**
   * Preload all fonts for better performance
   */
  static async preloadFonts(): Promise<void> {
    console.log('Preloading fonts...');
    const preloadPromises = Object.values(FONT_FILE_MAPPING).map(async (fontData) => {
      try {
        await fetch(fontData.filePath, { method: 'HEAD' });
        console.log(`Preloaded: ${fontData.family} (${fontData.weight}, ${fontData.style})`);
      } catch (error) {
        console.warn(`Failed to preload font: ${fontData.family}`, error);
      }
    });
    
    await Promise.all(preloadPromises);
    console.log('Font preloading completed');
  }

  /**
   * Clear the font cache
   */
  static clearCache(): void {
    fontCache.clear();
    console.log('Font cache cleared');
  }

  /**
   * Get all available font families
   */
  static getAvailableFontFamilies(): string[] {
    const families = new Set<string>();
    Object.values(FONT_FILE_MAPPING).forEach(fontData => {
      families.add(fontData.family);
    });
    return Array.from(families).sort();
  }

  /**
   * Get available weights and styles for a font family
   */
  static getFontVariants(fontFamily: string): { weight: string; style: string; filePath: string }[] {
    return Object.values(FONT_FILE_MAPPING)
      .filter(fontData => fontData.family === fontFamily)
      .map(fontData => ({
        weight: fontData.weight,
        style: fontData.style,
        filePath: fontData.filePath
      }));
  }
}
