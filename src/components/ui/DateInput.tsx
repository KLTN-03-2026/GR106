import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface DateInputProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export function DateInput({
  value,
  onChange,
  label,
  className,
  disabled
}: DateInputProps) {
  const [displayValue, setDisplayValue] = useState('');
  const nativeInputRef = useRef<HTMLInputElement>(null);

  // Sync internal display value when external value changes (YYYY-MM-DD -> DD/MM/YYYY)
  useEffect(() => {
    if (value) {
      const [year, month, day] = value.split('-');
      if (year && month && day) {
        setDisplayValue(`${day}/${month}/${year}`);
      }
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, ''); // Only digits
    if (input.length > 8) input = input.slice(0, 8);

    // Apply mask DD/MM/YYYY
    let formatted = '';
    if (input.length > 0) {
      formatted += input.slice(0, 2);
      if (input.length > 2) {
        formatted += '/' + input.slice(2, 4);
        if (input.length > 4) {
          formatted += '/' + input.slice(4, 8);
        }
      }
    }

    setDisplayValue(formatted);

    // If complete, notify parent (DD/MM/YYYY -> YYYY-MM-DD)
    if (input.length === 8) {
      const day = input.slice(0, 2);
      const month = input.slice(2, 4);
      const year = input.slice(4, 8);
      
      // Basic validation check before sending
      const d = parseInt(day);
      const m = parseInt(month);
      const y = parseInt(year);
      
      if (m >= 1 && m <= 12 && d >= 1 && d <= 31 && y >= 1900) {
        onChange(`${year}-${month}-${day}`);
      }
    }
  };

  const handleNativeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const openPicker = () => {
    if (nativeInputRef.current) {
      nativeInputRef.current.showPicker();
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">
          {label}
        </label>
      )}
      <div className="relative group">
        <input
          type="text"
          value={displayValue}
          onChange={handleTextChange}
          placeholder="dd/mm/yyyy"
          disabled={disabled}
          className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white rounded-2xl py-3 px-4 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300 disabled:opacity-50"
        />
        
        <button
          type="button"
          onClick={openPicker}
          disabled={disabled}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-indigo-500 transition-colors"
        >
          <CalendarIcon size={18} />
        </button>

        {/* Hidden native input for the calendar picker */}
        <input
          ref={nativeInputRef}
          type="date"
          value={value}
          onChange={handleNativeChange}
          className="absolute inset-0 opacity-0 pointer-events-none"
          tabIndex={-1}
        />
      </div>
    </div>
  );
}
