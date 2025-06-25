# Progress Animation Utils

A modular animation system that animates objects based on scroll progress. Uses JSON-based configuration with simple linear animations.

## Features

- **JSON-based configuration**: Simple array of objects with animation definitions
- **Progress-based animations**: Animations triggered by scroll progress (0-100%)
- **Multiple animation types**: Fade, slideX, slideY, scale, rotate
- **Linear animations**: Simple, predictable movement without complex easing
- **Direction support**: Normal and reverse animation directions
- **Modular design**: Easy to use and extend
- **Default values**: Sensible defaults for all animation properties

## Quick Start

```jsx
import { calculateAnimations } from '../utils/progressAnimationUtils';

const MyComponent = ({ progress }) => {
  // Define animation configuration
  const animationConfig = [
    {
      object: 'title',
      anim: [
        { type: 'fade', initialValue: 0, startTiming: 0, duration: 5 },
        { type: 'slideY', initialValue: 50, startTiming: 0, duration: 8 }
      ]
    }
  ];
  
  // Calculate animation values
  const animations = calculateAnimations(animationConfig, progress);
  
  return (
    <motion.h1 style={{ 
      opacity: animations.title?.fade || 0, 
      y: animations.title?.slideY || 0 
    }}>
      Animated Title
    </motion.h1>
  );
};
```

## Configuration Format

The animation system uses a JSON array where each object represents an element to animate:

```javascript
[
  {
    object: 'elementName',  // Unique identifier for the element
    anim: [                 // Array of animations to apply
      {
        type: 'fade',           // Animation type
        initialValue: 0,        // Starting value
        startTiming: 5,         // Progress when animation starts
        duration: 3,            // How long animation lasts
        direction: 'none'       // 'none' or 'reverse'
      }
    ]
  }
]
```

## Animation Types

### Available Types:
- **`fade`** - Opacity animation (0 to 1)
- **`slideX`** - Horizontal movement (pixels)
- **`slideY`** - Vertical movement (pixels)
- **`scale`** - Scale transformation (0.1 to 2.0)
- **`rotate`** - Rotation (degrees)

### Animation Speeds:
- **fade**: 0.1 opacity per progress tick
- **scale**: 0.1 scale per progress tick
- **slideX/slideY**: 10px per progress tick
- **rotate**: 3 degrees per progress tick

## API Reference

### Core Functions

#### `calculateAnimations(animationConfig, progress)`
Calculates animation values for all objects.

**Parameters:**
- `animationConfig` (Array): Array of object configurations
- `progress` (number): Current progress percentage (0-100)

**Returns:** Object with animation values for each object

**Example:**
```javascript
const animations = calculateAnimations(animationConfig, progress);
// Result: { title: { fade: 0.5, slideY: 25 }, card: { slideX: -50 } }
```

#### `calculateObjectAnimations(objectConfig, progress)`
Calculates animations for a single object.

**Parameters:**
- `objectConfig` (Object): Single object configuration
- `progress` (number): Current progress percentage (0-100)

**Returns:** Animation values for the object

### Helper Functions

#### `createFadeAnimation(initialValue?, startTiming?, duration?, direction?)`
Creates a fade animation configuration.

#### `createScaleAnimation(initialValue?, startTiming?, duration?, direction?)`
Creates a scale animation configuration.

#### `createSlideXAnimation(initialValue?, startTiming?, duration?, direction?)`
Creates a horizontal slide animation configuration.

#### `createSlideYAnimation(initialValue?, startTiming?, duration?, direction?)`
Creates a vertical slide animation configuration.

#### `createRotateAnimation(initialValue?, startTiming?, duration?, direction?)`
Creates a rotation animation configuration.

### Default Values

If not specified, animations use these defaults:
- `initialValue`: 0
- `startTiming`: 5
- `duration`: 3
- `direction`: 'none'

## Usage Examples

### 1. Simple Single Element

