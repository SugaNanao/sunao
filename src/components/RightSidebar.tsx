import React, { useState } from 'react';
import { CoupleSiteData, SpecialDate } from '../types';
import { Edit, ChevronLeft, ChevronRight, Heart, Calendar, Star } from 'lucide-react';

interface RightSidebarProps {
  data: CoupleSiteData;
  onOpenChat: () => void;
  isPlayingMusic: boolean;
  onToggleMusic: () => void;
  isEditMode: boolean;
  onEditSection: (section: string) => void;
  onAddSpecialDate?: (newDate: SpecialDate) => void;
}

interface FloatingDateDetail {
  date: string;
  title: string;
  note: string;
  isAnniversary?: boolean;
  isHoliday?: boolean;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  data,
  onOpenChat,
  isEditMode,
  onEditSection,
}) => {
  const [floatingDate, setFloatingDate] = useState<FloatingDateDetail | null>(null);
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(8); // 8 is September (0-indexed)

  // Extract day of anniversary
  const annivDate = new Date(data.anniversaryDate);
  const annivMonth = annivDate.getMonth();
  const annivDay = annivDate.getDate() || 9;

  // Calculate days since anniversary
  const calculateDays = () => {
    try {
      const anniv = new Date(data.anniversaryDate);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - anniv.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch {
      return 1357;
    }
  };

  const daysCount = calculateDays();

  // Month navigation
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Calendar generation for currentYear & currentMonth
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const calendarCells = [];
  // Prev month filler
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    calendarCells.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
    });
  }
  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push({
      day: d,
      isCurrentMonth: true,
    });
  }
  // Next month filler
  const remaining = 35 - calendarCells.length;
  for (let d = 1; d <= (remaining > 0 ? remaining : 42 - calendarCells.length); d++) {
    calendarCells.push({
      day: d,
      isCurrentMonth: false,
    });
  }

  // Find if a day has special dates
  const specialDatesList = data.specialDates || [];
  const getSpecialDateForDay = (day: number) => {
    const monthNum = currentMonth + 1;
    const formattedMMDD = `${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return specialDatesList.find((sd) => {
      if (sd.date === formattedMMDD || sd.date.endsWith(`-${formattedMMDD}`)) {
        return true;
      }
      return false;
    });
  };

  return (
    <aside className="w-full lg:w-64 xl:w-68 shrink-0 flex flex-col gap-3.5 select-none" id="right-sidebar">
      {/* 1. New Message Prompt Strip */}
      <button
        onClick={onOpenChat}
        className="pixel-btn p-2 bg-gradient-to-r from-[#FFF8F5] to-[#F8EDF1] border-2 border-[#442F2A] rounded-md flex items-center justify-between text-xs font-pixel text-[#442F2A] group shadow-md"
        id="right-new-message-banner"
      >
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#C89398] animate-ping" />
          <span className="font-bold text-[#C89398]">NEW MESSAGE</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] bg-[#E0BAC7] px-1.5 py-0.5 rounded border border-[#442F2A]">
          <span>OPEN</span>
        </div>
      </button>

      {/* 2. Anniversary Widget (Title only English, no icon) */}
      <div className="pixel-card p-3.5 relative bg-gradient-to-b from-[#FFF8F5] to-white" id="sidebar-anniversary-widget">
        {isEditMode && (
          <button
            onClick={() => onEditSection('basic')}
            className="absolute top-2 right-2 p-1 bg-[#E0BAC7] hover:bg-[#d49bb0] rounded border border-[#442F2A] text-[#442F2A] text-xs font-pixel flex items-center gap-1 cursor-pointer shadow-sm"
            title="EDIT ANNIVERSARY"
          >
            <Edit className="w-3 h-3" />
          </button>
        )}

        <div className="flex items-center justify-between border-b border-[#442F2A]/20 pb-1.5 mb-2.5">
          <span className="font-pixel font-bold text-xs text-[#442F2A] tracking-wider">
            ANNIVERSARY
          </span>
          <span className="text-[10px] text-[#442F2A]/60 font-pixel">MEMORIAL</span>
        </div>

        <div className="text-center py-1">
          <p className="text-[11px] font-pixel text-[#442F2A]/70 mb-1">
            since {data.anniversaryDate.replace(/-/g, '. ')} -
          </p>

          <div className="inline-flex items-baseline gap-1.5 font-pixel">
            <span className="text-xl font-bold text-[#C89398]">D+</span>
            <span className="text-3xl font-extrabold text-[#442F2A] tracking-wider">
              {daysCount.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-[#442F2A]/70">days</span>
          </div>

          <div className="mt-2 flex justify-center">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-pixel text-[#442F2A] bg-[#F8EDF1] py-0.5 px-2 rounded border border-[#442F2A]/30 w-fit">
              <span className="text-[10px] text-[#442F2A]">✦</span>
              <span>{data.anniversaryNote || '相識於2024.02.22'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Retro Calendar Widget (Title only English, no icon) */}
      <div className="pixel-card p-3 relative" id="sidebar-calendar-widget">
        {isEditMode && (
          <button
            onClick={() => onEditSection('basic')}
            className="absolute top-2 right-2 px-1.5 py-0.5 bg-[#E0BAC7] hover:bg-[#d49bb0] rounded border border-[#442F2A] text-[#442F2A] text-[10px] font-pixel flex items-center gap-1 cursor-pointer shadow-sm"
            title="EDIT DATES"
          >
            <Edit className="w-3 h-3" />
            <span>EDIT</span>
          </button>
        )}

        <div className="flex items-center justify-between border-b border-[#442F2A]/20 pb-1.5 mb-2">
          <span className="font-pixel font-bold text-xs text-[#442F2A] tracking-wider">
            CALENDAR
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="p-0.5 hover:bg-[#E0BAC7] rounded text-[#442F2A] cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] text-[#442F2A] font-pixel font-bold min-w-[85px] text-center">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <button
              onClick={nextMonth}
              className="p-0.5 hover:bg-[#E0BAC7] rounded text-[#442F2A] cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Calendar Days Matrix */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-pixel mb-2 items-center">
          <span className="text-[#C89398] font-bold">S</span>
          <span>M</span>
          <span>T</span>
          <span>W</span>
          <span>T</span>
          <span>F</span>
          <span className="text-blue-500 font-bold">S</span>

          {calendarCells.map((cell, idx) => {
            if (!cell.isCurrentMonth) {
              return (
                <div key={idx} className="h-6 flex items-center justify-center text-[#442F2A]/30">
                  {cell.day}
                </div>
              );
            }

            const isAnniv = currentMonth === annivMonth && cell.day === annivDay;
            const specialDate = getSpecialDateForDay(cell.day);
            const today = new Date();
            const isToday =
              currentYear === today.getFullYear() &&
              currentMonth === today.getMonth() &&
              cell.day === today.getDate();

            if (specialDate) {
              const isHoliday = specialDate.category === 'holiday';
              return (
                <div key={idx} className="h-6 flex items-center justify-center">
                  <button
                    onClick={() => {
                      setFloatingDate({
                        date: specialDate.date,
                        title: specialDate.title,
                        note: specialDate.note || (isHoliday ? '特別的節日紀錄！' : '特別的心動紀念日！'),
                        isHoliday: isHoliday,
                      });
                    }}
                    className={`relative w-6 h-6 flex items-center justify-center hover:scale-115 transition cursor-pointer group ${
                      isToday ? 'ring-2 ring-[#442F2A] rounded-full' : ''
                    }`}
                    title={`${isHoliday ? '節日' : '紀念日'}: ${specialDate.title} (${cell.day}日)${isToday ? ' [今天]' : ''}`}
                  >
                    {isHoliday ? (
                      <>
                        {/* Brown filled star with pink date number (棕色星星稍微大一點點，顏色填滿，日期數字粉色) */}
                        <Star className="w-[26px] h-[26px] fill-[#442F2A] stroke-[#442F2A] stroke-[1px] absolute inset-0 m-auto filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.12)]" />
                        <span className="relative z-10 text-[#E0BAC7] font-bold text-[9px] leading-none pt-0.5">
                          {cell.day}
                        </span>
                      </>
                    ) : (
                      <>
                        {/* Heart with fill matching its stroke color */}
                        <Heart className="w-[23px] h-[23px] fill-[#C89398] stroke-[#C89398] stroke-[1.5px] absolute inset-0 m-auto filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.12)]" />
                        <span className="relative z-10 text-white font-bold text-[8.5px] leading-none pt-0.5">
                          {cell.day}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              );
            }

            if (isAnniv) {
              return (
                <div key={idx} className="h-6 flex items-center justify-center">
                  <button
                    onClick={() => {
                      setFloatingDate({
                        date: data.anniversaryDate,
                        title: '戀愛紀念日 (ANNIVERSARY)',
                        note: '我們在一起的特別日子，定格永恆的心動。',
                        isAnniversary: true,
                      });
                    }}
                    className={`relative w-6 h-6 flex items-center justify-center hover:scale-115 transition cursor-pointer group ${
                      isToday ? 'ring-2 ring-[#442F2A] rounded-full' : ''
                    }`}
                    title={`戀愛紀念日 (${cell.day}日)${isToday ? ' [今天]' : ''}`}
                  >
                    {/* Heart with fill matching its stroke color */}
                    <Heart className="w-[23px] h-[23px] fill-[#C89398] stroke-[#C89398] stroke-[1.5px] absolute inset-0 m-auto filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.12)]" />
                    <span className="relative z-10 text-white font-bold text-[8.5px] leading-none pt-0.5">
                      {cell.day}
                    </span>
                  </button>
                </div>
              );
            }

            // Today highlighted with pink border #E0BAC7 without fill (圓框，中間不上色)
            if (isToday) {
              return (
                <div key={idx} className="h-6 flex items-center justify-center">
                  <div
                    className="w-6 h-6 rounded-full border-2 border-[#E0BAC7] bg-transparent flex items-center justify-center font-bold text-[#442F2A] text-[9.5px]"
                    title="今天"
                  >
                    {cell.day}
                  </div>
                </div>
              );
            }

            return (
              <div key={idx} className="h-6 flex items-center justify-center text-[#442F2A]">
                {cell.day}
              </div>
            );
          })}
        </div>

        {/* Calendar Helper Note */}
        <div className="text-[10px] font-pixel text-[#442F2A]/80 border-t border-[#442F2A]/15 pt-1.5 flex items-center justify-center min-h-[22px] bg-[#F8EDF1]/60 px-1.5 rounded text-center">
          <span className="truncate">✦ 點擊日期查看詳情</span>
        </div>
      </div>

      {/* Floating Popup Modal for Special Date / Anniversary (浮窗) */}
      {floatingDate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs select-none"
          onClick={() => setFloatingDate(null)}
        >
          <div
            className="pixel-window max-w-xs sm:max-w-sm w-full bg-white rounded-lg border-3 border-[#442F2A] overflow-hidden shadow-2xl animate-fade-in flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-[#442F2A] text-[#FFF8F5] px-3.5 py-2 flex items-center justify-between font-pixel text-xs">
              <div className="flex items-center gap-1.5 font-bold">
                {floatingDate.isHoliday ? (
                  <Star className="w-3.5 h-3.5 fill-[#E0BAC7] text-[#E0BAC7]" />
                ) : (
                  <Heart className="w-3.5 h-3.5 fill-[#C89398] text-[#C89398]" />
                )}
                <span>
                  {floatingDate.isHoliday ? 'HOLIDAY // 節日註記' : 'MEMORIAL DATE // 紀念日註記'}
                </span>
              </div>
              <button
                onClick={() => setFloatingDate(null)}
                className="w-5 h-5 bg-[#E0BAC7] text-[#442F2A] rounded flex items-center justify-center font-bold hover:bg-[#C89398] cursor-pointer transition"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-4 bg-[#FFF8F5] space-y-3 font-pixel">
              {/* Date Badge */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#442F2A]/80 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#442F2A] shrink-0" />
                  <span>日期：</span>
                  <span className="font-bold text-[#442F2A] bg-white px-2 py-0.5 rounded border border-[#442F2A]/30">
                    {floatingDate.date}
                  </span>
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-bold border border-[#442F2A]/30 ${
                    floatingDate.isHoliday ? 'bg-[#442F2A] text-[#E0BAC7]' : 'bg-[#E0BAC7] text-[#442F2A]'
                  }`}
                >
                  {floatingDate.isAnniversary
                    ? 'ANNIVERSARY'
                    : floatingDate.isHoliday
                    ? '★ HOLIDAY (節日)'
                    : '♥ SPECIAL DAY (紀念日)'}
                </span>
              </div>

              {/* Title */}
              <div className="border-b border-[#442F2A]/15 pb-2">
                <h4 className="text-sm font-bold text-[#C89398] flex items-center gap-1.5">
                  {floatingDate.isHoliday ? (
                    <Star className="w-4 h-4 text-[#C89398] stroke-[2px] shrink-0" />
                  ) : (
                    <Heart className="w-4 h-4 fill-[#C89398] text-[#442F2A] shrink-0" />
                  )}
                  <span>{floatingDate.title}</span>
                </h4>
              </div>

              {/* One Sentence Note */}
              <div className="bg-white p-3 rounded-lg border border-[#442F2A]/20 shadow-xs">
                <p className="text-xs text-[#442F2A] leading-relaxed font-normal">
                  "{floatingDate.note ? floatingDate.note.replace(/[「」]/g, '"').replace(/^"+/, '').replace(/"+$/, '') : ''}"
                </p>
              </div>

              {/* Close button */}
              <div className="text-center pt-1">
                <button
                  onClick={() => setFloatingDate(null)}
                  className="pixel-btn px-5 py-1 bg-[#442F2A] text-white text-xs font-bold rounded cursor-pointer hover:bg-[#C89398] transition"
                >
                  關閉
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
