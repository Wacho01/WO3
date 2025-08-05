import React from 'react';

interface StatsLoadingSkeletonProps {
  count?: number;
  className?: string;
}

const StatsLoadingSkeleton: React.FC<StatsLoadingSkeletonProps> = ({ 
  count = 4, 
  className = '' 
}) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="flex items-center">
            {/* Icon placeholder */}
            <div className="p-3 rounded-lg bg-gradient-to-br from-blue-200 to-blue-300 dark:from-blue-800 dark:to-blue-700 relative overflow-hidden">
              <div className="h-6 w-6 bg-white/30 rounded"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer"></div>
            </div>
            
            {/* Content */}
            <div className="ml-4 space-y-2 flex-1">
              {/* Label */}
              <div className="h-4 w-20 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-md relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer"></div>
              </div>
              
              {/* Value */}
              <div className="h-6 w-12 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500 rounded-md relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default StatsLoadingSkeleton;