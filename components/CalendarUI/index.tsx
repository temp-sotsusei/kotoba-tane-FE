import React, { JSX, useEffect, useMemo } from 'react';
import { useCalendar } from '@/hooks/useCalendar'; 
import type { DayData } from '@/hooks/utils/calendarUtils';
import { isSameDay } from 'date-fns'; 
import { GroupedStories } from '@/types';

interface CalendarUIProps {
  eventDates: GroupedStories;
  onDateSelect: (date: Date) => void;
  /** 選択可能な日付（物語がある日）のSet。指定すると選択制限がかかる */
  enabledDates?: Set<string>;
} 

const CalendarUI = ({ eventDates, onDateSelect, enabledDates }: CalendarUIProps) => {
  
  const {
    currentYear,
    currentMonth,
    calendarDays,
    goToPreviousMonth,
    goToNextMonth,
    setCurrentMonth,
    selectedDate,
    setSelectedDate,
    weekdayLabels,
  } = useCalendar({ enabledDates });

  useEffect(() => {
    onDateSelect(selectedDate);
  }, [selectedDate, onDateSelect]);

  const renderMonthButtons = () => {
    const buttons: JSX.Element[] = [];
    
    for (let i = -2; i <= 2; i++) {
      const targetDate = new Date(currentYear, currentMonth + i, 1);
      const targetMonth = targetDate.getMonth();
      const targetYear = targetDate.getFullYear();
      const isActive = targetMonth === currentMonth && targetYear === currentYear;
      
      buttons.push(
        <button
          key={i}
          className={`
            px-3 py-1 text-xs font-semibold rounded-lg transition-all duration-200 shadow-sm
            ${isActive 
              ? 'bg-[#93C400] text-white border-2 border-[#93C400] scale-105' 
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
            }
          `}
          // setCurrentMonth を使用して指定月へジャンプ
          onClick={() => setCurrentMonth(targetDate)} 
        >
          {targetMonth + 1}月
        </button>
      );
    }
    return buttons;
  };

  // 日付セルがクリックされたときのハンドラ
  const handleDayClick = (dayData: DayData): void => {
      // 選択状態を Date オブジェクトで更新
      setSelectedDate(dayData.date); 
  };
  
  return (
    <div className="min-w-80 max-w-sm mx-auto p-5 bg-[#B4E176]/50 border-4 border-[#93C400] rounded-2xl font-sans shadow-2xl">
      
      {/* 1. ヘッダー (年/月 表示とナビゲーション) */}
      <div className="flex justify-between items-center h-10 mb-6">
        <button 
          onClick={goToPreviousMonth} 
          className="text-2xl text-gray-800 hover:bg-gray-100 rounded-full p-2 transition-colors"
          aria-label="前月へ"
        >
          &lt;
        </button>
        
        <div className="flex flex-col justify-center items-center">
          <span className="text-xl font-extrabold text-gray-800">
            {currentMonth + 1}月
          </span>
          <span className="text-sm font-medium text-gray-600">
            {currentYear}年
          </span>
        </div>
        
        <button 
          onClick={goToNextMonth} 
          className="text-2xl text-gray-800 hover:bg-gray-100 rounded-full p-2 transition-colors"
          aria-label="次月へ"
        >
          &gt;
        </button>
      </div>
      
      {/* 2. 月選択ボタン */}
      <div className="flex justify-center space-x-2 mb-6 overflow-x-auto py-1">
        {renderMonthButtons()}
      </div>

      {/* 3. 曜日ヘッダー (土曜日スタート) */}
      <div className="grid grid-cols-7 text-center text-xs sm:text-sm font-extrabold mb-2">
        {weekdayLabels.map((day) => (
          <div 
            key={day} 
            className={
              day === '日' ? 'text-red-500' : 
              day === '土' ? 'text-blue-500' : 'text-gray-700'
            }
          >
            {day}
          </div>
        ))}
      </div>

      {/* 4. 日付グリッド */}
      <div className="grid grid-cols-7 gap-y-1">
        {calendarDays.map((day) => {
          
          // 💡 選択判定: isSameDay を使用して、時刻を無視して日付が同じか比較
          const isUserSelected = isSameDay(selectedDate, day.date);
          
          // イベント日判定: DayDataのdateKeyを使用
          const hasBlossom = !!eventDates[day.dateKey]?.length;
          const { isToday, isSelectable } = day;

          return (
            <div
              key={day.key} // Hookから提供された安定キー（YYYY-MM-DD 形式）
              className={`
                relative h-10 w-full flex flex-col items-center justify-center p-0.5 
                rounded-lg transition-all duration-100
                ${
                  !day.isCurrentMonth 
                    ? 'opacity-40 pointer-events-none' 
                    : !isSelectable
                      ? 'opacity-50 cursor-not-allowed'
                      : 'cursor-pointer hover:bg-green-50'
                } 
              `}
              onClick={() => isSelectable && day.isCurrentMonth && handleDayClick(day)}
              aria-label={`${day.dayOfMonth}日`}
              aria-disabled={!isSelectable}
            >
              
              {/* 桜のアイコン */}
              {hasBlossom && (
                <div className="absolute top-1 right-1 z-10">
                    <span className="text-xs text-pink-400 opacity-80">🌸</span>
                </div>
              )}

              {/* 日付の数字のスタイル */}
              <span 
                className={`
                  relative text-sm font-semibold z-20 w-8 h-8 flex items-center justify-center rounded-full
                  transition-all duration-200
                  ${isUserSelected 
                      ? 'bg-[#FF8258] text-white shadow-md' // ユーザーがクリックした選択
                      : isToday && day.isCurrentMonth
                          ? 'border-2 border-[#388E3C] text-gray-900 bg-green-100' // 今日
                          : day.date.getDay() === 0 // 日曜
                              ? 'text-red-500' 
                              : day.date.getDay() === 6 // 土曜
                                  ? 'text-blue-500' 
                                  : 'text-gray-800' // 平日
                  }
                `}
              >
                {day.dayOfMonth}
              </span>
              
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarUI;