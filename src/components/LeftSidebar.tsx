import React from 'react';
import { CoupleSiteData, ActiveTab } from '../types';
import { Edit, Heart } from 'lucide-react';

interface LeftSidebarProps {
  data: CoupleSiteData;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isEditMode: boolean;
  onEditSection: (section: string) => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  data,
  activeTab,
  onTabChange,
  isEditMode,
  onEditSection,
}) => {
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
          <button
            onClick={() => onEditSection('profile')}
            className="absolute top-2 right-2 p-1 bg-[#E0BAC7] hover:bg-[#d49bb0] rounded border border-[#442F2A] text-[#442F2A] text-xs cursor-pointer shadow-sm"
            title="編輯人物與頭貼"
          >
            <Edit className="w-3 h-3" />
          </button>
        )}

        {/* Dual Avatars Intertwined */}
        <div className="relative mb-2 mt-1">
          {/* Overlapping Pixel Hearts: Pink & Brown replacing the ribbon */}
          <div className="absolute -top-3 -left-3 z-10 select-none">
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

          <div className="w-20 h-20 rounded-full border-3 border-[#442F2A] p-0.5 bg-[#E0BAC7] overflow-hidden shadow-md">
            <img
              src={data.characterB.avatar}
              alt={data.characterB.name}
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          {/* Secondary mini avatar overlapping */}
          <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full border-2 border-[#442F2A] overflow-hidden bg-[#FFF8F5] shadow">
            <img
              src={data.characterA.avatar}
              alt={data.characterA.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <h2 className="font-pixel font-bold text-sm text-[#442F2A] mt-1">
          {data.characterA.name} × {data.characterB.name}
        </h2>
        <p className="text-[11px] text-[#442F2A]/70 font-pixel">
          「{data.characterA.romajiName || 'Koshi'} x {data.characterB.romajiName || 'Nanao'}」
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
    </aside>
  );
};
