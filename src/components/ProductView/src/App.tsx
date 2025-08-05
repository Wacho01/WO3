import React, { useState } from 'react';
import ConfigurableThreeScene from './components/ConfigurableThreeScene';
import ConfigurableControlPanel from './components/ConfigurableControlPanel';
import ConfigurableFooter from './components/ConfigurableFooter';
import LoadingSpinner from './components/LoadingSpinner';
import { useProductConfig } from './hooks/useProductConfig';
import { useThreeScene } from './hooks/useThreeScene';

function App() {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const { config, loading: configLoading, error: configError } = useProductConfig();
  const { playAnimation, stopAnimation, changeColor, selectPart } = useThreeScene();

  const handleModelLoad = () => {
    setIsModelLoaded(true);
  };

  // Logo hover functions (converted from the original logo.js)
  const rollover = (logo: HTMLImageElement) => {
    logo.style.width = "100%";
    logo.style.opacity = "0.7";
    logo.style.transition = "all .35s ease-in-out";
    logo.src = 'img/logo2.png';
  };

  const mouseaway = (logo: HTMLImageElement) => {
    logo.style.width = "100%";
    logo.style.opacity = "1.0";
    logo.src = "img/logo2.png";
  };

  // Show loading if configuration is loading
  if (configLoading) {
    return (
      <div className="relative w-full h-screen overflow-hidden bg-gray-100">
        <LoadingSpinner message="Loading Configuration..." />
      </div>
    );
  }

  // Show error if configuration failed to load
  if (configError) {
    return (
      <div className="relative w-full h-screen overflow-hidden bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Configuration Error</h1>
          <p className="text-gray-600">{configError}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-100">
      {/* Border Lines from original file - positioned in front of canvas */}
      <div id="left"></div>
      <div id="right"></div>
      <div id="top"></div>
      <div id="bottom"></div>

      {/* High-DPI optimized logo with hover effects */}
      <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="logo">
          <img 
            src="./img/logo2.png" 
            alt="Water Odyssey Logo" 
            className="h-16 w-auto object-contain transition-all duration-300 select-none"
            style={{
              imageRendering: 'crisp-edges',
              WebkitImageRendering: 'crisp-edges',
              MozImageRendering: 'crisp-edges',
              msImageRendering: 'crisp-edges',
              imageRendering: '-webkit-optimize-contrast',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'translateZ(0)',
              WebkitTransform: 'translateZ(0)',
              willChange: 'transform, opacity'
            }}
            onMouseOver={(e) => rollover(e.currentTarget)}
            onMouseOut={(e) => mouseaway(e.currentTarget)}
            onLoad={() => console.log('Logo loaded successfully')}
            draggable={false}
          />
        </div>
      </div>

      {/* Configurable Three.js Scene */}
      <ConfigurableThreeScene config={config} onModelLoad={handleModelLoad} />

      {/* Loading Spinner */}
      {!isModelLoaded && <LoadingSpinner />}

      {/* Configurable Footer */}
      {isModelLoaded && <ConfigurableFooter config={config} />}

      {/* Configurable Control Panel */}
      <ConfigurableControlPanel
        config={config}
        onPlayAnimation={playAnimation}
        onStopAnimation={stopAnimation}
        onColorChange={changeColor}
        onPartSelect={selectPart}
      />
    </div>
  );
}

export default App;