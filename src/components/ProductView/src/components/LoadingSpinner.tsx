import React from 'react';

interface LoadingSpinnerProps {
  progress?: number;
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  progress = 0, 
  message = 'Loading Scene...' 
}) => {
  return (
    <div 
      className="absolute inset-0 flex items-center justify-center bg-gray-100"
      style={{ zIndex: 10002 }}
    >
      <div className="relative flex flex-col items-center">
        {/* Enhanced loading spinner with water effect */}
        <div className="relative w-24 h-24 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full overflow-hidden shadow-2xl">
          {/* Water wave animation */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-300 to-white opacity-40 rounded-full animate-spin"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white to-transparent opacity-30 rounded-full animate-bounce"></div>
          
          {/* Progress indicator */}
          {progress > 0 && (
            <div className="absolute inset-2 border-2 border-white rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">{Math.round(progress)}%</span>
            </div>
          )}
        </div>
        
        {/* Loading message */}
        <p className="mt-4 text-gray-600 text-center font-medium">
          {message}
        </p>
        
        {/* Progress bar */}
        {progress > 0 && (
          <div className="mt-3 w-64 bg-gray-300 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-cyan-400 to-cyan-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}
        
        {/* Loading tips */}
        <div className="mt-4 text-xs text-gray-500 text-center max-w-xs">
          {progress === 0 && "Initializing 3D environment..."}
          {progress > 0 && progress < 30 && "Loading model geometry..."}
          {progress >= 30 && progress < 70 && "Processing textures..."}
          {progress >= 70 && progress < 100 && "Optimizing for display..."}
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;