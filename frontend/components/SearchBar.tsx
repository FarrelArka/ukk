'use client';

import { Search, X } from 'lucide-react';
import { memo } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

const SearchBar = memo(function SearchBar({ 
  value, 
  onChange, 
  placeholder 
}: SearchBarProps) {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white shadow-sm hover:shadow-md text-black placeholder-gray-400"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
});

export default SearchBar;
