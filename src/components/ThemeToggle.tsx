import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className = '', 
  size = 'md',
  showLabel = false 
}) => {
  const { isDark, toggleTheme } = useTheme();

  const sizeClasses = {
    sm: 'w-12 h-6',
    md: 'w-14 h-7',
    lg: 'w-16 h-8'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const circleSize = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7'
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {showLabel && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {isDark ? 'Dark' : 'Light'}
        </span>
      )}
      
      <button
        onClick={toggleTheme}
        className={`
          relative inline-flex items-center ${sizeClasses[size]} 
          rounded-full transition-all duration-300 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
          dark:focus:ring-offset-gray-800
          ${isDark 
            ? 'bg-gradient-to-r from-slate-700 to-slate-800 shadow-inner border border-slate-600' 
            : 'bg-gradient-to-r from-blue-400 to-blue-500 shadow-lg border border-blue-300'
          }
          hover:shadow-xl transform hover:scale-105 active:scale-95
        `}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      >
        {/* Toggle Circle */}
        <div
          className={`
            absolute top-0.5 flex items-center justify-center
            ${circleSize[size]}
            bg-white rounded-full shadow-lg
            transition-all duration-300 ease-in-out
            ${isDark ? 'translate-x-7' : 'translate-x-0.5'}
            ${size === 'lg' ? (isDark ? 'translate-x-8' : 'translate-x-0.5') : ''}
            ${size === 'sm' ? (isDark ? 'translate-x-6' : 'translate-x-0.5') : ''}
          `}
        >
          {/* Icon with smooth transition */}
          <div className="relative">
            <Sun 
              className={`
                ${iconSizes[size]} text-amber-500 absolute inset-0
                transition-all duration-300 ease-in-out
                ${isDark ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'}
              `}
            />
            <Moon 
              className={`
                ${iconSizes[size]} text-slate-700 absolute inset-0
                transition-all duration-300 ease-in-out
                ${isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'}
              `}
            />
          </div>
        </div>

        {/* Background Icons */}
        <div className="absolute inset-0 flex items-center justify-between px-1.5">
          <Sun 
            className={`
              ${iconSizes[size]} text-white/70
              transition-all duration-300 ease-in-out
              ${isDark ? 'opacity-30 scale-75' : 'opacity-100 scale-100'}
            `}
          />
          <Moon 
            className={`
              ${iconSizes[size]} text-white/70
              transition-all duration-300 ease-in-out
              ${isDark ? 'opacity-100 scale-100' : 'opacity-30 scale-75'}
            `}
          />
        </div>
      </button>
    </div>
  );
};

export default ThemeToggle;