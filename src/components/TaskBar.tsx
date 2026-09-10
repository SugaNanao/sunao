import React, { useState, useEffect } from 'react';
import { ActiveTab } from '../types';
import { Home, Lock, ShieldCheck } from 'lucide-react';

interface TaskBarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isAdmin?: boolean;
  isEditMode?: boolean;
  onToggleEditMode?: () => void;
  onOpenAdminModal?: () => void;
  onAdminLogout?: () => void;
  fontMode?: 'pixel' | 'rounded' | 'clean';
  onCycleFontMode?: () => void;
}

export const TaskBar: React.FC<TaskBarProps> = ({
  activeTab,
  onTabChange,
  isAdmin = false,
  isEditMode = false,
  onToggleEditMode,
  onOpenAdminModal,
  onAdminLogout,
  fontMode = 'pixel',
  onCycleFontMode,
}) => {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const update = () => {
      const d = new Date();
      const h = String(d.getHours()).padStart(2, '0');
      const m = String(d.getMinutes()).padStart(2, '0');
      const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
      const date = `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
      setTimeStr(`${h}:${m} ${day}. ${date}`);
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-[#FFF8F5] border-t-2 border-[#442F2A] h-10 px-2 sm:px-4 flex items-center justify-between font-pixel text-xs text-[#442F2A] select-none shadow-md">
      {/* Left side: HOME button */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onTabChange('HOME')}
          className={`pixel-btn px-3 py-1 rounded flex items-center gap-1.5 font-bold cursor-pointer text-xs transition ${
            activeTab === 'HOME'
              ? 'bg-[#442F2A] text-[#FFF8F5]'
              : 'bg-[#E0BAC7] text-[#442F2A] hover:bg-[#d49bb0]'
          }`}
          id="taskbar-home-btn"
          title="回到首頁 HOME"
        >
          <Home className="w-3.5 h-3.5" />
          <span>HOME</span>
        </button>
      </div>

      {/* Right side: Admin Status & System Clock */}
      <div className="flex items-center gap-2">
        {isAdmin ? (
          <div className="flex items-center gap-1.5 bg-[#F8EDF1] border border-[#442F2A] px-2 py-0.5 rounded text-[10px] text-[#9D5A64] font-bold shadow-2xs">
            <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
            <span className="hidden sm:inline">管理員已連線</span>
            {onToggleEditMode && (
              <button
                onClick={onToggleEditMode}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition cursor-pointer ${
                  isEditMode
                    ? 'bg-[#C89398] text-white border-[#442F2A]'
                    : 'bg-white text-[#442F2A] border-[#442F2A]/40 hover:bg-[#E0BAC7]/40'
                }`}
                title={isEditMode ? '點擊退出編輯模式（進入純淨展示）' : '點擊開啟編輯模式'}
              >
                {isEditMode ? '✏️ 編輯模式中' : '👁️ 點擊開啟編輯'}
              </button>
            )}
            <button
              onClick={onOpenAdminModal}
              className="text-[#442F2A] hover:underline cursor-pointer ml-0.5"
              title="管理員選單"
            >
              [設定]
            </button>
            <button
              onClick={onAdminLogout}
              className="text-red-600 hover:underline cursor-pointer ml-0.5"
              title="登出管理員"
            >
              [登出]
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAdminModal}
            className="p-1 rounded text-[#442F2A]/40 hover:text-[#442F2A] hover:bg-[#E0BAC7]/60 transition cursor-pointer"
            title="管理員通行認證"
          >
            <Lock className="w-3 h-3" />
          </button>
        )}

        {/* Font Style Switcher: 像素風 / 日系圓體 / 典雅黑體 */}
        {onCycleFontMode && (
          <button
            onClick={onCycleFontMode}
            className="bg-white border border-[#442F2A] px-2 py-0.5 rounded text-[10px] sm:text-[11px] flex items-center gap-1 shadow-2xs hover:bg-[#E0BAC7]/40 transition cursor-pointer font-bold text-[#442F2A]"
            title="點擊切換全站字體風格：像素風 (中日文適配) / 日系圓體 / 典雅黑體"
          >
            <span className="text-[#C89398] font-mono">Aa</span>
            <span className="hidden sm:inline">
              {fontMode === 'pixel' ? '像素風' : fontMode === 'rounded' ? '日系圓體' : '典雅黑體'}
            </span>
          </button>
        )}

        <div className="bg-white border border-[#442F2A] px-2.5 py-0.5 rounded text-[11px] flex items-center gap-1 shadow-xs">
          <span>{timeStr || '12:00 Sat'}</span>
        </div>
      </div>
    </div>
  );
};
