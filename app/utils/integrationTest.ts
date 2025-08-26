import { fitTextIntoBox } from './layoutEngine';
import { fontManager } from './fontManager';
import { previewRenderer } from './renderers/preview';
import { Badge } from '../types/badge';

/**
 * Integration test to verify the new layout system works end-to-end
 */
export async function runIntegrationTest(): Promise<void> {
  console.log('🚀 Starting Integration Test...');

  try {
    // Initialize font manager
    await fontManager.initialize();
    console.log('✅ Font manager initialized');

    // Test badge data
    const testBadge: Badge = {
      lines: [
        {
          text: 'Integration Test',
          size: 18,
          color: '#000000',
          bold: true,
          italic: false,
          underline: false,
          fontFamily: 'Roboto',
          alignment: 'center'
        },
        {
          text: 'Layout Engine + Font Manager + Preview Renderer',
          size: 12,
          color: '#333333',
          bold: false,
          italic: false,
          underline: false,
          fontFamily: 'Open Sans',
          alignment: 'center'
        }
      ],
      backgroundColor: '#E8F4FD',
      backing: 'pin'
    };

    // Step 1: Generate layout
    console.log('📐 Step 1: Generating layout...');
    const layout = fitTextIntoBox(testBadge);
    console.log('✅ Layout generated:', {
      hash: layout.layoutHash,
      totalHeight: layout.totalHeight,
      lines: layout.lines.length
    });

    // Step 2: Validate layout
    console.log('🔍 Step 2: Validating layout...');
    const validation = validateLayout(layout);
    if (!validation.valid) {
      throw new Error(`Layout validation failed: ${validation.errors.join(', ')}`);
    }
    console.log('✅ Layout validation passed');

    // Step 3: Load fonts
    console.log('🔤 Step 3: Loading fonts...');
    const fontPromises = testBadge.lines.map(line => 
      fontManager.loadFontForCanvas(line.fontFamily || 'Roboto', line.bold ? 'bold' : 'normal', line.italic ? 'italic' : 'normal')
    );
    const fontResults = await Promise.all(fontPromises);
    const failedFonts = fontResults.filter(result => !result.loaded);
    if (failedFonts.length > 0) {
      console.warn('⚠️ Some fonts failed to load:', failedFonts.map(f => f.error));
    } else {
      console.log('✅ All fonts loaded successfully');
    }

    // Step 4: Generate preview image
    console.log('🎨 Step 4: Generating preview image...');
    const previewImage = await previewRenderer.render(layout, testBadge);
    console.log('✅ Preview image generated:', {
      length: previewImage.length,
      format: previewImage.substring(0, 30) + '...'
    });

    // Step 5: Generate thumbnail
    console.log('🖼️ Step 5: Generating thumbnail...');
    const thumbnail = await previewRenderer.renderThumbnail(layout, testBadge, 100, 50);
    console.log('✅ Thumbnail generated:', {
      length: thumbnail.length,
      format: thumbnail.substring(0, 30) + '...'
    });

    console.log('🎉 Integration test completed successfully!');
    console.log('📊 Summary:', {
      layoutHash: layout.layoutHash,
      fontsLoaded: fontResults.filter(f => f.loaded).length,
      previewGenerated: !!previewImage,
      thumbnailGenerated: !!thumbnail
    });

  } catch (error) {
    console.error('❌ Integration test failed:', error);
    throw error;
  }
}

/**
 * Validate layout (simplified version)
 */
function validateLayout(layout: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!layout || !layout.lines) {
    errors.push('Missing layout or lines');
  }
  
  if (layout.totalHeight > layout.badgeHeight) {
    errors.push('Text height exceeds badge height');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Test different badge configurations
 */
export async function testBadgeConfigurations(): Promise<void> {
  console.log('🧪 Testing Badge Configurations...');

  const configurations = [
    {
      name: 'Simple Two Lines',
      badge: {
        lines: [
          { text: 'Name', size: 18, color: '#000000', bold: true, italic: false, underline: false, fontFamily: 'Roboto', alignment: 'center' },
          { text: 'Title', size: 13, color: '#333333', bold: false, italic: false, underline: false, fontFamily: 'Roboto', alignment: 'center' }
        ],
        backgroundColor: '#FFFFFF',
        backing: 'pin'
      } as Badge
    },
    {
      name: 'Long Text',
      badge: {
        lines: [
          { text: 'This is a very long text that should be automatically scaled down', size: 20, color: '#000000', bold: false, italic: false, underline: false, fontFamily: 'Open Sans', alignment: 'center' }
        ],
        backgroundColor: '#FFE4E1',
        backing: 'pin'
      } as Badge
    },
    {
      name: 'Different Alignments',
      badge: {
        lines: [
          { text: 'Left', size: 16, color: '#000000', bold: false, italic: false, underline: false, fontFamily: 'Lato', alignment: 'left' },
          { text: 'Center', size: 16, color: '#000000', bold: false, italic: false, underline: false, fontFamily: 'Lato', alignment: 'center' },
          { text: 'Right', size: 16, color: '#000000', bold: false, italic: false, underline: false, fontFamily: 'Lato', alignment: 'right' }
        ],
        backgroundColor: '#F0F8FF',
        backing: 'pin'
      } as Badge
    },
    {
      name: 'Mixed Fonts',
      badge: {
        lines: [
          { text: 'Roboto Bold', size: 18, color: '#000000', bold: true, italic: false, underline: false, fontFamily: 'Roboto', alignment: 'center' },
          { text: 'Open Sans Italic', size: 14, color: '#333333', bold: false, italic: true, underline: false, fontFamily: 'Open Sans', alignment: 'center' },
          { text: 'Montserrat Normal', size: 12, color: '#666666', bold: false, italic: false, underline: false, fontFamily: 'Montserrat', alignment: 'center' }
        ],
        backgroundColor: '#F5F5DC',
        backing: 'pin'
      } as Badge
    }
  ];

  for (const config of configurations) {
    try {
      console.log(`\n📋 Testing: ${config.name}`);
      
      const layout = fitTextIntoBox(config.badge);
      const preview = await previewRenderer.render(layout, config.badge);
      
      console.log(`✅ ${config.name}: Layout hash ${layout.layoutHash}, Preview generated`);
      
    } catch (error) {
      console.error(`❌ ${config.name}: Failed -`, error);
    }
  }

  console.log('\n🏁 Badge configuration tests completed');
}

// Auto-run tests in browser environment
if (typeof window !== 'undefined') {
  setTimeout(async () => {
    try {
      await runIntegrationTest();
      await testBadgeConfigurations();
    } catch (error) {
      console.error('Integration tests failed:', error);
    }
  }, 2000);
}
