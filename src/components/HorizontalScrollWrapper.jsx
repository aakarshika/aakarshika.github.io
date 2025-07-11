import React, { useEffect, useRef, useState } from 'react';
import { setupScrollEventListeners } from '../utils/scrollEventUtils';

const HorizontalScrollWrapper = ({ 
  id,
  isActive, 
  progress,
  onScrollHandoff, 
  children, 
  slideCount = 3, // Number of slides/pages
  className = "h-screen bg-gradient-to-r from-purple-900 to-black relative overflow-hidden",
  handleHover
}) => {
  const containerRef = useRef(null);
  const [scrollX, setScrollX] = useState(0);
  const [handoffDirection, setHandoffDirection] = useState(null);
  
  // Handle scroll handoff after render
  useEffect(() => {
    if (handoffDirection) {
      // // console.log('Handing off control:', handoffDirection);
      onScrollHandoff(handoffDirection);
      setHandoffDirection(null);
    }
  }, [handoffDirection, onScrollHandoff]);
    
  // Handle horizontal scroll when section is active
  useEffect(() => {
    if (!isActive) return;
    // if (!(progress < 40 || progress > 60)) return;

    const handleWheel = (e) => {
      // // console.log("handleWheel", e);
      
      const deltaX = e.deltaY * 2;
      setScrollX(prev => {
        const newX = prev - deltaX;
        const maxScroll = -(window.innerWidth * (slideCount - 1));
        const limitedX = Math.max(maxScroll, Math.min(0, newX));
        
        const handoffBuffer = 150;
        
        if (e.deltaY > 0 && prev <= (maxScroll + handoffBuffer) && newX < (maxScroll + handoffBuffer)) {
          setHandoffDirection('next');
          return Math.max(maxScroll, newX); // Don't go beyond actual boundary
        } else if (e.deltaY < 0 && prev >= -handoffBuffer && newX > -handoffBuffer) {
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
      // // console.log("handleTouchMove", e);
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
    <div className={className}
    // onMouseLeave={() => handleHover(false)}
    >
      <div className="h-screen flex items-center transition-all duration-1000 ease-out"
      onMouseEnter={() => handleHover(true, id)}
      onMouseLeave={() => handleHover(false, id)}
      >
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