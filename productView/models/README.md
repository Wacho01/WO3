# Models Directory

This directory contains 3D model files for the Water Odyssey 3D Viewer application.

## Structure

### `gltf/`
Contains GLTF and GLB model files:
- **RHINO.glb** - Main Black Rhino Sprayer model
- Additional model variants and parts can be stored here

## File Formats

### Supported Formats
- **GLB** (Binary GLTF) - Recommended for production
- **GLTF** - Text-based format with separate texture files
- **FBX** - Supported via Three.js loaders
- **OBJ** - Basic geometry support

### Optimization Guidelines

#### Model Optimization
- Keep polygon count reasonable (< 50k triangles for web)
- Use efficient UV mapping
- Optimize texture sizes (power of 2: 512x512, 1024x1024, etc.)
- Use compressed texture formats when possible

#### GLTF Best Practices
- Use Draco compression for geometry
- Embed textures in GLB for single-file distribution
- Include proper material definitions
- Set up proper lighting and camera positions

#### Naming Conventions
- Use descriptive names for model parts
- Follow the pattern: `partName_materialType_variant.glb`
- Examples:
  - `rhino_body_main.glb`
  - `rhino_nozzle_chrome.glb`
  - `rhino_base_standard.glb`

## Integration

### Loading Models
Models are loaded using the GLTFLoader with Draco compression support:

```javascript
const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('jsm/libs/draco/gltf/');
loader.setDRACOLoader(dracoLoader);
loader.setPath('models/gltf/');
```

### Model Requirements
- Models should be centered at origin (0, 0, 0)
- Use consistent scale (1 unit = 1 meter recommended)
- Include proper material names for color customization
- Set up shadow casting and receiving properties

### Part Naming for Color Customization
For parts that support color changes, use these naming conventions:
- `bucket1` - Main body parts
- `handler1` - Secondary components
- `handler2` - Base/support elements

## File Management

### Version Control
- Use Git LFS for large model files (> 10MB)
- Keep original source files separate from optimized web versions
- Document model changes in commit messages

### Backup Strategy
- Maintain source files in original format (Blender, Maya, etc.)
- Keep multiple optimization levels (high, medium, low poly)
- Store texture source files at full resolution

## Performance Considerations

### Loading Optimization
- Use progressive loading for large models
- Implement LOD (Level of Detail) systems for complex scenes
- Preload critical models, lazy load secondary assets

### Runtime Performance
- Monitor polygon count and draw calls
- Use instancing for repeated elements
- Implement frustum culling for off-screen objects

## Tools and Workflow

### Recommended Tools
- **Blender** - Free, excellent GLTF export
- **glTF-Pipeline** - Command-line optimization
- **gltf-transform** - Advanced processing and optimization
- **Three.js Editor** - Testing and preview

### Export Settings
When exporting from Blender:
- Enable Draco compression
- Include materials and textures
- Set proper coordinate system (Y-up)
- Optimize for file size vs quality

## Troubleshooting

### Common Issues
- **Large file sizes**: Use Draco compression and texture optimization
- **Missing materials**: Ensure proper material export settings
- **Incorrect scale**: Verify unit settings in modeling software
- **Performance issues**: Reduce polygon count and texture resolution

### Debug Tools
- Use Three.js Inspector browser extension
- Monitor performance with browser dev tools
- Test on various devices and connection speeds

## Future Enhancements

### Planned Features
- Automatic LOD generation
- Real-time model optimization
- Advanced material systems
- Animation support expansion

### Model Variants
- Different spray patterns
- Color variations
- Size options
- Seasonal themes