import React, { useState } from 'react';
import { Lock, Unlock, Key, Check, AlertCircle, Download, Upload, ShieldCheck, LogOut, HelpCircle } from 'lucide-react';
import { CoupleSiteData } from '../types';
import { exportDataAsJSON } from '../utils/storage';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  onLogin: (password: string) => boolean;
  onLogout: () => void;
  data: CoupleSiteData;
  onImportData: (data: CoupleSiteData) => void;
  onPublish?: () => Promise<boolean>;
}

const DEFAULT_ADMIN_PASS = 'sugananao24222';

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  isAdmin,
  onLogin,
  onLogout,
  data,
  onImportData,
  onPublish,
}) => {
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passChangedNotice, setPassChangedNotice] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const success = onLogin(password);
    if (success) {
      setPassword('');
      setErrorMsg('');
    } else {
      setErrorMsg('密碼錯誤，請重新輸入');
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim() || newPassword.length < 4) {
      setErrorMsg('新密碼長度至少需 4 個字元');
      return;
    }
    localStorage.setItem('love_archive_admin_custom_pwd', newPassword.trim());
    setPassChangedNotice(true);
    setNewPassword('');
    setTimeout(() => setPassChangedNotice(false), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && parsed.siteTitle) {
            onImportData(parsed);
            alert('成功匯入並更新網站備份資料！');
          } else {
            alert('檔案格式不正確，請確認為 Love Archive 的備份 JSON 檔。');
          }
        } catch {
          alert('解析 JSON 失敗，請確認檔案內容。');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs select-none"
      onClick={onClose}
    >
      <div
        className="pixel-window w-full max-w-md bg-[#FFF8F5] rounded-lg overflow-hidden shadow-2xl border-3 border-[#442F2A] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        id="admin-auth-modal"
      >
        {/* Title Bar */}
        <div className="bg-[#442F2A] text-[#FFF8F5] px-3.5 py-2.5 flex items-center justify-between font-pixel text-xs tracking-wider">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#E0BAC7]" />
            <span className="font-bold">ADMIN CONSOLE // 管理員專屬控制台</span>
          </div>
          <button
            onClick={onClose}
            className="w-5 h-5 bg-[#E0BAC7] text-[#442F2A] rounded flex items-center justify-center font-bold hover:bg-[#C89398] cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-4 font-pixel">
          {isAdmin ? (
            /* Logged in state */
            <div className="space-y-3.5">
              <div className="p-3 bg-emerald-50 border-2 border-emerald-600 rounded flex items-center gap-2.5 text-emerald-800 text-xs">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold">已成功解鎖管理員權限！</p>
                  <p className="text-[11px] text-emerald-700">您現在可以隨時切換「編輯模式」修改所有網站內容。</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#442F2A] block">資料發布與備份同步：</label>

                {onPublish && (
                  <div className="p-2.5 bg-emerald-50 rounded border border-emerald-600 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-emerald-900">📱 手機端同步狀態</span>
                      <button
                        type="button"
                        onClick={async () => {
                          setIsSyncing(true);
                          const ok = await onPublish();
                          setIsSyncing(false);
                          if (ok) {
                            setSyncSuccess(true);
                            setTimeout(() => setSyncSuccess(false), 4000);
                          }
                        }}
                        disabled={isSyncing}
                        className="pixel-btn px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer transition disabled:opacity-50"
                      >
                        <span>{isSyncing ? '同步中...' : '🚀 立即同步至手機端'}</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-emerald-800/80 leading-tight">
                      點擊按鈕將電腦版內容寫入伺服器，手機端重新整理後會立即顯示最新編輯內容。
                    </p>
                    {syncSuccess && (
                      <p className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>已成功同步！手機端重新整理即可看見最新內容。</span>
                      </p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => exportDataAsJSON(data)}
                    className="pixel-btn p-2 bg-[#E0BAC7] hover:bg-[#d8a8b8] text-[#442F2A] rounded text-xs flex items-center justify-center gap-1.5 font-bold cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>下載最新 JSON 備份</span>
                  </button>

                  <label className="pixel-btn p-2 bg-white hover:bg-[#F8EDF1] border border-[#442F2A] text-[#442F2A] rounded text-xs flex items-center justify-center gap-1.5 font-bold cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>匯入備份檔覆蓋</span>
                    <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Publishing Explanation Guide */}
              <div className="p-3 bg-white rounded border border-[#442F2A]/30 text-xs text-[#442F2A] space-y-1.5">
                <div className="flex items-center gap-1 font-bold text-[#9D5A64]">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>如何讓 Vercel 上的訪客看見新內容？</span>
                </div>
                <p className="text-[11px] leading-relaxed text-[#442F2A]/80">
                  您在瀏覽器編輯的資料會安全保存在本機。若要讓全世界訪客永久看到：
                  <br />
                  1. 點擊上方「下載最新 JSON 備份」。
                  <br />
                  2. 在 AI Studio 將檔案給我，由我為您寫入正式庫並同步 GitHub ➔ Vercel 即可 30 秒自動更新！
                </p>
              </div>

              {/* Change Password Section */}
              <form onSubmit={handleChangePassword} className="border-t border-[#442F2A]/20 pt-3 space-y-2">
                <label className="text-[11px] font-bold text-[#442F2A] flex items-center gap-1">
                  <Key className="w-3 h-3 text-[#C89398]" />
                  <span>變更管理員密碼：</span>
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="輸入新密碼 (至少4碼)..."
                    className="flex-1 bg-white border border-[#442F2A] rounded px-2 py-1 text-xs outline-none"
                  />
                  <button
                    type="submit"
                    className="pixel-btn px-2.5 py-1 bg-[#442F2A] text-white rounded text-xs font-bold cursor-pointer"
                  >
                    儲存
                  </button>
                </div>
                {passChangedNotice && (
                  <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>新密碼已儲存！下次登入請使用新密碼。</span>
                  </p>
                )}
              </form>

              {/* Logout & Close */}
              <div className="flex items-center justify-between pt-2 border-t border-[#442F2A]/20">
                <button
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1 font-bold cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>登出管理員（回訪客模式）</span>
                </button>
                <button
                  onClick={onClose}
                  className="pixel-btn px-4 py-1 bg-[#442F2A] text-white rounded text-xs font-bold cursor-pointer"
                >
                  關閉
                </button>
              </div>
            </div>
          ) : (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div className="p-3 bg-[#F8EDF1] border border-[#E0BAC7] rounded text-xs text-[#442F2A] space-y-1">
                <div className="font-bold flex items-center gap-1 text-[#9D5A64]">
                  <Key className="w-3.5 h-3.5" />
                  <span>訪客保護模式已啟用</span>
                </div>
                <p className="text-[11px] leading-relaxed text-[#442F2A]/80">
                  一般公開網址預設僅提供純瀏覽之訪客模式。請輸入管理員專屬通行密碼以解鎖編輯模式。
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#442F2A] mb-1">
                  管理員密碼 (ADMIN PASSCODE)：
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrorMsg('');
                    }}
                    placeholder="請輸入管理員通行密碼"
                    autoFocus
                    className="w-full bg-white border-2 border-[#442F2A] rounded px-3 py-2 text-xs text-[#442F2A] outline-none focus:ring-1 focus:ring-[#C89398]"
                  />
                </div>
                {errorMsg && (
                  <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 font-bold">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errorMsg}</span>
                  </p>
                )}
              </div>

              <div className="p-2.5 bg-white border border-[#442F2A]/20 rounded text-[11px] text-[#442F2A]/70 space-y-1">
                <p>💡 提示：若需快速開啟此登入面板，可在網址後方加上 <code className="bg-neutral-100 px-1 py-0.5 rounded text-[#442F2A]">?admin=1</code>。</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="pixel-btn px-3 py-1.5 bg-white border border-[#442F2A] text-xs font-bold rounded cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="pixel-btn px-4 py-1.5 bg-[#E0BAC7] hover:bg-[#d8a8b8] text-[#442F2A] text-xs font-bold rounded flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>解鎖管理權限</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
