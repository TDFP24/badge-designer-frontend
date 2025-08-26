import React from 'react';
import { LayoutEngineTest } from '../components/LayoutEngineTest';
import { BADGE_CONSTANTS } from '../constants/badge';
import { Badge, BadgeLine } from '../types/badge';

export default function LayoutTestRoute() {
  // Create a test badge with various scenarios
  const testBadge: Badge = {
    lines: [
      {
        text: 'John Smith',
        size: 18,
        color: '#000000',
        bold: true,
        italic: false,
        underline: false,
        fontFamily: 'Roboto',
        alignment: 'center'
      } as BadgeLine,
      {
        text: 'Software Engineer',
        size: 14,
        color: '#333333',
        bold: false,
        italic: false,
        underline: false,
        fontFamily: 'Open Sans',
        alignment: 'center'
      } as BadgeLine,
      {
        text: 'Tech Company Inc.',
        size: 12,
        color: '#666666',
        bold: false,
        italic: true,
        underline: false,
        fontFamily: 'Lato',
        alignment: 'center'
      } as BadgeLine
    ],
    backgroundColor: '#FFFFFF',
    backing: 'pin'
  };

  // Create a badge with long text to test auto-scaling
  const longTextBadge: Badge = {
    lines: [
      {
        text: 'This is a very long name that should auto-scale down',
        size: 20,
        color: '#000000',
        bold: true,
        italic: false,
        underline: false,
        fontFamily: 'Montserrat',
        alignment: 'center'
      } as BadgeLine,
      {
        text: 'And this is an even longer title that will definitely need scaling',
        size: 16,
        color: '#333333',
        bold: false,
        italic: false,
        underline: false,
        fontFamily: 'Oswald',
        alignment: 'center'
      } as BadgeLine
    ],
    backgroundColor: '#F0F8FF',
    backing: 'magnetic'
  };

  // Create a badge with different alignments
  const alignmentBadge: Badge = {
    lines: [
      {
        text: 'Left Aligned',
        size: 16,
        color: '#000000',
        bold: false,
        italic: false,
        underline: false,
        fontFamily: 'Source Sans 3',
        alignment: 'left'
      } as BadgeLine,
      {
        text: 'Center Aligned',
        size: 16,
        color: '#000000',
        bold: false,
        italic: false,
        underline: false,
        fontFamily: 'Source Sans 3',
        alignment: 'center'
      } as BadgeLine,
      {
        text: 'Right Aligned',
        size: 16,
        color: '#000000',
        bold: false,
        italic: false,
        underline: false,
        fontFamily: 'Source Sans 3',
        alignment: 'right'
      } as BadgeLine
    ],
    backgroundColor: '#FFF5EE',
    backing: 'adhesive'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Layout Engine Test Suite
        </h1>
        
        <div className="mb-8 text-center">
          <p className="text-lg text-gray-600">
            Testing the new unified layout engine against the legacy rendering system
          </p>
        </div>

        {/* Test Case 1: Standard Badge */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-center">
            Test Case 1: Standard Badge
          </h2>
          <LayoutEngineTest badge={testBadge} />
        </div>

        {/* Test Case 2: Long Text Auto-scaling */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-center">
            Test Case 2: Long Text Auto-scaling
          </h2>
          <LayoutEngineTest badge={longTextBadge} />
        </div>

        {/* Test Case 3: Different Alignments */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-center">
            Test Case 3: Different Alignments
          </h2>
          <LayoutEngineTest badge={alignmentBadge} />
        </div>

        {/* Technical Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Technical Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-semibold mb-2">Layout Engine Features</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Unified text measurement and positioning</li>
                <li>Automatic font size scaling</li>
                <li>Consistent font handling across renderers</li>
                <li>Deterministic layout computation</li>
                <li>Layout validation and error reporting</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Badge Constants</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Width: {BADGE_CONSTANTS.BADGE_WIDTH}px</li>
                <li>Height: {BADGE_CONSTANTS.BADGE_HEIGHT}px</li>
                <li>Min Font Size: {BADGE_CONSTANTS.MIN_FONT_SIZE}px</li>
                <li>Max Font Size: {BADGE_CONSTANTS.MAX_FONT_SIZE}px</li>
                <li>Line Height Multiplier: {BADGE_CONSTANTS.LINE_HEIGHT_MULTIPLIER}</li>
                <li>Max Lines: {BADGE_CONSTANTS.MAX_LINES}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
