import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SideHoverOverlay = ({mouseOutsideCenterZone}) => {
  const [mouseX, setMouseX] = useState(null);
  const [mouseY, setMouseY] = useState(null);
  const [showLeftOverlay, setShowLeftOverlay] = useState(false);
  const [showRightOverlay, setShowRightOverlay] = useState(false);
  const [showTopOverlay, setShowTopOverlay] = useState(false);
  const [showBottomOverlay, setShowBottomOverlay] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = e.clientX;
      const y = e.clientY;
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      
      // Horizontal center zone: 20% to 80% (60% wide)
      const centerZoneStartX = windowWidth * 0.1;
      const centerZoneEndX = windowWidth * 0.9;
      
      // Vertical center zone: 20% to 80% (60% tall)
      const centerZoneStartY = windowHeight * 0.1;
      const centerZoneEndY = windowHeight * 0.9;

      setMouseX(x);
      setMouseY(y);

      // Show left overlay if mouse is in left 20% of screen
      setShowLeftOverlay(x < centerZoneStartX);
      
      // Show right overlay if mouse is in right 20% of screen
      setShowRightOverlay(x > centerZoneEndX);
      
      // Show top overlay if mouse is in top 20% of screen
      setShowTopOverlay(y < centerZoneStartY);
      
      // Show bottom overlay if mouse is in bottom 20% of screen
      setShowBottomOverlay(y > centerZoneEndY);

      if(x < centerZoneStartX || x > centerZoneEndX || y < centerZoneStartY || y > centerZoneEndY){
        setShowOverlay(true);
        mouseOutsideCenterZone(true);
      } else {
        setShowOverlay(false);
        mouseOutsideCenterZone(false);
      }
    };

    const handleMouseLeave = () => {
      // Hide overlays when mouse leaves the window
      setMouseX(null);
      setMouseY(null);
      setShowLeftOverlay(false);
      setShowRightOverlay(false);
      setShowTopOverlay(false);
      setShowBottomOverlay(false);
      setShowOverlay(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <>
      <AnimatePresence>
        {(showLeftOverlay || showOverlay) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed top-0 left-0 w-[10%] h-full bg-gray-900 pointer-events-none z-50"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(showRightOverlay || showOverlay) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed top-0 right-0 w-[10%] h-full bg-gray-900 pointer-events-none z-50"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(showTopOverlay || showOverlay) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed top-0 left-0 w-full h-[10%] bg-gray-900 pointer-events-none z-50"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(showBottomOverlay || showOverlay) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-0 left-0 w-full h-[10%] bg-gray-900 pointer-events-none z-50"
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default SideHoverOverlay;

