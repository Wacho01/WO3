import React from 'react';
import { Package, TrendingUp, Users, Filter } from 'lucide-react';

interface LoadingIndicatorProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'dashboard' | 'minimal' | 'pulse';
  message?: string;
  className?: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ 
  size = 'md', 
  variant = 'default',
  message = 'Loading...',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const containerSizes = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-12'
  };

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center justify-center ${containerSizes[size]} ${className}`}>
        <div className={`${sizeClasses[size]} relative`}>
          <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
          <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={`flex flex-col items-center justify-center ${containerSizes[size]} ${className}`}>
        <div className="flex space-x-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1.4s'
              }}
            ></div>
          ))}
        </div>
        {message && (
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 font-medium">
            {message}
          </p>
        )}
      </div>
    );
  }

  if (variant === 'dashboard') {
    return (
      <div className={`flex flex-col items-center justify-center min-h-[400px] ${className}`}>
        {/* Animated Dashboard Icons */}
        <div className="relative mb-8">
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Package, delay: '0s', color: 'text-blue-500' },
              { icon: TrendingUp, delay: '0.2s', color: 'text-green-500' },
              { icon: Users, delay: '0.4s', color: 'text-purple-500' },
              { icon: Filter, delay: '0.6s', color: 'text-orange-500' }
            ].map(({ icon: Icon, delay, color }, index) => (
              <div
                key={index}
                className={`w-12 h-12 rounded-lg bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center ${color} transform transition-all duration-1000`}
                style={{
                  animation: `dashboardFloat 2s ease-in-out infinite`,
                  animationDelay: delay
                }}
              >
                <Icon className="w-6 h-6" />
              </div>
            ))}
          </div>
          
          {/* Central Loading Spinner */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 border-4 border-gray-200 dark:border-gray-700 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Loading Dashboard
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
            {message}
          </p>
        </div>

        {/* Progress Dots */}
        <div className="flex space-x-2 mt-6">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-blue-600 rounded-full opacity-30"
              style={{
                animation: `progressDot 1.5s ease-in-out infinite`,
                animationDelay: `${i * 0.1}s`
              }}
            ></div>
          ))}
        </div>

        <style jsx>{`
          @keyframes dashboardFloat {
            0%, 100% { transform: translateY(0px) scale(1); }
            50% { transform: translateY(-10px) scale(1.05); }
          }
          
          @keyframes progressDot {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.2); }
          }
        `}</style>
      </div>
    );
  }

  // Default variant - Modern spinning loader with gradient
  return (
    <div className={`flex flex-col items-center justify-center ${containerSizes[size]} ${className}`}>
      <div className={`${sizeClasses[size]} relative`}>
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
        
        {/* Animated gradient ring */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 animate-spin"
             style={{
               background: 'conic-gradient(from 0deg, #3b82f6, #8b5cf6, #3b82f6)',
               borderRadius: '50%',
               mask: 'radial-gradient(circle, transparent 50%, black 50%)',
               WebkitMask: 'radial-gradient(circle, transparent 50%, black 50%)'
             }}>
        </div>
        
        {/* Inner glow effect */}
        <div className="absolute inset-2 rounded-full bg-white dark:bg-gray-900 shadow-inner"></div>
        
        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
        </div>
      </div>
      
      {message && (
        <div className="mt-4 text-center">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {message}
          </p>
          <div className="mt-2 flex justify-center space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1 h-1 bg-blue-600 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.1}s` }}
              ></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoadingIndicator;