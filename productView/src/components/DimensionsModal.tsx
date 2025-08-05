import React from 'react';
import { X } from 'lucide-react';

interface DimensionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DimensionsModal: React.FC<DimensionsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      style={{ zIndex: 10001 }}
    >
      <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gray-900">
          <h2 className="text-2xl font-bold text-white">Model Dimensions</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            aria-label="Close dimensions modal"
          >
            <X size={24} className="text-gray-300" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] bg-gray-900">
          <div className="space-y-8">
            {/* Three Views in One Row */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {/* Front View */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-white mb-3 text-center">Front View</h3>
                <div className="flex justify-center">
                  <div className="bg-gray-700 border border-gray-600 rounded-lg p-2 shadow-sm">
                    <div 
                      className="relative border"
                      style={{ 
                        width: '280px',
                        height: '210px',
                        backgroundColor: '#374151',
                        backgroundImage: 'url("/textures/rhinoFront.svg")',
                        backgroundSize: 'contain',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center'
                      }}
                    >
                      {/* Dimensions and Title overlay */}
                      <svg width="280" height="210" viewBox="0 0 280 210" className="absolute inset-0" style={{ zIndex: 10 }}>
                        {/* Dimension lines and labels */}
                        <g stroke="#3b82f6" strokeWidth="0.9" fill="#3b82f6">
                          {/* Height dimension */}
                          <line x1="200" y1="35" x2="200" y2="175"/>
                          <line x1="195" y1="35" x2="205" y2="35"/>
                          <line x1="195" y1="175" x2="205" y2="175"/>
                          <text x="210" y="110" fontSize="8" textAnchor="start">6' 8"</text>
                          
                          {/* Width dimension */}
                          <line x1="89" y1="185" x2="178" y2="185"/>
                          <line x1="89" y1="190" x2="89" y2="180"/>
                          <line x1="178" y1="190" x2="178" y2="180"/>
                          <text x="135" y="195" fontSize="8" textAnchor="middle">4' 3"</text>
                        </g>
                        
                        {/* Title */}
                        {/* <text x="140" y="15" fontSize="12" fontWeight="bold" textAnchor="middle" fill="#e5e7eb">
                          FRONT VIEW
                        </text> */}
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top View */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-white mb-3 text-center">Top View</h3>
                <div className="flex justify-center">
                  <div className="bg-gray-700 border border-gray-600 rounded-lg p-2 shadow-sm">
                    <div 
                      className="relative border"
                      style={{ 
                        width: '280px',
                        height: '210px',
                        backgroundColor: '#374151',
                        backgroundImage: 'url("/textures/rhinoTop.svg")',
                        backgroundSize: 'contain',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center'
                      }}
                    >
                      {/* Dimensions and Title overlay */}
                      <svg width="280" height="210" viewBox="0 0 280 210" className="absolute inset-0" style={{ zIndex: 10 }}>
                        {/* Dimension lines and labels */}
                        <g stroke="#3b82f6" strokeWidth="0.9" fill="#3b82f6">
                          {/* Width dimension (length from top view) */}
                          <line x1="40" y1="170" x2="240" y2="170"/>
                          <line x1="40" y1="165" x2="40" y2="175"/>
                          <line x1="240" y1="165" x2="240" y2="175"/>
                          <text x="140" y="185" fontSize="8" textAnchor="middle">8' 10"</text>
                          
                          {/* Height dimension (width from top view) */}
                          <line x1="250" y1="50" x2="250" y2="150"/>
                          <line x1="245" y1="50" x2="255" y2="50"/>
                          <line x1="245" y1="150" x2="255" y2="150"/>
                          <text x="255" y="105" fontSize="8" textAnchor="start">4' 3"</text>
                        </g>
                        
                        {/* Title */}
                        {/* <text x="140" y="15" fontSize="12" fontWeight="bold" textAnchor="middle" fill="#e5e7eb">
                          TOP VIEW
                        </text> */}
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Side View */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-white mb-3 text-center">Side View</h3>
                <div className="flex justify-center">
                  <div className="bg-gray-700 border border-gray-600 rounded-lg p-2 shadow-sm">
                    <div 
                      className="relative border"
                      style={{ 
                        width: '280px',
                        height: '210px',
                        backgroundColor: '#374151',
                        backgroundImage: 'url("/textures/rhinoSide.svg")',
                        backgroundSize: 'contain',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center'
                      }}
                    >
                      {/* Dimensions and Title overlay */}
                      <svg width="280" height="210" viewBox="0 0 280 210" className="absolute inset-0" style={{ zIndex: 10 }}>
                        {/* Dimension lines and labels */}
                        <g stroke="#3b82f6" strokeWidth="0.9" fill="#3b82f6">
                          {/* Height dimension */}
                          <line x1="250" y1="30" x2="250" y2="180"/>
                          <line x1="245" y1="30" x2="255" y2="30"/>
                          <line x1="245" y1="180" x2="255" y2="180"/>
                          <text x="260" y="110" fontSize="8" textAnchor="start">6' 8"</text>
                          
                          {/* Length dimension */}
                          <line x1="40" y1="190" x2="240" y2="190"/>
                          <line x1="40" y1="185" x2="40" y2="195"/>
                          <line x1="240" y1="185" x2="240" y2="195"/>
                          <text x="140" y="205" fontSize="8" textAnchor="middle">8' 10"</text>
                        </g>
                        
                        {/* Title */}
                        {/* <text x="140" y="15" fontSize="12" fontWeight="bold" textAnchor="middle" fill="#e5e7eb">
                          SIDE VIEW
                        </text> */}
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Specifications Table */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Technical Specifications</h3>
              <div className="bg-gray-700 rounded-lg border border-gray-600 overflow-hidden">
                <table className="w-full">
                  <tbody className="divide-y divide-gray-600">
                    <tr>
                      <td className="px-6 py-4 font-medium text-white bg-gray-800">Overall Height</td>
                      <td className="px-6 py-4 text-gray-300">14'-3" (435 CM)</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium text-white bg-gray-800">Overall Length</td>
                      <td className="px-6 py-4 text-gray-300">10' (305 CM)</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium text-white bg-gray-800">Overall Width</td>
                      <td className="px-6 py-4 text-gray-300">5' (152 CM)</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium text-white bg-gray-800">Flow Requirements</td>
                      <td className="px-6 py-4 text-gray-300">40 - 100 GPM / 152-379 LPM</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium text-white bg-gray-800">Category</td>
                      <td className="px-6 py-4 text-gray-300">Fun Form Water Feature</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium text-white bg-gray-800">Material</td>
                      <td className="px-6 py-4 text-gray-300">Fiberglass Composite</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-700 px-6 py-4 bg-gray-900">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-400">
              © WATER ODYSSEY - All rights Reserved.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DimensionsModal;