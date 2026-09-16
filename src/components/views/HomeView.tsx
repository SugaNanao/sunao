import React, { useState } from 'react';
import { CoupleSiteData, ActiveTab } from '../../types';
import { ChevronRight, Edit, Pencil, Save, AlertTriangle } from 'lucide-react';
import { renderFormattedText } from '../../utils/textFormatter';
import { CharacterOverviewCard } from '../CharacterOverviewCard';
import { normalizeImageUrl, getGoogleDriveFileId, handleImageLoadError } from '../../utils/imageOptimizer';

interface HomeViewProps {
  data: CoupleSiteData;
  onNavigateTab: (tab: ActiveTab) => void;
  isEditMode: boolean;
  onEditSection: (section: string) => void;
  onUpdateSiteData?: (updater: (prev: CoupleSiteData) => CoupleSiteData) => void;
  onNavigateToCharacter?: (char: 'CHAR_A' | 'CHAR_B') => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  data,
  onNavigateTab,
  isEditMode,
  onEditSection,
  onUpdateSiteData,
  onNavigateToCharacter,
}) => {
  const [activeModal, setActiveModal] = useState<'notice' | 'memo' | null>(null);
  const [isEditingModal, setIsEditingModal] = useState<boolean>(false);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editContent, setEditContent] = useState<string>('');

  const currentNotice = data.introNotice || {
    title: 'NOTICE ・ 月が星を照らすまで',
    content: '歡迎來到 菅原孝支 X 宮原七緒 的秘密存檔庫！\n這裡是存放我們從青梅竹馬到戀人所有心動與日常的小天地。\n\n「無論夜幕多麼深沉，月光都會如期灑在星辰之上。」',
  };

  const currentMemo = data.introMemo || {
    title: 'SPECIAL THANKS',
    content: '✦ 兩人的日常守則 ✦\n\n1. 練習結束後要在更衣室外等對方一起走回家。\n2. 肚子餓的時候草莓大福的第一口永遠留給她。\n3. 傲嬌說反話時，會用比平時更大聲的聲音拆穿。\n4. 每年 9/28 一定要一起看夏日花火。\n5. 無論發生什麼事，每天都要道聲晚安。',
  };

  const handleOpenModal = (type: 'notice' | 'memo') => {
    setActiveModal(type);
    setIsEditingModal(false);
    if (type === 'notice') {
      setEditTitle(currentNotice.title);
      setEditContent(currentNotice.content);
    } else {
      setEditTitle(currentMemo.title);
      setEditContent(currentMemo.content);
    }
  };

  const handleSaveModal = () => {
    if (onUpdateSiteData) {
      onUpdateSiteData((prev) => {
        if (activeModal === 'notice') {
          return {
            ...prev,
            introNotice: { title: editTitle, content: editContent },
          };
        } else {
          return {
            ...prev,
            introMemo: { title: editTitle, content: editContent },
          };
        }
      });
    }
    setIsEditingModal(false);
  };

  // 1 2 3 4 step dots gradient: brown (#442F2A) -> pink (#E0BAC7)
  const stepColors = [
    { bg: 'bg-[#442F2A]', text: 'text-[#FFF8F5]' },
    { bg: 'bg-[#735551]', text: 'text-[#FFF8F5]' },
    { bg: 'bg-[#A8838E]', text: 'text-[#FFF8F5]' },
    { bg: 'bg-[#E0BAC7]', text: 'text-[#442F2A]' },
  ];

  // 3. Album Highlights Preview (Support user selecting which photos to showcase & preview range)
  const homeDisplayPhotos = React.useMemo(() => {
    if (data.homeAlbumPhotoIds && data.homeAlbumPhotoIds.length > 0) {
      const selected = data.homeAlbumPhotoIds
        .map((id) => data.album.find((p) => p.id === id))
        .filter((p): p is typeof data.album[0] => Boolean(p));
      if (selected.length > 0) return selected;
    }
    const markedPhotos = data.album.filter((p) => p.showOnHome);
    if (markedPhotos.length > 0) return markedPhotos;
    return data.album.slice(0, 3);
  }, [data.album, data.homeAlbumPhotoIds]);

  return (
    <div className="flex flex-col gap-6" id="home-view-container">
      {/* 1. Main Welcome Feature Card (Proportionally scaled referencing Loading screen block) */}
      <section className="pixel-card p-4 sm:p-5 relative bg-white overflow-hidden shadow-md">
        {isEditMode && (
          <button
            onClick={() => onEditSection('basic')}
            className="absolute top-3 right-3 p-1 bg-[#E0BAC7] hover:bg-[#d49bb0] rounded border border-[#442F2A] text-[#442F2A] text-[11px] font-pixel flex items-center gap-1 cursor-pointer z-10 shadow-2xs"
            title="編輯主頁文字與大圖"
          >
            <Edit className="w-3 h-3" />
            <span>編輯介紹</span>
          </button>
        )}

        {/* Decorative corner accents */}
        <div className="flex flex-col md:flex-row items-stretch gap-4 sm:gap-5">
          {/* Main Couple Featured Art / Illustration (Balanced size with text box) */}
          <div className="w-full md:w-1/2 shrink-0 flex flex-col">
            <div className="relative rounded-xl border-2 border-[#442F2A] overflow-hidden shadow-sm bg-[#F8EDF1] group flex-1 min-h-[210px] sm:min-h-[220px]">
              <img
                src={normalizeImageUrl(data.mainIllustration)}
                alt="Couple Main Portrait"
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                onError={(e) => handleImageLoadError(e, data.mainIllustration)}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#442F2A]/20 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>

          {/* Intro Story & Concept (Equal width & height to picture box) */}
          <div className="w-full md:w-1/2 flex flex-col text-left">
            {/* Centered Title */}
            <div className="text-center">
              <h2 className="text-lg sm:text-xl font-bold font-pixel text-[#442F2A] tracking-[0.2em]">
                {data.siteTitle}
              </h2>
            </div>

            {/* Intro Text Box with 1.3 line height spacing from title and 1.5 spacing to bottom line */}
            <div className="mt-[1.3em] mb-[1.5em] font-pixel text-[#442F2A] leading-relaxed bg-[#F8EDF1]/35 p-3.5 sm:p-4 rounded-xl border-2 border-[#E0BAC7] shadow-2xs">
              {/* Brown Quote with Vertical Bar */}
              <div className="border-l-[2.5px] border-[#442F2A] pl-3 py-0.5">
                <p className="font-bold text-[#442F2A] text-[13px] leading-[1.75] [&_*]:leading-[1.75] whitespace-pre-line" style={{ lineHeight: 1.75 }}>
                  {renderFormattedText(data.introQuote)}
                </p>
              </div>
              <p className="text-[11px] sm:text-[12px] text-[#442F2A]/80 whitespace-pre-line leading-relaxed mt-2.5">
                {renderFormattedText(data.introDescription)}
              </p>
            </div>

            {/* Two dots under 月が星を照らすまで: One Brown Alert Warning, One Pencil */}
            <div className="flex items-center gap-2.5 pt-3 border-t border-[#442F2A]/20">
              {/* Notice Dot - Brown Alert Warning 棕色警示 */}
              <button
                onClick={() => handleOpenModal('notice')}
                className="w-8 h-8 rounded-full bg-[#FFF8F5] border-2 border-[#442F2A] flex items-center justify-center hover:bg-[#E0BAC7] hover:scale-110 active:scale-95 transition cursor-pointer shadow-[2px_2px_0px_#442F2A]"
                title="NOTICE ・ 棕色警示公告"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-[#442F2A]" />
              </button>

              {/* Pencil Dot */}
              <button
                onClick={() => handleOpenModal('memo')}
                className="w-8 h-8 rounded-full bg-[#FFF8F5] border-2 border-[#442F2A] flex items-center justify-center text-xs hover:bg-[#E0BAC7] hover:scale-110 active:scale-95 transition cursor-pointer shadow-[2px_2px_0px_#442F2A]"
                title="SPECIAL THANKS 視窗"
              >
                <Pencil className="w-3.5 h-3.5 text-[#442F2A]" />
              </button>

              <span className="text-[10px] sm:text-[11px] font-pixel text-[#442F2A]/60 ml-1">
                ✦ 點擊圓點查看公告
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Modal for Notice / Special Thanks */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="pixel-card bg-[#FFF8F5] max-w-lg w-full p-5 relative shadow-2xl border-3 border-[#442F2A] animate-fade-in">
            {/* Title Bar */}
            <div className="flex items-center justify-between border-b-2 border-[#442F2A] pb-2 mb-4 bg-[#E0BAC7] -mx-5 -mt-5 px-4 py-2">
              <div className="flex items-center gap-2 font-pixel font-bold text-xs sm:text-sm text-[#442F2A]">
                {activeModal === 'notice' ? (
                  <AlertTriangle className="w-4 h-4 text-[#442F2A]" />
                ) : (
                  <Pencil className="w-4 h-4 text-[#442F2A]" />
                )}
                <span className="tracking-wide">
                  {activeModal === 'notice' ? 'NOTICE' : 'SPECIAL THANKS'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {isEditMode && !isEditingModal && (
                  <button
                    onClick={() => setIsEditingModal(true)}
                    className="px-2 py-0.5 bg-white hover:bg-[#FFF8F5] rounded text-[10px] font-pixel text-[#442F2A] border border-[#442F2A] cursor-pointer"
                  >
                    EDIT
                  </button>
                )}
                <button
                  onClick={() => setActiveModal(null)}
                  className="w-6 h-6 rounded bg-[#442F2A] text-[#FFF8F5] flex items-center justify-center text-xs font-pixel hover:bg-[#C89398] transition cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            {isEditingModal ? (
              <div className="space-y-3 font-pixel text-xs text-[#442F2A]">
                <div>
                  <label className="block text-[11px] font-bold mb-1">TITLE</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full p-2 rounded bg-white border-2 border-[#442F2A] text-xs font-pixel focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold mb-1">CONTENT</label>
                  <textarea
                    rows={6}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-2 rounded bg-white border-2 border-[#442F2A] text-xs font-pixel focus:outline-none leading-relaxed"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-[#442F2A]/20">
                  <button
                    onClick={() => setIsEditingModal(false)}
                    className="px-3 py-1 bg-white border border-[#442F2A] rounded text-xs cursor-pointer font-pixel"
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={handleSaveModal}
                    className="px-4 py-1 bg-[#442F2A] text-[#FFF8F5] rounded text-xs font-bold cursor-pointer font-pixel flex items-center gap-1 shadow-sm"
                  >
                    <Save className="w-3 h-3" />
                    <span>SAVE</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 font-pixel text-[#442F2A]">
                <h3 className="text-sm sm:text-base font-bold text-[#C89398] border-b border-[#442F2A]/20 pb-1.5">
                  {activeModal === 'notice' ? currentNotice.title : currentMemo.title}
                </h3>
                <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-line bg-white/80 p-3.5 rounded-lg border border-[#442F2A]/15 min-h-[120px]">
                  {activeModal === 'notice' ? currentNotice.content : currentMemo.content}
                </div>
                <div className="text-right pt-2 border-t border-[#442F2A]/10">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-1.5 bg-[#442F2A] text-[#FFF8F5] rounded text-xs font-bold cursor-pointer hover:bg-[#5a3f38] transition"
                  >
                    CLOSE
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Timeline Milestones Preview (Title pure English, no icon) */}
      <section className="pixel-card p-5 bg-white relative">
        {isEditMode && (
          <button
            onClick={() => onEditSection('milestone')}
            className="absolute top-3 right-3 p-1.5 bg-[#E0BAC7] hover:bg-[#d49bb0] rounded border border-[#442F2A] text-[#442F2A] text-xs font-pixel flex items-center gap-1 cursor-pointer shadow-sm"
            title="EDIT TIMELINE"
          >
            <Edit className="w-3 h-3" />
            <span>EDIT</span>
          </button>
        )}

        <div className="flex items-center justify-between border-b border-[#442F2A]/20 pb-2 mb-5">
          <span className="text-xs font-pixel font-bold text-[#442F2A] tracking-wider">
            TIMELINE
          </span>
          <button
            onClick={() => onNavigateTab('STORY')}
            className="text-xs font-pixel text-[#442F2A] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>VIEW STORY</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Milestone Steps with Gradient Connecting Line and Brown-to-Pink Dots */}
        <div className="relative pl-1">
          {/* Vertical gradient connecting line */}
          <div className="absolute left-[15px] top-4 bottom-5 w-0.5 bg-gradient-to-b from-[#442F2A] via-[#A8838E] to-[#E0BAC7] z-0" />

          <div className="space-y-5 relative z-10">
            {data.milestones.slice(0, 4).map((m, idx) => {
              const colorConfig = stepColors[idx % stepColors.length];
              return (
                <div key={m.id || idx} className="flex items-start gap-3.5 group">
                  {/* Step dot transitioning from brown to pink (pure color, no numbers) */}
                  <div
                    className={`w-6 h-6 rounded-full ${colorConfig.bg} border-2 border-[#442F2A] shrink-0 shadow-sm transition-transform group-hover:scale-125 cursor-default mt-1`}
                  />

                  {/* Step info card */}
                  <div className="flex-1 bg-[#FFF8F5] border border-[#442F2A]/20 p-3 rounded-lg group-hover:border-[#442F2A] transition shadow-xs">
                    <div className="flex items-center justify-between flex-wrap gap-1 mb-1">
                      <span className="font-pixel font-bold text-xs text-[#442F2A]">
                        {m.title}
                      </span>
                      <div className="flex items-center gap-1.5 text-[10px] font-pixel">
                        <span className="bg-[#E0BAC7]/60 text-[#442F2A] px-1.5 py-0.2 rounded border border-[#442F2A]/20">
                          {m.tag || 'Memory'}
                        </span>
                        <span className="text-[#442F2A]/70">{m.date}</span>
                      </div>
                    </div>
                    <p className="text-xs font-pixel text-[#442F2A]/80">
                      {m.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Timeline footnote */}
          <div className="pt-4 text-center">
            <span className="font-pixel text-xs text-[#A8838E] tracking-widest italic">
              to be continue...
            </span>
          </div>
        </div>
      </section>

      {/* Character Overview Cards (橫向並排於 ALBUM 上方) */}
      <section className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5 items-stretch">
          <CharacterOverviewCard
            character={data.characterA}
            isA={true}
            onImageClick={() => {
              if (onNavigateToCharacter) {
                onNavigateToCharacter('CHAR_A');
              } else {
                onNavigateTab('CHARACTER');
              }
            }}
          />
          <CharacterOverviewCard
            character={data.characterB}
            isA={false}
            onImageClick={() => {
              if (onNavigateToCharacter) {
                onNavigateToCharacter('CHAR_B');
              } else {
                onNavigateTab('CHARACTER');
              }
            }}
          />
        </div>
      </section>

      {/* 3. Album Highlights Preview (Title pure English, no icon) */}
      <section className="pixel-card p-5 bg-white relative">
        {isEditMode && (
          <button
            onClick={() => onEditSection('album')}
            className="absolute top-3 right-3 p-1.5 bg-[#E0BAC7] hover:bg-[#d49bb0] rounded border border-[#442F2A] text-[#442F2A] text-xs font-pixel flex items-center gap-1 cursor-pointer shadow-sm"
            title="EDIT ALBUM"
          >
            <Edit className="w-3 h-3" />
            <span>EDIT</span>
          </button>
        )}

        <div className="flex items-center justify-between border-b border-[#442F2A]/20 pb-2 mb-4">
          <span className="text-xs font-pixel font-bold text-[#442F2A] tracking-wider">
            ALBUM
          </span>
          <button
            onClick={() => onNavigateTab('ALBUM')}
            className="text-xs font-pixel text-[#442F2A] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>VIEW ALBUM</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Polaroid style cards grid */}
        <div
          className={`grid gap-4 ${
            homeDisplayPhotos.length === 1
              ? 'grid-cols-1 max-w-sm mx-auto'
              : homeDisplayPhotos.length === 2
              ? 'grid-cols-1 sm:grid-cols-2 max-w-xl mx-auto'
              : homeDisplayPhotos.length === 4
              ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4'
              : 'grid-cols-1 sm:grid-cols-3'
          }`}
        >
          {homeDisplayPhotos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => onNavigateTab('ALBUM')}
              className="bg-[#FFF8F5] border-2 border-[#442F2A] p-2 rounded shadow hover:rotate-1 hover:scale-102 transition duration-200 cursor-pointer flex flex-col"
            >
              <div className="h-40 w-full overflow-hidden border border-[#442F2A]/20 rounded mb-2 bg-neutral-100 relative">
                <img
                  src={normalizeImageUrl(photo.url)}
                  alt={photo.caption}
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  onError={(e) => handleImageLoadError(e, photo.url)}
                  className="w-full h-full object-cover filter contrast-105 transition-transform duration-300"
                  style={{
                    objectPosition: `${photo.previewPositionX ?? 50}% ${photo.previewPositionY ?? 50}%`,
                    transform: `scale(${(photo.previewScale ?? 100) / 100})`,
                  }}
                />
              </div>
              <p className="font-pixel text-xs font-bold text-[#442F2A] truncate">
                {photo.caption}
              </p>
              <div className="flex items-center justify-between text-[10px] font-pixel text-[#442F2A]/60 mt-1">
                <span>{photo.date}</span>
                <span>{photo.tag}</span>
              </div>
            </div>
          ))}

          {homeDisplayPhotos.length === 0 && (
            <div className="col-span-full py-8 text-center bg-[#FFF8F5] rounded border border-dashed border-[#442F2A]/40 font-pixel text-xs text-[#442F2A]/70">
              目前尚未勾選首頁展示相片，請點擊上方 EDIT 選擇要展示的相片。
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
