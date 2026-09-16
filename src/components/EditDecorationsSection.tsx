import React, { useState } from 'react';
import { CoupleSiteData, PageDecorationItem, DecorationPageTarget } from '../types';
import {
  Sparkles,
  Plus,
  Trash2,
  Copy,
  Upload,
  Image as ImageIcon,
  Move,
  RotateCcw,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  Info,
  Sliders,
  ExternalLink,
} from 'lucide-react';
import {
  compressImage,
  normalizeImageUrl,
  detectCloudService,
  handleImageLoadError,
  getGoogleDriveFileId,
} from '../utils/imageOptimizer';

interface EditDecorationsSectionProps {
  data: CoupleSiteData;
  onChange: (newData: CoupleSiteData) => void;
  handleFileUpload: (
    e: React.ChangeEvent<HTMLInputElement>,
    callback: (base64Url: string) => void
  ) => void;
}

const PAGE_TARGET_OPTIONS: { value: DecorationPageTarget; label: string; icon: string }[] = [
  { value: 'ALL', label: '🌸 全部分頁皆顯示 (ALL)', icon: '🌸' },
  { value: 'HOME', label: '🏠 首頁 (HOME)', icon: '🏠' },
  { value: 'CHARACTER', label: '👤 角色基本情報 (CHARACTER PROFILE)', icon: '👤' },
  { value: 'ALBUM', label: '📸 浪漫相簿 (ALBUM)', icon: '📸' },
  { value: 'STORY', label: '📖 甜蜜故事 (STORY)', icon: '📖' },
  { value: 'AU', label: '🌌 平行宇宙 (AU)', icon: '🌌' },
];

