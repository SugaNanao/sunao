import React, { useState, useEffect } from 'react';
import { Music, Play, Pause, Volume2, Disc, Trash2, RotateCcw } from 'lucide-react';
import { soundPlayer, Track } from '../utils/audioSynth';

interface MusicModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export const MusicModal: React.FC<MusicModalProps> = ({
  isOpen,
  onClose,
  isPlaying,
  onTogglePlay,
}) => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(soundPlayer.getCurrentTrackIndex());
  const [volume, setVolume] = useState(soundPlayer.getVolume());
  const [tracks, setTracks] = useState<Track[]>([...soundPlayer.tracks]);

  useEffect(() => {
    const updateTracks = () => {
      setTracks([...soundPlayer.tracks]);
      setCurrentTrackIndex(soundPlayer.getCurrentTrackIndex());
    };
    soundPlayer.onTracksUpdated(updateTracks);
    soundPlayer.onTrackChange((idx) => setCurrentTrackIndex(idx));
  }, []);

  if (!isOpen) return null;

  const currentTrack = tracks[currentTrackIndex] || soundPlayer.getCurrentTrack();

  const handleSelectTrack = (idx: number) => {
    soundPlayer.setTrack(idx);
    setCurrentTrackIndex(idx);
    if (!isPlaying) onTogglePlay();
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    soundPlayer.setVolume(newVol);
  };

  // User requested: delete ANY music including default music!
  const handleRemoveTrack = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    soundPlayer.removeTrack(id);
    setTracks([...soundPlayer.tracks]);
    setCurrentTrackIndex(soundPlayer.getCurrentTrackIndex());
  };

  const handleRestoreDefaults = () => {
    soundPlayer.restoreDefaultTracks();
    setTracks([...soundPlayer.tracks]);
    setCurrentTrackIndex(soundPlayer.getCurrentTrackIndex());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-none">
      <div className="pixel-window w-full max-w-md rounded-lg overflow-hidden shadow-2xl bg-[#FFF8F5]" id="music-jukebox-modal">
        {/* Title Bar */}
        <div className="bg-[#442F2A] text-[#FFF8F5] px-3 py-2 flex items-center justify-between font-pixel text-xs tracking-wider">
          <div className="flex items-center gap-2">
            <Disc className="w-4 h-4 text-[#E0BAC7] animate-spin" />
          </div>
          <button
            onClick={onClose}
            className="w-5 h-5 bg-[#E0BAC7] text-[#442F2A] rounded flex items-center justify-center font-bold hover:bg-[#C89398] cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Visual Vinyl Record & Equalizer */}
          <div className="flex items-center gap-4 bg-white p-3 rounded-lg border-2 border-[#442F2A] shadow-inner">
            <div
              className={`w-16 h-16 rounded-full bg-[#442F2A] border-4 border-[#E0BAC7] flex items-center justify-center text-white shrink-0 shadow ${isPlaying ? 'animate-spin' : ''}`}
              style={{ animationDuration: '4s' }}
            >
              <Music className="w-6 h-6 text-[#E0BAC7]" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-pixel text-[#C89398] font-bold block">
                  {isPlaying ? '♪ NOW PLAYING' : '❚❚ PAUSED'}
                </span>
              </div>
              <h4 className="font-pixel font-bold text-xs sm:text-sm text-[#442F2A] truncate">
                {currentTrack?.title || '未選擇播放曲目'}
              </h4>
              {currentTrack?.artist && !/uploaded mp[34]/i.test(currentTrack.artist) && (
                <p className="text-[11px] font-pixel text-[#442F2A]/70 truncate">
                  {currentTrack.artist}
                </p>
              )}

              {/* Animated retro visualizer bars */}
              <div className="flex items-end gap-1 h-4 mt-2">
                {[4, 8, 12, 16, 10, 14, 6, 12, 8, 14].map((h, i) => (
                  <span
                    key={i}
                    className="w-1.5 bg-[#442F2A] transition-all duration-150"
                    style={{
                      height: isPlaying && currentTrack ? `${Math.max(3, (h * (i % 2 === 0 ? 1.2 : 0.8)) % 16)}px` : '3px',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Volume Slider */}
          <div className="flex items-center gap-3 bg-[#FFF8F5] border border-[#442F2A]/20 p-2.5 rounded text-xs font-pixel text-[#442F2A]">
            <Volume2 className="w-4 h-4 text-[#442F2A]" />
            <span className="shrink-0">VOLUME：</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-full accent-[#442F2A] cursor-pointer"
            />
            <span className="w-8 text-right">{Math.round(volume * 100)}%</span>
          </div>

          {/* Playlist Track Items */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-pixel font-bold text-[#442F2A] tracking-wider">
                PLAYLIST：
              </span>
              <button
                onClick={handleRestoreDefaults}
                className="text-[10px] font-pixel text-[#442F2A]/75 hover:text-[#442F2A] hover:underline flex items-center gap-1 cursor-pointer"
                title="恢復所有內建預設音樂"
              >
                <RotateCcw className="w-3 h-3" />
                <span>恢復預設音樂</span>
              </button>
            </div>

            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              {tracks.length === 0 ? (
                <div className="p-4 bg-white rounded border border-[#442F2A]/20 text-center text-xs font-pixel text-[#442F2A]/70 space-y-2">
                  <p>目前播放清單中沒有任何歌曲。</p>
                  <button
                    onClick={handleRestoreDefaults}
                    className="pixel-btn px-3 py-1 bg-[#E0BAC7] text-xs font-pixel font-bold rounded text-[#442F2A]"
                  >
                    恢復預設音樂
                  </button>
                </div>
              ) : (
                tracks.map((track, idx) => {
                  const isSelected = idx === currentTrackIndex;
                  return (
                    <div
                      key={track.id}
                      onClick={() => handleSelectTrack(idx)}
                      className={`w-full p-2.5 rounded border-2 text-left font-pixel text-xs transition flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-[#442F2A] text-white border-[#442F2A] shadow-sm'
                          : 'bg-white text-[#442F2A] border-[#442F2A]/30 hover:border-[#442F2A] hover:bg-[#F8EDF1]'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                        <span className="font-bold">{isSelected && isPlaying ? '▶' : `${idx + 1}.`}</span>
                        <span className="truncate">{track.title}</span>
                        {track.isCustom ? (
                          <span className="text-[9px] bg-[#E0BAC7] text-[#442F2A] px-1 rounded font-bold shrink-0">
                            MP3/MP4
                          </span>
                        ) : (
                          <span className="text-[9px] bg-amber-100 text-amber-900 px-1 rounded font-bold shrink-0">
                            8-BIT
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        {track.artist && !/uploaded mp[34]/i.test(track.artist) && (
                          <span className="text-[10px] opacity-70 truncate max-w-[80px]">
                            {track.artist}
                          </span>
                        )}
                        <button
                          onClick={(e) => handleRemoveTrack(e, track.id)}
                          className="p-1 hover:text-red-600 hover:bg-[#F8EDF1] rounded text-neutral-400 cursor-pointer transition"
                          title={`刪除「${track.title}」`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Bottom Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-[#442F2A]/20">
            <button
              onClick={onTogglePlay}
              disabled={tracks.length === 0}
              className="pixel-btn px-4 py-1.5 bg-[#E0BAC7] disabled:opacity-50 text-xs font-pixel font-bold rounded flex items-center gap-1.5"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
            </button>

            <button
              onClick={onClose}
              className="pixel-btn px-3 py-1.5 text-xs font-pixel rounded"
            >
              CLOSE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
