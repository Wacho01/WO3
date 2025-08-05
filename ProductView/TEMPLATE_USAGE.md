# Product Catalog Template - Usage Guide

This guide explains how to use the Product Catalog 3D Viewer Template to create interactive 3D product showcases for any product.

## 🚀 Quick Setup for New Products

### Step 1: Prepare Your Assets

**Required Files:**
- `YOUR_MODEL.glb` - Your 3D model in GLB format
- `particle_texture.png` - Texture for particle effects (optional)
- `texture1.jpg`, `texture2.jpg` - Product textures for customization (optional)

**Optional Files:**
- `front_view.svg` - Front dimension diagram
- `top_view.svg` - Top dimension diagram  
- `side_view.svg` - Side dimension diagram
- `product_specs.pdf` - Product specification document

### Step 2: Create Your Product Configuration

Create a new file `src/config/yourProductConfig.ts`:

```typescript
import { ProductConfig } from './productConfig';

export const yourProductConfig: ProductConfig = {
  product: {
    name: "YOUR PRODUCT NAME",
    category: "Your Category™",
    subcategory: "Product Type",
    description: "Brief product description"
  },

  model: {
    path: "/models/gltf/YOUR_MODEL.glb",
    scale: [1, 1, 1],                    // Adjust size as needed
    position: [0, 0, 0],                 // Adjust position as needed
    rotation: [0, 0, 0],                 // Adjust rotation as needed
    initialRotation: {
      enabled: true,                     // Auto-rotate on load
      steps: 35,                         // Number of rotation steps
      increment: Math.PI / 90            // Rotation amount per step
    }
  },

  particles: {
    enabled: true,                       // Set to false if no effects needed
    systems: [
      {
        name: "effect1",
        type: "spray",                   // "spray", "mist", "fire", "smoke"
        position: [0, 1, 0],             // Where particles emit from
        rate: 500.0,                     // Particles per second
        texture: "/img/light_01.png",    // Particle texture
        maxLife: 2.5,                    // How long particles live
        velocity: [0, 1, 0]              // Initial particle direction
      }
    ]
  },

  customization: {
    parts: [
      { name: "main_body", label: "MAIN BODY", defaultColor: "#0023FF" },
      { name: "accent", label: "ACCENT", defaultColor: "#FF0000" }
    ],
    colors: [
      // Solid colors
      { name: "Blue", value: "#0023FF", type: "color" },
      { name: "Red", value: "#FF0000", type: "color" },
      { name: "Green", value: "#00FF00", type: "color" },
      
      // Textures
      { 
        name: "Wood", 
        value: "wood_texture", 
        type: "texture", 
        texture: "/textures/wood.jpg", 
        shininess: 30 
      }
    ]
  },

  specifications: {
    dimensions: {
      height: "10' (305 CM)",
      width: "5' (152 CM)",
      length: "8' (244 CM)"
    },
    technical: [
      { label: "Material", value: "Your Material" },
      { label: "Weight", value: "Your Weight" },
      { label: "Power Requirements", value: "Your Power Specs" }
    ]
  },

  resources: {
    dimensionViews: {
      front: "/diagrams/your_front.svg",
      top: "/diagrams/your_top.svg", 
      side: "/diagrams/your_side.svg"
    },
    downloadLinks: [
      { label: "Download Specs", url: "/docs/your_specs.pdf", type: "pdf" }
    ]
  },

  cameras: {
    main: {
      position: [2, 1, 5],               // Adjust for best view
      lookAt: [0, 0, 0],
      fov: 35
    },
    overhead: {
      position: [0, 8, 0],               // Top-down view
      lookAt: [0, 0, 0],
      fov: 45
    }
  },

  lighting: {
    hemisphere: {
      skyColor: "#ffffff",
      groundColor: "#444444",
      intensity: 1.0,
      position: [0, 2, 2]
    },
    directional: {
      color: "#ffffff",
      intensity: 0.5,
      position: [1, 2, 1],
      castShadow: true
    }
  },

  environment: {
    backgroundColor: "#f0f0f0",
    fogColor: "#f0f0f0", 
    fogNear: 20,
    fogFar: 100,
    floor: {
      enabled: true,
      color: "#cccccc",
      size: 1000
    },
    grid: {
      enabled: true,
      size: 50,
      divisions: 50
    }
  }
};
```

### Step 3: Update the Main App

Modify `src/App.tsx` to use your configuration:

```typescript
// Import your configuration
import { yourProductConfig } from './config/yourProductConfig';

// In the App component, replace the useProductConfig hook:
const config = yourProductConfig; // Use your config directly

// Or use the hook with your config name:
const { config } = useProductConfig('your-product');
```

### Step 4: Place Your Assets

**File Structure:**
```
public/
├── models/gltf/
│   └── YOUR_MODEL.glb
├── textures/
│   ├── wood.jpg
│   ├── metal.jpg
│   └── fabric.jpg
├── img/
│   └── light_01.png
├── diagrams/
│   ├── your_front.svg
│   ├── your_top.svg
│   └── your_side.svg
└── docs/
    └── your_specs.pdf
```

## 🎨 Customization Examples

### Example 1: Furniture Product
```typescript
export const chairConfig: ProductConfig = {
  product: {
    name: "EXECUTIVE CHAIR",
    category: "Office Furniture™", 
    subcategory: "Seating",
    description: "Premium executive office chair with customizable materials"
  },
  
  model: {
    path: "/models/gltf/CHAIR.glb",
    scale: [1.2, 1.2, 1.2],
    position: [0, -0.5, 0],
    rotation: [0, Math.PI / 4, 0]
  },
  
  particles: {
    enabled: false // No particle effects for furniture
  },
  
  customization: {
    parts: [
      { name: "seat", label: "SEAT", defaultColor: "#8B4513" },
      { name: "frame", label: "FRAME", defaultColor: "#C0C0C0" }
    ],
    colors: [
      { name: "Leather Brown", value: "#8B4513", type: "color" },
      { name: "Fabric Blue", value: "fabric_blue", type: "texture", texture: "/textures/fabric_blue.jpg" },
      { name: "Chrome", value: "#C0C0C0", type: "color" }
    ]
  }
  // ... rest of configuration
};
```

