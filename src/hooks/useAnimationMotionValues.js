import { useMemo } from 'react';
import { useTransform } from 'framer-motion';
import { calculateAnimations } from '../utils/progressAnimationUtils';

/**
 * Hook to create motion values for animations without causing component rerenders
 * Uses Framer Motion's useTransform to create derived motion values directly from progress
 * Only the specific motion.div elements update, not the parent component
 * 
 * @param {MotionValue} progressMotionValue - Motion value representing scroll progress (0-100)
 * @param {Array} animationConfig - Animation configuration array
 * @returns {Object} Object with motion values for each animated element
 * 
 * Example:
 * const { title, mainComponent } = useAnimationMotionValues(progress, animationConfig);
 * // title.fade, title.slideY are motion values that can be used directly in style props
 */
export const useAnimationMotionValues = (progressMotionValue, animationConfig) => {
  // Memoize the config to prevent recreating transforms
  const memoizedConfig = useMemo(() => animationConfig, [JSON.stringify(animationConfig)]);
  
  // Create motion values for each object in the config
  const motionValues = useMemo(() => {
    if (!memoizedConfig || !Array.isArray(memoizedConfig)) {
      return {};
    }
    
    const result = {};
    
    memoizedConfig.forEach(({ object, anim }) => {
      if (!object || !anim) return;
      
      const objectValues = {};
      
      // Group animations by type
      const animationsByType = {};
      anim.forEach(animation => {
        const { type } = animation;
        if (type) {
          if (!animationsByType[type]) {
            animationsByType[type] = [];
          }
          animationsByType[type].push(animation);
        }
      });
      
      // Create a transform for each animation type
      Object.keys(animationsByType).forEach(type => {
        const typeAnimations = animationsByType[type];
        const objectConfig = { object, anim: typeAnimations };
        
        // Transform progress motion value through the animation calculation
        objectValues[type] = useTransform(
          progressMotionValue,
          (progress) => {
            const animations = calculateAnimations([objectConfig], progress);
            return animations[object]?.[type] ?? 0;
          }
        );
      });
      
      result[object] = objectValues;
    });
    
    return result;
  }, [progressMotionValue, memoizedConfig]);
  
  return motionValues;
};
