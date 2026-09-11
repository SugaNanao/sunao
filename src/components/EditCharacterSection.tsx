import React from 'react';
import {
  Character,
  ColorSwatch,
  CharacterStatus,
  CharacterSection,
  PersonalityParagraph,
  CharacterTriviaItem,
} from '../types';
import { PixelHeart } from './PixelHeart';
import { Plus, Trash2, Upload, Palette, Sliders, FileText, User, MessageSquare, Sparkles } from 'lucide-react';

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

        {/* 1.5 人物姓名區右下角透明底圖片 (Transparent Corner Image) */}
        <div className="p-2.5 bg-[#FFF8F5] rounded border border-[#442F2A]/30 space-y-1.5">
          <label className="block text-[11px] font-bold text-[#442F2A] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#C89398]" />
            <span>人物姓名區右下角透明底圖片 (Transparent Corner Image)：</span>
          </label>
          <p className="text-[10px] text-[#442F2A]/70 leading-normal">
            ※ 放置於角色分頁中人物姓名與金句右下角的透明插圖（如 Q版人物/透明貼圖/代表小物，建議上傳去背透明 PNG）
          </p>
          <div className="flex gap-2 items-center">
            {character.cornerImage ? (
              <div className="w-12 h-12 rounded border border-[#442F2A] overflow-hidden bg-neutral-100 shrink-0 shadow-xs flex items-center justify-center p-1">
                <img src={character.cornerImage} alt="Corner Sticker" className="w-full h-full object-contain" />
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
                onChange={(e) => onUpdate({ ...character, cornerImage: e.target.value })}
                className="flex-1 bg-white border border-[#442F2A] rounded p-1.5 text-xs truncate"
                placeholder="https://... 或點擊上傳透明 PNG 圖片"
              />
              <label className="pixel-btn px-2.5 py-1 bg-[#E0BAC7] hover:bg-[#d49bb0] rounded text-[11px] flex items-center gap-1 cursor-pointer shrink-0 font-bold">
                <Upload className="w-3 h-3" />
                <span>上傳</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, (url) => onUpdate({ ...character, cornerImage: url }))}
                />
              </label>
              {character.cornerImage && (
                <button
                  type="button"
                  onClick={() => onUpdate({ ...character, cornerImage: '' })}
                  className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs cursor-pointer"
                  title="清除圖片"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
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

        {/* 3. 外貌描述 */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[10px] font-bold text-[#442F2A]">外貌描述 (Appearance)：</label>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  const val = character.appearance || '';
                  onUpdate({ ...character, appearance: val ? `${val} ~~刪除文字~~` : '~~刪除文字~~' });
                }}
                className="text-[9px] px-1.5 py-0.5 rounded bg-white border border-[#442F2A]/30 text-[#442F2A] hover:bg-[#E0BAC7]/40 cursor-pointer font-bold line-through"
                title="插入刪除線 (~~文字~~)"
              >
                S
              </button>
              <button
                type="button"
                onClick={() => {
                  const val = character.appearance || '';
                  onUpdate({ ...character, appearance: val ? `${val} **粗體**` : '**粗體**' });
                }}
                className="text-[9px] px-1.5 py-0.5 rounded bg-white border border-[#442F2A]/30 text-[#442F2A] hover:bg-[#E0BAC7]/40 cursor-pointer font-bold"
                title="插入粗體 (**文字**)"
              >
                B
              </button>
              <button
                type="button"
                onClick={() => {
                  const val = character.appearance || '';
                  onUpdate({ ...character, appearance: val ? `${val} *斜體*` : '*斜體*' });
                }}
                className="text-[9px] px-1.5 py-0.5 rounded bg-white border border-[#442F2A]/30 text-[#442F2A] hover:bg-[#E0BAC7]/40 cursor-pointer font-bold italic"
                title="插入斜體 (*文字*)"
              >
                I
              </button>
              <button
                type="button"
                onClick={() => {
                  const val = character.appearance || '';
                  onUpdate({ ...character, appearance: val ? `${val}✦` : '✦' });
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
            value={character.appearance || ''}
            placeholder="請輸入外貌描述（髮型、五官特徵、身材、穿搭等，支援 ~~刪除線~~）..."
            onChange={(e) => onUpdate({ ...character, appearance: e.target.value })}
            className="w-full bg-white border border-[#442F2A]/40 rounded p-1.5 text-xs leading-relaxed"
          />
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

        {/* 5. 人際關係 */}
        <div>
          <label className="block text-[10px] font-bold text-[#442F2A]">人際關係 (Relationships)：</label>
          <textarea
            rows={3}
            value={character.relationships || ''}
            placeholder="請輸入人際關係（支援按 Enter 換行）..."
            onChange={(e) => onUpdate({ ...character, relationships: e.target.value })}
            className="w-full bg-white border border-[#442F2A]/40 rounded p-1.5 text-xs leading-relaxed"
          />
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
