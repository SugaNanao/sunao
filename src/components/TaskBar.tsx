import React, { useState, useEffect } from 'react';
import { ActiveTab } from '../types';
import { Home } from 'lucide-react';

interface TaskBarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isEditMode?: boolean;
  onToggleEditMode?: () => void;
  onOpenChat?: () => void;
  unreadCount?: number;
  isSharedLink?: boolean;
}

export const TaskBar: React.FC<TaskBarProps> = ({
  activeTab,
  onTabChange,
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
      {/* Left side: HOME button (COUPLE OS replaced as requested) */}
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

      {/* Right side: System Clock (Edit mode & Message buttons removed from taskbar as requested) */}
      <div className="flex items-center gap-2">
        <div className="bg-white border border-[#442F2A] px-2.5 py-0.5 rounded text-[11px] flex items-center gap-1 shadow-xs">
          <span>{timeStr || '12:00 Sat'}</span>
        </div>
      </div>
    </div>
  );
};
