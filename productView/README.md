# Product Catalog 3D Viewer Template

A configurable 3D product viewer template built with React, TypeScript, and Three.js. Originally based on the Water Odyssey 3D viewer, this template can be easily configured to showcase any product with 3D models and particle effects.

## Features

### 🎯 **Template-Based Architecture**
- **Configurable Product Settings**: JSON-based configuration for easy product switching
- **Modular Components**: Reusable components that adapt to different product types
- **Dynamic Content**: All text, specifications, and resources load from configuration
- **Flexible Particle Systems**: Support for spray, mist, fire, smoke, and custom effects

### 🎨 **Customization Options**
- **Multi-Part Color Customization**: Configure which parts can be customized
- **Texture & Color Support**: Both solid colors and texture mapping
- **UVW Mapping**: Advanced texture mapping for complex surfaces
- **Dynamic Material Properties**: Configurable shininess, transparency, and more

### 🎮 **Interactive Features**
- **3D Model Viewer**: Orbit controls with configurable camera positions
- **Particle Effects**: Configurable particle systems with play/stop controls
- **Multiple Camera Views**: Overhead and custom camera angles
- **Responsive Design**: Works on desktop, tablet, and mobile devices

### 📊 **Product Information**
- **Technical Specifications**: Configurable dimensions and technical details
- **Dimension Views**: Front, top, and side view diagrams
- **Resource Downloads**: PDF specs, images, and other downloadable resources
- **Interactive Modals**: Detailed dimension and specification viewers

## Quick Start

### 1. **Basic Usage**
The template works out of the box with the default Water Odyssey configuration:

```bash
npm install
npm run dev
```

### 2. **Configure for Your Product**
Create a new product configuration in `src/config/productConfig.ts`:

```typescript
export const myProductConfig: ProductConfig = {
  product: {
    name: "MY PRODUCT",
    category: "Product Category",
    subcategory: "Product Type",
    description: "Product description"
  },
  
  model: {
    path: "/models/gltf/MY_MODEL.glb",
    scale: [1, 1, 1],
    position: [0, 0, 0],
    rotation: [0, 0, 0]
  },
  
  particles: {
    enabled: true,
    systems: [
      {
        name: "effect1",
        type: "spray", // or "mist", "fire", "smoke"
        position: [0, 1, 0],
        rate: 500,
        texture: "/img/particle.png",
        maxLife: 2.0,
        velocity: [0, 1, 0]
      }
    ]
  },
  
  // ... more configuration options
};
```

### 3. **Use Your Configuration**
Update your app to use the new configuration:

```typescript
// In your component
const { config } = useProductConfig('my-product');

// Or load dynamically
const { loadConfig } = useProductConfig();
loadConfig('my-product-config');
```

## Configuration Guide

### 📦 **Product Information**
```typescript
product: {
  name: "PRODUCT NAME",           // Main product title
  category: "Category™",          // Product category
  subcategory: "Type",           // Product subcategory  
  description: "Description"      // Brief description
}
```

### 🎯 **3D Model Setup**
```typescript
model: {
  path: "/models/gltf/MODEL.glb", // Path to your GLB/GLTF file
  scale: [0.8, 0.8, 0.8],        // Model scale [x, y, z]
  position: [0, -0.5, 0],        // Model position [x, y, z]
  rotation: [0, Math.PI, 0],     // Model rotation [x, y, z]
  initialRotation: {             // Optional auto-rotation on load
    enabled: true,
    steps: 30,
    increment: Math.PI / 80
  }
}
```

### ✨ **Particle Systems**
```typescript
particles: {
  enabled: true,
  systems: [
    {
      name: "spray1",              // Unique system name
      type: "spray",               // "spray", "mist", "fire", "smoke"
      position: [0, 1, 0],         // Emitter position [x, y, z]
      rate: 500.0,                 // Particles per second
      texture: "/img/particle.png", // Particle texture
      maxLife: 2.5,                // Particle lifetime (seconds)
      velocity: [0, 1, 0],         // Initial velocity [x, y, z]
      spread: 0.4,                 // Optional: spread factor
      color: "#ff4500"             // Optional: particle color
    }
  ]
}
```

### 🎨 **Customization Options**
```typescript
customization: {
  parts: [
    { 
      name: "body",                // Internal part identifier
      label: "MAIN BODY",          // Display name
      defaultColor: "#0023FF"      // Default color
    }
  ],
  colors: [
    {
      name: "Red",                 // Color display name
      value: "#FF0000",            // Color value or texture ID
      type: "color"                // "color" or "texture"
    },
    {
      name: "Wood Texture",
      value: "wood_texture",
      type: "texture",
      texture: "/textures/wood.jpg", // Texture file path
      shininess: 30,               // Material shininess
      uvwMapping: true             // Enable UVW mapping
    }
  ]
}
```

### 📏 **Specifications**
```typescript
specifications: {
  dimensions: {
    height: "10' (305 CM)",
    width: "5' (152 CM)", 
    length: "8' (244 CM)"
  },
  technical: [
    { label: "Material", value: "Stainless Steel" },
    { label: "Weight", value: "500 lbs" },
    { label: "Power", value: "120V AC" }
  ]
}
```

### 📋 **Resources**
```typescript
resources: {
  dimensionViews: {
    front: "/diagrams/front-view.svg",    // Optional dimension diagrams
    top: "/diagrams/top-view.svg",
    side: "/diagrams/side-view.svg"
  },
  downloadLinks: [
    { 
      label: "Download Specs", 
      url: "/docs/specifications.pdf", 
      type: "pdf" 
    }
  ]
}
```

