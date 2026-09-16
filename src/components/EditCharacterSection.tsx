import React from 'react';
import {
  Character,
  ColorSwatch,
  CharacterStatus,
  CharacterSection,
  PersonalityParagraph,
  CharacterTriviaItem,
  ProfileBulletItem,
} from '../types';
import { PixelHeart } from './PixelHeart';
import { Plus, Trash2, Upload, Palette, Sliders, FileText, User, MessageSquare, Sparkles, Move, ZoomIn, RotateCcw } from 'lucide-react';
import { DEFAULT_COUPLE_DATA } from '../data/defaultData';
import { normalizeImageUrl, handleImageLoadError } from '../utils/imageOptimizer';

const getInitialBulletItems = (
  items?: ProfileBulletItem[],
  rawText?: string,
  fallbackItems: ProfileBulletItem[] = []
): ProfileBulletItem[] => {
  if (items && items.length > 0) return items;
  if (rawText && rawText.trim()) {
    const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length > 0) {
      return lines.map((line, idx) => {
        const clean = line.replace(/^[✦•·・\s]+/, '').trim();
        const match = clean.match(/^([^：:｜|]+)[：:｜|](.+)$/);
        if (match) {
          return {
            id: `bullet-${idx}`,
            title: match[1].trim(),
            content: match[2].trim(),
          };
        }
        return {
          id: `bullet-${idx}`,
          title: '',
          content: clean,
        };
      });
    }
  }
  return fallbackItems;
};

interface EditCharacterSectionProps {
  charKey: 'characterA' | 'characterB';
  charRoleLabel: string;
  themeColor: string;
  accentColor: string;
  character: Character;
  onUpdate: (updated: Character) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, cb: (url: string) => void) => void;
}

