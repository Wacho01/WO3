import React from 'react';
import { X } from 'lucide-react';
import { ProductConfig } from '../config/productConfig';

interface ConfigurableDimensionsModalProps {
  config: ProductConfig;
  isOpen: boolean;
  onClose: () => void;
}

const ConfigurableDimensionsModal: React.FC<ConfigurableDimensionsModalProps> = ({ 
  config, 
  isOpen, 
  onClose 
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      style={{ zIndex: 10001 }}
    >
      <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gray-900">
          <h2 className="text-2xl font-bold text-white">{config.product.name} - Dimensions</h2>
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
              {config.resources.dimensionViews.front && (
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
                          backgroundImage: `url("${config.resources.dimensionViews.front}")`,
                          backgroundSize: 'contain',
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'center'
                        }}
                      >
                        {/* Dimension overlay can be added here */}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Top View */}
              {config.resources.dimensionViews.top && (
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
                          backgroundImage: `url("${config.resources.dimensionViews.top}")`,
                          backgroundSize: 'contain',
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'center'
                        }}
                      >
                        {/* Dimension overlay can be added here */}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Side View */}
              {config.resources.dimensionViews.side && (
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
                          backgroundImage: `url("${config.resources.dimensionViews.side}")`,
                          backgroundSize: 'contain',
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'center'
                        }}
                      >
                        {/* Dimension overlay can be added here */}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Specifications Table */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Technical Specifications</h3>
              <div className="bg-gray-700 rounded-lg border border-gray-600 overflow-hidden">
                <table className="w-full">
                  <tbody className="divide-y divide-gray-600">
                    <tr>
                      <td className="px-6 py-4 font-medium text-white bg-gray-800">Overall Height</td>
                      <td className="px-6 py-4 text-gray-300">{config.specifications.dimensions.height}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium text-white bg-gray-800">Overall Width</td>
                      <td className="px-6 py-4 text-gray-300">{config.specifications.dimensions.width}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-medium text-white bg-gray-800">Overall Length</td>
                      <td className="px-6 py-4 text-gray-300">{config.specifications.dimensions.length}</td>
                    </tr>
                    {config.specifications.technical.map((spec, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 font-medium text-white bg-gray-800">{spec.label}</td>
                        <td className="px-6 py-4 text-gray-300">{spec.value}</td>
                      </tr>
                    ))}
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

export default ConfigurableDimensionsModal;