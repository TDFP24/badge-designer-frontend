import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/solid';
import { 
  ArrowPathIcon as ArrowPathIconOutline,
  Bars3Icon,
  Bars3BottomLeftIcon,
  Bars3BottomRightIcon,
  DocumentTextIcon,
  DocumentDuplicateIcon,
  DocumentIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowsRightLeftIcon,
  XMarkIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { generatePDF } from '../utils/pdfGenerator';
import { BadgeTextLinesHeader } from './BadgeTextLinesHeader';
import { BadgeEditPanel } from './BadgeEditPanel';
import { BadgeLine, Badge, BadgeImage } from '../types/badge';
import { BACKGROUND_COLORS, FONT_COLORS, EXTENDED_BACKGROUND_COLORS } from '../constants/colors';
import { BADGE_CONSTANTS } from '../constants/badge';
import { generateFullBadgeImage, generateThumbnailFromFullImage } from '../utils/badgeThumbnail';
import { getCurrentShop, saveBadgeDesign, ShopAuthData } from '../utils/shopAuth';
import { createApi } from '../utils/api';
import { ImagePositioning } from './ImagePositioning';
import { BadgePreview } from './BadgePreview';

interface BadgeDesignerProps {
  productId?: string | null;
  shop?: string | null;
  gadgetApiUrl?: string;
  gadgetApiKey?: string;
}

interface BadgeEditorPanelProps {
  badge: Badge;
  onLineChange: (index: number, changes: Partial<BadgeLine>) => void;
  onAlignmentChange: (index: number, alignment: string) => void;
  onBackgroundColorChange: (color: string) => void;
  onRemoveLine: (index: number) => void;
  showRemove: boolean;
  maxLines: number;
  addLineButton: React.ReactNode;
  resetButton: React.ReactNode;
  multiBadgeButton: React.ReactNode;
  editable?: boolean;
}

const backgroundColors = BACKGROUND_COLORS;
const fontColors = FONT_COLORS;
const maxLines = BADGE_CONSTANTS.MAX_LINES;
const badgeWidth = BADGE_CONSTANTS.BADGE_WIDTH;
const badgeHeight = BADGE_CONSTANTS.BADGE_HEIGHT;
const MIN_FONT_SIZE = BADGE_CONSTANTS.MIN_FONT_SIZE;

const BadgeDesigner: React.FC<BadgeDesignerProps> = ({ productId: _productId, shop: _shop, gadgetApiUrl, gadgetApiKey }) => {
  // Create API instance with environment variables
  const api = createApi(gadgetApiUrl, gadgetApiKey);

  
  const LINE_HEIGHT_MULTIPLIER = 1.3;
  const [badge, setBadge] = useState<Badge>({
    lines: [
      { text: 'Your Name', size: 18, color: '#000000', bold: false, italic: false, underline: false, fontFamily: 'Roboto', alignment: 'center' } as BadgeLine,
      { text: 'Title', size: 13, color: '#000000', bold: false, italic: false, underline: false, fontFamily: 'Roboto', alignment: 'center' } as BadgeLine,
    ],
    backgroundColor: '#FFFFFF',
    backing: 'pin',
    backgroundImage: undefined,
    logo: undefined,
  });
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [csvPreview, setCsvPreview] = useState<string[][]>([]);
  const [csvError, setCsvError] = useState('');
  const [multipleBadges, setMultipleBadges] = useState<any[]>([]);
  const [editModalIndex, setEditModalIndex] = useState<number | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showExtendedBgPicker, setShowExtendedBgPicker] = useState(false);
  const [showPositioning, setShowPositioning] = useState(false);
  const [positioningImage, setPositioningImage] = useState<string>('');
  const [positioningType, setPositioningType] = useState<'background' | 'logo'>('background');
  const [fileInputKey, setFileInputKey] = useState(0); // Key to reset file inputs

  // Debug logging
  useEffect(() => {
    // Component rendered
  });


  // Helper to estimate text width for a given font size and string
  const measureTextWidth = (text: string, fontSize: number, fontFamily: string, bold: boolean, italic: boolean) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return 0;
    context.font = `${bold ? 'bold ' : ''}${italic ? 'italic ' : ''}${fontSize}px ${fontFamily}`;
    return context.measureText(text).width;
  };

  // Update getMaxCharsFor8pt to use MIN_FONT_SIZE
  const getMaxCharsForMinFont = (fontFamily: string, bold: boolean, italic: boolean) => {
    let fontSize = MIN_FONT_SIZE;
    let testStr = '';
    let width = 0;
    while (true) {
      testStr += 'W';
      width = measureTextWidth(testStr, fontSize, fontFamily, bold, italic);
      if (width > badgeWidth - 24) break;
    }
    // Fallback minimum value (e.g., 8)
    return Math.max(testStr.length - 1, 8);
  };



  // Helper function to get proper font family with fallbacks
  const getFontFamily = (fontFamily: string) => {
    let result;
    switch (fontFamily) {
      case 'Roboto':
        result = 'Roboto, Arial, sans-serif';
        break;
      case 'Open Sans':
        result = '"Open Sans", Arial, sans-serif';
        break;
      case 'Lato':
        result = 'Lato, Arial, sans-serif';
        break;
      case 'Montserrat':
        result = 'Montserrat, Arial, sans-serif';
        break;
      case 'Oswald':
        result = 'Oswald, Arial, sans-serif';
        break;
      case 'Source Sans 3':
        result = '"Source Sans 3", Arial, sans-serif';
        break;
      case 'Raleway':
        result = 'Raleway, Arial, sans-serif';
        break;
      case 'PT Sans':
        result = '"PT Sans", Arial, sans-serif';
        break;
      case 'Merriweather':
        result = 'Merriweather, Georgia, serif';
        break;
      case 'Noto Sans':
        result = '"Noto Sans", Arial, sans-serif';
        break;
      case 'Noto Serif':
        result = '"Noto Serif", Georgia, serif';
        break;
      case 'Georgia':
        result = 'Georgia, serif';
        break;
      default:
        result = 'Roboto, Arial, sans-serif';
    }
    console.log(`Font family for ${fontFamily}: ${result}`);
    return result;
  };

  // Handlers for badge state
  const updateLine = (index: number, changes: any) => {
    const newLines = badge.lines.map((l: any, i: number) => {
      if (i !== index) return ({
        ...l,
        alignment: (typeof l.alignment === 'string' && (l.alignment === 'left' || l.alignment === 'center' || l.alignment === 'right')) ? l.alignment : 'center',
      }) as BadgeLine;
      let updatedLine = { ...l, ...changes };
      if (typeof changes.text !== 'undefined') {
        // Only auto-scale font size down if text is too wide, but never increase above current size
        let fontSize = updatedLine.size;
        let textWidth = measureTextWidth(updatedLine.text, fontSize, updatedLine.fontFamily, updatedLine.bold, updatedLine.italic);
        while (textWidth > badgeWidth - 24 && fontSize > MIN_FONT_SIZE) {
          fontSize--;
          textWidth = measureTextWidth(updatedLine.text, fontSize, updatedLine.fontFamily, updatedLine.bold, updatedLine.italic);
        }
        updatedLine.size = fontSize;
      }
      // Ensure alignment is always 'left' | 'center' | 'right'
      if (typeof updatedLine.alignment !== 'undefined') {
        updatedLine.alignment = (typeof updatedLine.alignment === 'string' && (updatedLine.alignment === 'left' || updatedLine.alignment === 'center' || updatedLine.alignment === 'right')) ? updatedLine.alignment : 'center';
      } else {
        updatedLine.alignment = 'center';
      }
      return updatedLine as BadgeLine;
    });
    // Always allow editing, but show a warning if vertical fit is exceeded
    const totalHeight = newLines.reduce((sum: number, l: any) => sum + l.size * LINE_HEIGHT_MULTIPLIER, 0);
    if (totalHeight > badgeHeight - 8) {
      // Warning: Text may not fit vertically. Reduce font size or number of lines.
    } else {
      // No warning
    }
    setBadge({ ...badge, lines: newLines });
  };
  const addLine = () => {
    if (badge.lines.length < maxLines) {
      setBadge({
        ...badge,
        lines: [
          ...badge.lines,
          { text: 'Line Text', size: 13, color: '#000000', bold: false, italic: false, underline: false, fontFamily: 'Arial', alignment: 'center' } as BadgeLine,
        ] as BadgeLine[],
      });
    }
  };
  const removeLine = (index: number) => {
    if (badge.lines.length > 1) {
      const newLines = [...badge.lines];
      newLines.splice(index, 1);
      setBadge({ ...badge, lines: newLines.map((l: any) => ({
        ...l,
        alignment: (typeof l.alignment === 'string' && (l.alignment === 'left' || l.alignment === 'center' || l.alignment === 'right')) ? l.alignment : 'center',
      }) as BadgeLine) });
    }
  };
  const resetBadge = () => {
    setBadge({
      lines: [
        { text: 'Your Name', size: 18, color: '#000000', bold: false, italic: false, underline: false, fontFamily: 'Arial', alignment: 'center' } as BadgeLine,
        { text: 'Title', size: 13, color: '#000000', bold: false, italic: false, underline: false, fontFamily: 'Arial', alignment: 'center' } as BadgeLine,
      ],
      backgroundColor: '#FFFFFF',
      backing: 'pin',
      backgroundImage: undefined,
      logo: undefined,
    });
  };

  // Image handling functions
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'background' | 'logo') => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    
    console.log('handleImageUpload called with type:', type, 'file:', file.name);
    
    const reader = new FileReader();
    reader.onload = () => {
      console.log('File loaded, opening positioning modal');
      setPositioningImage(reader.result as string);
      setPositioningType(type);
      setShowPositioning(true);
      // Reset file input so same file can be selected again
      setFileInputKey(prev => prev + 1);
    };
    reader.readAsDataURL(file);
  };

  const handleSavePositionedImage = (positionedImage: BadgeImage | string) => {
    console.log('handleSavePositionedImage called:', { positioningType, positionedImage });
    
    if (positioningType === 'background') {
      // When background image is added, suggest better text colors for readability
      const updatedBadge = { ...badge, backgroundImage: positionedImage as BadgeImage };
      
      // If any text lines are using black color, suggest white for better contrast
      const updatedLines = updatedBadge.lines.map(line => {
        if (line.color === '#000000') {
          return { ...line, color: '#FFFFFF' }; // Suggest white text for dark backgrounds
        }
        return line;
      });
      
      setBadge({ ...updatedBadge, lines: updatedLines });
      console.log('Background image saved');
    } else {
      console.log('Saving logo:', positionedImage);
      setBadge({ ...badge, logo: positionedImage as BadgeImage });
      console.log('Logo saved to badge state');
    }
    setShowPositioning(false);
    setPositioningImage('');
  };

  const handleCancelPositioning = () => {
    setShowPositioning(false);
    setPositioningImage('');
  };

  // Get background for logo positioning preview
  const getLogoPreviewBackground = () => {
    if (badge.backgroundImage) {
      if (typeof badge.backgroundImage === 'string') {
        return `url(${badge.backgroundImage})`;
      } else {
        return `url(${badge.backgroundImage.src})`;
      }
    }
    return badge.backgroundColor;
  };



  const saveBadge = async () => {
    try {
      // Get current shop data
      const shopData = getCurrentShop(_shop);
      if (!shopData) {
        alert('Shop information not found. Please reload the page.');
        return;
      }
      console.log('Saving badge design - shop data:', shopData);
      
      // Prepare the badge design data for Gadget
      const badgeDesignData = {
        shopId: shopData.shopId,
        productId: _productId,
        designId: `design_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: "saved",
        designData: {
        badge,
        timestamp: new Date().toISOString(),
        },
        backgroundColor: badge.backgroundColor,
        backingType: badge.backing,
        basePrice: 9.99,
        backingPrice: badge.backing === 'magnetic' ? 2.00 : badge.backing === 'adhesive' ? 1.00 : 0,
        totalPrice: 9.99 + (badge.backing === 'magnetic' ? 2.00 : badge.backing === 'adhesive' ? 1.00 : 0),
        textLines: badge.lines,
      };
      
      console.log('Creating badge design with Gadget hook:', badgeDesignData);
      
      // Use the api.saveBadgeDesign method
      const savedDesign = await api.saveBadgeDesign(badgeDesignData, shopData);
      
      console.log('Badge design saved successfully:', savedDesign);
      alert(`Badge design saved! Design ID: ${savedDesign.id || 'Unknown'}`);
      
      // Also send to parent window for Shopify integration
      api.sendToParent({
        action: 'design-saved',
        payload: {
          id: savedDesign.id,
          designData: badgeDesignData,
          designId: savedDesign.designId
        }
      });
      
    } catch (error) {
      console.error('Failed to save badge:', error);
      alert('Failed to save badge design. Please try again.');
    }
  };

  const addToCart = async () => {
    // Prevent multiple simultaneous requests
    if (isAddingToCart) {
      console.log('Cart addition already in progress, ignoring request');
      return;
    }

    setIsAddingToCart(true);
    
    try {
      // First, save the badge design to Gadget
      const shopData = getCurrentShop(_shop);
      if (!shopData) {
        alert('Shop information not found. Please reload the page.');
        return;
      }

      // Save the badge design first
      const savedDesign = await api.saveBadgeDesign({
        badge,
        productId: _productId,
        shopId: shopData.shopId,
        designId: `design_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'saved',
        backgroundColor: badge.backgroundColor,
        backingType: badge.backing,
        basePrice: 9.99,
        backingPrice: 0,
        totalPrice: totalPrice,
        textLines: badge.lines
      }, shopData);

      // Log the save result
      console.log('Badge design saved:', savedDesign.id);
      if (savedDesign.fallback) {
        console.warn('Badge design saved in fallback mode:', savedDesign.message);
      }

      // Get the correct variant ID based on backing type
      const getVariantId = (backingType: string, productId?: string | null) => {
        // Always use the correct numeric Shopify variant IDs
        // These are the actual variant IDs from your Shopify admin
        switch (backingType) {
          case 'pin':
            return '47037830299903'; // Pin variant ID
          case 'magnetic':
            return '47037830332671'; // Magnetic variant ID
          case 'adhesive':
            return '47037830365439'; // Adhesive variant ID
          default:
            return '47037830299903'; // Default to Pin
        }
      };

      // Generate full-size badge image and thumbnail
      let fullImage = '';
      let thumbnailImage = '';
      
      try {
        // Generate full-size badge image first
        fullImage = await generateFullBadgeImage(badge);
        console.log('Full badge image generated');
        
        // Generate smaller thumbnail for cart (reduce size to fit in properties)
        thumbnailImage = await generateThumbnailFromFullImage(fullImage, 100, 50);
        console.log('Thumbnail generated');
        
        // Update the badge design record with both image data URLs
        if (savedDesign.id) {
          const updateResult = await api.updateBadgeDesign(savedDesign.id, {
            fullImageUrl: fullImage,
            thumbnailUrl: thumbnailImage
          });
          console.log('Badge design updated with images:', updateResult.id ? 'success' : 'failed');
        }
      } catch (error) {
        console.error('Failed to generate images:', error);
        fullImage = ''; // Fallback to empty string
        thumbnailImage = ''; // Fallback to empty string
      }
      
      const badgeData = {
        variantId: getVariantId(badge.backing, _productId),
        quantity: 1,
        properties: {
          'Custom Badge Design': 'Yes',
          'Badge Text Line 1': badge.lines[0]?.text || '',
          'Badge Text Line 2': badge.lines[1]?.text || '',
          'Badge Text Line 3': badge.lines[2]?.text || '',
          'Badge Text Line 4': badge.lines[3]?.text || '',
          'Background Color': badge.backgroundColor,
          'Font Family': badge.lines[0]?.fontFamily || 'Arial',
          'Backing Type': badge.backing,
          'Design ID': savedDesign.designId,
          'Gadget Design ID': savedDesign.id,
          'Price': `$${totalPrice}`
        }
      };
      
      console.log('Badge data being sent to cart:', badgeData);
      console.log('Badge lines:', badge.lines);
      console.log('Thumbnail image length:', thumbnailImage.length);
      console.log('Thumbnail image preview:', thumbnailImage.substring(0, 100) + '...');
      
      console.log('Adding badge to cart:', {
        variantId: badgeData.variantId,
        designId: savedDesign.designId,
        hasThumbnail: !!thumbnailImage
      });
      
      const result = await api.addToCart(badgeData);
      console.log('Cart addition result:', result.success ? 'success' : 'failed');
      
      // Handle successful cart addition
      if (result.success) {
        console.log('Cart addition successful, redirecting...');
        // The redirect is handled by the API function
        // No need to show alert or redirect again
      } else {
        alert('Failed to add badge to cart. Please try again.');
      }
      
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Failed to add badge to cart. Please try again.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Helper for alignment
  const alignmentIcons = [
    { value: 'left', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h8m-8 6h16" /></svg> },
    { value: 'center', icon: (
      // Standard center-align icon
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <line x1="6" y1="7" x2="18" y2="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="4" y1="17" x2="20" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ) },
    { value: 'right', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M12 12h8m-16 6h16" /></svg> },
  ];

  // Backing options
  const backingOptions = [
    { value: 'pin', label: 'Pin (Included)' },
    { value: 'magnetic', label: 'Magnetic (+$2.00)' },
    { value: 'adhesive', label: 'Adhesive (+$1.00)' },
  ];

  // Price calculation
  const basePrice = 9.99;
  const backingPrice = badge.backing === 'magnetic' ? 2 : badge.backing === 'adhesive' ? 1 : 0;
  const totalPrice = (basePrice + backingPrice).toFixed(2);

  // CSV parsing helper
  function parseCsv(text: string) {
    try {
      setCsvError('');
      const rows = text.trim().split(/\r?\n/).map((row: string) => row.split(','));
      setCsvPreview(rows);
      // Parse rows into badge objects
      if (rows.length > 0 && rows[0].length > 0) {
        const badges = rows.map((row: any) => ({
          ...badge,
          lines: row.map((cell: any, i: number) => {
            const baseLine = badge.lines[i] || badge.lines[0];
            return ({
              ...baseLine,
              text: cell || '',
              size: i === 0 ? 18 : 13,
              alignment: (typeof baseLine.alignment === 'string' && (baseLine.alignment === 'left' || baseLine.alignment === 'center' || baseLine.alignment === 'right')) ? baseLine.alignment : 'center',
            }) as BadgeLine;
          })
        }));
        setMultipleBadges(badges);
      }
    } catch (e) {
      setCsvError('Invalid CSV format.');
      setCsvPreview([]);
      setMultipleBadges([]);
    }
  }

  function handleCsvFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
      parseCsv(text);
    };
    reader.readAsText(file);
  }

  // Shared BadgeEditorPanel component
  const BadgeEditorPanel: React.FC<BadgeEditorPanelProps> = ({
    badge,
    onLineChange,
    onAlignmentChange,
    onBackgroundColorChange,
    onRemoveLine,
    showRemove,
    maxLines,
    addLineButton,
    resetButton,
    multiBadgeButton,
    editable = true,
  }) => {
    const justifyMap = { left: 'flex-start', center: 'center', right: 'flex-end' };
    const align = justifyMap[badge.lines[0].alignment as 'left' | 'center' | 'right'];
    return (
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
        {/* Line formatting boxes */}
        <div className="flex flex-col gap-4">
          {badge.lines.map((line: any, idx: number) => {
            const alignment: 'left' | 'center' | 'right' =
              line.alignment === 'left' || line.alignment === 'center' || line.alignment === 'right'
                ? line.alignment
                : 'center';
            return (
              <div key={idx} className="rounded-lg p-4 flex flex-col gap-2 relative w-full min-w-0" style={{ backgroundColor: '#d5e0f1' }}>
                <div className="flex w-full items-center gap-4 mb-1">
                  <label className="font-semibold text-sm">Line {idx + 1} Text</label>
                  <div className="flex gap-2 items-center">
                    <span className="font-semibold text-sm mr-1">Color:</span>
                    {fontColors.map((fc: any) => {
                      const isDisabled = fc.value === badge.backgroundColor;
                      return (
                        <span key={fc.value} className="relative inline-block">
                          <button
                            className={`color-button w-5 h-5 lg:w-6 lg:h-6 ${line.color === fc.value ? 'ring-2 ring-offset-2 ' + fc.ring : ''} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                            style={{ backgroundColor: fc.value }}
                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => onLineChange(idx, { color: fc.value })}
                            disabled={isDisabled || !editable}
                            title={isDisabled ? 'Cannot match background' : fc.name}
                          />
                          {isDisabled && (
                            <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                              <svg width="14" height="14" viewBox="0 0 20 20" className="lg:w-5 lg:h-5"><line x1="3" y1="17" x2="17" y2="3" stroke="#b91c1c" strokeWidth="2.5" /></svg>
                            </span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                </div>
                <input
                  type="text"
                  className="border rounded px-3 py-2 text-base w-full min-w-[120px] text-gray-900 bg-white placeholder-gray-400"
                  value={line.text}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => onLineChange(idx, { text: e.target.value })}
                  placeholder={`Line ${idx + 1}`}
                  disabled={!editable}
                />
                <div className="flex flex-col sm:flex-row gap-2 items-center mt-2 min-w-0">
                  <div className="flex flex-wrap gap-2 items-center min-w-0 w-full">
                    {/* Font */}
                    <div className="flex gap-1 items-center min-w-0">
                      <span className="font-semibold text-sm mr-1">Font:</span>
                      <select
                        className="border rounded px-2 py-1 text-sm text-gray-900 bg-white"
                        value={line.fontFamily}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onLineChange(idx, { fontFamily: e.target.value })}
                        disabled={!editable}
                      >
                        <option value="Arial">Arial</option>
                        <option value="Helvetica">Helvetica</option>
                        <option value="Roboto">Roboto</option>
                        <option value="Open Sans">Open Sans</option>
                        <option value="Verdana">Verdana</option>
                        <option value="Courier New">Courier New</option>
                      </select>
                    </div>
                    {/* Format */}
                    <div className="flex gap-1 items-center min-w-0">
                      <span className="font-semibold text-sm mr-1">Format:</span>
                      <button
                        className={`control-button w-7 h-7 flex items-center justify-center ${line.bold ? 'bg-gray-100 border-gray-400 text-gray-900' : 'bg-white text-gray-900'}`}
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.preventDefault(); onLineChange(idx, { bold: !line.bold }); }}
                        title="Bold"
                        disabled={!editable}
                      >
                        <span className="font-bold text-lg">B</span>
                      </button>
                      <button
                        className={`control-button w-7 h-7 flex items-center justify-center ${line.italic ? 'bg-gray-100 border-gray-400 text-gray-900' : 'bg-white text-gray-900'}`}
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.preventDefault(); onLineChange(idx, { italic: !line.italic }); }}
                        title="Italic"
                        disabled={!editable}
                      >
                        <span className="italic text-lg">I</span>
                      </button>
                      <button
                        className={`control-button w-7 h-7 flex items-center justify-center ${line.underline ? 'bg-gray-100 border-gray-400 text-gray-900' : 'bg-white text-gray-900'}`}
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.preventDefault(); onLineChange(idx, { underline: !line.underline }); }}
                        title="Underline"
                        disabled={!editable}
                      >
                        <span className="underline text-lg">U</span>
                      </button>
                    </div>
                    {/* Alignment */}
                    <div className="flex gap-1 items-center min-w-0">
                      <span className="font-semibold text-sm mr-1">Align:</span>
                      <button
                        className={`control-button w-7 h-7 flex items-center justify-center p-0 ${line.alignment === 'left' ? 'bg-gray-100 border-gray-400 text-gray-900' : 'bg-white text-gray-900'}`}
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.preventDefault(); onAlignmentChange(idx, 'left'); }}
                        title="Align Left"
                        disabled={!editable}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h10M4 18h12" />
                        </svg>
                      </button>
                      <button
                        className={`control-button w-7 h-7 flex items-center justify-center p-0 ${line.alignment === 'center' ? 'bg-gray-100 border-gray-400 text-gray-900' : 'bg-white text-gray-900'}`}
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.preventDefault(); onAlignmentChange(idx, 'center'); }}
                        title="Align Center"
                        disabled={!editable}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M8 12h8M6 18h12" />
                        </svg>
                      </button>
                      <button
                        className={`control-button w-7 h-7 flex items-center justify-center p-0 ${line.alignment === 'right' ? 'bg-gray-100 border-gray-400 text-gray-900' : 'bg-white text-gray-900'}`}
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.preventDefault(); onAlignmentChange(idx, 'right'); }}
                        title="Align Right"
                        disabled={!editable}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M12 12h8M4 18h16" />
                        </svg>
                      </button>
                    </div>
                    {/* Size Controls */}
                    <div className="flex gap-1 items-center min-w-0">
                      <span className="font-semibold text-sm mr-1">Size</span>
                      <div className="flex items-center">
                        <button
                          type="button"
                          className="control-button w-6 h-6 flex items-center justify-center text-sm p-0"
                          onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.preventDefault(); onLineChange(idx, { size: Math.max(MIN_FONT_SIZE, line.size - 1) }); }}
                          disabled={line.size <= MIN_FONT_SIZE || !editable}
                        >-</button>
                        <span className="w-6 text-center text-sm">{line.size}</span>
                        <button
                          type="button"
                          className="control-button w-6 h-6 flex items-center justify-center text-sm p-0"
                          onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.preventDefault(); onLineChange(idx, { size: Math.min(72, line.size + 1) }); }}
                          disabled={line.size >= 72 || !editable}
                        >+</button>
                      </div>
                    </div>
                  </div>
                </div>
                {showRemove && badge.lines.length > 1 && (
                  <button
                    className="absolute top-2 right-2 control-button w-5 h-5 flex items-center justify-center bg-red-100 text-red-700 border-red-300 hover:bg-red-200"
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.preventDefault(); onRemoveLine(idx); }}
                    disabled={!editable}
                    title="Remove line"
                  >
                    <span style={{ fontSize: 14, color: '#b91c1c' }}>X</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
        {/* Action buttons if provided */}
        <div className="flex flex-row gap-2 justify-end mt-2">
          {addLineButton}
          {multiBadgeButton}
          {resetButton}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row bg-gray-100 p-4 md:p-6 rounded-lg shadow-lg mx-auto max-w-6xl min-h-[600px]">
      {/* LEFT COLUMN - Controls */}
      <div className="w-full pr-4 mb-4 overflow-y-auto" style={{ maxHeight: '90vh' }}>
        <div className="section-container mb-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-800">Customize Your Badge</h2>
              <span className="text-xl font-bold text-red-600">1x3 Badge</span>
            </div>
            <button
              onClick={() => {
                console.log('PDF button clicked!');
                console.log('Badge data:', badge);
                console.log('Badge data JSON:', JSON.stringify(badge, null, 2));
                console.log('Line 1 text:', `"${badge.lines[0].text}"`);
                console.log('Line 1 text length:', badge.lines[0].text?.length);
                console.log('Multiple badges:', multipleBadges);
                generatePDF(badge, multipleBadges);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Download PDF
            </button>
          </div>
          
          {/* Move background color label, swatches, and preview to the left, lined up with 'Text Lines'. Make font size for 'Background Color' and 'Text Lines' the same. */}
          <div className="flex flex-row gap-6 items-center w-full mb-6">
            {/* Background Color Picker */}
            <div className="flex flex-col items-start justify-center min-w-[120px] pr-2" style={{ alignSelf: 'flex-start' }}>
              <span className="font-semibold text-gray-700 mb-2">
                Background Color
                {badge.backgroundImage && (
                  <span className="ml-2 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                    Image Active
                  </span>
                )}
              </span>
              <div className="grid grid-cols-4 gap-2">
                {backgroundColors.map((bg: any) => (
                  <button
                    key={bg.value}
                    className={`color-button ${badge.backgroundColor === bg.value ? 'ring-2 ring-offset-2 ' + bg.ring : ''} ${badge.backgroundImage ? 'opacity-50 cursor-not-allowed' : ''}`}
                    style={{ backgroundColor: bg.value }}
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => { 
                      e.preventDefault(); 
                      if (!badge.backgroundImage) {
                        setBadge({ ...badge, backgroundColor: bg.value }); 
                      }
                    }}
                    title={badge.backgroundImage ? 'Remove background image first' : bg.name}
                    disabled={!!badge.backgroundImage}
                  />
                ))}
              </div>
              <button
                className={`mt-3 text-xs px-2 py-1 border rounded ${badge.backgroundImage ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50'}`}
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => { 
                  e.preventDefault(); 
                  if (!badge.backgroundImage) {
                    setShowExtendedBgPicker(true); 
                  }
                }}
                disabled={!!badge.backgroundImage}
              >
                {badge.backgroundImage ? 'Image Active' : 'More colors…'}
              </button>
            </div>
            {/* Preview Box */}
            <div className="flex items-center justify-center w-full max-w-[300px] badge-preview" style={{
              height: badgeHeight,
              overflow: 'hidden',
              position: 'relative'
            }}>
              <BadgePreview badge={badge} />
            </div>
          </div>

          {/* Image Upload Controls - Compact Side-by-Side */}
          <div className="mb-4">
            <div className="flex gap-4">
              {/* Background Image Upload */}
              <div className="flex-1 border-l-4 border-blue-500 pl-3">
                <h3 className="font-semibold text-gray-700 mb-2">Background Image</h3>
                <div className="space-y-2">
                  <input
                    key={`background-${fileInputKey}`}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'background')}
                    className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {badge.backgroundImage && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => setBadge({ ...badge, backgroundImage: undefined })}
                        className="px-2 py-1 text-xs border rounded bg-red-50 text-red-600 hover:bg-red-100"
                      >
                        Remove
                      </button>
                      {typeof badge.backgroundImage !== 'string' && badge.backgroundImage && (
                        <button
                          onClick={() => {
                            setPositioningImage((badge.backgroundImage as BadgeImage).src);
                            setPositioningType('background');
                            setShowPositioning(true);
                          }}
                          className="px-2 py-1 text-xs border rounded bg-blue-50 text-blue-600 hover:bg-blue-100"
                        >
                          Reposition
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Logo Upload */}
              <div className="flex-1 border-l-4 border-green-500 pl-3">
                <h3 className="font-semibold text-gray-700 mb-2">Logo</h3>
                <div className="space-y-2">
                  <input
                    key={`logo-${fileInputKey}`}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'logo')}
                    className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                  />
                  {badge.logo && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setPositioningImage(badge.logo!.src);
                          setPositioningType('logo');
                          setShowPositioning(true);
                        }}
                        className="px-2 py-1 text-xs border rounded bg-blue-50 text-blue-600 hover:bg-blue-100"
                      >
                        Reposition
                      </button>
                      <button
                        onClick={() => {
                          setBadge({ ...badge, logo: undefined });
                        }}
                        className="px-2 py-1 text-xs border rounded bg-red-50 text-red-600 hover:bg-red-100"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Text Lines */}
          <BadgeEditPanel
            badge={badge}
            maxLines={maxLines}
            onLineChange={updateLine}
            onAlignmentChange={(index, alignment) => setBadge({
              ...badge,
              lines: badge.lines.map((l: any, i: number) => i === index ? { ...l, alignment: (alignment as 'left' | 'center' | 'right') } : l) as BadgeLine[]
            })}
            onBackgroundColorChange={(backgroundColor) => {
              // When background color is changed, clear any background image
              setBadge({ 
                ...badge, 
                backgroundColor,
                backgroundImage: undefined // Clear background image when color is selected
              });
            }}
            onRemoveLine={removeLine}
            addLine={addLine}
            showRemove={true}
            editable={true}
          />
          <div className="flex justify-end items-center gap-2 mb-4">
            <button
              className="control-button flex items-center gap-1 px-3 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 border border-gray-400"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.preventDefault(); resetBadge(); }}
            >
              <ArrowPathIcon className="w-5 h-5" />
              Reset
            </button>
            
            <button
              className="control-button bg-blue-500 text-white hover:bg-blue-600 px-3 py-2 text-sm"
              style={{ minWidth: 120 }}
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.preventDefault(); setShowCsvModal(true); }}
            >
              Add Multiple Badges
            </button>
          </div>
          
          
          
          {/* Backing Options */}
          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-2">Backing Type</h3>
            <div className="flex gap-3">
              {backingOptions.map((option) => (
                <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="backing"
                    value={option.value}
                    checked={badge.backing === option.value}
                    onChange={(e) => setBadge({ ...badge, backing: e.target.value })}
                    className="text-blue-600"
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end mt-2 mb-4 gap-2">
            <button
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.preventDefault(); saveBadge(); }}
            >
              Save Design
            </button>
            <button
              className={`px-4 py-2 rounded shadow ${
                isAddingToCart 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => { 
                e.preventDefault(); 
                if (!isAddingToCart) {
                  addToCart(); 
                }
              }}
              disabled={isAddingToCart}
            >
              {isAddingToCart ? 'Adding to Cart...' : `Add to Cart - $${totalPrice}`}
            </button>
          </div>
        </div>
      </div>
      {/* RIGHT COLUMN - Preview & Order Summary */}
      <div className="w-full md:w-1/2 md:pl-3 flex flex-col items-center">
        {multipleBadges.length > 0 && (
          <>
            <h2 className="text-xl font-bold mb-4">Badge Preview</h2>
            <div className="flex flex-col gap-6 w-full items-center">
              {/* Original badge preview (numbered 1, same style as others) */}
              <div className="flex flex-row items-center gap-2 w-full">
                {/* Badge number (left of preview, same as multi-badge) */}
                <div className="flex flex-col items-center justify-center mr-2">
                  <span className="text-lg font-bold mb-2" style={{ width: 32, textAlign: 'center' }}>1.</span>
                </div>
                {/* Main preview box */}
                <div className="flex flex-col items-center w-full max-w-[300px]">
                  <div
                    className="flex items-center justify-center rounded border w-full max-w-[300px]"
                    style={{ height: badgeHeight, background: badge.backgroundColor, overflow: 'hidden', position: 'relative', border: '2px solid #888' }}
                  >
                    {(() => {
                      const justifyMap = { left: 'flex-start', center: 'center', right: 'flex-end' };
                      const align = justifyMap[badge.lines[0].alignment as 'left' | 'center' | 'right'];
                      if (badge.lines.length === 1) {
                        return (
                          <div
                            className={`w-full h-full flex flex-col items-${align} justify-center px-4`}
                            style={{ textAlign: (badge.lines[0].alignment as 'left' | 'center' | 'right') || 'center' }}
                          >
                            {badge.lines.map((line: any, idx: number) => {
                              const alignment: 'left' | 'center' | 'right' =
                                line.alignment === 'left' || line.alignment === 'center' || line.alignment === 'right'
                                  ? line.alignment
                                  : 'center';
                              return (
                                <span
                                  key={idx}
                                  style={{
                                    fontSize: line.size,
                                    color: line.color,
                                    fontWeight: line.bold ? 'bold' : 'normal',
                                    fontStyle: line.italic ? 'italic' : 'normal',
                                    textDecoration: line.underline ? 'underline' : 'none',
                                    fontFamily: getFontFamily(line.fontFamily),
                                    whiteSpace: 'nowrap',
                                    margin: line.alignment === 'left' ? '0 auto 0 0' : line.alignment === 'right' ? '0 0 0 auto' : '0 auto',
                                    lineHeight: 1,
                                    textAlign: alignment,
                                  }}
                                >
                                  {line.text}
                                </span>
                              );
                            })}
                          </div>
                        );
                      }
                      return (
                        <div
                          className={`w-full h-full flex flex-col justify-center items-center px-4`}
                          style={{ textAlign: 'center' }}
                        >
                          {badge.lines.map((line: any, idx: number) => {
                            const alignment: 'left' | 'center' | 'right' =
                              line.alignment === 'left' || line.alignment === 'center' || line.alignment === 'right'
                                ? line.alignment
                                : 'center';
                            return (
                              <span
                                key={idx}
                                style={{
                                  fontSize: line.size,
                                  color: line.color,
                                  fontWeight: line.bold ? 'bold' : 'normal',
                                  fontStyle: line.italic ? 'italic' : 'normal',
                                  textDecoration: line.underline ? 'underline' : 'none',
                                  fontFamily: getFontFamily(line.fontFamily),
                                  whiteSpace: 'nowrap',
                                  margin: line.alignment === 'left' ? '0 auto 0 0' : line.alignment === 'right' ? '0 0 0 auto' : '0 auto',
                                  lineHeight: 1.3,
                                  textAlign: alignment,
                                }}
                              >
                                {line.text}
                              </span>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
              {/* Multiple badge previews below, each with edit/delete and number */}
              {multipleBadges.map((b: any, i: number) => (
                <React.Fragment key={i}>
                  <div className="flex flex-row items-center gap-2 w-full">
                    {/* Badge number and buttons (left of preview) */}
                    <div className="flex flex-col items-center justify-center mr-2">
                      <span className="text-lg font-bold mb-2" style={{ width: 32, textAlign: 'center' }}>{i + 2}.</span>
                      <button className="control-button p-1 bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200 flex items-center justify-center" style={{ width: 28, height: 28 }} onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.preventDefault(); setEditModalIndex(i); }}>
                        <ArrowPathIcon className="w-4 h-4" />
                      </button>
                      <div className="h-2"></div>
                      <button className="control-button p-1 bg-red-100 text-red-700 border-red-300 hover:bg-red-200 flex items-center justify-center" style={{ width: 28, height: 28 }} onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.preventDefault(); setMultipleBadges(multipleBadges.filter((_, idx) => idx !== i)); }}>
                        <span style={{ fontSize: 20, color: '#b91c1c' }}>X</span>
                      </button>
                    </div>
                    {/* Preview box */}
                    <div className="flex flex-col items-center w-full max-w-[300px]">
                      <div
                        className="flex items-center justify-center w-full max-w-[300px] badge-preview-multiple"
                                                  style={{ height: badgeHeight, overflow: 'hidden', position: 'relative' }}
                      >
                        <BadgePreview badge={b} isMultiple={true} />
                              </div>
                    </div>
                  </div>
                  {/* Edit Modal UI */}
                  {editModalIndex === i && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
                        <button
                          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
                          onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.preventDefault(); setEditModalIndex(null); }}
                          aria-label="Close"
                        >
                          <XMarkIcon className="w-6 h-6" />
                        </button>
                        <h3 className="text-lg font-bold mb-2">Edit Badge</h3>
                        {(() => {
                          const badgeToEdit = multipleBadges[editModalIndex];
                          if (!badgeToEdit) return null;
                          return (
                            <div className="flex flex-col gap-4">
                              {/* Preview and Background Color side by side */}
                              <div className="flex flex-row gap-6 items-start w-full justify-center">
                                {/* Background Color Picker */}
                                <div className="flex flex-col items-end justify-center min-w-[120px] pr-2" style={{ alignSelf: 'center' }}>
                                  <span className="font-semibold text-sm mb-1">Background Color</span>
                                  <div className="grid grid-cols-4 grid-rows-2 gap-2">
                                    {backgroundColors.map((bg: any) => (
                                      <button
                                        key={bg.value}
                                        className={`color-button ${badgeToEdit.backgroundColor === bg.value ? 'ring-2 ring-offset-2 ' + bg.ring : ''}`}
                                        style={{ backgroundColor: bg.value }}
                                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.preventDefault(); const newBadges = [...multipleBadges]; newBadges[editModalIndex] = { ...badgeToEdit, backgroundColor: bg.value }; setMultipleBadges(newBadges); }}
                                      />
                                    ))}
                                  </div>
                                </div>
                                {/* Live Preview */}
                                <div className="flex items-center justify-center rounded border w-full max-w-[300px]" style={{ height: badgeHeight, background: badgeToEdit.backgroundColor, overflow: 'hidden', position: 'relative', border: '2px solid #888' }}>
                                  <BadgePreview badge={badgeToEdit} />
                                </div>
                              </div>
                              {/* Editable Lines */}
                              <div className="flex flex-col gap-6 w-full max-w-2xl">
                                <BadgeEditPanel
                                  badge={badgeToEdit}
                                  maxLines={maxLines}
                                  onLineChange={(lineIdx, changes) => {
                                    const newBadges = [...multipleBadges];
                                    const newLines = [...badgeToEdit.lines];
                                    newLines[lineIdx] = { ...newLines[lineIdx], ...changes };
                                    newBadges[editModalIndex] = { ...badgeToEdit, lines: newLines };
                                    setMultipleBadges(newBadges);
                                  }}
                                  onAlignmentChange={(lineIdx, alignment) => {
                                    const newBadges = [...multipleBadges];
                                    newBadges[editModalIndex] = {
                                      ...badgeToEdit,
                                      lines: badgeToEdit.lines.map((l: any, i: number) =>
                                        i === lineIdx ? { ...l, alignment: (alignment as 'left' | 'center' | 'right') } : l
                                      ),
                                    };
                                    setMultipleBadges(newBadges);
                                  }}
                                  onBackgroundColorChange={(backgroundColor) => {
                                    const newBadges = [...multipleBadges];
                                    newBadges[editModalIndex] = { ...badgeToEdit, backgroundColor };
                                    setMultipleBadges(newBadges);
                                  }}
                                  onRemoveLine={(lineIdx) => {
                                    const newBadges = [...multipleBadges];
                                    const newLines = [...badgeToEdit.lines];
                                    newLines.splice(lineIdx, 1);
                                    newBadges[editModalIndex] = { ...badgeToEdit, lines: newLines };
                                    setMultipleBadges(newBadges);
                                  }}
                                  addLine={() => {
                                    const newBadges = [...multipleBadges];
                                    if (badgeToEdit.lines.length < maxLines) {
                                      newBadges[editModalIndex] = {
                                        ...badgeToEdit,
                                        lines: [
                                          ...badgeToEdit.lines,
                                          { text: 'Line Text', size: 13, color: '#000000', bold: false, italic: false, underline: false, fontFamily: 'Arial', alignment: 'center' } as BadgeLine,
                                        ],
                                      };
                                      setMultipleBadges(newBadges);
                                    }
                                  }}
                                  showRemove={true}
                                  editable={true}
                                />
                              </div>
                              {/* Save Button */}
                              <div className="flex justify-end mt-4">
                                <button
                                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow"
                                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.preventDefault(); setEditModalIndex(null); }}
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </>
        )}
      </div>
      {/* Modal/Section for CSV Upload/Entry - moved to root */}
      {showCsvModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.preventDefault(); setShowCsvModal(false); }}
              aria-label="Close"
            >
              &times;
            </button>
            <h3 className="text-lg font-bold mb-2">Add Multiple Badges</h3>
            <p className="mb-2 text-sm text-gray-700">
              You can upload a CSV file or paste CSV data below. Each row should represent a badge.
            </p>
            <p className="mb-2 text-sm text-gray-700">
              <b>Add a comma (,) to indicate a new line. Add up to 4 lines.</b>
            </p>
            <div className="mb-2 text-sm">
              <b>Example:</b><br />
              <span className="font-mono bg-gray-100 p-1 rounded inline-block mb-1">Names,Title,Company</span><br />
              <span className="font-mono bg-gray-100 p-1 rounded inline-block mb-1">John Doe,Manager,Blue</span><br />
              <span className="font-mono bg-gray-100 p-1 rounded inline-block mb-1">Jane Smith,Developer,Red</span>
            </div>
            <div className="mb-2">
              <input type="file" accept=".csv" onChange={handleCsvFile} className="mb-2" />
            </div>
            <textarea
              className="w-full border rounded p-2 mb-2 text-sm text-gray-900 bg-white"
              rows={4}
              placeholder="Paste CSV data here..."
              value={csvText}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => { setCsvText(e.target.value); parseCsv(e.target.value); }}
            />
            {csvError && <div className="text-red-600 text-sm mb-2">{csvError}</div>}
            {csvPreview.length > 0 && (
              <div className="mb-2">
                <div className="font-semibold mb-1">Preview:</div>
                <table className="w-full text-xs border">
                  <tbody>
                    {csvPreview.map((row: string[], i: number) => (
                      <tr key={i} className="border-t">
                        {row.map((cell: string, j: number) => (
                          <td key={j} className="border px-2 py-1">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="flex justify-end">
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-1 rounded mr-2"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.preventDefault(); setShowCsvModal(false); }}
              >Cancel</button>
              <button
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.preventDefault(); parseCsv(csvText); setTimeout(() => { if (!csvError) setShowCsvModal(false); }, 0); }}
              >Add Badges</button>
            </div>
          </div>
        </div>
      )}
      {showExtendedBgPicker && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.preventDefault(); setShowExtendedBgPicker(false); }}
              aria-label="Close"
            >
              ×
            </button>
            <h3 className="text-lg font-bold mb-3">Choose Background Color</h3>
            <div className="grid grid-cols-9 gap-2">
              {EXTENDED_BACKGROUND_COLORS.map((c) => (
                <button
                  key={c.value}
                  className={`w-7 h-7 border rounded ${badge.backgroundColor === c.value ? 'ring-2 ring-offset-1 ' + c.ring : ''}`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.preventDefault(); setBadge({ ...badge, backgroundColor: c.value }); setShowExtendedBgPicker(false); }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Image Positioning Modal */}
      {showPositioning && (() => {
        console.log('Rendering ImagePositioning modal with:', { positioningImage, positioningType, showPositioning });
        return (
          <ImagePositioning
            image={positioningImage}
            type={positioningType}
            onSave={handleSavePositionedImage}
            onCancel={handleCancelPositioning}
            badgeBackground={getLogoPreviewBackground()}
            badgeLogo={badge.logo}
            badgeBackgroundImage={typeof badge.backgroundImage !== 'string' ? badge.backgroundImage : undefined}
          />
        );
      })()}
    </div>
  );
};

export default BadgeDesigner; 