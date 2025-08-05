import React, { useState } from 'react';
import { Settings, Palette, Play, Square, Eye, Download, Menu, X } from 'lucide-react';
import DimensionsModal from './DimensionsModal';

interface ControlPanelProps {
  onPlayAnimation: () => void;
  onStopAnimation: () => void;
  onColorChange: (color: string, part?: string, colorObj?: any) => void;
  onPartSelect: (part: string) => void;
}

// Preload all texture images to eliminate delay
const preloadTextures = () => {
  const textureUrls = [
    '/textures/COLOR2.jpg',
    '/textures/COLOR3.jpg',
    '/textures/rhinotexture3.jpg',
    '/textures/rhinotexture4.jpg',
    '/textures/RHINO_GRASS5.jpg',
    '/textures/RHINO_GRASS6.jpg'
  ];

  textureUrls.forEach(url => {
    const img = new Image();
    img.src = url;
    // Preload in background without blocking
    img.onload = () => {
      console.log(`✅ PRELOAD SUCCESS: ${url}`);
      console.log(`Image dimensions: ${img.width}x${img.height}`);
    };
    img.onerror = (error) => {
      console.error(`❌ PRELOAD FAILED: ${url}`, error);
      console.error(`Full URL: ${window.location.origin}${url}`);
      
      // Try alternative paths
      const altPaths = [
        `/public${url}`,
        url.replace('/textures/', '/img/'),
        url.replace('.jpg', '.png'),
        url.toLowerCase()
      ];
      
      console.log('Trying alternative paths:', altPaths);
      altPaths.forEach(altPath => {
        const testImg = new Image();
        testImg.onload = () => console.log(`✅ FOUND AT: ${altPath}`);
        testImg.onerror = () => console.log(`❌ NOT FOUND: ${altPath}`);
        testImg.src = altPath;
      });
    };
  });
};

// Initialize preloading immediately
preloadTextures();