export const EditCharacterSection: React.FC<EditCharacterSectionProps> = ({
  charKey,
  charRoleLabel,
  themeColor,
  accentColor,
  character,
  onUpdate,
  handleFileUpload,
}) => {
  const swatches: ColorSwatch[] = character.swatches || [];
  const statusList: CharacterStatus[] = character.statusList || [];
  const sections: CharacterSection[] = character.sections || [];

  return (
    <div className="p-4 bg-white rounded-lg border-2 border-[#442F2A] space-y-4 shadow-sm">
      {/* Character Header Title */}
      <div className="border-b-2 border-[#442F2A]/20 pb-2 flex items-center justify-between">
        <h4 className="font-bold text-sm text-[#442F2A] flex items-center gap-2">
          <PixelHeart color={themeColor} className="w-4 h-4" />
          <span>
            {charRoleLabel}：{character.name || '未命名'} ({character.romajiName || 'Romaji'})
          </span>
        </h4>
        <span className="text-[10px] bg-[#F8EDF1] text-[#442F2A] px-2 py-0.5 rounded border border-[#442F2A]/30">
          {charKey === 'characterA' ? 'CHAR A' : 'CHAR B'}
        </span>
      </div>

      {/* 1. Identity & Avatar */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] font-bold text-[#442F2A]">中文姓名 (Name)：</label>
            <input
              type="text"
              value={character.name || ''}
              onChange={(e) => onUpdate({ ...character, name: e.target.value })}
              className="w-full bg-[#FFF8F5] border border-[#442F2A] rounded p-1.5 text-xs font-bold"
              placeholder="例：菅原孝支"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-[#442F2A]">英文拼音 (Romaji)：</label>
            <input
              type="text"
              value={character.romajiName || ''}
              onChange={(e) => onUpdate({ ...character, romajiName: e.target.value })}
              className="w-full bg-[#FFF8F5] border border-[#442F2A] rounded p-1.5 text-xs"
              placeholder="例：Sugawara Koshi"
            />
          </div>
        </div>

        {/* Avatar with Upload & Preview */}
        <div>
          <label className="block text-[11px] font-bold text-[#442F2A]">頭像 (Avatar URL 或 本機上傳)：</label>
          <div className="flex gap-2 items-center">
            <div className="w-12 h-12 rounded border-2 border-[#442F2A] overflow-hidden bg-neutral-100 shrink-0 shadow-xs">
              <img
                src={normalizeImageUrl(character.avatar)}
                alt="Avatar Preview"
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                onError={(e) => handleImageLoadError(e, character.avatar)}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 flex gap-1">
              <input
                type="text"
                value={character.avatar || ''}
                onChange={(e) => onUpdate({ ...character, avatar: normalizeImageUrl(e.target.value) })}
                className="flex-1 bg-[#FFF8F5] border border-[#442F2A] rounded p-1.5 text-xs truncate"
                placeholder="https://..."
              />
              <label className="pixel-btn px-2.5 py-1 bg-[#E0BAC7] hover:bg-[#d49bb0] rounded text-[11px] flex items-center gap-1 cursor-pointer shrink-0 font-bold">
                <Upload className="w-3 h-3" />
                <span>上傳</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, (url) => onUpdate({ ...character, avatar: url }))}
                />
              </label>
            </div>
          </div>
        </div>

        {/* 1.5 人物姓名區透明底圖片 (Transparent Corner Image & Position Controls) */}
        <div className="p-2.5 bg-[#FFF8F5] rounded border border-[#442F2A]/30 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-[#442F2A] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C89398]" />
              <span>人物姓名區透明底圖片 (Transparent Corner Image)：</span>
            </label>
            {character.cornerImage && (
              <span className="text-[10px] text-[#9D5A64] bg-[#F8EDF1] px-1.5 py-0.5 rounded font-pixel font-bold">
                ✓ 支援透明底 PNG
              </span>
            )}
          </div>
          <div className="p-2 bg-pink-50/80 border border-[#C89398]/50 rounded text-[10.5px] text-[#442F2A] flex items-center justify-between gap-2">
            <span>✨ <strong>想要上傳不只一張透明底貼圖？</strong> 請切換至編輯器頂部的【<strong>✨ 頁面裝飾貼圖</strong>】新分類，可自由新增多張並指派至任意分頁！</span>
          </div>
          <p className="text-[10px] text-[#442F2A]/70 leading-normal">
            ※ 放置於角色分頁中人物姓名與金句區塊的透明插圖（如 Q版人物/透明貼圖/代表小物，上傳 PNG 保持透明底，背景與網頁完全一致）
          </p>
          <div className="flex gap-2 items-center">
            {character.cornerImage ? (
              <div className="w-12 h-12 rounded border border-[#442F2A] overflow-hidden bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:6px_6px] bg-white shrink-0 shadow-xs flex items-center justify-center p-1">
                <img
                  src={normalizeImageUrl(character.cornerImage)}
                  alt="Corner Sticker"
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  onError={(e) => handleImageLoadError(e, character.cornerImage)}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded border border-dashed border-[#442F2A]/40 bg-white shrink-0 flex items-center justify-center text-[9px] text-[#442F2A]/40 text-center font-pixel">
                未設定
              </div>
            )}
            <div className="flex-1 flex gap-1">
              <input
                type="text"
                value={character.cornerImage || ''}
                onChange={(e) => onUpdate({ ...character, cornerImage: normalizeImageUrl(e.target.value) })}
                className="flex-1 bg-white border border-[#442F2A] rounded p-1.5 text-xs truncate"
                placeholder="https://... 或點擊上傳透明 PNG 圖片"
              />
              <label className="pixel-btn px-2.5 py-1 bg-[#E0BAC7] hover:bg-[#d49bb0] rounded text-[11px] flex items-center gap-1 cursor-pointer shrink-0 font-bold">
                <Upload className="w-3 h-3" />
                <span>上傳透明圖</span>
                <input
                  type="file"
                  accept="image/png,image/webp,image/svg+xml,image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, (url) => onUpdate({ ...character, cornerImage: url }))}
                />
              </label>
              {character.cornerImage && (
                <button
                  type="button"
                  onClick={() => onUpdate({
                    ...character,
                    cornerImage: '',
                    cornerImagePosition: 'bottom-right',
                    cornerImageScale: 100,
                    cornerImageOffsetX: 0,
                    cornerImageOffsetY: 0,
                  })}
                  className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs cursor-pointer"
                  title="清除圖片"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* 圖片擺放位置與大小微調控制項 (當有圖片時顯示) */}
          {character.cornerImage && (
            <div className="mt-2 pt-2 border-t border-[#442F2A]/15 bg-white/70 p-2.5 rounded-lg border border-[#442F2A]/15 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#442F2A] flex items-center gap-1">
                  <Move className="w-3 h-3 text-[#C89398]" />
                  <span>直接拖拽圖片位置與調節大小 (無需輸入座標)</span>
                </span>
                <button
                  type="button"
                  onClick={() =>
                    onUpdate({
                      ...character,
                      cornerImagePosition: 'bottom-right',
                      cornerImageScale: 100,
                      cornerImageOffsetX: 0,
                      cornerImageOffsetY: 0,
                    })
                  }
                  className="text-[10px] text-[#442F2A]/60 hover:text-[#442F2A] flex items-center gap-0.5 cursor-pointer underline"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>重設回原位</span>
                </button>
              </div>

              {/* 互動式直接拖拽畫布 (Requirement 4: 自行脫拽位置，不要用座標調節) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-[#442F2A]/80 font-bold">
                  <span className="flex items-center gap-1">
                    <span>🖱️ 按住圖片即可在下方框內自由拖曳擺放：</span>
                  </span>
                  <span className="text-[9px] font-normal text-[#442F2A]/60">
                    （在人設頁面亦可直接點住貼圖拖曳）
                  </span>
                </div>

                <div className="relative w-full h-44 bg-[#FDF7F4] rounded-lg border-2 border-dashed border-[#442F2A]/40 overflow-hidden select-none p-3 shadow-inner cursor-default">
                  {/* 模擬卡片背景文字 */}
                  <div className="opacity-25 pointer-events-none space-y-1.5 pt-1">
                    <div className="h-3.5 w-24 bg-[#442F2A]/40 rounded" />
                    <div className="h-2.5 w-48 bg-[#442F2A]/25 rounded" />
                    <div className="h-2.5 w-36 bg-[#442F2A]/20 rounded" />
                    <div className="h-8 w-56 bg-[#442F2A]/10 rounded border-l-2 border-[#442F2A]" />
                  </div>

                  {/* 自由拖拽的透明底圖片 */}
                  <div
                    onPointerDown={(e) => {
                      e.preventDefault();
                      const startX = e.clientX;
                      const startY = e.clientY;
                      const initX = character.cornerImageOffsetX || 0;
                      const initY = character.cornerImageOffsetY || 0;

                      const onMove = (moveEvent: PointerEvent) => {
                        const dx = moveEvent.clientX - startX;
                        const dy = moveEvent.clientY - startY;
                        onUpdate({
                          ...character,
                          cornerImageOffsetX: Math.round(initX + dx),
                          cornerImageOffsetY: Math.round(initY + dy),
                        });
                      };

                      const onUp = () => {
                        window.removeEventListener('pointermove', onMove);
                        window.removeEventListener('pointerup', onUp);
                      };

                      window.addEventListener('pointermove', onMove);
                      window.addEventListener('pointerup', onUp);
                    }}
                    className={`absolute select-none z-10 cursor-grab active:cursor-grabbing group ${
                      character.cornerImagePosition === 'top-right'
                        ? 'right-3 top-3'
                        : character.cornerImagePosition === 'top-left'
                        ? 'left-3 top-3'
                        : character.cornerImagePosition === 'bottom-left'
                        ? 'left-3 bottom-3'
                        : 'right-3 bottom-3'
                    }`}
                    style={{
                      transform: `translate(${character.cornerImageOffsetX || 0}px, ${character.cornerImageOffsetY || 0}px)`,
                      touchAction: 'none',
                    }}
                    title="按住滑鼠或觸控拖拽圖片至任意位置"
                  >
                    <div className="relative">
                      <img
                        src={character.cornerImage}
                        alt="corner-preview"
                        className="h-16 sm:h-20 w-auto object-contain pointer-events-none group-hover:drop-shadow-md drop-shadow-sm transition-transform"
                        style={{
                          backgroundColor: 'transparent',
                          transform: `scale(${(character.cornerImageScale || 100) / 100})`,
                        }}
                      />
                      <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#442F2A] text-white text-[9px] font-pixel px-1.5 py-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        ✥ 按住拖曳
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-1.5 left-2 text-[9px] font-pixel text-[#442F2A]/50 pointer-events-none">
                    ※ 點擊按住貼圖拖曳即可自訂擺放位置
                  </div>
                </div>
              </div>

              {/* 基準角落切換 + 尺寸大小縮放 */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1 border-t border-[#442F2A]/10">
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-[10px] font-bold text-[#442F2A]/80 shrink-0">基準角落：</span>
                  {[
                    { id: 'bottom-right', label: '右下' },
                    { id: 'bottom-left', label: '左下' },
                    { id: 'top-right', label: '右上' },
                    { id: 'top-left', label: '左上' },
                  ].map((pos) => {
                    const isSelected = (character.cornerImagePosition || 'bottom-right') === pos.id;
                    return (
                      <button
                        key={pos.id}
                        type="button"
                        onClick={() =>
                          onUpdate({
                            ...character,
                            cornerImagePosition: pos.id as any,
                            cornerImageOffsetX: 0,
                            cornerImageOffsetY: 0,
                          })
                        }
                        className={`px-2 py-0.5 rounded text-[10px] font-pixel border cursor-pointer ${
                          isSelected
                            ? 'bg-[#442F2A] text-white border-[#442F2A] font-bold'
                            : 'bg-white text-[#442F2A] border-[#442F2A]/30 hover:bg-[#F8EDF1]'
                        }`}
                      >
                        {pos.label}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 bg-[#FFF8F5] px-2 py-1 rounded border border-[#442F2A]/20">
                  <span className="text-[10px] font-bold text-[#442F2A] shrink-0 flex items-center gap-1">
                    <ZoomIn className="w-2.5 h-2.5 text-[#C89398]" />
                    <span>尺寸:</span>
                  </span>
                  <input
                    type="range"
                    min="60"
                    max="160"
                    step="5"
                    value={character.cornerImageScale ?? 100}
                    onChange={(e) =>
                      onUpdate({
                        ...character,
                        cornerImageScale: parseInt(e.target.value) || 100,
                      })
                    }
                    className="w-24 accent-[#C89398] cursor-pointer h-1.5 bg-neutral-200 rounded"
                  />
                  <span className="text-[10px] font-mono text-[#9D5A64] w-8 text-right">
                    {character.cornerImageScale ?? 100}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. 基本資料 (Dossier / Basic Info - English Labels Only as Requested) */}
      <div className="p-2.5 bg-[#FFF8F5] rounded border border-[#442F2A]/30 space-y-2">
        <span className="font-bold text-[11px] text-[#442F2A] flex items-center gap-1">
          <User className="w-3 h-3 text-[#C89398]" />
          <span>基本資料 (DOSSIER)</span>
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <div>
            <label className="block text-[10px] font-bold text-[#442F2A]">GENDER：</label>
            <input
              type="text"
              value={character.gender || ''}
              placeholder="男 / 女"
              onChange={(e) => onUpdate({ ...character, gender: e.target.value })}
              className="w-full bg-white border border-[#442F2A]/40 rounded p-1 text-xs"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#442F2A]">AGE：</label>
            <input
              type="text"
              value={character.age || ''}
              placeholder="17"
              onChange={(e) => onUpdate({ ...character, age: e.target.value })}
              className="w-full bg-white border border-[#442F2A]/40 rounded p-1 text-xs"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#442F2A]">OCCUPATION：</label>
            <input
              type="text"
              value={character.occupation || ''}
              placeholder="烏野高校 排球部"
              onChange={(e) => onUpdate({ ...character, occupation: e.target.value })}
              className="w-full bg-white border border-[#442F2A]/40 rounded p-1 text-xs"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#442F2A]">HEIGHT：</label>
            <input
              type="text"
              value={character.bodyType || character.height || ''}
              placeholder="174.3 cm"
              onChange={(e) => onUpdate({ ...character, bodyType: e.target.value, height: e.target.value })}
              className="w-full bg-white border border-[#442F2A]/40 rounded p-1 text-xs"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#442F2A]">BIRTHDAY：</label>
            <input
              type="text"
              value={character.birthday || ''}
              placeholder="06.13"
              onChange={(e) => onUpdate({ ...character, birthday: e.target.value })}
              className="w-full bg-white border border-[#442F2A]/40 rounded p-1 text-xs"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#442F2A]">CONSTELLATION：</label>
            <input
              type="text"
              value={character.constellation || ''}
              placeholder="雙子座 ♊"
              onChange={(e) => onUpdate({ ...character, constellation: e.target.value })}
              className="w-full bg-white border border-[#442F2A]/40 rounded p-1 text-xs"
            />
          </div>
        </div>
      </div>

      {/* 2.5 專屬詳細檔案 (金句、基本資料清單、外貌、性格剖析、人際關係、冷知識) */}
      <div className="p-2.5 bg-[#FFF8F5] rounded border border-[#442F2A]/30 space-y-3">
        <span className="font-bold text-[11px] text-[#442F2A] flex items-center gap-1">
          <FileText className="w-3 h-3 text-[#C89398]" />
          <span>詳細檔案設定 (金句・基本資料・外貌・性格剖析・人際・冷知識)</span>
        </span>

        {/* 文字排版小提示（刪除線、粗體、斜體） */}
        <div className="bg-white p-2.5 rounded-lg border border-[#442F2A]/20 space-y-1.5 text-xs">
          <div className="font-bold text-[11px] text-[#442F2A] flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[#C89398]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>內文排版語法支援（基本資料、外貌、性格、人際、冷知識皆通用）</span>
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[10px] text-[#442F2A]/85 leading-normal">
            <div className="bg-[#FFF8F5] p-1.5 rounded border border-[#442F2A]/15 flex items-center justify-between">
              <span>
                <strong className="line-through">刪除線</strong>：在字前後加 <code className="text-[#9D5A64] font-bold font-mono">~~</code>
              </span>
              <code className="text-[#9D5A64] bg-white px-1.5 py-0.5 rounded border border-[#442F2A]/10 font-bold">
                ~~劃掉文字~~
              </code>
            </div>
            <div className="bg-[#FFF8F5] p-1.5 rounded border border-[#442F2A]/15 flex items-center justify-between">
              <span>
                <strong>粗體</strong>：在字前後加 <code className="text-[#9D5A64] font-bold font-mono">**</code>
              </span>
              <code className="text-[#9D5A64] bg-white px-1.5 py-0.5 rounded border border-[#442F2A]/10 font-bold">
                **重點粗體**
              </code>
            </div>
            <div className="bg-[#FFF8F5] p-1.5 rounded border border-[#442F2A]/15 flex items-center justify-between">
              <span>
                <em className="italic">斜體</em>：在字前後加 <code className="text-[#9D5A64] font-bold font-mono">*</code>
              </span>
              <code className="text-[#9D5A64] bg-white px-1.5 py-0.5 rounded border border-[#442F2A]/10 font-bold">
                *文藝斜體*
              </code>
            </div>
            <div className="bg-[#FFF8F5] p-1.5 rounded border border-[#442F2A]/15 flex items-center justify-between">
              <span>
                <span>粉色星芒</span>：自動高亮星星
              </span>
              <code className="text-[#C89398] font-bold bg-white px-1.5 py-0.5 rounded border border-[#442F2A]/10">
                ✦
              </code>
            </div>
          </div>
        </div>

        {/* 1. 一句引用金句 */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[10px] font-bold text-[#442F2A]">
              一句引用金句 (Quote - 前方有棕色豎線)：
            </label>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  const val = character.quote || '';
                  onUpdate({ ...character, quote: val ? `${val} ~~刪除線~~` : '~~刪除線~~' });
                }}
                className="text-[9px] px-1.5 py-0.5 rounded bg-white border border-[#442F2A]/30 text-[#442F2A] hover:bg-[#E0BAC7]/40 cursor-pointer font-bold line-through"
                title="插入刪除線 (~~文字~~)"
              >
                S
              </button>
              <button
                type="button"
                onClick={() => {
                  const val = character.quote || '';
                  onUpdate({ ...character, quote: val ? `${val} **粗體**` : '**粗體**' });
                }}
                className="text-[9px] px-1.5 py-0.5 rounded bg-white border border-[#442F2A]/30 text-[#442F2A] hover:bg-[#E0BAC7]/40 cursor-pointer font-bold"
                title="插入粗體 (**文字**)"
              >
                B
              </button>
              <button
                type="button"
                onClick={() => {
                  const val = character.quote || '';
                  onUpdate({ ...character, quote: val ? `${val} *斜體*` : '*斜體*' });
                }}
                className="text-[9px] px-1.5 py-0.5 rounded bg-white border border-[#442F2A]/30 text-[#442F2A] hover:bg-[#E0BAC7]/40 cursor-pointer font-bold italic"
                title="插入斜體 (*文字*)"
              >
                I
              </button>
              <button
                type="button"
                onClick={() => {
                  const val = character.quote || '';
                  onUpdate({ ...character, quote: val ? `${val}✦` : '✦' });
                }}
                className="text-[9px] px-1.5 py-0.5 rounded bg-white border border-[#442F2A]/30 text-[#C89398] hover:bg-[#E0BAC7]/40 cursor-pointer font-bold"
                title="插入星芒 (✦)"
              >
                ✦
              </button>
            </div>
          </div>
          <textarea
            rows={2}
            value={character.quote || ''}
            placeholder="請輸入一句引用金句...（可點上方按鈕或手動輸入 ~~刪除線~~）"
            onChange={(e) => onUpdate({ ...character, quote: e.target.value })}
            className="w-full bg-white border border-[#442F2A]/40 rounded p-1.5 text-xs leading-relaxed"
          />
        </div>

        {/* 2. 基本資料清單 (高校３年現在) */}
        <div className="p-2 bg-white rounded border border-[#442F2A]/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#442F2A] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#C89398]" />
              <span>基本資料清單 (高校３年現在)</span>
            </span>
            <button
              type="button"
              onClick={() => {
                const existing = character.basicInfoList || (charKey === 'characterA' ? [
                  '烏野高校 ３年４組',
                  '男子排球部副主將',
                  '隊中位置｜舉球員（Ｓ）',
                  '身高｜１７４.３ｃｍ',
                  '體重｜６３.５ｋｇ',
                  '誕生日｜６月１３日',
                  '好物｜激辛麻婆豆腐',
                  '最近的煩惱｜有很多後輩的個頭都比自己高',
                ] : [
                  '烏野高校 ３年４組',
                  '男子排球部經理兼攝影',
                  '身高｜１６０ｃｍ',
                  '體重｜秘密 (約４５ｋｇ)',
                  '誕生日｜４月１２日',
                  '好物｜草莓大福・水果千層',
                  '最近的煩惱｜某人經常趁自己專注拍照時偷戳臉頰',
                ]);
                onUpdate({
                  ...character,
                  basicInfoList: [...existing, '新項目｜內容'],
                });
              }}
              className="text-[9px] bg-[#442F2A] text-white px-2 py-0.5 rounded font-bold hover:bg-[#C89398] transition flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-2.5 h-2.5" />
              <span>新增一項</span>
            </button>
          </div>
          <p className="text-[9px] text-[#442F2A]/70 leading-normal">
            提示：有小標題請使用「｜」隔開；想加刪除線請在文字兩側加「~~」（例：<code className="text-[#9D5A64]">體重｜秘密 ~~約45kg~~</code>），點右側 <span className="line-through font-bold">S</span> 按鈕可快速加入刪除線。
          </p>

          <div className="space-y-1.5">
            {(
              character.basicInfoList ||
              (charKey === 'characterA'
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
                  ])
            ).map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const current = [
                      ...(character.basicInfoList ||
                        (charKey === 'characterA'
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
                            ])),
                    ];
                    current[idx] = e.target.value;
                    onUpdate({ ...character, basicInfoList: current });
                  }}
                  className="flex-1 bg-[#FFF8F5] border border-[#442F2A]/30 rounded px-1.5 py-0.5 text-xs font-normal text-[#442F2A]"
                />
                <button
                  type="button"
                  onClick={() => {
                    const current = [
                      ...(character.basicInfoList ||
                        (charKey === 'characterA'
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
                            ])),
                    ];
                    const val = current[idx] || '';
                    current[idx] = val ? `${val} ~~刪除文字~~` : '項目｜~~刪除文字~~';
                    onUpdate({ ...character, basicInfoList: current });
                  }}
                  className="px-1.5 py-0.5 rounded bg-white border border-[#442F2A]/30 text-[#442F2A] hover:bg-[#E0BAC7]/40 cursor-pointer font-bold text-[10px] line-through shrink-0"
                  title="插入刪除線語法 (~~文字~~)"
                >
                  S
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const current = [
                      ...(character.basicInfoList ||
                        (charKey === 'characterA'
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
                            ])),
                    ];
                    current.splice(idx, 1);
                    onUpdate({ ...character, basicInfoList: current });
                  }}
                  className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                  title="刪除"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 3. 外貌描述 (列點：✦ + 粗體小標 + 內文) */}
        <div className="p-2 bg-white rounded border border-[#442F2A]/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#442F2A] flex items-center gap-1">
              <span className="text-[#C89398] font-bold">✦</span>
              <span>外貌描述 (列點：✦ + 粗體小標 + 內文)</span>
            </span>
            <button
              type="button"
              onClick={() => {
                const current = getInitialBulletItems(
                  character.appearanceItems,
                  character.appearance,
                  DEFAULT_COUPLE_DATA[charKey].appearanceItems || []
                );
                const nextList = [
                  ...current,
                  {
                    id: `app-${Date.now()}`,
                    title: '新小標',
                    content: '',
                  },
                ];
                onUpdate({
                  ...character,
                  appearanceItems: nextList,
                  appearance: nextList
                    .map((i) => (i.title ? `✦ ${i.title}：${i.content}` : `✦ ${i.content}`))
                    .join('\n'),
                });
              }}
              className="text-[9px] bg-[#442F2A] text-white px-2 py-0.5 rounded font-bold hover:bg-[#C89398] transition flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-2.5 h-2.5" />
              <span>新增外貌列點</span>
            </button>
          </div>

          <p className="text-[9px] text-[#442F2A]/70 leading-normal">
            提示：每點格式為「✦ + 粗體小標 + 內文」；粗體小標將以粗體顯示，內文支援格式化按鈕。
          </p>

          <div className="space-y-2.5">
            {getInitialBulletItems(
              character.appearanceItems,
              character.appearance,
              DEFAULT_COUPLE_DATA[charKey].appearanceItems || []
            ).map((item, aIdx) => (
              <div
                key={item.id || aIdx}
                className="p-2 bg-[#FFF8F5] rounded border border-[#442F2A]/20 space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-1">
                    <span className="text-[#C89398] font-bold text-xs">✦</span>
                    <span className="text-[10px] font-bold text-[#442F2A] shrink-0">粗體小標：</span>
                    <input
                      type="text"
                      value={item.title}
                      placeholder="例：髮型與五官"
                      onChange={(e) => {
                        const current = getInitialBulletItems(
                          character.appearanceItems,
                          character.appearance,
                          DEFAULT_COUPLE_DATA[charKey].appearanceItems || []
                        );
                        const list = [...current];
                        list[aIdx] = { ...list[aIdx], title: e.target.value };
                        onUpdate({
                          ...character,
                          appearanceItems: list,
                          appearance: list
                            .map((i) => (i.title ? `✦ ${i.title}：${i.content}` : `✦ ${i.content}`))
                            .join('\n'),
                        });
                      }}
                      className="flex-1 bg-white border border-[#442F2A]/30 rounded px-1.5 py-0.5 text-xs font-bold text-[#442F2A]"
                    />
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        const current = getInitialBulletItems(
                          character.appearanceItems,
                          character.appearance,
                          DEFAULT_COUPLE_DATA[charKey].appearanceItems || []
                        );
                        const list = [...current];
                        const val = list[aIdx].content || '';
                        list[aIdx] = {
                          ...list[aIdx],
                          content: val ? `${val} ~~刪除文字~~` : '~~刪除文字~~',
                        };
                        onUpdate({
                          ...character,
                          appearanceItems: list,
                          appearance: list
                            .map((i) => (i.title ? `✦ ${i.title}：${i.content}` : `✦ ${i.content}`))
                            .join('\n'),
                        });
                      }}
                      className="text-[9px] px-1.5 py-0.5 rounded bg-white border border-[#442F2A]/30 text-[#442F2A] hover:bg-[#E0BAC7]/40 cursor-pointer font-bold line-through"
                      title="插入刪除線"
                    >
                      S
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const current = getInitialBulletItems(
                          character.appearanceItems,
                          character.appearance,
                          DEFAULT_COUPLE_DATA[charKey].appearanceItems || []
                        );
                        const list = [...current];
                        const val = list[aIdx].content || '';
                        list[aIdx] = {
                          ...list[aIdx],
                          content: val ? `${val} **粗體**` : '**粗體**',
                        };
                        onUpdate({
                          ...character,
                          appearanceItems: list,
                          appearance: list
                            .map((i) => (i.title ? `✦ ${i.title}：${i.content}` : `✦ ${i.content}`))
                            .join('\n'),
                        });
                      }}
                      className="text-[9px] px-1.5 py-0.5 rounded bg-white border border-[#442F2A]/30 text-[#442F2A] hover:bg-[#E0BAC7]/40 cursor-pointer font-bold"
                      title="插入粗體"
                    >
                      B
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const current = getInitialBulletItems(
                          character.appearanceItems,
                          character.appearance,
                          DEFAULT_COUPLE_DATA[charKey].appearanceItems || []
                        );
                        const list = [...current];
                        const val = list[aIdx].content || '';
                        list[aIdx] = {
                          ...list[aIdx],
                          content: val ? `${val} *斜體*` : '*斜體*',
                        };
                        onUpdate({
                          ...character,
                          appearanceItems: list,
                          appearance: list
                            .map((i) => (i.title ? `✦ ${i.title}：${i.content}` : `✦ ${i.content}`))
                            .join('\n'),
                        });
                      }}
                      className="text-[9px] px-1.5 py-0.5 rounded bg-white border border-[#442F2A]/30 text-[#442F2A] hover:bg-[#E0BAC7]/40 cursor-pointer font-bold italic"
                      title="插入斜體"
                    >
                      I
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const current = getInitialBulletItems(
                          character.appearanceItems,
                          character.appearance,
                          DEFAULT_COUPLE_DATA[charKey].appearanceItems || []
                        );
                        const list = [...current];
                        list.splice(aIdx, 1);
                        onUpdate({
                          ...character,
                          appearanceItems: list,
                          appearance: list
                            .map((i) => (i.title ? `✦ ${i.title}：${i.content}` : `✦ ${i.content}`))
                            .join('\n'),
                        });
                      }}
                      className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                      title="刪除"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-[#442F2A]/80 mb-0.5">
                    內文說明：
                  </label>
                  <textarea
                    rows={2}
                    value={item.content}
                    placeholder="請輸入描述內文..."
                    onChange={(e) => {
                      const current = getInitialBulletItems(
                        character.appearanceItems,
                        character.appearance,
                        DEFAULT_COUPLE_DATA[charKey].appearanceItems || []
                      );
                      const list = [...current];
                      list[aIdx] = { ...list[aIdx], content: e.target.value };
                      onUpdate({
                        ...character,
                        appearanceItems: list,
                        appearance: list
                          .map((i) => (i.title ? `✦ ${i.title}：${i.content}` : `✦ ${i.content}`))
                          .join('\n'),
                      });
                    }}
                    className="w-full bg-white border border-[#442F2A]/30 rounded p-1.5 text-xs text-[#442F2A]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. 性格剖析 (多個小段落與小標題，可自由新增) */}
        <div className="p-2 bg-white rounded border border-[#442F2A]/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#442F2A] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#C89398]" />
              <span>性格剖析 (多個小段落與小標題)</span>
            </span>
            <button
              type="button"
              onClick={() => {
                const current = character.personalityParagraphs && character.personalityParagraphs.length > 0
                  ? [...character.personalityParagraphs]
                  : [
                      {
                        id: 'p1',
                        title: charKey === 'characterA' ? '爽朗溫和的外表與定海神針' : '夏日午後般溫暖燦爛的小太陽',
                        content: character.personalityAnalysis || character.personality || '',
                      },
                    ];
                onUpdate({
                  ...character,
                  personalityParagraphs: [
                    ...current,
                    {
                      id: `para-${Date.now()}`,
                      title: '新小標題',
                      content: '',
                    },
                  ],
                });
              }}
              className="text-[9px] bg-[#442F2A] text-white px-2 py-0.5 rounded font-bold hover:bg-[#C89398] transition flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-2.5 h-2.5" />
              <span>新增小段落</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {(character.personalityParagraphs && character.personalityParagraphs.length > 0
              ? character.personalityParagraphs
              : [
                  {
                    id: 'p1',
                    title: charKey === 'characterA' ? '爽朗溫和的外表與定海神針' : '夏日午後般溫暖燦爛的小太陽',
                    content: character.personalityAnalysis || character.personality || '',
                  },
                ]
            ).map((para, pIdx) => (
              <div
                key={para.id || pIdx}
                className="p-2 bg-[#FFF8F5] rounded border border-[#442F2A]/20 space-y-1.5"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#C89398] shrink-0">小標題：</span>
                  <input
                    type="text"
                    value={para.title}
                    placeholder="例：爽朗溫和的外表與定海神針"
                    onChange={(e) => {
                      const list = [
                        ...(character.personalityParagraphs || [
                          {
                            id: 'p1',
                            title: charKey === 'characterA' ? '爽朗溫和的外表與定海神針' : '夏日午後般溫暖燦爛的小太陽',
                            content: character.personalityAnalysis || character.personality || '',
                          },
                        ]),
                      ];
                      list[pIdx] = { ...list[pIdx], title: e.target.value };
                      onUpdate({ ...character, personalityParagraphs: list });
                    }}
                    className="flex-1 bg-white border border-[#442F2A]/30 rounded px-1.5 py-0.5 text-xs font-bold text-[#442F2A]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const list = [
                        ...(character.personalityParagraphs || [
                          {
                            id: 'p1',
                            title: charKey === 'characterA' ? '爽朗溫和的外表與定海神針' : '夏日午後般溫暖燦爛的小太陽',
                            content: character.personalityAnalysis || character.personality || '',
                          },
                        ]),
                      ];
                      list.splice(pIdx, 1);
                      onUpdate({ ...character, personalityParagraphs: list });
                    }}
                    className="text-red-500 hover:text-red-700 p-0.5 cursor-pointer"
                    title="刪除段落"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div>
                  <textarea
                    rows={2}
                    value={para.content}
                    placeholder="請輸入段落內容..."
                    onChange={(e) => {
                      const list = [
                        ...(character.personalityParagraphs || [
                          {
                            id: 'p1',
                            title: charKey === 'characterA' ? '爽朗溫和的外表與定海神針' : '夏日午後般溫暖燦爛的小太陽',
                            content: character.personalityAnalysis || character.personality || '',
                          },
                        ]),
                      ];
                      list[pIdx] = { ...list[pIdx], content: e.target.value };
                      onUpdate({ ...character, personalityParagraphs: list });
                    }}
                    className="w-full bg-white border border-[#442F2A]/30 rounded p-1.5 text-xs leading-relaxed"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. 人際關係 (列點：✦ + 粗體小標 + 內文) */}
        <div className="p-2 bg-white rounded border border-[#442F2A]/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#442F2A] flex items-center gap-1">
              <span className="text-[#C89398] font-bold">✦</span>
              <span>人際關係 (列點：✦ + 粗體小標 + 內文)</span>
            </span>
            <button
              type="button"
              onClick={() => {
                const current = getInitialBulletItems(
                  character.relationshipItems,
                  character.relationships,
                  DEFAULT_COUPLE_DATA[charKey].relationshipItems || []
                );
                const nextList = [
                  ...current,
                  {
                    id: `rel-${Date.now()}`,
                    title: '新關係人',
                    content: '',
                  },
                ];
                onUpdate({
                  ...character,
                  relationshipItems: nextList,
                  relationships: nextList
                    .map((i) => (i.title ? `✦ ${i.title}：${i.content}` : `✦ ${i.content}`))
                    .join('\n'),
                });
              }}
              className="text-[9px] bg-[#442F2A] text-white px-2 py-0.5 rounded font-bold hover:bg-[#C89398] transition flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-2.5 h-2.5" />
              <span>新增人際列點</span>
            </button>
          </div>

          <p className="text-[9px] text-[#442F2A]/70 leading-normal">
            提示：每點格式為「✦ + 粗體小標 + 內文」；粗體小標將以粗體顯示，內文支援格式化按鈕。
          </p>

          <div className="space-y-2.5">
            {getInitialBulletItems(
              character.relationshipItems,
              character.relationships,
              DEFAULT_COUPLE_DATA[charKey].relationshipItems || []
            ).map((item, rIdx) => (
              <div
                key={item.id || rIdx}
                className="p-2 bg-[#FFF8F5] rounded border border-[#442F2A]/20 space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-1">
                    <span className="text-[#C89398] font-bold text-xs">✦</span>
                    <span className="text-[10px] font-bold text-[#442F2A] shrink-0">粗體小標：</span>
                    <input
                      type="text"
                      value={item.title}
                      placeholder="例：澤村大地 / 東峰旭"
                      onChange={(e) => {
                        const current = getInitialBulletItems(
                          character.relationshipItems,
                          character.relationships,
                          DEFAULT_COUPLE_DATA[charKey].relationshipItems || []
                        );
                        const list = [...current];
                        list[rIdx] = { ...list[rIdx], title: e.target.value };
                        onUpdate({
                          ...character,
                          relationshipItems: list,
                          relationships: list
                            .map((i) => (i.title ? `✦ ${i.title}：${i.content}` : `✦ ${i.content}`))
                            .join('\n'),
                        });
                      }}
                      className="flex-1 bg-white border border-[#442F2A]/30 rounded px-1.5 py-0.5 text-xs font-bold text-[#442F2A]"
                    />
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        const current = getInitialBulletItems(
                          character.relationshipItems,
                          character.relationships,
                          DEFAULT_COUPLE_DATA[charKey].relationshipItems || []
                        );
                        const list = [...current];
                        const val = list[rIdx].content || '';
                        list[rIdx] = {
                          ...list[rIdx],
                          content: val ? `${val} ~~刪除文字~~` : '~~刪除文字~~',
                        };
                        onUpdate({
                          ...character,
                          relationshipItems: list,
                          relationships: list
                            .map((i) => (i.title ? `✦ ${i.title}：${i.content}` : `✦ ${i.content}`))
                            .join('\n'),
                        });
                      }}
                      className="text-[9px] px-1.5 py-0.5 rounded bg-white border border-[#442F2A]/30 text-[#442F2A] hover:bg-[#E0BAC7]/40 cursor-pointer font-bold line-through"
                      title="插入刪除線"
                    >
                      S
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const current = getInitialBulletItems(
                          character.relationshipItems,
                          character.relationships,
                          DEFAULT_COUPLE_DATA[charKey].relationshipItems || []
                        );
                        const list = [...current];
                        const val = list[rIdx].content || '';
                        list[rIdx] = {
                          ...list[rIdx],
                          content: val ? `${val} **粗體**` : '**粗體**',
                        };
                        onUpdate({
                          ...character,
                          relationshipItems: list,
                          relationships: list
                            .map((i) => (i.title ? `✦ ${i.title}：${i.content}` : `✦ ${i.content}`))
                            .join('\n'),
                        });
                      }}
                      className="text-[9px] px-1.5 py-0.5 rounded bg-white border border-[#442F2A]/30 text-[#442F2A] hover:bg-[#E0BAC7]/40 cursor-pointer font-bold"
                      title="插入粗體"
                    >
                      B
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const current = getInitialBulletItems(
                          character.relationshipItems,
                          character.relationships,
                          DEFAULT_COUPLE_DATA[charKey].relationshipItems || []
                        );
                        const list = [...current];
                        const val = list[rIdx].content || '';
                        list[rIdx] = {
                          ...list[rIdx],
                          content: val ? `${val} *斜體*` : '*斜體*',
                        };
                        onUpdate({
                          ...character,
                          relationshipItems: list,
                          relationships: list
                            .map((i) => (i.title ? `✦ ${i.title}：${i.content}` : `✦ ${i.content}`))
                            .join('\n'),
                        });
                      }}
                      className="text-[9px] px-1.5 py-0.5 rounded bg-white border border-[#442F2A]/30 text-[#442F2A] hover:bg-[#E0BAC7]/40 cursor-pointer font-bold italic"
                      title="插入斜體"
                    >
                      I
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const current = getInitialBulletItems(
                          character.relationshipItems,
                          character.relationships,
                          DEFAULT_COUPLE_DATA[charKey].relationshipItems || []
                        );
                        const list = [...current];
                        list.splice(rIdx, 1);
                        onUpdate({
                          ...character,
                          relationshipItems: list,
                          relationships: list
                            .map((i) => (i.title ? `✦ ${i.title}：${i.content}` : `✦ ${i.content}`))
                            .join('\n'),
                        });
                      }}
                      className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                      title="刪除"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-[#442F2A]/80 mb-0.5">
                    關係說明內文：
                  </label>
                  <textarea
                    rows={2}
                    value={item.content}
                    placeholder="請輸入關係說明內文..."
                    onChange={(e) => {
                      const current = getInitialBulletItems(
                        character.relationshipItems,
                        character.relationships,
                        DEFAULT_COUPLE_DATA[charKey].relationshipItems || []
                      );
                      const list = [...current];
                      list[rIdx] = { ...list[rIdx], content: e.target.value };
                      onUpdate({
                        ...character,
                        relationshipItems: list,
                        relationships: list
                          .map((i) => (i.title ? `✦ ${i.title}：${i.content}` : `✦ ${i.content}`))
                          .join('\n'),
                      });
                    }}
                    className="w-full bg-white border border-[#442F2A]/30 rounded p-1.5 text-xs text-[#442F2A]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6. 冷知識 (含對方的吐槽小視窗，可自由新增) */}
        <div className="p-2 bg-white rounded border border-[#442F2A]/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#442F2A] flex items-center gap-1">
              <MessageSquare className="w-3 h-3 text-[#C89398]" />
              <span>冷知識列表 (含對方的代表色愛心吐槽)</span>
            </span>
            <button
              type="button"
              onClick={() => {
                const current = character.triviaItems && character.triviaItems.length > 0
                  ? [...character.triviaItems]
                  : [];
                onUpdate({
                  ...character,
                  triviaItems: [
                    ...current,
                    {
                      id: `trivia-${Date.now()}`,
                      fact: '',
                      comment: '',
                      commenterName: charKey === 'characterA' ? '七緒' : '孝支',
                    },
                  ],
                });
              }}
              className="text-[9px] bg-[#442F2A] text-white px-2 py-0.5 rounded font-bold hover:bg-[#C89398] transition flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-2.5 h-2.5" />
              <span>新增冷知識</span>
            </button>
          </div>
          <p className="text-[9px] text-[#442F2A]/70 leading-normal">
            提示：對方的吐槽為選填。填寫後會以對方的代表色像素愛心開頭直接呈現吐槽，愛心與內文不分行且字體同色；留空則僅單純展示冷知識。
          </p>

          <div className="space-y-2.5">
            {(character.triviaItems && character.triviaItems.length > 0
              ? character.triviaItems
              : []
            ).map((item, tIdx) => (
              <div
                key={item.id || tIdx}
                className="p-2 bg-[#FFF8F5] rounded border border-[#442F2A]/20 space-y-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-[#442F2A] mb-0.5">
                      冷知識內容 (Fact)：
                    </label>
                    <textarea
                      rows={2}
                      value={item.fact}
                      placeholder="例：無辣不歡，極度熱愛超辣麻婆豆腐..."
                      onChange={(e) => {
                        const list = [...(character.triviaItems || [])];
                        list[tIdx] = { ...list[tIdx], fact: e.target.value };
                        onUpdate({ ...character, triviaItems: list });
                      }}
                      className="w-full bg-white border border-[#442F2A]/30 rounded p-1.5 text-xs leading-relaxed"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const list = [...(character.triviaItems || [])];
                      list.splice(tIdx, 1);
                      onUpdate({ ...character, triviaItems: list });
                    }}
                    className="text-red-500 hover:text-red-700 p-1 cursor-pointer mt-3"
                    title="刪除"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-1.5 bg-white rounded border border-[#442F2A]/15 space-y-1">
                  <div className="flex items-center gap-1.5 text-[9px] font-bold">
                    <PixelHeart
                      color={charKey === 'characterA' ? '#C89398' : '#442F2A'}
                      className="w-2.5 h-2.5 shrink-0"
                    />
                    <span style={{ color: charKey === 'characterA' ? '#C89398' : '#442F2A' }}>
                      {charKey === 'characterA' ? '七緒' : '孝支'}的吐槽 (選填)：
                    </span>
                    <span className="text-[#442F2A]/40 font-normal text-[8px]">
                      (前綴代表色愛心直接吐槽，字體同色不分行)
                    </span>
                  </div>
                  <input
                    type="text"
                    value={item.comment || ''}
                    placeholder={`輸入${charKey === 'characterA' ? '七緒' : '孝支'}的吐槽（留空則不顯示）...`}
                    onChange={(e) => {
                      const list = [...(character.triviaItems || [])];
                      list[tIdx] = { ...list[tIdx], comment: e.target.value };
                      onUpdate({ ...character, triviaItems: list });
                    }}
                    className="w-full bg-[#FFF8F5] border border-[#442F2A]/20 rounded p-1 text-xs text-[#442F2A]"
                  />
                </div>
              </div>
            ))}
            {(!character.triviaItems || character.triviaItems.length === 0) && (
              <div className="text-center py-2 text-xs text-[#442F2A]/50 bg-[#FFF8F5] rounded border border-dashed border-[#442F2A]/20">
                尚未新增冷知識，點擊上方按鈕即可新增！
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Color Swatches (色票設定) */}
      <div className="p-2.5 bg-[#FFF8F5] rounded border border-[#442F2A]/30 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-[11px] text-[#442F2A] flex items-center gap-1">
            <Palette className="w-3 h-3 text-[#C89398]" />
            <span>色票代表色 (COLOR SWATCHES)</span>
          </span>
          <button
            type="button"
            onClick={() => {
              const newSwatch: ColorSwatch = {
                label: 'NEW',
                color: '新代表色',
                colorCode: '#A08080',
              };
              onUpdate({ ...character, swatches: [...swatches, newSwatch] });
            }}
            className="pixel-btn px-2 py-0.5 bg-[#E0BAC7] hover:bg-[#d49bb0] rounded text-[10px] flex items-center gap-1 font-bold cursor-pointer"
          >
            <Plus className="w-2.5 h-2.5" />
            <span>新增色票</span>
          </button>
        </div>

        {swatches.length === 0 ? (
          <p className="text-[10px] text-[#442F2A]/50 italic">尚未設定色票，點選右上方按鈕新增</p>
        ) : (
          <div className="space-y-1.5">
            {swatches.map((sw, idx) => (
              <div key={idx} className="flex items-center gap-1.5 bg-white p-1 rounded border border-[#442F2A]/20">
                <input
                  type="color"
                  value={sw.colorCode.startsWith('#') ? sw.colorCode : '#8E8D8A'}
                  onChange={(e) => {
                    const next = [...swatches];
                    next[idx].colorCode = e.target.value;
                    onUpdate({ ...character, swatches: next });
                  }}
                  className="w-6 h-6 border border-[#442F2A] rounded cursor-pointer p-0 shrink-0"
                  title="選擇色票顏色"
                />
                <input
                  type="text"
                  value={sw.label}
                  placeholder="標籤 (如 HAIR)"
                  onChange={(e) => {
                    const next = [...swatches];
                    next[idx].label = e.target.value;
                    onUpdate({ ...character, swatches: next });
                  }}
                  className="w-16 bg-[#FFF8F5] border border-[#442F2A]/30 rounded px-1 py-0.5 text-[10px] font-bold uppercase"
                />
                <input
                  type="text"
                  value={sw.color}
                  placeholder="顏色名稱"
                  onChange={(e) => {
                    const next = [...swatches];
                    next[idx].color = e.target.value;
                    onUpdate({ ...character, swatches: next });
                  }}
                  className="flex-1 bg-[#FFF8F5] border border-[#442F2A]/30 rounded px-1 py-0.5 text-[10px]"
                />
                <input
                  type="text"
                  value={sw.colorCode}
                  placeholder="#HEX"
                  onChange={(e) => {
                    const next = [...swatches];
                    next[idx].colorCode = e.target.value;
                    onUpdate({ ...character, swatches: next });
                  }}
                  className="w-18 bg-[#FFF8F5] border border-[#442F2A]/30 rounded px-1 py-0.5 text-[10px] font-mono"
                />
                <button
                  type="button"
                  onClick={() => {
                    const next = swatches.filter((_, i) => i !== idx);
                    onUpdate({ ...character, swatches: next });
                  }}
                  className="text-[#C89398] hover:text-red-700 p-0.5 cursor-pointer shrink-0"
                  title="刪除色票"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. STATUS Bars (數值狀態條) */}
      <div className="p-2.5 bg-[#FFF8F5] rounded border border-[#442F2A]/30 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-[11px] text-[#442F2A] flex items-center gap-1">
            <Sliders className="w-3 h-3 text-[#C89398]" />
            <span>STATUS 數值條設定</span>
          </span>
          <button
            type="button"
            onClick={() => {
              const newStatus: CharacterStatus = {
                label: '新數值',
                value: 80,
              };
              onUpdate({ ...character, statusList: [...statusList, newStatus] });
            }}
            className="pixel-btn px-2 py-0.5 bg-[#E0BAC7] hover:bg-[#d49bb0] rounded text-[10px] flex items-center gap-1 font-bold cursor-pointer"
          >
            <Plus className="w-2.5 h-2.5" />
            <span>新增數值條</span>
          </button>
        </div>

        {statusList.length === 0 ? (
          <p className="text-[10px] text-[#442F2A]/50 italic">尚未設定狀態條，點選右上方按鈕新增</p>
        ) : (
          <div className="space-y-1.5">
            {statusList.map((st, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-white p-1.5 rounded border border-[#442F2A]/20">
                <input
                  type="text"
                  value={st.label}
                  placeholder="屬性 (如 親密)"
                  onChange={(e) => {
                    const next = [...statusList];
                    next[idx].label = e.target.value;
                    onUpdate({ ...character, statusList: next });
                  }}
                  className="w-20 bg-[#FFF8F5] border border-[#442F2A]/30 rounded px-1.5 py-0.5 text-xs font-bold"
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={st.value}
                  onChange={(e) => {
                    const next = [...statusList];
                    next[idx].value = parseInt(e.target.value, 10) || 0;
                    onUpdate({ ...character, statusList: next });
                  }}
                  className="flex-1 accent-[#442F2A] cursor-pointer"
                />
                <span className="w-8 text-center text-xs font-pixel font-bold text-[#442F2A]">
                  {st.value}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const next = statusList.filter((_, i) => i !== idx);
                    onUpdate({ ...character, statusList: next });
                  }}
                  className="text-[#C89398] hover:text-red-700 p-0.5 cursor-pointer shrink-0"
                  title="刪除數值條"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Numbered Lore Sections (人設與故事段落 01, 02...) */}
      <div className="p-2.5 bg-[#FFF8F5] rounded border border-[#442F2A]/30 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-[11px] text-[#442F2A] flex items-center gap-1">
            <FileText className="w-3 h-3 text-[#C89398]" />
            <span>故事與人設段落 (SECTIONS)</span>
          </span>
          <button
            type="button"
            onClick={() => {
              const nextNum = String(sections.length + 1).padStart(2, '0');
              const newSec: CharacterSection = {
                number: nextNum,
                title: '新段落標題',
                content: '請在此輸入該段落的故事或人設敘述...',
              };
              onUpdate({ ...character, sections: [...sections, newSec] });
            }}
            className="pixel-btn px-2 py-0.5 bg-[#E0BAC7] hover:bg-[#d49bb0] rounded text-[10px] flex items-center gap-1 font-bold cursor-pointer"
          >
            <Plus className="w-2.5 h-2.5" />
            <span>新增段落</span>
          </button>
        </div>

        {sections.length === 0 ? (
          <p className="text-[10px] text-[#442F2A]/50 italic">尚未設定故事段落，點選右上方按鈕新增</p>
        ) : (
          <div className="space-y-2">
            {sections.map((sec, idx) => (
              <div key={idx} className="p-2 bg-white rounded border border-[#442F2A]/20 space-y-1.5 shadow-2xs">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 flex-1">
                    <input
                      type="text"
                      value={sec.number}
                      placeholder="01"
                      onChange={(e) => {
                        const next = [...sections];
                        next[idx].number = e.target.value;
                        onUpdate({ ...character, sections: next });
                      }}
                      className="w-12 bg-[#FFF8F5] border border-[#442F2A]/30 rounded px-1.5 py-0.5 text-xs font-pixel font-bold text-center"
                    />
                    <input
                      type="text"
                      value={sec.title}
                      placeholder="段落標題 (如 一本正經的胡說八道)"
                      onChange={(e) => {
                        const next = [...sections];
                        next[idx].title = e.target.value;
                        onUpdate({ ...character, sections: next });
                      }}
                      className="flex-1 bg-[#FFF8F5] border border-[#442F2A]/30 rounded px-2 py-0.5 text-xs font-bold"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = sections.filter((_, i) => i !== idx);
                      onUpdate({ ...character, sections: next });
                    }}
                    className="text-[#C89398] hover:text-red-700 p-0.5 cursor-pointer shrink-0"
                    title="刪除段落"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={sec.content}
                  placeholder="段落故事與人設內容..."
                  onChange={(e) => {
                    const next = [...sections];
                    next[idx].content = e.target.value;
                    onUpdate({ ...character, sections: next });
                  }}
                  className="w-full bg-[#FFF8F5] border border-[#442F2A]/30 rounded p-1.5 text-xs leading-relaxed"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
