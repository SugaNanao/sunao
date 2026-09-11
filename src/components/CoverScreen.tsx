import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Heart, Monitor, FileText, Image as ImageIcon, Folder, Music } from 'lucide-react';
import { CoupleSiteData } from '../types';

interface CoverScreenProps {
  data: CoupleSiteData;
  onEnter: () => void;
}

export const CoverScreen: React.FC<CoverScreenProps> = ({ data, onEnter }) => {
  return (
    <div
      onClick={onEnter}
      className="fixed inset-0 z-40 dot-bg flex flex-col justify-between p-4 md:p-8 cursor-pointer select-none overflow-hidden"
      id="cover-screen-container"
      title="點選任意地方進入網站主頁"
    >
      {/* Top Bar / Retro Status Header */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="bg-[#FFF8F5]/90 border-2 border-[#442F2A] px-3 py-1.5 rounded text-xs font-pixel font-bold text-[#442F2A] shadow-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>
            {data.coverTopStatus
              ? data.coverTopStatus.replace(/LOVE ARCHIVE OS/gi, 'SUNAO').replace(/sunao/g, 'SUNAO')
              : 'CONNECTED TO DESKTOP // SUNAO'}
          </span>
        </div>

        {/* Top Right Mini Music Widget Icon */}
        <div className="bg-[#FFF8F5]/90 border-2 border-[#442F2A] px-3 py-1 rounded text-xs font-pixel text-[#442F2A] shadow-sm flex items-center gap-2">
          <Music className="w-3.5 h-3.5 text-[#442F2A]" />
          <span>BGM: 今、恋がはじまれ</span>
          <div className="flex items-end gap-0.5 h-3">
            <span className="w-1 bg-[#442F2A] h-2 animate-pulse" />
            <span className="w-1 bg-[#442F2A] h-3 animate-pulse delay-75" />
            <span className="w-1 bg-[#442F2A] h-1.5 animate-pulse delay-150" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex items-center justify-center my-4">
        {/* Left Side Retro Desktop Icons */}
        <div className="hidden lg:flex flex-col gap-5 absolute left-2 top-8 text-center text-[11px] font-pixel text-[#442F2A]">
          <div className="flex flex-col items-center gap-1 group">
            <div className="w-12 h-12 bg-[#FFF8F5] border-2 border-[#442F2A] rounded shadow flex items-center justify-center group-hover:scale-105 transition">
              <Monitor className="w-6 h-6 text-[#442F2A]" />
            </div>
            <span className="bg-[#FFF8F5]/80 px-1 rounded border border-[#442F2A]/30">My Computer</span>
          </div>

          <div className="flex flex-col items-center gap-1 group">
            <div className="w-12 h-12 bg-[#FFF8F5] border-2 border-[#442F2A] rounded shadow flex items-center justify-center group-hover:scale-105 transition">
              <FileText className="w-6 h-6 text-[#442F2A]" />
            </div>
            <span className="bg-[#FFF8F5]/80 px-1 rounded border border-[#442F2A]/30">OurStory.doc</span>
          </div>

          <div className="flex flex-col items-center gap-1 group">
            <div className="w-12 h-12 bg-[#FFF8F5] border-2 border-[#442F2A] rounded shadow flex items-center justify-center group-hover:scale-105 transition">
              <ImageIcon className="w-6 h-6 text-[#442F2A]" />
            </div>
            <span className="bg-[#FFF8F5]/80 px-1 rounded border border-[#442F2A]/30">gallery.png</span>
          </div>

          <div className="flex flex-col items-center gap-1 group">
            <div className="w-12 h-12 bg-[#FFF8F5] border-2 border-[#442F2A] rounded shadow flex items-center justify-center group-hover:scale-105 transition">
              <Folder className="w-6 h-6 text-[#442F2A]" />
            </div>
            <span className="bg-[#FFF8F5]/80 px-1 rounded border border-[#442F2A]/30">Archive(2)</span>
          </div>
        </div>

        {/* Center Main Window - Identical size to LOADING window (max-w-lg) */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          whileHover={{ scale: 1.01 }}
          className="w-full max-w-lg pixel-window rounded-lg overflow-hidden flex flex-col shadow-2xl relative"
        >
          {/* Retro Window Bar - Styled consistently with LoadingScreen */}
          <div className="bg-[#442F2A] text-[#FFF8F5] px-3 py-1.5 flex items-center justify-between font-pixel text-xs tracking-wider">
            <div className="flex items-center gap-2">
              <Heart className="w-3.5 h-3.5 text-[#E0BAC7] fill-[#E0BAC7] animate-pulse" />
              <span className="font-bold">{data.siteTitle}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="w-4 h-4 bg-[#FFF8F5] text-[#442F2A] flex items-center justify-center font-bold leading-none">_</span>
              <span className="w-4 h-4 bg-[#FFF8F5] text-[#442F2A] flex items-center justify-center font-bold leading-none">□</span>
              <span className="w-4 h-4 bg-[#E0BAC7] text-[#442F2A] flex items-center justify-center font-bold leading-none">✕</span>
            </div>
          </div>

          {/* Picture Box - Proportionally scaled to match Loading screen window */}
          <div className="relative h-60 sm:h-72 w-full bg-[#3D2723] overflow-hidden group">
            <img
              src={data.coverImage}
              alt="Couple Cover"
              className="w-full h-full object-cover object-center filter brightness-95 contrast-105 transition duration-500 group-hover:scale-105"
            />
          </div>
        </motion.div>
      </div>

      {/* Centered Bottom Bar - Size matches top window max-w-lg */}
      <div className="relative z-10 w-full max-w-lg mx-auto bg-[#FFF8F5]/90 border-2 border-[#442F2A] h-10 px-4 flex items-center justify-center rounded-lg shadow-md text-xs sm:text-sm font-pixel font-bold text-[#442F2A] tracking-wider text-center">
        <span className="animate-pulse">{data.coverBottomText || '點選任意區域即可進入主介面'}</span>
      </div>
    </div>
  );
};
