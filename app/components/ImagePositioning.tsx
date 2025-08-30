import React, { useState, useRef, useEffect, useCallback } from 'react';
import { BadgeImage } from '../types/badge';

interface ImagePositioningProps {
  image: string;
  type: 'background' | 'logo';
  onSave: (positionedImage: BadgeImage | string) => void;
  onCancel: () => void;
  badgeBackground?: string;
  badgeLogo?: BadgeImage;
  badgeBackgroundImage?: BadgeImage;
}

export const ImagePositioning: React.FC<ImagePositioningProps> = ({ 
  image, 
  type, 
  onSave, 
  onCancel, 
  badgeBackground,
  badgeLogo,
  badgeBackgroundImage
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(0.3); // Start smaller for better initial fit
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0, startX: 0, startY: 0 });

  // Get background image style for the positioning canvas
  const getBackgroundImageStyle = () => {
    if (badgeBackground && badgeBackground.startsWith('url(')) {
      return {
        backgroundImage: badgeBackground,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      };
    }
    return {
      background: badgeBackground || '#f9fafb'
    };
  };

  // Center the image initially when scale changes, but preserve existing position when repositioning
  useEffect(() => {
    const canvasWidth = 900;
    const canvasHeight = 300;
    
    // Create a temporary image to get its natural dimensions
    const img = new Image();
    img.onload = () => {
      const naturalWidth = img.naturalWidth;
      const naturalHeight = img.naturalHeight;
      
      // Calculate the scaled dimensions
      const scaledWidth = naturalWidth * scale;
      const scaledHeight = naturalHeight * scale;
      
      // Only center if this is a new image (not repositioning)
      if (type === 'logo' && badgeLogo && image === badgeLogo.src) {
        // Keep existing position when repositioning - don't recenter on scale change
        // Only set initial position once, not on every scale change
        if (position.x === 0 && position.y === 0) {
          // Convert from center coordinates back to top-left for the positioning canvas
          const img = new Image();
          img.onload = () => {
            const naturalWidth = img.naturalWidth;
            const naturalHeight = img.naturalHeight;
            const scaledWidth = naturalWidth * (badgeLogo.scale * 3);
            const scaledHeight = naturalHeight * (badgeLogo.scale * 3);
            
            setPosition({
              x: (badgeLogo.x * 3),
              y: (badgeLogo.y * 3)
            });
            setScale(badgeLogo.scale * 3);
          };
          img.src = image;
        }
      } else if (type === 'background' && badgeBackgroundImage && image === badgeBackgroundImage.src) {
        // Handle background repositioning
        if (position.x === 0 && position.y === 0) {
          // Convert from center coordinates back to top-left for the positioning canvas
          const img = new Image();
          img.onload = () => {
            const naturalWidth = img.naturalWidth;
            const naturalHeight = img.naturalHeight;
            const scaledWidth = naturalWidth * (badgeBackgroundImage.scale * 3);
            const scaledHeight = naturalHeight * (badgeBackgroundImage.scale * 3);
            
            setPosition({
              x: (badgeBackgroundImage.x * 3),
              y: (badgeBackgroundImage.y * 3)
            });
            setScale(badgeBackgroundImage.scale * 3);
          };
          img.src = image;
        }
      } else {
        // True center positioning in the larger canvas for new images
        // Since we're using transformOrigin: 'top left', we need to account for scaled dimensions
        const centerX = (canvasWidth - scaledWidth) / 2;
        const centerY = (canvasHeight - scaledHeight) / 2;
        
        setPosition({
          x: centerX,
          y: centerY
        });
      }
    };
    img.src = image;
  }, [image, type, badgeLogo]); // Removed 'scale' from dependencies

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    
    // Store the starting positions
    dragStartRef.current = {
      x: position.x,
      y: position.y,
      startX: e.clientX,
      startY: e.clientY
    };
  }, [position.x, position.y]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    
    // Calculate the difference from start position
    const deltaX = e.clientX - dragStartRef.current.startX;
    const deltaY = e.clientY - dragStartRef.current.startY;
    
    // Update position based on delta - no constraints at all
    setPosition({
      x: dragStartRef.current.x + deltaX,
      y: dragStartRef.current.y + deltaY
    });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleSave = () => {
    // Convert scaled coordinates back to actual badge dimensions (300x100)
    // Since we're using transformOrigin: 'top left', we need to convert to top-left coordinates
    const canvasWidth = 900;
    const canvasHeight = 300;
    
    // Create a temporary image to get its natural dimensions
    const img = new Image();
    img.onload = () => {
      const naturalWidth = img.naturalWidth;
      const naturalHeight = img.naturalHeight;
      const scaledWidth = naturalWidth * scale;
      const scaledHeight = naturalHeight * scale;
      
      // Convert from top-left to top-left coordinates for the main preview
      const topLeftX = position.x / 3;
      const topLeftY = position.y / 3;
      
      onSave({
        src: image,
        x: topLeftX,
        y: topLeftY,
        scale: scale / 3 // Divide by 3 to convert from positioning canvas scale to badge scale
      });
    };
    img.src = image;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-6xl w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">
          Position {type === 'background' ? 'Background' : 'Logo'} Image
        </h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Scale: {scale.toFixed(2)}x
          </label>
          <input
            type="range"
            min="0.05"
            max="3"
            step="0.02"
            value={scale}
            onChange={(e) => setScale(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="text-xs text-gray-500 mt-1">
            Range: 0.05x to 3x (smooth 0.02x steps)
          </div>
        </div>

        {/* Positioning Canvas - Exact badge dimensions scaled up 3x (300x100 → 900x300) */}
        <div 
          ref={canvasRef}
          className="relative mx-auto border-2 border-gray-300"
          style={{ 
            width: 900, 
            height: 300,
            ...getBackgroundImageStyle()
          }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Badge outline - acts as cropping window with overflow hidden */}
          <div className="absolute border-4 border-blue-500 bg-transparent overflow-hidden" style={{
            left: 0,
            top: 0,
            width: 900,
            height: 300,
            zIndex: 10
          }}>
            {/* Background image layer - positioned inside the cropping window */}
            <div
              className="absolute cursor-move select-none"
              style={{
                left: position.x,
                top: position.y,
                transform: `scale(${scale})`,
                transformOrigin: 'top left'
              }}
              onMouseDown={handleMouseDown}
            >
              <img
                src={image}
                alt={type}
                style={{
                  maxWidth: 'none',
                  maxHeight: 'none',
                  objectFit: 'contain',
                  pointerEvents: 'none'
                }}
              />
            </div>
            
            {/* Show existing logo inside the cropping window if positioning background */}
            {type === 'background' && badgeLogo && (
              <div
                className="absolute"
                style={{
                  left: (badgeLogo.x * 3),
                  top: (badgeLogo.y * 3),
                  transform: `scale(${badgeLogo.scale * 3})`,
                  transformOrigin: 'top left'
                }}
              >
                <img
                  src={badgeLogo.src}
                  alt="Existing logo"
                  style={{
                    maxWidth: 'none',
                    maxHeight: 'none',
                    objectFit: 'contain',
                    pointerEvents: 'none'
                  }}
                />
              </div>
            )}
            
            {/* Add a subtle inner shadow to show the cropping effect */}
            <div className="absolute inset-0 border-2 border-white border-opacity-50 pointer-events-none"></div>
          </div>
          
          {/* Instructions */}
          <div className="absolute bottom-1 left-1 text-xs text-gray-500">
            Blue outline = cropping stencil • Image moves behind border • See exact fit
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save Position
          </button>
        </div>
      </div>
    </div>
  );
};
