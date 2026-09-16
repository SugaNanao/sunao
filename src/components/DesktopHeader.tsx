import React from 'react';
import { ActiveTab, CoupleSiteData } from '../types';
import { Music, Volume2, VolumeX, Edit3, Eye, Lock, Sparkles, Home, User, BookOpen, Image as ImageIcon, Globe, Share2, ShieldCheck } from 'lucide-react';
import { soundPlayer } from '../utils/audioSynth';

interface DesktopHeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isEditMode: boolean;
  onToggleEditMode: () => void;
  isPlayingMusic: boolean;
  onToggleMusic: () => void;
  onOpenMusicModal: () => void;
  onOpenEditModal: () => void;
  onReturnToCover: () => void;
  onShare: () => void;
  data: CoupleSiteData;
  isSharedLink?: boolean;
  isAdmin?: boolean;
  onOpenAdminModal?: () => void;
  onPublish?: () => Promise<boolean> | void;
}

export const DesktopHeader: React.FC<DesktopHeaderProps> = ({
  activeTab,
  onTabChange,
  isEditMode,
  onToggleEditMode,
  isPlayingMusic,
  onToggleMusic,
  onOpenMusicModal,
  onOpenEditModal,
  onReturnToCover,
  onShare,
  data,
  isSharedLink = false,
  isAdmin = false,
  onOpenAdminModal,
  onPublish,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full select-none" id="main-desktop-header">
      {/* Decorative Scallop Lace Border */}
      <div className="w-full bg-[#FFF8F5] border-b-2 border-[#442F2A] relative">
        {/* Scalloped edge visual */}
        <div className="lace-pattern-top opacity-90" />

        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3">
          {/* Couple Logo & Title */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onTabChange('HOME')}
              className="flex items-center gap-2 group text-left cursor-pointer"
              title="回到首頁"
            >
              <div>
                <h1 className="font-pixel font-bold text-sm sm:text-base text-[#442F2A] flex items-center gap-2">
                  <span>{data.siteTitle}</span>
                  <span className="text-[10px] bg-[#E0BAC7] text-[#442F2A] px-1.5 py-0.2 rounded border border-[#442F2A]">
                    {data.characterA.name} X {data.characterB.name}
                  </span>
                </h1>
                <p className="text-[10px] text-[#442F2A]/70 font-pixel">
                  {data.siteSubtitle}
                </p>
              </div>
            </button>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Retro Music Mini Trigger */}
            <div className="flex items-center bg-[#FFF8F5] border-2 border-[#442F2A] rounded-md px-2.5 py-1 text-xs font-pixel shadow-sm gap-2">
              <button
                onClick={onToggleMusic}
                className="flex items-center gap-1.5 hover:text-[#C89398] transition cursor-pointer"
                title={isPlayingMusic ? '暫停音樂' : '播放音樂'}
              >
                {isPlayingMusic ? (
                  <Volume2 className="w-4 h-4 text-[#C89398] animate-bounce" />
                ) : (
                  <VolumeX className="w-4 h-4 text-[#442F2A]/60" />
                )}
                <span className="hidden md:inline font-bold">
                  {isPlayingMusic ? 'BGM ON' : 'BGM OFF'}
                </span>
              </button>

              <button
                onClick={onOpenMusicModal}
                className="text-[11px] bg-[#E0BAC7] hover:bg-[#d8a8b8] px-1.5 py-0.5 rounded border border-[#442F2A] font-pixel text-[#442F2A] cursor-pointer"
                title="音樂盒設定"
              >
                選曲 ♫
              </button>

              {/* Animated retro visualizer bars */}
              <div className="flex items-end gap-0.5 h-3.5 px-1">
                <span className={`w-1 bg-[#442F2A] ${isPlayingMusic ? 'h-3 animate-pulse' : 'h-1'}`} />
                <span className={`w-1 bg-[#442F2A] ${isPlayingMusic ? 'h-4 animate-pulse delay-75' : 'h-1'}`} />
                <span className={`w-1 bg-[#442F2A] ${isPlayingMusic ? 'h-2 animate-pulse delay-150' : 'h-1'}`} />
              </div>
            </div>

            {/* Mode Switcher: Only visible to authenticated Admin */}
            {isAdmin ? (
              <div className="flex items-center gap-1.5">
                <div className="flex items-center bg-[#FFF8F5] border-2 border-[#442F2A] rounded-md p-0.5 shadow-sm text-xs font-pixel">
                  <button
                    onClick={onToggleEditMode}
                    className={`px-2 py-1 rounded flex items-center gap-1 transition cursor-pointer ${
                      !isEditMode
                        ? 'bg-[#442F2A] text-[#FFF8F5] font-bold'
                        : 'text-[#442F2A] hover:bg-[#F8EDF1]'
                    }`}
                    title="切換至訪客預覽模式"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">訪客模式</span>
                  </button>
                  <button
                    onClick={onToggleEditMode}
                    className={`px-2 py-1 rounded flex items-center gap-1 transition cursor-pointer ${
                      isEditMode
                        ? 'bg-[#E0BAC7] text-[#442F2A] font-bold border border-[#442F2A]'
                        : 'text-[#442F2A] hover:bg-[#F8EDF1]'
                    }`}
                    title="切換至自訂編輯模式"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">編輯模式</span>
                  </button>
                </div>

                {isEditMode && (
                  <>
                    <button
                      onClick={onOpenEditModal}
                      className="pixel-btn px-2.5 py-1 text-xs font-pixel font-bold bg-[#E0BAC7] flex items-center gap-1 rounded"
                      title="編輯全部網站內容"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span className="hidden lg:inline">編輯站點</span>
                    </button>

                    {onPublish && (
                      <button
                        onClick={() => onPublish()}
                        className="px-2.5 py-1 text-xs font-pixel font-bold bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border-2 border-emerald-700 flex items-center gap-1 rounded shadow-xs cursor-pointer transition active:translate-y-0.5"
                        title="將目前畫面所有修改一鍵發布至官方短網址，讓所有訪客即時看到！"
                      >
                        <span className="text-xs">🚀</span>
                        <span className="hidden sm:inline">發布短網址</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            ) : (
              /* Public Visitor: Simple clean badge */
              <div className="flex items-center gap-1 bg-[#F8EDF1] border-2 border-[#442F2A] rounded-md px-2 py-1 text-xs font-pixel text-[#442F2A] shadow-sm">
                <Eye className="w-3.5 h-3.5 text-[#442F2A]" />
                <span className="font-bold text-[11px]">訪客模式</span>
              </div>
            )}

            {/* Share / Export button */}
            <button
              onClick={onShare}
              className="pixel-btn p-1.5 text-[#442F2A] rounded"
              title="分享或匯出戀愛紀錄"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Return to Cover / Loading Screen button */}
            <button
              onClick={onReturnToCover}
              className="pixel-btn px-2 py-1 text-[#442F2A] rounded text-xs flex items-center gap-1 font-pixel"
              title="返回 LOADING / 封面進入頁"
            >
              <span>COVER</span>
            </button>
          </div>
        </div>
      </div>

      {/* Retro Navigation Tabs Strip (Only shown when not in preserved blank space) */}
      <nav className="w-full bg-[#F8EDF1] border-b-2 border-[#442F2A] overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center gap-1 py-1 text-xs font-pixel">
          {(['HOME', 'CHARACTER', 'STORY', 'ALBUM', 'AU'] as ActiveTab[]).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => onTabChange(tab)}
                className={`px-3 py-1 rounded font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#442F2A] text-[#FFF8F5] shadow-xs'
                    : 'text-[#442F2A] hover:bg-[#E0BAC7]/60'
                }`}
              >
                {tab === 'HOME' && <Home className="w-3.5 h-3.5" />}
                {tab === 'CHARACTER' && <User className="w-3.5 h-3.5" />}
                {tab === 'STORY' && <BookOpen className="w-3.5 h-3.5" />}
                {tab === 'ALBUM' && <ImageIcon className="w-3.5 h-3.5" />}
                {tab === 'AU' && <Globe className="w-3.5 h-3.5" />}
                <span>
                  {tab === 'HOME' && '首頁'}
                  {tab === 'CHARACTER' && '菅緒檔案'}
                  {tab === 'STORY' && '故事章節'}
                  {tab === 'ALBUM' && '戀愛相簿'}
                  {tab === 'AU' && '平行宇宙'}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
};
