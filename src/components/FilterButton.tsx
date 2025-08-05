import React from 'react';

interface FilterButtonProps {
  label: string;
  category: string;
  isActive: boolean;
  onClick: (category: string) => void;
  disabled?: boolean;
}

const FilterButton: React.FC<FilterButtonProps> = ({ 
  label, 
  category, 
  isActive, 
  onClick, 
  disabled = false 
}) => {
  return (
    <button
      onClick={() => !disabled && onClick(category)}
      disabled={disabled}
      className={`
        relative flex flex-col items-center justify-start
        w-20 h-32 text-xs font-light uppercase
        border border-black rounded-md transition-all duration-300
        font-raleway
        ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
      `}
      style={{
        backgroundColor: isActive ? '#181818' : '#2a9cd7',
        color: 'white'
      }}
      onMouseEnter={(e) => {
        if (!disabled && !isActive) {
          e.currentTarget.style.backgroundColor = '#181818';
          e.currentTarget.style.opacity = '0.8';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !isActive) {
          e.currentTarget.style.backgroundColor = '#2a9cd7';
          e.currentTarget.style.opacity = '1';
        }
      }}
    >
      <span className="text-center px-1 leading-tight pt-3">{label}</span>
      {isActive && (
        <img 
          src="/src/assets/wologo_w.png" 
          alt="WO Logo" 
          className="absolute bottom-0 right-1 w-18 h-14 object-cover" 
        />
      )}
    </button>
  );
};

export default FilterButton;