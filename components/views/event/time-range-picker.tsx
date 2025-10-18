'use client';

import { useState } from 'react';
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { EventTimeRange } from '@/types';
import { format as formatGregorian } from 'date-fns';

interface TimeRangePickerProps {
  value: EventTimeRange[];
  onChange: (ranges: EventTimeRange[]) => void;
}

export function TimeRangePicker({ value, onChange }: TimeRangePickerProps) {
  const [mode, setMode] = useState<EventTimeRange['mode']>('daily');
  const [startDate, setStartDate] = useState<DateObject | null>(null);
  const [endDate, setEndDate] = useState<DateObject | null>(null);
  const [timeStart, setTimeStart] = useState<string>('');
  const [timeEnd, setTimeEnd] = useState<string>('');

  const addRange = () => {
    if (!startDate || !endDate) return;

    const newRange: EventTimeRange = {
      mode,
      // اینجا به بک‌اند میلادی می‌فرستیم
      startDate: formatGregorian(startDate.toDate(), 'yyyy-MM-dd'),
      endDate: formatGregorian(endDate.toDate(), 'yyyy-MM-dd'),
      timeStart,
      timeEnd,
    };

    onChange([...value, newRange]);

    setStartDate(null);
    setEndDate(null);
    setTimeStart('');
    setTimeEnd('');
  };

  const removeRange = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* انتخاب حالت */}
      <div>
        <label className="block mb-1 text-sm font-medium">نوع بازه</label>
        <Select value={mode} onValueChange={(v) => setMode(v as EventTimeRange['mode'])}>
          <SelectTrigger>
            <SelectValue placeholder="انتخاب حالت" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="continuous">پیوسته</SelectItem>
            <SelectItem value="daily">روزانه</SelectItem>
            <SelectItem value="weekly">هفتگی</SelectItem>
            <SelectItem value="specificDates">تاریخ‌های خاص</SelectItem>
            <SelectItem value="multipleRanges">چند بازه</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* انتخاب تاریخ شروع */}
      <div>
        <label className="block mb-1 text-sm font-medium">تاریخ شروع</label>
        <DatePicker
          value={startDate}
          onChange={setStartDate}
          calendar={persian}
          locale={persian_fa}
          calendarPosition="bottom-right"
          inputClass="w-full border rounded px-2 py-1"
          placeholder="انتخاب تاریخ"
        />
      </div>

      {/* انتخاب تاریخ پایان */}
      <div>
        <label className="block mb-1 text-sm font-medium">تاریخ پایان</label>
        <DatePicker
          value={endDate}
          onChange={setEndDate}
          calendar={persian}
          locale={persian_fa}
          calendarPosition="bottom-right"
          inputClass="w-full border rounded px-2 py-1"
          placeholder="انتخاب تاریخ"
        />
      </div>

      {/* انتخاب ساعت */}
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block mb-1 text-sm font-medium">ساعت شروع</label>
          <Input type="time" value={timeStart} onChange={(e) => setTimeStart(e.target.value)} />
        </div>
        <div className="flex-1">
          <label className="block mb-1 text-sm font-medium">ساعت پایان</label>
          <Input type="time" value={timeEnd} onChange={(e) => setTimeEnd(e.target.value)} />
        </div>
      </div>

      {/* دکمه افزودن */}
      <Button type="button" onClick={addRange}>
        افزودن بازه
      </Button>

      {/* لیست بازه‌ها */}
      <div className="space-y-2">
        {value.map((range, index) => (
          <div
            key={index}
            className="flex justify-between items-center p-2 border rounded"
          >
            <span>
              {/* نمایش شمسی */}
              {new DateObject(range.startDate).convert(persian, persian_fa).format("YYYY/MM/DD")}
              {' '}تا{' '}
              {new DateObject(range.endDate).convert(persian, persian_fa).format("YYYY/MM/DD")}
              {' '}({range.timeStart} - {range.timeEnd})
            </span>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => removeRange(index)}
            >
              حذف
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
