export const BACKGROUND_COLORS = [
  // Row 1: Essentials + Primary
  { value: '#000000', name: 'Black', ring: 'ring-gray-600' },
  { value: '#FFFFFF', name: 'White', ring: 'ring-white' },
  { value: '#FF0000', name: 'Red', ring: 'ring-indigo-500' },
  { value: '#00FF00', name: 'Green', ring: 'ring-indigo-500' },
  
  // Row 2: Secondary colors
  { value: '#808080', name: 'Grey', ring: 'ring-gray-500' },
  { value: '#FF7F00', name: 'Orange', ring: 'ring-indigo-500' },
  { value: '#FFFF00', name: 'Yellow', ring: 'ring-indigo-500' },
  { value: '#00FFFF', name: 'Cyan', ring: 'ring-indigo-500' },
  
  // Row 3: Cool colors
  { value: '#0000FF', name: 'Blue', ring: 'ring-indigo-500' },
  { value: '#4B0082', name: 'Indigo', ring: 'ring-indigo-500' },
  { value: '#8B00FF', name: 'Violet', ring: 'ring-indigo-500' },
  { value: '#FF00FF', name: 'Magenta', ring: 'ring-indigo-500' },
] as const;

export const EXTENDED_BACKGROUND_COLORS = [
  // Darker hues
  { value: '#7f1d1d', name: 'Red 800', ring: 'ring-indigo-500' },
  { value: '#581c87', name: 'Purple 800', ring: 'ring-indigo-500' },
  { value: '#3730a3', name: 'Indigo 800', ring: 'ring-indigo-500' },
  { value: '#1d4ed8', name: 'Blue 700', ring: 'ring-indigo-500' },
  { value: '#155e75', name: 'Cyan 700', ring: 'ring-indigo-500' },
  { value: '#14532d', name: 'Green 800', ring: 'ring-indigo-500' },
  { value: '#365314', name: 'Lime 800', ring: 'ring-indigo-500' },
  { value: '#7c2d12', name: 'Orange 800', ring: 'ring-indigo-500' },
  { value: '#374151', name: 'Gray 700', ring: 'ring-indigo-500' },

  // Mid-dark / strong
  { value: '#b91c1c', name: 'Red 600', ring: 'ring-indigo-500' },
  { value: '#7e22ce', name: 'Purple 600', ring: 'ring-indigo-500' },
  { value: '#4f46e5', name: 'Indigo 600', ring: 'ring-indigo-500' },
  { value: '#2563eb', name: 'Blue 600', ring: 'ring-indigo-500' },
  { value: '#0ea5e9', name: 'Sky 500', ring: 'ring-indigo-500' },
  { value: '#15803d', name: 'Green 700', ring: 'ring-indigo-500' },
  { value: '#65a30d', name: 'Lime 600', ring: 'ring-indigo-500' },
  { value: '#c2410c', name: 'Orange 700', ring: 'ring-indigo-500' },
  { value: '#6b7280', name: 'Gray 500', ring: 'ring-indigo-500' },

  // Base (medium)
  { value: '#ef4444', name: 'Red 500', ring: 'ring-indigo-500' },
  { value: '#a855f7', name: 'Purple 500', ring: 'ring-indigo-500' },
  { value: '#6366f1', name: 'Indigo 500', ring: 'ring-indigo-500' },
  { value: '#3b82f6', name: 'Blue 500', ring: 'ring-indigo-500' },
  { value: '#22d3ee', name: 'Cyan 400', ring: 'ring-indigo-500' },
  { value: '#22c55e', name: 'Green 500', ring: 'ring-indigo-500' },
  { value: '#a3e635', name: 'Lime 400', ring: 'ring-indigo-500' },
  { value: '#f97316', name: 'Orange 500', ring: 'ring-indigo-500' },
  { value: '#9ca3af', name: 'Gray 400', ring: 'ring-indigo-500' },

  // Lighter
  { value: '#f87171', name: 'Red 400', ring: 'ring-indigo-500' },
  { value: '#c084fc', name: 'Purple 400', ring: 'ring-indigo-500' },
  { value: '#818cf8', name: 'Indigo 400', ring: 'ring-indigo-500' },
  { value: '#60a5fa', name: 'Blue 400', ring: 'ring-indigo-500' },
  { value: '#67e8f9', name: 'Cyan 300', ring: 'ring-indigo-500' },
  { value: '#86efac', name: 'Green 300', ring: 'ring-indigo-500' },
  { value: '#facc15', name: 'Yellow 400', ring: 'ring-indigo-500' },
  { value: '#fdba74', name: 'Orange 300', ring: 'ring-indigo-500' },
  { value: '#d1d5db', name: 'Gray 300', ring: 'ring-indigo-500' },
] as const;

export const FONT_COLORS = [
  { value: '#000000', name: 'Black', ring: 'ring-gray-900' },
  { value: '#FFFFFF', name: 'White', ring: 'ring-white' },
  { value: '#ea0c0c', name: 'Red', ring: 'ring-red-500' },
  { value: '#0c5cea', name: 'Blue', ring: 'ring-blue-500' },
  { value: '#C0C0C0', name: 'Silver', ring: 'ring-gray-300' },
  { value: '#eac10c', name: 'Gold', ring: 'ring-yellow-400' },
  { value: '#6E260E', name: 'Brown', ring: 'ring-brown-700' },
  { value: '#F0E68C', name: 'Ivory', ring: 'ring-yellow-200' },
] as const;

// Comprehensive color mapping for PDF generation and display
export const ALL_COLORS = [
  ...BACKGROUND_COLORS,
  ...EXTENDED_BACKGROUND_COLORS,
  ...FONT_COLORS,
  // Additional colors that were missing
  { value: '#FF0000', name: 'Red', ring: 'ring-red-500' },
  { value: '#00FF00', name: 'Green', ring: 'ring-green-500' },
  { value: '#0000FF', name: 'Blue', ring: 'ring-blue-500' },
  { value: '#FFFF00', name: 'Yellow', ring: 'ring-yellow-500' },
  { value: '#FF00FF', name: 'Magenta', ring: 'ring-pink-500' },
  { value: '#00FFFF', name: 'Cyan', ring: 'ring-cyan-500' },
  { value: '#FF7F00', name: 'Orange', ring: 'ring-orange-500' },
  { value: '#808080', name: 'Grey', ring: 'ring-gray-500' },
  { value: '#4B0082', name: 'Indigo', ring: 'ring-indigo-500' },
  { value: '#8B00FF', name: 'Violet', ring: 'ring-purple-500' },
] as const;

// Helper function to get color name from hex value
export function getColorName(hexValue: string): string {
  const normalizedHex = hexValue.toUpperCase();
  const color = ALL_COLORS.find(c => c.value.toUpperCase() === normalizedHex);
  return color ? color.name : 'Custom';
}

// Helper function to get color info (name + hex) for display
export function getColorInfo(hexValue: string): { name: string; hex: string } {
  const normalizedHex = hexValue.toUpperCase();
  const color = ALL_COLORS.find(c => c.value.toUpperCase() === normalizedHex);
  return {
    name: color ? color.name : 'Custom',
    hex: normalizedHex
  };
} 