import { isSameDay, isSameMonth } from 'date-fns';

// ========================================
// 型定義
// ========================================

/**
 * 曜日を表す型（0: 日曜, 1: 月曜, ..., 6: 土曜）
 */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/**
 * カレンダーの各日付セルを表すデータ構造
 */
export interface DayData {
  /** 日付オブジェクト */
  date: Date;
  /** 日にち（1-31） */
  dayOfMonth: number;
  /** 表示中の月に属するか */
  isCurrentMonth: boolean;
  /** 今日かどうか */
  isToday: boolean;
  /** 選択可能かどうか（enabledDates が指定されている場合に使用） */
  isSelectable: boolean;
  /** React のキーとして使用する一意な文字列（YYYY-MM-DD 形式） */
  key: string;
  /** 日付キー（YYYY-MM-DD 形式） - イベント判定などに使用 */
  dateKey: string;
}

// ========================================
// 定数
// ========================================

/**
 * カレンダーグリッドの総日数（6週分）
 */
export const CALENDAR_GRID_SIZE = 42 as const;

/**
 * 日本語の曜日ラベル（土曜始まり）
 */
export const WEEKDAY_LABELS_JA = ['土', '日', '月', '火', '水', '木', '金'] as const;

// ========================================
// ユーティリティ関数
// ========================================

/**
 * Date オブジェクトを YYYY-MM-DD 形式の文字列に変換
 * @param date 変換対象の日付
 * @returns YYYY-MM-DD 形式の文字列
 */
export const toDateKey = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * 年月から YYYY-MM 形式のラベルを生成
 * @param year 年
 * @param month 月（0-11）
 * @returns YYYY-MM 形式の文字列
 */
export const formatMonthLabel = (year: number, month: number): string => {
  const m = String(month + 1).padStart(2, '0');
  return `${year}-${m}`;
};

/**
 * 指定月の1日から、カレンダーグリッド開始日までのオフセットを計算
 * @param firstWeekdayOfMonth 月初の曜日（0-6）
 * @param startDayOfWeek カレンダー開始曜日（0-6）
 * @returns オフセット日数
 */
export const calculateGridOffset = (
  firstWeekdayOfMonth: number,
  startDayOfWeek: Weekday
): number => {
  return (7 + firstWeekdayOfMonth - startDayOfWeek) % 7;
};

/**
 * 指定年月のカレンダーグリッド（6週×7日=42日分）を生成
 * @param year 年
 * @param month 月（0-11）
 * @param startDayOfWeek カレンダー開始曜日（0-6）
 * @param today 今日の日付（テスト時に固定可能）
 * @param enabledDates 選択可能な日付のSet（指定されない場合はすべて選択可能）
 * @returns カレンダーの日付データ配列
 */
export const buildCalendarGrid = (
  year: number,
  month: number,
  startDayOfWeek: Weekday,
  today: Date,
  enabledDates?: Set<string>
): DayData[] => {
  const grid: DayData[] = [];
  const firstDayOfMonth = new Date(year, month, 1);
  const firstWeekdayOfMonth = firstDayOfMonth.getDay();

  // カレンダーグリッドの開始日を計算（月初より前の日付を含む）
  const offset = calculateGridOffset(firstWeekdayOfMonth, startDayOfWeek);
  const gridStartDate = new Date(year, month, 1 - offset);

  // 42日分のセルを生成
  for (let i = 0; i < CALENDAR_GRID_SIZE; i++) {
    const currentDate = new Date(gridStartDate);
    currentDate.setDate(gridStartDate.getDate() + i);

    const dateKey = toDateKey(currentDate);
    const isCurrentMonth = isSameMonth(currentDate, firstDayOfMonth);
    const isSelectable = enabledDates ? enabledDates.has(dateKey) : true;

    grid.push({
      date: currentDate,
      dayOfMonth: currentDate.getDate(),
      isCurrentMonth,
      isToday: isSameDay(currentDate, today),
      isSelectable,
      key: dateKey,
      dateKey,
    });
  }

  return grid;
};

/**
 * 日付を指定月の1日に正規化
 * @param date 任意の日付
 * @returns その月の1日
 */
export const normalizeToFirstDayOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};