### Example 2: Electronic Device
```typescript
export const deviceConfig: ProductConfig = {
  product: {
    name: "SMART DEVICE",
    category: "Electronics™",
    subcategory: "IoT Device", 
    description: "Smart home device with LED indicators"
  },
  
  particles: {
    enabled: true,
    systems: [
      {
        name: "led_glow",
        type: "custom",
        position: [0, 0.5, 0.2],
        rate: 100.0,
        texture: "/img/glow.png",
        maxLife: 1.0,
        velocity: [0, 0.1, 0],
        color: "#00FF00"
      }
    ]
  }
  // ... rest of configuration
};
```

### Example 3: Vehicle
```typescript
export const vehicleConfig: ProductConfig = {
  product: {
    name: "CONCEPT CAR",
    category: "Automotive™",
    subcategory: "Electric Vehicle",
    description: "Next-generation electric concept vehicle"
  },
  
  particles: {
    enabled: true,
    systems: [
      {
        name: "exhaust_steam",
        type: "mist",
        position: [-1.5, 0.2, -2],
        rate: 300.0,
        texture: "/img/steam.png",
        maxLife: 3.0,
        velocity: [-0.5, 0.1, -1]
      }
    ]
  },
  
  customization: {
    parts: [
      { name: "body", label: "BODY", defaultColor: "#FF0000" },
      { name: "wheels", label: "WHEELS", defaultColor: "#333333" },
      { name: "interior", label: "INTERIOR", defaultColor: "#000000" }
    ]
  }
  // ... rest of configuration
};
```

## 🔧 Advanced Configuration

### Custom Particle Effects
```typescript
// In configurableParticles.ts, add custom particle types:
case 'sparks':
  particleSystem = this.createSparksSystem({
    camera: this.camera,
    emitter: emitter.mesh,
    parent: this.scene,
    rate: systemConfig.rate,
    texture: systemConfig.texture,
    sparkColor: systemConfig.color || '#FFD700'
  });
  break;
```

### Dynamic Configuration Loading
```typescript
// Load configuration from API or file
const { loadConfig } = useProductConfig();

useEffect(() => {
  // Load configuration based on URL parameter
  const productId = new URLSearchParams(window.location.search).get('product');
  if (productId) {
    loadConfig(productId);
  }
}, []);
```

### Multiple Product Support
```typescript
// Create a product selector
const [selectedProduct, setSelectedProduct] = useState('water-odyssey');
const { config } = useProductConfig(selectedProduct);

const productOptions = [
  { id: 'water-odyssey', name: 'Water Odyssey' },
  { id: 'fire-feature', name: 'Fire Feature' },
  { id: 'your-product', name: 'Your Product' }
];
```

## 📱 Mobile Optimization

The template automatically adapts to mobile devices, but you can customize mobile-specific settings:

```typescript
// In your configuration, add mobile-specific overrides
environment: {
  // ... standard settings
  mobile: {
    backgroundColor: "#f8f8f8", // Lighter background for mobile
    particleCount: 0.5,         // Reduce particles on mobile
    shadowQuality: "low"        // Lower shadow quality for performance
  }
}
```

## 🎯 Best Practices

### Model Preparation
1. **Optimize polygon count** (< 50k triangles for web)
2. **Use efficient UV mapping**
3. **Apply Draco compression** to GLB files
4. **Center model at origin** (0, 0, 0)
5. **Use consistent scale** (1 unit = 1 meter)

### Texture Optimization
1. **Use power-of-2 dimensions** (512x512, 1024x1024)
2. **Compress textures** (JPG for photos, PNG for graphics)
3. **Optimize file sizes** (< 2MB per texture)
4. **Use appropriate formats** (WebP when supported)

### Performance Tips
1. **Limit particle count** (< 1000 active particles)
2. **Use efficient materials** (avoid complex shaders)
3. **Implement LOD** for complex models
4. **Monitor memory usage** (dispose unused resources)

### User Experience
1. **Provide loading feedback** with progress indicators
2. **Add helpful tooltips** for controls
3. **Ensure responsive design** works on all devices
4. **Test on various browsers** and devices

## 🐛 Troubleshooting

### Common Issues and Solutions

**Model appears too large/small:**
```typescript
model: {
  scale: [0.5, 0.5, 0.5] // Reduce scale values
}
```

**Model appears in wrong position:**
```typescript
model: {
  position: [0, -1, 0] // Adjust Y position to place on ground
}
```

**Particles not visible:**
```typescript
particles: {
  systems: [{
    position: [0, 1, 0], // Make sure position is above ground
    rate: 1000.0,        // Increase particle rate
    maxLife: 5.0         // Increase particle lifetime
  }]
}
```

**Textures not loading:**
- Check file paths are correct
- Ensure files exist in public folder
- Verify texture formats (JPG, PNG)
- Check browser console for errors

**Poor performance:**
- Reduce model complexity
- Lower particle counts
- Disable shadows if needed
- Use smaller texture sizes

## 📞 Support

For additional help:
1. Check the main README.md
2. Review example configurations
3. Test with the default Water Odyssey setup
4. Create GitHub issues for bugs
5. Refer to Three.js documentation for advanced 3D features

---

**Happy building! Transform your products into engaging 3D experiences! 🚀**