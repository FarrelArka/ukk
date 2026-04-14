'use client';

import { useState, useRef, useEffect } from 'react';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  disabledDates: string[]; // array of 'YYYY-MM-DD' strings
  placeholder?: string;
  id?: string;
  name?: string;
  minDate?: string; // 'YYYY-MM-DD'
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function formatDate(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

const DatePicker = ({ value, onChange, disabledDates, placeholder = 'Select date', id, name, minDate }: DatePickerProps) => {
  const today = new Date();
  const [isOpen, setIsOpen] = useState(false);
  const [viewYear, setViewYear] = useState(value ? parseInt(value.slice(0, 4)) : today.getFullYear());
  const [viewMonth, setViewMonth] = useState(value ? parseInt(value.slice(5, 7)) - 1 : today.getMonth());
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const disabledSet = new Set(disabledDates);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate());

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleSelect = (day: number) => {
    const dateStr = formatDate(viewYear, viewMonth, day);
    if (disabledSet.has(dateStr)) return;
    if (minDate && dateStr < minDate) return;
    onChange(dateStr);
    setIsOpen(false);
  };

  const displayValue = value
    ? new Date(value + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : '';

  // Build day cells
  const cells: React.ReactNode[] = [];
  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    cells.push(<div key={`empty-${i}`} className="datepicker-cell datepicker-cell--empty" />);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = formatDate(viewYear, viewMonth, day);
    const isDisabled = disabledSet.has(dateStr) || (minDate ? dateStr < minDate : dateStr < todayStr);
    const isSelected = dateStr === value;
    const isToday = dateStr === todayStr;

    let className = 'datepicker-cell datepicker-cell--day';
    if (isDisabled) className += ' datepicker-cell--disabled';
    if (isSelected) className += ' datepicker-cell--selected';
    if (isToday && !isSelected) className += ' datepicker-cell--today';

    cells.push(
      <div
        key={day}
        className={className}
        onClick={() => !isDisabled && handleSelect(day)}
        title={isDisabled && disabledSet.has(dateStr) ? 'Tanggal ini sudah di-booking' : undefined}
      >
        {day}
      </div>
    );
  }

  return (
    <div className="datepicker-wrapper" ref={containerRef}>
      {/* Input display */}
      <div
        className="datepicker-input"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={displayValue ? 'datepicker-input__value' : 'datepicker-input__placeholder'}>
          {displayValue || placeholder}
        </span>
        <svg className="datepicker-input__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </div>

      {/* Hidden native input for form compatibility */}
      <input type="hidden" name={name} id={id} value={value} />

      {/* Calendar dropdown */}
      {isOpen && (
        <div className="datepicker-dropdown">
          {/* Header */}
          <div className="datepicker-header">
            <button type="button" className="datepicker-nav-btn" onClick={prevMonth}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <span className="datepicker-header__title">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button type="button" className="datepicker-nav-btn" onClick={nextMonth}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>

          {/* Day names */}
          <div className="datepicker-grid">
            {DAYS.map(d => (
              <div key={d} className="datepicker-cell datepicker-cell--header">{d}</div>
            ))}
            {cells}
          </div>

          {/* Legend */}
          <div className="datepicker-legend">
            <span className="datepicker-legend__item">
              <span className="datepicker-legend__dot datepicker-legend__dot--booked" />
              Sudah di-booking
            </span>
          </div>
        </div>
      )}

      <style jsx>{`
        .datepicker-wrapper {
          position: relative;
          width: 100%;
        }
        .datepicker-input {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 24px;
          border: 1px solid rgba(0,0,0,0.1);
          border-radius: 9999px;
          cursor: pointer;
          background: transparent;
          transition: border-color 0.2s;
          user-select: none;
        }
        :global(.dark) .datepicker-input {
          border-color: rgba(255,255,255,0.1);
        }
        .datepicker-input:hover {
          border-color: rgba(0,0,0,0.25);
        }
        :global(.dark) .datepicker-input:hover {
          border-color: rgba(255,255,255,0.25);
        }
        .datepicker-input__value {
          color: #000;
          font-size: 15px;
        }
        :global(.dark) .datepicker-input__value {
          color: #fff;
        }
        .datepicker-input__placeholder {
          color: rgba(0,0,0,0.4);
          font-size: 15px;
        }
        :global(.dark) .datepicker-input__placeholder {
          color: rgba(255,255,255,0.4);
        }
        .datepicker-input__icon {
          width: 20px;
          height: 20px;
          color: rgba(0,0,0,0.4);
          flex-shrink: 0;
        }
        :global(.dark) .datepicker-input__icon {
          color: rgba(255,255,255,0.4);
        }
        .datepicker-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          z-index: 50;
          background: #fff;
          border: 1px solid rgba(0,0,0,0.1);
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.15);
          padding: 16px;
          min-width: 310px;
          animation: datepicker-fadein 0.15s ease;
        }
        :global(.dark) .datepicker-dropdown {
          background: #1a1a2e;
          border-color: rgba(255,255,255,0.1);
          box-shadow: 0 20px 60px rgba(0,0,0,0.4);
        }
        @keyframes datepicker-fadein {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .datepicker-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .datepicker-header__title {
          font-weight: 600;
          font-size: 15px;
          color: #000;
        }
        :global(.dark) .datepicker-header__title {
          color: #fff;
        }
        .datepicker-nav-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: rgba(0,0,0,0.05);
          border-radius: 8px;
          cursor: pointer;
          color: #000;
          transition: background 0.2s;
        }
        :global(.dark) .datepicker-nav-btn {
          background: rgba(255,255,255,0.08);
          color: #fff;
        }
        .datepicker-nav-btn:hover {
          background: rgba(0,0,0,0.1);
        }
        :global(.dark) .datepicker-nav-btn:hover {
          background: rgba(255,255,255,0.15);
        }
        .datepicker-nav-btn svg {
          width: 16px;
          height: 16px;
        }
        .datepicker-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 2px;
        }
        .datepicker-cell {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 36px;
          font-size: 13px;
          border-radius: 8px;
          user-select: none;
        }
        .datepicker-cell--header {
          font-weight: 600;
          font-size: 11px;
          color: rgba(0,0,0,0.4);
          text-transform: uppercase;
        }
        :global(.dark) .datepicker-cell--header {
          color: rgba(255,255,255,0.4);
        }
        .datepicker-cell--empty {
          pointer-events: none;
        }
        .datepicker-cell--day {
          cursor: pointer;
          color: #000;
          font-weight: 500;
          transition: all 0.15s;
        }
        :global(.dark) .datepicker-cell--day {
          color: #fff;
        }
        .datepicker-cell--day:hover:not(.datepicker-cell--disabled):not(.datepicker-cell--selected) {
          background: rgba(0,0,0,0.06);
        }
        :global(.dark) .datepicker-cell--day:hover:not(.datepicker-cell--disabled):not(.datepicker-cell--selected) {
          background: rgba(255,255,255,0.08);
        }
        .datepicker-cell--disabled {
          color: rgba(0,0,0,0.2) !important;
          background: rgba(0,0,0,0.04);
          cursor: not-allowed !important;
          text-decoration: line-through;
          pointer-events: auto;
        }
        :global(.dark) .datepicker-cell--disabled {
          color: rgba(255,255,255,0.2) !important;
          background: rgba(255,255,255,0.04);
        }
        .datepicker-cell--selected {
          background: #2563eb !important;
          color: #fff !important;
          font-weight: 700;
        }
        .datepicker-cell--today {
          border: 2px solid #2563eb;
          font-weight: 700;
        }
        .datepicker-legend {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 12px;
          padding-top: 10px;
          border-top: 1px solid rgba(0,0,0,0.06);
        }
        :global(.dark) .datepicker-legend {
          border-top-color: rgba(255,255,255,0.06);
        }
        .datepicker-legend__item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: rgba(0,0,0,0.5);
        }
        :global(.dark) .datepicker-legend__item {
          color: rgba(255,255,255,0.5);
        }
        .datepicker-legend__dot {
          width: 10px;
          height: 10px;
          border-radius: 3px;
        }
        .datepicker-legend__dot--booked {
          background: rgba(0,0,0,0.08);
          border: 1px solid rgba(0,0,0,0.15);
          position: relative;
        }
        :global(.dark) .datepicker-legend__dot--booked {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.15);
        }
        .datepicker-legend__dot--booked::after {
          content: '';
          position: absolute;
          top: 50%;
          left: -1px;
          right: -1px;
          height: 1px;
          background: rgba(0,0,0,0.3);
          transform: rotate(-45deg);
        }
        :global(.dark) .datepicker-legend__dot--booked::after {
          background: rgba(255,255,255,0.3);
        }
      `}</style>
    </div>
  );
};

export default DatePicker;
