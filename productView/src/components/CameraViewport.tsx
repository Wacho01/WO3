import React from 'react';

interface CameraViewportProps {
  activeCamera: 'overhead';
  onCameraSwitch: (cameraType: 'overhead') => void;
  sharedViewportRef: React.RefObject<HTMLDivElement>;
}

const CameraViewport: React.FC<CameraViewportProps> = ({
  activeCamera,
  onCameraSwitch,
  sharedViewportRef
}) => {

  return (
    <div className="camera-viewport-container">
      <div className="absolute left-6 top-4 flex flex-col space-y-2" style={{ zIndex: 30 }}>
        <div 
          ref={sharedViewportRef} 
          className="w-64 h-48 border-2 border-gray-600 bg-black bg-opacity-20 rounded-lg overflow-hidden relative shadow-lg"
        >
          <div className="absolute top-2 right-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraViewport;