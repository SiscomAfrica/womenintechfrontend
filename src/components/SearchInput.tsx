import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onSearch?: (query: string) => void;
  onClear?: () => void;
  debounceMs?: number;
  className?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

export function SearchInput({
  placeholder = "Search...",
  value: controlledValue,
  onSearch,
  onClear,
  debounceMs = 300,
  className,
  disabled = false,
  autoFocus = false,
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState(controlledValue || '');
  const [debouncedValue, setDebouncedValue] = useState(controlledValue || '');

  
  useEffect(() => {
    if (controlledValue !== undefined) {
      setInternalValue(controlledValue);
      setDebouncedValue(controlledValue);
    }
  }, [controlledValue]);

  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(internalValue);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [internalValue, debounceMs]);

  
  useEffect(() => {
    if (onSearch && (controlledValue === undefined || debouncedValue !== controlledValue)) {
      onSearch(debouncedValue);
    }
  }, [debouncedValue, onSearch, controlledValue]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
  }, []);

  const handleClear = useCallback(() => {
    setInternalValue('');
    setDebouncedValue('');
    onClear?.();
    onSearch?.('');
  }, [onClear, onSearch]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  }, [handleClear]);

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-tertiary pointer-events-none" />
        
        <Input
          type="text"
          placeholder={placeholder}
          value={internalValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          autoFocus={autoFocus}
          className={cn(
            "pl-10 pr-10 h-11 bg-bg-input border-border-medium text-body-md",
            "placeholder:text-text-placeholder",
            "focus:border-primary-orange focus:ring-2 focus:ring-primary-orange/20",
            "transition-all duration-200",
            internalValue && "pr-10"
          )}
        />

        {internalValue && (
          <button
            type="button"
            onClick={handleClear}
            disabled={disabled}
            className={cn(
              "absolute right-3 top-1/2 transform -translate-y-1/2",
              "h-6 w-6 rounded-full bg-bg-secondary hover:bg-border-light",
              "flex items-center justify-center transition-colors duration-200",
              "focus:outline-none focus:ring-2 focus:ring-primary-orange/50",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            aria-label="Clear search"
          >
            <X className="h-3 w-3 text-text-tertiary" />
          </button>
        )}
      </div>

      {}
      {internalValue !== debouncedValue && (
        <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
          <div className="h-4 w-4 border-2 border-primary-orange/30 border-t-primary-orange rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}