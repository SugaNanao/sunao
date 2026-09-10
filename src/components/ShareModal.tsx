import React, { useState, useEffect } from 'react';
import { CoupleSiteData } from '../types';
import { generateShareableUrl, exportDataAsJSON } from '../utils/storage';
import { Share2, Copy, Check, ExternalLink, Download, Upload, Heart, Info, X } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: CoupleSiteData;
  onImportData?: (imported: CoupleSiteData) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  data,
  onImportData,
}) => {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    if (isOpen) {
      const url = generateShareableUrl(data);
      setShareUrl(url);
    }
  }, [isOpen, data]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }).catch(() => {
      prompt('請手動複製以下分享連結：', shareUrl);
    });
  };

  const handleOpenTest = () => {
    window.open(shareUrl, '_blank');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImportData) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && typeof parsed === 'object') {
          onImportData(parsed);
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
      <div className="bg-[#FFF8F5] border-4 border-[#442F2A] rounded-lg shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Title Bar */}
        <div className="bg-[#442F2A] text-[#FFF8F5] px-4 py-2.5 flex items-center justify-between border-b-2 border-[#442F2A]">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-[#E0BAC7] fill-[#E0BAC7]" />
            <span className="font-pixel text-xs font-bold tracking-wider">
              SHARE & EXPORT // 專屬分享與備份
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

        {/* Content Body */}
        <div className="p-5 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
          {/* Main Share Link Section */}
          <div className="pixel-card p-3.5 bg-white flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-pixel font-bold text-[#442F2A] flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-[#C89398]" />
                專屬訪客分享連結 (已同步最新文字與設定)
              </span>
              <span className="text-[10px] font-pixel text-[#442F2A]/70 bg-[#E0BAC7] px-1.5 py-0.5 rounded">
                訪客模式鎖定
              </span>
            </div>

            {/* URL Input with copy button */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                onFocus={(e) => e.target.select()}
                className="flex-1 bg-[#FDF9F6] border-2 border-[#442F2A] rounded px-2.5 py-1.5 text-xs font-mono text-[#442F2A] select-all outline-none"
              />
              <button
                onClick={handleCopy}
                className={`px-3 py-1.5 rounded text-xs font-pixel font-bold border-2 border-[#442F2A] flex items-center gap-1 cursor-pointer transition ${
                  copied
                    ? 'bg-[#A3D9C9] text-[#235347]'
                    : 'bg-[#E0BAC7] hover:bg-[#d59eb1] text-[#442F2A]'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '已複製！' : '複製'}</span>
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={handleOpenTest}
                className="text-xs font-pixel text-[#442F2A] hover:text-[#C89398] underline flex items-center gap-1 cursor-pointer"
              >
                <ExternalLink className="w-3 h-3" />
                <span>在新分頁開啟測試預覽</span>
              </button>
            </div>
          </div>

          {/* Explanation Banner */}
          <div className="bg-[#FFF0F4] border-2 border-[#E0BAC7] p-3 rounded text-xs font-pixel text-[#442F2A] flex items-start gap-2">
            <Info className="w-4 h-4 text-[#C89398] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-[#9D5A64]">
                💡 貼心提醒：每次修改後請重新複製連結
              </p>
              <p className="text-[11px] text-[#442F2A]/80 leading-relaxed">
                本網站採用無伺服器的「安全快照分享」，所有自訂名稱（Koshi x Nanao）、故事章節、日曆愛心與標籤，在您點擊分享時會完整封裝進專屬連結中。若後續有編輯新內容，請點擊「複製」取得最新連結發送給對方！
              </p>
            </div>
          </div>

          {/* Backup & Restore Section */}
          <div className="pixel-card p-3 bg-white flex flex-col gap-2">
            <span className="text-xs font-pixel font-bold text-[#442F2A] flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-[#442F2A]" />
              完整資料備份與還原 (JSON)
            </span>
            <p className="text-[11px] font-pixel text-[#442F2A]/70">
              將所有紀念日、日記、相簿、人設與音樂設定匯出成 JSON 檔案，永久保存或換裝置轉移。
            </p>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => exportDataAsJSON(data)}
                className="pixel-btn px-3 py-1.5 text-xs font-pixel font-bold bg-[#E0BAC7] hover:bg-[#d59eb1] rounded flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>下載備份檔案 (.json)</span>
              </button>

              {onImportData && (
                <label className="pixel-btn px-3 py-1.5 text-xs font-pixel font-bold bg-[#FFF8F5] hover:bg-[#E0BAC7]/50 rounded flex items-center gap-1 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>匯入備份檔案</span>
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
        </div>

        {/* Footer */}
        <div className="bg-[#FFF8F5] px-4 py-3 border-t-2 border-[#442F2A] flex justify-end">
          <button
            onClick={onClose}
            className="pixel-btn px-4 py-1.5 text-xs font-pixel font-bold bg-[#442F2A] text-[#FFF8F5] rounded cursor-pointer"
          >
            完成關閉
          </button>
        </div>
      </div>
    </div>
  );
};