export const EditDecorationsSection: React.FC<EditDecorationsSectionProps> = ({
  data,
  onChange,
  handleFileUpload,
}) => {
  const decorations = data.decorations || [];
  const [filterTarget, setFilterTarget] = useState<string>('ALL_FILTER');
  const [importNotice, setImportNotice] = useState<string | null>(null);

  // Check if characterA or characterB has legacy cornerImage
  const hasCharACorner = Boolean(data.characterA?.cornerImage);
  const hasCharBCorner = Boolean(data.characterB?.cornerImage);

  const handleImportLegacyCornerImages = () => {
    const newItems: PageDecorationItem[] = [...decorations];
    let count = 0;

    if (hasCharACorner && data.characterA.cornerImage) {
      newItems.push({
        id: `dec-chara-${Date.now()}`,
        name: `${data.characterA.name || '菅原考支'} 姓名區角落貼圖`,
        imageUrl: data.characterA.cornerImage,
        targetPage: 'CHARACTER',
        targetCharacter: 'CHAR_A',
        position: data.characterA.cornerImagePosition === 'custom' ? 'bottom-right' : (data.characterA.cornerImagePosition || 'bottom-right'),
        scale: data.characterA.cornerImageScale || 100,
        offsetX: data.characterA.cornerImageOffsetX || 0,
        offsetY: data.characterA.cornerImageOffsetY || 0,
        rotation: 0,
        opacity: 100,
        visible: true,
      });
      count++;
    }

    if (hasCharBCorner && data.characterB.cornerImage) {
      newItems.push({
        id: `dec-charb-${Date.now() + 1}`,
        name: `${data.characterB.name || '宮原七緒'} 姓名區角落貼圖`,
        imageUrl: data.characterB.cornerImage,
        targetPage: 'CHARACTER',
        targetCharacter: 'CHAR_B',
        position: data.characterB.cornerImagePosition === 'custom' ? 'bottom-right' : (data.characterB.cornerImagePosition || 'bottom-right'),
        scale: data.characterB.cornerImageScale || 100,
        offsetX: data.characterB.cornerImageOffsetX || 0,
        offsetY: data.characterB.cornerImageOffsetY || 0,
        rotation: 0,
        opacity: 100,
        visible: true,
      });
      count++;
    }

    onChange({
      ...data,
      decorations: newItems,
    });
    setImportNotice(`✓ 已成功將 ${count} 張角色姓名區角落裝飾圖匯入為多張管理清單！`);
    setTimeout(() => setImportNotice(null), 4000);
  };

  const handleAddDecoration = () => {
    const newItem: PageDecorationItem = {
      id: `dec-${Date.now()}`,
      name: `裝飾貼圖 #${decorations.length + 1}`,
      imageUrl: '',
      targetPage: 'HOME',
      targetCharacter: 'BOTH',
      position: 'bottom-right',
      scale: 100,
      rotation: 0,
      offsetX: 0,
      offsetY: 0,
      opacity: 100,
      visible: true,
      zIndex: 30,
    };
    onChange({
      ...data,
      decorations: [newItem, ...decorations],
    });
  };

  const handleUpdateItem = (id: string, updates: Partial<PageDecorationItem>) => {
    const nextList = decorations.map((item) => {
      if (item.id === id) {
        return { ...item, ...updates };
      }
      return item;
    });
    onChange({
      ...data,
      decorations: nextList,
    });
  };

  const handleDeleteItem = (id: string) => {
    if (window.confirm('確定要刪除這張裝飾貼圖嗎？')) {
      onChange({
        ...data,
        decorations: decorations.filter((d) => d.id !== id),
      });
    }
  };

  const handleDuplicateItem = (item: PageDecorationItem) => {
    const duplicated: PageDecorationItem = {
      ...item,
      id: `dec-${Date.now()}`,
      name: `${item.name} (複製)`,
      offsetX: (item.offsetX || 0) + 20,
      offsetY: (item.offsetY || 0) + 20,
    };
    onChange({
      ...data,
      decorations: [duplicated, ...decorations],
    });
  };

  // Filtered decorations for view
  const filteredList = decorations.filter((item) => {
    if (filterTarget === 'ALL_FILTER') return true;
    return item.targetPage === filterTarget;
  });

  return (
    <div className="space-y-4 font-pixel text-xs">
      {/* 1. Header Banner & Actions */}
      <div className="p-3.5 bg-white border-2 border-[#442F2A] rounded-lg shadow-xs space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#442F2A]/30 pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C89398]" />
            <h3 className="font-bold text-sm text-[#442F2A]">
              ✨ 頁面透明底裝飾貼圖管理 (Page Decorations)
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#E0BAC7] text-[#442F2A] font-bold">
              共 {decorations.length} 張貼圖
            </span>
          </div>

          <div className="flex items-center gap-2">
            {(hasCharACorner || hasCharBCorner) && (
              <button
                type="button"
                onClick={handleImportLegacyCornerImages}
                className="px-2.5 py-1 bg-[#F8EDF1] hover:bg-[#E0BAC7] border border-[#442F2A] rounded text-[#442F2A] text-[11px] font-bold flex items-center gap-1 cursor-pointer transition"
                title="將角色A/B既有的姓名區角落圖片轉入此多張管理分類"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C89398]" />
                <span>匯入人物姓名區貼圖</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleAddDecoration}
              className="px-3 py-1.5 bg-[#442F2A] hover:bg-[#5A3E38] text-white rounded border border-[#442F2A] font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition hover:scale-102"
            >
              <Plus className="w-3.5 h-3.5 text-[#E0BAC7]" />
              <span>＋ 新增裝飾貼圖</span>
            </button>
          </div>
        </div>

        <p className="text-[11px] text-[#442F2A]/80 leading-relaxed font-sans">
          💡 <strong>功能說明：</strong>
          您可以上傳<strong>不限數量的透明底圖片（PNG/WebP/SVG）</strong>，並自由指定每一張貼圖要放在哪一個分頁（例如：首頁、雙人角色檔案、浪漫相簿、甜蜜故事、平行世界或全部頁面）。在開啟編輯模式時，亦可直接在網頁上用滑鼠/觸控按住貼圖進行拖拽定位！
        </p>

        {importNotice && (
          <div className="p-2 bg-emerald-50 border border-emerald-500 rounded text-emerald-800 text-[11px] font-bold">
            {importNotice}
          </div>
        )}

        {/* Filter Bar */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-[10px] text-[#442F2A]/60 font-bold">篩選分頁：</span>
          <button
            type="button"
            onClick={() => setFilterTarget('ALL_FILTER')}
            className={`px-2 py-0.5 rounded text-[10px] border cursor-pointer ${
              filterTarget === 'ALL_FILTER'
                ? 'bg-[#442F2A] text-white border-[#442F2A] font-bold'
                : 'bg-[#FFF8F5] text-[#442F2A] border-[#442F2A]/30'
            }`}
          >
            全部顯示 ({decorations.length})
          </button>
          {PAGE_TARGET_OPTIONS.map((opt) => {
            const count = decorations.filter((d) => d.targetPage === opt.value).length;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFilterTarget(opt.value)}
                className={`px-2 py-0.5 rounded text-[10px] border cursor-pointer flex items-center gap-1 ${
                  filterTarget === opt.value
                    ? 'bg-[#442F2A] text-white border-[#442F2A] font-bold'
                    : 'bg-[#FFF8F5] text-[#442F2A] border-[#442F2A]/30'
                }`}
              >
                <span>{opt.label.split(' ')[0]}</span>
                <span>({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Empty State */}
      {filteredList.length === 0 && (
        <div className="p-8 bg-white border-2 border-dashed border-[#442F2A]/40 rounded-lg text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#F8EDF1] border border-[#442F2A]/30 mx-auto flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-[#C89398]" />
          </div>
          <div className="space-y-1">
            <p className="font-bold text-sm text-[#442F2A]">目前尚無此分類的裝飾貼圖</p>
            <p className="text-[11px] text-[#442F2A]/60 font-sans">
              點擊右上角「＋ 新增裝飾貼圖」，即可上傳多張喜愛的透明底插畫、Q版頭像或代表小物！
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddDecoration}
            className="px-4 py-1.5 bg-[#E0BAC7] hover:bg-[#d49bb0] border border-[#442F2A] rounded font-bold text-[#442F2A] inline-flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>立即新增第一張貼圖</span>
          </button>
        </div>
      )}

      {/* 3. Sticker Cards List */}
      <div className="space-y-3">
        {filteredList.map((item, index) => {
          const cloud = detectCloudService(item.imageUrl);
          const isGoogle = cloud.isGoogleDrive;

          return (
            <div
              key={item.id}
              className={`p-3.5 bg-white border-2 border-[#442F2A] rounded-lg shadow-xs space-y-3 transition-opacity ${
                item.visible === false ? 'opacity-70 bg-neutral-50/70' : ''
              }`}
            >
              {/* Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#442F2A]/20 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-[#442F2A] text-white flex items-center justify-center font-bold text-[10px]">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={item.name}
                    placeholder="貼圖名稱（例：首頁Q版菅原、姓名區小幽靈）"
                    onChange={(e) => handleUpdateItem(item.id, { name: e.target.value })}
                    className="font-bold text-[#442F2A] bg-transparent border-b border-transparent hover:border-[#442F2A] focus:border-[#442F2A] focus:bg-[#FFF8F5] px-1 py-0.5 rounded outline-none text-xs"
                  />
                  {item.visible === false && (
                    <span className="text-[10px] px-1.5 py-0.2 bg-neutral-200 text-neutral-600 rounded">
                      已暫時隱藏
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleUpdateItem(item.id, { visible: item.visible === false ? true : false })}
                    className={`px-2 py-1 rounded border text-[10px] font-bold flex items-center gap-1 cursor-pointer ${
                      item.visible !== false
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-500'
                        : 'bg-neutral-100 text-neutral-600 border-neutral-400'
                    }`}
                    title={item.visible !== false ? '點擊暫時隱藏此貼圖' : '點擊顯示此貼圖'}
                  >
                    {item.visible !== false ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    <span>{item.visible !== false ? '顯示中' : '已隱藏'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDuplicateItem(item)}
                    className="p-1.5 bg-[#FFF8F5] hover:bg-[#E0BAC7] border border-[#442F2A]/40 rounded text-[#442F2A] cursor-pointer"
                    title="複製這張貼圖設定"
                  >
                    <Copy className="w-3 h-3" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded text-rose-700 cursor-pointer"
                    title="刪除此貼圖"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Card Body: Image + Settings Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
                {/* Left Column: Image Preview + Source (col-span-5) */}
                <div className="md:col-span-5 space-y-2">
                  <div className="flex gap-2.5 items-start">
                    {/* Checkerboard Preview Box */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded border-2 border-[#442F2A] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:8px_8px] bg-white shrink-0 overflow-hidden flex items-center justify-center p-1.5 relative group/img shadow-xs">
                      {item.imageUrl ? (
                        <img
                          src={normalizeImageUrl(item.imageUrl)}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          crossOrigin="anonymous"
                          onError={(e) => handleImageLoadError(e, item.imageUrl)}
                          className="w-full h-full object-contain"
                          style={{
                            transform: `scale(${(item.scale || 100) / 100}) rotate(${item.rotation || 0}deg)`,
                            opacity: (item.opacity ?? 100) / 100,
                          }}
                        />
                      ) : (
                        <div className="text-[10px] text-[#442F2A]/40 text-center font-pixel p-1">
                          請上傳透明底圖片
                        </div>
                      )}
                    </div>

                    {/* Source controls */}
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-[#442F2A]">圖片來源：</label>
                        <span className="text-[9px] text-[#9D5A64] bg-[#F8EDF1] px-1 py-0.2 rounded font-bold">
                          ✓ 支援透明底 PNG/WebP
                        </span>
                      </div>

                      {/* File upload button */}
                      <label className="w-full py-1.5 px-2 bg-[#E0BAC7] hover:bg-[#d49bb0] border border-[#442F2A] rounded text-[11px] font-bold text-[#442F2A] flex items-center justify-center gap-1 cursor-pointer transition shadow-xs">
                        <Upload className="w-3 h-3" />
                        <span>選擇本機透明圖片上傳</span>
                        <input
                          type="file"
                          accept="image/png,image/webp,image/svg+xml,image/jpeg"
                          className="hidden"
                          onChange={(e) =>
                            handleFileUpload(e, (url) => handleUpdateItem(item.id, { imageUrl: url }))
                          }
                        />
                      </label>

                      {/* URL input */}
                      <input
                        type="text"
                        value={item.imageUrl}
                        onChange={(e) => handleUpdateItem(item.id, { imageUrl: e.target.value })}
                        placeholder="或貼上 Google 雲端 / 圖片直連 URL"
                        className="w-full bg-[#FFF8F5] border border-[#442F2A] rounded p-1 text-[11px] truncate"
                      />
                    </div>
                  </div>

                  {/* Cloud Drive status advice */}
                  {isGoogle && (
                    <div className="p-1.5 bg-emerald-50 border border-emerald-500/40 rounded text-emerald-900 text-[10px] space-y-0.5 leading-relaxed font-sans">
                      <div className="flex items-center gap-1 font-bold text-emerald-800">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>已自動轉換 Google 雲端直連！</span>
                      </div>
                      <p className="text-emerald-800/90 text-[9.5px]">
                        ※ 請確保該檔案已設定為「知道連結的任何人皆可檢視」公開權限。
                      </p>
                    </div>
                  )}
                </div>

                {/* Right Column: Target Page & Positioning Settings (col-span-7) */}
                <div className="md:col-span-7 space-y-2.5 bg-[#FFF8F5] p-2.5 rounded border border-[#442F2A]/30">
                  {/* Target Page Selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-[#442F2A] mb-1">
                        🎯 放置分頁 (Target Page)：
                      </label>
                      <select
                        value={item.targetPage}
                        onChange={(e) =>
                          handleUpdateItem(item.id, { targetPage: e.target.value as DecorationPageTarget })
                        }
                        className="w-full bg-white border border-[#442F2A] rounded p-1.5 text-xs font-bold text-[#442F2A] cursor-pointer"
                      >
                        {PAGE_TARGET_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* If Character profile view is selected */}
                    {item.targetPage === 'CHARACTER' ? (
                      <div>
                        <label className="block text-[11px] font-bold text-[#442F2A] mb-1">
                          👤 角色區塊指派：
                        </label>
                        <select
                          value={item.targetCharacter || 'BOTH'}
                          onChange={(e) =>
                            handleUpdateItem(item.id, {
                              targetCharacter: e.target.value as 'BOTH' | 'CHAR_A' | 'CHAR_B',
                            })
                          }
                          className="w-full bg-white border border-[#442F2A] rounded p-1.5 text-xs font-bold text-[#442F2A] cursor-pointer"
                        >
                          <option value="CHAR_A">{data.characterA.name || '菅原考支'} 姓名區角落</option>
                          <option value="CHAR_B">{data.characterB.name || '宮原七緒'} 姓名區角落</option>
                          <option value="BOTH">角色頁面全局浮動</option>
                        </select>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-[11px] font-bold text-[#442F2A] mb-1">
                          📍 預設基準角落：
                        </label>
                        <select
                          value={item.position || 'bottom-right'}
                          onChange={(e) =>
                            handleUpdateItem(item.id, {
                              position: e.target.value as 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'free-drag',
                            })
                          }
                          className="w-full bg-white border border-[#442F2A] rounded p-1.5 text-xs font-bold text-[#442F2A] cursor-pointer"
                        >
                          <option value="bottom-right">↘ 右下角 (Bottom Right)</option>
                          <option value="bottom-left">↙ 左下角 (Bottom Left)</option>
                          <option value="top-right">↗ 右上角 (Top Right)</option>
                          <option value="top-left">↖ 左上角 (Top Left)</option>
                          <option value="free-drag">✦ 任意位置自由拖拽 (Free Drag)</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Fine Adjustment Sliders: Scale, Rotation, Offsets */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-[#442F2A]/20">
                    {/* Scale */}
                    <div>
                      <div className="flex justify-between items-center text-[10px] text-[#442F2A]">
                        <span>縮放大小</span>
                        <span className="font-bold">{item.scale ?? 100}%</span>
                      </div>
                      <input
                        type="range"
                        min="40"
                        max="200"
                        step="5"
                        value={item.scale ?? 100}
                        onChange={(e) => handleUpdateItem(item.id, { scale: Number(e.target.value) })}
                        className="w-full accent-[#442F2A] cursor-pointer h-1"
                      />
                    </div>

                    {/* Rotation */}
                    <div>
                      <div className="flex justify-between items-center text-[10px] text-[#442F2A]">
                        <span>旋轉角度</span>
                        <span className="font-bold">{item.rotation ?? 0}°</span>
                      </div>
                      <input
                        type="range"
                        min="-90"
                        max="90"
                        step="5"
                        value={item.rotation ?? 0}
                        onChange={(e) => handleUpdateItem(item.id, { rotation: Number(e.target.value) })}
                        className="w-full accent-[#442F2A] cursor-pointer h-1"
                      />
                    </div>

                    {/* Offset X */}
                    <div>
                      <div className="flex justify-between items-center text-[10px] text-[#442F2A]">
                        <span>水平偏移 (X)</span>
                        <span className="font-mono text-[9px]">{item.offsetX ?? 0}px</span>
                      </div>
                      <input
                        type="range"
                        min="-200"
                        max="200"
                        step="2"
                        value={item.offsetX ?? 0}
                        onChange={(e) => handleUpdateItem(item.id, { offsetX: Number(e.target.value) })}
                        className="w-full accent-[#442F2A] cursor-pointer h-1"
                      />
                    </div>

                    {/* Offset Y */}
                    <div>
                      <div className="flex justify-between items-center text-[10px] text-[#442F2A]">
                        <span>垂直偏移 (Y)</span>
                        <span className="font-mono text-[9px]">{item.offsetY ?? 0}px</span>
                      </div>
                      <input
                        type="range"
                        min="-200"
                        max="200"
                        step="2"
                        value={item.offsetY ?? 0}
                        onChange={(e) => handleUpdateItem(item.id, { offsetY: Number(e.target.value) })}
                        className="w-full accent-[#442F2A] cursor-pointer h-1"
                      />
                    </div>
                  </div>

                  {/* Reset offset button */}
                  {(item.offsetX !== 0 || item.offsetY !== 0 || item.rotation !== 0 || item.scale !== 100) && (
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateItem(item.id, {
                            offsetX: 0,
                            offsetY: 0,
                            rotation: 0,
                            scale: 100,
                          })
                        }
                        className="text-[10px] text-[#442F2A]/70 hover:text-[#442F2A] flex items-center gap-1 cursor-pointer underline"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>重設位置與尺寸為預設 (X:0, Y:0, 100%, 0°)</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
