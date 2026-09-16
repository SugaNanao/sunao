import React, { useState, useEffect } from 'react';
import { CoupleSiteData } from '../types';
import {
  generateShareableUrl,
  getCleanSiteUrl,
  exportDataAsJSON,
  exportLightweightBackupJSON,
} from '../utils/storage';
import {
  calculateSiteDataSize,
  batchOptimizeDataImages,
  formatBytes,
} from '../utils/imageOptimizer';
import {
  Share2,
  Copy,
  Check,
  ExternalLink,
  Download,
  Upload,
  Heart,
  Info,
  X,
  Sparkles,
  Zap,
  HardDrive,
  FileCheck,
  AlertTriangle,
  Link,
  HelpCircle,
} from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: CoupleSiteData;
  onImportData?: (imported: CoupleSiteData) => void;
  onUpdateData?: (newData: CoupleSiteData) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  data,
  onImportData,
  onUpdateData,
}) => {
  const [activeTab, setActiveTab] = useState<'url' | 'size'>('url');
  const [copiedClean, setCopiedClean] = useState(false);
  const [copiedSnapshot, setCopiedSnapshot] = useState(false);
  const [cleanUrl, setCleanUrl] = useState('');
  const [snapshotUrl, setSnapshotUrl] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizeMessage, setOptimizeMessage] = useState<string | null>(null);

  // Compute storage metrics
  const sizeInfo = calculateSiteDataSize(data);

  useEffect(() => {
    if (isOpen) {
      setCleanUrl(getCleanSiteUrl());
      setSnapshotUrl(generateShareableUrl(data));
      setOptimizeMessage(null);
    }
  }, [isOpen, data]);

  if (!isOpen) return null;

  const handleCopyClean = () => {
    navigator.clipboard.writeText(cleanUrl).then(() => {
      setCopiedClean(true);
      setTimeout(() => setCopiedClean(false), 2500);
    }).catch(() => {
      prompt('請手動複製以下官方短網址：', cleanUrl);
    });
  };

  const handleCopySnapshot = () => {
    navigator.clipboard.writeText(snapshotUrl).then(() => {
      setCopiedSnapshot(true);
      setTimeout(() => setCopiedSnapshot(false), 2500);
    }).catch(() => {
      prompt('請手動複製以下快照連結：', snapshotUrl);
    });
  };

  const handleOpenClean = () => {
    window.open(cleanUrl, '_blank');
  };

  const handleOpenSnapshot = () => {
    window.open(snapshotUrl, '_blank');
  };

  const handleOptimizeImages = async () => {
    if (isOptimizing) return;
    setIsOptimizing(true);
    setOptimizeMessage(null);
    try {
      const result = await batchOptimizeDataImages(data);
      if (result.savedBytes > 0) {
        if (onUpdateData) {
          onUpdateData(result.updatedData);
        } else if (onImportData) {
          onImportData(result.updatedData);
        }
        setOptimizeMessage(`🎉 成功瘦身！為您節省了 ${formatBytes(result.savedBytes)} 的儲存空間！`);
      } else {
        setOptimizeMessage('✓ 目前所有圖片都已經是最佳輕量化規格，無需再次壓縮！');
      }
    } catch (err) {
      console.error(err);
      setOptimizeMessage('壓縮時發生錯誤，請稍後重試。');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || (!onImportData && !onUpdateData)) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && typeof parsed === 'object') {
          if (onUpdateData) onUpdateData(parsed);
          else if (onImportData) onImportData(parsed);
          alert('備份檔案匯入成功！');
          onClose();
        }
      } catch {
        alert('備份檔案格式不正確，請確認上傳的是有效的 JSON 備份檔。');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#442F2A]/60 backdrop-blur-xs">
      <div className="bg-[#FFF8F5] border-4 border-[#442F2A] rounded-lg shadow-2xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Title Bar */}
        <div className="bg-[#442F2A] text-[#FFF8F5] px-4 py-2.5 flex items-center justify-between border-b-2 border-[#442F2A]">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-[#E0BAC7] fill-[#E0BAC7]" />
            <span className="font-pixel text-xs font-bold tracking-wider">
              SHARE & EXPORT // 分享短網址與容量管理
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#E0BAC7] hover:text-[#442F2A] rounded transition cursor-pointer"
            title="關閉"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="bg-[#F8EDF1] border-b-2 border-[#442F2A] px-4 pt-2 flex items-center gap-2 font-pixel text-xs">
          <button
            onClick={() => setActiveTab('url')}
            className={`px-3 py-1.5 rounded-t font-bold transition flex items-center gap-1.5 border-t-2 border-x-2 cursor-pointer ${
              activeTab === 'url'
                ? 'bg-[#FFF8F5] border-[#442F2A] text-[#442F2A] -mb-[2px] pb-2'
                : 'bg-transparent border-transparent text-[#442F2A]/60 hover:text-[#442F2A]'
            }`}
          >
            <Link className="w-3.5 h-3.5 text-[#C89398]" />
            <span>分享短網址</span>
          </button>
          <button
            onClick={() => setActiveTab('size')}
            className={`px-3 py-1.5 rounded-t font-bold transition flex items-center gap-1.5 border-t-2 border-x-2 cursor-pointer ${
              activeTab === 'size'
                ? 'bg-[#FFF8F5] border-[#442F2A] text-[#442F2A] -mb-[2px] pb-2'
                : 'bg-transparent border-transparent text-[#442F2A]/60 hover:text-[#442F2A]'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5 text-[#C89398]" />
            <span>檔案瘦身與備份</span>
            {sizeInfo.imageBytes > 3 * 1024 * 1024 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            )}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">
          {/* TAB 1: SHARE URLS */}
          {activeTab === 'url' && (
            <div className="space-y-4 font-pixel text-xs">
              {/* RECOMMENDED: CLEAN SHORT URL */}
              <div className="pixel-card p-3.5 bg-white flex flex-col gap-2.5 border-2 border-emerald-700/60 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#235347] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>【最佳推薦】官方乾淨短網址 (Clean Short URL)</span>
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                    ✓ 最美觀・短小俐落
                  </span>
                </div>

                <p className="text-[11px] text-[#442F2A]/80 leading-relaxed font-sans">
                  長度僅約 <strong>{cleanUrl.length} 個字元</strong>！完全沒有後綴的一長串英文字母亂碼，發布至 <strong>LINE、Instagram 個人簡介、Discord、Facebook 或簡訊</strong>絕不破版，是最正式且美觀的分享方式。
                </p>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={cleanUrl}
                    onFocus={(e) => e.target.select()}
                    className="flex-1 bg-emerald-50/40 border-2 border-[#442F2A] rounded px-2.5 py-1.5 text-xs font-mono text-[#442F2A] select-all outline-none truncate"
                  />
                  <button
                    onClick={handleCopyClean}
                    className={`px-3.5 py-1.5 rounded text-xs font-bold border-2 border-[#442F2A] flex items-center gap-1 cursor-pointer transition shrink-0 ${
                      copiedClean
                        ? 'bg-[#A3D9C9] text-[#235347]'
                        : 'bg-emerald-200 hover:bg-emerald-300 text-[#235347]'
                    }`}
                  >
                    {copiedClean ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedClean ? '已複製！' : '複製短網址'}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-0.5">
                  <button
                    onClick={handleOpenClean}
                    className="text-[11px] text-[#442F2A] hover:text-[#C89398] underline flex items-center gap-1 cursor-pointer"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>在新分頁測試開啟短網址</span>
                  </button>
                  <span className="text-[10px] text-[#442F2A]/60">
                    長度：{cleanUrl.length} 字元
                  </span>
                </div>
              </div>

              {/* ADVANCED: COMPACT SNAPSHOT URL */}
              <div className="pixel-card p-3.5 bg-white flex flex-col gap-2.5 border-2 border-[#442F2A]/40 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#442F2A] flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5 text-[#C89398]" />
                    <span>【免伺服器】快照同步網址 (Snapshot URL)</span>
                  </span>
                  <span className="text-[10px] bg-[#E0BAC7] text-[#442F2A] px-1.5 py-0.5 rounded font-bold">
                    免發布快照
                  </span>
                </div>

                <p className="text-[11px] text-[#442F2A]/80 leading-relaxed font-sans">
                  現已完整保留您的<strong>電腦本機上傳照片、各分頁裝飾貼圖、文字、故事與雲端連結</strong>！任何訪客點開此快照連結，都能即時載入並完整看見所有圖片與內容。
                </p>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={snapshotUrl}
                    onFocus={(e) => e.target.select()}
                    className="flex-1 bg-[#FDF9F6] border-2 border-[#442F2A] rounded px-2.5 py-1.5 text-xs font-mono text-[#442F2A] select-all outline-none truncate"
                  />
                  <button
                    onClick={handleCopySnapshot}
                    className={`px-3.5 py-1.5 rounded text-xs font-bold border-2 border-[#442F2A] flex items-center gap-1 cursor-pointer transition shrink-0 ${
                      copiedSnapshot
                        ? 'bg-[#A3D9C9] text-[#235347]'
                        : 'bg-[#E0BAC7] hover:bg-[#d59eb1] text-[#442F2A]'
                    }`}
                  >
                    {copiedSnapshot ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSnapshot ? '已複製！' : '複製快照'}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-0.5">
                  <button
                    onClick={handleOpenSnapshot}
                    className="text-[11px] text-[#442F2A] hover:text-[#C89398] underline flex items-center gap-1 cursor-pointer"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>在新分頁測試開啟快照</span>
                  </button>
                  <span className="text-[10px] text-[#442F2A]/60">
                    長度：約 {snapshotUrl.length} 字元
                  </span>
                </div>
              </div>

              {/* Tips Banner */}
              <div className="bg-[#FFF0F4] border-2 border-[#E0BAC7] p-3 rounded flex items-start gap-2.5">
                <Info className="w-4 h-4 text-[#C89398] shrink-0 mt-0.5" />
                <div className="space-y-1 font-sans text-xs">
                  <p className="font-bold text-[#9D5A64]">
                    💡 為什麼推薦直接分享「官方乾淨短網址」？
                  </p>
                  <p className="text-[11px] text-[#442F2A]/80 leading-relaxed">
                    在 Google AI Studio 右上角完成 <strong>Share (分享) 或 Deploy (發布)</strong> 後，官方短網址便是全網永久生效的正式入口。訪客無需載入龐大的網址字串，載入速度極快且手機相容性 100%！
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SIZE HEALTH & BACKUP */}
          {activeTab === 'size' && (
            <div className="space-y-4 font-pixel text-xs">
              {/* CAPACITY HEALTH MONITOR */}
              <div className="pixel-card p-3.5 bg-white flex flex-col gap-3 border-2 border-[#442F2A]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#442F2A] flex items-center gap-1.5">
                    <HardDrive className="w-4 h-4 text-[#C89398]" />
                    <span>網站容量健康診斷 (Storage Health)</span>
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      sizeInfo.totalBytes < 3 * 1024 * 1024
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {sizeInfo.totalBytes < 3 * 1024 * 1024 ? '✓ 容量健康' : '⚠️ 本地相片偏大'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-[#FFF8F5] border border-[#442F2A]/30 rounded">
                    <span className="block text-[10px] text-[#442F2A]/60">目前總容量</span>
                    <span className="font-bold text-sm text-[#442F2A]">{sizeInfo.formattedTotal}</span>
                  </div>
                  <div className="p-2 bg-[#FFF8F5] border border-[#442F2A]/30 rounded">
                    <span className="block text-[10px] text-[#442F2A]/60">本地相片佔用</span>
                    <span className="font-bold text-sm text-[#9D5A64]">{sizeInfo.formattedImages}</span>
                  </div>
                  <div className="p-2 bg-[#FFF8F5] border border-[#442F2A]/30 rounded">
                    <span className="block text-[10px] text-[#442F2A]/60">文字與設定</span>
                    <span className="font-bold text-sm text-emerald-700">
                      {formatBytes(sizeInfo.textBytes)}
                    </span>
                  </div>
                </div>

                {/* 1-Click Optimize Button */}
                <div className="pt-1 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-[#442F2A]/20">
                  <div className="text-[11px] text-[#442F2A]/80 font-sans">
                    {sizeInfo.imageCount > 0
                      ? `偵測到 ${sizeInfo.imageCount} 張本地上傳圖片，可一鍵壓縮 WebP/JPEG 瘦身 80%！`
                      : '目前無過大圖片，檔案體積十分輕盈。'}
                  </div>
                  <button
                    onClick={handleOptimizeImages}
                    disabled={isOptimizing || sizeInfo.imageBytes === 0}
                    className="pixel-btn px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-[#442F2A] font-bold rounded flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    <Zap className={`w-3.5 h-3.5 text-amber-700 ${isOptimizing ? 'animate-spin' : ''}`} />
                    <span>{isOptimizing ? '正在瘦身壓縮中...' : '⚡ 一鍵圖片智慧瘦身'}</span>
                  </button>
                </div>

                {optimizeMessage && (
                  <div className="p-2 bg-emerald-50 border border-emerald-500/40 rounded text-emerald-800 text-[11px] font-sans animate-fade-in">
                    {optimizeMessage}
                  </div>
                )}
              </div>

              {/* DUAL EXPORT BACKUP OPTIONS */}
              <div className="pixel-card p-3.5 bg-white flex flex-col gap-2.5 border-2 border-[#442F2A]">
                <span className="font-bold text-[#442F2A] flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-[#442F2A]" />
                  <span>資料備份與匯出 (Export Options)</span>
                </span>
                <p className="text-[11px] text-[#442F2A]/70 font-sans leading-relaxed">
                  若您擔心檔案太大不好傳送，推薦使用「極速輕量備份」，檔案僅幾十 KB，秒下載、秒轉發！
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {/* Lightweight Backup */}
                  <button
                    onClick={() => exportLightweightBackupJSON(data)}
                    className="p-2.5 bg-emerald-50/60 hover:bg-emerald-100 border-2 border-emerald-700/60 rounded text-left flex items-start gap-2 transition cursor-pointer"
                  >
                    <FileCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-emerald-900 block text-xs">
                        ⚡ 極速輕量備份 (.json)
                      </span>
                      <span className="text-[10px] text-emerald-800/80 block font-sans">
                        純文字、故事、問答與設定，容量小於 50KB，秒載秒傳！
                      </span>
                    </div>
                  </button>

                  {/* Full Backup */}
                  <button
                    onClick={() => exportDataAsJSON(data)}
                    className="p-2.5 bg-[#FFF8F5] hover:bg-[#F8EDF1] border-2 border-[#442F2A]/60 rounded text-left flex items-start gap-2 transition cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-[#442F2A] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#442F2A] block text-xs">
                        📦 完整多媒體備份 (.json)
                      </span>
                      <span className="text-[10px] text-[#442F2A]/70 block font-sans">
                        包含目前所有相片（約 {sizeInfo.formattedTotal}），換機完整還原。
                      </span>
                    </div>
                  </button>
                </div>

                {/* Import Button */}
                <div className="pt-2 border-t border-[#442F2A]/20 flex items-center justify-between">
                  <span className="text-[11px] text-[#442F2A]/70 font-sans">
                    已擁有備份檔案？隨時匯入：
                  </span>
                  {(onImportData || onUpdateData) && (
                    <label className="pixel-btn px-3 py-1 bg-[#FFF8F5] hover:bg-[#E0BAC7]/50 rounded flex items-center gap-1 cursor-pointer font-bold">
                      <Upload className="w-3.5 h-3.5" />
                      <span>匯入備份 (.json)</span>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* PRO TIPS: ZERO-SIZE IMAGES VIA IMAGE HOST */}
              <div className="bg-[#FFF8F5] border-2 border-[#442F2A]/30 p-3 rounded space-y-1.5 font-sans">
                <div className="flex items-center gap-1.5 font-pixel font-bold text-[#442F2A] text-xs">
                  <HelpCircle className="w-3.5 h-3.5 text-[#C89398]" />
                  <span>💡 極速密技：如何讓檔案與網址「永遠只有 0 KB」？</span>
                </div>
                <p className="text-[11px] text-[#442F2A]/80 leading-relaxed">
                  在編輯相簿或頭像時，如果您使用的是<strong>網路圖片網址</strong>（例如上傳到免費圖床 Imgur、Discord 頻道或 Google 雲端取得的直連連結），網站只會記錄短網址，<strong>不會佔用任何檔案空間</strong>，分享網址也永遠維持最短！
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#FFF8F5] px-4 py-3 border-t-2 border-[#442F2A] flex justify-between items-center font-pixel text-xs">
          <span className="text-[11px] text-[#442F2A]/60">
            {activeTab === 'url' ? '點擊按鈕即可複製專屬短網址' : '建議定期下載輕量備份檔存檔'}
          </span>
          <button
            onClick={onClose}
            className="pixel-btn px-4 py-1.5 font-bold bg-[#442F2A] text-[#FFF8F5] rounded cursor-pointer hover:bg-[#32231f]"
          >
            完成關閉
          </button>
        </div>
      </div>
    </div>
  );
};
