import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Badge } from '../types/badge';
import { getColorInfo } from '../constants/colors';

/* ---------- Color utils ---------- */

// rgb()/hex → [0..1] rgb
function cssColorToRgb(color: string): [number, number, number] {
  if (!color) return [0, 0, 0];
  
  // Normalize the color string
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
  // Fallback: try getColorInfo (if caller passed a named color we support)
  const info = getColorInfo(normalizedColor) || getColorInfo('#000000');
  const hex = info?.hex?.toUpperCase?.() || '#000000';
  return cssColorToRgb(hex);
}

// Normalise to #RRGGBB (uppercase)
function cssColorToHex(color: string): string {
  if (!color) return '#000000';
  
  // Normalize the color string
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
  // Try lookup
  const info = getColorInfo(normalizedColor);
  if (info?.hex) return info.hex.toUpperCase();
  return '#000000';
}

/* ---------- Units ---------- */

// Convert px to pt
const pxToPt = (px: number) => px * 0.75;
const pxToPtRounded = (px: number) => Math.round(pxToPt(px));

/* ---------- Font embedding ---------- */

// Map font names to Google Fonts URLs (matching the ones in root.tsx)
const GOOGLE_FONT_URLS: { [key: string]: string } = {
  'Roboto': 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.ttf',
  'Oswald': 'https://fonts.gstatic.com/s/oswald/v49/TK3_WkUHHAIjg75cFRf3bXL8LICs1_FvsUZiYA.ttf',
  'Open Sans': 'https://fonts.gstatic.com/s/opensans/v40/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsjZ0B4gaVI.woff2',
  'Lato': 'https://fonts.gstatic.com/s/lato/v24/S6uyw4BMUTPHjx4wWw.ttf',
  'Montserrat': 'https://fonts.gstatic.com/s/montserrat/v25/JTUSjIg1_i6t8kCHKm459Wlhyw.ttf',
  'Source Sans 3': 'https://fonts.gstatic.com/s/sourcesans3/v14/6xK3dSBYKcSV-LCoeQqfX1RYOo3qOK7lujVj9w.woff2',
  'Raleway': 'https://fonts.gstatic.com/s/raleway/v28/1Ptug8zJR_SdK3vCMx5.ttf',
  'PT Sans': 'https://fonts.gstatic.com/s/ptsans/v17/jizaRExUiTo99u79D0KEwA.ttf',
  'Merriweather': 'https://fonts.gstatic.com/s/merriweather/v30/u-440qyriQwlOrhSvowK_l5-fCZM.ttf',
  'Noto Sans': 'https://fonts.gstatic.com/s/notosans/v30/o-0IIpQlx3QUlC5A4PNb4g.ttf',
  'Noto Serif': 'https://fonts.gstatic.com/s/notoserif/v22/ga6Iaw1J5X9T9RW6j9bNTFA.ttf',
  'Georgia': 'https://fonts.gstatic.com/s/georgia/v18/georgia.ttf'
};

// Cache for embedded fonts
const fontCache = new Map<string, any>();

