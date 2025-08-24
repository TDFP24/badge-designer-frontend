export const FONT_FAMILIES = [
  {
    value: 'Roboto',
    label: 'Roboto',
    category: 'Sans-serif',
    isDefault: true
  },
  {
    value: 'Open Sans',
    label: 'Open Sans',
    category: 'Sans-serif'
  },
  {
    value: 'Lato',
    label: 'Lato',
    category: 'Sans-serif'
  },
  {
    value: 'Montserrat',
    label: 'Montserrat',
    category: 'Sans-serif'
  },
  {
    value: 'Oswald',
    label: 'Oswald',
    category: 'Sans-serif'
  },
  {
    value: 'Source Sans 3',
    label: 'Source Sans 3',
    category: 'Sans-serif'
  },
  {
    value: 'Raleway',
    label: 'Raleway',
    category: 'Sans-serif'
  },
  {
    value: 'PT Sans',
    label: 'PT Sans',
    category: 'Sans-serif'
  },
  {
    value: 'Merriweather',
    label: 'Merriweather',
    category: 'Serif'
  },
  {
    value: 'Noto Sans',
    label: 'Noto Sans',
    category: 'Sans-serif'
  },
  {
    value: 'Noto Serif',
    label: 'Noto Serif',
    category: 'Serif'
  },
  {
    value: 'Georgia',
    label: 'Georgia',
    category: 'Serif'
  }
] as const;

export const FONT_CATEGORIES = [
  'Sans-serif',
  'Serif'
] as const;

export type FontFamily = typeof FONT_FAMILIES[number]['value'];
export type FontCategory = typeof FONT_CATEGORIES[number];

// Define a type for font options that includes the optional isDefault property
type FontOption = {
  value: FontFamily;
  label: string;
  category: FontCategory;
  isDefault?: boolean;
};

export const DEFAULT_FONT = (FONT_FAMILIES as readonly FontOption[]).find(font => font.isDefault)?.value || 'Roboto'; 