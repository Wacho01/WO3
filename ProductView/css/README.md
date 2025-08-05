# CSS Folder Structure

This folder contains organized stylesheets for the Water Odyssey 3D Viewer application.

## File Organization

### `main.css`
- Base styles and global layout
- Typography and color definitions
- Logo and branding styles
- Responsive design foundations

### `components.css`
- Component-specific styles
- Loading spinner animations
- Viewport containers and camera controls
- Model info panels and drag notices
- Three.js overlay styles

### `control-panel.css`
- Complete control panel styling
- Animation controls and part selection
- Color palette and specifications
- Action buttons and toggle functionality
- Responsive control panel design

### `modal.css`
- Modal dialog styles
- Dimensions modal specific styling
- SVG container and table layouts
- Modal animations and transitions
- Responsive modal design

### `utilities.css`
- Utility classes for common patterns
- Layout helpers (flexbox, positioning)
- Spacing and typography utilities
- Color and border utilities
- Animation and transition helpers

### Legacy CSS Files

#### `base.css`
- Basic body styles (mostly commented out)
- Legacy foundation styles

#### `style_pop.css` & `style_pop_show.css`
- Modal popup styles for video content
- Background overlays and content containers
- Close button styling
- Responsive modal layouts

#### `Rsidenav.css`
- Right-side navigation panel styles
- Slide-in/out animations
- Navigation link styling
- Mobile responsive adjustments

#### `loading_main.css`
- Animated loading spinner styles
- Water wave animation effects
- Circular loading indicators
- CSS keyframe animations

#### `style2.css`
- Alternative layout and styling system
- Comprehensive responsive design
- Advanced border and frame styling
- Complex layout positioning
- Mobile-first responsive breakpoints
- Legacy UI component styles

#### `load.css`
- 3D loading animation with perspective transforms
- Color-changing loading states
- Advanced CSS animations with timing
- Cube rotation effects

#### `info.css`
- jQuery UI customizations
- Info button and dialog styling
- Translucent overlay effects
- Custom close button styling

#### `jquery-ui.css`
- Complete jQuery UI theme
- Comprehensive widget styling
- Icon sprite definitions
- Interaction state styling

## Usage

Import these stylesheets in your main CSS file or HTML:

```css
@import url('./css/main.css');
@import url('./css/components.css');
@import url('./css/control-panel.css');
@import url('./css/modal.css');
@import url('./css/utilities.css');

/* Legacy styles if needed */
@import url('./css/base.css');
@import url('./css/style_pop.css');
@import url('./css/style_pop_show.css');
@import url('./css/Rsidenav.css');
@import url('./css/loading_main.css');
@import url('./css/style2.css');
@import url('./css/load.css');
@import url('./css/info.css');
@import url('./css/jquery-ui.css');
```

Or in HTML:

```html
<link rel="stylesheet" href="css/main.css">
<link rel="stylesheet" href="css/components.css">
<link rel="stylesheet" href="css/control-panel.css">
<link rel="stylesheet" href="css/modal.css">
<link rel="stylesheet" href="css/utilities.css">

<!-- Legacy styles -->
<link rel="stylesheet" href="css/base.css">
<link rel="stylesheet" href="css/style_pop.css">
<link rel="stylesheet" href="css/style_pop_show.css">
<link rel="stylesheet" href="css/Rsidenav.css">
<link rel="stylesheet" href="css/loading_main.css">
<link rel="stylesheet" href="css/style2.css">
<link rel="stylesheet" href="css/load.css">
<link rel="stylesheet" href="css/info.css">
<link rel="stylesheet" href="css/jquery-ui.css">
```

## Design System

### Colors
- Primary: Blue gradient (#3b82f6 to #1d4ed8)
- Secondary: Purple gradient (#8b5cf6 to #7c3aed)
- Success: Green gradient (#10b981 to #059669)
- Danger: Red gradient (#ef4444 to #dc2626)
- Dark: Gray gradient (#1f2937 to #111827)
- Legacy: Water blue (#2a9cd7)

### Typography
- Font sizes: 11px to 24px
- Font weights: 300 to 700
- Line heights: Optimized for readability
- Legacy: Raleway font family

### Spacing
- Base unit: 4px
- Scale: xs(4px), sm(8px), md(12px), lg(16px), xl(24px), 2xl(32px)

### Animations
- Duration: 150ms to 500ms
- Easing: cubic-bezier(0.4, 0, 0.2, 1)
- Hover effects: translateY(-2px), scale(1.05)
- Legacy: Complex 3D transforms and rotations

### Responsive Breakpoints
- Mobile: 640px and below
- Tablet: 768px and below
- Desktop: 1024px and above
- Legacy: 680px, 720px, 960px breakpoints

## Best Practices

1. **Modular Organization**: Each file has a specific purpose
2. **Consistent Naming**: BEM-like methodology for class names
3. **Responsive Design**: Mobile-first approach
4. **Performance**: Optimized animations and transitions
5. **Accessibility**: Focus states and proper contrast ratios
6. **Maintainability**: Well-commented and organized code
7. **Legacy Support**: Preserved original styling systems

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS Grid and Flexbox support required
- Backdrop-filter support for glass effects
- CSS custom properties (variables) support
- 3D transforms for advanced animations

## Integration Notes

The `style2.css` file provides an alternative comprehensive styling system that includes:

- Advanced border frame system with decorative elements
- Complex responsive layout with multiple breakpoints
- Legacy UI components (tray, options, controls)
- Sophisticated animation system
- Mobile-optimized layouts
- Professional color scheme and typography

This can be used alongside or as an alternative to the modern component-based styling system.