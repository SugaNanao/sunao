import React, { useState } from 'react';
import { CoupleSiteData, Character, CoupleProfileItem } from '../../types';
import { PixelHeart } from '../PixelHeart';
import { OverlappingHearts } from '../OverlappingHearts';
import { Edit, Sparkles, Plus, Quote, User, Users, Calendar, Sparkle, Heart } from 'lucide-react';
import { renderFormattedText } from '../../utils/textFormatter';
import { DEFAULT_COUPLE_DATA } from '../../data/defaultData';

interface CharacterProfileViewProps {
  data: CoupleSiteData;
  isEditMode: boolean;
  onEditSection: (section: string) => void;
  targetCharacter?: 'BOTH' | 'CHAR_A' | 'CHAR_B';
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
  targetCharacter,
}) => {
  const [subTab, setSubTab] = useState<'PERSONAL' | 'COUPLE'>('PERSONAL');

  const [selectedChar, setSelectedChar] = useState<'BOTH' | 'CHAR_A' | 'CHAR_B'>(
    targetCharacter || 'BOTH'
  );

  const [expandedTrivia, setExpandedTrivia] = useState<Record<string, boolean>>({});

  const toggleTrivia = (key: string) => {
    setExpandedTrivia((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  React.useEffect(() => {
    if (targetCharacter) {
      setSubTab('PERSONAL');
      setSelectedChar(targetCharacter);
    }
  }, [targetCharacter]);

  const coupleProfile = data.coupleProfile || {
    title: 'KOSHI × NANAO ・ COUPLE ARCHIVE',
    motto: '「月が星を照らすまで ・ 願歲月溫柔以待，願年少情深不負。」',
    verse: '爽朗與元氣的共鳴，傲嬌與直球的永恆方程式。',
    items: [],
  };

  // Render Detailed Character Dossier with the requested elements:
  // 1. 照片, 2. 姓名, 3. 一句引用金句 (棕色豎線｜), 4. 基本資料(高校３年現在), 5. 外貌描述, 6. 性格剖析(小段落與小標題), 7. 人際關係, 8. 冷知識(含對方的吐槽小視窗)
  const renderDetailedDossierCard = (char: Character, isA: boolean) => {
    const heartColor = isA ? '#442F2A' : '#C89398';
    const fallbackData = isA ? DEFAULT_COUPLE_DATA.characterA : DEFAULT_COUPLE_DATA.characterB;

    const quoteText = char.quote || fallbackData.quote;
    const appearanceText = char.appearance || fallbackData.appearance || '';
    const relationshipsText = char.relationships || fallbackData.relationships || '';

    // 1. 基本資料條列
    const basicInfoList: string[] =
      char.basicInfoList && char.basicInfoList.length > 0
        ? char.basicInfoList
        : isA
        ? [
            '烏野高校 ３年４組',
            '男子排球部副主將',
            '隊中位置｜舉球員（Ｓ）',
            '身高｜１７４.３ｃｍ',
            '體重｜６３.５ｋｇ',
            '誕生日｜６月１３日',
            '好物｜激辛麻婆豆腐',
            '最近的煩惱｜有很多後輩的個頭都比自己高',
          ]
        : [
            '烏野高校 ３年４組',
            '男子排球部經理兼攝影',
            '身高｜１６０ｃｍ',
            '體重｜秘密 (約４５ｋｇ)',
            '誕生日｜４月１２日',
            '好物｜草莓大福・水果千層',
            '最近的煩惱｜某人經常趁自己專注拍照時偷戳臉頰',
          ];

    // 2. 性格剖析段落列表
    const personalityParagraphs =
      char.personalityParagraphs && char.personalityParagraphs.length > 0
        ? char.personalityParagraphs
        : fallbackData.personalityParagraphs || [
            {
              id: 'p1',
              title: isA ? '爽朗溫和的外表與定海神針' : '夏日午後般溫暖燦爛的小太陽',
              content:
                char.personalityAnalysis ||
                char.personality ||
                fallbackData.personalityAnalysis ||
                '',
            },
          ];

    // 3. 冷知識列表 (含吐槽小視窗)
    const triviaItems =
      char.triviaItems && char.triviaItems.length > 0
        ? char.triviaItems
        : fallbackData.triviaItems || [];

    return (
      <div className="pixel-card p-4 sm:p-5 bg-white border-2 border-[#442F2A] rounded-xl shadow-md flex flex-col gap-4.5 font-pixel">
        {/* 1 & 2 & 3. 照片、姓名與一句引用金句 */}
        <div className="flex flex-col sm:flex-row items-start gap-4 pb-3 border-b border-[#442F2A]/15">
          {/* 1. 照片 */}
          <div className="shrink-0 w-28 sm:w-32 self-center sm:self-start">
            <div className="w-full h-40 sm:h-44 rounded-xl overflow-hidden bg-[#F8EDF1] border-2 border-[#442F2A] shadow-xs relative group">
              <img
                src={char.avatar}
                alt={char.name}
                className="w-full h-full object-cover filter contrast-105 group-hover:scale-103 transition duration-300"
              />
            </div>
          </div>

          {/* 2 & 3. 姓名與引用金句 */}
          <div className="flex-1 min-w-0 flex flex-col justify-center self-stretch">
            <div>
              {/* 2. 姓名 (無額外身份稱號標籤) */}
              <div className="flex items-center gap-2 flex-wrap">
                <PixelHeart color={heartColor} className="w-4 h-4 shrink-0" />
                <h3 className="font-pixel font-bold text-lg sm:text-xl text-[#442F2A]">
                  {char.name}
                </h3>
                {char.romajiName && (
                  <span className="text-xs font-pixel text-[#442F2A]/60">
                    ({char.romajiName})
                  </span>
                )}
              </div>

              {/* 3. 一句引用金句 (前方棕色豎線｜) */}
              <div className="border-l-[3px] border-[#442F2A] pl-3 py-1.5 bg-[#FFF8F5]/80 rounded-r-lg my-2.5">
                <p className="font-bold text-[#442F2A] text-xs sm:text-[13px] leading-[1.7] whitespace-pre-line">
                  {renderFormattedText(quoteText)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 4. 基本資料 (高校３年現在) - 僅展示指定清單，有小標題才加，其餘不在清單內的內容全數刪除 */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 border-b border-[#442F2A]/20 pb-1">
            <span className="w-2 h-2 rounded-full bg-[#442F2A]" />
            <h4 className="font-bold text-xs sm:text-sm text-[#442F2A] tracking-wide">
              基本資料 (高校３年現在)
            </h4>
          </div>

          <div className="bg-[#FFF8F5] p-3 sm:p-3.5 rounded-lg border border-[#442F2A]/15 divide-y divide-[#442F2A]/10">
            {basicInfoList.map((item, idx) => {
              // 判斷是否包含小標題分隔符 ｜ 或 |
              const match = item.split(/[｜|]/);
              if (match.length >= 2) {
                const label = match[0].trim();
                const val = match.slice(1).join('｜').trim();
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 py-2 first:pt-0 last:pb-0 text-xs sm:text-[13px]"
                  >
                    <span className="font-bold text-[#442F2A] shrink-0 min-w-[75px] sm:min-w-[85px] tracking-wide">
                      {label}
                    </span>
                    <span className="text-[#442F2A]/35 shrink-0 select-none">｜</span>
                    <span className="font-normal text-[#442F2A] flex-1 leading-relaxed">
                      {val}
                    </span>
                  </div>
                );
              }

              // 沒有小標題的項目直接展示 (圓點清單，內文字體大小，不加粗)
              const cleanItem = item.replace(/^[•·・\s]+/, '');
              return (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 py-2 first:pt-0 last:pb-0 text-xs sm:text-[13px] text-[#442F2A]"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#442F2A] shrink-0" />
                  <span className="font-normal text-[#442F2A] flex-1 leading-relaxed">
                    {cleanItem}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. 外貌描述 */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 border-b border-[#442F2A]/20 pb-1">
            <span className="w-2 h-2 rounded-full bg-[#442F2A]" />
            <h4 className="font-bold text-xs sm:text-sm text-[#442F2A] tracking-wide">
              外貌描述
            </h4>
          </div>
          <div className="bg-[#FFF8F5] p-3 rounded-lg border border-[#442F2A]/15 text-xs sm:text-[13px] text-[#442F2A] leading-relaxed whitespace-pre-line">
            {renderFormattedText(appearanceText)}
          </div>
        </div>

        {/* 6. 性格剖析 (多個小段落與小標題) */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 border-b border-[#442F2A]/20 pb-1">
            <span className="w-2 h-2 rounded-full bg-[#442F2A]" />
            <h4 className="font-bold text-xs sm:text-sm text-[#442F2A] tracking-wide">
              性格剖析
            </h4>
          </div>

          <div className="space-y-2.5">
            {personalityParagraphs.map((para, pIdx) => (
              <div
                key={para.id || pIdx}
                className="bg-[#FFF8F5] p-3 rounded-lg border border-[#442F2A]/15 space-y-1"
              >
                <div className="flex items-center gap-1.5 font-bold text-xs sm:text-[13px] text-[#442F2A]">
                  <span className="text-[#C89398] font-mono text-sm">✦</span>
                  <span className="tracking-wide">{para.title}</span>
                </div>
                <div className="text-xs sm:text-[13px] text-[#442F2A] leading-relaxed whitespace-pre-line pl-3.5 sm:pl-4 font-normal">
                  {renderFormattedText(para.content)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 7. 人際關係 */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 border-b border-[#442F2A]/20 pb-1">
            <span className="w-2 h-2 rounded-full bg-[#442F2A]" />
            <h4 className="font-bold text-xs sm:text-sm text-[#442F2A] tracking-wide">
              人際關係
            </h4>
          </div>
          <div className="bg-[#FFF8F5] p-3 rounded-lg border border-[#442F2A]/15 text-xs sm:text-[13px] text-[#442F2A] leading-relaxed whitespace-pre-line space-y-1 font-normal">
            {renderFormattedText(relationshipsText)}
          </div>
        </div>

        {/* 8. 冷知識 (含對方的吐槽小視窗) */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 border-b border-[#442F2A]/20 pb-1">
            <span className="w-2 h-2 rounded-full bg-[#442F2A]" />
            <h4 className="font-bold text-xs sm:text-sm text-[#442F2A] tracking-wide">
              冷知識
            </h4>
          </div>

          <div className="space-y-2.5">
            {triviaItems.map((tItem, tIdx) => {
              // 誰吐槽就用代表色像素愛心開頭，字體顏色與愛心一致
              const commenterColor = isA ? '#C89398' : '#442F2A';
              const hasComment = Boolean(tItem.comment && tItem.comment.trim());
              const triviaKey = `${isA ? 'charA' : 'charB'}-${tItem.id || tIdx}`;
              const isCommentExpanded = Boolean(expandedTrivia[triviaKey]);

              return (
                <div
                  key={tItem.id || tIdx}
                  className="bg-[#FFF8F5] p-3 rounded-lg border border-[#442F2A]/15 flex flex-col md:flex-row items-start justify-between gap-2.5 md:gap-4"
                >
                  {/* 冷知識本體 */}
                  <div className="flex-1 text-xs sm:text-[13px] text-[#442F2A] leading-relaxed flex items-start gap-2 font-normal">
                    <span className="text-[#C89398] font-bold shrink-0 mt-0.5">✦</span>
                    <span className="flex-1">{renderFormattedText(tItem.fact)}</span>
                  </div>

                  {/* 對方的吐槽：預設只有像素愛心，點愛心後在愛心右邊展開吐槽框(不是浮窗) */}
                  {hasComment && (
                    <div className="flex items-start gap-1.5 shrink-0 max-w-full md:max-w-[340px] mt-1 md:mt-0">
                      <button
                        type="button"
                        onClick={() => toggleTrivia(triviaKey)}
                        className={`p-1 rounded-md transition-all duration-200 cursor-pointer flex items-center justify-center shrink-0 ${
                          isCommentExpanded
                            ? 'bg-[#442F2A]/10 scale-105'
                            : 'hover:bg-[#442F2A]/5 hover:scale-120 active:scale-95'
                        }`}
                        title={isCommentExpanded ? '點擊收合吐槽' : '點擊展開吐槽'}
                        aria-expanded={isCommentExpanded}
                        aria-label={isCommentExpanded ? '收合吐槽' : '展開吐槽'}
                      >
                        <PixelHeart
                          color={commenterColor}
                          className="w-3.5 h-3.5"
                        />
                      </button>

                      {isCommentExpanded && (
                        <div
                          className="bg-white border rounded-lg px-2.5 py-1.5 shadow-2xs text-xs font-pixel transition-all duration-200"
                          style={{
                            borderColor: isA ? '#C8939860' : '#442F2A35',
                          }}
                        >
                          <span
                            className="text-[11px] sm:text-xs font-normal leading-relaxed break-words block"
                            style={{ color: commenterColor }}
                          >
                            {tItem.comment}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
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

      {/* Sub-Tab 1: 基本情報 (包含 照片, 姓名, 一句引用金句(棕色豎線｜), 基本資料(高校３年現在), 外貌描述, 性格剖析, 人際關係, 冷知識) */}
      {subTab === 'PERSONAL' && (
        <div className="space-y-4">
          {/* Character Selector Toggle */}
          <div className="flex items-center justify-center gap-2 p-1.5 bg-white border-2 border-[#442F2A] rounded-xl shadow-xs font-pixel">
            <button
              onClick={() => setSelectedChar('BOTH')}
              className={`px-3 py-1 text-xs rounded-lg transition font-bold cursor-pointer ${
                selectedChar === 'BOTH'
                  ? 'bg-[#442F2A] text-[#FFF8F5] shadow-xs'
                  : 'text-[#442F2A] hover:bg-[#FFF8F5]'
              }`}
            >
              兩人全覽
            </button>
            <button
              onClick={() => setSelectedChar('CHAR_A')}
              className={`px-3 py-1 text-xs rounded-lg transition font-bold cursor-pointer flex items-center gap-1.5 ${
                selectedChar === 'CHAR_A'
                  ? 'bg-[#442F2A] text-[#FFF8F5] shadow-xs'
                  : 'text-[#442F2A] hover:bg-[#FFF8F5]'
              }`}
            >
              <PixelHeart color={selectedChar === 'CHAR_A' ? '#FFF8F5' : '#442F2A'} className="w-3 h-3" />
              <span>{data.characterA.name}</span>
            </button>
            <button
              onClick={() => setSelectedChar('CHAR_B')}
              className={`px-3 py-1 text-xs rounded-lg transition font-bold cursor-pointer flex items-center gap-1.5 ${
                selectedChar === 'CHAR_B'
                  ? 'bg-[#442F2A] text-[#FFF8F5] shadow-xs'
                  : 'text-[#442F2A] hover:bg-[#FFF8F5]'
              }`}
            >
              <PixelHeart color={selectedChar === 'CHAR_B' ? '#FFF8F5' : '#C89398'} className="w-3 h-3" />
              <span>{data.characterB.name}</span>
            </button>
          </div>

          {/* Render Dossier Cards */}
          <div className="grid grid-cols-1 gap-6 items-start">
            {(selectedChar === 'BOTH' || selectedChar === 'CHAR_A') && (
              <div>{renderDetailedDossierCard(data.characterA, true)}</div>
            )}
            {(selectedChar === 'BOTH' || selectedChar === 'CHAR_B') && (
              <div>{renderDetailedDossierCard(data.characterB, false)}</div>
            )}
          </div>
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
                            <span className="font-bold text-[#C89398] mr-1">✦</span>
                            <span className="font-bold text-[#442F2A] mr-1">解讀：</span>
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
                            <span className="font-bold text-[#C89398] mr-1">✦</span>
                            <span className="font-bold text-[#9D5A64] mr-1">解讀：</span>
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
                              <span className="font-bold text-[#C89398] mr-1">✦</span>
                              <span className="font-bold text-[#442F2A] mr-1">解讀：</span>
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
