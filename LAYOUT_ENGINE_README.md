# Layout Engine Implementation

## Overview

This document describes the new unified layout engine that addresses the major issues in the badge rendering system. The layout engine provides a single source of truth for text measurement, positioning, and layout computation.

## Key Components

### 1. Layout Engine (`app/utils/layoutEngine.ts`)

**Purpose**: Centralized text fitting and layout computation

**Key Features**:
- `computeBadgeLayout()` - Main function that computes complete badge layout
- `fitTextIntoLine()` - Handles text fitting with auto-scaling
- `validateLayout()` - Validates layout constraints
- `convertLayoutUnits()` - Converts between px/pt units

**Output**: `BadgeLayout` object containing:
- Text line positions, sizes, and properties
- Total height and layout hash
- Badge dimensions and background

### 2. Font Manager (`app/utils/fontManager.ts`)

**Purpose**: Consistent font handling across all renderers

**Key Features**:
- Font file mapping for all supported fonts
- Canvas and PDF font loading/embedding
- Font metrics calculation
- Font caching for performance

**Supported Fonts**: Roboto, Open Sans, Lato, Montserrat, Oswald, Source Sans 3, Raleway, PT Sans, Merriweather, Noto Sans, Noto Serif, Georgia

### 3. Preview Renderer (`app/utils/renderers/previewRenderer.ts`)

**Purpose**: Renders badges using the unified layout engine

**Key Features**:
- `renderToCanvas()` - Renders to HTML canvas
- `renderToDataURL()` - Renders to data URL
- `renderToBlob()` - Renders to blob
- `compareRendering()` - Compares new vs legacy rendering

## Testing

### Test Route: `/layout-test`

Visit `http://localhost:3000/layout-test` to see:
- Standard badge rendering
- Long text auto-scaling
- Different alignment tests
- Side-by-side comparison of layout engine vs legacy

### Test Component: `LayoutEngineTest`

Interactive component that shows:
- Layout computation results
- Text positioning details
- Rendering comparison
- Debug information

### In-App Testing

Click the "Test Layout Engine" button in the main BadgeDesigner to:
- Compute layout for current badge
- Display layout hash and total height
- Verify layout engine is working

## Usage Examples

### Basic Layout Computation

```typescript
import { computeBadgeLayout } from '../utils/layoutEngine';

const layout = computeBadgeLayout(badge, {
  forceFontSize: false, // Allow auto-scaling
  padding: 14,
  lineGap: 6
});

console.log('Layout hash:', layout.layoutHash);
console.log('Total height:', layout.totalHeight);
```

### Rendering with Layout Engine

```typescript
import { PreviewRenderer } from '../utils/renderers/previewRenderer';

const canvas = await PreviewRenderer.renderToCanvas(badge, {
  width: 300,
  height: 100,
  useLayoutEngine: true
});
```

### Font Management

```typescript
import { FontManager } from '../utils/fontManager';

// Load font for canvas
await FontManager.loadFontForCanvas('Roboto', true);

// Embed font for PDF
const pdfFont = await FontManager.embedFontForPDF('Roboto', true, pdfDoc);
```

## Benefits

### 1. Consistency
- Same text measurement across all renderers
- Identical line breaks and positioning
- No more font fallback issues

### 2. Performance
- Layout computed once, cached by hash
- Font loading optimized with caching
- Reduced redundant calculations

### 3. Maintainability
- Single source of truth for layout logic
- Clear separation of concerns
- Easy to test and debug

### 4. Extensibility
- Easy to add new renderers (TIFF, etc.)
- Font system can be extended
- Layout options can be customized

## Next Steps

### Phase 2: PDF Renderer
- Update PDF generator to use layout engine
- Implement proper font embedding
- Add unit conversion (px to pt)

### Phase 3: TIFF Renderer
- Create server-side TIFF renderer
- Add DPI conversion
- Implement file storage with hash naming

### Phase 4: Shopify Integration
- Update thumbnail generation
- Implement file storage
- Add cart property handling

## Migration Strategy

1. **Current**: Layout engine is optional, legacy rendering still works
2. **Testing**: Use test route and components to verify functionality
3. **Gradual**: Update renderers one by one
4. **Validation**: Compare outputs to ensure consistency
5. **Production**: Switch to layout engine by default

## Troubleshooting

### Common Issues

1. **Font not found**: Check font mapping in `fontManager.ts`
2. **Layout validation fails**: Check badge dimensions and text length
3. **Rendering differences**: Compare layout engine vs legacy output
4. **Performance issues**: Check font caching and layout hash reuse

### Debug Tools

- Browser console: Layout computation logs
- Test route: Visual comparison
- Layout test component: Detailed layout information
- Font manager: Font loading status

## Architecture

```
Layout Engine
├── layoutEngine.ts (Core computation)
├── fontManager.ts (Font handling)
└── renderers/
    ├── previewRenderer.ts (Canvas rendering)
    ├── pdfRenderer.ts (PDF rendering) - TODO
    └── tiffRenderer.ts (TIFF rendering) - TODO
```

This unified approach ensures that all badge outputs (preview, PDF, TIFF) are generated from the same layout computation, eliminating inconsistencies and improving maintainability.
