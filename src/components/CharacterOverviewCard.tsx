import React from 'react';
import { Character } from '../types';
import { PixelHeart } from './PixelHeart';

interface CharacterOverviewCardProps {
  character: Character;
  isA: boolean;
  className?: string;
  onImageClick?: () => void;
}

export const CharacterOverviewCard: React.FC<CharacterOverviewCardProps> = ({
  character,
  isA,
  className = '',
  onImageClick,
}) => {
  const heartColor = isA ? '#442F2A' : '#C89398';

  const rawSwatches =
    character.swatches && character.swatches.length > 0
      ? character.swatches
      : [
          { label: 'HAIR', color: isA ? '薄墨灰' : '深栗棕', colorCode: isA ? '#8E8D8A' : '#5A3825' },
          { label: 'EYE', color: isA ? '琥珀棕' : '琥珀棕', colorCode: isA ? '#6E473B' : '#7D4F37' },
        ];
  // Keep only HAIR and EYE, removing ACCENT
  const swatches = rawSwatches.filter((s) => s.label.toUpperCase() !== 'ACCENT').slice(0, 2);

  const statusList =
    character.statusList && character.statusList.length > 0
      ? character.statusList
      : [
          { label: '親密', value: isA ? 95 : 98 },
          { label: '激情', value: isA ? 70 : 85 },
          { label: '承諾', value: isA ? 90 : 95 },
        ];

  const sections =
    character.sections && character.sections.length > 0
      ? character.sections
      : [
          {
            number: '01',
            title: isA ? '一本正經的胡說八道' : '元氣滿滿的小太陽',
            content: character.personality,
          },
          {
            number: '02',
            title: '戀愛二三事',
            content: character.quote,
          },
        ];

  return (
    <div
      className={`pixel-card p-3.5 sm:p-4 bg-white border-2 border-[#442F2A] rounded-xl shadow-md flex flex-col gap-3 h-full ${className}`}
    >
      {/* Card Header: Character Name & Romaji */}
      <div className="flex items-center justify-between border-b border-[#442F2A]/15 pb-2">
        <div className="flex items-center gap-1.5">
          <PixelHeart color={heartColor} className="w-3.5 h-3.5 shrink-0" />
          <h3 className="font-pixel font-bold text-sm sm:text-base text-[#442F2A]">
            {character.name}
          </h3>
          {character.romajiName && (
            <span className="text-[11px] font-pixel text-[#442F2A]/60">
              ({character.romajiName})
            </span>
          )}
        </div>
      </div>

      {/* Top Section: Photo with HAIR & EYE swatches below on left, 基本情報 on right */}
      <div className="flex items-start gap-3 sm:gap-3.5">
        {/* Left: Scaled Photo on top, HAIR & EYE Swatches directly underneath */}
        <div className="flex flex-col items-center gap-1.5 shrink-0 w-24 sm:w-28">
          <div
            role={onImageClick ? 'button' : undefined}
            tabIndex={onImageClick ? 0 : undefined}
            onClick={onImageClick}
            onKeyDown={(e) => {
              if (onImageClick && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                onImageClick();
              }
            }}
            className={`w-full h-36 sm:h-42 rounded-xl overflow-hidden bg-[#F8EDF1] border border-[#442F2A]/15 shadow-xs relative group transition-all duration-200 ${
              onImageClick
                ? 'cursor-pointer hover:border-[#442F2A] hover:scale-102 active:scale-98 hover:shadow-md'
                : ''
            }`}
            title={onImageClick ? `點擊前往 ${character.name} 個人基本情報頁` : undefined}
          >
            <img
              src={character.avatar}
              alt={character.name}
              className="w-full h-full object-cover filter contrast-105 group-hover:scale-105 transition duration-300"
            />
            {onImageClick && (
              <div className="absolute inset-0 bg-[#442F2A]/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2">
                <span className="bg-[#FFF8F5] text-[#442F2A] text-[9px] font-pixel px-1.5 py-0.5 rounded shadow-sm border border-[#442F2A] font-bold">
                  PROFILE ✦
                </span>
              </div>
            )}
          </div>

          {/* Swatches: HAIR and EYE only */}
          <div className="w-full flex items-center justify-between gap-1">
            {swatches.map((swatch, sIdx) => (
              <div
                key={sIdx}
                className="flex-1 py-0.5 px-0.5 rounded text-[9px] font-bold text-white text-center shadow-2xs uppercase tracking-wider truncate"
                style={{
                  backgroundColor: swatch.colorCode || (sIdx === 0 ? '#8E8D8A' : '#6E473B'),
                }}
                title={`${swatch.label}: ${swatch.color}`}
              >
                {swatch.label}
              </div>
            ))}
          </div>
        </div>

        {/* Right: 基本情報 Section */}
        <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch font-pixel">
          <div className="text-[10px] font-bold text-[#442F2A]/80 tracking-widest uppercase mb-0.5">
            基本情報
          </div>

          <div className="flex-1 flex flex-col justify-between">
            {/* Row 1: GENDER */}
            <div className="py-0.5 border-b border-[#442F2A]/10">
              <div className="text-[9px] text-[#442F2A]/65 font-medium tracking-wide">GENDER</div>
              <div className="text-[11px] sm:text-xs font-bold text-[#442F2A] leading-tight">
                {character.gender || (isA ? '男' : '女')}
              </div>
            </div>

            {/* Row 2: AGE */}
            <div className="py-0.5 border-b border-[#442F2A]/10">
              <div className="text-[9px] text-[#442F2A]/65 font-medium tracking-wide">AGE</div>
              <div className="text-[11px] sm:text-xs font-bold text-[#442F2A] leading-tight">
                {character.age || '17'}
              </div>
            </div>

            {/* Row 3: OCCUPATION */}
            <div className="py-0.5 border-b border-[#442F2A]/10">
              <div className="text-[9px] text-[#442F2A]/65 font-medium tracking-wide">
                OCCUPATION
              </div>
              <div className="text-[11px] sm:text-xs font-bold text-[#442F2A] leading-tight truncate">
                {character.occupation || (isA ? '烏野高校 排球部' : '烏野高校 經理兼攝影')}
              </div>
            </div>

            {/* Row 4: HEIGHT */}
            <div className="py-0.5 border-b border-[#442F2A]/10">
              <div className="text-[9px] text-[#442F2A]/65 font-medium tracking-wide">HEIGHT</div>
              <div className="text-[11px] sm:text-xs font-bold text-[#442F2A] leading-tight">
                {character.bodyType || character.height || (isA ? '174.3 cm' : '160 cm')}
              </div>
            </div>

            {/* Row 5: BIRTHDAY */}
            <div className="py-0.5 border-b border-[#442F2A]/10">
              <div className="text-[9px] text-[#442F2A]/65 font-medium tracking-wide">
                BIRTHDAY
              </div>
              <div className="text-[11px] sm:text-xs font-bold text-[#442F2A] leading-tight truncate">
                {character.birthday || (isA ? '06.13' : '04.12')}{' '}
                {character.constellation ? `(${character.constellation})` : ''}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STATUS Progress Bars */}
      <div className="mt-1 space-y-1.5 font-pixel">
        <div className="text-[10px] text-[#442F2A]/80 font-bold tracking-widest uppercase">
          STATUS
        </div>
        <div className="space-y-1.5">
          {statusList.map((st, idx) => (
            <div key={idx} className="flex items-center text-xs">
              <span className="w-7 text-[10px] text-[#442F2A] font-bold shrink-0">{st.label}</span>
              <div className="flex-1 h-2 bg-[#F8EDF1] border border-[#442F2A]/15 rounded-full overflow-hidden mx-2.5">
                <div
                  className="h-full bg-[#C89398] rounded-full transition-all duration-500 shadow-2xs"
                  style={{ width: `${Math.min(100, Math.max(0, st.value))}%` }}
                />
              </div>
              <span className="text-[9px] text-[#442F2A] w-5 text-right font-bold shrink-0">
                {st.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Numbered Lore / Narrative Sections */}
      <div className="mt-2 space-y-3 font-pixel">
        {sections.map((sec, secIdx) => (
          <div key={secIdx} className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded bg-[#442F2A] text-[#FFF8F5] flex items-center justify-center text-[9px] font-bold font-mono shrink-0">
                {sec.number || `0${secIdx + 1}`}
              </span>
              <h4 className="font-bold text-xs sm:text-[13px] text-[#442F2A] tracking-tight">
                {sec.title}
              </h4>
            </div>
            <div className="text-xs text-[#442F2A] leading-[1.65] whitespace-pre-line">
              {sec.content && sec.content.trim() ? (
                sec.content
              ) : (
                <div className="inline-block bg-[#FFF8F5] border border-[#442F2A] text-[#442F2A] px-2.5 py-0.5 rounded text-[10px] font-pixel font-bold">
                  ［ 敬請期待 ］
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
