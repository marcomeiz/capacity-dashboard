import { useState, useCallback } from 'react';
import type { DateRange } from '../types/common';

export function useDateRange(initialStartDate?: Date, initialEndDate?: Date) {
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: initialStartDate || new Date(),
    endDate: initialEndDate || new Date()
  });

  const setRange = useCallback((start: Date, end: Date) => {
    if (start > end) {
      throw new Error('Start date cannot be after end date');
    }
    setDateRange({ startDate: start, endDate: end });
  }, []);

  const setMonth = useCallback((date: Date) => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    setDateRange({ startDate: start, endDate: end });
  }, []);

  return {
    dateRange,
    setRange,
    setMonth
  };
}