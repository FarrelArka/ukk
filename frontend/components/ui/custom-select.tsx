'use client';

import * as React from "react";
import { Icon } from '@iconify/react';
import { cn } from "@/lib/utils";

export interface Option {
  label: string;
  value: string;
}

interface CustomSelectProps {
  name?: string;
  value?: string;
  onChange?: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function CustomSelect({
  name,
  value,
  onChange,
  options,
  placeholder = "Select option",
  className,
  disabled = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (optionValue: string) => {
      if (onChange) {
          onChange(optionValue);
      }
      setIsOpen(false);
  }

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      {/* Hidden input for form submission */}
      <input type="hidden" name={name} value={value} />

      {/* Trigger Button */}
      <div
        className={cn(
            "flex items-center justify-between cursor-pointer",
            "px-6 py-3.5 border border-black/10 dark:border-white/10 rounded-full",
            "bg-transparent text-black dark:text-white",
            "transition-all duration-200",
            isOpen ? "border-primary dark:border-primary ring-1 ring-primary" : "hover:border-primary/50",
             disabled ? "opacity-50 cursor-not-allowed" : ""
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        tabIndex={0}
      >
        <span className={cn(
            "truncate",
            !selectedOption ? "text-black/50 dark:text-white/50" : ""
        )}>
           {selectedOption ? selectedOption.label : placeholder}
        </span>
        <Icon
            icon="ph:caret-down"
            width={20}
            height={20}
            className={cn(
                "text-black/50 dark:text-white/50 transition-transform duration-300",
                isOpen ? "rotate-180" : ""
            )}
        />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 overflow-hidden bg-white/95 dark:bg-black/95 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-2xl shadow-xl animate-in fade-in zoom-in-95 duration-200">
           <div className="max-h-60 overflow-y-auto py-2 custom-scrollbar">
             {options.map((option) => (
               <div
                 key={option.value}
                 className={cn(
                   "px-6 py-2.5 cursor-pointer text-base transition-colors",
                   "hover:bg-primary/10 dark:hover:bg-primary/20",
                   option.value === value ? "bg-primary/5 text-primary font-medium" : "text-black dark:text-white"
                 )}
                 onClick={() => handleSelect(option.value)}
               >
                 {option.label}
               </div>
             ))}
             {options.length === 0 && (
                <div className="px-6 py-3 text-black/50 dark:text-white/50 text-center text-sm">No options</div>
             )}
           </div>
        </div>
      )}
    </div>
  );
}
