# JavaScript Folder Structure

This folder contains organized JavaScript modules for the Water Odyssey 3D Viewer application.

## Folder Organization

### `core/`
Core Three.js managers and fundamental application logic:
- **`SceneManager.js`** - Scene creation, model management, material changes
- **`CameraManager.js`** - Camera creation, switching, auto-framing
- **`RendererManager.js`** - Renderer setup, viewport management, scissor testing
- **`LightingManager.js`** - Scene lighting setup and management

### `components/`
UI and component-specific functionality:
- **`UIManager.js`** - UI state management and DOM interactions
- **`ModalManager.js`** - Modal dialog handling
- **`ControlPanelManager.js`** - Control panel functionality

### `utils/`
Utility functions and helper classes:
- **`Logger.js`** - Centralized logging system with debug modes
- **`EventManager.js`** - Event system for component communication
- **`MathUtils.js`** - Mathematical calculations and helpers
- **`DOMUtils.js`** - DOM manipulation utilities

### `particles/`
Particle system management:
- **`ParticleManager.js`** - Particle system coordination
- **`WaterParticleSystem.js`** - Water spray particle effects
- **`MistParticleSystem.js`** - Mist and vapor effects
- **`ParticleShaders.js`** - Custom shaders for particles

### `controls/`
Input and camera controls:
- **`ControlsManager.js`** - Orbit controls and input handling
- **`CameraControls.js`** - Camera movement and interaction
- **`KeyboardControls.js`** - Keyboard input handling

### `loaders/`
Asset loading and management:
- **`ModelLoader.js`** - GLTF/GLB model loading
- **`TextureLoader.js`** - Texture loading and caching
- **`AssetManager.js`** - Asset preloading and management

### `animations/`
Animation and timing systems:
- **`AnimationManager.js`** - Animation loop and timing
- **`ModelAnimations.js`** - Model rotation and transitions
- **`UIAnimations.js`** - UI transition animations

## Usage

### ES6 Modules
All modules use ES6 import/export syntax:

```javascript
import { SceneManager } from './core/SceneManager.js';
import { Logger } from './utils/Logger.js';
```

### Main Application Entry
The main application is initialized in `main.js`:

```javascript
import { WaterOdysseyApp } from './js/main.js';

// Application automatically initializes on DOM ready
```

### Event System
Components communicate through the centralized event system:

```javascript
// Emit events
eventManager.emit('model:loaded', modelData);

// Listen for events
eventManager.on('particles:play', () => {
  particleManager.startParticles();
});
```

### Logging
Consistent logging across all modules:

```javascript
const logger = new Logger('ComponentName');
logger.info('Component initialized');
logger.debug('Debug information', data);
logger.error('Error occurred', error);
```

## Architecture Patterns

### Manager Pattern
Each major system has a dedicated manager class:
- Centralized control and configuration
- Clear separation of concerns
- Easy testing and maintenance

### Event-Driven Architecture
Components communicate through events:
- Loose coupling between modules
- Easy to add new features
- Centralized event handling

### Modular Design
Each file has a single responsibility:
- Easy to understand and maintain
- Reusable components
- Clear dependency management

## Development Guidelines

### Code Style
- Use ES6+ features (classes, arrow functions, destructuring)
- Consistent naming conventions (camelCase for variables, PascalCase for classes)
- Comprehensive error handling
- Detailed logging for debugging

### Error Handling
```javascript
try {
  await this.initializeComponent();
} catch (error) {
  this.logger.error('Component initialization failed:', error);
  throw error;
}
```

### Performance Considerations
- Efficient disposal of Three.js objects
- Event listener cleanup
- Memory leak prevention
- Optimized render loops

### Debugging
Enable debug mode by:
- Adding `?debug=true` to URL
- Setting `localStorage.setItem('waterOdyssey_debug', 'true')`
- Using browser developer tools

## Browser Compatibility

- Modern browsers with ES6 module support
- Three.js compatible environments
- WebGL support required
- No polyfills included (add if needed for older browsers)

## File Dependencies

```
main.js
├── core/
│   ├── SceneManager.js
│   ├── CameraManager.js
│   ├── RendererManager.js
│   └── LightingManager.js
├── utils/
│   ├── Logger.js
│   └── EventManager.js
├── particles/
│   └── ParticleManager.js
├── controls/
│   └── ControlsManager.js
├── loaders/
│   └── ModelLoader.js
├── animations/
│   └── AnimationManager.js
└── components/
    └── UIManager.js
```

This modular structure ensures maintainable, scalable, and professional JavaScript code for the Water Odyssey 3D Viewer.