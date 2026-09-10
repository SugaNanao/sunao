import React, { useState } from 'react';
import { CoupleSiteData, Character, CoupleProfileItem } from '../../types';
import { PixelHeart } from '../PixelHeart';
import { OverlappingHearts } from '../OverlappingHearts';
import { Edit, Sparkles, Plus, Quote, User, Users, Calendar, Sparkle } from 'lucide-react';

interface CharacterProfileViewProps {
  data: CoupleSiteData;
  isEditMode: boolean;
  onEditSection: (section: string) => void;
}

// Styled "敬請期待" placeholder with border and background color
const renderContentOrPlaceholder = (text?: string, placeholder = '敬請期待') => {
  if (!text || !text.trim()) {
    return (
      <div className="inline-block bg-[#FFF8F5] border-2 border-[#442F2A] text-[#442F2A] px-4 py-1.5 rounded-lg text-xs font-pixel font-bold shadow-xs">
        ［ {placeholder} ］
      </div>
    );
  }
  return text;
};

export const CharacterProfileView: React.FC<CharacterProfileViewProps> = ({
  data,
  isEditMode,
  onEditSection,
}) => {
  const [subTab, setSubTab] = useState<'PERSONAL' | 'COUPLE'>('PERSONAL');

  const coupleProfile = data.coupleProfile || {
    title: 'KOSHI × NANAO ・ COUPLE ARCHIVE',
    motto: '「月が星を照らすまで ・ 願歲月溫柔以待，願年少情深不負。」',
    verse: '爽朗與元氣的共鳴，傲嬌與直球的永恆方程式。',
    items: [],
  };

  const renderCharacterCard = (char: Character, isA: boolean) => {
    const heartColor = isA ? '#442F2A' : '#C89398';

    const rawSwatches = char.swatches && char.swatches.length > 0 ? char.swatches : [
      { label: 'HAIR', color: isA ? '薄墨灰' : '深栗棕', colorCode: isA ? '#8E8D8A' : '#5A3825' },
      { label: 'EYE', color: isA ? '琥珀棕' : '琥珀棕', colorCode: isA ? '#6E473B' : '#7D4F37' },
    ];
    // Keep only HAIR and EYE, removing ACCENT
    const swatches = rawSwatches.filter((s) => s.label.toUpperCase() !== 'ACCENT').slice(0, 2);

    const statusList = char.statusList && char.statusList.length > 0 ? char.statusList : [
      { label: '親密', value: isA ? 95 : 98 },
      { label: '激情', value: isA ? 70 : 85 },
      { label: '承諾', value: isA ? 90 : 95 },
    ];

    const sections = char.sections && char.sections.length > 0 ? char.sections : [
      {
        number: '01',
        title: isA ? '一本正經的胡說八道' : '元氣滿滿的小太陽',
        content: char.personality,
      },
      {
        number: '02',
        title: '戀愛二三事',
        content: char.quote,
      },
    ];

    return (
      <div className="pixel-card p-3.5 sm:p-4.5 bg-white border-2 border-[#442F2A] rounded-xl shadow-md flex flex-col gap-3">
        {/* Card Header: Character Name & Romaji (Badges removed) */}
        <div className="flex items-center justify-between border-b border-[#442F2A]/15 pb-2">
          <div className="flex items-center gap-1.5">
            <PixelHeart color={heartColor} className="w-3.5 h-3.5 shrink-0" />
            <h3 className="font-pixel font-bold text-base text-[#442F2A]">{char.name}</h3>
            {char.romajiName && (
              <span className="text-[11px] font-pixel text-[#442F2A]/60">({char.romajiName})</span>
            )}
          </div>
        </div>

        {/* Top Section: Photo with HAIR & EYE swatches below on left, 基本資料 on right */}
        <div className="flex items-start gap-3 sm:gap-3.5">
          {/* Left: Scaled Photo on top, HAIR & EYE Swatches directly underneath */}
          <div className="flex flex-col items-center gap-1.5 shrink-0 w-24 sm:w-28">
            <div className="w-full h-36 sm:h-42 rounded-xl overflow-hidden bg-[#F8EDF1] border border-[#442F2A]/15 shadow-xs relative group">
              <img
                src={char.avatar}
                alt={char.name}
                className="w-full h-full object-cover filter contrast-105 group-hover:scale-103 transition duration-300"
              />
            </div>

            {/* Swatches: HAIR and EYE only, directly placed under photo */}
            <div className="w-full flex items-center justify-between gap-1">
              {swatches.map((swatch, sIdx) => (
                <div
                  key={sIdx}
                  className="flex-1 py-0.5 px-0.5 rounded text-[9px] font-bold text-white text-center shadow-2xs uppercase tracking-wider truncate"
                  style={{ backgroundColor: swatch.colorCode || (sIdx === 0 ? '#8E8D8A' : '#6E473B') }}
                  title={`${swatch.label}: ${swatch.color}`}
                >
                  {swatch.label}
                </div>
              ))}
            </div>
          </div>

          {/* Right: 基本資料 Section (One item per row with English labels, all font in brown) */}
          <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
            <div className="text-[10px] font-bold text-[#442F2A]/80 tracking-widest uppercase mb-0.5 font-pixel">
              基本情報
            </div>

            <div className="flex-1 flex flex-col justify-between">
              {/* Row 1: GENDER */}
              <div className="py-0.5 border-b border-[#442F2A]/10">
                <div className="text-[9px] text-[#442F2A]/65 font-medium tracking-wide">GENDER</div>
                <div className="text-[11px] sm:text-xs font-bold text-[#442F2A] leading-tight">
                  {char.gender || (isA ? '男' : '女')}
                </div>
              </div>

              {/* Row 2: AGE */}
              <div className="py-0.5 border-b border-[#442F2A]/10">
                <div className="text-[9px] text-[#442F2A]/65 font-medium tracking-wide">AGE</div>
                <div className="text-[11px] sm:text-xs font-bold text-[#442F2A] leading-tight">
                  {char.age || '17'}
                </div>
              </div>

              {/* Row 3: OCCUPATION */}
              <div className="py-0.5 border-b border-[#442F2A]/10">
                <div className="text-[9px] text-[#442F2A]/65 font-medium tracking-wide">OCCUPATION</div>
                <div className="text-[11px] sm:text-xs font-bold text-[#442F2A] leading-tight truncate">
                  {char.occupation || (isA ? '烏野高校 排球部' : '烏野高校 經理兼攝影')}
                </div>
              </div>

              {/* Row 4: MBTI */}
              <div className="py-0.5 border-b border-[#442F2A]/10">
                <div className="text-[9px] text-[#442F2A]/65 font-medium tracking-wide">MBTI</div>
                <div className="text-[11px] sm:text-xs font-bold text-[#442F2A] leading-tight">
                  {char.mbti || (isA ? 'INFJ' : 'ENFP')}
                </div>
              </div>

              {/* Row 5: HEIGHT */}
              <div className="py-0.5 border-b border-[#442F2A]/10">
                <div className="text-[9px] text-[#442F2A]/65 font-medium tracking-wide">HEIGHT</div>
                <div className="text-[11px] sm:text-xs font-bold text-[#442F2A] leading-tight">
                  {char.bodyType || char.height || (isA ? '174.3 cm' : '160 cm')}
                </div>
              </div>

              {/* Row 6: BIRTHDAY */}
              <div className="py-0.5 border-b border-[#442F2A]/10">
                <div className="text-[9px] text-[#442F2A]/65 font-medium tracking-wide">BIRTHDAY</div>
                <div className="text-[11px] sm:text-xs font-bold text-[#442F2A] leading-tight">
                  {char.birthday || (isA ? '06.13' : '04.12')} {char.constellation ? `(${char.constellation})` : ''}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* STATUS Progress Bars (Bars in Pink #E0BAC7 / #C89398, Labels in Brown) */}
        <div className="mt-1 space-y-1.5">
          <div className="text-[10px] text-[#442F2A]/80 font-bold tracking-widest uppercase font-pixel">
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
                <span className="text-[9px] text-[#442F2A] w-5 text-right font-bold shrink-0">{st.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Numbered Lore / Narrative Sections (Font in Brown) */}
        <div className="mt-2 space-y-3.5">
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
              <div className="text-xs text-[#442F2A] leading-[1.7] whitespace-pre-line">
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

  return (
    <div className="flex flex-col gap-6" id="character-profile-view">
      {/* Top Banner & Sub-Tabs Header */}
      <div className="pixel-card p-3 sm:p-3.5 bg-white relative">
        <div className="text-center">
          <h2 className="text-base font-pixel font-bold text-[#442F2A]">
            <span>CHARACTER PROFILE</span>
          </h2>
          <p className="text-[11px] font-pixel text-[#442F2A]/70 mt-0.5">
            青梅竹馬的戀愛方程式 ・ 爽朗二傳手 × 元氣攝影經理
          </p>
        </div>

        {isEditMode && (
          <button
            onClick={() => onEditSection(subTab === 'PERSONAL' ? 'profile' : 'coupleProfile')}
            className="pixel-btn px-2.5 py-1 text-xs font-pixel font-bold bg-[#E0BAC7] flex items-center gap-1 rounded absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer hover:bg-[#C89398] transition"
          >
            <Edit className="w-3 h-3" />
            <span className="hidden sm:inline">
              {subTab === 'PERSONAL' ? '修改人設檔案' : '編輯情侶檔案'}
            </span>
          </button>
        )}
      </div>

      {/* Sub-Tabs Switcher: 個人檔案 vs 情侶檔案 */}
      <div className="flex items-center justify-center gap-2.5">
        <button
          onClick={() => setSubTab('PERSONAL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-pixel font-bold border-2 transition cursor-pointer flex items-center gap-1.5 ${
            subTab === 'PERSONAL'
              ? 'bg-[#442F2A] text-[#FFF8F5] border-[#442F2A] shadow-md'
              : 'bg-[#FFF8F5] text-[#442F2A] border-[#442F2A] hover:bg-[#E0BAC7]/50'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>基本情報</span>
        </button>

        <button
          onClick={() => setSubTab('COUPLE')}
          className={`px-3 py-1.5 rounded-lg text-xs font-pixel font-bold border-2 transition cursor-pointer flex items-center gap-1.5 ${
            subTab === 'COUPLE'
              ? 'bg-[#442F2A] text-[#FFF8F5] border-[#442F2A] shadow-md'
              : 'bg-[#FFF8F5] text-[#442F2A] border-[#442F2A] hover:bg-[#E0BAC7]/50'
          }`}
        >
          <OverlappingHearts size="sm" />
          <span>菅緒檔案</span>
        </button>
      </div>

      {/* Sub-Tab 1: 個人檔案 (Character A and B in single column for max-w-lg) */}
      {subTab === 'PERSONAL' && (
        <div className="grid grid-cols-1 gap-5 items-start">
          <div>{renderCharacterCard(data.characterA, true)}</div>
          <div>{renderCharacterCard(data.characterB, false)}</div>
        </div>
      )}

      {/* Sub-Tab 2: 菅緒檔案 */}
      {subTab === 'COUPLE' && (
        <div className="pixel-card p-4 sm:p-6 bg-white border-3 border-[#442F2A] rounded-xl shadow-lg flex flex-col gap-4">
          {/* Quick Column Header */}
          <div className="grid grid-cols-3 gap-2 text-xs font-pixel font-bold text-[#442F2A] bg-[#FFF8F5] p-2.5 rounded-lg border border-[#442F2A]/20">
            <div className="flex items-center gap-1.5 text-[#442F2A]">
              <PixelHeart color="#442F2A" className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{data.characterA.name}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#9D5A64]">
              <PixelHeart color="#C89398" className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{data.characterB.name}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#442F2A]">
              <OverlappingHearts size="sm" />
              <span className="truncate">菅緒</span>
            </div>
          </div>

          {/* Couple Items List */}
          <div className="space-y-4">
            {coupleProfile.items.map((item, idx) => (
              <div
                key={item.id || idx}
                className="bg-[#FFF8F5] p-3.5 sm:p-4 rounded-xl border-2 border-[#442F2A] shadow-xs space-y-3 font-pixel text-xs"
              >
                {/* Item Category Title */}
                <div className="flex items-center justify-between border-b border-[#442F2A]/15 pb-2">
                  <span className="px-2.5 py-0.5 rounded bg-[#442F2A] text-[#FFF8F5] font-bold text-xs">
                    {item.category}
                  </span>
                  <span className="text-[10px] text-[#442F2A]/60 font-bold">#{idx + 1}</span>
                </div>

                {/* Values for A, B, and 菅緒 */}
                {(() => {
                  const hasSugaNana = Boolean(item.sugaNanaValue && item.sugaNanaValue.trim());
                  const noteA = item.charANote?.trim() || (!item.charBNote && !item.sugaNanaNote ? item.note?.trim() : '');
                  const noteB = item.charBNote?.trim();
                  const noteSugaNana = item.sugaNanaNote?.trim();

                  return (
                    <div className={`grid grid-cols-1 ${hasSugaNana ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-3`}>
                      {/* Character A: 菅原孝支 */}
                      <div className="bg-white p-3 rounded-lg border border-[#442F2A]/20 shadow-2xs flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 font-bold text-[#442F2A] mb-1.5">
                            <PixelHeart color="#442F2A" className="w-3.5 h-3.5 shrink-0" />
                            <span>{data.characterA.name}</span>
                          </div>
                          <div className="text-xs text-[#442F2A] leading-relaxed whitespace-pre-line">
                            {item.charAValue && item.charAValue.trim() ? (
                              item.charAValue
                            ) : (
                              <div className="inline-block bg-[#FFF8F5] border-2 border-[#442F2A] text-[#442F2A] px-3 py-1 rounded text-xs font-pixel font-bold">
                                ［ 敬請期待 ］
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 解讀 A (若無內容則不顯示) */}
                        {noteA ? (
                          <div className="bg-[#442F2A]/5 p-2 rounded border border-[#442F2A]/15 text-[11px] text-[#442F2A]/90 mt-2.5 leading-relaxed">
                            <span className="font-bold text-[#442F2A] mr-1">✦ 解讀：</span>
                            <span>{noteA}</span>
                          </div>
                        ) : null}
                      </div>

                      {/* Character B: 宮原七緒 */}
                      <div className="bg-[#F8EDF1] p-3 rounded-lg border border-[#E0BAC7] shadow-2xs flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 font-bold text-[#9D5A64] mb-1.5">
                            <PixelHeart color="#C89398" className="w-3.5 h-3.5 shrink-0" />
                            <span>{data.characterB.name}</span>
                          </div>
                          <div className="text-xs text-[#442F2A] leading-relaxed whitespace-pre-line">
                            {item.charBValue && item.charBValue.trim() ? (
                              item.charBValue
                            ) : (
                              <div className="inline-block bg-[#FFF8F5] border-2 border-[#442F2A] text-[#442F2A] px-3 py-1 rounded text-xs font-pixel font-bold">
                                ［ 敬請期待 ］
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 解讀 B (若無內容則不顯示) */}
                        {noteB ? (
                          <div className="bg-[#C89398]/15 p-2 rounded border border-[#C89398]/30 text-[11px] text-[#442F2A]/90 mt-2.5 leading-relaxed">
                            <span className="font-bold text-[#9D5A64] mr-1">✦ 解讀：</span>
                            <span>{noteB}</span>
                          </div>
                        ) : null}
                      </div>

                      {/* 菅緒 (假如沒有內容，菅緒這格就不顯示) */}
                      {hasSugaNana && (
                        <div className="bg-[#FFF8F5] p-3 rounded-lg border-2 border-[#E0BAC7] shadow-2xs flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-1.5 font-bold text-[#442F2A] mb-1.5">
                              <OverlappingHearts size="sm" />
                              <span>菅緒</span>
                            </div>
                            <div className="text-xs text-[#442F2A] leading-relaxed whitespace-pre-line font-medium">
                              {item.sugaNanaValue}
                            </div>
                          </div>

                          {/* 解讀 菅緒 (若無內容則不顯示) */}
                          {noteSugaNana ? (
                            <div className="bg-[#E0BAC7]/25 p-2 rounded border border-[#E0BAC7] text-[11px] text-[#442F2A]/90 mt-2.5 leading-relaxed">
                              <span className="font-bold text-[#442F2A] mr-1">✦ 解讀：</span>
                              <span>{noteSugaNana}</span>
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            ))}

            {coupleProfile.items.length === 0 && (
              <div className="flex items-center justify-center py-12">
                <div className="bg-[#FFF8F5] border-2 border-[#442F2A] rounded-lg px-8 py-5 text-center shadow-md font-pixel">
                  <span className="text-sm font-bold text-[#442F2A] tracking-wider">
                    ［ 敬請期待 ］
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Add Item Button in view (Edit mode only) */}
          {isEditMode && (
            <div className="text-center pt-2">
              <button
                onClick={() => onEditSection('coupleProfile')}
                className="pixel-btn px-4 py-2 bg-[#E0BAC7] text-[#442F2A] font-pixel font-bold text-xs rounded inline-flex items-center gap-1.5 cursor-pointer hover:bg-[#C89398] transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>新增 / 編輯菅緒檔案項目</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
