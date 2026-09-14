import React from 'react';

interface PixelHeartProps {
  color?: string;
  borderColor?: string;
  className?: string;
  size?: number; // optional size in px
  outline?: boolean;
  withBorder?: boolean;
}

/**
 * Authentic 8-bit retro pixel heart SVG component.
 * Uses crispEdges rendering and discrete pixel blocks for razor-sharp pixel aesthetic.
 */
export const PixelHeart: React.FC<PixelHeartProps> = ({
  color = '#C89398',
  borderColor = '#442F2A',
  className = 'w-4 h-4',
  size,
  outline = false,
  withBorder = false,
}) => {
  const style: React.CSSProperties = {
    imageRendering: 'pixelated',
    ...(size ? { width: `${size}px`, height: `${size}px` } : {}),
  };

  if (outline) {
    return (
      <svg
        viewBox="0 0 10 9"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="crispEdges"
        className={`inline-block shrink-0 ${className}`}
        style={style}
      >
        <rect x="1" y="0" width="3" height="1" fill={color} />
        <rect x="6" y="0" width="3" height="1" fill={color} />
        <rect x="0" y="1" width="1" height="3" fill={color} />
        <rect x="4" y="1" width="2" height="1" fill={color} />
        <rect x="9" y="1" width="1" height="3" fill={color} />
        <rect x="1" y="4" width="1" height="1" fill={color} />
        <rect x="8" y="4" width="1" height="1" fill={color} />
        <rect x="2" y="5" width="1" height="1" fill={color} />
        <rect x="7" y="5" width="1" height="1" fill={color} />
        <rect x="3" y="6" width="1" height="1" fill={color} />
        <rect x="6" y="6" width="1" height="1" fill={color} />
        <rect x="4" y="7" width="2" height="1" fill={color} />
        <rect x="4" y="8" width="2" height="1" fill={color} />
      </svg>
    );
  }

  if (withBorder) {
    return (
      <svg
        viewBox="0 0 10 9"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="crispEdges"
        className={`inline-block shrink-0 ${className}`}
        style={style}
      >
        {/* Dark pixel outline */}
        <rect x="1" y="0" width="3" height="1" fill={borderColor} />
        <rect x="6" y="0" width="3" height="1" fill={borderColor} />
        <rect x="0" y="1" width="1" height="3" fill={borderColor} />
        <rect x="4" y="1" width="2" height="1" fill={borderColor} />
        <rect x="9" y="1" width="1" height="3" fill={borderColor} />
        <rect x="1" y="4" width="1" height="1" fill={borderColor} />
        <rect x="8" y="4" width="1" height="1" fill={borderColor} />
        <rect x="2" y="5" width="1" height="1" fill={borderColor} />
        <rect x="7" y="5" width="1" height="1" fill={borderColor} />
        <rect x="3" y="6" width="1" height="1" fill={borderColor} />
        <rect x="6" y="6" width="1" height="1" fill={borderColor} />
        <rect x="4" y="7" width="2" height="1" fill={borderColor} />
        {/* Inner colored fill */}
        <rect x="1" y="1" width="3" height="3" fill={color} />
        <rect x="6" y="1" width="3" height="3" fill={color} />
        <rect x="4" y="2" width="2" height="2" fill={color} />
        <rect x="2" y="4" width="6" height="1" fill={color} />
        <rect x="3" y="5" width="4" height="1" fill={color} />
        <rect x="4" y="6" width="2" height="1" fill={color} />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 10 9"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
      className={`inline-block shrink-0 ${className}`}
      style={style}
    >
      {/* Crisp 8-bit stepped pixel blocks */}
      <rect x="1" y="0" width="3" height="1" fill={color} />
      <rect x="6" y="0" width="3" height="1" fill={color} />
      <rect x="0" y="1" width="10" height="3" fill={color} />
      <rect x="1" y="4" width="8" height="1" fill={color} />
      <rect x="2" y="5" width="6" height="1" fill={color} />
      <rect x="3" y="6" width="4" height="1" fill={color} />
      <rect x="4" y="7" width="2" height="1" fill={color} />
    </svg>
  );
};

