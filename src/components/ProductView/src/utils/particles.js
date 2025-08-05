import * as THREE from 'three';
import { getParticleSystem } from './getParticleSystem.js';
import { getParticleSystem2 } from './getParticleSystem2.js';

/**
 * ParticleSystemManager - Manages all particle systems for the Water Odyssey 3D Viewer
 */
export class ParticleSystemManager {
  constructor() {
    this.particleSystems = [];
    this.emitters = [];
    this.isActive = true;
    this.scene = null;
    this.camera = null;
  }

  /**
   * Initialize the particle system manager
   * @param {THREE.Scene} scene - The Three.js scene
   * @param {THREE.Camera} camera - The Three.js camera
   */
  initialize(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.createEmitters();
    this.createParticleSystems();
  }

  /**
   * Create particle emitters with exact positions from original HTML file
   */
  createEmitters() {
    if (!this.scene) {
      console.error('Scene not initialized');
      return;
    }

    const geometry = new THREE.SphereGeometry(0.025, 20, 20);
    const material = new THREE.MeshStandardMaterial({ color: 0x00000 });

    // EXACT positions from original HTML file - cube (first emitter)
    const cube = new THREE.Mesh(geometry, material);
    cube.position.y = 0.47;
    cube.position.z = 0.19;
    cube.position.x = -0.1;
    this.scene.add(cube);
    this.emitters.push({ name: 'cube', mesh: cube });

    // EXACT positions from original HTML file - cube2 (second emitter)
    const cube2 = new THREE.Mesh(geometry, material);
    cube2.position.y = 0.47;
    cube2.position.z = 0;
    cube2.position.x = -0.5;
    this.scene.add(cube2);
    this.emitters.push({ name: 'cube2', mesh: cube2 });

    // EXACT positions from original HTML file - cube3 (third emitter)
    const cube3 = new THREE.Mesh(geometry, material);
    cube3.position.y = 0.46;
    cube3.position.z = 0.265;
    cube3.position.x = 0.3;
    this.scene.add(cube3);
    this.emitters.push({ name: 'cube3', mesh: cube3 });

    // EXACT positions from original HTML file - emitter4 (active fourth emitter)
    const emitter4 = new THREE.Mesh(geometry, material);
    emitter4.position.y = 0.46; // verde altura
    emitter4.position.z = -0.46; // azul largo
    emitter4.position.x = 0.09; // rojo ancho
    this.scene.add(emitter4);
    this.emitters.push({ name: 'emitter4', mesh: emitter4 });

    console.log('Particle emitters created with exact positions from original');
  }

  /**
   * Create particle systems using the imported functions with exact parameters
   */
  createParticleSystems() {
    if (!this.scene || !this.camera || this.emitters.length === 0) {
      console.error('Scene, camera, or emitters not properly initialized');
      return;
    }

    // Clear existing particle systems
    this.particleSystems = [];

    // Use the original particle system functions with exact parameters and image textures
    // smokeEffect - rate: 500.0, texture: './img/light_01.png'
    const smokeEffect = getParticleSystem({
      camera: this.camera,
      emitter: this.emitters[0].mesh, // cube
      parent: this.scene,
      rate: 500.0,
      texture: './img/light_01.png' // Use actual image file from original
    });
    this.particleSystems.push({ name: 'smokeEffect', system: smokeEffect });

    // smokeEffect2 - rate: 500.0, texture: './img/light_01.png'
    const smokeEffect2 = getParticleSystem({
      camera: this.camera,
      emitter: this.emitters[1].mesh, // cube2
      parent: this.scene,
      rate: 500.0,
      texture: './img/light_01.png' // Same texture as original
    });
    this.particleSystems.push({ name: 'smokeEffect2', system: smokeEffect2 });

    // smokeEffect3 - rate: 500.0, texture: './img/light_01.png'
    const smokeEffect3 = getParticleSystem({
      camera: this.camera,
      emitter: this.emitters[2].mesh, // cube3
      parent: this.scene,
      rate: 500.0,
      texture: './img/light_01.png' // Same texture as original
    });
    this.particleSystems.push({ name: 'smokeEffect3', system: smokeEffect3 });

    // smokeEffect4 - rate: 2500.0, texture: './img/light_01.png'
    const smokeEffect4 = getParticleSystem2({
      camera: this.camera,
      emitter: this.emitters[3].mesh, // emitter4
      parent: this.scene,
      rate: 2500.0,
      texture: './img/light_01.png' // Same texture as original
    });
    this.particleSystems.push({ name: 'smokeEffect4', system: smokeEffect4 });

    console.log('Particle systems created with exact parameters from original');
  }

  /**
   * Update all particle systems
   * @param {number} deltaTime - Time elapsed since last update
   */
  update(deltaTime = 0.01) {
    if (!this.isActive) return;

    this.particleSystems.forEach(({ system }) => {
      if (system && system.update) {
        system.update(deltaTime);
      }
    });
  }

  /**
   * Start particle animations
   */
  play() {
    this.isActive = true;
    // Clear all existing particles to start fresh
    this.particleSystems.forEach(({ system }) => {
      if (system && system.clearParticles) {
        system.clearParticles();
      }
    });
    console.log('Particle systems activated - animations started');
  }

  /**
   * Stop particle animations
   */
  stop() {
    this.isActive = false;
    // Hide all particle systems when stopped
    this.particleSystems.forEach(({ system }) => {
      if (system && system._points) {
        system._points.visible = false;
      }
    });
    console.log('Particle systems deactivated - animation loop stopped');
  }

  /**
   * Get the current active state
   * @returns {boolean} Whether particles are currently active
   */
  getActiveState() {
    return this.isActive;
  }

  /**
   * Set the active state
   * @param {boolean} active - Whether particles should be active
   */
  setActiveState(active) {
    this.isActive = active;
    if (active) {
      this.play();
    } else {
      this.stop();
    }
    // Show particles when activated
    if (active) {
      this.particleSystems.forEach(({ system }) => {
        if (system && system._points) {
          system._points.visible = true;
        }
      });
    }
    console.log(`Particle systems set to: ${active ? 'ACTIVE' : 'INACTIVE'}`);
  }

  /**
   * Get particle system count
   * @returns {number} Number of active particle systems
   */
  getSystemCount() {
    return this.particleSystems.length;
  }

  /**
   * Get emitter count
   * @returns {number} Number of emitters
   */
  getEmitterCount() {
    return this.emitters.length;
  }

  /**
   * Cleanup particle systems and emitters
   */
  dispose() {
    // Remove emitters from scene
    this.emitters.forEach(({ mesh }) => {
      if (this.scene && mesh) {
        this.scene.remove(mesh);
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) mesh.material.dispose();
      }
    });

    // Clear arrays
    this.emitters = [];
    this.particleSystems = [];
    
    console.log('Particle system disposed');
  }

  /**
   * Reinitialize particle systems (useful for scene changes)
   */
  reinitialize() {
    this.dispose();
    if (this.scene && this.camera) {
      this.initialize(this.scene, this.camera);
    }
  }
}