"use client";

import * as React from "react";
import { Icon } from "@iconify/react";
import { Calendar } from "@/app/components/shadcn-ui/Default-Ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/components/shadcn-ui/Default-Ui/popover";
import { Button } from "@/app/components/shadcn-ui/Default-Ui/button";
import { DATE_DISPLAY_FORMAT, DATE_VALUE_FORMAT } from "@/lib/dateConfig";
import dayjs from "dayjs";

export interface ThaiDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  id?: string;
  name?: string;
  disabled?: boolean;
}

/**
 * ตัวเลือกวันที่ UI ภาษาไทยทั้งระบบ
 * value/onChange ใช้รูปแบบ YYYY-MM-DD (เก็บใน DB/ส่ง API ได้ตามปกติ)
 */
export function ThaiDatePicker({
  value,
  onChange,
  placeholder = "เลือกวัน/เดือน/ปี",
  className = "",
  required,
  id,
  name,
  disabled,
}: ThaiDatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const date = value ? dayjs(value, DATE_VALUE_FORMAT).toDate() : undefined;
  const displayText = value
    ? dayjs(value).format(DATE_DISPLAY_FORMAT)
    : placeholder;

  const handleSelect = (d: Date | undefined) => {
    if (!d) return;
    onChange(dayjs(d).format(DATE_VALUE_FORMAT));
    setOpen(false);
  };

  const handleClear = () => {
    onChange("");
    setOpen(false);
  };

  const handleToday = () => {
    onChange(dayjs().format(DATE_VALUE_FORMAT));
    setOpen(false);
  };

  return (
    <div className="w-full">
      {name && (
        <input
          type="hidden"
          name={name}
          value={value}
          required={required}
          readOnly
          aria-hidden
        />
      )}
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          id={id}
          disabled={disabled}
          className={`w-full justify-between font-normal bg-gray-50 border-gray-200 text-left ${className}`}
        >
          <span className="flex items-center gap-2">
            <Icon icon="tabler:calendar" width={18} className="text-gray-500" />
            {displayText}
          </span>
          <Icon icon="tabler:chevron-down" width={18} className="text-gray-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          defaultMonth={date}
          captionLayout="dropdown"
          className="rounded-lg border-0"
        />
        <div className="flex items-center justify-between gap-2 border-t border-gray-200 p-2">
          <button
            type="button"
            onClick={handleClear}
            className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded hover:bg-gray-100"
          >
            ล้าง
          </button>
          <button
            type="button"
            onClick={handleToday}
            className="text-sm text-[#2E7D32] hover:bg-green-50 px-3 py-1.5 rounded font-medium"
          >
            วันนี้
          </button>
        </div>
      </PopoverContent>
    </Popover>
    </div>
  );
}
