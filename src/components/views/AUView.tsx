import React, { useState } from 'react';
import { CoupleSiteData, AlternativeUniverse } from '../../types';
import { PixelHeart } from '../PixelHeart';
import { Globe, Sparkles, Wand2, BookOpen, Edit, X } from 'lucide-react';

interface AUViewProps {
  data: CoupleSiteData;
  isEditMode: boolean;
  onEditSection: (section: string) => void;
}

const displayText = (text?: string, placeholder = '敬請期待') => {
  return text && text.trim() ? text : placeholder;
};

export const AUView: React.FC<AUViewProps> = ({
  data,
  isEditMode,
  onEditSection,
}) => {
  const [selectedAU, setSelectedAU] = useState<AlternativeUniverse | null>(null);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState<boolean>(false);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number>(0);

  const auStories = selectedAU?.stories && selectedAU.stories.length > 0
    ? selectedAU.stories
    : selectedAU?.storySnippet && selectedAU.storySnippet.trim()
      ? [{ id: 'default', title: '篇章一：片段與經典對白', content: selectedAU.storySnippet }]
      : [];

  return (
    <div className="flex flex-col gap-6" id="au-view">
      {/* Header */}
      <div className="pixel-card p-4 bg-white relative">
        <div className="text-center">
          <h2 className="text-lg font-pixel font-bold text-[#442F2A]">
            <span>ALTERNATIVE UNIVERSE</span>
          </h2>
          <p className="text-xs font-pixel text-[#442F2A]/70 mt-0.5">
            縁下監督 最新作
          </p>
        </div>

        {isEditMode && (
          <button
            onClick={() => onEditSection('au')}
            className="pixel-btn px-3 py-1.5 text-xs font-pixel font-bold bg-[#E0BAC7] flex items-center gap-1 rounded absolute right-4 top-1/2 -translate-y-1/2"
          >
            <Edit className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">編輯平行宇宙</span>
          </button>
        )}
      </div>

      {/* AU Cards Grid: 2 per row for max-w-lg container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {data.alternativeUniverses.map((au) => (
          <div
            key={au.id}
            onClick={() => {
              setSelectedAU(au);
              setActiveStoryIndex(0);
              setIsStoryModalOpen(false);
            }}
            className="pixel-card overflow-hidden flex flex-col justify-between hover:scale-102 hover:-translate-y-1 transition duration-200 cursor-pointer bg-white shadow-md group"
          >
            <div>
              {/* Cover Image */}
              {au.coverImage && (
                <div className="h-44 w-full overflow-hidden border-b-2 border-[#442F2A] relative bg-neutral-100">
                  <img
                    src={au.coverImage}
                    alt={au.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                </div>
              )}

              {/* Body */}
              <div className="p-4 space-y-2">
                <h3 className="font-pixel font-bold text-base text-[#442F2A] group-hover:text-[#C89398] transition">
                  {displayText(au.title, '敬請期待')}
                </h3>

                {/* World Premise / Background fully displayed */}
                <p className="text-xs font-pixel text-[#442F2A]/90 leading-relaxed bg-[#FFF8F5] p-2.5 rounded border border-[#442F2A]/10 whitespace-pre-line">
                  {displayText(au.premise, '敬請期待')}
                </p>

                {/* Character roles snippet */}
                <div className="text-[11px] font-pixel text-[#442F2A] space-y-1 pt-1">
                  <p className="truncate flex items-center">
                    <PixelHeart color="#442F2A" className="w-3 h-3 mr-1 inline-block shrink-0" />
                    <span className="font-bold text-[#442F2A]">{data.characterA.name}：</span>
                    <span className="text-[#442F2A]/80 truncate ml-1">{displayText(au.charARole, '敬請期待')}</span>
                  </p>
                  <p className="truncate flex items-center">
                    <PixelHeart color="#C89398" className="w-3 h-3 mr-1 inline-block shrink-0" />
                    <span className="font-bold text-[#9D5A64]">{data.characterB.name}：</span>
                    <span className="text-[#442F2A]/80 truncate ml-1">{displayText(au.charBRole, '敬請期待')}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Read Snippet prompt with brown book symbol */}
            <div className="p-4 pt-0">
              <div className="border-t border-[#442F2A]/15 pt-2 flex items-center justify-between text-xs font-pixel text-[#442F2A] font-bold group-hover:translate-x-1 transition">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#442F2A]" />
                  <span>展開宇宙設定與故事欄 &gt;&gt;</span>
                </span>
                <PixelHeart color="#C89398" className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        ))}

        {data.alternativeUniverses.length === 0 && (
          <div className="col-span-full flex items-center justify-center py-12">
            <div className="bg-[#FFF8F5] border-2 border-[#442F2A] rounded-lg px-8 py-5 text-center shadow-md font-pixel">
              <span className="text-sm font-bold text-[#442F2A] tracking-wider">
                ［ 敬請期待 ］
              </span>
            </div>
          </div>
        )}
      </div>

      {/* AU Detail Modal */}
      {selectedAU && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
          <div className="pixel-window max-w-2xl w-full max-h-[85vh] flex flex-col rounded-lg overflow-hidden shadow-2xl bg-white animate-fade-in">
            {/* Header */}
            <div className="bg-[#442F2A] text-[#FFF8F5] px-4 py-2 flex items-center justify-between font-pixel text-xs">
              <span className="font-bold">{displayText(selectedAU.title, '敬請期待')}</span>
              <button
                onClick={() => {
                  setSelectedAU(null);
                  setIsStoryModalOpen(false);
                }}
                className="w-5 h-5 bg-[#E0BAC7] text-[#442F2A] rounded flex items-center justify-center font-bold hover:bg-[#C89398] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto bg-[#FFF8F5] space-y-4">
              {selectedAU.coverImage && (
                <div className="h-56 w-full rounded-lg border-2 border-[#442F2A] overflow-hidden">
                  <img
                    src={selectedAU.coverImage}
                    alt={selectedAU.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* World Premise */}
              <div className="bg-white p-3.5 rounded border border-[#442F2A]/20 text-xs font-pixel text-[#442F2A] leading-relaxed">
                <span className="font-bold text-[#9D5A64] block mb-1">◆ 世界觀與背景設定</span>
                <p>{displayText(selectedAU.premise, '敬請期待')}</p>
              </div>

              {/* Roles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-pixel">
                <div className="bg-amber-50 border border-amber-200 p-3 rounded">
                  <span className="font-bold text-[#442F2A] flex items-center gap-1 mb-1">
                    <PixelHeart color="#442F2A" className="w-3.5 h-3.5" />
                    <span>{data.characterA.name} 身份</span>
                  </span>
                  <p className="text-[#442F2A]">{displayText(selectedAU.charARole, '敬請期待')}</p>
                </div>
                <div className="bg-[#F8EDF1] border border-[#E0BAC7] p-3 rounded">
                  <span className="font-bold text-[#9D5A64] flex items-center gap-1 mb-1">
                    <PixelHeart color="#C89398" className="w-3.5 h-3.5" />
                    <span>{data.characterB.name} 身份</span>
                  </span>
                  <p className="text-[#442F2A]">{displayText(selectedAU.charBRole, '敬請期待')}</p>
                </div>
              </div>

              {/* 故事欄 (Stories Section / Stories Bar) */}
              <div className="bg-white p-4 rounded-xl border-2 border-[#442F2A] shadow-xs space-y-2.5">
                <div className="flex items-center justify-between border-b border-[#442F2A]/15 pb-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#442F2A]" />
                    <span className="font-bold text-xs sm:text-sm text-[#442F2A] font-pixel">
                      ★ STORY ({auStories.length} 篇故事)
                    </span>
                  </div>
                  {auStories.length > 0 && (
                    <button
                      onClick={() => {
                        setActiveStoryIndex(0);
                        setIsStoryModalOpen(true);
                      }}
                      className="pixel-btn px-2.5 py-1 text-[11px] font-bold bg-[#E0BAC7] hover:bg-[#C89398] text-[#442F2A] rounded flex items-center gap-1 cursor-pointer transition"
                    >
                      <span>展開故事浮窗</span>
                      <span>&gt;&gt;</span>
                    </button>
                  )}
                </div>

                <p className="text-[11px] font-pixel text-[#442F2A]/70">
                  ✦ 點開故事項目或上方按鈕，以專屬浮窗沉浸閱讀平行宇宙篇章；多篇故事將以分頁方式展示。
                </p>

                {auStories.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {auStories.map((story, sIdx) => (
                      <div
                        key={story.id || sIdx}
                        onClick={() => {
                          setActiveStoryIndex(sIdx);
                          setIsStoryModalOpen(true);
                        }}
                        className="p-2.5 bg-[#FFF8F5] hover:bg-[#F8EDF1] border border-[#442F2A]/25 rounded-md cursor-pointer transition flex items-center justify-between group shadow-2xs"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-1.5 text-[10px] text-[#9D5A64] font-bold font-pixel">
                            <span>第 {sIdx + 1} 篇</span>
                            {story.date && <span className="text-[#442F2A]/50">・{story.date}</span>}
                          </div>
                          <div className="text-xs font-bold text-[#442F2A] group-hover:text-[#9D5A64] truncate mt-0.5">
                            {story.title}
                          </div>
                        </div>
                        <span className="text-[10px] font-pixel bg-white group-hover:bg-[#E0BAC7] text-[#442F2A] px-2 py-1 rounded border border-[#442F2A]/20 shrink-0 font-bold flex items-center gap-1">
                          <span>閱讀</span>
                          <BookOpen className="w-3 h-3 text-[#442F2A]" />
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-4 text-xs font-pixel text-[#442F2A]/60">
                    ［ 敬請期待故事更新 ］
                  </div>
                )}
              </div>

              {/* Story Snippet Preview */}
              {selectedAU.storySnippet && selectedAU.storySnippet.trim() && (
                <div className="bg-white p-3.5 rounded border border-[#442F2A]/20 text-xs font-pixel text-[#442F2A] leading-relaxed shadow-xs">
                  <span className="font-bold text-[#9D5A64] block mb-1">★ 摘要</span>
                  <p className="whitespace-pre-line text-[#442F2A]/85 italic">
                    {selectedAU.storySnippet}
                  </p>
                </div>
              )}

              <div className="text-center pt-2">
                <button
                  onClick={() => {
                    setSelectedAU(null);
                    setIsStoryModalOpen(false);
                  }}
                  className="pixel-btn px-4 py-1.5 text-xs font-pixel font-bold bg-[#E0BAC7] hover:bg-[#C89398] rounded cursor-pointer"
                >
                  關閉視窗
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Story Modal (浮窗與分頁展示) */}
      {isStoryModalOpen && selectedAU && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs select-none"
          onClick={() => setIsStoryModalOpen(false)}
        >
          <div
            className="pixel-window max-w-2xl w-full max-h-[88vh] flex flex-col rounded-lg overflow-hidden shadow-2xl bg-white animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Story Modal Header */}
            <div className="bg-[#442F2A] text-[#FFF8F5] px-4 py-2.5 flex items-center justify-between font-pixel text-xs">
              <div className="flex items-center gap-2 font-bold truncate">
                <BookOpen className="w-4 h-4 text-[#E0BAC7] shrink-0" />
                <span className="truncate">{selectedAU.title} // STORY</span>
              </div>
              <button
                onClick={() => setIsStoryModalOpen(false)}
                className="w-5 h-5 bg-[#E0BAC7] text-[#442F2A] rounded flex items-center justify-center font-bold hover:bg-[#C89398] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Tab Bar if 2 or more stories (兩篇以上以分頁展示) */}
            {auStories.length >= 2 && (
              <div className="bg-[#F8EDF1] border-b-2 border-[#442F2A] px-3 pt-2.5 flex items-center gap-1.5 overflow-x-auto select-none">
                {auStories.map((st, idx) => (
                  <button
                    key={st.id || idx}
                    onClick={() => setActiveStoryIndex(idx)}
                    className={`px-3 py-1.5 text-xs font-pixel font-bold rounded-t-md transition whitespace-nowrap cursor-pointer border-t-2 border-x-2 ${
                      activeStoryIndex === idx
                        ? 'bg-[#FFF8F5] text-[#9D5A64] border-[#442F2A] shadow-xs'
                        : 'bg-white/60 text-[#442F2A]/70 border-transparent hover:bg-white'
                    }`}
                  >
                    分頁 {idx + 1}：{st.title}
                  </button>
                ))}
              </div>
            )}

            {/* Story Content Area */}
            <div className="p-5 overflow-y-auto bg-[#FFF8F5] space-y-4 flex-1">
              {auStories[activeStoryIndex] ? (
                <div className="space-y-3">
                  <div className="border-b border-[#442F2A]/20 pb-2">
                    <div className="flex items-center justify-between text-[11px] font-pixel text-[#442F2A]/60 mb-1">
                      <span>
                        篇章 {activeStoryIndex + 1} / 共 {auStories.length} 篇
                      </span>
                      {auStories[activeStoryIndex].date && (
                        <span className="bg-white px-2 py-0.5 rounded border border-[#442F2A]/20 font-bold">
                          {auStories[activeStoryIndex].date}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-pixel font-bold text-[#442F2A] flex items-center gap-2">
                      <PixelHeart color="#C89398" className="w-4 h-4 shrink-0" />
                      <span>{auStories[activeStoryIndex].title}</span>
                    </h3>
                  </div>

                  <div className="bg-white p-4 sm:p-5 rounded-lg border-2 border-[#442F2A] text-xs sm:text-sm font-pixel text-[#442F2A] leading-loose whitespace-pre-line shadow-inner">
                    {auStories[activeStoryIndex].content}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 font-pixel text-xs text-[#442F2A]/60">
                  暫無故事內容
                </div>
              )}
            </div>

            {/* Story Modal Footer */}
            <div className="bg-[#FFF8F5] px-4 py-2.5 border-t border-[#442F2A]/20 flex items-center justify-between font-pixel">
              {auStories.length >= 2 ? (
                <div className="flex items-center gap-2">
                  <button
                    disabled={activeStoryIndex === 0}
                    onClick={() => setActiveStoryIndex((prev) => Math.max(0, prev - 1))}
                    className="pixel-btn px-2.5 py-1 text-xs font-bold bg-white text-[#442F2A] rounded border border-[#442F2A] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                  >
                    ← 上一篇
                  </button>
                  <button
                    disabled={activeStoryIndex >= auStories.length - 1}
                    onClick={() => setActiveStoryIndex((prev) => Math.min(auStories.length - 1, prev + 1))}
                    className="pixel-btn px-2.5 py-1 text-xs font-bold bg-white text-[#442F2A] rounded border border-[#442F2A] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                  >
                    下一篇 →
                  </button>
                </div>
              ) : (
                <div />
              )}

              <button
                onClick={() => setIsStoryModalOpen(false)}
                className="pixel-btn px-4 py-1 text-xs font-bold bg-[#E0BAC7] hover:bg-[#C89398] text-[#442F2A] rounded cursor-pointer"
              >
                關閉浮窗
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
