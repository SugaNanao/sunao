import React, { useState } from 'react';
import { CoupleSiteData, ActiveTab } from '../types';
import { Edit, Camera, Upload, X, Check, Image as ImageIcon, Sparkles, RefreshCw } from 'lucide-react';
import { DEFAULT_COUPLE_DATA } from '../data/defaultData';

interface LeftSidebarProps {
  data: CoupleSiteData;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isEditMode: boolean;
  onEditSection: (section: string) => void;
  onUpdateData?: (newData: CoupleSiteData) => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  data,
  activeTab,
  onTabChange,
  isEditMode,
  onEditSection,
  onUpdateData,
}) => {
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const currentAvatar = data.sidebarAvatar || data.mainIllustration || data.characterB.avatar;
  const [avatarInputUrl, setAvatarInputUrl] = useState('');
  const [previewAvatar, setPreviewAvatar] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const openAvatarModal = () => {
    const current = data.sidebarAvatar || data.mainIllustration || data.characterB.avatar;
    setPreviewAvatar(current);
    setAvatarInputUrl(data.sidebarAvatar || '');
    setIsAvatarModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (result) {
          const img = new Image();
          img.onload = () => {
            const maxDim = 800;
            let width = img.width;
            let height = img.height;
            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              const compressed = canvas.toDataURL('image/jpeg', 0.85);
              setPreviewAvatar(compressed);
              setAvatarInputUrl('');
              return;
            }
            setPreviewAvatar(result);
            setAvatarInputUrl('');
          };
          img.onerror = () => {
            setPreviewAvatar(result);
            setAvatarInputUrl('');
          };
          img.src = result;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAvatar = () => {
    const targetUrl = previewAvatar.trim() || avatarInputUrl.trim() || currentAvatar;
    if (onUpdateData) {
      onUpdateData({
        ...data,
        sidebarAvatar: targetUrl,
      });
    }
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsAvatarModalOpen(false);
    }, 600);
  };

  const navButtons: { id: ActiveTab; label: string }[] = [
    { id: 'HOME', label: 'HOME' },
    { id: 'CHARACTER', label: 'CHARACTER PROFILE' },
    { id: 'STORY', label: 'STORY' },
    { id: 'ALBUM', label: 'ALBUM' },
    { id: 'AU', label: 'ALTERNATIVE UNIVERSE' },
  ];

  return (
    <aside className="w-full lg:w-56 xl:w-60 shrink-0 flex flex-col gap-3.5 select-none" id="left-sidebar">
      {/* 1. Couple Mini Avatar Frame with Overlapping Pixel Hearts (Pink & Brown) */}
      <div className="pixel-card p-3.5 flex flex-col items-center text-center relative group">
        {isEditMode && (
          <div className="absolute top-2 right-2 flex items-center gap-1 z-20">
            <button
              onClick={openAvatarModal}
              className="p-1 bg-[#E0BAC7] hover:bg-[#d49bb0] rounded border border-[#442F2A] text-[#442F2A] text-xs cursor-pointer shadow-sm flex items-center gap-0.5"
              title="自定義個人頭貼"
            >
              <Camera className="w-3 h-3" />
            </button>
            <button
              onClick={() => onEditSection('profile')}
              className="p-1 bg-[#FFF8F5] hover:bg-[#E0BAC7] rounded border border-[#442F2A] text-[#442F2A] text-xs cursor-pointer shadow-sm"
              title="編輯人物與資料"
            >
              <Edit className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Single Avatar Frame */}
        <div className="relative mb-2 mt-1">
          {/* Overlapping Pixel Hearts: Pink & Brown replacing the ribbon */}
          <div className="absolute -top-3 -left-3 z-10 select-none pointer-events-none">
            <svg
              width="34"
              height="28"
              viewBox="0 0 34 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-sm"
            >
              {/* Brown Pixel Heart (Behind, slightly bottom-left) */}
              <g transform="translate(0, 4)">
                <rect x="4" y="2" width="6" height="3" fill="#442F2A" />
                <rect x="12" y="2" width="6" height="3" fill="#442F2A" />
                <rect x="1" y="5" width="20" height="6" fill="#442F2A" />
                <rect x="4" y="11" width="14" height="3" fill="#442F2A" />
                <rect x="7" y="14" width="8" height="3" fill="#442F2A" />
                <rect x="9" y="17" width="4" height="3" fill="#442F2A" />
                <rect x="5" y="6" width="3" height="3" fill="#5A3E38" />
              </g>

              {/* Pink Pixel Heart (Overlapping on top and slightly right) */}
              <g transform="translate(10, 0)">
                <rect x="4" y="2" width="6" height="3" fill="#442F2A" />
                <rect x="12" y="2" width="6" height="3" fill="#442F2A" />
                <rect x="1" y="5" width="20" height="6" fill="#442F2A" />
                <rect x="4" y="11" width="14" height="3" fill="#442F2A" />
                <rect x="7" y="14" width="8" height="3" fill="#442F2A" />
                <rect x="9" y="17" width="4" height="3" fill="#442F2A" />
                
                <rect x="5" y="3" width="4" height="2" fill="#E0BAC7" />
                <rect x="13" y="3" width="4" height="2" fill="#E0BAC7" />
                <rect x="3" y="5" width="16" height="5" fill="#E0BAC7" />
                <rect x="5" y="10" width="12" height="3" fill="#E0BAC7" />
                <rect x="8" y="13" width="6" height="3" fill="#E0BAC7" />
                <rect x="10" y="16" width="2" height="2" fill="#E0BAC7" />
                <rect x="5" y="6" width="2" height="2" fill="#FFF8F5" />
              </g>
            </svg>
          </div>

          <div
            onClick={() => {
              if (isEditMode) openAvatarModal();
            }}
            className={`w-20 h-20 rounded-full border-3 border-[#442F2A] p-0.5 bg-[#E0BAC7] overflow-hidden shadow-md relative group/avatar ${
              isEditMode ? 'cursor-pointer' : ''
            }`}
            title={isEditMode ? '點擊自定義個人頭貼' : undefined}
          >
            <img
              src={currentAvatar}
              alt={`${data.characterA.name} & ${data.characterB.name}`}
              className="w-full h-full object-cover rounded-full"
            />
            {isEditMode && (
              <div className="absolute inset-0 bg-black/45 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                <Camera className="w-4 h-4 mb-0.5 text-white" />
                <span className="text-[9px] font-pixel text-white">更換頭貼</span>
              </div>
            )}
          </div>

          {/* Quick camera button badge at bottom-right */}
          {isEditMode && (
            <button
              type="button"
              onClick={openAvatarModal}
              className="absolute -bottom-1 -right-1 p-1 bg-[#FFF8F5] hover:bg-[#E0BAC7] border-2 border-[#442F2A] rounded-full text-[#442F2A] shadow cursor-pointer transition-transform hover:scale-110 z-10"
              title="自定義更換頭貼"
            >
              <Camera className="w-3 h-3" />
            </button>
          )}
        </div>

        <h2 className="font-pixel font-bold text-sm text-[#442F2A] mt-1">
          {data.characterA.name} × {data.characterB.name}
        </h2>
        <p className="text-[11px] text-[#442F2A]/70 font-pixel">
          「{data.siteSubtitle || 'Koshi x Nanao'}」
        </p>
      </div>

      {/* 2. Interface Switcher Menu */}
      <div className="pixel-card p-3 bg-[#FFF8F5]" id="left-interface-navigation">
        <div className="flex items-center justify-between border-b-2 border-[#442F2A] pb-1.5 mb-2.5">
          <span className="font-pixel font-bold text-xs text-[#442F2A] tracking-wider">
            MENU
          </span>
          <span className="text-[10px] font-pixel text-[#442F2A]/60 bg-[#E0BAC7] px-1 rounded">5 TABS</span>
        </div>

        <div className="flex flex-col gap-1.5">
          {navButtons.map((btn) => {
            const isActive =
              activeTab === btn.id ||
              (btn.id === 'CHARACTER' && activeTab === 'CHARACTER PROFILE') ||
              (btn.id === 'AU' && activeTab === 'ALTERNATIVE UNIVERSE');
            return (
              <button
                key={btn.id}
                onClick={() => onTabChange(btn.id)}
                className={`w-full text-left px-3 py-2 rounded font-pixel transition flex items-center justify-between border-2 cursor-pointer ${
                  isActive
                    ? 'bg-[#442F2A] text-[#FFF8F5] border-[#442F2A] shadow-inner font-bold'
                    : 'bg-white text-[#442F2A] border-[#442F2A]/50 hover:border-[#442F2A] hover:bg-[#F8EDF1] shadow-[2px_2px_0px_#442F2A]'
                }`}
                id={`left-nav-btn-${btn.id.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <span className="text-xs truncate tracking-wider font-bold">{btn.label}</span>
                <span
                  className={`text-[9px] px-1 py-0.5 rounded shrink-0 ml-1 ${
                    isActive ? 'bg-[#E0BAC7] text-[#442F2A]' : 'bg-[#F8EDF1] text-[#442F2A]/70'
                  }`}
                >
                  {isActive ? 'ACTIVE' : 'OPEN'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Custom Sidebar Avatar Modal */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#FFF8F5] border-4 border-[#442F2A] rounded-xl w-full max-w-sm p-4 shadow-[6px_6px_0px_#442F2A] flex flex-col gap-3 font-pixel">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b-2 border-[#442F2A] pb-2">
              <div className="flex items-center gap-1.5 text-[#442F2A] font-bold text-sm">
                <Camera className="w-4 h-4 text-[#C89398]" />
                <span>自訂側邊欄個人頭貼</span>
              </div>
              <button
                onClick={() => setIsAvatarModalOpen(false)}
                className="p-1 hover:bg-[#E0BAC7] rounded text-[#442F2A] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Avatar Preview */}
            <div className="flex flex-col items-center py-2">
              <div className="w-24 h-24 rounded-full border-3 border-[#442F2A] p-0.5 bg-[#E0BAC7] overflow-hidden shadow-md">
                <img
                  src={previewAvatar || currentAvatar}
                  alt="Avatar Preview"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <span className="text-[11px] text-[#442F2A]/70 mt-1.5">側邊欄圓形頭貼預覽</span>
            </div>

            {/* Method 1: Upload File */}
            <div className="space-y-1.5 bg-white p-2.5 rounded-lg border-2 border-[#442F2A]/40">
              <label className="text-xs font-bold text-[#442F2A] block">
                方式一：本機上傳圖片
              </label>
              <label className="w-full py-2 px-3 bg-[#E0BAC7] hover:bg-[#d49bb0] border-2 border-[#442F2A] rounded-md text-xs font-bold text-[#442F2A] flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition">
                <Upload className="w-3.5 h-3.5" />
                <span>選擇本機照片上傳</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>

            {/* Method 2: Image URL */}
            <div className="space-y-1.5 bg-white p-2.5 rounded-lg border-2 border-[#442F2A]/40">
              <label className="text-xs font-bold text-[#442F2A] block">
                方式二：輸入圖片網址 (URL)
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={avatarInputUrl}
                  placeholder="https://example.com/photo.jpg"
                  onChange={(e) => {
                    setAvatarInputUrl(e.target.value);
                    if (e.target.value.trim()) {
                      setPreviewAvatar(e.target.value.trim());
                    }
                  }}
                  className="flex-1 bg-[#FFF8F5] border-2 border-[#442F2A] rounded p-1.5 text-xs"
                />
              </div>
            </div>

            {/* Method 3: Quick Preset Selection */}
            <div className="space-y-1 bg-white p-2.5 rounded-lg border-2 border-[#442F2A]/40">
              <div className="flex items-center gap-1 text-[11px] font-bold text-[#442F2A]">
                <Sparkles className="w-3 h-3 text-[#C89398]" />
                <span>快速套用既有頭像：</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setPreviewAvatar(data.characterA.avatar);
                    setAvatarInputUrl(data.characterA.avatar);
                  }}
                  className="text-[10px] px-2 py-1 rounded bg-[#FFF8F5] border border-[#442F2A] hover:bg-[#E0BAC7] text-[#442F2A] font-bold cursor-pointer"
                >
                  {data.characterA.name || '角色A'} 頭貼
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewAvatar(data.characterB.avatar);
                    setAvatarInputUrl(data.characterB.avatar);
                  }}
                  className="text-[10px] px-2 py-1 rounded bg-[#FFF8F5] border border-[#442F2A] hover:bg-[#E0BAC7] text-[#442F2A] font-bold cursor-pointer"
                >
                  {data.characterB.name || '角色B'} 頭貼
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewAvatar(data.mainIllustration);
                    setAvatarInputUrl(data.mainIllustration);
                  }}
                  className="text-[10px] px-2 py-1 rounded bg-[#FFF8F5] border border-[#442F2A] hover:bg-[#E0BAC7] text-[#442F2A] font-bold cursor-pointer"
                >
                  首頁主插圖
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const def = DEFAULT_COUPLE_DATA.sidebarAvatar || DEFAULT_COUPLE_DATA.mainIllustration;
                    setPreviewAvatar(def);
                    setAvatarInputUrl(def);
                  }}
                  className="text-[10px] px-2 py-1 rounded bg-[#FFF8F5] border border-[#442F2A]/50 hover:bg-[#E0BAC7] text-[#442F2A]/80 cursor-pointer"
                >
                  恢復預設
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t-2 border-[#442F2A]">
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(false)}
                className="px-3 py-1.5 rounded border border-[#442F2A]/60 text-xs font-bold text-[#442F2A] hover:bg-black/5 cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSaveAvatar}
                className="px-4 py-1.5 bg-[#442F2A] hover:bg-[#5A3E38] text-[#FFF8F5] rounded border-2 border-[#442F2A] text-xs font-bold cursor-pointer flex items-center gap-1 shadow-[2px_2px_0px_#C89398]"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-300" />
                    <span>已儲存！</span>
                  </>
                ) : (
                  <span>儲存頭貼</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
