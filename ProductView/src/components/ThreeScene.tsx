import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { ParticleSystemManager } from '../utils/particles.js';
import CameraViewport from './CameraViewport';

interface ThreeSceneProps {
  onModelLoad?: () => void;
}

const ThreeScene: React.FC<ThreeSceneProps> = ({ onModelLoad }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sharedViewportRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const sceneNoParticlesRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const camera2Ref = useRef<THREE.PerspectiveCamera | null>(null);
  const camera3Ref = useRef<THREE.PerspectiveCamera | null>(null);
  const camera4Ref = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const controls2Ref = useRef<OrbitControls | null>(null);
  const controls3Ref = useRef<OrbitControls | null>(null);
  const controls4Ref = useRef<OrbitControls | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const modelCloneRef = useRef<THREE.Group | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());
  const particleManagerRef = useRef<ParticleSystemManager | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [particlesActive, setParticlesActive] = useState(true);
  const [showDragNotice, setShowDragNotice] = useState(false);
  const [initialRotationComplete, setInitialRotationComplete] = useState(false);
  
  // Camera switching state - only overhead camera
  const [activeCamera, setActiveCamera] = useState<'overhead'>('overhead');

  // Function to calculate bounding box and auto-frame cameras
  // Removed auto-frame function since we only need overhead camera

  // Function to synchronize material changes between both models
  const syncModelMaterials = (sourceModel: THREE.Group, targetModel: THREE.Group) => {
    sourceModel.traverse((sourceChild) => {
      if (sourceChild instanceof THREE.Mesh && sourceChild.nameID) {
        targetModel.traverse((targetChild) => {
          if (targetChild instanceof THREE.Mesh && 
              targetChild.nameID === sourceChild.nameID) {
            // Clone the material to avoid shared references
            if (sourceChild.material instanceof THREE.Material) {
              targetChild.material = sourceChild.material.clone();
            }
          }
        });
      }
    });
  };

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

  // Get the currently active camera for the shared viewport
  const getActiveCamera = () => {
    return camera2Ref.current; // Only overhead camera
  };

  // Get the appropriate scene for the active camera
  const getActiveScene = () => {
    return sceneNoParticlesRef.current;
  };

  // Optimized model loading with progress tracking
  const loadRhinoModel = async (loader: GLTFLoader): Promise<THREE.Group> => {
    return new Promise<THREE.Group>((resolve, reject) => {
      console.log('Loading RHINO.glb model...');
      
      loader.load(
        'RHINO.glb',
        (gltf) => {
          console.log('RHINO.glb loaded successfully');
          
          // Get the model from the loaded GLTF
          const loadedModel = gltf.scene;
          
          // Optimize the loaded model
          const optimizedModel = optimizeModel(loadedModel);
          
          resolve(optimizedModel);
        },
        (progress) => {
          const percentComplete = (progress.loaded / progress.total) * 100;
          setLoadingProgress(percentComplete);
          console.log('Loading progress:', percentComplete.toFixed(1) + '%');
        },
        (error) => {
          console.error('RHINO.glb loading failed:', error);
          reject(error);
        }
      );
    });
  };

  // Model optimization function
  const optimizeModel = (model: THREE.Group): THREE.Group => {
    console.log('Optimizing RHINO model...');
    
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Enable shadows
        child.castShadow = true;
        child.receiveShadow = true;
        
        // Optimize geometry
        if (child.geometry) {
          // Merge vertices if possible
          child.geometry.mergeVertices?.();
          
          // Compute vertex normals if missing
          if (!child.geometry.attributes.normal) {
            child.geometry.computeVertexNormals();
          }
          
          // Ensure UV coordinates are properly set
          if (!child.geometry.attributes.uv) {
            console.warn(`Missing UV coordinates for mesh: ${child.name}`);
            // Generate basic UV coordinates if missing
            child.geometry.computeBoundingBox();
            const bbox = child.geometry.boundingBox;
            if (bbox) {
              const uvs = [];
              const positions = child.geometry.attributes.position;
              for (let i = 0; i < positions.count; i++) {
                const x = positions.getX(i);
                const z = positions.getZ(i);
                // Simple planar UV mapping
                const u = (x - bbox.min.x) / (bbox.max.x - bbox.min.x);
                const v = (z - bbox.min.z) / (bbox.max.z - bbox.min.z);
                uvs.push(u, v);
              }
              child.geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
            }
          } else {
            console.log(`✓ UV coordinates found for mesh: ${child.name}`);
            // Verify UV coordinates are in valid range
            const uvAttribute = child.geometry.attributes.uv;
            console.log(`UV count: ${uvAttribute.count}, UV array length: ${uvAttribute.array.length}`);
          }
          
          // Compute bounding sphere for frustum culling
          child.geometry.computeBoundingSphere();
        }
        
        // Optimize materials
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => optimizeMaterial(mat));
          } else {
            optimizeMaterial(child.material);
          }
        }
        
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
        
        // Debug: Log all mesh names to help identify parts
        console.log(`Mesh found: ${child.name}, assigned nameID: ${child.nameID || 'none'}`);
      }
    });
    
    console.log('RHINO model optimization complete');
    return model;
  };

  // Material optimization function
  const optimizeMaterial = (material: THREE.Material) => {
    if (material instanceof THREE.MeshStandardMaterial || 
        material instanceof THREE.MeshPhongMaterial) {
      
      // Enable efficient rendering
      material.transparent = material.opacity < 1;
      
      // Optimize texture settings
      if (material.map) {
        material.map.generateMipmaps = true;
        material.map.minFilter = THREE.LinearMipmapLinearFilter;
        material.map.magFilter = THREE.LinearFilter;
      }
      
      // Set reasonable defaults if needed
      if (!material.color) {
        material.color = new THREE.Color(0x0023FF);
      }
    }
  };

  // Initial rotation function - exact from original
  let initRotate = 0;
  const initialRotation = (model: THREE.Group) => {
    initRotate++;
    if (initRotate <= 35) {
      model.rotation.y += Math.PI / 90;
    } else {
      setInitialRotationComplete(true);
      // Show drag notice after initial rotation completes
      setTimeout(() => {
        setShowDragNotice(true);
        // Hide drag notice after 3 seconds like original
        setTimeout(() => {
          setShowDragNotice(false);
        }, 3000);
      }, 500);
    }
  };

  useEffect(() => {
    if (!mountRef.current || !sharedViewportRef.current) return;

    console.log('Initializing Three.js scene...');

    // Scene setup - TWO SEPARATE SCENES
    const scene = new THREE.Scene(); // Main scene WITH particles
    const sceneNoParticles = new THREE.Scene(); // Clean scene WITHOUT particles
    const BackGround_Color = 0xf1f1f1;
    
    scene.background = new THREE.Color(BackGround_Color);
    scene.fog = new THREE.Fog(BackGround_Color, 20, 100);
    sceneNoParticles.background = new THREE.Color(BackGround_Color);
    sceneNoParticles.fog = new THREE.Fog(BackGround_Color, 20, 100);
    
    sceneRef.current = scene;
    sceneNoParticlesRef.current = sceneNoParticles;

    // Main Camera setup - ADJUSTED Y POSITION DOWN 70%
    const cameraFar = 5;
    const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.25, 500);
    camera.position.z = cameraFar;
    camera.position.x = 1.2;
    camera.position.y = 0.03; // REDUCED from 0.1 to 0.03 (70% reduction: 0.1 * 0.3 = 0.03)
    camera.lookAt(0, 0.03, 0); // ADJUSTED lookAt target to match new camera height
    camera.name = "MainCam";
    cameraRef.current = camera;

    // Small camera - exact from original (Overhead view)
    const camera2 = new THREE.PerspectiveCamera(10, 1, 0.01, 500);
    camera2.position.z = -6;
    camera2.position.x = 12;
    camera2.position.y = 1;
    camera2.lookAt(scene.position);
    camera2.name = "OverheadCam";
    camera2Ref.current = camera2;

    // Removed camera3 and camera4 since we only need overhead camera

    // Camera helpers - ADD TO BOTH SCENES
    // const Chelper = new THREE.CameraHelper(camera2);
    // scene.add(Chelper);
    
    // Create separate camera helper for clean scene
    // const ChelperClean = new THREE.CameraHelper(camera2);
    // sceneNoParticles.add(ChelperClean);

    // ADD CAMERA HELPER FOR CAMERA2 (OVERHEAD CAMERA) - EXISTING
    // const camera2Helper = new THREE.CameraHelper(camera2);
    // camera2Helper.name = "Camera2Helper";
    // scene.add(camera2Helper);
    
    // Create separate camera2 helper for clean scene
    // const camera2HelperClean = new THREE.CameraHelper(camera2);
    // camera2HelperClean.name = "Camera2HelperClean";
    // sceneNoParticles.add(camera2HelperClean);

    // console.log('Camera2 helper added to both scenes');

    // Optimized renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      preserveDrawingBuffer: true,
      powerPreference: "high-performance",
      stencil: false,
      depth: true
    });
    
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Better shadow quality
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(render);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    
    // Performance optimizations
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.physicallyCorrectLights = true;
    
    // Apply Three.js canvas styling
    renderer.domElement.className = 'three-canvas';
    renderer.domElement.style.zIndex = '1';
    renderer.domElement.style.position = 'relative';
    
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Optimized lighting setup - ADD TO BOTH SCENES
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
    hemiLight.position.set(0, 2, 2);
    scene.add(hemiLight);
    
    const hemiLightClean = hemiLight.clone();
    sceneNoParticles.add(hemiLightClean);

    const helper = new THREE.HemisphereLightHelper(hemiLight, 0.2);
    scene.add(helper);
    
    const helperClean = new THREE.HemisphereLightHelper(hemiLightClean, 0.2);
    sceneNoParticles.add(helperClean);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.45);
    dirLight.position.set(0.5, 1, 1.5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.setScalar(2048); // Higher resolution shadows
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 50;
    dirLight.shadow.camera.left = -10;
    dirLight.shadow.camera.right = 10;
    dirLight.shadow.camera.top = 10;
    dirLight.shadow.camera.bottom = -10;
    scene.add(dirLight);
    
    const dirLightClean = dirLight.clone();
    sceneNoParticles.add(dirLightClean);

    const helperdirect = new THREE.DirectionalLightHelper(dirLight, 0.2);
    scene.add(helperdirect);
    
    const helperdirectClean = new THREE.DirectionalLightHelper(dirLightClean, 0.2);
    sceneNoParticles.add(helperdirectClean);

    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);
    
    const axesHelperClean = axesHelper.clone();
    sceneNoParticles.add(axesHelperClean);

    // Optimized floor setup - ADD TO BOTH SCENES
    const floorGeometry = new THREE.PlaneGeometry(5000, 5000, 1, 1);
    const floorMaterial = new THREE.MeshPhongMaterial({
      color: 0xF8F8F8,
      shininess: 0
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -0.5 * Math.PI;
    floor.receiveShadow = true;
    floor.position.y = -0.6;
    scene.add(floor);
    
    const floorClean = floor.clone();
    sceneNoParticles.add(floorClean);

    const grid = new THREE.GridHelper(50, 50, 0xffffff, 0x7b7b7b);
    grid.material.opacity = 0.4;
    grid.material.transparent = true;
    grid.position.y = -0.6;
    scene.add(grid);
    
    const gridClean = grid.clone();
    sceneNoParticles.add(gridClean);

    // Optimized controls setup - ADJUSTED TARGET FOR NEW CAMERA POSITION
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
    controls.target.set(0, 0.03, 0); // ADJUSTED target to match new camera height (was 0.1, now 0.03)
    
    // Allow orbit controls to work even when UI elements are present
    controls.domElement = renderer.domElement;
    controls.enableRotate = true;
    
    // Prevent controls from being disabled by UI interactions
    renderer.domElement.style.pointerEvents = 'auto';
    
    controlsRef.current = controls;

    // Camera2 control - exact from original
    const controls2 = new OrbitControls(camera2, renderer.domElement);
    controls2.enabled = false;
    controls2.enableRotate = false;
    controls2Ref.current = controls2;

    // Initialize particle system manager
    const particleManager = new ParticleSystemManager();
    particleManagerRef.current = particleManager;

    // Optimized model loading setup
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/'); // Use CDN for faster loading
    dracoLoader.preload(); // Preload the decoder

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);
    loader.setPath('/models/gltf/');

    // Load the RHINO.glb model
    console.log('Loading RHINO.glb model...');
    loadRhinoModel(loader)
      .then((loadedModel) => {
        console.log('RHINO.glb loaded successfully, setting up scene...');
        
        // Apply original model setup with additional 35-degree Y rotation
        loadedModel.scale.set(0.6, 0.6, 0.6);
        loadedModel.rotation.y = Math.PI + THREE.MathUtils.degToRad(70); // Original π rotation + 35 degrees
        loadedModel.position.y = -0.6;

        // Create a clone for the clean scene
        const loadedModelClone = loadedModel.clone();

        // Set initial materials - exact from original
        const INITIAL_MTL = new THREE.MeshPhongMaterial({ color: 0x0023FF, shininess: 1 });
        const INITIAL_MAP = [
          { childID: "bucket1", mtl: INITIAL_MTL },
        ];

        // Function to initialize colors - exact from original
        const initColor = (parent: THREE.Group, type: string, mtl: THREE.Material) => {
          parent.traverse(o => {
            if (o.isMesh) {
              if (o.name.includes(type) || o.nameID === type) {
                o.material = mtl.clone(); // Clone material to avoid shared references
                o.nameID = type; // Set a new property to identify this object
              }
            }
          });
        };

        // Set initial textures for both models
        for (let object of INITIAL_MAP) {
          initColor(loadedModel, object.childID, object.mtl);
          initColor(loadedModelClone, object.childID, object.mtl);
        }
        
        // Debug: Log all parts with nameID after initialization
        console.log('=== MODEL PARTS ANALYSIS ===');
        loadedModel.traverse((child) => {
          if (child.isMesh) {
            console.log(`Part: ${child.name}, nameID: ${child.nameID || 'NONE'}, material: ${child.material?.type}`);
          }
        });
        console.log('=== END MODEL PARTS ANALYSIS ===');

        // Add models to their respective scenes
        scene.add(loadedModel); // Main scene WITH particles
        sceneNoParticles.add(loadedModelClone); // Clean scene WITHOUT particles
        
        modelRef.current = loadedModel;
        modelCloneRef.current = loadedModelClone;

        // Add camera2 to model like original
        loadedModel.add(camera2);

        // Initialize particle systems after model is loaded
        if (particleManagerRef.current) {
          particleManagerRef.current.initialize(scene, camera);
          console.log('Particle systems initialized after model load');
        }

        // Model is loaded, hide loading spinner
        setIsLoading(false);
        onModelLoad?.();

        console.log('RHINO.glb model successfully integrated with camera4 rotated 70 degrees in Y-axis and moved down 70%');
      })
      .catch((error) => {
        console.error('Failed to load RHINO.glb model:', error);
        setIsLoading(false);
        // You could show an error message to the user here
      });

    // Scissor helper function - exact from original
    const setScissorForElement = (elem: HTMLElement) => {
      const canvas = renderer.domElement;
      const canvasRect = canvas.getBoundingClientRect();
      const elemRect = elem.getBoundingClientRect();

      // Compute a canvas relative rectangle
      const right = Math.min(elemRect.right, canvasRect.right) - canvasRect.left;
      const left = Math.max(0, elemRect.left - canvasRect.left);
      const bottom = Math.min(elemRect.bottom, canvasRect.bottom) - canvasRect.top;
      const top = Math.max(0, elemRect.top - canvasRect.top);

      const width = Math.min(canvasRect.width, right - left);
      const height = Math.min(canvasRect.height, bottom - top);

      // Setup the scissor to only render to that part of the canvas
      const positiveYUpBottom = canvasRect.height - bottom;
      renderer.setScissor(left, positiveYUpBottom, width, height);
      renderer.setViewport(left, positiveYUpBottom, width, height);

      // Return the aspect
      return width / height;
    };

    // Optimized render function
    function render() {
      // Add safety check for controls before calling update
      if (controlsRef.current) {
        controlsRef.current.update();
      }

      // Update particle systems ONLY when active - exact from original behavior
      if (particlesActive) {
        if (particleManagerRef.current) {
          particleManagerRef.current.update(0.01);
        }
      }

      // Initial rotation animation - exact from original
      if (modelRef.current && !initialRotationComplete) {
        initialRotation(modelRef.current);
      }

      // Render only once per frame to prevent flashing
      requestAnimationFrame(() => {
        // Turn on the scissor
        renderer.setScissorTest(true);
        
        // Main camera - render scene WITH particles
        if (mountRef.current) {
          camera.aspect = setScissorForElement(mountRef.current);
          camera.updateProjectionMatrix();
          renderer.render(scene, camera); // Main scene WITH particles
        }

        // Shared viewport - render with selected camera using CLEAN scene
        if (sharedViewportRef.current) {
          const activeCamera = getActiveCamera();
          const activeScene = getActiveScene(); // This returns sceneNoParticles
          
          if (activeCamera && activeScene) {
            activeCamera.aspect = setScissorForElement(sharedViewportRef.current);
            activeCamera.updateProjectionMatrix();
            
            // Update lookAt for cameras that need it
            if (activeCamera === camera2Ref.current) {
              activeCamera.lookAt(activeScene.position);
            }
            
            renderer.render(activeScene, activeCamera); // Clean scene WITHOUT particles
          }
        }
      });
    }

    // Animation loop - exact from original
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

    // Expose control functions - with both models
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
      changeModelColor: (color: string, partName: string = 'bucket1', colorObj?: any) => {
        if (!modelRef.current || !modelCloneRef.current) {
          console.warn('Models not loaded yet, color change will be applied when ready');
          return;
        }
        
        let newMaterial;
        
        if (colorObj && colorObj.type === 'texture') {
          // Create texture material
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
            (progress) => {
              // Loading progress
            },
            (error) => {
              const fallbackMaterial = new THREE.MeshPhongMaterial({
                color: 0x0023FF, // Default blue color
                shininess: colorObj.shininess || 10
              });
              setMaterialBothModels(partName, fallbackMaterial);
            }
          );
          
          return; // Exit early, material will be applied in the success callback
        } else {
          let hexColor;
          try {
            hexColor = new THREE.Color(color);
          } catch (error) {
            hexColor = new THREE.Color(0x0023FF); // Fallback color
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
      
      // Cleanup particle systems
      if (particleManagerRef.current) {
        particleManagerRef.current.dispose();
        particleManagerRef.current = null;
      }
      
      // Cleanup geometries and materials for both scenes
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
      
      // Clean up global controls
      delete (window as any).threeSceneControls;
    };
  }, [onModelLoad, particlesActive, activeCamera, initialRotationComplete]);

  // Camera switching handlers
  const handleCameraSwitch = (cameraType: 'overhead') => {
    setActiveCamera(cameraType);
  };

  return (
    <>
      {/* Main camera view with Three.js styling */}
      <div ref={mountRef} className="w-full h-full three-canvas" />
      
      {/* Loading overlay with semi-transparent background and centered loading animation */}
      {isLoading && (
        <>
          {/* White semi-transparent overlay */}
          <div className="loading-overlay"></div>
          
          {/* Original loading div element - exact from original HTML file with fixed positioning */}
          <div className="loading" id="js-loader"></div>
          
          {/* Loading message */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 translate-y-16 text-gray-800 text-lg font-medium z-[10005]">
            Loading 3D Model...
          </div>
        </>
      )}
      
      {/* Camera Viewport Component */}
      <CameraViewport
        activeCamera={activeCamera}
        onCameraSwitch={handleCameraSwitch}
        sharedViewportRef={sharedViewportRef}
      />
      
      {/* Drag notice - shows after initial rotation completes, then hides after 3 seconds */}
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

export default ThreeScene;