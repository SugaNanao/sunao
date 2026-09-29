import React, { useState, useEffect, useRef } from 'react';
import {
  Music,
  Play,
  Pause,
  Volume2,
  Disc,
  Trash2,
  RotateCcw,
  Upload,
  Link as LinkIcon,
  Check,
  AlertCircle,
  Loader2,
  SkipBack,
  SkipForward,
  Plus,
  FolderOpen,
} from 'lucide-react';
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

  // Upload UI State
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [songTitle, setSongTitle] = useState('');
  const [songArtist, setSongArtist] = useState('');
  const [songUrl, setSongUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const handleNext = () => {
    soundPlayer.nextTrack();
    setCurrentTrackIndex(soundPlayer.getCurrentTrackIndex());
    if (!isPlaying) onTogglePlay();
  };

  const handlePrev = () => {
    soundPlayer.prevTrack();
    setCurrentTrackIndex(soundPlayer.getCurrentTrackIndex());
    if (!isPlaying) onTogglePlay();
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    soundPlayer.setVolume(newVol);
  };

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
    setStatusMessage({ type: 'success', text: '已恢復內建預設音樂！' });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 50MB
    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setStatusMessage({
        type: 'error',
        text: `音訊檔案過大（${(file.size / (1024 * 1024)).toFixed(1)} MB），建議選擇 50MB 以內的音訊檔案。`,
      });
      return;
    }

    setSelectedFile(file);
    setStatusMessage(null);

    // Auto extract clean file name for title
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '').trim();
    if (!songTitle) {
      setSongTitle(nameWithoutExt);
    }
  };

  const handleSubmitUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (uploadMode === 'file') {
      if (!selectedFile) {
        setStatusMessage({ type: 'error', text: '請先選擇要上傳的本機音訊檔案（MP3/M4A/WAV/MP4）。' });
        return;
      }

      setIsUploading(true);
      try {
        // Read file as base64
        const reader = new FileReader();
        reader.onload = async () => {
          const fileData = reader.result as string;
          const cleanTitle = (songTitle || selectedFile.name.replace(/\.[^/.]+$/, '')).trim();
          const cleanArtist = songArtist.trim();

          let trackSrc = fileData;

          // Attempt server upload first for persistent disk storage and multi-device sharing
          try {
            const resp = await fetch('/api/upload-audio', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                filename: selectedFile.name,
                fileData,
                title: cleanTitle,
                artist: cleanArtist,
              }),
            });

            if (resp.ok) {
              const resJson = await resp.json();
              if (resJson.url) {
                trackSrc = resJson.url;
              }
            }
          } catch (uploadErr) {
            console.warn('Server audio upload failed, falling back to local storage:', uploadErr);
          }

          // Add to player & IndexedDB
          soundPlayer.addCustomTrack(cleanTitle, cleanArtist, trackSrc, selectedFile.size);

          setTracks([...soundPlayer.tracks]);
          setCurrentTrackIndex(soundPlayer.getCurrentTrackIndex());

          // Reset upload form
          setSelectedFile(null);
          setSongTitle('');
          setSongArtist('');
          if (fileInputRef.current) fileInputRef.current.value = '';
          setIsUploading(false);
          setShowUploadForm(false);

          setStatusMessage({ type: 'success', text: `✓ 成功上傳「${cleanTitle}」，已加入播放清單並開始播放！` });
          setTimeout(() => setStatusMessage(null), 4000);
        };

        reader.onerror = () => {
          setIsUploading(false);
          setStatusMessage({ type: 'error', text: '讀取音訊檔案失敗，請檢查檔案格式後重試。' });
        };

        reader.readAsDataURL(selectedFile);
      } catch (err: any) {
        setIsUploading(false);
        setStatusMessage({ type: 'error', text: err?.message || '上傳處理失敗' });
      }
    } else {
      // URL Mode
      const cleanUrl = songUrl.trim();
      if (!cleanUrl) {
        setStatusMessage({ type: 'error', text: '請輸入音訊檔案的網路網址（URL）。' });
        return;
      }
      if (!/^https?:\/\//i.test(cleanUrl)) {
        setStatusMessage({ type: 'error', text: '網址格式無效，請以 http:// 或 https:// 開頭。' });
        return;
      }

      const cleanTitle = (songTitle || '網路自訂音樂').trim();
      const cleanArtist = songArtist.trim();

      soundPlayer.addCustomTrack(cleanTitle, cleanArtist, cleanUrl);
      setTracks([...soundPlayer.tracks]);
      setCurrentTrackIndex(soundPlayer.getCurrentTrackIndex());

      setSongUrl('');
      setSongTitle('');
      setSongArtist('');
      setShowUploadForm(false);

      setStatusMessage({ type: 'success', text: `✓ 成功新增「${cleanTitle}」，已加入播放清單！` });
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="pixel-window w-full max-w-lg rounded-lg overflow-hidden shadow-2xl bg-[#FFF8F5] max-h-[92vh] flex flex-col" id="music-jukebox-modal">
        {/* Title Bar */}
        <div className="bg-[#442F2A] text-[#FFF8F5] px-3.5 py-2.5 flex items-center justify-between font-pixel text-xs tracking-wider shrink-0">
          <div className="flex items-center gap-2">
            <Disc className={`w-4 h-4 text-[#E0BAC7] ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
            <span className="font-bold">音樂盒設定 (Music Jukebox)</span>
          </div>
          <button
            onClick={onClose}
            className="w-5 h-5 bg-[#E0BAC7] text-[#442F2A] rounded flex items-center justify-center font-bold hover:bg-[#C89398] cursor-pointer"
            title="關閉音樂盒"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Container */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* Status Feedback Toast */}
          {statusMessage && (
            <div
              className={`p-2.5 rounded border text-xs font-pixel flex items-center gap-2 transition-all ${
                statusMessage.type === 'success'
                  ? 'bg-green-50 text-green-900 border-green-300'
                  : 'bg-red-50 text-red-900 border-red-300'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <Check className="w-4 h-4 text-green-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span className="flex-1">{statusMessage.text}</span>
            </div>
          )}

          {/* Visual Vinyl Record & Equalizer */}
          <div className="flex items-center gap-3 sm:gap-4 bg-white p-3 rounded-lg border-2 border-[#442F2A] shadow-inner">
            <div
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#442F2A] border-4 border-[#E0BAC7] flex items-center justify-center text-white shrink-0 shadow ${isPlaying ? 'animate-spin' : ''}`}
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
              <div className="flex items-end gap-1 h-3.5 mt-1.5">
                {[4, 8, 12, 16, 10, 14, 6, 12, 8, 14, 6, 11].map((h, i) => (
                  <span
                    key={i}
                    className="w-1 bg-[#442F2A] transition-all duration-150"
                    style={{
                      height: isPlaying && currentTrack ? `${Math.max(3, (h * (i % 2 === 0 ? 1.2 : 0.8)) % 15)}px` : '3px',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Volume Slider */}
          <div className="flex items-center gap-3 bg-[#FFF8F5] border border-[#442F2A]/20 p-2.5 rounded text-xs font-pixel text-[#442F2A]">
            <Volume2 className="w-4 h-4 text-[#442F2A] shrink-0" />
            <span className="shrink-0 font-bold">VOLUME：</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-full accent-[#442F2A] cursor-pointer"
            />
            <span className="w-9 text-right font-mono font-bold">{Math.round(volume * 100)}%</span>
          </div>

          {/* Upload Toggle & Actions Bar */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="pixel-btn px-3 py-1.5 bg-[#E0BAC7] hover:bg-[#d8a8b8] text-xs font-pixel font-bold text-[#442F2A] rounded flex items-center gap-1.5 cursor-pointer shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showUploadForm ? '收合上傳面板' : '上傳專屬音樂 (MP3/MP4)'}</span>
            </button>

            <button
              onClick={handleRestoreDefaults}
              className="text-[10px] font-pixel text-[#442F2A]/75 hover:text-[#442F2A] hover:underline flex items-center gap-1 cursor-pointer shrink-0"
              title="恢復所有內建預設音樂"
            >
              <RotateCcw className="w-3 h-3" />
              <span>恢復預設音樂</span>
            </button>
          </div>

          {/* Expandable Upload Panel */}
          {showUploadForm && (
            <div className="bg-white p-3.5 rounded-lg border-2 border-[#442F2A] shadow-md space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-[#442F2A]/20 pb-2">
                <span className="text-xs font-pixel font-bold text-[#442F2A] flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-[#C89398]" />
                  上傳專屬 BGM 音樂
                </span>
                {/* Mode Switch Tabs */}
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setUploadMode('file')}
                    className={`px-2 py-0.5 text-[10px] font-pixel rounded cursor-pointer transition ${
                      uploadMode === 'file'
                        ? 'bg-[#442F2A] text-white font-bold'
                        : 'bg-[#F8EDF1] text-[#442F2A] hover:bg-[#E0BAC7]'
                    }`}
                  >
                    本機檔案
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMode('url')}
                    className={`px-2 py-0.5 text-[10px] font-pixel rounded cursor-pointer transition ${
                      uploadMode === 'url'
                        ? 'bg-[#442F2A] text-white font-bold'
                        : 'bg-[#F8EDF1] text-[#442F2A] hover:bg-[#E0BAC7]'
                    }`}
                  >
                    網路連結
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmitUpload} className="space-y-3">
                {uploadMode === 'file' ? (
                  <div>
                    <label className="block text-[11px] font-pixel font-bold text-[#442F2A] mb-1">
                      選擇音訊檔案 (支援 MP3, M4A, WAV, MP4, AAC 等，上限 50MB)：
                    </label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-[#442F2A]/40 hover:border-[#442F2A] bg-[#FFF8F5] p-3 rounded text-center cursor-pointer transition flex flex-col items-center justify-center gap-1 group"
                    >
                      <FolderOpen className="w-6 h-6 text-[#C89398] group-hover:scale-110 transition" />
                      <span className="text-xs font-pixel text-[#442F2A] font-bold">
                        {selectedFile ? selectedFile.name : '點擊此處選擇本機音訊檔案'}
                      </span>
                      {selectedFile ? (
                        <span className="text-[10px] font-pixel text-[#C89398]">
                          檔案大小：{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </span>
                      ) : (
                        <span className="text-[10px] font-pixel text-[#442F2A]/60">
                          點擊開啟電腦或手機檔案瀏覽器
                        </span>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="audio/*,.mp3,.m4a,.wav,.ogg,.mp4,.aac,.flac,.webm"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-pixel font-bold text-[#442F2A] mb-1">
                      音訊檔案網路網址 (URL)：
                    </label>
                    <div className="flex items-center gap-2 bg-[#FFF8F5] border border-[#442F2A]/40 rounded px-2.5 py-1.5">
                      <LinkIcon className="w-3.5 h-3.5 text-[#442F2A]/60 shrink-0" />
                      <input
                        type="url"
                        value={songUrl}
                        onChange={(e) => setSongUrl(e.target.value)}
                        placeholder="https://example.com/sweet_song.mp3"
                        className="w-full text-xs font-pixel outline-none bg-transparent text-[#442F2A]"
                      />
                    </div>
                  </div>
                )}

                {/* Metadata Fields: Song Title & Artist */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-pixel font-bold text-[#442F2A] mb-0.5">
                      曲名 (Song Title)：
                    </label>
                    <input
                      type="text"
                      value={songTitle}
                      onChange={(e) => setSongTitle(e.target.value)}
                      placeholder="例：戀愛循環"
                      className="w-full px-2 py-1 text-xs font-pixel border border-[#442F2A]/40 rounded bg-[#FFF8F5] focus:bg-white text-[#442F2A]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-pixel font-bold text-[#442F2A] mb-0.5">
                      歌手 / 備註 (Artist, 選填)：
                    </label>
                    <input
                      type="text"
                      value={songArtist}
                      onChange={(e) => setSongArtist(e.target.value)}
                      placeholder="例：花澤香菜"
                      className="w-full px-2 py-1 text-xs font-pixel border border-[#442F2A]/40 rounded bg-[#FFF8F5] focus:bg-white text-[#442F2A]"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowUploadForm(false)}
                    className="pixel-btn px-3 py-1 text-xs font-pixel rounded text-[#442F2A]"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading || (uploadMode === 'file' && !selectedFile) || (uploadMode === 'url' && !songUrl.trim())}
                    className="pixel-btn px-4 py-1 bg-[#E0BAC7] hover:bg-[#d8a8b8] disabled:opacity-50 text-xs font-pixel font-bold rounded text-[#442F2A] flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>處理上傳中...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>確認上傳並播放</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Playlist Track Items */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-pixel font-bold text-[#442F2A] tracking-wider">
                PLAYLIST 曲目列表 ({tracks.length})：
              </span>
            </div>

            <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
              {tracks.length === 0 ? (
                <div className="p-4 bg-white rounded border border-[#442F2A]/20 text-center text-xs font-pixel text-[#442F2A]/70 space-y-2">
                  <p>目前播放清單中沒有任何歌曲。</p>
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => setShowUploadForm(true)}
                      className="pixel-btn px-3 py-1 bg-[#E0BAC7] text-xs font-pixel font-bold rounded text-[#442F2A]"
                    >
                      + 上傳專屬音樂
                    </button>
                    <button
                      onClick={handleRestoreDefaults}
                      className="pixel-btn px-3 py-1 bg-white text-xs font-pixel rounded text-[#442F2A]"
                    >
                      恢復預設音樂
                    </button>
                  </div>
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
                          <span className={`text-[9px] px-1 rounded font-bold shrink-0 ${isSelected ? 'bg-[#E0BAC7] text-[#442F2A]' : 'bg-[#E0BAC7]/60 text-[#442F2A]'}`}>
                            MP3/MP4
                          </span>
                        ) : (
                          <span className={`text-[9px] px-1 rounded font-bold shrink-0 ${isSelected ? 'bg-amber-300 text-amber-950' : 'bg-amber-100 text-amber-900'}`}>
                            8-BIT
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        {track.artist && !/uploaded mp[34]/i.test(track.artist) && (
                          <span className={`text-[10px] truncate max-w-[80px] sm:max-w-[100px] ${isSelected ? 'text-white/80' : 'opacity-70'}`}>
                            {track.artist}
                          </span>
                        )}
                        <button
                          onClick={(e) => handleRemoveTrack(e, track.id)}
                          className={`p-1 rounded cursor-pointer transition ${
                            isSelected
                              ? 'text-white/80 hover:text-red-300 hover:bg-white/10'
                              : 'text-neutral-400 hover:text-red-600 hover:bg-[#F8EDF1]'
                          }`}
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

          {/* Bottom Controls Bar */}
          <div className="flex items-center justify-between pt-3 border-t border-[#442F2A]/20 shrink-0">
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrev}
                disabled={tracks.length === 0}
                className="pixel-btn p-1.5 bg-[#FFF8F5] disabled:opacity-50 text-xs font-pixel rounded cursor-pointer"
                title="上一首"
              >
                <SkipBack className="w-3.5 h-3.5 text-[#442F2A]" />
              </button>

              <button
                onClick={onTogglePlay}
                disabled={tracks.length === 0}
                className="pixel-btn px-4 py-1.5 bg-[#E0BAC7] hover:bg-[#d8a8b8] disabled:opacity-50 text-xs font-pixel font-bold rounded flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
              </button>

              <button
                onClick={handleNext}
                disabled={tracks.length === 0}
                className="pixel-btn p-1.5 bg-[#FFF8F5] disabled:opacity-50 text-xs font-pixel rounded cursor-pointer"
                title="下一首"
              >
                <SkipForward className="w-3.5 h-3.5 text-[#442F2A]" />
              </button>
            </div>

            <button
              onClick={onClose}
              className="pixel-btn px-4 py-1.5 text-xs font-pixel rounded cursor-pointer"
            >
              CLOSE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
