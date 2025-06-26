/**
 * Progress Animation Utility Library
 * 
 * A modular animation system that animates objects based on scroll progress.
 * Uses JSON-based configuration with explicit initialValue and finalValue for precise control.
 * 
 * Features:
 * - Precalculated timeline approach for efficient performance
 * - Support for fade, slideX, slideY, scale, and rotate animations
 * - Automatic fallback values between animations
 * - Type-appropriate default values
 * - Clean JSON configuration format
 * 
 * Animation Types:
 * - fade: Opacity animation (0 = invisible, 1 = fully visible)
 * - slideX: Horizontal position animation (0 = original position, positive = right, negative = left)
 * - slideY: Vertical position animation (0 = original position, positive = down, negative = up)
 * - scale: Scale animation (0 = no scale, 1 = normal size, >1 = larger)
 * - rotate: Rotation animation (degrees)
 * 
 * Configuration Format:
 * {
 *   object: 'elementName',
 *   anim: [
 *     { type: 'fade', initialValue: 0, finalValue: 1, startTiming: 0, duration: 15 },
 *     { type: 'slideY', initialValue: 50, finalValue: 0, startTiming: 0, duration: 15 }
 *   ]
 * }
 * 
 * Timeline System:
 * - Animations are precalculated into timeline periods
 * - Gaps between animations are automatically filled with fallback values
 * - Fallback values maintain the final state of completed animations
 * - Default values are used before any animations start
 * 
 * Usage Example:
 * const animationConfig = [
 *   {
 *     object: 'title',
 *     anim: [
 *       { type: 'fade', initialValue: 0, finalValue: 1, startTiming: 0, duration: 15 },
 *       { type: 'slideY', initialValue: 50, finalValue: 0, startTiming: 0, duration: 15 },
 *       { type: 'fade', initialValue: 1, finalValue: 0, startTiming: 50, duration: 10 }
 *     ]
 *   }
 * ];
 * 
 * const animations = calculateAnimations(animationConfig, progress);
 * // Result: { title: { fade: 0.5, slideY: 25 } }
 */

/**
 * Animation speed constants for each animation type
 */
const ANIMATION_SPEEDS = {
  fade: 0.1,      // opacity increase per progress tick
  scale: 0.1,     // scale increase per progress tick
  slideX: 3,      // pixels per progress tick
  slideY: 3,      // pixels per progress tick
  rotate: 3       // degrees per progress tick
};

/**
 * Default animation values
 */
const DEFAULT_ANIMATION = {
  start: 5,
  initialValue: 0,
  duration: 3,
  direction: 'none'
};

/**
 * Calculate animation value for a single animation
 * @param {Object} anim - Animation configuration
 * @param {number} progress - Current progress percentage (0-100)
 * @returns {number} Calculated animation value
 */
const calculateSingleAnimation = (anim, progress) => {
  const { type, initialValue, finalValue, startTiming, duration } = anim;
  
  // Set default finalValue based on type if not provided
  let effectiveFinalValue = finalValue;
  if (effectiveFinalValue === undefined) {
    if (type === 'fade') {
      effectiveFinalValue = 1; // Default to fully visible
    } else if (type === 'slideX' || type === 'slideY') {
      effectiveFinalValue = 0; // For slides, 0 means original position
    } else {
      effectiveFinalValue = 1;
    }
  }
  
  // Check if animation should be active
  if (progress < startTiming) {
    return initialValue;
  }
  
  if (progress >= startTiming + duration) {
    return effectiveFinalValue;
  }
  
  // Calculate animation progress (0 to 1)
  const animationProgress = (progress - startTiming) / duration;
  
  // Interpolate between initial and final values
  const currentValue = initialValue + (effectiveFinalValue - initialValue) * animationProgress;
  
  return currentValue;
};

/**
 * Precalculate timeline for an object's animations
 * @param {Array} animations - Array of animation objects
 * @returns {Array} Timeline array with {start, end, value} objects
 */
