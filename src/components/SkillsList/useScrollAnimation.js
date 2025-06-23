import { useState, useRef, useEffect, useMemo } from 'react';
import { 
  getNodeCurrentPosition, 
  getNodeTargetPosition, 
  interpolatePosition 
} from '../../utils/treeUtils';
import { setupScrollEventListeners } from '../../utils/scrollEventUtils';

/**
 * Position calculation utilities
 */
export const PositionCalculator = {
  /**
   * Get the current position of a node from the positioning data
   */
  getNodeCurrentPosition,

  /**
   * Get the target position of a node (parent position for removing nodes)
   */
  getNodeTargetPosition,

  /**
   * Calculate the interpolated position between start and target based on progress
   */
  interpolatePosition,

  /**
   * Calculate all node positions for animation (start and target)
   */
  getTargetAndStartPosition: (removingNodes, positioning, findParentNode) => {
    const nodePositions = new Map();
    
    removingNodes.forEach(node => {
      const startPosition = PositionCalculator.getNodeCurrentPosition(node, positioning);
      const targetPosition = PositionCalculator.getNodeTargetPosition(node, positioning, findParentNode);
      
      nodePositions.set(node.id, {
        startPosition,
        targetPosition,
        node
      });
    });
    
    return nodePositions;
  },

  // /**
  //  * Get the animated position for a node based on cached positions, scroll progress, and direction
  //  */
  // getAnimatedPosition: (nodeId, nodePositions, scrollProgress, direction = 'forward') => {
  //   const positionData = nodePositions.get(nodeId);
  //   if (!positionData) return null;
    
  //   const { startPosition, targetPosition } = positionData;
    
  //   // For backward direction, swap start and target positions
  //   const actualStart = direction === 'backward' ? targetPosition : startPosition;
  //   const actualTarget = direction === 'backward' ? startPosition : targetPosition;
    
  //   return PositionCalculator.interpolatePosition(actualStart, actualTarget, scrollProgress);
  // },

  // /**
  //  * Check if a node has reached its target position based on direction
  //  */
  // hasReachedTarget: (nodeId, nodePositions, progress, direction = 'forward') => {
  //   const positionData = nodePositions.get(nodeId);
  //   if (!positionData) return false;
    
  //   const { startPosition, targetPosition } = positionData;
  //   if (startPosition === null || targetPosition === null) return false;
    
  //   // For backward direction, swap start and target positions
  //   const actualStart = direction === 'backward' ? targetPosition : startPosition;
  //   const actualTarget = direction === 'backward' ? startPosition : targetPosition;
    
  //   const interpolatedPosition = PositionCalculator.interpolatePosition(actualStart, actualTarget, progress);
  //   return Math.abs(interpolatedPosition - actualTarget) < 1;
  // }
};

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
  containerRef,
  highlightedNodes,
  onAnimationComplete 
}) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollDirection, setScrollDirection] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [completionTrigger, setCompletionTrigger] = useState(null);
  // Cache node positions when removingNodes or positioning changes
  const nodePositions = useMemo(() => {
    if (removingNodes.length === 0 || !positioning) {
      return new Map();
    }
    return PositionCalculator.getTargetAndStartPosition(removingNodes, positioning, findParentNode);
  }, [removingNodes]);

  // Handle animation completion
  useEffect(() => {
    if (completionTrigger && onAnimationComplete) {
      onAnimationComplete(completionTrigger);
      setCompletionTrigger(null);
    }
  }, [completionTrigger, onAnimationComplete]);

  // Set up wheel event listener with passive: false
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const wheelHandler = (e) => {
      // console.log("wheelHandler", e.pageY);
        // if((e.pageY > 500  && e.pageY < 600)){
        //   e.preventDefault();
        // } else {
        //   return;
        // }
      // console.log("doing stuff");
      
      // Direct correlation between deltaY and scroll progress
      const delta = e.deltaY;
      const scrollSensitivity = 0.01; // Adjust this value to control scroll sensitivity
      const progressChange = delta * scrollSensitivity;
      
      // Set scroll direction based on delta
      const newDirection = delta > 0 ? 'merging' : 'splitting';
      setScrollDirection(newDirection);
      setScrollProgress(prev => {
        const newProgress = prev + progressChange;
        if (newDirection === 'merging' && removingNodes.length === 0 && newProgress>=1.0) {
          console.log("REACHED START");
          return 1;
        }
        if (newDirection === 'splitting' && highlightedNodes.length === 0 && newProgress<=0.0) {
          console.log("REACHED END");
          return 0;
        }
        // Check for forward completion (progress reaches 1.0)
        if (newDirection === 'merging' && newProgress >= 1.0) {
          // setIsAnimating(true);
          setCompletionTrigger("forward");
          return 0; // Keep at 1 to maintain the completed state
        }
        
        // Check for backward completion (progress reaches 0.0)
        if (newDirection === 'splitting' && newProgress <= 0.0) {
          // setIsAnimating(true);
          setCompletionTrigger("backward");
          return 1; // Keep at 0 to maintain the completed state
        }
        return newProgress;
      });
    };

    // Use the utility function to set up event listeners
    const cleanup = setupScrollEventListeners(container, {
      wheel: wheelHandler
    });

    return cleanup;
  }, [removingNodes, positioning, nodePositions, onAnimationComplete, highlightedNodes]);

  // Calculate animated position for removing nodes using cached positions
  // const getAnimatedPosition = (node) => {
  //   if (getNodeState(node) !== 'removing') {
  //     // For non-removing nodes, return their current position
  //     return PositionCalculator.getNodeCurrentPosition(node, positioning);
  //   }
    
  //   // Determine direction based on current scroll direction
  //   const direction = scrollDirection === 'splitting' ? 'backward' : 'forward';
    
  //   return PositionCalculator.getAnimatedPosition(node.id, nodePositions, scrollProgress, direction);
  // };

  // Calculate opacity for removing nodes based on scroll progress
  const getRemovingNodeOpacity = (node) => {
    if (getNodeState(node) !== 'removing') return 0.4;
    
    // Determine direction based on current scroll direction
    const direction = scrollDirection === 'splitting' ? 'backward' : 'forward';
    
    if (direction === 'backward') {
      // For backward direction, opacity increases as progress decreases (node becomes more visible)
      return 0.4 * scrollProgress;
    } else {
      // For forward direction, opacity decreases as progress increases (node fades out)
      return 0.4 * (1 - scrollProgress);
    }
  };

  const getAnimatedPosition = (node) => {
    if (removingNodes.length === 0) {
      return positioning.startX + positioning.nodePositions.find(np => np.node.id === node.id)?.x;
    }
    if (node.id !== removingNodes[0].id) {
      const nodePositionIndex = positioning.nodePositions.findIndex(np => np.node.id === node.id);
      return positioning.startX + positioning.nodePositions[nodePositionIndex]?.x;
    }
    const nodePositionIndex = positioning.nodePositions.findIndex(np => np.node.id === node.id);
    
    var widthA = positioning.nodePositions[nodePositionIndex]?.width;
    var widthB = positioning.nodePositions[nodePositionIndex - 1]?.width;
    if (nodePositionIndex <= 0) {
      widthB = widthA;
    }
    // console.log(positioning.nodePositions.map(np => np.node.name + ' ' + np.x));
    // console.log(positioning.nodePositions[nodePositionIndex].node.name, positioning.startX ,positioning.nodePositions[nodePositionIndex]?.x, scrollProgress* (widthA/2 + widthB/2) );
    return positioning.startX + positioning.nodePositions[nodePositionIndex]?.x 
    - scrollProgress* (widthA/2 + widthB/2) 
    ;
  };

  return {
    scrollProgress,
    scrollDirection,
    isAnimating,
    getAnimatedPosition,
    getRemovingNodeOpacity,
    PositionCalculator, // Export for use in other components
    nodePositions // Export for debugging/inspection
  };
} 