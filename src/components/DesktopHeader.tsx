import React from 'react';
import { ActiveTab, CoupleSiteData } from '../types';
import { Music, Volume2, VolumeX, Edit3, Eye, Lock, Sparkles, Home, User, BookOpen, Image as ImageIcon, Globe, Share2 } from 'lucide-react';
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
}) => {
  return (
    <header className="sticky top-0 z-30 w-full select-none" id="main-desktop-header">
      {/* Decorative Scallop Lace Border (Image 2 style) */}
      <div className="w-full bg-[#FFF8F5] border-b-2 border-[#442F2A] relative">
        {/* Scalloped edge visual */}
        <div className="lace-pattern-top opacity-90" />

        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3">
          {/* Couple Logo & Title (Cherry blossom icon removed as requested) */}
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
                    菅原孝支 X 宮原七緒
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

            {/* Mode Switcher: Hidden when shared so visitor cannot change to edit mode */}
            {isSharedLink ? (
              <div className="flex items-center gap-1.5 bg-[#F8EDF1] border-2 border-[#442F2A] rounded-md px-2.5 py-1 text-xs font-pixel text-[#442F2A] shadow-sm">
                <Eye className="w-3.5 h-3.5 text-[#442F2A]" />
                <span className="font-bold">訪客模式</span>
              </div>
            ) : (
              <div className="flex items-center bg-[#FFF8F5] border-2 border-[#442F2A] rounded-md p-0.5 shadow-sm text-xs font-pixel">
                <button
                  onClick={onToggleEditMode}
                  className={`px-2.5 py-1 rounded flex items-center gap-1 transition cursor-pointer ${
                    !isEditMode
                      ? 'bg-[#442F2A] text-[#FFF8F5] font-bold'
                      : 'text-[#442F2A] hover:bg-[#F8EDF1]'
                  }`}
                  title="切換至訪客純淨發布預覽模式"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">訪客模式</span>
                </button>
                <button
                  onClick={onToggleEditMode}
                  className={`px-2.5 py-1 rounded flex items-center gap-1 transition cursor-pointer ${
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
            )}

            {/* If in edit mode and not shared, show comprehensive edit button */}
            {!isSharedLink && isEditMode && (
              <button
                onClick={onOpenEditModal}
                className="pixel-btn px-2.5 py-1 text-xs font-pixel font-bold bg-[#E0BAC7] flex items-center gap-1 rounded"
                title="編輯全部網站內容"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden lg:inline">編輯站點資料</span>
              </button>
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
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden xl:inline text-[11px]">LOADING 封面</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