### 📷 **Camera Configuration**
```typescript
cameras: {
  main: {
    position: [2, 1, 5],          // Main camera position
    lookAt: [0, 0, 0],            // What the camera looks at
    fov: 35                       // Field of view
  },
  overhead: {
    position: [0, 10, 0],         // Overhead camera position
    lookAt: [0, 0, 0],
    fov: 45
  }
}
```

### 💡 **Lighting Setup**
```typescript
lighting: {
  hemisphere: {
    skyColor: "#ffffff",          // Sky light color
    groundColor: "#444444",       // Ground light color
    intensity: 0.8,               // Light intensity
    position: [0, 2, 0]           // Light position
  },
  directional: {
    color: "#ffffff",             // Directional light color
    intensity: 0.6,               // Light intensity
    position: [1, 2, 1],          // Light position
    castShadow: true              // Enable shadows
  }
}
```

### 🌍 **Environment Settings**
```typescript
environment: {
  backgroundColor: "#f0f0f0",     // Scene background color
  fogColor: "#f0f0f0",           // Fog color
  fogNear: 20,                   // Fog start distance
  fogFar: 100,                   // Fog end distance
  floor: {
    enabled: true,               // Show floor
    color: "#cccccc",            // Floor color
    size: 1000                   // Floor size
  },
  grid: {
    enabled: true,               // Show grid
    size: 50,                    // Grid size
    divisions: 50                // Grid divisions
  }
}
```

## File Structure

```
src/
├── config/
│   └── productConfig.ts         # Product configurations
├── components/
│   ├── ConfigurableThreeScene.tsx      # Main 3D scene component
│   ├── ConfigurableControlPanel.tsx    # Control panel component
│   ├── ConfigurableFooter.tsx          # Footer component
│   ├── ConfigurableDimensionsModal.tsx # Dimensions modal
│   └── CameraViewport.tsx              # Camera viewport component
├── hooks/
│   ├── useProductConfig.ts             # Configuration management hook
│   └── useThreeScene.ts                # Three.js scene management
├── utils/
│   ├── configurableParticles.ts        # Particle system manager
│   ├── getParticleSystem.js            # Spray particle system
│   └── getParticleSystem2.js           # Mist particle system
└── App.tsx                             # Main application component
```

## Adding New Products

### 1. **Prepare Your Assets**
- **3D Model**: Export as GLB or GLTF format
- **Textures**: Prepare texture images (JPG, PNG)
- **Particle Textures**: Create particle effect images
- **Dimension Diagrams**: Create SVG diagrams (optional)
- **Documentation**: Prepare PDF specifications (optional)

### 2. **Create Configuration**
```typescript
// Add to src/config/productConfig.ts
export const newProductConfig: ProductConfig = {
  // Your product configuration here
};
```

### 3. **Update Asset Paths**
Place your assets in the appropriate folders:
- Models: `public/models/gltf/`
- Textures: `public/textures/`
- Images: `public/img/`
- Documents: `public/docs/`

### 4. **Load Configuration**
```typescript
// Use in your component
const { config } = useProductConfig('new-product');
```

## Advanced Features

### 🔧 **Custom Particle Systems**
Create custom particle effects by extending the particle system:

```typescript
// In configurableParticles.ts
case 'custom':
  particleSystem = this.createCustomSystem({
    camera: this.camera,
    emitter: emitter.mesh,
    parent: this.scene,
    rate: systemConfig.rate,
    texture: systemConfig.texture,
    customProperty: systemConfig.customProperty
  });
  break;
```

### 🎨 **Advanced Material Customization**
Configure complex materials with multiple properties:

```typescript
{
  name: "Advanced Material",
  value: "advanced_material",
  type: "texture",
  texture: "/textures/diffuse.jpg",
  normalMap: "/textures/normal.jpg",
  roughnessMap: "/textures/roughness.jpg",
  metallicMap: "/textures/metallic.jpg",
  shininess: 50,
  roughness: 0.3,
  metalness: 0.8,
  uvwMapping: true
}
```

### 📱 **Responsive Configuration**
The template automatically adapts to different screen sizes, but you can customize breakpoints and mobile-specific settings in the CSS files.

## Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **WebGL Support**: Required for 3D rendering
- **ES6 Modules**: Required for dynamic imports
- **Mobile**: iOS Safari 12+, Android Chrome 70+

## Performance Optimization

### 🚀 **Model Optimization**
- Use Draco compression for GLTF files
- Keep polygon count reasonable (< 50k triangles)
- Optimize texture sizes (power of 2)
- Use efficient UV mapping

### ⚡ **Runtime Performance**
- Automatic LOD (Level of Detail) based on distance
- Frustum culling for off-screen objects
- Efficient particle system management
- Memory leak prevention

## Troubleshooting

### Common Issues

**Model not loading:**
- Check file path in configuration
- Ensure GLB/GLTF file is valid
- Verify Draco compression compatibility

**Textures not appearing:**
- Check texture file paths
- Ensure UV coordinates exist on model
- Verify texture format (JPG, PNG)

**Particles not working:**
- Check particle texture paths
- Verify emitter positions
- Ensure WebGL support

**Performance issues:**
- Reduce model complexity
- Lower particle counts
- Optimize texture sizes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review example configurations

---

**Transform any product into an interactive 3D catalog experience with this powerful, flexible template!**