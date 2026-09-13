import React, { useState } from 'react';
import { soundPlayer } from '../utils/audioSynth';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Music, Minimize2, Maximize2, ListMusic } from 'lucide-react';

interface FloatingMusicPlayerProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onOpenMusicModal?: () => void;
}

export const FloatingMusicPlayer: React.FC<FloatingMusicPlayerProps> = ({
  isPlaying,
  onTogglePlay,
  onOpenMusicModal,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [showTrackList, setShowTrackList] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(soundPlayer.getCurrentTrackIndex());
  const [playlist, setPlaylist] = useState([...soundPlayer.tracks]);

  React.useEffect(() => {
    soundPlayer.onTracksUpdated(() => {
      setPlaylist([...soundPlayer.tracks]);
      setCurrentTrackIndex(soundPlayer.getCurrentTrackIndex());
    });
    soundPlayer.onTrackChange((idx) => {
      setCurrentTrackIndex(idx);
    });
  }, []);

  const currentTrack = soundPlayer.getCurrentTrack();

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundPlayer.nextTrack();
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundPlayer.prevTrack();
  };

  const handleSelectTrack = (index: number) => {
    soundPlayer.setTrack(index);
    if (!isPlaying) {
      soundPlayer.play();
    }
  };

  return (
    <div
      className="fixed bottom-13 right-4 z-40 select-none transition-all duration-200"
      id="floating-music-window"
    >
      {isMinimized ? (
        /* Minimized floating cassette pill */
        <button
          onClick={() => setIsMinimized(false)}
          className="pixel-btn bg-[#FFF8F5] border-2 border-[#442F2A] px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg hover:scale-105 transition cursor-pointer"
          title="點擊展開音樂盒"
        >
          <div className="relative">
            <Music className={`w-4 h-4 ${isPlaying ? 'text-[#C89398] animate-bounce' : 'text-[#442F2A]'}`} />
            {isPlaying && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#C89398] animate-ping" />
            )}
          </div>
          <span className="font-pixel text-xs font-bold text-[#442F2A] max-w-[110px] truncate">
            {currentTrack?.title || '♪ 無播放歌曲'}
          </span>
          <div className="flex items-end gap-0.5 h-3">
            <span className={`w-0.5 bg-[#442F2A] ${isPlaying ? 'h-2.5 animate-pulse' : 'h-1'}`} />
            <span className={`w-0.5 bg-[#442F2A] ${isPlaying ? 'h-3.5 animate-pulse delay-75' : 'h-1'}`} />
            <span className={`w-0.5 bg-[#442F2A] ${isPlaying ? 'h-2 animate-pulse delay-150' : 'h-1'}`} />
          </div>
          <Maximize2 className="w-3 h-3 text-[#442F2A]/60" />
        </button>
      ) : (
        /* Expanded Retro Music Player Window */
        <div className="w-72 bg-[#FFF8F5] border-2 border-[#442F2A] rounded-lg shadow-[4px_4px_0px_#442F2A] overflow-hidden">
          {/* Title Bar */}
          <div className="bg-[#442F2A] text-[#FFF8F5] px-2.5 py-1.5 flex items-center justify-between text-xs font-pixel">
            <div className="flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5 text-[#C89398]" />
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowTrackList(!showTrackList)}
                className="p-0.5 hover:bg-white/20 rounded cursor-pointer transition"
                title="切換曲目列表"
              >
                <ListMusic className="w-3.5 h-3.5 text-[#FFF8F5]" />
              </button>
              <button
                onClick={() => setIsMinimized(true)}
                className="p-0.5 hover:bg-white/20 rounded cursor-pointer transition"
                title="最小化"
              >
                <Minimize2 className="w-3.5 h-3.5 text-[#FFF8F5]" />
              </button>
            </div>
          </div>

          {/* Player Body */}
          <div className="p-3 bg-gradient-to-b from-[#FFF8F5] to-[#F8EDF1]">
            {/* Song Card */}
            <div className="bg-white border border-[#442F2A] p-2 rounded mb-2 shadow-inner">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-pixel font-bold text-[#442F2A] truncate">
                    {currentTrack?.title || '未選擇播放歌曲'}
                  </p>
                  {currentTrack?.artist && !/uploaded mp[34]/i.test(currentTrack.artist) && (
                    <p className="text-[10px] font-pixel text-[#442F2A]/70 truncate">
                      {currentTrack.artist}
                    </p>
                  )}
                </div>

                {/* Animated visualizer bars */}
                <div className="flex items-end gap-1 h-5 px-1 bg-[#F8EDF1] rounded border border-[#442F2A]/20">
                  <span className={`w-1 bg-[#442F2A] ${isPlaying ? 'h-3 animate-pulse' : 'h-1'}`} />
                  <span className={`w-1 bg-[#C89398] ${isPlaying ? 'h-4 animate-pulse delay-75' : 'h-1.5'}`} />
                  <span className={`w-1 bg-[#442F2A] ${isPlaying ? 'h-2 animate-pulse delay-150' : 'h-1'}`} />
                  <span className={`w-1 bg-[#E0BAC7] ${isPlaying ? 'h-3.5 animate-pulse delay-100' : 'h-1.5'}`} />
                </div>
              </div>

              {/* Progress bar visual */}
              <div className="w-full bg-[#E0BAC7]/40 h-1.5 rounded-full mt-2 overflow-hidden border border-[#442F2A]/20">
                <div className={`h-full bg-[#442F2A] ${isPlaying ? 'w-3/4 animate-pulse' : 'w-1/4'}`} />
              </div>
            </div>

            {/* Play Controls */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handlePrev}
                  className="w-7 h-7 pixel-btn rounded flex items-center justify-center text-xs"
                  title="上一首"
                >
                  <SkipBack className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={onTogglePlay}
                  className="w-8 h-8 pixel-btn bg-[#E0BAC7] rounded-full flex items-center justify-center text-[#442F2A] font-bold hover:scale-105 transition shadow"
                  title={isPlaying ? '暫停' : '播放'}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>

                <button
                  onClick={handleNext}
                  className="w-7 h-7 pixel-btn rounded flex items-center justify-center text-xs"
                  title="下一首"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                </button>
              </div>

              {onOpenMusicModal && (
                <button
                  onClick={onOpenMusicModal}
                  className="text-[10px] font-pixel bg-[#FFF8F5] hover:bg-[#E0BAC7] px-2 py-1 rounded border border-[#442F2A] text-[#442F2A] transition cursor-pointer"
                  title="打開曲庫與設定"
                >
                  曲目設定
                </button>
              )}
            </div>

            {/* Collapsible Track List within the floating window */}
            {showTrackList && (
              <div className="mt-2 pt-2 border-t border-[#442F2A]/20 space-y-1 max-h-32 overflow-y-auto pr-1">
                {playlist.map((track, idx) => {
                  const isCurrent = track.id === currentTrack.id;
                  return (
                    <button
                      key={track.id}
                      onClick={() => handleSelectTrack(idx)}
                      className={`w-full text-left px-2 py-1 rounded text-[10px] font-pixel flex items-center justify-between transition cursor-pointer ${
                        isCurrent
                          ? 'bg-[#442F2A] text-[#FFF8F5] font-bold'
                          : 'hover:bg-white text-[#442F2A]'
                      }`}
                    >
                      <span className="truncate">{track.title}</span>
                      <span className="text-[9px] opacity-70 shrink-0 ml-1">{track.bpm} BPM</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
