import React, { useRef } from 'react';
import { Plus, Minus } from 'lucide-react';

interface NumInputProps {
  id?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  inputClassName?: string;
  showSignToggle?: boolean;
}

export const NumInput: React.FC<NumInputProps> = ({
  id,
  value,
  onChange,
  placeholder = '0',
  label,
  className = '',
  inputClassName = '',
  showSignToggle = true,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const toggleSign = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const clean = value.trim();
    if (!clean || clean === '0') {
      onChange('-');
      return;
    }
    if (clean.startsWith('-')) {
      onChange(clean.substring(1));
    } else {
      onChange('-' + clean);
    }
    inputRef.current?.focus();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    // Allow empty, minus only, numbers, decimal points, e notation, etc.
    if (/^-?[0-9]*\.?[0-9]*([eE][-+]?[0-9]*)?$/.test(v) || v === '-' || v === '' || v === '.') {
      onChange(v);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text');
    const sanitized = text.trim().replace(/−/g, '-').replace(/,/g, '');
    if (/^-?[0-9]*\.?[0-9]*([eE][-+]?[0-9]*)?$/.test(sanitized) || sanitized === '-' || sanitized === '' || sanitized === '.') {
      onChange(sanitized);
    } else {
      const num = parseFloat(sanitized);
      if (!isNaN(num)) {
        onChange(String(num));
      }
    }
  };

  const isNeg = value.trim().startsWith('-');

  return (
    <div className={`relative inline-flex items-center group ${className}`}>
      {label && (
        <span className="text-xs text-gray-400 font-mono absolute -top-4 left-1 select-none pointer-events-none font-semibold">
          {label}
        </span>
      )}
      <div className="relative flex items-center w-full">
        <input
          ref={inputRef}
          id={id}
          type="text"
          inputMode="text"
          value={value}
          onChange={handleChange}
          onPaste={handlePaste}
          placeholder={placeholder}
          className={`w-full h-9 sm:h-10 md:h-11 bg-[#242424] border border-[#333333] rounded-lg px-2 text-center font-mono text-sm sm:text-base font-bold text-white focus:border-[#FF9F0A] focus:outline-none transition-colors shadow-inner ${
            showSignToggle ? 'pr-6 sm:pr-7' : ''
          } ${inputClassName}`}
        />
        {showSignToggle && (
          <button
            type="button"
            tabIndex={-1}
            onClick={toggleSign}
            title={isNeg ? 'Make positive (+)' : 'Make negative (-)'}
            className={`absolute right-1 w-4.5 h-4.5 sm:w-5 sm:h-5 flex items-center justify-center rounded-md text-[10px] font-bold transition-all ${
              isNeg
                ? 'bg-[#FF453A]/20 text-[#FF453A] border border-[#FF453A]/40 hover:bg-[#FF453A]/30'
                : 'bg-[#333333] text-gray-300 hover:text-white hover:bg-[#444444]'
            }`}
          >
            {isNeg ? <Minus className="w-2.5 h-2.5" /> : <Plus className="w-2.5 h-2.5" />}
          </button>
        )}
      </div>
    </div>
  );
};