// Fetch and embed Google Fonts
async function embedGoogleFont(pdfDoc: any, fontFamily: string, isBold: boolean = false): Promise<any> {
  const cacheKey = `${fontFamily}-${isBold}`;
  
  // Check cache first
  if (fontCache.has(cacheKey)) {
    return fontCache.get(cacheKey);
  }
  
  try {
    const fontUrl = GOOGLE_FONT_URLS[fontFamily];
    if (!fontUrl) {
      console.warn(`Font ${fontFamily} not found, using Helvetica`);
      const fallbackFont = isBold ? await pdfDoc.embedFont(StandardFonts.HelveticaBold) : await pdfDoc.embedFont(StandardFonts.Helvetica);
      fontCache.set(cacheKey, fallbackFont);
      return fallbackFont;
    }

    // Fetch the font file
    const response = await fetch(fontUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch font: ${response.statusText}`);
    }
    
    const fontBytes = await response.arrayBuffer();
    
    // Embed the font
    const embeddedFont = await pdfDoc.embedFont(fontBytes);
    console.log(`Successfully embedded font: ${fontFamily} (${isBold ? 'bold' : 'regular'})`);
    
    // Cache the result
    fontCache.set(cacheKey, embeddedFont);
    return embeddedFont;
  } catch (error) {
    console.warn(`Failed to embed font ${fontFamily}, using Helvetica:`, error);
    const fallbackFont = isBold ? await pdfDoc.embedFont(StandardFonts.HelveticaBold) : await pdfDoc.embedFont(StandardFonts.Helvetica);
    fontCache.set(cacheKey, fallbackFont);
    return fallbackFont;
  }
}

/* ---------- Font mapping ---------- */

// Map custom fonts to available PDF-lib fonts
function getPdfFont(fontFamily: string, isBold: boolean): any {
  // For now, use Helvetica for all fonts since PDF-lib only supports standard fonts
  // In a full implementation, you would embed the actual font files
  return isBold ? StandardFonts.HelveticaBold : StandardFonts.Helvetica;
}

/* ---------- Simple PDF Generator ---------- */

export const generatePDFNew = async (badgeData: Badge, multipleBadges?: Badge[]): Promise<void> => {
  console.log('NEW PDF FUNCTION CALLED - v3.1 - FONT FIX');
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Start from top of page with margin
    let y = 800; // Start 40pt from top
    const leftMargin = 50;
    const rightMargin = 50;
    const contentWidth = 595.28 - leftMargin - rightMargin;

    console.log('Starting Y position:', y);
    console.log('Content width:', contentWidth);

    const allBadges = [badgeData, ...(multipleBadges || [])];

    for (let idx = 0; idx < allBadges.length; idx++) {
      const badge = allBadges[idx];
      console.log(`Processing Badge ${idx + 1}:`, {
        backgroundColor: badge.backgroundColor,
        lines: badge.lines.map(l => ({
          text: l.text,
          color: l.color,
          alignment: l.alignment,
          size: l.size,
          bold: l.bold,
          fontFamily: l.fontFamily
        }))
      });
      
      // Debug: Log each line individually
      badge.lines.forEach((line, lineIdx) => {
        console.log(`Badge ${idx + 1}, Line ${lineIdx + 1}:`, {
          text: `"${line.text}"`,
          textLength: line.text?.length || 0,
          color: line.color,
          alignment: line.alignment,
          size: line.size,
          bold: line.bold,
          fontFamily: line.fontFamily
        });
      });

      // Badge header - smaller size
      page.drawText(`Badge ${idx + 1}`, {
        x: leftMargin,
        y: y,
        size: 12, // Reduced from 16
        font: fontBold,
        color: rgb(0, 0, 0),
      });
      y -= 25; // Reduced spacing

      // Badge preview (left side)
      const badgeWidth = 200;
      const badgeHeight = 60;
      const badgeX = leftMargin;
      const badgeY = y - badgeHeight;

      // Draw badge background
      const bgColor = cssColorToRgb(badge.backgroundColor);
      page.drawRectangle({
        x: badgeX,
        y: badgeY,
        width: badgeWidth,
        height: badgeHeight,
        color: rgb(bgColor[0], bgColor[1], bgColor[2]),
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
      });

      // Draw badge text - match the iframe preview exactly
      const paddingX = 14; // matches the px-4 in the iframe
      const lineGap = 6; // visual gap between lines
      
      // Calculate total text height for centering
      const totalTextHeight = badge.lines.reduce((sum, line) => {
        const fontSize = pxToPtRounded(line.size || 12);
        return sum + fontSize * 1.3; // lineHeight: 1.3
      }, 0) + (badge.lines.length - 1) * lineGap;
      
      // Start from center of badge
      let currentY = badgeY + (badgeHeight + totalTextHeight) / 2;
      
      // Process lines sequentially to handle async font embedding
      for (let lineIdx = 0; lineIdx < badge.lines.length; lineIdx++) {
        const line = badge.lines[lineIdx];
        const fontSize = pxToPtRounded(line.size || 12);
        const textColor = cssColorToRgb(line.color);
        
        // Use the embedGoogleFont function to get the actual font
        const textFont = await embedGoogleFont(pdfDoc, line.fontFamily || 'Roboto', line.bold);
        
        // Clean up the text - remove extra quotes and handle empty text
        const cleanText = (line.text || '').replace(/^"|"$/g, '').trim();
        
        // Skip rendering if text is empty
        if (!cleanText) {
          console.log(`Skipping empty line ${lineIdx + 1}`);
          continue;
        }
        
        // Calculate text position
        const textWidth = textFont.widthOfTextAtSize(cleanText, fontSize);
        let textX = badgeX + paddingX; // Default left alignment
        
        if (line.alignment === 'center') {
          textX = badgeX + (badgeWidth - textWidth) / 2;
        } else if (line.alignment === 'right') {
          textX = badgeX + badgeWidth - paddingX - textWidth;
        }
        
        // Position text baseline
        const textY = currentY - fontSize * 0.7; // Adjust for text baseline
        
        page.drawText(cleanText, {
          x: textX,
          y: textY,
          size: fontSize,
          font: textFont,
          color: rgb(textColor[0], textColor[1], textColor[2]),
        });
        
        // Move to next line
        currentY -= fontSize * 1.3 + lineGap; // lineHeight: 1.3 + gap
      }

      // Color swatch below badge
      const swatchSize = 12;
      const swatchY = badgeY - 20;
      page.drawRectangle({
        x: badgeX,
        y: swatchY,
        width: swatchSize,
        height: swatchSize,
        color: rgb(bgColor[0], bgColor[1], bgColor[2]),
        borderColor: rgb(0, 0, 0),
        borderWidth: 0.5,
      });
      
      const hex = cssColorToHex(badge.backgroundColor);
      const colorInfo = getColorInfo(hex) || { name: 'Custom', hex };
      page.drawText(`${colorInfo.name} (${hex})`, {
        x: badgeX + swatchSize + 5,
        y: swatchY + 2,
        size: 10,
        font,
        color: rgb(0, 0, 0),
      });

      // Specification table (right side) - increased size
      const tableX = badgeX + badgeWidth + 20; // Reduced gap
      const tableY = y;
      const tableWidth = contentWidth - badgeWidth - 20; // Increased table width
      const colWidths = [tableWidth * 0.45, tableWidth * 0.25, tableWidth * 0.3]; // Adjusted proportions
      const rowHeight = 22; // Increased row height
      const headerHeight = 22; // Increased header height

      // Table headers
      const headers = ['Text & Font', 'Text Color', 'Format & Align'];
      headers.forEach((header, colIdx) => {
        const colX = tableX + colWidths.slice(0, colIdx).reduce((sum, width) => sum + width, 0);
        page.drawRectangle({
          x: colX,
          y: tableY - headerHeight,
          width: colWidths[colIdx],
          height: headerHeight,
          color: rgb(0.9, 0.9, 0.9),
          borderColor: rgb(0, 0, 0),
          borderWidth: 0.5,
        });
        page.drawText(header, {
          x: colX + 2,
          y: tableY - headerHeight + 6,
          size: 10,
          font: fontBold,
          color: rgb(0, 0, 0),
        });
      });

      // Table rows
      badge.lines.forEach((line, rowIdx) => {
        const rowY = tableY - headerHeight - (rowIdx + 1) * rowHeight;
        const rowColor = rowIdx % 2 === 0 ? rgb(1, 1, 1) : rgb(0.95, 0.95, 0.95);
        
        // Row background
        page.drawRectangle({
          x: tableX,
          y: rowY,
          width: tableWidth,
          height: rowHeight,
          color: rowColor,
          borderColor: rgb(0, 0, 0),
          borderWidth: 0.5,
        });

        // Column 1: Text & Font
        const col1X = tableX;
        const fontSize = pxToPtRounded(line.size || 12);
        const fontName = line.fontFamily || 'Roboto';
        
        // Clean up the text for table display
        const cleanText = (line.text || '').replace(/^"|"$/g, '').trim();
        const displayText = cleanText || '(empty)';
        
        page.drawText(`${displayText}, ${fontSize}pt`, {
          x: col1X + 2,
          y: rowY + 12,
          size: 9,
          font,
          color: rgb(0, 0, 0),
        });
        page.drawText(`${fontName} (rendered as Helvetica)`, {
          x: col1X + 2,
          y: rowY + 3,
          size: 8,
          font,
          color: rgb(0, 0, 0),
        });

        // Column 2: Text Color
        const col2X = tableX + colWidths[0];
        const textColor = cssColorToRgb(line.color);
        const textColorHex = cssColorToHex(line.color);
        const textColorInfo = getColorInfo(textColorHex) || { name: 'Custom', hex: textColorHex };
        
        // Color swatch
        page.drawRectangle({
          x: col2X + 2,
          y: rowY + 8,
          width: 10,
          height: 8,
          color: rgb(textColor[0], textColor[1], textColor[2]),
          borderColor: rgb(0, 0, 0),
          borderWidth: 0.5,
        });
        
        page.drawText(textColorInfo.name, {
          x: col2X + 15,
          y: rowY + 12,
          size: 8,
          font,
          color: rgb(0, 0, 0),
        });
        page.drawText(textColorInfo.hex.toUpperCase(), {
          x: col2X + 15,
          y: rowY + 3,
          size: 7,
          font,
          color: rgb(0, 0, 0),
        });

        // Column 3: Format & Align
        const col3X = tableX + colWidths[0] + colWidths[1];
        const format: string[] = [];
        if (line.bold) format.push('Bold');
        if (line.italic) format.push('Italic');
        if (line.underline) format.push('Underline');
        const formatText = format.length ? format.join(', ') : 'None';
        const alignText = (line.alignment || 'center').replace(/^\w/, c => c.toUpperCase());
        const combinedText = `${formatText} ${alignText}`;
        
        page.drawText(combinedText, {
          x: col3X + 2,
          y: rowY + 8,
          size: 8,
          font,
          color: rgb(0, 0, 0),
        });
      });

      // Move to next section
      const sectionHeight = Math.max(badgeHeight + 40, (badge.lines.length + 1) * rowHeight + headerHeight) + 50;
      y -= sectionHeight;
      
      console.log(`Badge ${idx + 1} completed, new Y:`, y);
    }

    // Save & download
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'badge-design.pdf';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(url), 100);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Error generating PDF. Please try again.');
  }
};

export const handleDownloadPDF = (): void => {
  console.warn('handleDownloadPDF is deprecated. Use generatePDF with badge data instead.');
};