import React, { useEffect, useRef, useState } from 'react';
import { setupScrollEventListeners } from '../utils/scrollEventUtils';

const HorizontalScrollWrapper = ({ 
  isActive, 
  onScrollHandoff, 
  children, 
  slideCount = 3, // Number of slides/pages
  className = "h-screen bg-gradient-to-r from-purple-900 to-black relative overflow-hidden"
}) => {
  const containerRef = useRef(null);
  const [scrollX, setScrollX] = useState(0);
  const [isHorizontalMode, setIsHorizontalMode] = useState(false);
  const [handoffDirection, setHandoffDirection] = useState(null);
  const [isAtBoundary, setIsAtBoundary] = useState(false);

  // Handle scroll handoff after render
  useEffect(() => {
    if (handoffDirection) {
      console.log('Handing off control:', handoffDirection);
      onScrollHandoff(handoffDirection);
      setHandoffDirection(null);
    }
  }, [handoffDirection, onScrollHandoff]);

  // Handle horizontal scroll when section is active
  useEffect(() => {
    if (!isActive) return;

    const handleWheel = (e) => {
      // Don't process events if we're in the middle of a handoff
      if (handoffDirection) {
        return;
      }
      
      const deltaX = e.deltaY * 2;
      setScrollX(prev => {
        const newX = prev - deltaX;
        const maxScroll = -(window.innerWidth * (slideCount - 1));
        const limitedX = Math.max(maxScroll, Math.min(0, newX));
        
        console.log('Scroll debug:', { 
          prev, 
          deltaX, 
          newX, 
          limitedX, 
          maxScroll, 
          deltaY: e.deltaY,
          atEnd: prev <= maxScroll && e.deltaY > 0,
          atStart: prev >= 0 && e.deltaY < 0,
          isAtBoundary
        });
        
        // Reset boundary flag if we're moving away from boundary
        if (limitedX !== prev) {
          setIsAtBoundary(false);
        }
        
        // Check if we need to hand off control
        // Only hand off if we're already at the boundary AND trying to scroll beyond it AND haven't already triggered handoff
        if (e.deltaY > 0 && prev <= maxScroll && newX < maxScroll && !isAtBoundary) {
          // Scrolling down and already at end - hand off to next section
          console.log('Setting handoff to next');
          setIsAtBoundary(true);
          setHandoffDirection('next');
          return maxScroll; // Stay at max
        } else if (e.deltaY < 0 && prev >= 0 && newX > 0 && !isAtBoundary) {
          // Scrolling up and already at start - hand off to previous section
          console.log('Setting handoff to previous');
          setIsAtBoundary(true);
          setHandoffDirection('previous');
          return 0; // Stay at start
        }
        
        return limitedX;
      });
    };

    const handleTouchStart = (e) => {
      // Touch start handler - just stop propagation
    };

    const handleTouchMove = (e) => {
      // Don't process events if we're in the middle of a handoff
      if (handoffDirection) {
        return;
      }
      
      // Touch handling for mobile
      const deltaX = e.touches[0].movementX || 0;
      setScrollX(prev => {
        const newX = prev - deltaX * 2;
        const maxScroll = -(window.innerWidth * (slideCount - 1));
        const limitedX = Math.max(maxScroll, Math.min(0, newX));
        
        // Reset boundary flag if we're moving away from boundary
        if (limitedX !== prev) {
          setIsAtBoundary(false);
        }
        
        // Check if we need to hand off control
        // Only hand off if we're already at the boundary AND trying to scroll beyond it AND haven't already triggered handoff
        if (deltaX > 0 && prev <= maxScroll && newX < maxScroll && !isAtBoundary) {
          setIsAtBoundary(true);
          setHandoffDirection('next');
          return maxScroll;
        } else if (deltaX < 0 && prev >= 0 && newX > 0 && !isAtBoundary) {
          setIsAtBoundary(true);
          setHandoffDirection('previous');
          return 0;
        }
        
        return limitedX;
      });
    };

    // Use the utility function to set up event listeners with capture phase
    const cleanup = setupScrollEventListeners(
      null, // Use window as target
      {
        wheel: handleWheel,
        touchStart: handleTouchStart,
        touchMove: handleTouchMove
      },
      {
        useWindow: true,
        useCapture: true,
        stopPropagation: true
      }
    );

    return cleanup;
  }, [isActive, isAtBoundary, handoffDirection, slideCount]);

  return (
    <div className={className}>
      <div className="h-screen flex items-center transition-all duration-1000 ease-out">
        <div 
          ref={containerRef}
          className="flex w-max h-full items-center"
          style={{ 
            transform: `translateX(${scrollX}px)`,
            transition: 'transform 0.1s ease-out'
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default HorizontalScrollWrapper; 