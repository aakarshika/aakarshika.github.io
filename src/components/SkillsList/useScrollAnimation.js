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
  onAnimationComplete,
  isActive = true,
  onScrollHandoff = null
}) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollDirection, setScrollDirection] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [completionTrigger, setCompletionTrigger] = useState(null);
  const [handoffDirection, setHandoffDirection] = useState(null);
  const [isAtBoundary, setIsAtBoundary] = useState(false);

  // Handle scroll handoff after render
  useEffect(() => {
    if (handoffDirection && onScrollHandoff) {
      // console.log('Handing off control:', handoffDirection);
      onScrollHandoff(handoffDirection);
      setHandoffDirection(null);
    }
  }, [handoffDirection, onScrollHandoff]);

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
    if (!container || !isActive) return;

    const wheelHandler = (e) => {
      if (handoffDirection) {
        return;
      }

      const delta = e.deltaY;
      const scrollSensitivity = 0.06;
      const progressChange = delta * scrollSensitivity;
      
      const newDirection = delta > 0 ? 'merging' : 'splitting';
      setScrollDirection(newDirection);
      setScrollProgress(prev => {
        const newProgress = prev + progressChange;
        
        if (newDirection === 'merging' && removingNodes.length === 0 && newProgress >= 1.0) {
          console.log("REACHED START");
          if (!isAtBoundary && onScrollHandoff) {
            setIsAtBoundary(true);
            setHandoffDirection('next');
            return 1;
          }
          return 1;
        }
        if (newDirection === 'splitting' && highlightedNodes.length === 0 && newProgress <= 0.0) {
          console.log("REACHED END");
          if (!isAtBoundary && onScrollHandoff) {
            setIsAtBoundary(true);
            setHandoffDirection('previous');
            return 0;
          }
          return 0;
        }
        
        if (newProgress !== prev) {
          setIsAtBoundary(false);
        }
        
        if (newDirection === 'merging' && newProgress >= 1.0) {
          setCompletionTrigger("forward");
          return 0;
        }
        
        if (newDirection === 'splitting' && newProgress <= 0.0) {
          setCompletionTrigger("backward");
          return 1;
        }
        return newProgress;
      });
    };

    const cleanup = setupScrollEventListeners(container, {
      wheel: wheelHandler
    });

    return cleanup;
  }, [removingNodes, positioning, nodePositions, onAnimationComplete, highlightedNodes, isActive, handoffDirection, isAtBoundary, onScrollHandoff]);

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
    return positioning.startX + positioning.nodePositions[nodePositionIndex]?.x 
    - scrollProgress* (widthA/2 + widthB/2) 
    ;
  };

  // Calculate opacity for removing nodes based on scroll progress
  const getRemovingNodeOpacity = (node) => {
    if (getNodeState(node) !== 'removing') return 0.4;
    
    const direction = scrollDirection === 'splitting' ? 'backward' : 'forward';
    
    if (direction === 'backward') {
      return 0.4 * scrollProgress;
    } else {
      return 0.4 * (1 - scrollProgress);
    }
  };

  return {
    scrollProgress,
    scrollDirection,
    isAnimating,
    getAnimatedPosition,
    getRemovingNodeOpacity,
    PositionCalculator,
    nodePositions
  };
} 