import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  type Weekday,
  type DayData,
  buildCalendarGrid,
  formatMonthLabel,
  normalizeToFirstDayOfMonth,
  WEEKDAY_LABELS_JA,
} from './utils/calendarUtils';

// ========================================
// 定数
// ========================================

/**
 * カレンダーの開始曜日（土曜始まり）
 */
const START_DAY_OF_WEEK = 0 as const satisfies Weekday;

// ========================================
// カスタムフック オプション
// ========================================

export interface UseCalendarOptions {
  /** 制御プロップ: 選択中の日付（指定すると制御モードになる） */
  value?: Date;
  /** 制御プロップ: 選択日変更時のコールバック */
  onChange?: (date: Date) => void;
  /** 非制御プロップ: 初期選択日（デフォルトは今日） */
  defaultValue?: Date;
  /** 選択可能な日付のSet（YYYY-MM-DD形式）。指定されない場合はすべて選択可能 */
  enabledDates?: Set<string>;
  /** テスト用: 「今日」として扱う日付を注入可能 */
  getCurrentDate?: () => Date;
}

// ========================================
// カスタムフック
// ========================================

/**
 * カレンダーの状態管理とナビゲーション機能を提供するフック
 * - 常に今日を基準に初期化（テスト時はgetCurrentDateで上書き可能）
 * - 土曜始まりのカレンダーグリッドを生成
 * - 選択日の管理と月移動機能を提供
 * - 制御/非制御の両対応
 */
export const useCalendar = (options: UseCalendarOptions = {}) => {
  const {
    value: controlledValue,
    onChange: controlledOnChange,
    defaultValue,
    enabledDates,
    getCurrentDate = () => new Date(),
  } = options;

  // ========================================
  // 制御/非制御の判定
  // ========================================

  const isControlled = controlledValue !== undefined;
  const initialDate = defaultValue ?? getCurrentDate();

  // ========================================
  // 状態管理
  // ========================================

  /** 表示中の月を表す日付（常に1日で正規化） */
  const [currentDate, setCurrentDate] = useState<Date>(initialDate);

  /** ユーザーが選択中の日付（非制御モード時のみ使用） */
  const [internalSelectedDate, setInternalSelectedDate] = useState<Date>(initialDate);

  /** 実際に使用する選択日（制御モードでは外部値、非制御では内部状態） */
  const selectedDate = isControlled ? controlledValue : internalSelectedDate;

  /** 今日の日付（メモ化して再計算を防ぐ） */
  const today = useMemo(() => getCurrentDate(), [getCurrentDate]);

  // ========================================
  // 派生値
  // ========================================

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  /** UI 表示用の年月ラベル（YYYY-MM 形式） */
  const currentMonthLabel = formatMonthLabel(currentYear, currentMonth);

  /** 日本語の曜日ラベル（土曜始まり） */
  const weekdayLabels = WEEKDAY_LABELS_JA;

  /** カレンダーグリッド（42日分の日付データ） */
  const calendarDays: DayData[] = useMemo(() => {
    return buildCalendarGrid(currentYear, currentMonth, START_DAY_OF_WEEK, today, enabledDates);
  }, [currentYear, currentMonth, today, enabledDates]);

  // ========================================
  // 選択日更新関数
  // ========================================

  /**
   * 選択日を更新（制御/非制御両対応）
   */
  const setSelectedDate = useCallback(
    (date: Date) => {
      if (!isControlled) {
        setInternalSelectedDate(date);
      }
      controlledOnChange?.(date);
    },
    [isControlled, controlledOnChange]
  );

  // ========================================
  // ナビゲーション関数
  // ========================================

  /**
   * 前月へ移動
   */
  const goToPreviousMonth = useCallback((): void => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  }, [currentYear, currentMonth]);

  /**
   * 次月へ移動
   */
  const goToNextMonth = useCallback((): void => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  }, [currentYear, currentMonth]);

  /**
   * 指定した日付の月へ移動（日付は1日に正規化される）
   * @param date ジャンプ先の日付を含む任意の Date オブジェクト
   */
  const setCurrentMonth = useCallback((date: Date): void => {
    setCurrentDate(normalizeToFirstDayOfMonth(date));
  }, []);

  // ========================================
  // 公開API
  // ========================================

  return {
    // --- 表示中の月情報 ---
    /** 表示中の年 */
    currentYear,
    /** 表示中の月（0-11） */
    currentMonth,
    /** UI 表示用の年月ラベル（YYYY-MM 形式） */
    currentMonthLabel,
    /** カレンダーの日付グリッド（42日分） */
    calendarDays,
    /** 日本語の曜日ラベル（土曜始まり） */
    weekdayLabels,

    // --- 選択状態 ---
    /** ユーザーが選択中の日付 */
    selectedDate,
    /** 選択日を更新する関数 */
    setSelectedDate,

    // --- 月ナビゲーション ---
    /** 前月へ移動 */
    goToPreviousMonth,
    /** 次月へ移動 */
    goToNextMonth,
    /** 指定月へジャンプ */
    setCurrentMonth,
  };
};