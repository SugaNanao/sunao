import React from 'react';
import { Character, ColorSwatch, CharacterStatus, CharacterSection } from '../types';
import { PixelHeart } from './PixelHeart';
import { Plus, Trash2, Upload, Palette, Sliders, FileText, User } from 'lucide-react';

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

        <div>
          <label className="block text-[11px] font-bold text-[#442F2A]">身份 / 稱號 (Role / Title)：</label>
          <input
            type="text"
            value={character.role || ''}
            onChange={(e) => onUpdate({ ...character, role: e.target.value })}
            className="w-full bg-[#FFF8F5] border border-[#442F2A] rounded p-1.5 text-xs"
            placeholder="例：烏野高校 排球部 二傳手"
          />
        </div>

        {/* Avatar with Upload & Preview */}
        <div>
          <label className="block text-[11px] font-bold text-[#442F2A]">頭像 (Avatar URL 或 本機上傳)：</label>
          <div className="flex gap-2 items-center">
            <div className="w-12 h-12 rounded border-2 border-[#442F2A] overflow-hidden bg-neutral-100 shrink-0 shadow-xs">
              <img src={character.avatar} alt="Avatar Preview" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 flex gap-1">
              <input
                type="text"
                value={character.avatar || ''}
                onChange={(e) => onUpdate({ ...character, avatar: e.target.value })}
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
            <label className="block text-[10px] font-bold text-[#442F2A]">MBTI：</label>
            <input
              type="text"
              value={character.mbti || ''}
              placeholder={charKey === 'characterA' ? 'INFJ' : 'ENFP'}
              onChange={(e) => onUpdate({ ...character, mbti: e.target.value })}
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
