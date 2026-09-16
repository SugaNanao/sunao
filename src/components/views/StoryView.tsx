import React, { useState } from 'react';
import { CoupleSiteData, StoryChapter } from '../../types';
import { PixelHeart } from '../PixelHeart';
import { BookOpen, Calendar, Edit, Sparkles, X } from 'lucide-react';
import { normalizeImageUrl, getGoogleDriveFileId, handleImageLoadError } from '../../utils/imageOptimizer';

interface StoryViewProps {
  data: CoupleSiteData;
  isEditMode: boolean;
  onEditSection: (section: string) => void;
  onSaveStoryChapter?: (chapters: StoryChapter[]) => void;
}

const displayText = (text?: string, placeholder = '敬請期待') => {
  return text && text.trim() ? text : placeholder;
};

export const StoryView: React.FC<StoryViewProps> = ({
  data,
  isEditMode,
  onEditSection,
}) => {
  const [selectedChapter, setSelectedChapter] = useState<StoryChapter | null>(null);

  return (
    <div className="flex flex-col gap-6" id="story-view">
      {/* Top Title Banner */}
      <div className="pixel-card p-4 bg-white relative">
        <div className="text-center">
          <h2 className="text-lg font-pixel font-bold text-[#442F2A]">
            <span>{data.pageTitles?.story?.title || 'STORY'}</span>
          </h2>
          <p className="text-xs font-pixel text-[#442F2A]/70 mt-0.5">
            {data.pageTitles?.story?.subtitle || '烏野高校で、まだ描かれていない物語'}
          </p>
        </div>

        {isEditMode && (
          <button
            onClick={() => onEditSection('story')}
            className="pixel-btn px-3 py-1.5 text-xs font-pixel font-bold bg-[#E0BAC7] flex items-center gap-1 rounded absolute right-4 top-1/2 -translate-y-1/2"
          >
            <Edit className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">編輯章節故事</span>
          </button>
        )}
      </div>

      {/* Chapters Grid / List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {data.stories.map((chapter) => (
          <div
            key={chapter.id}
            onClick={() => setSelectedChapter(chapter)}
            className="pixel-card overflow-hidden flex flex-col justify-between hover:scale-102 hover:-translate-y-1 transition duration-200 cursor-pointer group bg-white shadow-md"
          >
            <div>
              {/* Cover Image if available */}
              {chapter.coverImage && (
                <div className="h-44 w-full overflow-hidden border-b-2 border-[#442F2A] bg-neutral-100 relative">
                  <img
                    src={normalizeImageUrl(chapter.coverImage)}
                    alt={chapter.title}
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    onError={(e) => handleImageLoadError(e, chapter.coverImage)}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-2 left-2 bg-[#FFF8F5]/90 border border-[#442F2A] px-2 py-0.5 rounded text-[10px] font-pixel text-[#442F2A] font-bold">
                    {chapter.chapterNumber}
                  </div>
                </div>
              )}

              {/* Story Summary Body */}
              <div className="p-4">
                <div className="flex items-center justify-between text-[11px] font-pixel text-[#442F2A]/70 mb-1">
                  <span className="flex items-center gap-1 text-[#442F2A]">
                    <Calendar className="w-3 h-3 text-[#442F2A]" />
                    <span>{chapter.date}</span>
                  </span>
                  <span className="bg-[#F8EDF1] px-1.5 py-0.2 rounded border border-[#442F2A]/20">
                    {chapter.mood || 'Sweet Memory'}
                  </span>
                </div>

                <h3 className="font-pixel font-bold text-base text-[#442F2A] group-hover:text-[#C89398] transition mb-2">
                  {displayText(chapter.title, '敬請期待')}
                </h3>

                <p className="text-xs font-pixel text-[#442F2A]/80 line-clamp-3 leading-relaxed">
                  {displayText(chapter.summary, '敬請期待')}
                </p>
              </div>
            </div>

            {/* Read button */}
            <div className="p-4 pt-0">
              <div className="border-t border-[#442F2A]/15 pt-2 flex items-center justify-between text-xs font-pixel text-[#C89398] font-bold group-hover:translate-x-1 transition">
                <span>閱讀全文 &gt;&gt;</span>
                <PixelHeart color="#C89398" className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chapter Reading Modal */}
      {selectedChapter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-none">
          <div className="pixel-window max-w-2xl w-full max-h-[85vh] flex flex-col rounded-lg overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-[#442F2A] text-[#FFF8F5] px-4 py-2 flex items-center justify-between font-pixel text-xs">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#E0BAC7]" />
                <span className="font-bold">{selectedChapter.chapterNumber}: {selectedChapter.title}</span>
              </div>
              <button
                onClick={() => setSelectedChapter(null)}
                className="w-5 h-5 bg-[#E0BAC7] text-[#442F2A] rounded flex items-center justify-center font-bold hover:bg-[#C89398] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto bg-[#FFF8F5] space-y-4">
              {selectedChapter.coverImage && (
                <div className="h-60 w-full rounded-lg border-2 border-[#442F2A] overflow-hidden">
                  <img
                    src={normalizeImageUrl(selectedChapter.coverImage)}
                    alt={selectedChapter.title}
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    onError={(e) => handleImageLoadError(e, selectedChapter.coverImage)}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex items-center justify-between text-xs font-pixel text-[#442F2A] border-b border-[#442F2A]/20 pb-2">
                <span className="font-bold text-[#442F2A]">{selectedChapter.chapterNumber}</span>
                <span className="flex items-center gap-1.5 text-[#442F2A] font-bold">
                  <Calendar className="w-3.5 h-3.5 text-[#442F2A]" />
                  <span>日期：{selectedChapter.date}</span>
                </span>
              </div>

              <div className="text-sm font-pixel text-[#442F2A] leading-loose whitespace-pre-line bg-white p-4 rounded border border-[#442F2A]/20 shadow-inner">
                {selectedChapter.content && selectedChapter.content.trim() ? (
                  selectedChapter.content
                ) : (
                  <div className="flex items-center justify-center py-8">
                    <div className="bg-[#FFF8F5] border-2 border-[#442F2A] rounded-lg px-8 py-4 text-center shadow-md font-pixel">
                      <span className="text-sm font-bold text-[#442F2A] tracking-wider">
                        ［ 敬請期待 ］
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={() => setSelectedChapter(null)}
                  className="pixel-btn px-4 py-1.5 text-xs font-pixel font-bold bg-[#E0BAC7] rounded"
                >
                  關閉章節
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
