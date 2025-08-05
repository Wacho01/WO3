import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  onRetry, 
  className = '' 
}) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="mb-4">
        <AlertCircle className="mx-auto h-16 w-16 text-red-500" />
      </div>
      <h3 className="text-xl font-raleway font-semibold mb-3 text-red-600">
        Something went wrong
      </h3>
      <p className="text-lg font-raleway mb-6 text-gray-600">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center space-x-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 font-raleway font-medium"
        >
          <RefreshCw className="h-5 w-5" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;