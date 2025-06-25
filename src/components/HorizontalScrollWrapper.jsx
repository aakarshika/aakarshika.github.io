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
  const [handoffDirection, setHandoffDirection] = useState(null);
  
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
      // console.log("handleWheel", e);
      
      const deltaX = e.deltaY ;
      setScrollX(prev => {
        const newX = prev - deltaX;
        const maxScroll = -(window.innerWidth * (slideCount - 1));
        const limitedX = Math.max(maxScroll, Math.min(0, newX));
        
        // Add a small buffer zone (50px) for earlier handoff
        const handoffBuffer = 150;
        
        // Check if we need to hand off control
        // Hand off when approaching the boundary with buffer
        if (e.deltaY > 0 && prev <= (maxScroll + handoffBuffer) && newX < (maxScroll + handoffBuffer)) {
          // Scrolling down and approaching end - hand off to next section
          console.log('Setting handoff to next - approaching end');
          setHandoffDirection('next');
          return Math.max(maxScroll, newX); // Don't go beyond actual boundary
        } else if (e.deltaY < 0 && prev >= -handoffBuffer && newX > -handoffBuffer) {
          // Scrolling up and approaching start - hand off to previous section
          console.log('Setting handoff to previous - approaching start');
          setHandoffDirection('previous');
          return Math.min(0, newX); // Don't go beyond actual boundary
        }
        
        return limitedX;
      });
    };

    const handleTouchStart = (e) => {
      // Touch start handler - just stop propagation
    };

    const handleTouchMove = (e) => {
      // console.log("handleTouchMove", e);
    };

    // Use the utility function to set up event listeners
    const cleanup = setupScrollEventListeners(
      containerRef.current, // Use container as target
      {
        wheel: handleWheel,
        touchStart: handleTouchStart,
        touchMove: handleTouchMove
      },
      {
        useWindow: true, // Use window to detect scroll events globally
        useCapture: false, // Don't use capture phase
        stopPropagation: false // Don't stop propagation
      }
    );

    return cleanup;
  }, [isActive, slideCount]);

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