const precalculateTimeline = (animations) => {
  if (!animations || animations.length === 0) {
    return [];
  }

  // Sort animations by startTiming
  const sortedAnimations = [...animations].sort((a, b) => a.startTiming - b.startTiming);
  
  const timeline = [];
  // Set default fallback based on animation type
  const animationType = sortedAnimations[0]?.type || 'fade';
  let currentFallback = animationType === 'fade' ? 0 : 0; // 0 for fade (invisible), 0 for slides (original position)
  
  // console.log(`Precalculating timeline for animations:`, sortedAnimations);
  
  sortedAnimations.forEach((animation, index) => {
    const { initialValue, finalValue, startTiming, duration, type } = animation;
    
    // Set default finalValue based on type if not provided
    let effectiveFinalValue = finalValue;
    if (effectiveFinalValue === undefined) {
      if (type === 'fade') {
        effectiveFinalValue = 1; // Default to fully visible
      } else if (type === 'slideX' || type === 'slideY') {
        effectiveFinalValue = 0; // For slides, 0 means original position
      } else {
        effectiveFinalValue = 1;
      }
    }
    
    // console.log(`Animation ${index}: startTiming=${startTiming}, duration=${duration}, initialValue=${initialValue}, finalValue=${effectiveFinalValue}, type=${type}`);
    
    // Add gap period if there's a gap between previous animation and this one
    if (index === 0 && startTiming > 0) {
      // Gap from 0 to first animation
      timeline.push({
        start: 0,
        end: startTiming,
        value: currentFallback,
        type: 'fallback'
      });
      // console.log(`Added gap: 0-${startTiming}, value=${currentFallback}`);
    } else if (index > 0) {
      const previousAnimation = sortedAnimations[index - 1];
      const previousEnd = previousAnimation.startTiming + previousAnimation.duration;
      if (startTiming > previousEnd) {
        // Gap between animations
        timeline.push({
          start: previousEnd,
          end: startTiming,
          value: currentFallback,
          type: 'fallback'
        });
        // console.log(`Added gap: ${previousEnd}-${startTiming}, value=${currentFallback}`);
      }
    }
    
    // Add animation period
    timeline.push({
      start: startTiming,
      end: startTiming + duration,
      initialValue,
      finalValue: effectiveFinalValue,
      type: 'animation'
    });
    // console.log(`Added animation: ${startTiming}-${startTiming + duration}, ${initialValue}->${effectiveFinalValue}`);
    
    // Update fallback to this animation's final value
    currentFallback = effectiveFinalValue;
  });
  
  // console.log(`Final timeline:`, timeline);
  return timeline;
};

/**
 * Get value from precalculated timeline
 * @param {Array} timeline - Precalculated timeline
 * @param {number} progress - Current progress
 * @returns {number} Current value
 */
const getValueFromTimeline = (timeline, progress) => {
  if (!timeline || timeline.length === 0) {
    return 0; // Default value
  }
  
  // Find the current period
  for (const period of timeline) {
    if (progress >= period.start && progress < period.end) {
      if (period.type === 'fallback') {
        return period.value;
      } else if (period.type === 'animation') {
        // Interpolate between initial and final values
        const animationProgress = (progress - period.start) / (period.end - period.start);
        return period.initialValue + (period.finalValue - period.initialValue) * animationProgress;
      }
    }
  }
  
  // If progress is beyond all animations, return the last fallback value
  // Find the last period and get its final value
  const lastPeriod = timeline[timeline.length - 1];
  if (lastPeriod.type === 'fallback') {
    return lastPeriod.value;
  } else if (lastPeriod.type === 'animation') {
    return lastPeriod.finalValue;
  }
  
  return 0; // Emergency fallback
};

/**
 * Memoized timeline cache to avoid recalculating timelines
 */
const timelineCache = new Map();

/**
 * Get or create timeline for animations (memoized)
 * @param {Array} animations - Array of animation objects
 * @returns {Array} Timeline array
 */
const getMemoizedTimeline = (animations) => {
  // Create a cache key from the animations array
  const cacheKey = JSON.stringify(animations);
  
  if (timelineCache.has(cacheKey)) {
    return timelineCache.get(cacheKey);
  }
  
  const timeline = precalculateTimeline(animations);
  timelineCache.set(cacheKey, timeline);
  return timeline;
};

