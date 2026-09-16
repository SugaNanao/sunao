import React, { useState, useEffect } from 'react';
import { CoupleSiteData, PageDecorationItem, DecorationPageTarget } from '../types';
import { normalizeImageUrl, handleImageLoadError } from '../utils/imageOptimizer';
import { Move, Eye, EyeOff, RotateCcw } from 'lucide-react';

interface PageDecorationsOverlayProps {
  data: CoupleSiteData;
  currentPage: DecorationPageTarget;
  isEditMode: boolean;
  onUpdateData?: (newData: CoupleSiteData) => void;
  containerClass?: string;
}

export const PageDecorationsOverlay: React.FC<PageDecorationsOverlayProps> = ({
  data,
  currentPage,
  isEditMode,
  onUpdateData,
  containerClass = '',
}) => {
  const decorations = data.decorations || [];

  // Filter stickers that belong to this page or ALL pages
  const visibleDecorations = decorations.filter((item) => {
    if (!item.imageUrl) return false;
    if (!item.visible && !isEditMode) return false;
    return item.targetPage === 'ALL' || item.targetPage === currentPage;
  });

  // Dragging state for stickers in edit mode
  const [activeDrag, setActiveDrag] = useState<{
    id: string;
    startX: number;
    startY: number;
    initialOffsetX: number;
    initialOffsetY: number;
    currentOffsetX: number;
    currentOffsetY: number;
  } | null>(null);

  useEffect(() => {
    if (!activeDrag) return;

    const handlePointerMove = (e: PointerEvent) => {
      const dx = e.clientX - activeDrag.startX;
      const dy = e.clientY - activeDrag.startY;
      setActiveDrag((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          currentOffsetX: Math.round(prev.initialOffsetX + dx),
          currentOffsetY: Math.round(prev.initialOffsetY + dy),
        };
      });
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (!activeDrag) return;
      const dx = e.clientX - activeDrag.startX;
      const dy = e.clientY - activeDrag.startY;
      const finalX = Math.round(activeDrag.initialOffsetX + dx);
      const finalY = Math.round(activeDrag.initialOffsetY + dy);

      if (onUpdateData && data.decorations) {
        const nextList = data.decorations.map((d) => {
          if (d.id === activeDrag.id) {
            return {
              ...d,
              offsetX: finalX,
              offsetY: finalY,
            };
          }
          return d;
        });
        onUpdateData({
          ...data,
          decorations: nextList,
        });
      }
      setActiveDrag(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [activeDrag, data, onUpdateData]);

  if (visibleDecorations.length === 0) {
    return null;
  }

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-visible z-20 ${containerClass}`}
      aria-hidden="true"
    >
      {visibleDecorations.map((item) => {
        const isDragging = activeDrag?.id === item.id;
        const currentOffsetX = isDragging ? activeDrag.currentOffsetX : item.offsetX || 0;
        const currentOffsetY = isDragging ? activeDrag.currentOffsetY : item.offsetY || 0;
        const scale = (item.scale ?? 100) / 100;
        const rotation = item.rotation ?? 0;
        const opacity = item.visible === false ? 0.35 : (item.opacity ?? 100) / 100;

        // Determine base position CSS classes
        let positionClasses = 'bottom-3 right-3';
        let transformOrigin = 'bottom right';
        if (item.position === 'bottom-left') {
          positionClasses = 'bottom-3 left-3';
          transformOrigin = 'bottom left';
        } else if (item.position === 'top-right') {
          positionClasses = 'top-3 right-3';
          transformOrigin = 'top right';
        } else if (item.position === 'top-left') {
          positionClasses = 'top-3 left-3';
          transformOrigin = 'top left';
        } else if (item.position === 'free-drag') {
          positionClasses = 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
          transformOrigin = 'center center';
        }

        return (
          <div
            key={item.id}
            className={`absolute ${positionClasses} select-none transition-shadow ${
              isEditMode ? 'pointer-events-auto' : 'pointer-events-none'
            }`}
            style={{
              transform: `translate(${currentOffsetX}px, ${currentOffsetY}px)`,
              zIndex: item.zIndex ?? 30,
              touchAction: isEditMode ? 'none' : 'auto',
            }}
          >
            <div
              onPointerDown={(e) => {
                if (!isEditMode) return;
                e.preventDefault();
                setActiveDrag({
                  id: item.id,
                  startX: e.clientX,
                  startY: e.clientY,
                  initialOffsetX: item.offsetX || 0,
                  initialOffsetY: item.offsetY || 0,
                  currentOffsetX: item.offsetX || 0,
                  currentOffsetY: item.offsetY || 0,
                });
              }}
              className={`relative group ${
                isEditMode
                  ? 'cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-[#C89398] hover:ring-dashed rounded-lg p-1 transition-all bg-white/10 backdrop-blur-[1px]'
                  : ''
              }`}
              title={
                isEditMode
                  ? `【${item.name || '裝飾貼圖'}】可按住拖曳位置 (目前偏移 X:${currentOffsetX} Y:${currentOffsetY})`
                  : undefined
              }
            >
              <img
                src={normalizeImageUrl(item.imageUrl)}
                alt={item.name || '裝飾貼圖'}
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                onError={(e) => handleImageLoadError(e, item.imageUrl)}
                className="max-h-24 sm:max-h-32 md:max-h-40 w-auto object-contain drop-shadow-sm pointer-events-none transition-transform duration-100"
                style={{
                  transform: `scale(${scale}) rotate(${rotation}deg)`,
                  transformOrigin,
                  opacity,
                  backgroundColor: 'transparent',
                }}
              />

              {/* Edit Mode Controls Tooltip */}
              {isEditMode && (
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-[#442F2A] text-white text-[9px] font-pixel px-1.5 py-0.5 rounded shadow-md opacity-85 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  <Move className="w-2.5 h-2.5 text-[#E0BAC7]" />
                  <span>{isDragging ? '拖拽中...' : item.name || '貼圖'}</span>
                  {(currentOffsetX !== 0 || currentOffsetY !== 0) && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onUpdateData && data.decorations) {
                          const resetList = data.decorations.map((d) =>
                            d.id === item.id ? { ...d, offsetX: 0, offsetY: 0 } : d
                          );
                          onUpdateData({ ...data, decorations: resetList });
                        }
                      }}
                      className="ml-1 p-0.5 hover:bg-white/20 rounded cursor-pointer text-amber-200"
                      title="重設位置至預設"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
