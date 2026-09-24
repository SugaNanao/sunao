import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { CoupleSiteData } from '../types';
import {
  publishDataToServer,
  fetchPublishedDataFromServer,
  getCleanSiteUrl,
  generateShareableUrl,
} from '../utils/storage';
import {
  Smartphone,
  QrCode,
  RefreshCw,
  CheckCircle2,
  Copy,
  ExternalLink,
  Sparkles,
  X,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface SyncMobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: CoupleSiteData;
  onDataPublished?: (updatedAt: string) => void;
}

export const SyncMobileModal: React.FC<SyncMobileModalProps> = ({
  isOpen,
  onClose,
  data,
  onDataPublished,
}) => {
  const [cleanUrl, setCleanUrl] = useState('');
  const [snapshotUrl, setSnapshotUrl] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [activeUrlType, setActiveUrlType] = useState<'clean' | 'snapshot'>('clean');
  const [isPublishing, setIsPublishing] = useState(false);
  const [serverUpdatedAt, setServerUpdatedAt] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<{ success?: boolean; message: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const clean = getCleanSiteUrl();
      const snapshot = generateShareableUrl(data);
      setCleanUrl(clean);
      setSnapshotUrl(snapshot);
      setSyncStatus(null);
      setCopied(false);

      // Check server state
      fetchPublishedDataFromServer().then((res) => {
        if (res.published && res.updatedAt) {
          setServerUpdatedAt(res.updatedAt);
        }
      }).catch(() => {});

      // Generate initial QR code
      const targetUrl = activeUrlType === 'clean' ? clean : snapshot;
      generateQr(targetUrl);
    }
  }, [isOpen, data, activeUrlType]);

  const generateQr = (text: string) => {
    QRCode.toDataURL(text, {
      width: 260,
      margin: 2,
      color: {
        dark: '#442F2A',
        light: '#FFF8F5',
      },
    })
      .then((url) => {
        setQrCodeDataUrl(url);
      })
      .catch((err) => {
        console.warn('QRCode generation failed:', err);
      });
  };

  const handleSwitchType = (type: 'clean' | 'snapshot') => {
    setActiveUrlType(type);
    const targetUrl = type === 'clean' ? cleanUrl : snapshotUrl;
    generateQr(targetUrl);
  };

  const handleForcePublish = async () => {
    if (isPublishing) return;
    setIsPublishing(true);
    setSyncStatus(null);
    try {
      const nowIso = new Date().toISOString();
      const payload: CoupleSiteData = {
        ...data,
        updatedAt: nowIso,
      };
      const result = await publishDataToServer(payload);
      if (result.success) {
        setServerUpdatedAt(result.updatedAt || nowIso);
        setSyncStatus({
          success: true,
          message: '🎉 已成功發布至伺服器！手機端重新整理即可呈現最新編輯。',
        });
        if (onDataPublished) {
          onDataPublished(result.updatedAt || nowIso);
        }
      } else {
        setSyncStatus({
          success: false,
          message: `發布失敗：${result.message || '未知錯誤'}`,
        });
      }
    } catch {
      setSyncStatus({
        success: false,
        message: '連線伺服器失敗，請確認網路連線。',
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const currentDisplayUrl = activeUrlType === 'clean' ? cleanUrl : snapshotUrl;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentDisplayUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }).catch(() => {
      prompt('請手動複製以下網址：', currentDisplayUrl);
    });
  };

  if (!isOpen) return null;

  const isServerInSync = Boolean(
    serverUpdatedAt &&
    data.updatedAt &&
    new Date(serverUpdatedAt).getTime() >= new Date(data.updatedAt).getTime() - 2000
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="pixel-window w-full max-w-lg bg-[#FFF8F5] rounded-lg overflow-hidden shadow-2xl flex flex-col border-2 border-[#442F2A]">
        {/* Header */}
        <div className="bg-[#442F2A] text-[#FFF8F5] px-4 py-2.5 flex items-center justify-between font-pixel text-xs tracking-wider">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-[#E0BAC7]" />
            <span className="font-bold">MOBILE SYNC // 手機端即時同步與掃碼</span>
          </div>
          <button
            onClick={onClose}
            className="w-5 h-5 bg-[#E0BAC7] text-[#442F2A] rounded flex items-center justify-center font-bold hover:bg-[#C89398] cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[85vh] space-y-4">
          {/* Status banner */}
          <div className="bg-white border-2 border-[#442F2A] rounded-lg p-3 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs font-pixel">
              <span className="text-[#442F2A] font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C89398]" />
                雲端同步發布狀態
              </span>
              {isServerInSync ? (
                <span className="text-emerald-700 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> 已與電腦同步
                </span>
              ) : (
                <span className="text-amber-700 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> 有電腦修改待發布
                </span>
              )}
            </div>

            <p className="text-[11px] text-[#442F2A]/70 leading-relaxed">
              電腦版修改文字或上傳圖片後，點擊下方「立即發布到全網與手機」，伺服器將儲存最新版內容，手機端隨後重整即會更新！
            </p>

            <button
              onClick={handleForcePublish}
              disabled={isPublishing}
              className="w-full bg-[#C89398] hover:bg-[#9D5A64] text-white py-2 px-3 rounded font-pixel text-xs font-bold border border-[#442F2A] shadow-xs flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isPublishing ? 'animate-spin' : ''}`} />
              {isPublishing ? '正在發布並同步至伺服器...' : '🔄 立即同步發布最新內容到手機與全網'}
            </button>

            {syncStatus && (
              <div
                className={`p-2 rounded text-xs border font-pixel ${
                  syncStatus.success
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-rose-50 text-rose-800 border-rose-300'
                }`}
              >
                {syncStatus.message}
              </div>
            )}
          </div>

          {/* QR Code Section */}
          <div className="bg-[#F8EDF1] border-2 border-[#442F2A] rounded-lg p-4 text-center space-y-3 shadow-xs">
            <div className="flex items-center justify-center gap-1.5 text-xs font-pixel font-bold text-[#442F2A]">
              <QrCode className="w-4 h-4 text-[#C89398]" />
              手機相機掃碼直達
            </div>

            {/* Type selector */}
            <div className="flex justify-center gap-2 text-[11px] font-pixel">
              <button
                onClick={() => handleSwitchType('clean')}
                className={`px-2.5 py-1 rounded border transition cursor-pointer font-bold ${
                  activeUrlType === 'clean'
                    ? 'bg-[#442F2A] text-white border-[#442F2A]'
                    : 'bg-white text-[#442F2A] border-[#442F2A]/30 hover:bg-[#FFF8F5]'
                }`}
              >
                🌐 全網乾淨網址 (推薦)
              </button>
              <button
                onClick={() => handleSwitchType('snapshot')}
                className={`px-2.5 py-1 rounded border transition cursor-pointer font-bold ${
                  activeUrlType === 'snapshot'
                    ? 'bg-[#442F2A] text-white border-[#442F2A]'
                    : 'bg-white text-[#442F2A] border-[#442F2A]/30 hover:bg-[#FFF8F5]'
                }`}
              >
                📦 完整直通快照碼
              </button>
            </div>

            {/* QR Code Display */}
            <div className="flex justify-center items-center py-2">
              <div className="p-3 bg-white border-2 border-[#442F2A] rounded-lg shadow-inner inline-block">
                {qrCodeDataUrl ? (
                  <img
                    src={qrCodeDataUrl}
                    alt="Mobile Sync QR Code"
                    className="w-44 h-44 sm:w-48 sm:h-48 object-contain"
                  />
                ) : (
                  <div className="w-44 h-44 flex items-center justify-center text-xs text-[#442F2A]/50">
                    載入 QR Code 中...
                  </div>
                )}
              </div>
            </div>

            <p className="text-[11px] text-[#442F2A]/70">
              拿起手機打開相機對準上方 QR Code，點擊螢幕出現的連結即可開啟！
            </p>

            {/* URL Box & Copy */}
            <div className="flex items-center gap-1.5 bg-white border border-[#442F2A] rounded p-1.5 shadow-2xs">
              <input
                type="text"
                readOnly
                value={currentDisplayUrl}
                className="w-full text-[11px] font-mono text-[#442F2A] bg-transparent outline-none px-1 select-all truncate"
              />
              <button
                onClick={handleCopy}
                className="bg-[#C89398] hover:bg-[#9D5A64] text-white px-2.5 py-1 rounded text-xs font-pixel font-bold shrink-0 border border-[#442F2A] flex items-center gap-1 cursor-pointer transition"
              >
                {copied ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? '已複製' : '複製'}
              </button>
            </div>
          </div>

          {/* Mobile Tips */}
          <div className="bg-amber-50/70 border border-amber-300/80 rounded-lg p-3 text-[11px] text-[#442F2A]/80 space-y-1.5">
            <div className="font-bold flex items-center gap-1 text-amber-900 font-pixel">
              <HelpCircle className="w-3.5 h-3.5" /> 手機瀏覽小撇步：
            </div>
            <ul className="list-disc list-inside space-y-1 pl-1">
              <li>
                <strong>手機已開啟頁面時</strong>：只要在手機螢幕由上往下拉「重新整理」，或是切換回瀏覽器分頁，就會自動偵測電腦端的最新發布！
              </li>
              <li>
                <strong>如畫面仍未改變</strong>：請檢查手機是否處於無痕模式或點擊上方「立即同步發布」，並在手機清除快取後重整。
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#F8EDF1] border-t-2 border-[#442F2A] px-4 py-2.5 flex justify-end">
          <button
            onClick={onClose}
            className="bg-white hover:bg-neutral-100 text-[#442F2A] px-4 py-1.5 rounded text-xs font-pixel font-bold border border-[#442F2A] shadow-xs cursor-pointer"
          >
            關閉視窗
          </button>
        </div>
      </div>
    </div>
  );
};
