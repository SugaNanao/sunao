import React, { useState } from 'react';
import {
  CoupleSiteData,
  Character,
  Milestone,
  AlbumPhoto,
  StoryChapter,
  AlternativeUniverse,
  SpecialDate,
  CoupleProfileItem,
} from '../types';
import { PixelHeart } from './PixelHeart';
import { OverlappingHearts } from './OverlappingHearts';
import { EditCharacterSection } from './EditCharacterSection';
import {
  X,
  Save,
  RefreshCw,
  Download,
  Upload,
  Plus,
  Trash2,
  Sparkles,
  Calendar,
  Image as ImageIcon,
  BookOpen,
  Camera,
  Layers,
  Heart,
  MessageSquare,
  FileText,
  Star,
  Tag,
  Check,
  Home,
  Sliders,
  Crop,
  RotateCcw,
  ZoomIn,
} from 'lucide-react';
import { exportDataAsJSON, exportLightweightBackupJSON, resetCoupleData } from '../utils/storage';
import { compressImage } from '../utils/imageOptimizer';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: CoupleSiteData;
  onSaveData: (newData: CoupleSiteData) => void;
  initialTab?: string;
}

export const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  onClose,
  data,
  onSaveData,
  initialTab = 'basic',
}) => {
  const [activeSubTab, setActiveSubTab] = useState(() => (initialTab === 'anniversary' ? 'basic' : initialTab));
  const [profileViewMode, setProfileViewMode] = useState<'both' | 'a' | 'b'>('both');
  const [formData, setFormData] = useState<CoupleSiteData>(() => JSON.parse(JSON.stringify(data)));
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);
  const [newAlbumTagInput, setNewAlbumTagInput] = useState('');

  // Collect all available album tags for editing
  const allAvailableAlbumTags = React.useMemo(() => {
    const baseTags = ['いつもの景色', '季節のしるし', 'ともに過ごした日々'];
    const tagSet = new Set<string>(baseTags);
    if (formData.albumCustomTags) {
      formData.albumCustomTags.forEach((t) => {
        const clean = t.replace(/^#/, '').trim();
        if (clean) tagSet.add(clean);
      });
    }
    formData.album.forEach((photo) => {
      const clean = (photo.tag || '').replace(/^#/, '').trim();
      if (clean && clean !== '記憶のかけら' && clean !== '全部') {
        tagSet.add(clean);
      }
    });
    return Array.from(tagSet);
  }, [formData.album, formData.albumCustomTags]);

  const handleAddNewAlbumTag = () => {
    const clean = newAlbumTagInput.replace(/^#/, '').trim();
    if (!clean) return;
    const currentTags = formData.albumCustomTags
      ? [...formData.albumCustomTags]
      : ['いつもの景色', '季節のしるし', 'ともに過ごした日々'];
    if (!currentTags.includes(clean)) {
      currentTags.push(clean);
    }
    setFormData({
      ...formData,
      albumCustomTags: currentTags,
    });
    setNewAlbumTagInput('');
  };

  const updatePageTitle = (
    page: 'character' | 'story' | 'album' | 'au',
    field: 'title' | 'subtitle',
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      pageTitles: {
        ...prev.pageTitles,
        [page]: {
          title:
            prev.pageTitles?.[page]?.title ||
            (page === 'character'
              ? 'CHARACTER PROFILE'
              : page === 'story'
              ? 'STORY'
              : page === 'album'
              ? 'ALBUM'
              : 'ALTERNATIVE UNIVERSE'),
          subtitle:
            prev.pageTitles?.[page]?.subtitle ||
            (page === 'character'
              ? 'キャラクター情報解禁'
              : page === 'story'
              ? '烏野高校で、まだ描かれていない物語'
              : page === 'album'
              ? '新規描き下ろしイラスト公開！'
              : '縁下監督 最新作'),
          ...prev.pageTitles?.[page],
          [field]: value,
        },
      },
    }));
  };

  React.useEffect(() => {
    if (isOpen) {
      const cloned = JSON.parse(JSON.stringify(data));
      if (!cloned.pageTitles) {
        cloned.pageTitles = {
          character: { title: 'CHARACTER PROFILE', subtitle: 'キャラクター情報解禁' },
          story: { title: 'STORY', subtitle: '烏野高校で、まだ描かれていない物語' },
          album: { title: 'ALBUM', subtitle: '新規描き下ろしイラスト公開！' },
          au: { title: 'ALTERNATIVE UNIVERSE', subtitle: '縁下監督 最新作' },
        };
      }
      setFormData(cloned);
      setActiveSubTab(initialTab === 'anniversary' ? 'basic' : initialTab);
    }
  }, [initialTab, isOpen, data]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveData(formData);
    setSaveSuccessNotice(true);
    setTimeout(() => {
      setSaveSuccessNotice(false);
      onClose();
    }, 700);
  };

  const handleReset = () => {
    if (window.confirm('確定要將所有內容還原為初始預設資料嗎？這將會覆蓋您目前的修改。')) {
      const reset = resetCoupleData();
      setFormData(JSON.parse(JSON.stringify(reset)));
      onSaveData(reset);
      onClose();
    }
  };

  // Helper for uploading local image file with intelligent compression (WebP/JPEG)
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    callback: (base64Url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      compressImage(file, { maxDim: 1080, quality: 0.80 })
        .then((compressedUrl) => {
          callback(compressedUrl);
        })
        .catch((err) => {
          console.warn('Image compression fallback:', err);
          const reader = new FileReader();
          reader.onload = (uploadEvent) => {
            const result = uploadEvent.target?.result as string;
            if (result) callback(result);
          };
          reader.readAsDataURL(file);
        })
        .finally(() => {
          e.target.value = '';
        });
    }
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && parsed.siteTitle) {
            setFormData(parsed);
            onSaveData(parsed);
            alert('備份設定檔匯入成功！');
          } else {
            alert('檔案格式不正確');
          }
        } catch (err) {
          alert('讀取 JSON 失敗，請確認檔案格式');
        }
      };
      reader.readAsText(file);
    }
  };

  const subTabs = [
    { id: 'basic', label: '基本資料與首頁' },
    { id: 'pageTitles', label: '各分頁標題副標' },
    { id: 'cover', label: 'LOADING / 封面頁設定' },
    { id: 'profile', label: '雙人人設檔案' },
    { id: 'coupleProfile', label: '菅緒檔案' },
    { id: 'milestone', label: '時間線里程碑' },
    { id: 'story', label: '故事章節' },
    { id: 'album', label: '相簿照片' },
    { id: 'au', label: '平行宇宙 AU' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs select-none">
      <div
        className="pixel-window w-full max-w-5xl max-h-[92vh] flex flex-col rounded-lg overflow-hidden shadow-2xl bg-[#FFF8F5]"
        id="site-content-editor-modal"
      >
        {/* Title Bar */}
        <div className="bg-[#442F2A] text-[#FFF8F5] px-4 py-2.5 flex items-center justify-between font-pixel text-xs tracking-wider">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#E0BAC7]" />
            <span className="font-bold">ADMIN EDITOR // 戀愛紀錄網站內容總編輯器</span>
          </div>
          <button
            onClick={onClose}
            className="w-5 h-5 bg-[#E0BAC7] text-[#442F2A] rounded flex items-center justify-center font-bold hover:bg-[#C89398] cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Sub-tabs for navigation */}
        <div className="bg-[#F8EDF1] border-b-2 border-[#442F2A] px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto text-xs font-pixel">
          {subTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-3 py-1 rounded border transition whitespace-nowrap cursor-pointer ${
                activeSubTab === tab.id
                  ? 'bg-[#442F2A] text-white border-[#442F2A] font-bold shadow-xs'
                  : 'bg-white text-[#442F2A] border-[#442F2A]/30 hover:bg-[#E0BAC7]/40'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 text-xs font-pixel space-y-4">
          {/* TAB 1: BASIC INFO */}
          {activeSubTab === 'basic' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-[#442F2A] block mb-1">網站標題 (Site Title)：</label>
                  <input
                    type="text"
                    value={formData.siteTitle}
                    onChange={(e) => setFormData({ ...formData, siteTitle: e.target.value })}
                    className="w-full bg-white border-2 border-[#442F2A] rounded p-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#442F2A] block mb-1">網站副標題 (Subtitle)：</label>
                  <input
                    type="text"
                    value={formData.siteSubtitle}
                    onChange={(e) => setFormData({ ...formData, siteSubtitle: e.target.value })}
                    className="w-full bg-white border-2 border-[#442F2A] rounded p-2 text-xs"
                  />
                </div>
              </div>

              {/* 各分頁標題副標快速入口提示 */}
              <div className="flex items-center justify-between p-2.5 bg-[#F8EDF1] border border-[#442F2A]/30 rounded text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#C89398]" />
                  <span className="text-[#442F2A] font-bold">各分頁頂部標題與副標題：</span>
                  <span className="text-[11px] text-[#442F2A]/70 hidden sm:inline">
                    可切換至「各分頁標題副標」或各分頁標籤即時編輯
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSubTab('pageTitles')}
                  className="px-2.5 py-1 bg-[#442F2A] text-white hover:bg-[#5A3825] rounded text-[11px] font-bold cursor-pointer transition"
                >
                  前往編輯分頁標題 →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-[#442F2A] block mb-1">交往紀念日 (Anniversary Date)：</label>
                  <input
                    type="date"
                    value={formData.anniversaryDate}
                    onChange={(e) => setFormData({ ...formData, anniversaryDate: e.target.value })}
                    className="w-full bg-white border-2 border-[#442F2A] rounded p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#442F2A] block mb-1">相識紀念註解 (First Met / Anniversary Note)：</label>
                  <input
                    type="text"
                    value={formData.anniversaryNote || ''}
                    placeholder="例：相識於2024.02.22"
                    onChange={(e) => setFormData({ ...formData, anniversaryNote: e.target.value })}
                    className="w-full bg-white border-2 border-[#442F2A] rounded p-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-[#442F2A] block">首頁金句 (Intro Quote)：</label>
                  <span className="text-[10px] text-[#442F2A]/70">
                    可直接按 Enter 換行 ｜ 斜體前後加 * 或 _
                  </span>
                </div>
                <textarea
                  rows={2}
                  value={formData.introQuote}
                  onChange={(e) => setFormData({ ...formData, introQuote: e.target.value })}
                  placeholder="可在此輸入句子，支援按 Enter 直接換行；前後加上 *文字* 可呈現斜體"
                  className="w-full bg-white border-2 border-[#442F2A] rounded p-2 text-xs leading-relaxed"
                />
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const quote = formData.introQuote || '';
                      setFormData({
                        ...formData,
                        introQuote: quote ? `${quote} ~~劃掉文字~~` : '~~劃掉文字~~',
                      });
                    }}
                    className="text-[10px] px-2 py-0.5 rounded bg-[#FFF8F5] border border-[#442F2A]/40 text-[#442F2A] hover:bg-[#E0BAC7]/40 cursor-pointer font-bold flex items-center gap-1 line-through"
                  >
                    <span>S</span>
                    <span className="no-underline">插入刪除線 (~~文字~~)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const quote = formData.introQuote || '';
                      setFormData({
                        ...formData,
                        introQuote: quote ? `${quote} *斜體文字*` : '*斜體文字*',
                      });
                    }}
                    className="text-[10px] px-2 py-0.5 rounded bg-[#FFF8F5] border border-[#442F2A]/40 text-[#442F2A] hover:bg-[#E0BAC7]/40 cursor-pointer font-bold flex items-center gap-1"
                  >
                    <span className="italic font-serif">I</span>
                    <span>插入斜體語法 (*文字*)</span>
                  </button>
                  <span className="text-[10px] text-[#C89398]">
                    例：*以風聲，以水響。*
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-[#442F2A] block">首頁完整介紹 (Intro Description)：</label>
                  <span className="text-[10px] text-[#442F2A]/70">
                    可直接按 Enter 換行 ｜ 支援刪除線 ~~文字~~ 與斜體 *文字*
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={formData.introDescription}
                  onChange={(e) => setFormData({ ...formData, introDescription: e.target.value })}
                  placeholder="可在此輸入內文，支援按 Enter 換行、~~刪除線~~ 與 *斜體語法*"
                  className="w-full bg-white border-2 border-[#442F2A] rounded p-2 text-xs leading-relaxed"
                />
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const desc = formData.introDescription || '';
                      setFormData({
                        ...formData,
                        introDescription: desc ? `${desc} ~~劃掉文字~~` : '~~劃掉文字~~',
                      });
                    }}
                    className="text-[10px] px-2 py-0.5 rounded bg-[#FFF8F5] border border-[#442F2A]/40 text-[#442F2A] hover:bg-[#E0BAC7]/40 cursor-pointer font-bold flex items-center gap-1 line-through"
                  >
                    <span>S</span>
                    <span className="no-underline">插入刪除線 (~~文字~~)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const desc = formData.introDescription || '';
                      setFormData({
                        ...formData,
                        introDescription: desc ? `${desc} *斜體文字*` : '*斜體文字*',
                      });
                    }}
                    className="text-[10px] px-2 py-0.5 rounded bg-[#FFF8F5] border border-[#442F2A]/40 text-[#442F2A] hover:bg-[#E0BAC7]/40 cursor-pointer font-bold flex items-center gap-1"
                  >
                    <span className="italic font-serif">I</span>
                    <span>插入斜體語法 (*文字*)</span>
                  </button>
                </div>
              </div>

              {/* Main Illustration Settings with File Upload */}
              <div className="border-t border-[#442F2A]/20 pt-4">
                <label className="font-bold text-[#442F2A] block mb-1">
                  首頁精選主插圖 (Main Featured Illustration URL 或 本機上傳)：
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={formData.mainIllustration}
                    onChange={(e) => setFormData({ ...formData, mainIllustration: e.target.value })}
                    className="flex-1 bg-white border-2 border-[#442F2A] rounded p-1.5 text-xs truncate"
                  />
                  <label className="pixel-btn px-2.5 py-1 bg-[#E0BAC7] rounded text-[11px] flex items-center gap-1 cursor-pointer shrink-0 font-bold">
                    <Upload className="w-3 h-3" />
                    <span>上傳圖片</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleFileUpload(e, (url) => setFormData({ ...formData, mainIllustration: url }))
                      }
                    />
                  </label>
                </div>
                <div className="h-32 sm:h-40 w-full rounded border-2 border-[#442F2A] overflow-hidden bg-neutral-100 shadow-inner">
                  <img src={formData.mainIllustration} alt="Main Preview" className="w-full h-full object-cover" />
                </div>
              </div>

              {/* Sidebar Avatar Settings with File Upload */}
              <div className="border-t border-[#442F2A]/20 pt-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                  <label className="font-bold text-[#442F2A] block">
                    側邊欄個人頭貼 (Sidebar Avatar URL 或 本機上傳)：
                  </label>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span className="text-[#442F2A]/70">快速套用：</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, sidebarAvatar: formData.characterA.avatar })}
                      className="px-1.5 py-0.5 rounded bg-white border border-[#442F2A]/40 hover:bg-[#E0BAC7] text-[#442F2A] font-bold cursor-pointer"
                    >
                      {formData.characterA.name || '角色A'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, sidebarAvatar: formData.characterB.avatar })}
                      className="px-1.5 py-0.5 rounded bg-white border border-[#442F2A]/40 hover:bg-[#E0BAC7] text-[#442F2A] font-bold cursor-pointer"
                    >
                      {formData.characterB.name || '角色B'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, sidebarAvatar: formData.mainIllustration })}
                      className="px-1.5 py-0.5 rounded bg-white border border-[#442F2A]/40 hover:bg-[#E0BAC7] text-[#442F2A] font-bold cursor-pointer"
                    >
                      主插圖
                    </button>
                  </div>
                </div>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={formData.sidebarAvatar || ''}
                    placeholder="可貼上圖片網址或由右側上傳本機照片"
                    onChange={(e) => setFormData({ ...formData, sidebarAvatar: e.target.value })}
                    className="flex-1 bg-white border-2 border-[#442F2A] rounded p-1.5 text-xs truncate"
                  />
                  <label className="pixel-btn px-2.5 py-1 bg-[#E0BAC7] hover:bg-[#d49bb0] rounded text-[11px] flex items-center gap-1 cursor-pointer shrink-0 font-bold">
                    <Upload className="w-3 h-3" />
                    <span>上傳頭貼</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleFileUpload(e, (url) => setFormData({ ...formData, sidebarAvatar: url }))
                      }
                    />
                  </label>
                </div>
                <div className="flex items-center gap-3 bg-white p-2.5 rounded-lg border-2 border-[#442F2A]/40 shadow-xs">
                  <div className="w-16 h-16 rounded-full border-3 border-[#442F2A] overflow-hidden bg-[#E0BAC7] shrink-0 shadow-sm">
                    <img
                      src={formData.sidebarAvatar || formData.mainIllustration || formData.characterB.avatar}
                      alt="Sidebar Avatar Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-xs text-[#442F2A]">
                    <p className="font-bold text-xs text-[#442F2A]">側邊欄圓形頭貼即時預覽</p>
                    <p className="text-[11px] text-[#442F2A]/70 mt-0.5">
                      支援自定義上傳本機圖片或網路連結，將同步呈現於左側導航欄的圓形相框內。
                    </p>
                  </div>
                </div>
              </div>

              {/* NOTICE & MEMO POPUPS (站務須知與日常守則) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[#442F2A]/20 pt-4">
                <div className="p-3 bg-white rounded border-2 border-[#442F2A] space-y-2">
                  <h4 className="font-bold text-xs text-[#442F2A] flex items-center gap-1.5 border-b border-[#442F2A]/20 pb-1">
                    <FileText className="w-3.5 h-3.5 text-[#C89398]" />
                    <span>進站須知彈窗 (NOTICE)</span>
                  </h4>
                  <div>
                    <label className="text-[10px] font-bold block text-[#442F2A]">標題：</label>
                    <input
                      type="text"
                      value={formData.introNotice?.title || ''}
                      placeholder="✦ NOTICE / 進站須知 ✦"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          introNotice: { ...(formData.introNotice || { content: '' }), title: e.target.value },
                        })
                      }
                      className="w-full bg-[#FFF8F5] border border-[#442F2A] rounded p-1 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold block text-[#442F2A]">內容：</label>
                    <textarea
                      rows={4}
                      value={formData.introNotice?.content || ''}
                      placeholder="進站須知內容說明..."
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          introNotice: { ...(formData.introNotice || { title: '' }), content: e.target.value },
                        })
                      }
                      className="w-full bg-[#FFF8F5] border border-[#442F2A] rounded p-1 text-xs"
                    />
                  </div>
                </div>

                <div className="p-3 bg-white rounded border-2 border-[#442F2A] space-y-2">
                  <h4 className="font-bold text-xs text-[#442F2A] flex items-center gap-1.5 border-b border-[#442F2A]/20 pb-1">
                    <Heart className="w-3.5 h-3.5 text-[#C89398]" />
                    <span>日常守則 / 特別感謝 (MEMO / SPECIAL THANKS)</span>
                  </h4>
                  <div>
                    <label className="text-[10px] font-bold block text-[#442F2A]">標題：</label>
                    <input
                      type="text"
                      value={formData.introMemo?.title || ''}
                      placeholder="✦ MEMO / SPECIAL THANKS ✦"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          introMemo: { ...(formData.introMemo || { content: '' }), title: e.target.value },
                        })
                      }
                      className="w-full bg-[#FFF8F5] border border-[#442F2A] rounded p-1 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold block text-[#442F2A]">內容：</label>
                    <textarea
                      rows={4}
                      value={formData.introMemo?.content || ''}
                      placeholder="日常守則或感謝內容..."
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          introMemo: { ...(formData.introMemo || { title: '' }), content: e.target.value },
                        })
                      }
                      className="w-full bg-[#FFF8F5] border border-[#442F2A] rounded p-1 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* SPECIAL ANNIVERSARIES (日曆特殊紀念日設定) */}
              <div className="border-t-2 border-[#442F2A]/30 pt-4 mt-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <h4 className="font-bold text-sm text-[#9D5A64] flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-[#C89398]" />
                      <span>特殊紀念日與節日設定 (ANNIVERSARY & HOLIDAY)</span>
                    </h4>
                    <p className="text-[11px] text-[#442F2A]/70">
                      可自行選擇新增「紀念日」（粉色愛心滿版）或「節日」（粉色星星線條框，中間不上色）！
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        const newId = 'sp-' + Date.now();
                        const newDate: SpecialDate = {
                          id: newId,
                          title: '新特殊紀念日',
                          category: 'anniversary',
                          date: '09-28',
                          tag: 'Sweet',
                          note: '浪漫心動紀念日',
                        };
                        setFormData({
                          ...formData,
                          specialDates: [...(formData.specialDates || []), newDate],
                        });
                      }}
                      className="pixel-btn px-2.5 py-1 bg-[#E0BAC7] hover:bg-[#d49bb0] rounded text-xs font-bold flex items-center gap-1 cursor-pointer"
                      title="新增粉色愛心紀念日"
                    >
                      <Heart className="w-3.5 h-3.5 fill-[#C89398]" />
                      <span>+ 新增紀念日</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const newId = 'sp-' + Date.now();
                        const newDate: SpecialDate = {
                          id: newId,
                          title: '新節日活動',
                          category: 'holiday',
                          date: '12-25',
                          tag: 'Holiday',
                          note: '溫馨節日回憶',
                        };
                        setFormData({
                          ...formData,
                          specialDates: [...(formData.specialDates || []), newDate],
                        });
                      }}
                      className="pixel-btn px-2.5 py-1 bg-amber-100 hover:bg-amber-200 border border-[#442F2A] rounded text-xs font-bold flex items-center gap-1 cursor-pointer"
                      title="新增粉色星星線條框節日"
                    >
                      <Star className="w-3.5 h-3.5 text-[#C89398]" />
                      <span>+ 新增節日</span>
                    </button>
                  </div>
                </div>

                {(!formData.specialDates || formData.specialDates.length === 0) ? (
                  <div className="p-4 bg-white/70 rounded border border-dashed border-[#442F2A]/40 text-center text-[#442F2A]/60 text-xs">
                    目前尚未設定特殊紀念日或節日，點擊上方按鈕新增！
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {formData.specialDates.map((sd, idx) => (
                      <div
                        key={sd.id || idx}
                        className="bg-white p-3 rounded border-2 border-[#442F2A]/30 flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between shadow-xs"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 flex-1 w-full">
                          <div>
                            <span className="text-[10px] text-[#442F2A]/60 block font-bold">類別 (CATEGORY)</span>
                            <select
                              value={sd.category || 'anniversary'}
                              onChange={(e) => {
                                const updated = [...(formData.specialDates || [])];
                                updated[idx] = {
                                  ...updated[idx],
                                  category: e.target.value as 'anniversary' | 'holiday',
                                };
                                setFormData({ ...formData, specialDates: updated });
                              }}
                              className="w-full bg-[#FFF8F5] border border-[#442F2A]/40 rounded p-1 text-xs font-bold"
                            >
                              <option value="anniversary">♥ 紀念日 (粉色愛心)</option>
                              <option value="holiday">★ 節日 (星星線條框)</option>
                            </select>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#442F2A]/60 block font-bold">名稱 (TITLE)</span>
                            <input
                              type="text"
                              value={sd.title}
                              placeholder="例: 9/28 夏日花火回憶日"
                              onChange={(e) => {
                                const updated = [...(formData.specialDates || [])];
                                updated[idx] = { ...updated[idx], title: e.target.value };
                                setFormData({ ...formData, specialDates: updated });
                              }}
                              className="w-full bg-[#FFF8F5] border border-[#442F2A]/40 rounded p-1 text-xs"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-[#442F2A]/60 block font-bold">月-日 (MM-DD)</span>
                            <input
                              type="text"
                              value={sd.date}
                              placeholder="09-28"
                              onChange={(e) => {
                                const updated = [...(formData.specialDates || [])];
                                updated[idx] = { ...updated[idx], date: e.target.value };
                                setFormData({ ...formData, specialDates: updated });
                              }}
                              className="w-full bg-[#FFF8F5] border border-[#442F2A]/40 rounded p-1 text-xs font-mono"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-[#442F2A]/60 block font-bold">說明備註 (NOTE)</span>
                            <input
                              type="text"
                              value={sd.note || ''}
                              placeholder="備註說明..."
                              onChange={(e) => {
                                const updated = [...(formData.specialDates || [])];
                                updated[idx] = { ...updated[idx], note: e.target.value };
                                setFormData({ ...formData, specialDates: updated });
                              }}
                              className="w-full bg-[#FFF8F5] border border-[#442F2A]/40 rounded p-1 text-xs"
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const updated = (formData.specialDates || []).filter((_, i) => i !== idx);
                            setFormData({ ...formData, specialDates: updated });
                          }}
                          className="p-1.5 text-[#C89398] hover:bg-[#F8EDF1] rounded border border-transparent hover:border-[#E0BAC7] cursor-pointer self-end sm:self-center shrink-0"
                          title="刪除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: 各分頁標題與副標題 (PAGE TITLES & SUBTITLES) */}
          {activeSubTab === 'pageTitles' && (
            <div className="space-y-4">
              <div className="p-3 bg-[#E0BAC7]/30 rounded-lg border border-[#442F2A]/30">
                <h4 className="font-bold text-[#442F2A] text-sm flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>各分頁頂部標題與副標題編輯 (Page Titles & Subtitles)</span>
                </h4>
                <p className="text-[11px] text-[#442F2A]/70">
                  在此自定義切換至各主要分頁時，頂部橫幅卡片所顯示的英日文大標題與副標題文字。
                </p>
              </div>

              {/* 1. CHARACTER PROFILE */}
              <div className="p-3.5 bg-white rounded-lg border-2 border-[#442F2A] shadow-xs space-y-2.5">
                <div className="flex items-center justify-between border-b border-[#442F2A]/20 pb-1.5">
                  <span className="font-bold text-xs text-[#442F2A] flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#C89398]" />
                    <span>01. 角色人設檔案分頁 (CHARACTER PROFILE)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      updatePageTitle('character', 'title', 'CHARACTER PROFILE');
                      updatePageTitle('character', 'subtitle', 'キャラクター情報解禁');
                    }}
                    className="text-[10px] px-2 py-0.5 rounded bg-[#FFF8F5] border border-[#442F2A]/30 text-[#442F2A] hover:bg-[#E0BAC7]/40 cursor-pointer font-bold"
                  >
                    恢復預設文字
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-[11px] text-[#442F2A] block mb-1">
                      分頁主標題 (Page Title)：
                    </label>
                    <input
                      type="text"
                      value={formData.pageTitles?.character?.title ?? 'CHARACTER PROFILE'}
                      onChange={(e) => updatePageTitle('character', 'title', e.target.value)}
                      placeholder="CHARACTER PROFILE"
                      className="w-full bg-[#FFF8F5] border border-[#442F2A] rounded p-2 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[11px] text-[#442F2A] block mb-1">
                      分頁副標題 (Page Subtitle)：
                    </label>
                    <input
                      type="text"
                      value={formData.pageTitles?.character?.subtitle ?? 'キャラクター情報解禁'}
                      onChange={(e) => updatePageTitle('character', 'subtitle', e.target.value)}
                      placeholder="キャラクター情報解禁"
                      className="w-full bg-[#FFF8F5] border border-[#442F2A] rounded p-2 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* 2. STORY */}
              <div className="p-3.5 bg-white rounded-lg border-2 border-[#442F2A] shadow-xs space-y-2.5">
                <div className="flex items-center justify-between border-b border-[#442F2A]/20 pb-1.5">
                  <span className="font-bold text-xs text-[#442F2A] flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#442F2A]" />
                    <span>02. 故事章節分頁 (STORY)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      updatePageTitle('story', 'title', 'STORY');
                      updatePageTitle('story', 'subtitle', '烏野高校で、まだ描かれていない物語');
                    }}
                    className="text-[10px] px-2 py-0.5 rounded bg-[#FFF8F5] border border-[#442F2A]/30 text-[#442F2A] hover:bg-[#E0BAC7]/40 cursor-pointer font-bold"
                  >
                    恢復預設文字
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-[11px] text-[#442F2A] block mb-1">
                      分頁主標題 (Page Title)：
                    </label>
                    <input
                      type="text"
                      value={formData.pageTitles?.story?.title ?? 'STORY'}
                      onChange={(e) => updatePageTitle('story', 'title', e.target.value)}
                      placeholder="STORY"
                      className="w-full bg-[#FFF8F5] border border-[#442F2A] rounded p-2 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[11px] text-[#442F2A] block mb-1">
                      分頁副標題 (Page Subtitle)：
                    </label>
                    <input
                      type="text"
                      value={formData.pageTitles?.story?.subtitle ?? '烏野高校で、まだ描かれていない物語'}
                      onChange={(e) => updatePageTitle('story', 'subtitle', e.target.value)}
                      placeholder="烏野高校で、まだ描かれていない物語"
                      className="w-full bg-[#FFF8F5] border border-[#442F2A] rounded p-2 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* 3. ALBUM */}
              <div className="p-3.5 bg-white rounded-lg border-2 border-[#442F2A] shadow-xs space-y-2.5">
                <div className="flex items-center justify-between border-b border-[#442F2A]/20 pb-1.5">
                  <span className="font-bold text-xs text-[#442F2A] flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#C89398]" />
                    <span>03. 珍藏相簿分頁 (ALBUM)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      updatePageTitle('album', 'title', 'ALBUM');
                      updatePageTitle('album', 'subtitle', '新規描き下ろしイラスト公開！');
                    }}
                    className="text-[10px] px-2 py-0.5 rounded bg-[#FFF8F5] border border-[#442F2A]/30 text-[#442F2A] hover:bg-[#E0BAC7]/40 cursor-pointer font-bold"
                  >
                    恢復預設文字
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-[11px] text-[#442F2A] block mb-1">
                      分頁主標題 (Page Title)：
                    </label>
                    <input
                      type="text"
                      value={formData.pageTitles?.album?.title ?? 'ALBUM'}
                      onChange={(e) => updatePageTitle('album', 'title', e.target.value)}
                      placeholder="ALBUM"
                      className="w-full bg-[#FFF8F5] border border-[#442F2A] rounded p-2 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[11px] text-[#442F2A] block mb-1">
                      分頁副標題 (Page Subtitle)：
                    </label>
                    <input
                      type="text"
                      value={formData.pageTitles?.album?.subtitle ?? '新規描き下ろしイラスト公開！'}
                      onChange={(e) => updatePageTitle('album', 'subtitle', e.target.value)}
                      placeholder="新規描き下ろしイラスト公開！"
                      className="w-full bg-[#FFF8F5] border border-[#442F2A] rounded p-2 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* 4. AU */}
              <div className="p-3.5 bg-white rounded-lg border-2 border-[#442F2A] shadow-xs space-y-2.5">
                <div className="flex items-center justify-between border-b border-[#442F2A]/20 pb-1.5">
                  <span className="font-bold text-xs text-[#442F2A] flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#442F2A]" />
                    <span>04. 平行宇宙分頁 (ALTERNATIVE UNIVERSE / AU)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      updatePageTitle('au', 'title', 'ALTERNATIVE UNIVERSE');
                      updatePageTitle('au', 'subtitle', '縁下監督 最新作');
                    }}
                    className="text-[10px] px-2 py-0.5 rounded bg-[#FFF8F5] border border-[#442F2A]/30 text-[#442F2A] hover:bg-[#E0BAC7]/40 cursor-pointer font-bold"
                  >
                    恢復預設文字
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-[11px] text-[#442F2A] block mb-1">
                      分頁主標題 (Page Title)：
                    </label>
                    <input
                      type="text"
                      value={formData.pageTitles?.au?.title ?? 'ALTERNATIVE UNIVERSE'}
                      onChange={(e) => updatePageTitle('au', 'title', e.target.value)}
                      placeholder="ALTERNATIVE UNIVERSE"
                      className="w-full bg-[#FFF8F5] border border-[#442F2A] rounded p-2 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[11px] text-[#442F2A] block mb-1">
                      分頁副標題 (Page Subtitle)：
                    </label>
                    <input
                      type="text"
                      value={formData.pageTitles?.au?.subtitle ?? '縁下監督 最新作'}
                      onChange={(e) => updatePageTitle('au', 'subtitle', e.target.value)}
                      placeholder="縁下監督 最新作"
                      className="w-full bg-[#FFF8F5] border border-[#442F2A] rounded p-2 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LOADING / COVER SCREEN SETTINGS */}
          {activeSubTab === 'cover' && (
            <div className="space-y-4">
              <div className="p-3 bg-[#E0BAC7]/30 rounded-lg border border-[#442F2A]/30">
                <h4 className="font-bold text-[#442F2A] text-sm flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>LOADING / 封面進入頁設定</span>
                </h4>
                <p className="text-[11px] text-[#442F2A]/70">
                  自訂訪客點進網站時最先看到的封面進入頁。設定封面大圖、頂部狀態文字與底部引導文字。
                </p>
              </div>

              {/* Cover Image */}
              <div>
                <label className="font-bold text-[#442F2A] block mb-1">封面大圖 (Cover Image URL 或 本機上傳)：</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={formData.coverImage}
                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                    className="flex-1 bg-white border-2 border-[#442F2A] rounded p-1.5 text-xs truncate"
                  />
                  <label className="pixel-btn px-2.5 py-1 bg-[#E0BAC7] rounded text-[11px] flex items-center gap-1 cursor-pointer shrink-0 font-bold">
                    <Upload className="w-3 h-3" />
                    <span>上傳圖片</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, (url) => setFormData({ ...formData, coverImage: url }))}
                    />
                  </label>
                </div>
                <div className="h-44 sm:h-56 w-full rounded border-2 border-[#442F2A] overflow-hidden bg-neutral-900 shadow-inner">
                  <img src={formData.coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                </div>
              </div>

              {/* Cover Top Status & Bottom Prompt */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-[#442F2A] block mb-1">頂部系統狀態列文字 (Top Status Bar)：</label>
                  <input
                    type="text"
                    value={formData.coverTopStatus || ''}
                    placeholder="CONNECTED TO DESKTOP // SUNAO"
                    onChange={(e) => setFormData({ ...formData, coverTopStatus: e.target.value })}
                    className="w-full bg-white border-2 border-[#442F2A] rounded p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#442F2A] block mb-1">底部置中引導文字 (Bottom Bar Text)：</label>
                  <input
                    type="text"
                    value={formData.coverBottomText || ''}
                    placeholder="點選任意區域即可進入主介面"
                    onChange={(e) => setFormData({ ...formData, coverBottomText: e.target.value })}
                    className="w-full bg-white border-2 border-[#442F2A] rounded p-2 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CHARACTER PROFILES (CHARACTERS) */}
          {activeSubTab === 'profile' && (
            <div className="space-y-4">
              {/* Profile Page Title & Subtitle Card */}
              <div className="p-3 bg-white rounded-lg border-2 border-[#442F2A] shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-[#442F2A] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#C89398]" />
                    <span>角色人設分頁頂部標題與副標題 (Header Title & Subtitle)：</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      updatePageTitle('character', 'title', 'CHARACTER PROFILE');
                      updatePageTitle('character', 'subtitle', 'キャラクター情報解禁');
                    }}
                    className="text-[10px] px-2 py-0.5 rounded bg-[#FFF8F5] border border-[#442F2A]/30 text-[#442F2A] hover:bg-[#E0BAC7]/40 cursor-pointer font-bold"
                  >
                    恢復預設文字
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-[#442F2A] block mb-0.5">主標題：</label>
                    <input
                      type="text"
                      value={formData.pageTitles?.character?.title ?? 'CHARACTER PROFILE'}
                      onChange={(e) => updatePageTitle('character', 'title', e.target.value)}
                      placeholder="CHARACTER PROFILE"
                      className="w-full bg-[#FFF8F5] border border-[#442F2A] rounded p-1.5 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#442F2A] block mb-0.5">副標題：</label>
                    <input
                      type="text"
                      value={formData.pageTitles?.character?.subtitle ?? 'キャラクター情報解禁'}
                      onChange={(e) => updatePageTitle('character', 'subtitle', e.target.value)}
                      placeholder="キャラクター情報解禁"
                      className="w-full bg-[#FFF8F5] border border-[#442F2A] rounded p-1.5 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Profile Sub-navigation Switcher */}
              <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border-2 border-[#442F2A]">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-[#442F2A] mr-1">檢視切換：</span>
                  <button
                    type="button"
                    onClick={() => setProfileViewMode('both')}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition cursor-pointer ${
                      profileViewMode === 'both'
                        ? 'bg-[#442F2A] text-[#FFF8F5]'
                        : 'bg-[#F8EDF1] text-[#442F2A] hover:bg-[#E0BAC7]'
                    }`}
                  >
                    雙角色並排檢視
                  </button>
                  <button
                    type="button"
                    onClick={() => setProfileViewMode('a')}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition cursor-pointer ${
                      profileViewMode === 'a'
                        ? 'bg-[#442F2A] text-[#FFF8F5]'
                        : 'bg-[#F8EDF1] text-[#442F2A] hover:bg-[#E0BAC7]'
                    }`}
                  >
                    角色 A ({formData.characterA.name || '菅原孝支'})
                  </button>
                  <button
                    type="button"
                    onClick={() => setProfileViewMode('b')}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition cursor-pointer ${
                      profileViewMode === 'b'
                        ? 'bg-[#9D5A64] text-[#FFF8F5]'
                        : 'bg-[#F8EDF1] text-[#9D5A64] hover:bg-[#E0BAC7]'
                    }`}
                  >
                    角色 B ({formData.characterB.name || '宮原七緒'})
                  </button>
                </div>

                <div className="text-[11px] text-[#442F2A]/60 hidden md:block">
                  ※ 包含色票、基本資料(DOSSIER)、STATUS 數值條與人設故事段落
                </div>
              </div>

              {/* Character Edit Sections */}
              <div
                className={`grid gap-4 ${
                  profileViewMode === 'both' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
                }`}
              >
                {(profileViewMode === 'both' || profileViewMode === 'a') && (
                  <EditCharacterSection
                    charKey="characterA"
                    charRoleLabel="角色 A"
                    themeColor="#442F2A"
                    accentColor="#E0BAC7"
                    character={formData.characterA}
                    onUpdate={(updated) => setFormData({ ...formData, characterA: updated })}
                    handleFileUpload={handleFileUpload}
                  />
                )}

                {(profileViewMode === 'both' || profileViewMode === 'b') && (
                  <EditCharacterSection
                    charKey="characterB"
                    charRoleLabel="角色 B"
                    themeColor="#C89398"
                    accentColor="#9D5A64"
                    character={formData.characterB}
                    onUpdate={(updated) => setFormData({ ...formData, characterB: updated })}
                    handleFileUpload={handleFileUpload}
                  />
                )}
              </div>
            </div>
          )}

          {/* TAB 4: 菅緒檔案 (COUPLE PROFILE) */}
          {activeSubTab === 'coupleProfile' && (
            <div className="space-y-4">
              {/* Items List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#442F2A]">菅緒代表項目清單 (代表色、代表物、動物等)：</span>
                  <button
                    type="button"
                    onClick={() => {
                      const newItem: CoupleProfileItem = {
                        id: 'cp-' + Date.now(),
                        category: '自訂項目 (NEW CATEGORY)',
                        charAValue: '角色 A 的代表內容',
                        charANote: '',
                        charBValue: '角色 B 的代表內容',
                        charBNote: '',
                        sugaNanaValue: '菅緒的代表內容',
                        sugaNanaNote: '',
                      };
                      const curItems = formData.coupleProfile?.items || [];
                      setFormData({
                        ...formData,
                        coupleProfile: {
                          ...(formData.coupleProfile || { title: '', motto: '', verse: '', items: [] }),
                          items: [...curItems, newItem],
                        },
                      });
                    }}
                    className="pixel-btn px-2.5 py-1 bg-[#E0BAC7] rounded text-xs flex items-center gap-1 font-bold cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>新增代表項目</span>
                  </button>
                </div>

                {(formData.coupleProfile?.items || []).map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-3 bg-white rounded border-2 border-[#442F2A] space-y-3 relative shadow-2xs"
                  >
                    <div className="flex items-center justify-between border-b border-[#442F2A]/20 pb-1">
                      <span className="font-bold text-[#9D5A64]">項目 #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const nextItems = (formData.coupleProfile?.items || []).filter((_, i) => i !== idx);
                          setFormData({
                            ...formData,
                            coupleProfile: {
                              ...formData.coupleProfile!,
                              items: nextItems,
                            },
                          });
                        }}
                        className="text-[#C89398] hover:text-red-700 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-[#442F2A]">
                        項目名稱 (如：代表色、代表物、動物意象、心動暗號)：
                      </label>
                      <input
                        type="text"
                        value={item.category}
                        onChange={(e) => {
                          const nextItems = [...(formData.coupleProfile?.items || [])];
                          nextItems[idx].category = e.target.value;
                          setFormData({
                            ...formData,
                            coupleProfile: { ...formData.coupleProfile!, items: nextItems },
                          });
                        }}
                        className="w-full bg-[#FFF8F5] border border-[#442F2A]/40 rounded p-1 text-xs font-bold"
                      />
                    </div>

                    {/* Three Entities: A, B, and SugaNana */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* Character A */}
                      <div className="bg-[#FFF8F5]/60 p-2.5 rounded border border-[#442F2A]/20 space-y-2">
                        <label className="text-[10px] text-[#442F2A] font-bold flex items-center gap-1">
                          <PixelHeart color="#442F2A" className="w-3 h-3" />
                          <span>{formData.characterA.name} 數值/描述：</span>
                        </label>
                        <input
                          type="text"
                          value={item.charAValue}
                          onChange={(e) => {
                            const nextItems = [...(formData.coupleProfile?.items || [])];
                            nextItems[idx].charAValue = e.target.value;
                            setFormData({
                              ...formData,
                              coupleProfile: { ...formData.coupleProfile!, items: nextItems },
                            });
                          }}
                          className="w-full bg-white border border-[#442F2A]/40 rounded p-1 text-xs"
                        />
                        <label className="block text-[9px] text-[#442F2A]/70 font-bold">
                          {formData.characterA.name} 解讀 (選填，無內容則不顯示)：
                        </label>
                        <textarea
                          rows={2}
                          value={item.charANote !== undefined ? item.charANote : (item.note || '')}
                          placeholder="選填解讀說明..."
                          onChange={(e) => {
                            const nextItems = [...(formData.coupleProfile?.items || [])];
                            nextItems[idx].charANote = e.target.value;
                            setFormData({
                              ...formData,
                              coupleProfile: { ...formData.coupleProfile!, items: nextItems },
                            });
                          }}
                          className="w-full bg-white border border-[#442F2A]/40 rounded p-1 text-xs"
                        />
                      </div>

                      {/* Character B */}
                      <div className="bg-[#F8EDF1]/60 p-2.5 rounded border border-[#E0BAC7] space-y-2">
                        <label className="text-[10px] text-[#9D5A64] font-bold flex items-center gap-1">
                          <PixelHeart color="#C89398" className="w-3 h-3" />
                          <span>{formData.characterB.name} 數值/描述：</span>
                        </label>
                        <input
                          type="text"
                          value={item.charBValue}
                          onChange={(e) => {
                            const nextItems = [...(formData.coupleProfile?.items || [])];
                            nextItems[idx].charBValue = e.target.value;
                            setFormData({
                              ...formData,
                              coupleProfile: { ...formData.coupleProfile!, items: nextItems },
                            });
                          }}
                          className="w-full bg-white border border-[#442F2A]/40 rounded p-1 text-xs"
                        />
                        <label className="block text-[9px] text-[#9D5A64] font-bold">
                          {formData.characterB.name} 解讀 (選填，無內容則不顯示)：
                        </label>
                        <textarea
                          rows={2}
                          value={item.charBNote || ''}
                          placeholder="選填解讀說明..."
                          onChange={(e) => {
                            const nextItems = [...(formData.coupleProfile?.items || [])];
                            nextItems[idx].charBNote = e.target.value;
                            setFormData({
                              ...formData,
                              coupleProfile: { ...formData.coupleProfile!, items: nextItems },
                            });
                          }}
                          className="w-full bg-white border border-[#442F2A]/40 rounded p-1 text-xs"
                        />
                      </div>

                      {/* 菅緒 */}
                      <div className="bg-[#FFF8F5] p-2.5 rounded border-2 border-[#E0BAC7] space-y-2">
                        <label className="text-[10px] text-[#442F2A] font-bold flex items-center gap-1">
                          <OverlappingHearts size="sm" />
                          <span>菅緒 數值/描述 (選填，無內容則不顯示)：</span>
                        </label>
                        <input
                          type="text"
                          value={item.sugaNanaValue || ''}
                          placeholder="選填，留空則前台不顯示此格"
                          onChange={(e) => {
                            const nextItems = [...(formData.coupleProfile?.items || [])];
                            nextItems[idx].sugaNanaValue = e.target.value;
                            setFormData({
                              ...formData,
                              coupleProfile: { ...formData.coupleProfile!, items: nextItems },
                            });
                          }}
                          className="w-full bg-white border border-[#442F2A]/40 rounded p-1 text-xs"
                        />
                        <label className="block text-[9px] text-[#442F2A]/70 font-bold">
                          菅緒 解讀 (選填，無內容則不顯示)：
                        </label>
                        <textarea
                          rows={2}
                          value={item.sugaNanaNote || ''}
                          placeholder="選填解讀說明..."
                          onChange={(e) => {
                            const nextItems = [...(formData.coupleProfile?.items || [])];
                            nextItems[idx].sugaNanaNote = e.target.value;
                            setFormData({
                              ...formData,
                              coupleProfile: { ...formData.coupleProfile!, items: nextItems },
                            });
                          }}
                          className="w-full bg-white border border-[#442F2A]/40 rounded p-1 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: MILESTONES */}
          {activeSubTab === 'milestone' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#442F2A]">時間線重要里程碑 (TIMELINE)：</span>
                <button
                  type="button"
                  onClick={() => {
                    const newM: Milestone = {
                      id: 'm-' + Date.now(),
                      date: '2026.01.01',
                      title: '新甜蜜里程碑',
                      desc: '在此輸入這段回憶的故事細節...',
                      tag: 'Sweet',
                    };
                    setFormData({ ...formData, milestones: [...formData.milestones, newM] });
                  }}
                  className="pixel-btn px-2.5 py-1 bg-[#E0BAC7] rounded text-xs flex items-center gap-1 font-bold cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>新增里程碑</span>
                </button>
              </div>

              {formData.milestones.map((m, idx) => (
                <div key={m.id || idx} className="p-3 bg-white rounded border-2 border-[#442F2A] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#9D5A64]">里程碑 #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          milestones: formData.milestones.filter((_, i) => i !== idx),
                        })
                      }
                      className="text-[#C89398] hover:text-red-700 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold">日期 (YYYY.MM.DD)：</label>
                      <input
                        type="text"
                        value={m.date}
                        onChange={(e) => {
                          const next = [...formData.milestones];
                          next[idx].date = e.target.value;
                          setFormData({ ...formData, milestones: next });
                        }}
                        className="w-full bg-[#FFF8F5] border border-[#442F2A]/40 rounded p-1 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold">標籤 Tag：</label>
                      <input
                        type="text"
                        value={m.tag || ''}
                        placeholder="Sweet / First / Promise..."
                        onChange={(e) => {
                          const next = [...formData.milestones];
                          next[idx].tag = e.target.value;
                          setFormData({ ...formData, milestones: next });
                        }}
                        className="w-full bg-[#FFF8F5] border border-[#442F2A]/40 rounded p-1 text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold">標題：</label>
                    <input
                      type="text"
                      value={m.title}
                      onChange={(e) => {
                        const next = [...formData.milestones];
                        next[idx].title = e.target.value;
                        setFormData({ ...formData, milestones: next });
                      }}
                      className="w-full bg-[#FFF8F5] border border-[#442F2A]/40 rounded p-1 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold">描述細節：</label>
                    <textarea
                      rows={2}
                      value={m.desc}
                      onChange={(e) => {
                        const next = [...formData.milestones];
                        next[idx].desc = e.target.value;
                        setFormData({ ...formData, milestones: next });
                      }}
                      className="w-full bg-[#FFF8F5] border border-[#442F2A]/40 rounded p-1 text-xs leading-relaxed"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 6: STORIES */}
          {activeSubTab === 'story' && (
            <div className="space-y-3">
              {/* Story Page Title & Subtitle Card */}
              <div className="p-3 bg-white rounded-lg border-2 border-[#442F2A] shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-[#442F2A] flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#C89398]" />
                    <span>故事分頁頂部標題與副標題 (Story Page Title & Subtitle)：</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      updatePageTitle('story', 'title', 'STORY');
                      updatePageTitle('story', 'subtitle', '烏野高校で、まだ描かれていない物語');
                    }}
                    className="text-[10px] px-2 py-0.5 rounded bg-[#FFF8F5] border border-[#442F2A]/30 text-[#442F2A] hover:bg-[#E0BAC7]/40 cursor-pointer font-bold"
                  >
                    恢復預設文字
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-[#442F2A] block mb-0.5">主標題：</label>
                    <input
                      type="text"
                      value={formData.pageTitles?.story?.title ?? 'STORY'}
                      onChange={(e) => updatePageTitle('story', 'title', e.target.value)}
                      placeholder="STORY"
                      className="w-full bg-[#FFF8F5] border border-[#442F2A] rounded p-1.5 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#442F2A] block mb-0.5">副標題：</label>
                    <input
                      type="text"
                      value={formData.pageTitles?.story?.subtitle ?? '烏野高校で、まだ描かれていない物語'}
                      onChange={(e) => updatePageTitle('story', 'subtitle', e.target.value)}
                      placeholder="烏野高校で、まだ描かれていない物語"
                      className="w-full bg-[#FFF8F5] border border-[#442F2A] rounded p-1.5 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-bold text-[#442F2A]">故事章節列表 (STORIES)：</span>
                <button
                  type="button"
                  onClick={() => {
                    const newS: StoryChapter = {
                      id: 's-' + Date.now(),
                      chapterNumber: `Chapter 0${formData.stories.length + 1}`,
                      title: '新章節標題',
                      date: '2026.01.01',
                      mood: 'Sweet Memory',
                      summary: '章節大綱摘要...',
                      content: '請在此輸入完整的浪漫故事內容...',
                      coverImage:
                        'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80',
                    };
                    setFormData({ ...formData, stories: [...formData.stories, newS] });
                  }}
                  className="pixel-btn px-2.5 py-1 bg-[#E0BAC7] rounded text-xs flex items-center gap-1 font-bold cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>新增章節</span>
                </button>
              </div>

              {formData.stories.map((story, idx) => (
                <div key={story.id || idx} className="p-3.5 bg-white rounded border-2 border-[#442F2A] space-y-2.5">
                  <div className="flex items-center justify-between border-b border-[#442F2A]/20 pb-1">
                    <span className="font-bold text-[#9D5A64]">
                      {story.chapterNumber}：{story.title}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          stories: formData.stories.filter((_, i) => i !== idx),
                        })
                      }
                      className="text-[#C89398] hover:text-red-700 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold">章節編號：</label>
                      <input
                        type="text"
                        value={story.chapterNumber}
                        onChange={(e) => {
                          const next = [...formData.stories];
                          next[idx].chapterNumber = e.target.value;
                          setFormData({ ...formData, stories: next });
                        }}
                        className="w-full bg-[#FFF8F5] border border-[#442F2A]/40 rounded p-1 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold">日期：</label>
                      <input
                        type="text"
                        value={story.date}
                        onChange={(e) => {
                          const next = [...formData.stories];
                          next[idx].date = e.target.value;
                          setFormData({ ...formData, stories: next });
                        }}
                        className="w-full bg-[#FFF8F5] border border-[#442F2A]/40 rounded p-1 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold">心情標籤 (Mood)：</label>
                      <input
                        type="text"
                        value={story.mood || ''}
                        placeholder="例：Sweet Memory"
                        onChange={(e) => {
                          const next = [...formData.stories];
                          next[idx].mood = e.target.value;
                          setFormData({ ...formData, stories: next });
                        }}
                        className="w-full bg-[#FFF8F5] border border-[#442F2A]/40 rounded p-1 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold">標題：</label>
                    <input
                      type="text"
                      value={story.title}
                      onChange={(e) => {
                        const next = [...formData.stories];
                        next[idx].title = e.target.value;
                        setFormData({ ...formData, stories: next });
                      }}
                      className="w-full bg-[#FFF8F5] border border-[#442F2A]/40 rounded p-1 text-xs font-bold"
                    />
                  </div>

                  {/* Chapter Cover Image with Upload */}
                  <div>
                    <label className="block text-[10px] font-bold">章節插圖 (Cover Image URL 或 本機上傳)：</label>
                    <div className="flex gap-2 items-center">
                      <div className="w-16 h-12 rounded border border-[#442F2A] overflow-hidden bg-neutral-100 shrink-0">
                        {story.coverImage ? (
                          <img src={story.coverImage} alt="Story Cover" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[9px] text-neutral-400">
                            無封面
                          </div>
                        )}
                      </div>
                      <div className="flex-1 flex gap-1">
                        <input
                          type="text"
                          value={story.coverImage || ''}
                          placeholder="https://..."
                          onChange={(e) => {
                            const next = [...formData.stories];
                            next[idx].coverImage = e.target.value;
                            setFormData({ ...formData, stories: next });
                          }}
                          className="flex-1 bg-[#FFF8F5] border border-[#442F2A]/40 rounded p-1 text-xs truncate"
                        />
                        <label className="pixel-btn px-2 py-1 bg-[#E0BAC7] rounded text-[10px] flex items-center gap-1 cursor-pointer shrink-0 font-bold">
                          <Upload className="w-3 h-3" />
                          <span>上傳</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleFileUpload(e, (url) => {
                                const next = [...formData.stories];
                                next[idx].coverImage = url;
                                setFormData({ ...formData, stories: next });
                              })
                            }
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold">摘要：</label>
                    <input
                      type="text"
                      value={story.summary}
                      onChange={(e) => {
                        const next = [...formData.stories];
                        next[idx].summary = e.target.value;
                        setFormData({ ...formData, stories: next });
                      }}
                      className="w-full bg-[#FFF8F5] border border-[#442F2A]/40 rounded p-1 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold">完整故事內容：</label>
                    <textarea
                      rows={5}
                      value={story.content}
                      onChange={(e) => {
                        const next = [...formData.stories];
                        next[idx].content = e.target.value;
                        setFormData({ ...formData, stories: next });
                      }}
                      className="w-full bg-[#FFF8F5] border border-[#442F2A]/40 rounded p-1.5 text-xs leading-relaxed"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 7: ALBUM */}
          {activeSubTab === 'album' && (
            <div className="space-y-3">
              {/* Album Page Title & Subtitle Card */}
              <div className="p-3 bg-white rounded-lg border-2 border-[#442F2A] shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-[#442F2A] flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-[#C89398]" />
                    <span>相簿分頁頂部標題與副標題 (Album Page Title & Subtitle)：</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      updatePageTitle('album', 'title', 'ALBUM');
                      updatePageTitle('album', 'subtitle', '新規描き下ろしイラスト公開！');
                    }}
                    className="text-[10px] px-2 py-0.5 rounded bg-[#FFF8F5] border border-[#442F2A]/30 text-[#442F2A] hover:bg-[#E0BAC7]/40 cursor-pointer font-bold"
                  >
                    恢復預設文字
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-[#442F2A] block mb-0.5">主標題：</label>
                    <input
                      type="text"
                      value={formData.pageTitles?.album?.title ?? 'ALBUM'}
                      onChange={(e) => updatePageTitle('album', 'title', e.target.value)}
                      placeholder="ALBUM"
                      className="w-full bg-[#FFF8F5] border border-[#442F2A] rounded p-1.5 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#442F2A] block mb-0.5">副標題：</label>
                    <input
                      type="text"
                      value={formData.pageTitles?.album?.subtitle ?? '新規描き下ろしイラスト公開！'}
                      onChange={(e) => updatePageTitle('album', 'subtitle', e.target.value)}
                      placeholder="新規描き下ろしイラスト公開！"
                      className="w-full bg-[#FFF8F5] border border-[#442F2A] rounded p-1.5 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-bold text-[#442F2A]">相簿相片清單 (ALBUM)：</span>
                <button
                  type="button"
                  onClick={() => {
                    const newPhoto: AlbumPhoto = {
                      id: 'p-' + Date.now(),
                      url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80',
                      caption: '新照片說明',
                      date: '2026.01.01',
                      tag: 'いつもの景色',
                      location: '烏野體育館前',
                    };
                    setFormData({ ...formData, album: [...formData.album, newPhoto] });
                  }}
                  className="pixel-btn px-2.5 py-1 bg-[#E0BAC7] rounded text-xs flex items-center gap-1 font-bold cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>新增相片</span>
                </button>
              </div>

              {/* 照片分類 # 管理與自訂新增 */}
              <div className="p-2.5 bg-[#FFF8F5] rounded border-2 border-[#442F2A] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#442F2A] flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-[#C89398]" />
                    <span>相片分類標籤 (#)：</span>
                  </span>
                  <span className="text-[10px] text-[#442F2A]/65 font-pixel">
                    共 {allAvailableAlbumTags.length} 個分類
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 items-center">
                  {allAvailableAlbumTags.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded text-[11px] bg-white border border-[#442F2A]/30 text-[#442F2A] font-pixel"
                    >
                      #{t}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2 items-center pt-0.5">
                  <div className="flex-1 flex items-center bg-white border border-[#442F2A] rounded px-2 py-1">
                    <span className="text-xs text-[#442F2A] font-bold">#</span>
                    <input
                      type="text"
                      placeholder="自訂新增新的分類標籤名稱 (例如: 約會日常、夏祭)..."
                      value={newAlbumTagInput}
                      onChange={(e) => setNewAlbumTagInput(e.target.value.replace(/^#/, ''))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddNewAlbumTag();
                        }
                      }}
                      className="w-full bg-transparent pl-1 text-xs outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddNewAlbumTag}
                    className="pixel-btn px-3 py-1 bg-[#E0BAC7] hover:bg-[#d49bb0] rounded text-xs font-bold cursor-pointer shrink-0"
                  >
                    + 新增分類
                  </button>
                </div>
              </div>

              {/* HOME 頁展示相片自訂選擇區塊 (Requirement 2) */}
              <div className="p-3 bg-[#FFF8F5] rounded-lg border-2 border-[#442F2A] shadow-xs space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#442F2A]/20 pb-2">
                  <div>
                    <div className="font-bold text-xs text-[#442F2A] flex items-center gap-1.5">
                      <Home className="w-3.5 h-3.5 text-[#C89398]" />
                      <span>首頁展示相片自訂選擇 (HOME ALBUM SELECTION)</span>
                    </div>
                    <p className="text-[11px] text-[#442F2A]/70 mt-0.5">
                      點擊相片縮圖即可「勾選 / 取消」是否在首頁展示。
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        const top3 = formData.album.slice(0, 3).map((p) => p.id);
                        const updatedAlbum = formData.album.map((p, i) => ({
                          ...p,
                          showOnHome: i < 3,
                        }));
                        setFormData({
                          ...formData,
                          album: updatedAlbum,
                          homeAlbumPhotoIds: top3,
                        });
                      }}
                      className="px-2 py-1 bg-white hover:bg-[#F8EDF1] border border-[#442F2A]/40 rounded text-[10px] font-pixel cursor-pointer"
                    >
                      選取前 3 張
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const allIds = formData.album.map((p) => p.id);
                        const updatedAlbum = formData.album.map((p) => ({
                          ...p,
                          showOnHome: true,
                        }));
                        setFormData({
                          ...formData,
                          album: updatedAlbum,
                          homeAlbumPhotoIds: allIds,
                        });
                      }}
                      className="px-2 py-1 bg-white hover:bg-[#F8EDF1] border border-[#442F2A]/40 rounded text-[10px] font-pixel cursor-pointer"
                    >
                      全選
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const updatedAlbum = formData.album.map((p) => ({
                          ...p,
                          showOnHome: false,
                        }));
                        setFormData({
                          ...formData,
                          album: updatedAlbum,
                          homeAlbumPhotoIds: [],
                        });
                      }}
                      className="px-2 py-1 bg-white hover:bg-[#F8EDF1] border border-[#442F2A]/40 rounded text-[10px] font-pixel cursor-pointer text-[#C89398]"
                    >
                      全部清空
                    </button>
                  </div>
                </div>

                {/* 相片快速勾選列 */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5">
                  {formData.album.map((photo, idx) => {
                    const isSelected =
                      formData.homeAlbumPhotoIds && formData.homeAlbumPhotoIds.length > 0
                        ? formData.homeAlbumPhotoIds.includes(photo.id)
                        : photo.showOnHome !== undefined
                        ? photo.showOnHome
                        : idx < 3;

                    return (
                      <button
                        key={photo.id || idx}
                        type="button"
                        onClick={() => {
                          let currentIds: string[] = [];
                          if (formData.homeAlbumPhotoIds && formData.homeAlbumPhotoIds.length > 0) {
                            currentIds = [...formData.homeAlbumPhotoIds];
                          } else {
                            currentIds = formData.album
                              .filter((p, i) => (p.showOnHome !== undefined ? p.showOnHome : i < 3))
                              .map((p) => p.id);
                          }

                          let nextIds: string[];
                          if (currentIds.includes(photo.id)) {
                            nextIds = currentIds.filter((id) => id !== photo.id);
                          } else {
                            nextIds = [...currentIds, photo.id];
                          }

                          const updatedAlbum = formData.album.map((p) => ({
                            ...p,
                            showOnHome: nextIds.includes(p.id),
                          }));

                          setFormData({
                            ...formData,
                            album: updatedAlbum,
                            homeAlbumPhotoIds: nextIds,
                          });
                        }}
                        className={`relative shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all cursor-pointer group ${
                          isSelected
                            ? 'border-[#442F2A] ring-2 ring-[#C89398] shadow-sm'
                            : 'border-neutral-300 opacity-60 hover:opacity-100'
                        }`}
                        title={`點擊切換在首頁展示: ${photo.caption || '相片 #' + (idx + 1)}`}
                      >
                        <img
                          src={photo.url}
                          alt={photo.caption}
                          className="w-full h-full object-cover"
                          style={{
                            objectPosition: `${photo.previewPositionX ?? 50}% ${photo.previewPositionY ?? 50}%`,
                            transform: `scale(${(photo.previewScale ?? 100) / 100})`,
                          }}
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-[#442F2A]/35 flex items-center justify-center">
                            <span className="bg-[#442F2A] text-white rounded-full p-0.5 shadow-sm">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </span>
                          </div>
                        )}
                        <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] font-pixel text-center py-0.2 truncate px-0.5">
                          #{idx + 1}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {formData.album.map((photo, idx) => {
                  const isSelectedOnHome =
                    formData.homeAlbumPhotoIds && formData.homeAlbumPhotoIds.length > 0
                      ? formData.homeAlbumPhotoIds.includes(photo.id)
                      : photo.showOnHome !== undefined
                      ? photo.showOnHome
                      : idx < 3;

                  return (
                  <div key={photo.id || idx} className="p-3 bg-white rounded border-2 border-[#442F2A] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#9D5A64]">相片 #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            let currentIds: string[] = [];
                            if (formData.homeAlbumPhotoIds && formData.homeAlbumPhotoIds.length > 0) {
                              currentIds = [...formData.homeAlbumPhotoIds];
                            } else {
                              currentIds = formData.album
                                .filter((p, i) => (p.showOnHome !== undefined ? p.showOnHome : i < 3))
                                .map((p) => p.id);
                            }
                            let nextIds: string[];
                            if (currentIds.includes(photo.id)) {
                              nextIds = currentIds.filter((id) => id !== photo.id);
                            } else {
                              nextIds = [...currentIds, photo.id];
                            }
                            const updatedAlbum = formData.album.map((p) => ({
                              ...p,
                              showOnHome: nextIds.includes(p.id),
                            }));
                            setFormData({
                              ...formData,
                              album: updatedAlbum,
                              homeAlbumPhotoIds: nextIds,
                            });
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] font-pixel flex items-center gap-1 cursor-pointer transition border ${
                            isSelectedOnHome
                              ? 'bg-[#442F2A] text-white border-[#442F2A]'
                              : 'bg-neutral-100 text-[#442F2A]/70 border-[#442F2A]/30 hover:bg-[#F8EDF1]'
                          }`}
                          title="切換首頁展示"
                        >
                          <Home className="w-2.5 h-2.5" />
                          <span>{isSelectedOnHome ? '✓ 首頁展示中' : '+ 加入首頁'}</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            album: formData.album.filter((_, i) => i !== idx),
                          })
                        }
                        className="text-[#C89398] hover:text-red-700 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* 預覽照片範圍與對焦點調節 (Requirement 3) */}
                    <div className="p-2 bg-[#FFF8F5] rounded border border-[#442F2A]/20 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#442F2A] flex items-center gap-1">
                          <Crop className="w-3 h-3 text-[#C89398]" />
                          <span>預覽範圍與對焦點 (點圖直接對焦)</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const next = [...formData.album];
                            next[idx] = {
                              ...next[idx],
                              previewPositionX: 50,
                              previewPositionY: 50,
                              previewScale: 100,
                            };
                            setFormData({ ...formData, album: next });
                          }}
                          className="text-[9px] text-[#442F2A]/60 hover:text-[#442F2A] flex items-center gap-0.5 cursor-pointer underline"
                        >
                          <RotateCcw className="w-2.5 h-2.5" />
                          <span>重設</span>
                        </button>
                      </div>

                      {/* 即時互動對焦框 */}
                      <div
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const clickX = Math.round(((e.clientX - rect.left) / rect.width) * 100);
                          const clickY = Math.round(((e.clientY - rect.top) / rect.height) * 100);
                          const next = [...formData.album];
                          next[idx] = {
                            ...next[idx],
                            previewPositionX: Math.max(0, Math.min(100, clickX)),
                            previewPositionY: Math.max(0, Math.min(100, clickY)),
                          };
                          setFormData({ ...formData, album: next });
                        }}
                        className="h-32 w-full rounded border border-[#442F2A] overflow-hidden bg-neutral-100 relative cursor-crosshair group shadow-inner"
                        title="點擊圖片任意處可直接將焦點移至該位置"
                      >
                        <img
                          src={photo.url}
                          alt="preview"
                          className="w-full h-full object-cover transition-all duration-150"
                          style={{
                            objectPosition: `${photo.previewPositionX ?? 50}% ${photo.previewPositionY ?? 50}%`,
                            transform: `scale(${(photo.previewScale ?? 100) / 100})`,
                          }}
                        />
                        {/* 焦點十字圓圈 */}
                        <div
                          className="absolute w-3.5 h-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#C89398]/80 shadow-md pointer-events-none transition-all duration-100"
                          style={{
                            left: `${photo.previewPositionX ?? 50}%`,
                            top: `${photo.previewPositionY ?? 50}%`,
                          }}
                        />
                        <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] font-pixel px-1 py-0.2 rounded pointer-events-none">
                          {photo.previewPositionX ?? 50}%, {photo.previewPositionY ?? 50}%
                        </div>
                      </div>

                      {/* 快速對焦選項 */}
                      <div className="flex items-center gap-1 flex-wrap text-[9px]">
                        <span className="text-[#442F2A]/70 font-bold shrink-0">快速對焦:</span>
                        {[
                          { label: '頭部/臉部', x: 50, y: 15 },
                          { label: '置中', x: 50, y: 50 },
                          { label: '底部', x: 50, y: 85 },
                          { label: '偏左', x: 25, y: 50 },
                          { label: '偏右', x: 75, y: 50 },
                        ].map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => {
                              const next = [...formData.album];
                              next[idx] = {
                                ...next[idx],
                                previewPositionX: preset.x,
                                previewPositionY: preset.y,
                              };
                              setFormData({ ...formData, album: next });
                            }}
                            className="px-1 py-0.5 bg-white hover:bg-[#F8EDF1] border border-[#442F2A]/30 rounded text-[#442F2A] cursor-pointer"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>

                      {/* 縮放與對焦微調滑桿 */}
                      <div className="grid grid-cols-3 gap-1 pt-0.5 text-[9px]">
                        <div>
                          <div className="flex justify-between text-[#442F2A]">
                            <span>X焦點:</span>
                            <span className="font-mono text-[#9D5A64]">{photo.previewPositionX ?? 50}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={photo.previewPositionX ?? 50}
                            onChange={(e) => {
                              const next = [...formData.album];
                              next[idx] = { ...next[idx], previewPositionX: parseInt(e.target.value) || 0 };
                              setFormData({ ...formData, album: next });
                            }}
                            className="w-full accent-[#C89398] cursor-pointer h-1 bg-neutral-200 rounded"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-[#442F2A]">
                            <span>Y焦點:</span>
                            <span className="font-mono text-[#9D5A64]">{photo.previewPositionY ?? 50}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={photo.previewPositionY ?? 50}
                            onChange={(e) => {
                              const next = [...formData.album];
                              next[idx] = { ...next[idx], previewPositionY: parseInt(e.target.value) || 0 };
                              setFormData({ ...formData, album: next });
                            }}
                            className="w-full accent-[#C89398] cursor-pointer h-1 bg-neutral-200 rounded"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-[#442F2A]">
                            <span>縮放:</span>
                            <span className="font-mono text-[#9D5A64]">{photo.previewScale ?? 100}%</span>
                          </div>
                          <input
                            type="range"
                            min="100"
                            max="200"
                            step="5"
                            value={photo.previewScale ?? 100}
                            onChange={(e) => {
                              const next = [...formData.album];
                              next[idx] = { ...next[idx], previewScale: parseInt(e.target.value) || 100 };
                              setFormData({ ...formData, album: next });
                            }}
                            className="w-full accent-[#C89398] cursor-pointer h-1 bg-neutral-200 rounded"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-1">
                      <input
                        type="text"
                        value={photo.url}
                        onChange={(e) => {
                          const next = [...formData.album];
                          next[idx].url = e.target.value;
                          setFormData({ ...formData, album: next });
                        }}
                        className="flex-1 bg-[#FFF8F5] border border-[#442F2A]/40 rounded p-1 text-xs truncate"
                        placeholder="圖片網址"
                      />
                      <label className="pixel-btn px-2 py-1 bg-[#E0BAC7] rounded text-[10px] flex items-center gap-1 cursor-pointer shrink-0 font-bold">
                        <Upload className="w-3 h-3" />
                        <span>上傳</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleFileUpload(e, (url) => {
                              const next = [...formData.album];
                              next[idx].url = url;
                              setFormData({ ...formData, album: next });
                            })
                          }
                        />
                      </label>
                    </div>

                    <input
                      type="text"
                      value={photo.caption}
                      onChange={(e) => {
                        const next = [...formData.album];
                        next[idx].caption = e.target.value;
                        setFormData({ ...formData, album: next });
                      }}
                      className="w-full bg-[#FFF8F5] border border-[#442F2A]/40 rounded p-1 text-xs font-bold"
                      placeholder="相片標題"
                    />

                    <div className="space-y-1.5">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={photo.date}
                          onChange={(e) => {
                            const next = [...formData.album];
                            next[idx].date = e.target.value;
                            setFormData({ ...formData, album: next });
                          }}
                          className="w-full bg-[#FFF8F5] border border-[#442F2A]/40 rounded p-1 text-xs"
                          placeholder="日期 (YYYY.MM.DD)"
                        />
                        <select
                          value={
                            allAvailableAlbumTags.includes((photo.tag || '').replace(/^#/, ''))
                              ? (photo.tag || '').replace(/^#/, '')
                              : '__CUSTOM__'
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val !== '__CUSTOM__') {
                              const next = [...formData.album];
                              next[idx].tag = val;
                              setFormData({ ...formData, album: next });
                            }
                          }}
                          className="w-full bg-[#FFF8F5] border border-[#442F2A]/40 rounded p-1 text-xs font-pixel truncate"
                        >
                          {allAvailableAlbumTags.map((t) => (
                            <option key={t} value={t}>
                              #{t}
                            </option>
                          ))}
                          <option value="__CUSTOM__">✏️ 自訂新分類...</option>
                        </select>
                      </div>

                      <div className="flex items-center bg-[#FFF8F5] border border-[#442F2A]/40 rounded px-1.5 py-0.5">
                        <span className="text-[10px] text-[#442F2A]/70 font-bold mr-1 shrink-0">#分類：</span>
                        <input
                          type="text"
                          value={(photo.tag || '').replace(/^#/, '')}
                          placeholder="可直接輸入自訂分類標籤"
                          onChange={(e) => {
                            const clean = e.target.value.replace(/^#/, '');
                            const next = [...formData.album];
                            next[idx].tag = clean;
                            const customTags = formData.albumCustomTags ? [...formData.albumCustomTags] : [];
                            if (clean.trim() && !customTags.includes(clean.trim())) {
                              customTags.push(clean.trim());
                            }
                            setFormData({ ...formData, album: next, albumCustomTags: customTags });
                          }}
                          className="w-full bg-transparent text-xs text-[#442F2A] outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <input
                        type="text"
                        value={photo.location || ''}
                        placeholder="拍攝地點 (選填，如：烏野體育館前)"
                        onChange={(e) => {
                          const next = [...formData.album];
                          next[idx].location = e.target.value;
                          setFormData({ ...formData, album: next });
                        }}
                        className="w-full bg-[#FFF8F5] border border-[#442F2A]/40 rounded p-1 text-xs"
                      />
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 8: AU (ALTERNATIVE UNIVERSE) */}
          {activeSubTab === 'au' && (
            <div className="space-y-3">
              {/* AU Page Title & Subtitle Card */}
              <div className="p-3 bg-white rounded-lg border-2 border-[#442F2A] shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-[#442F2A] flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#C89398]" />
                    <span>平行宇宙分頁頂部標題與副標題 (AU Page Title & Subtitle)：</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      updatePageTitle('au', 'title', 'ALTERNATIVE UNIVERSE');
                      updatePageTitle('au', 'subtitle', '縁下監督 最新作');
                    }}
                    className="text-[10px] px-2 py-0.5 rounded bg-[#FFF8F5] border border-[#442F2A]/30 text-[#442F2A] hover:bg-[#E0BAC7]/40 cursor-pointer font-bold"
                  >
                    恢復預設文字
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-[#442F2A] block mb-0.5">主標題：</label>
                    <input
                      type="text"
                      value={formData.pageTitles?.au?.title ?? 'ALTERNATIVE UNIVERSE'}
                      onChange={(e) => updatePageTitle('au', 'title', e.target.value)}
                      placeholder="ALTERNATIVE UNIVERSE"
                      className="w-full bg-[#FFF8F5] border border-[#442F2A] rounded p-1.5 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#442F2A] block mb-0.5">副標題：</label>
                    <input
                      type="text"
                      value={formData.pageTitles?.au?.subtitle ?? '縁下監督 最新作'}
                      onChange={(e) => updatePageTitle('au', 'subtitle', e.target.value)}
                      placeholder="縁下監督 最新作"
                      className="w-full bg-[#FFF8F5] border border-[#442F2A] rounded p-1.5 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-bold text-[#442F2A]">平行宇宙 (AU) 設定列表：</span>
                <button
                  type="button"
                  onClick={() => {
                    const newAU: AlternativeUniverse = {
                      id: 'au-' + Date.now(),
                      title: '【AU: 新平行宇宙標題】',
                      genre: 'Fantasy AU 🪐',
                      tag: '奇幻 / 冒險',
                      premise: '請在此輸入該宇宙的基礎設定與相遇前言...',
                      charARole: '角色 A 的身份與能力',
                      charBRole: '角色 B 的身份與能力',
                      storySnippet: '請在此輸入該宇宙中的經典心動對白...',
                      coverImage:
                        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
                    };
                    setFormData({
                      ...formData,
                      alternativeUniverses: [...formData.alternativeUniverses, newAU],
                    });
                  }}
                  className="pixel-btn px-2.5 py-1 bg-[#E0BAC7] rounded text-xs flex items-center gap-1 font-bold cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>新增 AU 宇宙</span>
                </button>
              </div>

              {formData.alternativeUniverses.map((au, idx) => (
                <div key={au.id || idx} className="p-3.5 bg-white rounded border-2 border-[#442F2A] space-y-2.5">
                  <div className="flex items-center justify-between border-b border-[#442F2A]/20 pb-1">
                    <span className="font-bold text-[#9D5A64]">{au.title}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          alternativeUniverses: formData.alternativeUniverses.filter((_, i) => i !== idx),
                        })
                      }
                      className="text-[#C89398] hover:text-red-700 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold">AU 標題：</label>
                    <input
                      type="text"
                      value={au.title}
                      onChange={(e) => {
                        const next = [...formData.alternativeUniverses];
                        next[idx].title = e.target.value;
                        setFormData({ ...formData, alternativeUniverses: next });
                      }}
                      className="w-full bg-[#FFF8F5] border border-[#442F2A]/40 rounded p-1.5 text-xs font-bold"
                      placeholder="標題"
                    />
                  </div>

                  {/* AU Cover Image with Upload */}
                  <div>
                    <label className="block text-[10px] font-bold">AU 封面圖片 (Cover Image URL 或 上傳)：</label>
                    <div className="flex gap-2 items-center">
                      <div className="w-16 h-12 rounded border border-[#442F2A] overflow-hidden bg-neutral-100 shrink-0">
                        {au.coverImage ? (
                          <img src={au.coverImage} alt="AU Cover" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[9px] text-neutral-400">
                            無封面
                          </div>
                        )}
                      </div>
                      <div className="flex-1 flex gap-1">
                        <input
                          type="text"
                          value={au.coverImage || ''}
                          placeholder="https://..."
                          onChange={(e) => {
                            const next = [...formData.alternativeUniverses];
                            next[idx].coverImage = e.target.value;
                            setFormData({ ...formData, alternativeUniverses: next });
                          }}
                          className="flex-1 bg-[#FFF8F5] border border-[#442F2A]/40 rounded p-1 text-xs truncate"
                        />
                        <label className="pixel-btn px-2 py-1 bg-[#E0BAC7] rounded text-[10px] flex items-center gap-1 cursor-pointer shrink-0 font-bold">
                          <Upload className="w-3 h-3" />
                          <span>上傳</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleFileUpload(e, (url) => {
                                const next = [...formData.alternativeUniverses];
                                next[idx].coverImage = url;
                                setFormData({ ...formData, alternativeUniverses: next });
                              })
                            }
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold">世界觀大綱 (Premise)：</label>
                    <textarea
                      rows={2}
                      value={au.premise}
                      onChange={(e) => {
                        const next = [...formData.alternativeUniverses];
                        next[idx].premise = e.target.value;
                        setFormData({ ...formData, alternativeUniverses: next });
                      }}
                      className="w-full bg-[#FFF8F5] border border-[#442F2A]/40 rounded p-1 text-xs leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold">
                        {formData.characterA.name} 身份設定：
                      </label>
                      <input
                        type="text"
                        value={au.charARole}
                        onChange={(e) => {
                          const next = [...formData.alternativeUniverses];
                          next[idx].charARole = e.target.value;
                          setFormData({ ...formData, alternativeUniverses: next });
                        }}
                        className="w-full bg-[#FFF8F5] border border-[#442F2A]/40 rounded p-1 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold">
                        {formData.characterB.name} 身份設定：
                      </label>
                      <input
                        type="text"
                        value={au.charBRole}
                        onChange={(e) => {
                          const next = [...formData.alternativeUniverses];
                          next[idx].charBRole = e.target.value;
                          setFormData({ ...formData, alternativeUniverses: next });
                        }}
                        className="w-full bg-[#FFF8F5] border border-[#442F2A]/40 rounded p-1 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold">摘要 (Story Snippet)：</label>
                    <textarea
                      rows={2}
                      value={au.storySnippet}
                      onChange={(e) => {
                        const next = [...formData.alternativeUniverses];
                        next[idx].storySnippet = e.target.value;
                        setFormData({ ...formData, alternativeUniverses: next });
                      }}
                      className="w-full bg-[#FFF8F5] border border-[#442F2A]/40 rounded p-1 text-xs leading-relaxed"
                    />
                  </div>

                  {/* AU 專屬故事篇章列表 (AU Stories) */}
                  <div className="p-2.5 bg-[#FFF8F5] rounded border border-[#442F2A]/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[11px] text-[#442F2A] flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-[#C89398]" />
                        <span>STORY 篇章清單 (多篇故事將以浮窗分頁呈現)：</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const currentStories = au.stories || [];
                          const newStory = {
                            id: 'aus-' + Date.now(),
                            title: `篇章 ${currentStories.length + 1}：新篇章標題`,
                            content: '在此輸入本篇章的精彩故事內容...',
                            date: '2026.01',
                          };
                          const next = [...formData.alternativeUniverses];
                          next[idx].stories = [...currentStories, newStory];
                          setFormData({ ...formData, alternativeUniverses: next });
                        }}
                        className="pixel-btn px-2 py-0.5 bg-[#E0BAC7] hover:bg-[#d49bb0] rounded text-[10px] flex items-center gap-1 font-bold cursor-pointer"
                      >
                        <Plus className="w-2.5 h-2.5" />
                        <span>新增故事篇章</span>
                      </button>
                    </div>

                    {(!au.stories || au.stories.length === 0) ? (
                      <p className="text-[10px] text-[#442F2A]/50 italic">
                        尚未新增多篇故事（將自動使用上方對白片段作為第一篇），點選右上方按鈕新增篇章
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {au.stories.map((st, sIdx) => (
                          <div key={st.id || sIdx} className="bg-white p-2 rounded border border-[#442F2A]/20 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-[#9D5A64]">
                                第 {sIdx + 1} 篇故事
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const next = [...formData.alternativeUniverses];
                                  next[idx].stories = (next[idx].stories || []).filter((_, i) => i !== sIdx);
                                  setFormData({ ...formData, alternativeUniverses: next });
                                }}
                                className="text-[#C89398] hover:text-red-700 cursor-pointer p-0.5"
                                title="刪除篇章"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                              <div className="sm:col-span-2">
                                <label className="block text-[9px] font-bold text-[#442F2A]">篇章標題：</label>
                                <input
                                  type="text"
                                  value={st.title}
                                  placeholder="標題"
                                  onChange={(e) => {
                                    const next = [...formData.alternativeUniverses];
                                    const stories = [...(next[idx].stories || [])];
                                    stories[sIdx].title = e.target.value;
                                    next[idx].stories = stories;
                                    setFormData({ ...formData, alternativeUniverses: next });
                                  }}
                                  className="w-full bg-[#FFF8F5] border border-[#442F2A]/30 rounded p-1 text-xs font-bold"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] font-bold text-[#442F2A]">日期/副標：</label>
                                <input
                                  type="text"
                                  value={st.date || ''}
                                  placeholder="例：2026.01"
                                  onChange={(e) => {
                                    const next = [...formData.alternativeUniverses];
                                    const stories = [...(next[idx].stories || [])];
                                    stories[sIdx].date = e.target.value;
                                    next[idx].stories = stories;
                                    setFormData({ ...formData, alternativeUniverses: next });
                                  }}
                                  className="w-full bg-[#FFF8F5] border border-[#442F2A]/30 rounded p-1 text-xs"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[9px] font-bold text-[#442F2A]">故事內文：</label>
                              <textarea
                                rows={3}
                                value={st.content}
                                placeholder="故事內容..."
                                onChange={(e) => {
                                  const next = [...formData.alternativeUniverses];
                                  const stories = [...(next[idx].stories || [])];
                                  stories[sIdx].content = e.target.value;
                                  next[idx].stories = stories;
                                  setFormData({ ...formData, alternativeUniverses: next });
                                }}
                                className="w-full bg-[#FFF8F5] border border-[#442F2A]/30 rounded p-1 text-xs leading-relaxed"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions: Save, Reset, Export, Import */}
        <div className="bg-[#FFF8F5] border-t-2 border-[#442F2A] p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 text-xs font-pixel">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => exportDataAsJSON(formData)}
              className="pixel-btn px-2.5 py-1 bg-white rounded flex items-center gap-1 cursor-pointer"
              title="下載完整備份（包含所有相片與設定）"
            >
              <Download className="w-3.5 h-3.5" />
              <span>完整備份</span>
            </button>

            <button
              type="button"
              onClick={() => exportLightweightBackupJSON(formData)}
              className="pixel-btn px-2.5 py-1 bg-white text-emerald-800 rounded flex items-center gap-1 cursor-pointer"
              title="下載輕量純文字備份（排除本地大圖，僅約30KB，下載秒開）"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>輕量備份(&lt;50KB)</span>
            </button>

            <label
              className="pixel-btn px-2.5 py-1 bg-white rounded flex items-center gap-1 cursor-pointer"
              title="匯入以前備份的 JSON 檔案"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>匯入備份</span>
              <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
            </label>

            <button
              type="button"
              onClick={handleReset}
              className="pixel-btn px-2.5 py-1 bg-[#F8EDF1] text-[#9D5A64] rounded flex items-center gap-1 cursor-pointer"
              title="還原為原始初始數據"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>還原預設</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {saveSuccessNotice && (
              <span className="text-emerald-700 font-bold animate-pulse">✓ 儲存成功！</span>
            )}
            <button type="button" onClick={onClose} className="pixel-btn px-3 py-1.5 rounded cursor-pointer">
              取消
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="pixel-btn px-4 py-1.5 bg-[#E0BAC7] text-[#442F2A] font-bold rounded flex items-center gap-1.5 shadow cursor-pointer hover:bg-[#d49bb0]"
            >
              <Save className="w-4 h-4" />
              <span>儲存並套用</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
