import React, { useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  searchTerm, 
  onSearchChange, 
  placeholder = "Search aquatic play equipment..." 
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    onSearchChange('');
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  // Auto-focus on mount for better UX
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus search when user presses '/' key
      if (e.key === '/' && !searchTerm) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      // Clear search when user presses Escape
      if (e.key === 'Escape' && searchTerm) {
        handleClear();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchTerm]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative group">
        {/* Search Icon */}
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
          <Search 
            className="h-6 w-6 transition-all duration-300"
            style={{ 
              color: searchTerm ? '#217cac' : '#8c8c8c',
              transform: searchTerm ? 'scale(1.1)' : 'scale(1)'
            }}
          />
        </div>
        
        {/* Main Input */}
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="
            w-full pl-16 pr-16 py-3 
            bg-white border-3 rounded-2xl
            text-gray-700 placeholder-gray-400
            font-raleway text-lg font-medium
            transition-all duration-300 ease-in-out
            focus:outline-none focus:ring-0
            shadow-xl hover:shadow-xl focus:shadow-xl
            transform hover:scale-[1.02] focus:scale-[1.02]
          "
          style={{
            borderColor: searchTerm ? '#217cac' : '#e5e7eb',
            borderWidth: '3px'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#217cac';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = searchTerm ? '#217cac' : '#e5e7eb';
          }}
        />
        
        {/* Clear Button */}
        {searchTerm && (
          <button
            onClick={handleClear}
            className="
              absolute inset-y-0 right-0 pr-5 
              flex items-center cursor-pointer z-10
              text-gray-400 hover:text-red-500
              transition-all duration-200
              transform hover:scale-110
            "
            aria-label="Clear search"
          >
            <X className="h-6 w-6" />
          </button>
        )}
      </div>
      
      {/* Search Status */}
      <div className="mt-4 text-center min-h-[24px]">
        {searchTerm && (
          <div className="flex items-center justify-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-raleway font-medium" style={{ color: '#217cac' }}>
                Searching for "{searchTerm}"
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;