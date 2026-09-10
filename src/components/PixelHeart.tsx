import React from 'react';

interface PixelHeartProps {
  color?: string;
  className?: string;
  size?: number; // optional size in px
  outline?: boolean;
}

/**
 * Authentic 8-bit retro pixel heart SVG component.
 * Uses crispEdges rendering for razor-sharp pixel aesthetic.
 */
export const PixelHeart: React.FC<PixelHeartProps> = ({
  color = '#C89398',
  className = 'w-4 h-4',
  size,
  outline = false,
}) => {
  const style = size ? { width: size, height: size } : undefined;

  if (outline) {
    return (
      <svg
        viewBox="0 0 12 11"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="crispEdges"
        className={`inline-block ${className}`}
        style={style}
      >
        {/* Outline of 8-bit heart */}
        <path
          d="M2 1h2v1H2zm6 0h2v1H8zM1 2h1v1H1zm4 0h2v1H5zm5 0h1v1h-1zM0 3h1v3H0zm11 3h1V3h-1zM1 6h1v1H1zm9 0h1v1h-1zM2 7h1v1H2zm7 0h1v1H7zm-5 1h1v1H4zm3 0h1v1H7zm-2 1h2v1H5zm0 1h2v1H5z"
          fill={color}
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 12 11"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
      className={`inline-block shrink-0 ${className}`}
      style={style}
    >
      {/* 
        Symmetrical 12x11 retro pixel heart
        Row 1: 2..3, 8..9
        Row 2: 1..4, 7..10
        Row 3-5: 0..11
        Row 6: 1..10
        Row 7: 2..9
        Row 8: 3..8
        Row 9: 4..7
        Row 10: 5..6
      */}
      <path d="M2 1h2v1H2zm6 0h2v1H8zM1 2h4v1H1zm6 0h4v1H7zM0 3h12v3H0zm1 3h10v1H1zm1 1h8v1H2zm1 1h6v1H3zm1 1h4v1H4zm1 1h2v1H5z" />
    </svg>
  );
};