```jsx
const animationConfig = [
  {
    object: 'title',
    anim: [
      { type: 'fade', initialValue: 0, startTiming: 10, duration: 5 },
      { type: 'slideY', initialValue: 30, startTiming: 10, duration: 8 }
    ]
  }
];

const animations = calculateAnimations(animationConfig, progress);

return (
  <motion.h1 style={{ 
    opacity: animations.title?.fade || 0, 
    y: animations.title?.slideY || 0 
  }}>
    Title
  </motion.h1>
);
```

### 2. Multiple Elements with Different Animations

```jsx
const animationConfig = [
  {
    object: 'title',
    anim: [
      { type: 'fade', initialValue: 0, startTiming: 0, duration: 5 },
      { type: 'slideY', initialValue: 50, startTiming: 0, duration: 8 }
    ]
  },
  {
    object: 'card1',
    anim: [
      { type: 'slideX', initialValue: -100, startTiming: 15, duration: 10 },
      { type: 'scale', initialValue: 0.8, startTiming: 15, duration: 8 }
    ]
  },
  {
    object: 'card2',
    anim: [
      { type: 'slideX', initialValue: 100, startTiming: 15, duration: 10 },
      { type: 'scale', initialValue: 0.8, startTiming: 15, duration: 8 }
    ]
  }
];
```

### 3. Reverse Animations

```jsx
const animationConfig = [
  {
    object: 'element',
    anim: [
      { type: 'fade', initialValue: 0, startTiming: 0, duration: 5 },
      { type: 'fade', initialValue: 1, startTiming: 80, duration: 5, direction: 'reverse' }
    ]
  }
];
```

### 4. Staggered Animations

```jsx
const animationConfig = [
  {
    object: 'item1',
    anim: [{ type: 'fade', initialValue: 0, startTiming: 20, duration: 8 }]
  },
  {
    object: 'item2',
    anim: [{ type: 'fade', initialValue: 0, startTiming: 22, duration: 8 }]
  },
  {
    object: 'item3',
    anim: [{ type: 'fade', initialValue: 0, startTiming: 24, duration: 8 }]
  }
];
```

### 5. Complex Multi-Animation Element

```jsx
const animationConfig = [
  {
    object: 'heroCard',
    anim: [
      { type: 'fade', initialValue: 0, startTiming: 10, duration: 8 },
      { type: 'slideY', initialValue: 60, startTiming: 10, duration: 10 },
      { type: 'scale', initialValue: 0.7, startTiming: 10, duration: 12 },
      { type: 'rotate', initialValue: -5, startTiming: 10, duration: 8 }
    ]
  }
];
```

## Integration with Framer Motion

Apply the calculated values to motion components:

```jsx
<motion.div style={{ 
  opacity: animations.element?.fade || 0, 
  x: animations.element?.slideX || 0, 
  y: animations.element?.slideY || 0, 
  scale: animations.element?.scale || 1,
  rotate: `${animations.element?.rotate || 0}deg`
}}>
  Content
</motion.div>
```

## Best Practices

1. **Plan your progress ranges**: Ensure animations don't overlap unless intended
2. **Use meaningful object names**: Make object names descriptive and unique
3. **Keep durations reasonable**: 5-15 progress units work well for most animations
4. **Test timing**: Verify animation timing works across different screen sizes
5. **Use defaults**: Leverage default values to reduce configuration complexity
6. **Group related animations**: Keep animations for the same element together

## Performance

- Calculations are lightweight and optimized
- Linear animations are computationally simple
- No complex easing functions to calculate
- Efficient for real-time progress updates
- Minimal memory footprint

## Migration from Old Format

If migrating from the previous version:

1. **Replace object-based config with array format**
2. **Convert animation properties to new structure**
3. **Update property names** (e.g., `start` → `startTiming`)
4. **Remove complex easing references**
5. **Update component usage** to access new result structure 