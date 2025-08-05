import React, { useState } from 'react';
import { Settings, Palette, Play, Square, Eye, Download, Menu, X } from 'lucide-react';
import { ProductConfig } from '../config/productConfig';
import ConfigurableDimensionsModal from './ConfigurableDimensionsModal';

interface ConfigurableControlPanelProps {
  config: ProductConfig;
  onPlayAnimation: () => void;
  onStopAnimation: () => void;
  onColorChange: (color: string, part?: string, colorObj?: any) => void;
  onPartSelect: (part: string) => void;
}

const ConfigurableControlPanel: React.FC<ConfigurableControlPanelProps> = ({
  config,
  onPlayAnimation,
  onStopAnimation,
  onColorChange,
  onPartSelect
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState(config.customization.parts[0]?.name || 'bucket1');
  const [selectedTexture, setSelectedTexture] = useState('');
  const [isDimensionsModalOpen, setIsDimensionsModalOpen] = useState(false);

  const handlePartSelect = (part: string) => {
    setSelectedPart(part);
    onPartSelect(part);
  };

  const handleColorChange = (color: string) => {
    const colorObj = config.customization.colors.find(c => c.value === color);
    
    if (colorObj) {
      setSelectedTexture(colorObj.name || 'Solid Color');
    }
    
    console.log('=== COLOR CHANGE REQUESTED ===', {
      color,
      selectedPart,
      colorObj,
      type: colorObj?.type,
      texture: colorObj?.texture,
      name: colorObj?.name
    });
    
    if (colorObj) {
      onColorChange(color, selectedPart, colorObj);
    } else {
      console.error('❌ Color object not found for:', color);
      onColorChange(color, selectedPart);
    }
  };

  // Filter colors based on selected part and configuration
  const getFilteredColors = () => {
    if (selectedPart === 'handler1') { // ROCK
      return config.customization.colors.filter(color => 
        color.name && (color.name === 'ROCK1' || color.name === 'ROCK2')
      );
    }
    if (selectedPart === 'bucket1') { // RHINO
      return config.customization.colors.filter(color => 
        color.name && (color.name === 'COLOR2' || color.name === 'COLOR3')
      );
    }
    if (selectedPart === 'handler3') { // FLOOR
      return config.customization.colors.filter(color => 
        color.name && (color.name === 'GRASS1' || color.name === 'GRASS2')
      );
    }
    return config.customization.colors; // Show all colors for other parts
  };

  const filteredColors = getFilteredColors();

  const handleShowDimensions = () => {
    setIsDimensionsModalOpen(true);
  };

  const handleDownloadResource = (url: string) => {
    window.open(url, '_blank');
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-6 right-6 bg-gray-800 bg-opacity-70 text-white px-2 py-1 rounded shadow-lg hover:bg-gray-800 hover:bg-opacity-100 transition-all flex items-center space-x-1 backdrop-blur-sm border border-gray-600 border-opacity-40"
        style={{ zIndex: 10000 }}
      >
        {isOpen ? <X size={14} /> : <Menu size={14} />}
        <span className="text-xs font-medium uppercase">
          {isOpen ? 'Close' : 'Open'}
        </span>
      </button>

      {/* Control Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-80 bg-gray-900 text-white transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ zIndex: 1000 }}
      >
        <div className="p-6 h-full overflow-y-auto">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-2">{config.product.name}</h2>
            <p className="text-gray-400 text-sm">{config.product.category} - {config.product.subcategory}</p>
            <p className="text-gray-500 text-xs mt-1">{config.product.description}</p>
          </div>

          {/* Animation Controls */}
          {config.particles.enabled && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Settings className="mr-2" size={18} />
                Effects Control
              </h3>
              <div className="flex space-x-3">
                <button
                  onClick={onPlayAnimation}
                  className="flex-1 bg-green-600 hover:bg-green-700 px-4 py-2 rounded flex items-center justify-center transition-colors font-semibold text-sm"
                >
                  <Play className="mr-2" size={16} />
                  START
                </button>
                <button
                  onClick={onStopAnimation}
                  className="flex-1 bg-red-600 hover:bg-red-700 px-4 py-2 rounded flex items-center justify-center transition-colors font-semibold text-sm"
                >
                  <Square className="mr-2" size={16} />
                  STOP
                </button>
              </div>
            </div>
          )}

          {/* Resources Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Settings className="mr-2" size={18} />
              Resources
            </h3>
          </div>

          {/* Resource Actions */}
          <div className="mb-8">
            <div className="space-y-3">
              <button 
                onClick={handleShowDimensions}
                className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded flex items-center justify-center transition-colors text-sm font-medium uppercase"
              >
                <Eye className="mr-2" size={16} />
                Show Dimensions
              </button>
              {config.resources.downloadLinks.map((link, index) => (
                <button 
                  key={index}
                  onClick={() => handleDownloadResource(link.url)}
                  className="w-full bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded flex items-center justify-center transition-colors text-sm font-medium uppercase"
                >
                  <Download className="mr-2" size={16} />
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          {/* Colors Section */}
          {config.customization.parts.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Palette className="mr-2" size={18} />
                Customization
              </h3>
              
              {/* Two Column Layout */}
              <div className="flex space-x-4">
                {/* Left Column - Parts Selection */}
                <div className="flex-1">
                  <div className="text-center text-xs font-semibold text-gray-400 mb-3 uppercase">
                    Parts
                  </div>
                  <div className="space-y-2">
                    {config.customization.parts.map((part) => (
                      <button
                        key={part.name}
                        onClick={() => handlePartSelect(part.name)}
                        className={`w-full px-3 py-2 rounded text-xs font-medium transition-colors ${
                          selectedPart === part.name
                            ? 'bg-blue-600 text-white border border-blue-400'
                            : 'bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600'
                        }`}
                      >
                        {part.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right Column - Color Swatches */}
                <div className="flex-1">
                  <div className="text-center text-xs font-semibold text-gray-400 mb-3 uppercase">
                    Colors
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {filteredColors.map((color, index) => (
                      <button
                        key={index}
                        onClick={() => handleColorChange(color.value)}
                        className="rounded border border-gray-600 hover:border-white transition-all hover:scale-110 transform relative overflow-hidden"
                        style={{ 
                          backgroundColor: color.type === 'color' ? color.value : '#666',
                          backgroundImage: color.type === 'texture' ? `url("${color.texture}")` : 'none',
                          backgroundSize: color.type === 'texture' ? 'cover' : 'auto',
                          backgroundRepeat: color.type === 'texture' ? 'repeat' : 'no-repeat',
                          backgroundPosition: color.type === 'texture' ? 'center' : 'initial',
                          width: '1.6rem',
                          height: '1.6rem'
                        }}
                        title={color.name}
                      >
                        {color.type === 'texture' && (
                          <div className="absolute inset-0 bg-black bg-opacity-20 hover:bg-opacity-10 transition-all"></div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Selected Part Indicator */}
              <div className="mt-3 text-xs text-gray-400 bg-gray-800 bg-opacity-50 px-3 py-2 rounded border border-gray-700">
                Selected part: <span className="text-white font-medium">
                  {config.customization.parts.find(p => p.name === selectedPart)?.label}
                </span>
                {selectedTexture && (
                  <>
                    <span className="text-gray-400 mx-2">|</span>
                    <span className="text-cyan-400 font-medium">
                      {selectedTexture}
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Specifications */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Specifications</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-400">Dimensions:</span>
                <div className="text-white">
                  H: {config.specifications.dimensions.height} | 
                  W: {config.specifications.dimensions.width} | 
                  L: {config.specifications.dimensions.length}
                </div>
              </div>
              {config.specifications.technical.map((spec, index) => (
                <div key={index}>
                  <span className="text-gray-400">{spec.label}:</span>
                  <div className="text-white">{spec.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-8 pt-4 border-t border-gray-700 text-xs text-gray-500 text-center">
            © WATER ODYSSEY - All rights Reserved.
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          onClick={handleOverlayClick}
          className="fixed inset-0 bg-black bg-opacity-50 pointer-events-none"
          style={{ zIndex: 999 }}
        />
      )}

      {/* Dimensions Modal */}
      <ConfigurableDimensionsModal 
        config={config}
        isOpen={isDimensionsModalOpen}
        onClose={() => setIsDimensionsModalOpen(false)}
      />
    </>
  );
};

export default ConfigurableControlPanel;