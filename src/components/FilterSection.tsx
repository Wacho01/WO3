import React from 'react';
import FilterButton from './FilterButton';
import SearchBar from './SearchBar';
import { type Category } from '../lib/supabase';

interface FilterSectionProps {
  activeFilter: string;
  onFilterChange: (category: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  categories: Category[];
}

const FilterSection: React.FC<FilterSectionProps> = ({ 
  activeFilter, 
  onFilterChange,
  searchTerm,
  onSearchChange,
  categories
}) => {
  return (
    <div className="relative">
      {/* Filter Section with Dark Background */}
      <div className="relative py-12 h-40 bottom-8" style={{ backgroundColor: '#333333' }}>
        {/* Wave shape at bottom */}
        <div className="absolute bottom-0 w-full">
          <svg
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="relative block w-full h-[500px] bottom-0"
          >
            <path
              d="M600,112.77C268.63,112.77,0,65.52,0,7.23V120H1200V7.23C1200,65.52,931.37,112.77,600,112.77Z"
              fill="#f3f4f6"
            />
          </svg>
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-4">
          {/* Filter Buttons */}
          <div className="relative flex flex-wrap justify-center gap-2 md:gap-4 top-[-30px]">
            {categories.map((category) => (
              <FilterButton
                key={category.id}
                label={category.label}
                category={category.id}
                isActive={activeFilter === category.id}
                onClick={onFilterChange}
                disabled={category.disabled}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Search Bar Section - Positioned over the wave */}
      <div className="relative bg-gray-100 pt-8 pb-4">
        {/* Divider line matching original design */}
        <div className="flex justify-center mb-8 mt-[-30px]">
          <div className="w-4/5 h-1 rounded-full" style={{ backgroundColor: '#bbb' }}></div>
        </div>
        
        {/* Search Bar - Centered and prominent */}
        <div className="max-w-6xl mx-auto px-4">
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={onSearchChange}
            placeholder="Search aquatic play equipment..."
          />
        </div>
      </div>
    </div>
  );
};

export default FilterSection;