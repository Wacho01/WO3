import * as THREE from 'three';
import { getParticleSystem } from './getParticleSystem.js';
import { getParticleSystem2 } from './getParticleSystem2.js';

interface ParticleSystemConfig {
  name: string;
  type: 'spray' | 'mist' | 'smoke' | 'fire' | 'custom';
  position: [number, number, number];
  rate: number;
  texture: string;
  maxLife: number;
  velocity: [number, number, number];
  spread?: number;
  color?: string;
}

interface ParticleConfig {
  enabled: boolean;
  systems: ParticleSystemConfig[];
}

export class ConfigurableParticleManager {
  private particleSystems: Array<{ name: string; system: any }> = [];
  private emitters: Array<{ name: string; mesh: THREE.Mesh }> = [];
  private isActive = true;
  private scene: THREE.Scene | null = null;
  private camera: THREE.Camera | null = null;

  initialize(scene: THREE.Scene, camera: THREE.Camera, config: ParticleConfig) {
    this.scene = scene;
    this.camera = camera;
    
    if (!config.enabled) {
      console.log('Particles disabled in configuration');
      return;
    }

    this.createEmitters(config.systems);
    this.createParticleSystems(config.systems);
  }

  private createEmitters(systems: ParticleSystemConfig[]) {
    if (!this.scene) {
      console.error('Scene not initialized');
      return;
    }

    const geometry = new THREE.SphereGeometry(0.025, 20, 20);
    const material = new THREE.MeshStandardMaterial({ color: 0x00000 });

    systems.forEach((systemConfig, index) => {
      const emitter = new THREE.Mesh(geometry, material);
      emitter.position.set(...systemConfig.position);
      this.scene!.add(emitter);
      this.emitters.push({ name: systemConfig.name, mesh: emitter });
      
      console.log(`Created emitter: ${systemConfig.name} at position [${systemConfig.position.join(', ')}]`);
    });
  }

  private createParticleSystems(systems: ParticleSystemConfig[]) {
    if (!this.scene || !this.camera || this.emitters.length === 0) {
      console.error('Scene, camera, or emitters not properly initialized');
      return;
    }

    this.particleSystems = [];

    systems.forEach((systemConfig, index) => {
      const emitter = this.emitters.find(e => e.name === systemConfig.name);
      if (!emitter) {
        console.error(`Emitter not found for system: ${systemConfig.name}`);
        return;
      }

      let particleSystem;

      switch (systemConfig.type) {
        case 'spray':
          particleSystem = getParticleSystem({
            camera: this.camera,
            emitter: emitter.mesh,
            parent: this.scene,
            rate: systemConfig.rate,
            texture: systemConfig.texture
          });
          break;

        case 'mist':
          particleSystem = getParticleSystem2({
            camera: this.camera,
            emitter: emitter.mesh,
            parent: this.scene,
            rate: systemConfig.rate,
            texture: systemConfig.texture
          });
          break;

        case 'fire':
          // Create a fire particle system (similar to spray but with different parameters)
          particleSystem = this.createFireSystem({
            camera: this.camera,
            emitter: emitter.mesh,
            parent: this.scene,
            rate: systemConfig.rate,
            texture: systemConfig.texture,
            color: systemConfig.color || '#ff4500'
          });
          break;

        case 'smoke':
          // Create a smoke particle system
          particleSystem = this.createSmokeSystem({
            camera: this.camera,
            emitter: emitter.mesh,
            parent: this.scene,
            rate: systemConfig.rate,
            texture: systemConfig.texture
          });
          break;

        default:
          console.warn(`Unknown particle system type: ${systemConfig.type}`);
          return;
      }

      if (particleSystem) {
        this.particleSystems.push({ name: systemConfig.name, system: particleSystem });
        console.log(`Created particle system: ${systemConfig.name} (${systemConfig.type})`);
      }
    });
  }

  private createFireSystem(params: any) {
    // Fire particle system implementation
    // This would be similar to getParticleSystem but with fire-specific parameters
    return getParticleSystem({
      ...params,
      // Fire-specific modifications could be added here
    });
  }

  private createSmokeSystem(params: any) {
    // Smoke particle system implementation
    // This would be similar to getParticleSystem2 but with smoke-specific parameters
    return getParticleSystem2({
      ...params,
      // Smoke-specific modifications could be added here
    });
  }

  update(deltaTime = 0.01) {
    if (!this.isActive) return;

    this.particleSystems.forEach(({ system }) => {
      if (system && system.update) {
        system.update(deltaTime);
      }
    });
  }

  play() {
    this.isActive = true;
    this.particleSystems.forEach(({ system }) => {
      if (system && system.clearParticles) {
        system.clearParticles();
      }
    });
    console.log('Configurable particle systems activated');
  }

  stop() {
    this.isActive = false;
    this.particleSystems.forEach(({ system }) => {
      if (system && system._points) {
        system._points.visible = false;
      }
    });
    console.log('Configurable particle systems deactivated');
  }

  setActiveState(active: boolean) {
    this.isActive = active;
    if (active) {
      this.play();
    } else {
      this.stop();
    }
    
    if (active) {
      this.particleSystems.forEach(({ system }) => {
        if (system && system._points) {
          system._points.visible = true;
        }
      });
    }
    console.log(`Configurable particle systems set to: ${active ? 'ACTIVE' : 'INACTIVE'}`);
  }

  getActiveState() {
    return this.isActive;
  }

  getSystemCount() {
    return this.particleSystems.length;
  }

  getEmitterCount() {
    return this.emitters.length;
  }

  dispose() {
    this.emitters.forEach(({ mesh }) => {
      if (this.scene && mesh) {
        this.scene.remove(mesh);
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) mesh.material.dispose();
      }
    });

    this.emitters = [];
    this.particleSystems = [];
    
    console.log('Configurable particle system disposed');
  }

  reinitialize(config: ParticleConfig) {
    this.dispose();
    if (this.scene && this.camera) {
      this.initialize(this.scene, this.camera, config);
    }
  }
}