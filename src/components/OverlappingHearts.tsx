import React from 'react';

interface OverlappingHeartsProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const OverlappingHearts: React.FC<OverlappingHeartsProps> = ({
  className = '',
  size = 'md',
}) => {
  const sizeMap = {
    sm: { width: 22, height: 18 },
    md: { width: 28, height: 23 },
    lg: { width: 34, height: 28 },
  };

  const { width, height } = sizeMap[size];

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 34 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block select-none shrink-0 ${className}`}
    >
      {/* Brown Pixel Heart (Behind, slightly bottom-left) */}
      <g transform="translate(0, 4)">
        <rect x="4" y="2" width="6" height="3" fill="#442F2A" />
        <rect x="12" y="2" width="6" height="3" fill="#442F2A" />
        <rect x="1" y="5" width="20" height="6" fill="#442F2A" />
        <rect x="4" y="11" width="14" height="3" fill="#442F2A" />
        <rect x="7" y="14" width="8" height="3" fill="#442F2A" />
        <rect x="9" y="17" width="4" height="3" fill="#442F2A" />
        <rect x="5" y="6" width="3" height="3" fill="#6E473B" />
      </g>

      {/* Pink Pixel Heart (Overlapping on top and slightly right) */}
      <g transform="translate(10, 0)">
        <rect x="4" y="2" width="6" height="3" fill="#442F2A" />
        <rect x="12" y="2" width="6" height="3" fill="#442F2A" />
        <rect x="1" y="5" width="20" height="6" fill="#442F2A" />
        <rect x="4" y="11" width="14" height="3" fill="#442F2A" />
        <rect x="7" y="14" width="8" height="3" fill="#442F2A" />
        <rect x="9" y="17" width="4" height="3" fill="#442F2A" />

        <rect x="5" y="3" width="4" height="2" fill="#E0BAC7" />
        <rect x="13" y="3" width="4" height="2" fill="#E0BAC7" />
        <rect x="3" y="5" width="16" height="5" fill="#E0BAC7" />
        <rect x="5" y="10" width="12" height="3" fill="#E0BAC7" />
        <rect x="8" y="13" width="6" height="3" fill="#E0BAC7" />
        <rect x="10" y="16" width="2" height="2" fill="#E0BAC7" />
        <rect x="5" y="6" width="2" height="2" fill="#FFF8F5" />
      </g>
    </svg>
  );
};
