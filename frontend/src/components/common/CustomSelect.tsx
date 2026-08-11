import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: (string | SelectOption)[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  dropdownClassName?: string;
  ariaLabel?: string;
  icon?: React.ComponentType<{ className?: string }>;
  size?: 'sm' | 'md' | 'lg';
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  disabled = false,
  className = '',
  dropdownClassName = '',
  ariaLabel,
  icon: IconComponent,
  size = 'md'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);

  // Normalize options array to standard SelectOption objects
  const normalizedOptions: SelectOption[] = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  // Handle outside click to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (disabled) return;

      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (isOpen && focusedIndex >= 0 && focusedIndex < normalizedOptions.length) {
            onChange(normalizedOptions[focusedIndex].value);
            setIsOpen(false);
          } else {
            setIsOpen((prev) => !prev);
            const currentIdx = normalizedOptions.findIndex((opt) => opt.value === value);
            setFocusedIndex(currentIdx >= 0 ? currentIdx : 0);
          }
          break;

        case 'ArrowDown':
          e.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
            const currentIdx = normalizedOptions.findIndex((opt) => opt.value === value);
            setFocusedIndex(currentIdx >= 0 ? currentIdx : 0);
          } else {
            setFocusedIndex((prev) => (prev < normalizedOptions.length - 1 ? prev + 1 : 0));
          }
          break;

        case 'ArrowUp':
          e.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
            const currentIdx = normalizedOptions.findIndex((opt) => opt.value === value);
            setFocusedIndex(currentIdx >= 0 ? currentIdx : normalizedOptions.length - 1);
          } else {
            setFocusedIndex((prev) => (prev > 0 ? prev - 1 : normalizedOptions.length - 1));
          }
          break;

        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          break;

        case 'Tab':
          setIsOpen(false);
          break;
      }
    },
    [disabled, isOpen, focusedIndex, normalizedOptions, value, onChange]
  );

  const handleSelectOption = (optValue: string) => {
    onChange(optValue);
    setIsOpen(false);
  };

  // Scroll focused element into view
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && listboxRef.current) {
      const optionEl = listboxRef.current.children[focusedIndex] as HTMLElement;
      if (optionEl) {
        optionEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [isOpen, focusedIndex]);

  // Size specific padding/text classes
  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-xs rounded-lg',
    md: 'px-3.5 py-2 text-xs rounded-xl',
    lg: 'px-4 py-2.5 text-sm rounded-xl'
  }[size];

  return (
    <div ref={containerRef} className={`relative inline-block w-full ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel || placeholder}
        className={`w-full flex items-center justify-between gap-2 border transition-all cursor-pointer select-none outline-none ${sizeClasses} ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/45 focus:border-primary focus:ring-2 focus:ring-primary/20'
        }`}
        style={{
          backgroundColor: 'var(--dropdown-bg)',
          color: 'var(--dropdown-text)',
          borderColor: isOpen ? 'var(--primary)' : 'var(--dropdown-border)'
        }}
      >
        <div className="flex items-center gap-2 truncate">
          {IconComponent && <IconComponent className="w-3.5 h-3.5 text-text-muted shrink-0" />}
          <span className={`truncate font-semibold ${!selectedOption ? 'text-text-muted font-normal' : ''}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 shrink-0 text-text-muted transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-primary' : ''
          }`}
        />
      </button>

      {/* Dropdown Options Popup Container */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            ref={listboxRef}
            role="listbox"
            tabIndex={-1}
            aria-label={ariaLabel || placeholder}
            className={`absolute left-0 right-0 top-full mt-1.5 z-[100] max-h-60 overflow-y-auto rounded-xl border p-1 backdrop-blur-xl custom-scrollbar ${dropdownClassName}`}
            style={{
              backgroundColor: 'var(--dropdown-bg)',
              borderColor: 'var(--dropdown-border)',
              boxShadow: 'var(--dropdown-shadow)'
            }}
          >
            {normalizedOptions.map((opt, index) => {
              const isSelected = opt.value === value;
              const isFocused = index === focusedIndex;
              const OptIcon = opt.icon;

              return (
                <div
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setFocusedIndex(index)}
                  onClick={() => handleSelectOption(opt.value)}
                  className={`flex items-center justify-between px-3 py-2 text-xs rounded-lg font-medium cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? 'font-bold border-l-2 border-primary'
                      : ''
                  }`}
                  style={{
                    backgroundColor: isSelected
                      ? 'var(--dropdown-selected)'
                      : isFocused
                      ? 'var(--dropdown-hover)'
                      : 'transparent',
                    color: isSelected ? 'var(--primary)' : 'var(--dropdown-text)'
                  }}
                >
                  <div className="flex items-center gap-2 truncate">
                    {OptIcon && <OptIcon className={`w-3.5 h-3.5 ${isSelected ? 'text-primary' : 'text-text-muted'}`} />}
                    <span className="truncate">{opt.label}</span>
                  </div>

                  {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0 ml-2" />}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomSelect;
