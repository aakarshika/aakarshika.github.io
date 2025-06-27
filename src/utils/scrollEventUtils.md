# Scroll Event Utils

A utility library for handling scroll events with preventDefault and touch support across different components.

## Features

- **Consistent Event Handling**: Standardized wheel and touch event handling with preventDefault
- **Flexible Configuration**: Support for different event listener options (capture, passive, etc.)
- **Automatic Cleanup**: Proper event listener cleanup to prevent memory leaks
- **Touch Support**: Built-in touch event handling for mobile devices
- **Window/Container Support**: Can attach listeners to either window or specific containers

## Usage Examples

### Basic Wheel Event Handler

```javascript
import { createWheelHandler } from '../utils/scrollEventUtils';

const myWheelHandler = (e) => {
  // Your wheel event logic here
  // console.log('Wheel delta:', e.deltaY);
};

const configuredHandler = createWheelHandler(myWheelHandler);
// configuredHandler automatically calls preventDefault()
```

### Setting Up Event Listeners

```javascript
import { setupScrollEventListeners } from '../utils/scrollEventUtils';

useEffect(() => {
  const container = containerRef.current;
  if (!container) return;

  const wheelHandler = (e) => {
    // Your wheel logic
  };

  const touchHandler = (e) => {
    // Your touch logic
  };

  const cleanup = setupScrollEventListeners(container, {
    wheel: wheelHandler,
    touchMove: touchHandler
  });

  return cleanup; // Automatically removes listeners
}, [dependencies]);
```

### Using with Window Events

```javascript
const cleanup = setupScrollEventListeners(
  null, // Use window as target
  {
    wheel: handleWheel,
    touchStart: handleTouchStart,
    touchMove: handleTouchMove
  },
  {
    useWindow: true,
    useCapture: true, // Use capture phase
    stopPropagation: true // Call stopPropagation
  }
);
```

### Using the Hook

```javascript
import { useScrollEventListeners } from '../utils/scrollEventUtils';

const MyComponent = () => {
  const containerRef = useRef(null);

  useScrollEventListeners({
    container: containerRef.current,
    wheelHandler: (e) => {
      // Handle wheel events
    },
    touchMoveHandler: (e) => {
      // Handle touch events
    },
    options: {
      stopPropagation: true
    },
    dependencies: [/* your dependencies */]
  });

  return <div ref={containerRef}>Content</div>;
};
```

## API Reference

### `createWheelHandler(handler, options)`

Creates a configured wheel event handler.

**Parameters:**
- `handler` (Function): The wheel event handler function
- `options` (Object): Configuration options
  - `stopPropagation` (boolean): Whether to call stopPropagation
  - `passive` (boolean): Whether the event listener should be passive

**Returns:** Function - The configured wheel event handler

### `createTouchHandler(handler, options)`

Creates a configured touch event handler.

**Parameters:**
- `handler` (Function): The touch event handler function
- `options` (Object): Configuration options
  - `stopPropagation` (boolean): Whether to call stopPropagation
  - `passive` (boolean): Whether the event listener should be passive

**Returns:** Function - The configured touch event handler

### `setupScrollEventListeners(container, handlers, options)`

Sets up scroll event listeners on a container element.

**Parameters:**
- `container` (HTMLElement): The container element to attach listeners to
- `handlers` (Object): Event handler functions
  - `wheel` (Function): Wheel event handler
  - `touchStart` (Function): Touch start handler (optional)
  - `touchMove` (Function): Touch move handler (optional)
- `options` (Object): Configuration options
  - `useWindow` (boolean): Whether to attach listeners to window instead of container
  - `useCapture` (boolean): Whether to use capture phase
  - `stopPropagation` (boolean): Whether to call stopPropagation on events

**Returns:** Function - Cleanup function to remove event listeners

### `useScrollEventListeners(config)`

Hook for managing scroll event listeners with automatic cleanup.

**Parameters:**
- `config` (Object): Configuration object
  - `container` (HTMLElement): Container element (optional, defaults to window)
  - `wheelHandler` (Function): Wheel event handler
  - `touchStartHandler` (Function): Touch start handler (optional)
  - `touchMoveHandler` (Function): Touch move handler (optional)
  - `options` (Object): Additional options for setupScrollEventListeners
  - `dependencies` (Array): Dependencies array for useEffect

## Migration Guide

### From Manual Event Listeners

**Before:**
```javascript
useEffect(() => {
  const handleWheel = (e) => {
    e.preventDefault();
    // Your logic
  };

  container.addEventListener('wheel', handleWheel, { passive: false });
  
  return () => {
    container.removeEventListener('wheel', handleWheel);
  };
}, []);
```

**After:**
```javascript
useEffect(() => {
  const handleWheel = (e) => {
    // Your logic (preventDefault is handled automatically)
  };

  const cleanup = setupScrollEventListeners(container, {
    wheel: handleWheel
  });

  return cleanup;
}, []);
```

## Benefits

1. **Reduced Code Duplication**: Common event handling patterns are centralized
2. **Consistent Behavior**: All components use the same event handling approach
3. **Better Maintainability**: Changes to event handling logic only need to be made in one place
4. **Memory Leak Prevention**: Automatic cleanup ensures proper event listener removal
5. **Type Safety**: Better TypeScript support with proper function signatures 