import React from 'react';
import { Badge, BadgeLine } from '../types/badge';
import { BADGE_CONSTANTS } from '../constants/badge';

interface BadgePreviewProps {
  badge: Badge;
  className?: string;
  isMultiple?: boolean;
  onLogoMouseDown?: (e: React.MouseEvent<HTMLImageElement>) => void;
}

export const BadgePreview: React.FC<BadgePreviewProps> = ({ 
  badge, 
  className = '', 
  isMultiple = false,
  onLogoMouseDown
}) => {

  // Fallback to original CSS-based rendering
  return (
    <div 
      className={`relative flex items-center justify-center rounded-lg border-2 w-full ${
        isMultiple ? 'badge-preview-multiple' : 'badge-preview'
      } ${className}`}
      style={{
        width: BADGE_CONSTANTS.BADGE_WIDTH,
        height: BADGE_CONSTANTS.BADGE_HEIGHT,
        background: badge.backgroundImage ? 'transparent' : badge.backgroundColor, // Don't show background color if image is present
        borderColor: '#888',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background image layer */}
      {badge.backgroundImage && (
        typeof badge.backgroundImage === 'string' ? (
          <img
            src={badge.backgroundImage}
            alt="Background"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: 1
            }}
          />
        ) : (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              overflow: 'hidden',
              zIndex: 1
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: badge.backgroundImage.y,
                left: badge.backgroundImage.x,
                transform: `scale(${badge.backgroundImage.scale})`,
                transformOrigin: 'top left',
                zIndex: 1
              }}
            >
              <img
                src={badge.backgroundImage.src}
                alt="Background"
                style={{
                  maxWidth: 'none',
                  maxHeight: 'none',
                  objectFit: 'contain'
                }}
              />
            </div>
          </div>
        )
      )}

      {/* Logo overlay */}
      {badge.logo && (
        <div
          style={{
            position: 'absolute',
            top: badge.logo.y,
            left: badge.logo.x,
            transform: `scale(${badge.logo.scale})`,
            transformOrigin: 'top left',
            zIndex: 10
          }}
        >
          <img
            src={badge.logo.src}
            alt="Badge logo"
            draggable={false}
            onMouseDown={onLogoMouseDown}
            style={{
              maxWidth: 'none',
              maxHeight: 'none',
              objectFit: 'contain',
              pointerEvents: onLogoMouseDown ? 'auto' : 'none',
              cursor: onLogoMouseDown ? 'grab' : 'default'
            }}
          />
        </div>
      )}
      
      <div
        className="w-full h-full flex flex-col justify-center items-center px-4"
        style={{ 
          textAlign: badge.lines[0]?.alignment || 'center',
          gap: '0.25rem',
          position: 'relative',
          zIndex: 5
        }}
      >
        {badge.lines.map((line: BadgeLine, idx: number) => (
          <span
            key={idx}
            className="whitespace-nowrap"
            style={{
              fontSize: line.size,
              color: line.color,
              fontWeight: line.bold ? 'bold' : 'normal',
              fontStyle: line.italic ? 'italic' : 'normal',
              textDecoration: line.underline ? 'underline' : 'none',
              fontFamily: line.fontFamily,
              lineHeight: BADGE_CONSTANTS.LINE_HEIGHT_MULTIPLIER,
              textShadow: '0 1px 2px rgba(0,0,0,0.1)',
              width: '100%',
              textAlign: line.alignment || 'center'
            }}
          >
            {line.text}
          </span>
        ))}
      </div>
    </div>
  );
}; 