/**
 * Calculate all animations for an object (optimized version)
 * @param {Object} objectConfig - Object with 'object' and 'anim' properties
 * @param {number} progress - Current progress percentage (0-100)
 * @returns {Object} Animation values for each animation type
 */
export const calculateObjectAnimations = (objectConfig, progress) => {
  const { object, anim } = objectConfig;
  
  if (!anim || !Array.isArray(anim)) {
    return {};
  }

  const animations = {};
  
  // Group animations by type to handle multiple animations of the same type
  const groupedAnimations = {};
  anim.forEach(animation => {
    const { type } = animation;
    if (type) {
      if (!groupedAnimations[type]) {
        groupedAnimations[type] = [];
      }
      groupedAnimations[type].push(animation);
    }
  });

  // Calculate values for each animation type using precalculated timeline
  Object.keys(groupedAnimations).forEach(type => {
    const typeAnimations = groupedAnimations[type];
    
    if (type === 'fade' || type === 'slideX' || type === 'slideY') {
      // Use memoized timeline for fade and slide animations
      const timeline = getMemoizedTimeline(typeAnimations);
      const value = getValueFromTimeline(timeline, progress);
      animations[type] = value;
      // console.log(`${type} timeline result: progress=${progress}, value=${value}`);
    } else {
      // For other animations, use the last active one (or combine as needed)
      let finalValue = 0;
      typeAnimations.forEach(animation => {
        const value = calculateSingleAnimation(animation, progress);
        // For non-fade/slide animations, we might want to add or use the last one
        // For now, let's use the last active animation
        if (progress >= animation.startTiming && progress <= animation.startTiming + animation.duration) {
          finalValue = value;
        }
      });
      animations[type] = finalValue;
    }
  });

  return animations;
};

/**
 * Calculate animations for multiple objects
 * @param {Array} animationConfig - Array of object configurations
 * @param {number} progress - Current progress percentage (0-100)
 * @returns {Object} Animation values for each object
 */
export const calculateAnimations = (animationConfig, progress) => {
  if (!Array.isArray(animationConfig)) {
    return {};
  }

  const results = {};
  
  animationConfig.forEach(objectConfig => {
    const { object } = objectConfig;
    if (object) {
      results[object] = calculateObjectAnimations(objectConfig, progress);
    }
  });

  return results;
};

/**
 * Predefined animation configurations for common use cases
 */
export const AnimationPresets = {
  // Simple fade in
  fadeIn: { type: 'fade', initialValue: 0, finalValue: 1, startTiming: 0, duration: 5 },
  
  // Fade out
  fadeOut: { type: 'fade', initialValue: 1, finalValue: 0, startTiming: 80, duration: 5 },
  
  // Scale up
  scaleUp: { type: 'scale', initialValue: 0.5, finalValue: 1, startTiming: 10, duration: 8 },
  
  // Slide in from left
  slideInLeft: { type: 'slideX', initialValue: -100, finalValue: 0, startTiming: 15, duration: 10 },
  
  // Slide in from right
  slideInRight: { type: 'slideX', initialValue: 100, finalValue: 0, startTiming: 15, duration: 10 },
  
  // Slide up from bottom
  slideUp: { type: 'slideY', initialValue: 50, finalValue: 0, startTiming: 20, duration: 8 },
  
  // Rotate in
  rotateIn: { type: 'rotate', initialValue: 0, finalValue: 360, startTiming: 25, duration: 6 }
};

/**
 * Example usage:
 * 
 * const animationConfig = [
 *   {
 *     object: 'title',
 *     anim: [
 *       { type: 'fade', initialValue: 0, startTiming: 0, duration: 5 },
 *       { type: 'slideY', initialValue: 50, startTiming: 0, duration: 8 }
 *     ]
 *   },
 *   {
 *     object: 'card1',
 *     anim: [
 *       { type: 'slideX', initialValue: -100, startTiming: 15, duration: 10 },
 *       { type: 'scale', initialValue: 0.8, startTiming: 15, duration: 8 }
 *     ]
 *   }
 * ];
 * 
 * const animations = calculateAnimations(animationConfig, progress);
 * // Result: { title: { fade: 0.5, slideY: 25 }, card1: { slideX: -50, scale: 0.9 } }
 */ 