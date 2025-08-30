import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Badge } from '../types/badge';
import { getColorInfo } from '../constants/colors';
import { generateFullBadgeImage } from './badgeThumbnail';

// Helper function to convert CSS color to hex
function cssColorToHex(cssColor: string): string {
  // Create a temporary element to use the browser's color parsing
  const temp = document.createElement('div');
  temp.style.color = cssColor;
  document.body.appendChild(temp);
  const computedColor = window.getComputedStyle(temp).color;
  document.body.removeChild(temp);
  
  // Convert RGB to hex
  const rgbMatch = computedColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]).toString(16).padStart(2, '0');
    const g = parseInt(rgbMatch[2]).toString(16).padStart(2, '0');
    const b = parseInt(rgbMatch[3]).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`.toUpperCase();
  }
  
  return cssColor.startsWith('#') ? cssColor.toUpperCase() : '#000000';
}

// Helper function to convert pixels to points (1 point = 1/72 inch)
function pxToPt(px: number): number {
  return px * 0.75; // Approximate conversion
}

/* ---------- NEW SIMPLE PDF GENERATOR ---------- */

export const generatePDFNew = async (badgeData: Badge, multipleBadges?: Badge[]): Promise<void> => {
  console.log('NEW SIMPLE PDF GENERATOR');
  try {
    // Create new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Dynamic layout based on actual badge dimensions
    const margin = 30;
    const tableX = margin + 350; // Reserve space for badge (will be adjusted dynamically)
    const tableWidth = 595.28 - tableX - margin;
    
    let y = 800; // Start from top

    const allBadges = [badgeData, ...(multipleBadges || [])];

    for (let idx = 0; idx < allBadges.length; idx++) {
      const badge = allBadges[idx];
      console.log(`Processing Badge ${idx + 1}`);

      // Generate high-resolution image
      console.log('Generating badge image...');
      const imageDataUrl = await generateFullBadgeImage(badge);
      console.log('Image generated successfully');

      // Convert to Uint8Array and embed
      const base64Data = imageDataUrl.split(',')[1];
      const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      const pdfImage = await pdfDoc.embedPng(imageBytes);
      console.log('Image embedded in PDF');
      console.log('PDF image dimensions:', { width: pdfImage.width, height: pdfImage.height });

      // Calculate display dimensions that maintain the exact aspect ratio from the captured image
      // This ensures the badge appears with the correct proportions (wider than tall)
      const maxDisplayWidth = 300; // Maximum width we want to reserve
      const maxDisplayHeight = 120; // Maximum height we want to reserve
      
      // Calculate the scale factor to fit within our bounds while maintaining aspect ratio
      const scaleX = maxDisplayWidth / pdfImage.width;
      const scaleY = maxDisplayHeight / pdfImage.height;
      const scale = Math.min(scaleX, scaleY);
      
      // Apply the scale to maintain exact aspect ratio
      const displayWidth = pdfImage.width * scale;
      const displayHeight = pdfImage.height * scale;
      
      console.log('Aspect ratio calculation:', {
        originalWidth: pdfImage.width,
        originalHeight: pdfImage.height,
        originalAspectRatio: pdfImage.width / pdfImage.height,
        scale,
        displayWidth,
        displayHeight,
        displayAspectRatio: displayWidth / displayHeight
      });

      console.log('Display dimensions with maintained aspect ratio:', { displayWidth, displayHeight, originalWidth: pdfImage.width, originalHeight: pdfImage.height });

      // Draw image at the target display size (maintains aspect ratio and quality)
      page.drawImage(pdfImage, {
        x: margin,
        y: y - displayHeight,
        width: displayWidth,
        height: displayHeight,
      });
      console.log('Image drawn at target size:', { x: margin, y: y - displayHeight, width: displayWidth, height: displayHeight });

      // Use fixed table position for consistent layout
      const actualTableX = margin + displayWidth + 20;
      const actualTableWidth = 595.28 - actualTableX - margin;

      // Draw badge title (smaller, left-justified)
      page.drawText(`Badge ${idx + 1}`, {
        x: margin,
        y: y + 10,
        size: 12,
        font: fontBold,
        color: rgb(0, 0, 0),
      });

      // Draw background color under the image
      const hex = cssColorToHex(badge.backgroundColor);
      const colorInfo = getColorInfo(hex) || { name: 'Custom', hex };
      page.drawText(`Background: ${colorInfo.name} (${hex})`, {
        x: margin,
        y: y - displayHeight - 10,
        size: 9,
        font,
        color: rgb(0, 0, 0),
      });

      // Draw specification table (no headers) - level with image
      let tableY = y;  // Start at same Y as image
      const rowHeight = 16;  // Smaller rows

      // Table rows
      let rowIdx = 0;

      // Text lines
      badge.lines.forEach((line, lineIdx) => {
        const cleanText = (line.text || '').replace(/^"|"$/g, '').trim();
        const fontSize = line.size || 12;
        const fontName = line.fontFamily || 'Roboto';
        const textColor = cssColorToHex(line.color);
        const style = [];
        if (line.bold) style.push('Bold');
        if (line.italic) style.push('Italic');
        if (line.underline) style.push('Underline');
        const styleText = style.length ? style.join(', ') : 'Normal';
        const alignText = (line.alignment || 'center').replace(/^\w/, c => c.toUpperCase());

        const rowY = tableY - (rowIdx + 1) * rowHeight;
        page.drawRectangle({
          x: actualTableX,
          y: rowY,
          width: actualTableWidth,
          height: rowHeight,
          color: rowIdx % 2 === 0 ? rgb(1, 1, 1) : rgb(0.95, 0.95, 0.95),
          borderColor: rgb(0, 0, 0),
          borderWidth: 0.5,
        });

        page.drawText(`Line ${lineIdx + 1}: "${cleanText}"`, {
          x: actualTableX + 5,
          y: rowY + 4,
          size: 8,
          font,
          color: rgb(0, 0, 0),
        });
        rowIdx++;

        // Font details
        const fontRowY = tableY - (rowIdx + 1) * rowHeight;
        page.drawRectangle({
          x: actualTableX,
          y: fontRowY,
          width: actualTableWidth,
          height: rowHeight,
          color: rowIdx % 2 === 0 ? rgb(1, 1, 1) : rgb(0.95, 0.95, 0.95),
          borderColor: rgb(0, 0, 0),
          borderWidth: 0.5,
        });
        page.drawText(`Font: ${fontName} ${fontSize}pt (${styleText})`, {
          x: actualTableX + 5,
          y: fontRowY + 4,
          size: 8,
          font,
          color: rgb(0, 0, 0),
        });
        rowIdx++;

        // Color details
        const colorRowY = tableY - (rowIdx + 1) * rowHeight;
        page.drawRectangle({
          x: actualTableX,
          y: colorRowY,
          width: actualTableWidth,
          height: rowHeight,
          color: rowIdx % 2 === 0 ? rgb(1, 1, 1) : rgb(0.95, 0.95, 0.95),
          borderColor: rgb(0, 0, 0),
          borderWidth: 0.5,
        });
        page.drawText(`Color: ${textColor}`, {
          x: actualTableX + 5,
          y: colorRowY + 4,
          size: 8,
          font,
          color: rgb(0, 0, 0),
        });
        rowIdx++;

        // Alignment details
        const alignRowY = tableY - (rowIdx + 1) * rowHeight;
        page.drawRectangle({
          x: actualTableX,
          y: alignRowY,
          width: actualTableWidth,
          height: rowHeight,
          color: rowIdx % 2 === 0 ? rgb(1, 1, 1) : rgb(0.95, 0.95, 0.95),
          borderColor: rgb(0, 0, 0),
          borderWidth: 0.5,
        });
        page.drawText(`Alignment: ${alignText}`, {
          x: actualTableX + 5,
          y: alignRowY + 4,
          size: 8,
          font,
          color: rgb(0, 0, 0),
        });
        rowIdx++;
      });

      // Move to next badge
      const totalRows = badge.lines.length * 4; // 4 rows per text line
      const tableHeight = totalRows * rowHeight;
      const sectionHeight = Math.max(displayHeight + 20, tableHeight + 20);
      y -= sectionHeight;
      
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

// Export the main function as the default
export const generatePDF = generatePDFNew;