import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface LoadingScreenProps {
  onComplete: () => void;
}

// 8-bit Retro Pixel Heart SVG Component
const PixelHeart: React.FC<{ color: string; size?: number; className?: string }> = ({
  color,
  size = 28,
  className = '',
}) => (
  <svg
    width={size}
    height={Math.round(size * 0.875)}
    viewBox="0 0 16 14"
    fill={color}
    className={`inline-block select-none ${className}`}
  >
    {/* Row 1 */}
    <rect x="2" y="1" width="3" height="1" />
    <rect x="9" y="1" width="3" height="1" />
    {/* Row 2 */}
    <rect x="1" y="2" width="5" height="1" />
    <rect x="8" y="2" width="5" height="1" />
    {/* Row 3 */}
    <rect x="1" y="3" width="12" height="1" />
    {/* Row 4 */}
    <rect x="1" y="4" width="12" height="1" />
    {/* Row 5 */}
    <rect x="2" y="5" width="10" height="1" />
    {/* Row 6 */}
    <rect x="3" y="6" width="8" height="1" />
    {/* Row 7 */}
    <rect x="4" y="7" width="6" height="1" />
    {/* Row 8 */}
    <rect x="5" y="8" width="4" height="1" />
    {/* Row 9 */}
    <rect x="6" y="9" width="2" height="1" />
  </svg>
);

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(12);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 450);
          return 100;
        }
        // Slower progression jump like vintage OS loading
        const jump = Math.floor(Math.random() * 7) + 4;
        return Math.min(100, prev + jump);
      });
    }, 240);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center dot-bg p-4 select-none">
      {/* Retro OS Window */}
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-lg pixel-window rounded-lg overflow-hidden flex flex-col shadow-2xl"
        id="loading-window"
      >
        {/* Retro Window Header */}
        <div className="bg-[#442F2A] text-[#FFF8F5] px-3 py-1.5 flex items-center justify-between font-pixel text-xs tracking-wider">
          <div className="flex items-center gap-2">
            <PixelHeart color="#C89398" size={16} />
            <span>SUNAO.LOVE</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="w-4 h-4 bg-[#FFF8F5] text-[#442F2A] flex items-center justify-center font-bold leading-none">_</span>
            <span className="w-4 h-4 bg-[#FFF8F5] text-[#442F2A] flex items-center justify-center font-bold leading-none">□</span>
            <span className="w-4 h-4 bg-[#C89398] text-[#442F2A] flex items-center justify-center font-bold leading-none">✕</span>
          </div>
        </div>

        {/* Window Content */}
        <div className="p-6 flex flex-col items-center text-center bg-[#FFF8F5]">
          {/* Floating Pink & Brown Pixel Hearts Box (No cover image as requested) */}
          <div className="relative w-full h-48 sm:h-56 rounded border-2 border-[#442F2A] overflow-hidden mb-5 bg-[#F8EDF1] flex items-center justify-center shadow-inner">
            {/* Soft decorative background dots */}
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#442F2A_1px,transparent_1px)] [background-size:16px_16px]" />

            {/* Top Left Badge */}
            <div className="absolute top-3 left-3 bg-[#FFF8F5] border border-[#442F2A] px-2 py-0.5 rounded text-[11px] font-pixel text-[#442F2A] shadow-xs">
              ★ 君の心を映す
            </div>

            {/* Top Right Mini Floating Pink Heart */}
            <motion.div
              animate={{ y: [-4, 6, -4], rotate: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}
              className="absolute top-4 right-6"
            >
              <PixelHeart color="#C89398" size={26} />
            </motion.div>

            {/* Bottom Left Mini Floating Brown Heart */}
            <motion.div
              animate={{ y: [6, -5, 6], rotate: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 3.1, ease: 'easeInOut', delay: 0.3 }}
              className="absolute bottom-5 left-8"
            >
              <PixelHeart color="#442F2A" size={22} />
            </motion.div>

            {/* Top Center-Left Floating Small Brown Heart */}
            <motion.div
              animate={{ y: [-3, 5, -3], x: [-2, 2, -2] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut', delay: 0.6 }}
              className="absolute top-6 left-1/4"
            >
              <PixelHeart color="#442F2A" size={16} />
            </motion.div>

            {/* Bottom Right Floating Small Pink Heart */}
            <motion.div
              animate={{ y: [4, -4, 4], x: [2, -2, 2] }}
              transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut', delay: 0.9 }}
              className="absolute bottom-6 right-1/4"
            >
              <PixelHeart color="#C89398" size={20} />
            </motion.div>

            {/* Center Main Stage: Intertwined Pink & Brown Pixel Hearts */}
            <div className="relative flex items-center justify-center">
              {/* Brown Pixel Heart */}
              <motion.div
                animate={{
                  y: [0, -8, 0],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2.2,
                  ease: 'easeInOut',
                }}
                className="relative -mr-3 z-10 drop-shadow-md"
              >
                <PixelHeart color="#442F2A" size={54} />
              </motion.div>

              {/* Pink Pixel Heart (#C89398) */}
              <motion.div
                animate={{
                  y: [0, -8, 0],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2.2,
                  ease: 'easeInOut',
                  delay: 0.25,
                }}
                className="relative -ml-3 z-20 drop-shadow-md"
              >
                <PixelHeart color="#C89398" size={58} />
              </motion.div>
            </div>
          </div>

          {/* Retro Progress Bar */}
          <div className="w-full max-w-sm mb-2">
            <div className="flex items-center justify-between text-xs font-pixel font-bold text-[#442F2A] mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 bg-[#442F2A] rounded-full animate-ping" />
                <span>LOADING...</span>
              </div>
              <span className="font-press-start text-[10px] text-[#442F2A]">{progress}%</span>
            </div>

            {/* Inset Pixel Bar Container */}
            <div className="h-6 w-full border-2 border-[#442F2A] bg-white p-0.5 rounded shadow-inner relative flex items-center">
              <motion.div
                className="h-full bg-gradient-to-r from-[#C89398] to-[#E0BAC7] border-r border-[#442F2A] transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
              {/* Pixel heart progress indicator */}
              <div
                className="absolute top-1/2 -translate-y-1/2 -ml-2.5 transition-all duration-150"
                style={{ left: `${progress}%` }}
              >
                <div className="w-5 h-5 bg-[#FFF8F5] border border-[#442F2A] rounded-full flex items-center justify-center shadow-sm">
                  <PixelHeart color="#C89398" size={11} />
                </div>
              </div>
            </div>
          </div>

          {/* Memory Cache Notice */}
          <p className="text-[12px] font-pixel text-[#442F2A]/70 mt-3">
            載入甜蜜回憶中... 正在解壓縮浪漫碎片 ♡
          </p>

          {/* Quick Skip button */}
          <button
            onClick={onComplete}
            className="mt-4 text-[11px] font-pixel text-[#442F2A]/80 hover:text-[#442F2A] underline cursor-pointer"
          >
            [ 跳過載入 SKIP &gt;&gt; ]
          </button>
        </div>
      </motion.div>
    </div>
  );
};
