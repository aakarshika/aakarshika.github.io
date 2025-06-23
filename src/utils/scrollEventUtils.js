/**
 * Utility functions for handling scroll events with preventDefault and touch support
 */

/**
 * Creates a wheel event handler with preventDefault and optional stopPropagation
 * @param {Function} handler - The wheel event handler function
 * @param {Object} options - Configuration options
 * @param {boolean} options.stopPropagation - Whether to call stopPropagation
 * @param {boolean} options.passive - Whether the event listener should be passive
 * @returns {Function} The configured wheel event handler
 */
export const createWheelHandler = (handler, options = {}) => {
  const { stopPropagation = false, passive = false } = options;
  
  return (e) => {
    e.preventDefault();
    if (stopPropagation) {
      e.stopPropagation();
    }
    handler(e);
  };
};

/**
 * Creates a touch event handler with preventDefault and optional stopPropagation
 * @param {Function} handler - The touch event handler function
 * @param {Object} options - Configuration options
 * @param {boolean} options.stopPropagation - Whether to call stopPropagation
 * @param {boolean} options.passive - Whether the event listener should be passive
 * @returns {Function} The configured touch event handler
 */
export const createTouchHandler = (handler, options = {}) => {
  const { stopPropagation = false, passive = false } = options;
  
  return (e) => {
    e.preventDefault();
    if (stopPropagation) {
      e.stopPropagation();
    }
    handler(e);
  };
};

/**
 * Sets up scroll event listeners on a container element
 * @param {HTMLElement} container - The container element to attach listeners to
 * @param {Object} handlers - Event handler functions
 * @param {Function} handlers.wheel - Wheel event handler
 * @param {Function} handlers.touchStart - Touch start handler (optional)
 * @param {Function} handlers.touchMove - Touch move handler (optional)
 * @param {Object} options - Configuration options
 * @param {boolean} options.useWindow - Whether to attach listeners to window instead of container
 * @param {boolean} options.useCapture - Whether to use capture phase
 * @param {boolean} options.stopPropagation - Whether to call stopPropagation on events
 * @returns {Function} Cleanup function to remove event listeners
 */
export const setupScrollEventListeners = (container, handlers, options = {}) => {
  const { 
    useWindow = false, 
    useCapture = false, 
    stopPropagation = false 
  } = options;
  
  const target = useWindow ? window : container;
  const eventOptions = { passive: false, capture: useCapture };
  
  // Create configured handlers
  const wheelHandler = handlers.wheel 
    ? createWheelHandler(handlers.wheel, { stopPropagation })
    : null;
    
  const touchStartHandler = handlers.touchStart
    ? createTouchHandler(handlers.touchStart, { stopPropagation })
    : null;
    
  const touchMoveHandler = handlers.touchMove
    ? createTouchHandler(handlers.touchMove, { stopPropagation })
    : null;
  
  // Add event listeners
  if (wheelHandler) {
    target.addEventListener('wheel', wheelHandler, eventOptions);
  }
  
  if (touchStartHandler) {
    target.addEventListener('touchstart', touchStartHandler, eventOptions);
  }
  
  if (touchMoveHandler) {
    target.addEventListener('touchmove', touchMoveHandler, eventOptions);
  }
  
  // Return cleanup function
  return () => {
    if (wheelHandler) {
      target.removeEventListener('wheel', wheelHandler, eventOptions);
    }
    if (touchStartHandler) {
      target.removeEventListener('touchstart', touchStartHandler, eventOptions);
    }
    if (touchMoveHandler) {
      target.removeEventListener('touchmove', touchMoveHandler, eventOptions);
    }
  };
};

/**
 * Hook for managing scroll event listeners with automatic cleanup
 * @param {Object} config - Configuration object
 * @param {HTMLElement} config.container - Container element (optional, defaults to window)
 * @param {Function} config.wheelHandler - Wheel event handler
 * @param {Function} config.touchStartHandler - Touch start handler (optional)
 * @param {Function} config.touchMoveHandler - Touch move handler (optional)
 * @param {Object} config.options - Additional options for setupScrollEventListeners
 * @param {Array} config.dependencies - Dependencies array for useEffect
 */
export const useScrollEventListeners = (config) => {
  const { 
    container, 
    wheelHandler, 
    touchStartHandler, 
    touchMoveHandler, 
    options = {}, 
    dependencies = [] 
  } = config;
  
  React.useEffect(() => {
    if (!container && !options.useWindow) {
      console.warn('useScrollEventListeners: No container provided and useWindow is false');
      return;
    }
    
    const cleanup = setupScrollEventListeners(
      container,
      {
        wheel: wheelHandler,
        touchStart: touchStartHandler,
        touchMove: touchMoveHandler
      },
      options
    );
    
    return cleanup;
  }, dependencies);
};

// Re-export React for the hook
import React from 'react'; 