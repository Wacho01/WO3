import { useRef, useCallback } from 'react';
import * as THREE from 'three';

export const useThreeScene = () => {
  const sceneRef = useRef<THREE.Scene | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const particleSystemsRef = useRef<any[]>([]);

  const playAnimation = useCallback(() => {
    if ((window as any).threeSceneControls && typeof (window as any).threeSceneControls.playParticles === 'function') {
      (window as any).threeSceneControls.playParticles();
    }
  }, []);

  const stopAnimation = useCallback(() => {
    if ((window as any).threeSceneControls && typeof (window as any).threeSceneControls.stopParticles === 'function') {
      (window as any).threeSceneControls.stopParticles();
    }
  }, []);

  const changeColor = useCallback((color: string, part: string = 'bucket1', colorObj?: any) => {
    console.log(`Changing ${part} color to ${color}`);
    // Store the selected part and color for persistence
    (window as any).selectedPart = part;
    (window as any).selectedColor = color;
    (window as any).selectedColorObj = colorObj;
    if ((window as any).threeSceneControls) {
      (window as any).threeSceneControls.changeModelColor(color, part, colorObj);
    }
  }, []);

  const selectPart = useCallback((part: string) => {
    console.log(`Selected part: ${part}`);
    // Store the selected part for color changes
    (window as any).selectedPart = part;
  }, []);

  return {
    sceneRef,
    modelRef,
    playAnimation,
    stopAnimation,
    changeColor,
    selectPart
  };
};