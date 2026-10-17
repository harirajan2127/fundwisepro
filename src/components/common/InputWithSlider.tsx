import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { formatNumber } from '../../engine/formatters';

interface InputWithSliderProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  min: number;
  max: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  presets?: { label: string; value: number }[];
  helperText?: string;
  id?: string;
}

export const InputWithSlider: React.FC<InputWithSliderProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  prefix,
  suffix,
  presets,
  helperText,
  id,
}) => {
  const inputId = id || `input-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  const inputRef = useRef<HTMLInputElement>(null);

  // Determine appropriate decimal precision from step or value
  const getStepDecimals = (s: number): number => {
    if (s <= 0.001) return 3;
    if (s <= 0.01) return 2;
    if (s < 1) return 1;
    return 0;
  };
  const stepDecimals = getStepDecimals(step);

  const formatDisplay = (num: number): string => {
    if (isNaN(num) || !isFinite(num)) return '';
    const hasFrac = num % 1 !== 0;
    const dec = Math.max(stepDecimals, hasFrac ? 2 : 0);
    return formatNumber(num, dec);
  };

  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [textValue, setTextValue] = useState<string>(() => formatDisplay(value));

  // Sync textValue with external value changes when not actively typing
  useEffect(() => {
    if (!isFocused) {
      setTextValue(formatDisplay(value));
    }
  }, [value, step, isFocused]);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    // When focused, display raw digits without commas for easy editing and cursor positioning
    const rawStr = value === 0 ? '' : value.toString();
    setTextValue(rawStr);
    // Select all so the user can immediately type a new number or press Delete to clear
    e.target.select();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    // 1. Allow complete deletion (clearing the entire input)
    if (raw === '') {
      setTextValue('');
      onChange(0);
      return;
    }

    // 2. Strip commas if typed or pasted
    const cleaned = raw.replace(/,/g, '');

    // 3. Allow only digits and a single decimal point (and optional leading minus if min < 0)
    const validPattern = min < 0 ? /^-?\d*\.?\d*$/ : /^\d*\.?\d*$/;
    if (!validPattern.test(cleaned)) {
      return; // Reject invalid characters
    }

    setTextValue(cleaned);

    const num = parseFloat(cleaned);
    if (!isNaN(num)) {
      // Do NOT clamp to min while typing so users can type lower digits (e.g. '2' to reach 20000)
      if (num > max) {
        onChange(max);
      } else {
        onChange(num);
      }
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    const cleaned = textValue.replace(/,/g, '').trim();
    const num = parseFloat(cleaned);

    if (cleaned === '' || isNaN(num)) {
      // If left completely empty or invalid, clamp to min
      onChange(min);
      setTextValue(formatDisplay(min));
    } else if (num < min) {
      // Clamp to min on blur
      onChange(min);
      setTextValue(formatDisplay(min));
    } else if (num > max) {
      // Clamp to max on blur
      onChange(max);
      setTextValue(formatDisplay(max));
    } else {
      // Valid number: format nicely
      onChange(num);
      setTextValue(formatDisplay(num));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    } else if (e.key === 'Escape') {
      setTextValue(formatDisplay(value));
      inputRef.current?.blur();
    }
  };

  const handleClear = () => {
    setTextValue('');
    onChange(0);
    inputRef.current?.focus();
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onChange(val);
    setTextValue(formatDisplay(val));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label
          htmlFor={inputId}
          className="text-xs font-semibold text-slate-700 dark:text-slate-300"
        >
          {label}
        </label>
        {helperText && (
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            {helperText}
          </span>
        )}
      </div>

      {/* Input box */}
      <div className="relative flex items-center rounded-lg border border-slate-200 bg-white shadow-sm focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 transition-all group">
        {prefix && (
          <span className="pl-3 pr-1 text-xs font-semibold text-slate-400 dark:text-slate-500 select-none">
            {prefix}
          </span>
        )}
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          inputMode="decimal"
          value={textValue}
          placeholder={min.toString()}
          onFocus={handleFocus}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-full bg-transparent py-2 px-2 text-sm font-semibold text-slate-900 focus:outline-none dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600"
        />

        {/* Clear (✕) button: visible when input has content */}
        {textValue !== '' && (
          <button
            type="button"
            tabIndex={-1}
            onMouseDown={(e) => {
              e.preventDefault();
              handleClear();
            }}
            className="p-1 mr-1.5 text-slate-300 hover:text-slate-600 dark:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Clear value"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}

        {suffix && (
          <span className="pr-3 text-xs font-medium text-slate-500 dark:text-slate-400 select-none">
            {suffix}
          </span>
        )}
      </div>

      {/* Range Slider */}
      <div className="pt-1">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={Math.max(min, Math.min(max, value || min))}
          onChange={handleSliderChange}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 dark:bg-slate-700 accent-emerald-600 focus:outline-none"
        />
        <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1">
          <span>{prefix}{formatDisplay(min)}{suffix}</span>
          <span>{prefix}{formatDisplay(max)}{suffix}</span>
        </div>
      </div>

      {/* Optional Preset Pills */}
      {presets && presets.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                onChange(preset.value);
                setTextValue(formatDisplay(preset.value));
              }}
              className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                value === preset.value
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