const ControlPanel: React.FC<ControlPanelProps> = ({
  onPlayAnimation,
  onStopAnimation,
  onColorChange,
  onPartSelect
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState('bucket1');
  const [selectedTexture, setSelectedTexture] = useState('');
  const [isDimensionsModalOpen, setIsDimensionsModalOpen] = useState(false);

  const colors = [
    // Solid Colors
    { name: 'Coral', value: '#D60000', type: 'color' },
    { name: 'Daffodil', value: '#E8F300', type: 'color' },
    { name: 'Sky', value: '#00E4F3', type: 'color' },
    { name: 'Sea Foam', value: '#00C7D4', type: 'color' },
    { name: 'Teal', value: '#00A1D4', type: 'color' },
    { name: 'Avocado', value: '#8FDA4D', type: 'color' },
    { name: 'Green', value: '#19BA1B', type: 'color' },
    { name: 'Evergreen', value: '#759C53', type: 'color' },
    
    // Rhino Texture Variations
    { 
      // name: 'Rhino Original', 
      // value: 'rhino_original',
      // type: 'texture',
      // texture: 'data:image/svg+xml;base64,' + btoa(`
      //   <svg width="128" height="128" xmlns="http://www.w3.org/2000/svg">
      //     <defs>
      //       <pattern id="rhino" patternUnits="userSpaceOnUse" width="16" height="16">
      //         <rect width="16" height="16" fill="#4a4a4a"/>
      //         <circle cx="8" cy="8" r="4" fill="#6a6a6a"/>
      //       </pattern>
      //     </defs>
      //     <rect width="128" height="128" fill="url(#rhino)"/>
      //   </svg>
      // `),
      // shininess: 60
    },
    { 
      // name: 'Rhino Weathered', 
      // value: 'rhino_weathered',
      // type: 'texture',
      // texture: 'data:image/svg+xml;base64,' + btoa(`
      //   <svg width="128" height="128" xmlns="http://www.w3.org/2000/svg">
      //     <defs>
      //       <pattern id="rhino_weathered" patternUnits="userSpaceOnUse" width="16" height="16">
      //         <rect width="16" height="16" fill="#3a3a3a"/>
      //         <circle cx="8" cy="8" r="4" fill="#5a5a5a" opacity="0.7"/>
      //         <rect x="4" y="4" width="8" height="8" fill="#2a2a2a" opacity="0.3"/>
      //       </pattern>
      //     </defs>
      //     <rect width="128" height="128" fill="url(#rhino_weathered)"/>
      //   </svg>
      // `),
      // shininess: 30
    },
    
    // Rock Texture Variations
    { 
      name: 'ROCK1', 
      value: 'ROCK1_texture',
      type: 'texture',
      texture: '/textures/rhinotexture3.jpg',
      shininess: 20,
      uvwMapping: true
      // name: 'Rock Natural', 
      // value: 'rock_natural',
      // type: 'texture',
      // texture: 'data:image/svg+xml;base64,' + btoa(`
      //   <svg width="128" height="128" xmlns="http://www.w3.org/2000/svg">
      //     <defs>
      //       <pattern id="rock" patternUnits="userSpaceOnUse" width="24" height="24">
      //         <rect width="24" height="24" fill="#8b7355"/>
      //         <polygon points="0,0 12,6 24,0 24,12 12,18 0,12" fill="#a0845c" opacity="0.8"/>
      //         <circle cx="12" cy="12" r="2" fill="#6b5d4f"/>
      //       </pattern>
      //     </defs>
      //     <rect width="128" height="128" fill="url(#rock)"/>
      //   </svg>
      // `),
      // shininess: 10
    },
    { 
      name: 'ROCK2', 
      value: 'ROCK2_texture',
      type: 'texture',
      texture: '/textures/rhinotexture4.jpg',
      shininess: 20,
      uvwMapping: true
    },
    { 
      // name: 'Rock Eroded', 
      // value: 'rock_eroded',
      // type: 'texture',
      // texture: 'data:image/svg+xml;base64,' + btoa(`
      //   <svg width="128" height="128" xmlns="http://www.w3.org/2000/svg">
      //     <defs>
      //       <pattern id="rock_eroded" patternUnits="userSpaceOnUse" width="24" height="24">
      //         <rect width="24" height="24" fill="#7b6345"/>
      //         <polygon points="0,0 12,6 24,0 24,12 12,18 0,12" fill="#90744c" opacity="0.6"/>
      //         <circle cx="12" cy="12" r="2" fill="#5b4d3f" opacity="0.8"/>
      //         <rect x="6" y="6" width="12" height="12" fill="#6b5d4f" opacity="0.4"/>
      //       </pattern>
      //     </defs>
      //     <rect width="128" height="128" fill="url(#rock_eroded)"/>
      //   </svg>
      // `),
      // shininess: 5
    },
    
    // Grass Texture Variations
    { 
      name: 'GRASS1', 
      value: 'GRASS1_texture',
      type: 'texture',
      texture: '/textures/RHINO_GRASS5.jpg',
      shininess: 15,
      uvwMapping: true
    },
    { 
      name: 'GRASS2', 
      value: 'GRASS2_texture',
      type: 'texture',
      texture: '/textures/RHINO_GRASS6.jpg',
      shininess: 15,
      uvwMapping: true
    },
    
    // COLOR2 and COLOR3 textures for RHINO
    { 
      name: 'COLOR2', 
      value: 'color2_texture',
      type: 'texture',
      texture: '/textures/COLOR2.jpg',
      shininess: 60
    },
    { 
      name: 'COLOR3', 
      value: 'color3_texture',
      type: 'texture',
      texture: '/textures/COLOR3.jpg',
      shininess: 60
    },
    
    // Additional Solid Colors
    { name: 'Sand', value: '#E4E8E8', type: 'color' },
    { name: 'Chocolate', value: '#898233', type: 'color' },
    { name: 'Yellow', value: '#FFFF00', type: 'color' },
    { name: 'Red', value: '#FF0000', type: 'color' },
    { name: 'Blue', value: '#0046FF', type: 'color' },
    { name: 'Violet', value: '#EE82EE', type: 'color' },
    { name: 'Orange', value: '#FFA500', type: 'color' },
    { name: 'Navy', value: '#00008B', type: 'color' }
  ];

  const parts = [
    { name: 'bucket1', label: 'RHINO' },
    { name: 'handler1', label: 'ROCK' },
    { name: 'handler3', label: 'FLOOR' }
  ];

  const handlePartSelect = (part: string) => {
    setSelectedPart(part);
    onPartSelect(part);
  };

  const handleColorChange = (color: string) => {
    // Find the color object to get additional properties
    const colorObj = colors.find(c => c.value === color);
    
    // Update selected texture name
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
    
    // Special debugging for COLOR2
    if (colorObj?.name === 'COLOR2') {
      console.log('🔍 COLOR2 SPECIAL DEBUG:', {
        textureUrl: colorObj.texture,
        fullUrl: `${window.location.origin}${colorObj.texture}`,
        selectedPart,
        colorValue: color
      });
      
      // Test multiple possible paths for COLOR2
      const testPaths = [
        '/textures/COLOR2.jpg',
        '/public/textures/COLOR2.jpg', 
        '/img/COLOR2.jpg',
        '/textures/color2.jpg',
        '/textures/COLOR2.png'
      ];
      
      testPaths.forEach(path => {
        const testImg = new Image();
        testImg.onload = () => {
          console.log(`✅ COLOR2 FOUND AT: ${path}`);
          console.log(`Dimensions: ${testImg.width}x${testImg.height}`);
        };
        testImg.onerror = () => console.log(`❌ COLOR2 NOT AT: ${path}`);
        testImg.src = path;
      });
      
      // Also test the original path
      const testImg = new Image();
      testImg.onload = () => {
        console.log('✅ COLOR2 ORIGINAL PATH WORKS');
        console.log('Image loaded:', testImg.src);
      };
      testImg.onerror = (error) => {
        console.error('❌ COLOR2 ORIGINAL PATH FAILED:', error);
        console.error('Attempted URL:', testImg.src);
      };
      testImg.src = colorObj.texture;
    }
    
    // Apply color change immediately
    if (colorObj) {
      onColorChange(color, selectedPart, colorObj);
    } else {
      console.error('❌ Color object not found for:', color);
      onColorChange(color, selectedPart);
    }
  };

  // Filter colors based on selected part
  const getFilteredColors = () => {
    if (selectedPart === 'handler1') { // ROCK
      return colors.filter(color => 
        color.name && (color.name === 'ROCK1' || color.name === 'ROCK2')
      );
    }
    if (selectedPart === 'bucket1') { // RHINO
      return colors.filter(color => 
        color.name && (color.name === 'COLOR2' || color.name === 'COLOR3')
      );
    }
     if (selectedPart === 'handler3') { // FLOOR
       return colors.filter(color => 
         color.name && (color.name === 'GRASS1' || color.name === 'GRASS2')
       );
     }
    return colors; // Show all colors for other parts
  };

  const filteredColors = getFilteredColors();
  const handleShowDimensions = () => {
    setIsDimensionsModalOpen(true);
  };

  const handleDownloadFlyer = () => {
    // Download flyer functionality
    window.open('Docu/massivesplash_ss_02.pdf', '_blank');
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    // Only close if clicking directly on the overlay, not on child elements
    if (e.target === e.currentTarget) {
      setIsOpen(false);
    }
  };
  return (
    <>
      {/* Toggle Button - positioned above all other elements */}
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

      {/* Control Panel - positioned above all other elements */}
      <div 
        className={`fixed top-0 right-0 h-full w-80 bg-gray-900 text-white transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ zIndex: 1000 }}
      >
        <div className="p-6 h-full overflow-y-auto">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-2">Water Odyssey</h2>
            <p className="text-gray-400 text-sm">3D Model Controller</p>
          </div>

          {/* Animation Controls - Buttons in one row */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Settings className="mr-2" size={18} />
              Water Spray Effects
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

          {/* Resources Section Title - Using same styling as Particle Animation */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Settings className="mr-2" size={18} />
              Resources
            </h3>
          </div>

          {/* Resource Actions - Show Dimensions and Download Flyer only */}
          <div className="mb-8">
            <div className="space-y-3">
              <button 
                onClick={handleShowDimensions}
                className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded flex items-center justify-center transition-colors text-sm font-medium uppercase"
              >
                <Eye className="mr-2" size={16} />
                Show Dimensions
              </button>
              <button 
                onClick={handleDownloadFlyer}
                className="w-full bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded flex items-center justify-center transition-colors text-sm font-medium uppercase"
              >
                <Download className="mr-2" size={16} />
                Download PDS
              </button>
            </div>
          </div>

          {/* Colors Section - Two Column Layout like original */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Palette className="mr-2" size={18} />
              Colors
            </h3>
            
            {/* Two Column Layout Container */}
            <div className="flex space-x-4">
              {/* Left Column - Parts Selection */}
              <div className="flex-1">
                <div className="text-center text-xs font-semibold text-gray-400 mb-3 uppercase">
                  Parts
                </div>
                <div className="space-y-2">
                  {parts.map((part) => (
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
                  Swatch
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
                      onMouseEnter={() => {
                        if (color.type === 'texture') {
                          console.log(`Hovering over texture: ${color.name} - ${color.texture}`, {
                            selectedPart,
                            willApplyTo: parts.find(p => p.name === selectedPart)?.label
                          });
                        }
                      }}
                      onError={(e) => {
                        console.error(`Failed to load texture preview: ${color.texture}`, e);
                      }}
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
                {parts.find(p => p.name === selectedPart)?.label}
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

          {/* Specifications */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Specifications</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-400">Category:</span>
                <div className="text-white">FUN FORM</div>
              </div>
              <div>
                <span className="text-gray-400">Dimensions:</span>
                <div className="text-white">Height: 14'-3" | 435 CM</div>
              </div>
              <div>
                <span className="text-gray-400">Flow Requirements:</span>
                <div className="text-white">40 - 100 GPM/ 152-379 LPM</div>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-8 pt-4 border-t border-gray-700 text-xs text-gray-500 text-center">
            © WATER ODYSSEY - All rights Reserved.
          </div>
        </div>
      </div>

      {/* Overlay - positioned above all other elements but below control panel */}
      {isOpen && (
        <div
          onClick={handleOverlayClick}
          className="fixed inset-0 bg-black bg-opacity-50 pointer-events-none"
          style={{ zIndex: 999 }}
        />
      )}

      {/* Dimensions Modal - positioned at the very top */}
      <DimensionsModal 
        isOpen={isDimensionsModalOpen}
        onClose={() => setIsDimensionsModalOpen(false)}
      />
    </>
  );
};

export default ControlPanel;