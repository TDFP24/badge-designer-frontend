import { fitTextIntoBox, validateLayout } from './layoutEngine';
import { Badge } from '../types/badge';

/**
 * Simple test function to verify layout engine functionality
 */
export function testLayoutEngine(): void {
  console.log('🧪 Testing Layout Engine...');

  // Test badge with simple text
  const testBadge: Badge = {
    lines: [
      {
        text: 'John Doe',
        size: 18,
        color: '#000000',
        bold: false,
        italic: false,
        underline: false,
        fontFamily: 'Roboto',
        alignment: 'center'
      },
      {
        text: 'Software Engineer',
        size: 13,
        color: '#333333',
        bold: false,
        italic: false,
        underline: false,
        fontFamily: 'Roboto',
        alignment: 'center'
      }
    ],
    backgroundColor: '#FFFFFF',
    backing: 'pin'
  };

  try {
    // Generate layout
    const layout = fitTextIntoBox(testBadge);
    
    console.log('✅ Layout generated successfully');
    console.log('Layout hash:', layout.layoutHash);
    console.log('Total height:', layout.totalHeight);
    console.log('Number of lines:', layout.lines.length);
    
    // Validate layout
    const validation = validateLayout(layout);
    console.log('Layout valid:', validation.valid);
    if (!validation.valid) {
      console.log('Validation errors:', validation.errors);
    }

    // Log line details
    layout.lines.forEach((line, index) => {
      console.log(`Line ${index + 1}:`, {
        text: line.text,
        fontSize: line.fontSize,
        x: line.x,
        y: line.y,
        width: line.width,
        height: line.height
      });
    });

  } catch (error) {
    console.error('❌ Layout engine test failed:', error);
  }

  // Test with long text that should be truncated
  const longTextBadge: Badge = {
    lines: [
      {
        text: 'This is a very long text that should be truncated or scaled down to fit within the badge dimensions',
        size: 20,
        color: '#000000',
        bold: true,
        italic: false,
        underline: false,
        fontFamily: 'Roboto',
        alignment: 'center'
      }
    ],
    backgroundColor: '#FFE4E1',
    backing: 'pin'
  };

  try {
    const longTextLayout = fitTextIntoBox(longTextBadge);
    console.log('✅ Long text layout generated');
    console.log('Long text layout hash:', longTextLayout.layoutHash);
    console.log('Long text final size:', longTextLayout.lines[0].fontSize);
    console.log('Long text width:', longTextLayout.lines[0].width);
  } catch (error) {
    console.error('❌ Long text layout test failed:', error);
  }

  console.log('🏁 Layout Engine test completed');
}

/**
 * Test layout engine with different font families
 */
export function testFontFamilies(): void {
  console.log('🔤 Testing Font Families...');

  const fontFamilies = ['Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Oswald'];
  
  fontFamilies.forEach(fontFamily => {
    const testBadge: Badge = {
      lines: [
        {
          text: `Test ${fontFamily}`,
          size: 16,
          color: '#000000',
          bold: false,
          italic: false,
          underline: false,
          fontFamily,
          alignment: 'center'
        }
      ],
      backgroundColor: '#FFFFFF',
      backing: 'pin'
    };

    try {
      const layout = fitTextIntoBox(testBadge);
      console.log(`✅ ${fontFamily}: Layout generated, hash: ${layout.layoutHash}`);
    } catch (error) {
      console.error(`❌ ${fontFamily}: Failed -`, error);
    }
  });
}

/**
 * Test layout engine with different alignments
 */
export function testAlignments(): void {
  console.log('📐 Testing Alignments...');

  const alignments = ['left', 'center', 'right'] as const;
  
  alignments.forEach(alignment => {
    const testBadge: Badge = {
      lines: [
        {
          text: `Aligned ${alignment}`,
          size: 16,
          color: '#000000',
          bold: false,
          italic: false,
          underline: false,
          fontFamily: 'Roboto',
          alignment
        }
      ],
      backgroundColor: '#FFFFFF',
      backing: 'pin'
    };

    try {
      const layout = fitTextIntoBox(testBadge);
      const line = layout.lines[0];
      console.log(`✅ ${alignment}: x=${line.x}, width=${line.width}`);
    } catch (error) {
      console.error(`❌ ${alignment}: Failed -`, error);
    }
  });
}

// Run tests if this file is executed directly
if (typeof window !== 'undefined') {
  // Only run in browser environment
  setTimeout(() => {
    testLayoutEngine();
    testFontFamilies();
    testAlignments();
  }, 1000);
}
