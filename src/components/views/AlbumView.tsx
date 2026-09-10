import React, { useState } from 'react';
import { CoupleSiteData, AlbumPhoto } from '../../types';
import { PixelHeart } from '../PixelHeart';
import { Camera, Image as ImageIcon, MapPin, Calendar, Plus, Edit, X, Upload } from 'lucide-react';

interface AlbumViewProps {
  data: CoupleSiteData;
  isEditMode: boolean;
  onEditSection: (section: string) => void;
  onAddPhoto?: (photo: AlbumPhoto) => void;
}

const PRESET_PHOTO_TAGS = [
  'いつもの景色',
  '季節のしるし',
  'ともに過ごした日々',
];

export const AlbumView: React.FC<AlbumViewProps> = ({
  data,
  isEditMode,
  onEditSection,
  onAddPhoto,
}) => {
  const ALBUM_CATEGORIES = [
    { key: '記憶のかけら', label: '記憶のかけら', isAll: true },
    { key: 'いつもの景色', label: 'いつもの景色', isAll: false },
    { key: '季節のしるし', label: '季節のしるし', isAll: false },
    { key: 'ともに過ごした日々', label: 'ともに過ごした日々', isAll: false },
  ];

  const [selectedTag, setSelectedTag] = useState<string>('記憶のかけら');
  const [lightboxPhoto, setLightboxPhoto] = useState<AlbumPhoto | null>(null);
  const [isAddingPhoto, setIsAddingPhoto] = useState(false);

  // New photo quick state
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [newPhotoDate, setNewPhotoDate] = useState(new Date().toISOString().slice(0, 10).replace(/-/g, '.'));
  const [newPhotoLocation, setNewPhotoLocation] = useState('');
  const [newPhotoTag, setNewPhotoTag] = useState<string>('いつもの景色');

  // Filter photos based on selection
  const filteredPhotos = data.album.filter((photo) => {
    if (selectedTag === '記憶のかけら' || selectedTag === '全部') {
      return true;
    }
    const cleanTag = (photo.tag || '').replace(/^#/, '').trim();
    return cleanTag === selectedTag;
  });

  const handleQuickAddPhoto = () => {
    if (!newPhotoUrl.trim()) return;
    const photo: AlbumPhoto = {
      id: 'p-' + Date.now(),
      url: newPhotoUrl.trim(),
      caption: newPhotoCaption.trim() || '甜蜜心動瞬間',
      date: newPhotoDate.trim() || '2026.01.01',
      location: newPhotoLocation.trim(),
      tag: newPhotoTag,
    };

    if (onAddPhoto) {
      onAddPhoto(photo);
    } else {
      data.album.unshift(photo);
    }

    setNewPhotoUrl('');
    setNewPhotoCaption('');
    setNewPhotoLocation('');
    setIsAddingPhoto(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setNewPhotoUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col gap-6" id="album-view">
      {/* Header */}
      <div className="pixel-card p-4 bg-white relative">
        <div className="text-center">
          <h2 className="text-lg font-pixel font-bold text-[#442F2A]">
            <span>ALBUM</span>
          </h2>
          <p className="text-xs font-pixel text-[#442F2A]/70 mt-0.5">
            每一張照片都是定格永恆的心動瞬間 📷✨
          </p>
        </div>

        <div className="flex items-center gap-2 absolute right-4 top-1/2 -translate-y-1/2">
          {isEditMode && (
            <>
              <button
                onClick={() => onEditSection('album')}
                className="pixel-btn px-2.5 py-1 text-xs font-pixel font-bold bg-[#E0BAC7] flex items-center gap-1 rounded cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">管理相片清單</span>
              </button>
              <button
                onClick={() => setIsAddingPhoto(true)}
                className="pixel-btn px-3 py-1 text-xs font-pixel font-bold bg-[#442F2A] text-white flex items-center gap-1 rounded cursor-pointer hover:bg-[#C89398]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>新增相片</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tag Filters: Strictly ONLY 4 tags */}
      <div className="flex items-center gap-2 flex-wrap">
        {ALBUM_CATEGORIES.map((cat) => {
          const isSelected = selectedTag === cat.key;
          const count = cat.isAll
            ? data.album.length
            : data.album.filter((p) => (p.tag || '').replace(/^#/, '').trim() === cat.key).length;

          return (
            <button
              key={cat.key}
              onClick={() => setSelectedTag(cat.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-pixel font-bold border-2 transition cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#442F2A] text-[#FFF8F5] border-[#442F2A] shadow-inner'
                  : 'bg-[#FFF8F5] text-[#442F2A] border-[#442F2A] hover:bg-[#E0BAC7]/50'
              }`}
            >
              <span>#{cat.label}</span>
              <span
                className={`text-[10px] px-1 py-0.2 rounded font-normal ${
                  isSelected ? 'bg-white/20 text-[#FFF8F5]' : 'bg-[#E0BAC7] text-[#442F2A]'
                }`}
              >
                {cat.isAll ? `全 ${count} 枚` : `${count}`}
              </span>
            </button>
          );
        })}
      </div>

      {/* Polaroid Photos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredPhotos.map((photo, idx) => (
          <div
            key={photo.id || idx}
            onClick={() => setLightboxPhoto(photo)}
            className="bg-[#FFF8F5] border-3 border-[#442F2A] p-3 rounded-lg shadow-lg hover:rotate-1 hover:scale-103 transition duration-200 cursor-pointer flex flex-col justify-between group"
          >
            {/* Photo Paper Frame */}
            <div>
              <div className="h-52 w-full overflow-hidden border border-[#442F2A]/30 rounded bg-neutral-100 relative">
                <img
                  src={photo.url}
                  alt={photo.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500 filter contrast-105"
                />
                <div className="absolute top-2 right-2 bg-white/90 border border-[#442F2A] text-[10px] font-pixel px-1.5 py-0.5 rounded shadow-sm">
                  #{photo.tag ? photo.tag.replace(/^#/, '') : 'いつもの景色'}
                </div>
              </div>

              {/* Caption */}
              <div className="pt-3 pb-1">
                <p className="font-pixel text-xs sm:text-sm font-bold text-[#442F2A] line-clamp-2">
                  {photo.caption && photo.caption.trim() ? photo.caption : '敬請期待'}
                </p>
              </div>
            </div>

            {/* Bottom Meta */}
            <div className="flex items-center justify-between text-[10px] font-pixel text-[#442F2A]/60 pt-2 border-t border-[#442F2A]/15 mt-2">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#C89398]" />
                <span>{photo.date || '2026.01.01'}</span>
              </span>
              {photo.location && (
                <span className="flex items-center gap-1 truncate max-w-[120px]">
                  <MapPin className="w-3 h-3 text-[#C89398]" />
                  <span className="truncate">{photo.location}</span>
                </span>
              )}
            </div>
          </div>
        ))}

        {filteredPhotos.length === 0 && (
          <div className="col-span-full flex items-center justify-center py-14">
            <div className="bg-[#FFF8F5] border-2 border-[#442F2A] rounded-lg px-8 py-5 text-center shadow-md font-pixel">
              <span className="text-sm font-bold text-[#442F2A] tracking-wider">
                ［ 敬請期待 ］
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Add Photo Modal with Tag Dropdown Selection */}
      {isEditMode && isAddingPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
          <div className="pixel-window max-w-md w-full flex flex-col rounded-lg overflow-hidden shadow-2xl bg-white">
            {/* Header */}
            <div className="bg-[#442F2A] text-[#FFF8F5] px-4 py-2.5 flex items-center justify-between font-pixel text-xs">
              <span className="font-bold">ADD NEW PHOTO // 新增相簿照片</span>
              <button
                onClick={() => setIsAddingPhoto(false)}
                className="w-5 h-5 bg-[#E0BAC7] text-[#442F2A] rounded flex items-center justify-center font-bold hover:bg-[#C89398] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-5 bg-[#FFF8F5] space-y-4 font-pixel text-xs text-[#442F2A]">
              <div>
                <label className="font-bold block mb-1">相片來源 (URL 或 本機上傳)：</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                    className="flex-1 bg-white border-2 border-[#442F2A] rounded p-2 text-xs"
                  />
                  <label className="pixel-btn px-3 py-1.5 bg-[#E0BAC7] text-[#442F2A] rounded text-xs flex items-center gap-1 cursor-pointer font-bold shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>上傳</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
              </div>

              {/* Preview if url provided */}
              {newPhotoUrl && (
                <div className="h-40 w-full rounded border-2 border-[#442F2A] overflow-hidden bg-neutral-100">
                  <img src={newPhotoUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

              {/* Tag Selection (Selectable chips & dropdown so no manual typing) */}
              <div>
                <label className="font-bold block mb-1">
                  選擇標籤 (Select Preset Tag - 免手打)：
                </label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {PRESET_PHOTO_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setNewPhotoTag(tag)}
                      className={`p-2 rounded text-xs font-pixel font-bold border transition text-center cursor-pointer ${
                        newPhotoTag === tag
                          ? 'bg-[#442F2A] text-white border-[#442F2A] shadow-inner'
                          : 'bg-white text-[#442F2A] border-[#442F2A]/30 hover:bg-[#E0BAC7]/40'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
                <select
                  value={newPhotoTag}
                  onChange={(e) => setNewPhotoTag(e.target.value)}
                  className="w-full bg-white border-2 border-[#442F2A] rounded p-2 text-xs font-pixel"
                >
                  {PRESET_PHOTO_TAGS.map((tag) => (
                    <option key={tag} value={tag}>
                      #{tag}
                    </option>
                  ))}
                </select>
              </div>

              {/* Caption */}
              <div>
                <label className="font-bold block mb-1">相片敘述 (Caption)：</label>
                <input
                  type="text"
                  placeholder="留下一句浪漫的紀念..."
                  value={newPhotoCaption}
                  onChange={(e) => setNewPhotoCaption(e.target.value)}
                  className="w-full bg-white border-2 border-[#442F2A] rounded p-2 text-xs"
                />
              </div>

              {/* Date & Location */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">拍攝日期：</label>
                  <input
                    type="text"
                    value={newPhotoDate}
                    onChange={(e) => setNewPhotoDate(e.target.value)}
                    className="w-full bg-white border-2 border-[#442F2A] rounded p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">拍攝地點：</label>
                  <input
                    type="text"
                    placeholder="例：仙台體育館"
                    value={newPhotoLocation}
                    onChange={(e) => setNewPhotoLocation(e.target.value)}
                    className="w-full bg-white border-2 border-[#442F2A] rounded p-2 text-xs"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2 border-t border-[#442F2A]/20">
                <button
                  onClick={() => setIsAddingPhoto(false)}
                  className="px-3 py-1.5 rounded border border-[#442F2A]/40 text-xs font-pixel cursor-pointer"
                >
                  取消
                </button>
                <button
                  onClick={handleQuickAddPhoto}
                  disabled={!newPhotoUrl.trim()}
                  className="pixel-btn px-4 py-1.5 bg-[#C89398] text-white rounded text-xs font-pixel font-bold cursor-pointer disabled:opacity-50"
                >
                  確認儲存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none">
          <div className="pixel-window max-w-xl w-full flex flex-col rounded-lg overflow-hidden shadow-2xl bg-white">
            {/* Header */}
            <div className="bg-[#442F2A] text-[#FFF8F5] px-4 py-2 flex items-center justify-between font-pixel text-xs">
              <span className="font-bold">PHOTO VIEWER // {lightboxPhoto.caption || '記憶相冊'}</span>
              <button
                onClick={() => setLightboxPhoto(null)}
                className="w-5 h-5 bg-[#E0BAC7] text-[#442F2A] rounded flex items-center justify-center font-bold hover:bg-[#C89398] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Photo */}
            <div className="p-4 bg-[#FFF8F5]">
              <div className="max-h-[60vh] w-full rounded border-2 border-[#442F2A] overflow-hidden bg-black/5 flex items-center justify-center">
                <img
                  src={lightboxPhoto.url}
                  alt={lightboxPhoto.caption}
                  className="w-full max-h-[60vh] object-contain"
                />
              </div>

              <div className="mt-3 p-3 bg-white rounded border border-[#442F2A]/20">
                <h4 className="font-pixel font-bold text-sm text-[#442F2A]">
                  {lightboxPhoto.caption || '敬請期待'}
                </h4>
                <div className="flex items-center justify-between text-xs font-pixel text-[#442F2A]/70 mt-1">
                  <span>📅 日期：{lightboxPhoto.date}</span>
                  {lightboxPhoto.location && <span>📍 地點：{lightboxPhoto.location}</span>}
                  <span className="bg-[#E0BAC7] px-2 py-0.5 rounded text-[#442F2A]">
                    #{lightboxPhoto.tag ? lightboxPhoto.tag.replace(/^#/, '') : 'いつもの景色'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
