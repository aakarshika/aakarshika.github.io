import { useState, useEffect, useRef } from 'react';

/**
 * Hook for scrolling animation that provides a direct offset value for current node
 * @param {Object} options - Configuration options
 * @param {React.RefObject} options.containerRef - Reference to the scroll container
 * @param {string|null} options.currentNodeId - ID of the current node to animate
 * @param {number} options.sensitivity - Scroll sensitivity multiplier (default: 0.5)
 * @param {number} options.maxOffset - Maximum x offset allowed (default: 100)
 * @param {boolean} options.isActive - Whether the hook is active (default: true)
 */
export const useScrolling = ({
  containerRef,
  currentNodeId,
  sensitivity = 0.5,
  maxOffset,
  isActive = true
}) => {
  const [xOffset, setXOffset] = useState(0);
  const animationRef = useRef(null);

  useEffect(() => {
    // console.log('xOffset', xOffset);
  }, [xOffset]);
  // Handle wheel events
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isActive || !currentNodeId) return;

    const wheelHandler = (e) => {
      e.preventDefault();
      
      const deltaY = e.deltaY;
      
      setXOffset(prevOffset => {
        // Calculate new offset based on scroll direction
        // Positive deltaY (scrolling down) moves left, negative moves right
        const newOffset = prevOffset + (deltaY * sensitivity);
        
        // Clamp the offset to the maximum allowed range
        const clampedOffset = Math.max(0, Math.min(maxOffset, newOffset));
        
        
        return clampedOffset;
      });
    };

    // Add event listener with passive: false to allow preventDefault
    container.addEventListener('wheel', wheelHandler, { passive: false });

    return () => {
      container.removeEventListener('wheel', wheelHandler);
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [containerRef]);

  // Reset offset when current node changes
  // useEffect(() => {
  //   setXOffset(0);
  // }, [currentNodeId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, []);

  return {
    xOffset
  };
}; 