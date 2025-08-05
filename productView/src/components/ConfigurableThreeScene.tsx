import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { ProductConfig } from '../config/productConfig';
import { ConfigurableParticleManager } from '../utils/configurableParticles';
import CameraViewport from './CameraViewport';

interface ConfigurableThreeSceneProps {
  config: ProductConfig;
  onModelLoad?: () => void;
}

const ConfigurableThreeScene: React.FC<ConfigurableThreeSceneProps> = ({ 
  config, 
  onModelLoad 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sharedViewportRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const sceneNoParticlesRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const camera2Ref = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const controls2Ref = useRef<OrbitControls | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const modelCloneRef = useRef<THREE.Group | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());
  const particleManagerRef = useRef<ConfigurableParticleManager | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [particlesActive, setParticlesActive] = useState(true);
  const [showDragNotice, setShowDragNotice] = useState(false);
  const [initialRotationComplete, setInitialRotationComplete] = useState(false);
  const [activeCamera, setActiveCamera] = useState<'overhead'>('overhead');

  // Initialize rotation counter
  let initRotate = 0;

  // Function to apply material to both models
  const setMaterialBothModels = (partName: string, material: THREE.Material) => {
    const updateModel = (model: THREE.Group) => {
      let partsFound = 0;
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const nameMatch = child.nameID === partName;
          const nameIncludes = child.name.toLowerCase().includes(partName.toLowerCase());
          
          const bucketMatch = partName === 'bucket1' && (child.name.toLowerCase().includes('bucket') || child.name.toLowerCase().includes('rhino'));
          const rockMatch = partName === 'handler1' && (
            child.name.toLowerCase().includes('handler') || 
            child.name.toLowerCase().includes('rock') || 
            child.name.toLowerCase().includes('stone') ||
            child.name.toLowerCase().includes('base') ||
            child.name.toLowerCase().includes('support')
          );
          
          const grassMatch = partName === 'handler2' && (
            child.name.toLowerCase().includes('handler2') ||
            child.name.toLowerCase().includes('grass') ||
            child.name.toLowerCase().includes('base') ||
            child.name.toLowerCase().includes('ground')
          );
          
          const floorMatch = partName === 'handler3' && (
            child.name.toLowerCase().includes('handler3') ||
            child.name.toLowerCase().includes('floor') ||
            child.name.toLowerCase().includes('platform')
          );
          
          if (nameMatch || nameIncludes || bucketMatch || rockMatch || grassMatch || floorMatch) {
            const clonedMaterial = material.clone();
            child.material = clonedMaterial;
            child.nameID = partName; // Ensure nameID is set
            partsFound++;
            
            if (clonedMaterial.map && child.geometry.attributes.uv) {
              // UV mapping verified
            }
            
            child.material.needsUpdate = true;
            if (child.material.map) {
              child.material.map.needsUpdate = true;
            }
          }
        }
      });
      return partsFound;
    };

    let totalPartsUpdated = 0;
    if (modelRef.current) {
      totalPartsUpdated += updateModel(modelRef.current);
    }
    if (modelCloneRef.current) {
      totalPartsUpdated += updateModel(modelCloneRef.current);
    }
  };

  // Get active camera and scene
  const getActiveCamera = () => camera2Ref.current;
  const getActiveScene = () => sceneNoParticlesRef.current;

  // Model loading function
  const loadConfigurableModel = async (loader: GLTFLoader): Promise<THREE.Group> => {
    return new Promise<THREE.Group>((resolve, reject) => {
      console.log(`Loading model: ${config.model.path}`);
      
      loader.load(
        config.model.path,
        (gltf) => {
          console.log(`Model loaded successfully: ${config.model.path}`);
          const loadedModel = gltf.scene;
          const optimizedModel = optimizeModel(loadedModel);
          resolve(optimizedModel);
        },
        (progress) => {
          const percentComplete = (progress.loaded / progress.total) * 100;
          setLoadingProgress(percentComplete);
          console.log('Loading progress:', percentComplete.toFixed(1) + '%');
        },
        (error) => {
          console.error(`Model loading failed: ${config.model.path}`, error);
          reject(error);
        }
      );
    });
  };

  // Model optimization
  const optimizeModel = (model: THREE.Group): THREE.Group => {
    console.log(`Optimizing model for: ${config.product.name}`);
    
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        
        if (child.geometry) {
          child.geometry.mergeVertices?.();
          if (!child.geometry.attributes.normal) {
            child.geometry.computeVertexNormals();
          }
          child.geometry.computeBoundingSphere();
        }
        
        // Set up nameID based on configuration
        // Set up nameID for color customization based on mesh names
        if (child.name.includes('bucket') || child.name.includes('handler') || 
            child.name.includes('rhino') || child.name.includes('body') ||
            child.name.includes('nozzle') || child.name.includes('base') ||
            child.name.includes('rock') || child.name.includes('stone') ||
            child.name.includes('floor')) {
          child.nameID = child.name.includes('bucket') ? 'bucket1' :
                        child.name.includes('handler') || child.name.includes('rock') || child.name.includes('stone') ? 'handler1' :
                        child.name.includes('rhino') ? 'bucket1' :
                        child.name.includes('body') ? 'bucket1' :
                        child.name.includes('nozzle') ? 'handler1' :
                        child.name.includes('base') ? 'handler2' :
                        child.name.includes('floor') ? 'handler3' :
                        'bucket1'; // Default to bucket1
        }
        
        console.log(`Mesh found: ${child.name}, assigned nameID: ${child.nameID || 'none'}`);
      }
    });
    
    return model;
  };

  // Initial rotation function
  const initialRotation = (model: THREE.Group) => {
    if (!config.model.initialRotation?.enabled) {
      setInitialRotationComplete(true);
      return;
    }

    initRotate++;
    if (initRotate <= config.model.initialRotation.steps) {
      model.rotation.y += config.model.initialRotation.increment;
    } else {
      setInitialRotationComplete(true);
      setTimeout(() => {
        setShowDragNotice(true);
        setTimeout(() => {
          setShowDragNotice(false);
        }, 3000);
      }, 500);
    }
  };

  useEffect(() => {
    if (!mountRef.current || !sharedViewportRef.current) return;

    console.log(`Initializing scene for: ${config.product.name}`);

    // Scene setup with configuration
    const scene = new THREE.Scene();
    const sceneNoParticles = new THREE.Scene();
    
    const bgColor = new THREE.Color(config.environment.backgroundColor);
    scene.background = bgColor;
    scene.fog = new THREE.Fog(
      config.environment.fogColor, 
      config.environment.fogNear, 
      config.environment.fogFar
    );
    sceneNoParticles.background = bgColor;
    sceneNoParticles.fog = new THREE.Fog(
      config.environment.fogColor, 
      config.environment.fogNear, 
      config.environment.fogFar
    );
    
    sceneRef.current = scene;
    sceneNoParticlesRef.current = sceneNoParticles;

    // Camera setup from configuration
    const camera = new THREE.PerspectiveCamera(
      config.cameras.main.fov, 
      window.innerWidth / window.innerHeight, 
      0.25, 
      500
    );
    camera.position.set(...config.cameras.main.position);
    camera.lookAt(...config.cameras.main.lookAt);
    camera.name = "MainCam";
    cameraRef.current = camera;

    const camera2 = new THREE.PerspectiveCamera(
      config.cameras.overhead.fov, 
      1, 
      0.01, 
      500
    );
    camera2.position.set(...config.cameras.overhead.position);
    camera2.lookAt(...config.cameras.overhead.lookAt);
    camera2.name = "OverheadCam";
    camera2Ref.current = camera2;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      preserveDrawingBuffer: true,
      powerPreference: "high-performance",
      stencil: false,
      depth: true
    });
    
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(render);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.physicallyCorrectLights = true;
    
    renderer.domElement.className = 'three-canvas';
    renderer.domElement.style.zIndex = '1';
    renderer.domElement.style.position = 'relative';
    
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting setup from configuration
    const hemiLight = new THREE.HemisphereLight(
      config.lighting.hemisphere.skyColor,
      config.lighting.hemisphere.groundColor,
      config.lighting.hemisphere.intensity
    );
    hemiLight.position.set(...config.lighting.hemisphere.position);
    scene.add(hemiLight);
    
    const hemiLightClean = hemiLight.clone();
    sceneNoParticles.add(hemiLightClean);

    const dirLight = new THREE.DirectionalLight(
      config.lighting.directional.color,
      config.lighting.directional.intensity
    );
    dirLight.position.set(...config.lighting.directional.position);
    dirLight.castShadow = config.lighting.directional.castShadow;
    if (dirLight.castShadow) {
      dirLight.shadow.mapSize.setScalar(2048);
      dirLight.shadow.camera.near = 0.1;
      dirLight.shadow.camera.far = 50;
      dirLight.shadow.camera.left = -10;
      dirLight.shadow.camera.right = 10;
      dirLight.shadow.camera.top = 10;
      dirLight.shadow.camera.bottom = -10;
    }
    scene.add(dirLight);
    
    const dirLightClean = dirLight.clone();
    sceneNoParticles.add(dirLightClean);

    // Environment setup
    if (config.environment.floor.enabled) {
      const floorGeometry = new THREE.PlaneGeometry(
        config.environment.floor.size, 
        config.environment.floor.size, 
        1, 
        1
      );
      const floorMaterial = new THREE.MeshPhongMaterial({
        color: config.environment.floor.color,
        shininess: 0
      });
      const floor = new THREE.Mesh(floorGeometry, floorMaterial);
      floor.rotation.x = -0.5 * Math.PI;
      floor.receiveShadow = true;
      floor.position.y = config.model.position[1];
      scene.add(floor);
      
      const floorClean = floor.clone();
      sceneNoParticles.add(floorClean);
    }

    if (config.environment.grid.enabled) {
      const grid = new THREE.GridHelper(
        config.environment.grid.size, 
        config.environment.grid.divisions, 
        0xffffff, 
        0x7b7b7b
      );
      grid.material.opacity = 0.4;
      grid.material.transparent = true;
      grid.position.y = config.model.position[1];
      scene.add(grid);
      
      const gridClean = grid.clone();
      sceneNoParticles.add(gridClean);
    }

    // Controls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 4;
    controls.maxDistance = 10;
    controls.maxPolarAngle = Math.PI / 2;
    controls.minPolarAngle = Math.PI / 3;
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.dampingFactor = 0.1;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0.2;
    controls.target.set(...config.cameras.main.lookAt);
    controls.domElement = renderer.domElement;
    controls.enableRotate = true;
    renderer.domElement.style.pointerEvents = 'auto';
    controlsRef.current = controls;

    const controls2 = new OrbitControls(camera2, renderer.domElement);
    controls2.enabled = false;
    controls2.enableRotate = false;
    controls2Ref.current = controls2;

    // Initialize particle system manager
    const particleManager = new ConfigurableParticleManager();
    particleManagerRef.current = particleManager;

    // Model loading setup
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    dracoLoader.preload();

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    // Load the model
    loadConfigurableModel(loader)
      .then((loadedModel) => {
        console.log(`Model loaded successfully for: ${config.product.name}`);
        
        // Apply configuration
        loadedModel.scale.set(...config.model.scale);
        loadedModel.rotation.set(...config.model.rotation);
        loadedModel.position.set(...config.model.position);

        // Create clone for clean scene
        const loadedModelClone = loadedModel.clone();

        // Set initial materials
        const defaultPart = config.customization.parts[0];
        if (defaultPart) {
          const INITIAL_MTL = new THREE.MeshPhongMaterial({ 
            color: defaultPart.defaultColor, 
            shininess: 1 
          });
          
          const initColor = (parent: THREE.Group, type: string, mtl: THREE.Material) => {
            parent.traverse(o => {
              if (o.isMesh) {
                if (o.name.includes(type) || o.nameID === type) {
                  o.material = mtl.clone();
                  o.nameID = type;
                }
              }
            });
          };

          initColor(loadedModel, defaultPart.name, INITIAL_MTL);
          initColor(loadedModelClone, defaultPart.name, INITIAL_MTL);
        }

        // Add models to scenes
        scene.add(loadedModel);
        sceneNoParticles.add(loadedModelClone);
        
        modelRef.current = loadedModel;
        modelCloneRef.current = loadedModelClone;

        // Add camera2 to model
        loadedModel.add(camera2);

        // Initialize particle systems
        if (config.particles.enabled && particleManagerRef.current) {
          particleManagerRef.current.initialize(scene, camera, config.particles);
          console.log('Particle systems initialized');
        }

        setIsLoading(false);
        onModelLoad?.();

        console.log(`${config.product.name} model successfully integrated`);
      })
      .catch((error) => {
        console.error(`Failed to load model for ${config.product.name}:`, error);
        setIsLoading(false);
      });

    // Scissor helper function
    const setScissorForElement = (elem: HTMLElement) => {
      const canvas = renderer.domElement;
      const canvasRect = canvas.getBoundingClientRect();
      const elemRect = elem.getBoundingClientRect();

      const right = Math.min(elemRect.right, canvasRect.right) - canvasRect.left;
      const left = Math.max(0, elemRect.left - canvasRect.left);
      const bottom = Math.min(elemRect.bottom, canvasRect.bottom) - canvasRect.top;
      const top = Math.max(0, elemRect.top - canvasRect.top);

      const width = Math.min(canvasRect.width, right - left);
      const height = Math.min(canvasRect.height, bottom - top);

      const positiveYUpBottom = canvasRect.height - bottom;
      renderer.setScissor(left, positiveYUpBottom, width, height);
      renderer.setViewport(left, positiveYUpBottom, width, height);

      return width / height;
    };

    // Render function
    function render() {
      if (controlsRef.current) {
        controlsRef.current.update();
      }

      if (particlesActive && particleManagerRef.current) {
        particleManagerRef.current.update(0.01);
      }

      if (modelRef.current && !initialRotationComplete) {
        initialRotation(modelRef.current);
      }

      requestAnimationFrame(() => {
        renderer.setScissorTest(true);
        
        if (mountRef.current) {
          camera.aspect = setScissorForElement(mountRef.current);
          camera.updateProjectionMatrix();
          renderer.render(scene, camera);
        }

        if (sharedViewportRef.current) {
          const activeCamera = getActiveCamera();
          const activeScene = getActiveScene();
          
          if (activeCamera && activeScene) {
            activeCamera.aspect = setScissorForElement(sharedViewportRef.current);
            activeCamera.updateProjectionMatrix();
            
            if (activeCamera === camera2Ref.current) {
              activeCamera.lookAt(activeScene.position);
            }
            
            renderer.render(activeScene, activeCamera);
          }
        }
      });
    }

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      render();
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!camera || !camera2 || !renderer) return;
      
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      
      camera2.aspect = window.innerWidth / window.innerHeight;
      camera2.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Expose control functions
    (window as any).threeSceneControls = {
      playParticles: () => {
        console.log('PLAY PARTICLES - Starting particle systems');
        if (particleManagerRef.current) {
          particleManagerRef.current.setActiveState(true);
        }
      },
      stopParticles: () => {
        console.log('STOP PARTICLES - Stopping particle systems');
        if (particleManagerRef.current) {
          particleManagerRef.current.setActiveState(false);
        }
      },
      changeModelColor: (color: string, partName: string = config.customization.parts[0]?.name || 'bucket1', colorObj?: any) => {
        if (!modelRef.current || !modelCloneRef.current) {
          console.warn('Models not loaded yet, color change will be applied when ready');
          return;
        }
        
        let newMaterial;
        
        if (colorObj && colorObj.type === 'texture') {
          const textureLoader = new THREE.TextureLoader();
          
          textureLoader.load(colorObj.texture, 
            (loadedTexture) => {
              // Apply UVW mapping settings for rock textures
              if (colorObj.uvwMapping && (colorObj.name === 'ROCK1' || colorObj.name === 'ROCK2')) {
                // Use UVW mapping for rock textures
                loadedTexture.wrapS = THREE.RepeatWrapping;
                loadedTexture.wrapT = THREE.RepeatWrapping;
                loadedTexture.repeat.set(1, 1); // Use 1:1 mapping for UVW
                loadedTexture.offset.set(0, 0);
                loadedTexture.center.set(0.5, 0.5);
                loadedTexture.rotation = 0;
                
                // Enhanced settings for rock UVW mapping
                loadedTexture.flipY = false; // Maintain UVW orientation
                loadedTexture.generateMipmaps = true;
                loadedTexture.minFilter = THREE.LinearMipmapLinearFilter;
                loadedTexture.magFilter = THREE.LinearFilter;
                loadedTexture.anisotropy = Math.min(16, renderer.capabilities.getMaxAnisotropy());
                
                console.log(`✅ UVW mapping applied for ${colorObj.name}`);
              } else if (colorObj.uvwMapping && (colorObj.name === 'GRASS1' || colorObj.name === 'GRASS2')) {
                // Use UVW mapping for floor/grass textures
                loadedTexture.wrapS = THREE.RepeatWrapping;
                loadedTexture.wrapT = THREE.RepeatWrapping;
                loadedTexture.repeat.set(1, 1); // Use 1:1 mapping for UVW
                loadedTexture.offset.set(0, 0);
                loadedTexture.center.set(0.5, 0.5);
                loadedTexture.rotation = 0;
                
                // Enhanced settings for grass UVW mapping
                loadedTexture.flipY = false; // Maintain UVW orientation
                loadedTexture.generateMipmaps = true;
                loadedTexture.minFilter = THREE.LinearMipmapLinearFilter;
                loadedTexture.magFilter = THREE.LinearFilter;
                loadedTexture.anisotropy = Math.min(16, renderer.capabilities.getMaxAnisotropy());
                
                console.log(`✅ UVW mapping applied for ${colorObj.name}`);
              } else {
                // Standard texture mapping for non-UVW textures
                loadedTexture.wrapS = THREE.RepeatWrapping;
                loadedTexture.wrapT = THREE.RepeatWrapping;
              }
              
              if (colorObj.name === 'COLOR2' || colorObj.name === 'COLOR3') {
                loadedTexture.repeat.set(1, 1);
                loadedTexture.flipY = false;
                loadedTexture.center.set(0.5, 0.5);
              } else if (colorObj.name === 'ROCK1' || colorObj.name === 'ROCK2') {
                // UVW mapping settings already applied above
                console.log(`Rock texture ${colorObj.name} using UVW mapping`);
              } else if (colorObj.name === 'GRASS1' || colorObj.name === 'GRASS2') {
                loadedTexture.repeat.set(3, 3); // Good coverage for grass detail on handler2
                loadedTexture.wrapS = THREE.RepeatWrapping;
                loadedTexture.wrapT = THREE.RepeatWrapping;
                loadedTexture.flipY = false; // Maintain original orientation
                loadedTexture.center.set(0.5, 0.5); // Center the texture
                loadedTexture.rotation = 0; // No rotation
                loadedTexture.offset.set(0, 0); // No offset
                
                loadedTexture.minFilter = THREE.LinearMipmapLinearFilter;
                loadedTexture.magFilter = THREE.LinearFilter;
              } else if (colorObj.texture.includes('GRASS')) {
                loadedTexture.repeat.set(2, 2);
              } else {
                loadedTexture.repeat.set(1, 1);
              }
              
              // Apply standard settings if not already set by UVW mapping
              if (!colorObj.uvwMapping) {
                loadedTexture.minFilter = THREE.LinearMipmapLinearFilter;
                loadedTexture.magFilter = THREE.LinearFilter;
                loadedTexture.generateMipmaps = true;
              }
              loadedTexture.colorSpace = THREE.SRGBColorSpace;
              
              const textureMaterial = new THREE.MeshPhongMaterial({
                map: loadedTexture,
                shininess: colorObj.name === 'ROCK1' || colorObj.name === 'ROCK2' ? 25 : 
                          colorObj.name === 'GRASS1' || colorObj.name === 'GRASS2' ? 8 : 
                          (colorObj.shininess || 10),
                transparent: false,
                opacity: 1.0,
                side: THREE.FrontSide,
                normalScale: colorObj.name === 'ROCK1' || colorObj.name === 'ROCK2' ? new THREE.Vector2(0.8, 0.8) :
                            colorObj.name === 'GRASS1' || colorObj.name === 'GRASS2' ? new THREE.Vector2(1.2, 1.2) :
                            new THREE.Vector2(1, 1),
                combine: THREE.MultiplyOperation,
                ...(colorObj.uvwMapping && (colorObj.name === 'ROCK1' || colorObj.name === 'ROCK2') ? {
                  roughness: 0.7, // Optimized roughness for UVW mapped rocks
                  metalness: 0.05, // Reduced metallic reflection for better UVW display
                  bumpScale: 0.2, // Reduced bump for cleaner UVW mapping
                } : colorObj.uvwMapping && (colorObj.name === 'GRASS1' || colorObj.name === 'GRASS2') ? {
                  roughness: 0.8, // Optimized roughness for UVW mapped grass
                  metalness: 0.0, // No metallic reflection for natural grass
                  bumpScale: 0.3, // Enhanced surface detail for grass UVW mapping
                } : colorObj.name === 'ROCK1' || colorObj.name === 'ROCK2' ? {
                  roughness: 0.8, // Standard rougher surface for rocks
                  metalness: 0.1, // Slight metallic reflection
                  bumpScale: 0.3, // Add surface detail
                } : colorObj.name === 'GRASS1' || colorObj.name === 'GRASS2' ? {
                  roughness: 0.9, // Very rough surface for grass
                  metalness: 0.0, // No metallic reflection for natural grass
                  bumpScale: 0.4, // Enhanced surface detail for grass
                } : {})
              });
              
              setMaterialBothModels(partName, textureMaterial);
            },
            undefined,
            (error) => {
              const fallbackMaterial = new THREE.MeshPhongMaterial({
                color: 0x0023FF,
                shininess: colorObj.shininess || 10
              });
              setMaterialBothModels(partName, fallbackMaterial);
            }
          );
          
          return;
        } else {
          let hexColor;
          try {
            hexColor = new THREE.Color(color);
          } catch (error) {
            hexColor = new THREE.Color(0x0023FF);
          }
          
          newMaterial = new THREE.MeshPhongMaterial({
            color: hexColor,
            shininess: colorObj?.shininess || 10,
            transparent: false,
            opacity: 1.0
          });
          
          setMaterialBothModels(partName, newMaterial);
        }
      },
    };

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      
      if (particleManagerRef.current) {
        particleManagerRef.current.dispose();
        particleManagerRef.current = null;
      }
      
      [scene, sceneNoParticles].forEach(sceneToClean => {
        sceneToClean.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.geometry?.dispose();
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material?.dispose();
            }
          }
        });
      });
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      
      delete (window as any).threeSceneControls;
    };
  }, [config, onModelLoad, particlesActive, activeCamera, initialRotationComplete]);

  const handleCameraSwitch = (cameraType: 'overhead') => {
    setActiveCamera(cameraType);
  };

  return (
    <>
      <div ref={mountRef} className="w-full h-full three-canvas" />
      
      {isLoading && (
        <>
          <div className="loading-overlay"></div>
          <div className="loading" id="js-loader"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 translate-y-16 text-gray-800 text-lg font-medium z-[10005]">
            Loading {config.product.name}...
          </div>
        </>
      )}
      
      <CameraViewport
        activeCamera={activeCamera}
        onCameraSwitch={handleCameraSwitch}
        sharedViewportRef={sharedViewportRef}
      />
      
      {showDragNotice && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20">
          <div className="w-24 h-18 bg-black bg-opacity-60 text-white text-center text-sm align-middle md:align-middle px-4 py-2 rounded-sm outline-dashed outline-2 outline-offset-2 outline-blue-500/100  animate-pulse">
            Rotate 3D Model
          </div>
        </div>
      )}
    </>
  );
};

export default ConfigurableThreeScene;