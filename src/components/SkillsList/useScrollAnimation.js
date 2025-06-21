import { useState, useRef } from 'react';

/**
 * Custom hook for scroll animation in SkillsList
 * Handles wheel events, animation progress, and completion logic
 */
export function useScrollAnimation({ 
  removingNodes, 
  visibleNodes, 
  positioning, 
  findParentNode,
  getNodeState,
  onAnimationComplete 
}) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const lastScrollTime = useRef(0);
  const scrollSpeed = useRef(1);

  // Handle mouse wheel scroll for animation
  const handleWheel = (e) => {
    if (removingNodes.length === 0 || !positioning) return;
    
    e.preventDefault();
    
    const currentTime = Date.now();
    const timeDelta = currentTime - lastScrollTime.current;
    lastScrollTime.current = currentTime;
    
    // Calculate scroll speed based on time between scroll events
    // Faster scrolling = smaller time delta = higher speed multiplier
    const baseSpeed = 1;
    const speedMultiplier = timeDelta > 0 ? Math.min(5, Math.max(0.1, 100 / timeDelta)) : baseSpeed;
    scrollSpeed.current = speedMultiplier;
    
    const delta = e.deltaY > 0 ? 1 : -1; // Positive for scroll down, negative for scroll up
    const baseTickSize = 1 / 200; // Much smaller base tick size for slower movement
    const tickSize = baseTickSize * speedMultiplier; // Adjust tick size based on speed
    
    setScrollProgress(prev => {
      const newProgress = Math.max(0, Math.min(1, prev + (delta * tickSize)));
      
      // Check if any removing node has reached its parent's position
      const hasReachedParent = removingNodes.some(node => {
        const parent = findParentNode(node.name);
        if (!parent) return false;
        
        const parentIndex = visibleNodes.findIndex(n => n.name === parent.name);
        if (parentIndex === -1) return false;
        
        const parentX = positioning.startX + parentIndex * (positioning.adjustedBoxWidth + positioning.boxMargin);
        const childIndex = visibleNodes.findIndex(n => n.name === node.name);
        if (childIndex === -1) return false;
        
        const childX = positioning.startX + childIndex * (positioning.adjustedBoxWidth + positioning.boxMargin);
        const currentX = childX + (parentX - childX) * newProgress;
        
        // Check if positions are close enough (within 1px tolerance)
        return Math.abs(currentX - parentX) < 1;
      });
      
      // If any node has reached its parent, trigger the highlight immediately
      if (hasReachedParent && !isAnimating) {
        setIsAnimating(true);
        if (onAnimationComplete) {
          onAnimationComplete();
        }
        // Reset immediately
        setScrollProgress(0);
        setIsAnimating(false);
        return 0;
      }
      
      return newProgress;
    });
  };

  // Calculate animated position for removing nodes
  const getAnimatedPosition = (node, baseX) => {
    if (getNodeState(node) !== 'removing') return baseX;
    
    const parent = findParentNode(node.name);
    if (!parent) return baseX;
    
    const parentIndex = visibleNodes.findIndex(n => n.name === parent.name);
    if (parentIndex === -1) return baseX;
    
    const parentX = positioning.startX + parentIndex * (positioning.adjustedBoxWidth + positioning.boxMargin);
    const childX = baseX;
    
    // Direct interpolation between child and parent position based on scroll progress
    // This makes the position immediately responsive to scroll input
    return childX + (parentX - childX) * scrollProgress;
  };

  // Calculate opacity for removing nodes based on scroll progress
  const getRemovingNodeOpacity = (node) => {
    if (getNodeState(node) !== 'removing') return 0.4;
    return 0.4 * (1 - scrollProgress); // Fade out as it moves toward parent
  };

  return {
    scrollProgress,
    isAnimating,
    scrollSpeed: scrollSpeed.current,
    handleWheel,
    getAnimatedPosition,
    getRemovingNodeOpacity
  };
} 