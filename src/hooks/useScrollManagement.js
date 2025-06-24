import { useState, useRef, useEffect } from 'react';
import { setupScrollEventListeners } from '../utils/scrollEventUtils';
import { 
  checkStoppersInView, 
  checkVisibleSection, 
  isContactFullyVisible 
} from '../utils/portfolioUtils';

export const useScrollManagement = (stoppersConfig) => {
  // Custom scroll state
  const [scrollY, setScrollY] = useState(0);
  const [activeStopperId, setActiveStopperId] = useState(null);
  const [isHandingOff, setIsHandingOff] = useState(false);
  const scrollWasteCountRef = useRef(0);
  
  const [pageProgress, setPageProgress] = useState(0);

  const [scrollParallelly, setScrollParallelly] = useState(false);
  
  // Calculate max scrollY based on number of sections
  const sectionCount = stoppersConfig.length;
  const maxScrollY = sectionCount * window.innerHeight - window.innerHeight;

  // Handle scroll handoff from any stopper section
  const handleScrollHandoff = (direction, stopperId) => {
    console.log('Portfolio: Received handoff:', direction, 'from:', stopperId);
    
    if (scrollParallelly) {
      // In parallel mode, just deactivate stopper section without stopping vertical scroll
      console.log('Parallel mode: Continuing vertical scroll during horizontal');
      setActiveStopperId(null);
      // No immediate vertical scroll adjustment needed
    } else {
      // In exclusive mode, stop vertical scroll and add delay
      console.log('Exclusive mode: Stopping vertical scroll during handoff');
      setIsHandingOff(true);
      scrollWasteCountRef.current = 3; // Waste 3 scroll events
      setActiveStopperId(null);
      
      // Immediately continue vertical scrolling in the direction of the handoff
      if (direction === 'next') {
        // Continue scrolling down
        setScrollY(prev => {
          const newY = prev + 100; // Add some scroll to move past stopper section
          return Math.max(0, Math.min(maxScrollY, newY));
        });
      } else if (direction === 'previous') {
        // Continue scrolling up
        setScrollY(prev => {
          const newY = prev - 100; // Subtract some scroll to move before stopper section
          return Math.max(0, Math.min(maxScrollY, newY));
        });
      }
    }
  };

  // Custom scroll handler
  useEffect(() => {
    // Disable browser scroll
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100vh';

    const handleWheel = (e) => {
      // If any stopper section is active, handle based on scroll mode
      if (activeStopperId) {
        if (scrollParallelly) {
          // In parallel mode, allow vertical scrolling even when stoppers are active
          setScrollY(prev => {
            const newY = prev + e.deltaY;
            return Math.max(0, Math.min(maxScrollY, newY));
          });
        } else {
          // In exclusive mode, don't handle vertical scroll at all
        }
        return;
      }
      
      // If we're in handoff mode, waste scroll events (only in exclusive mode)
      if ((isHandingOff && scrollWasteCountRef.current > 0) ) {
        console.log('Wasting scroll event, remaining:', scrollWasteCountRef.current - 1);
        if(scrollWasteCountRef.current > 0) {
          scrollWasteCountRef.current = scrollWasteCountRef.current - 1;
        } else {
          scrollWasteCountRef.current = 0;
        }
        return;
      }
      // Reset handoff state when waste count reaches 0
      if (isHandingOff && scrollWasteCountRef.current === 0) {
        console.log('Waste period ended, resuming vertical scroll');
        setIsHandingOff(false);
      }
      
      // Check if any stopper is in view
      const stopperInView = checkStoppersInView(stoppersConfig);
      
      // --- Block downward scroll if contact is fully visible ---
      if (e.deltaY > 0 && isContactFullyVisible()) {
        // Block further downward scroll
        return;
      }
      // --- End block ---
      
      if (stopperInView && !activeStopperId) {
        // Activate stopper section
        setActiveStopperId(stopperInView);
      } else {
        // Normal vertical scrolling (either not in stopper or stopper not active)
        setScrollY(prev => {
          const newY = prev + e.deltaY;
          return Math.max(0, Math.min(maxScrollY, newY));
        });
      }
    };

    // Touch events for mobile
    let startY = 0;
    
    const handleTouchStart = (e) => {
      startY = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      // If any stopper section is active, don't handle vertical scroll at all
      if (activeStopperId) {
        return;
      }
      
      const stopperInView = checkStoppersInView(stoppersConfig);
      
      const deltaY = startY - e.touches[0].clientY;
      
      // --- Block downward scroll if contact is fully visible ---
      if (deltaY > 0 && isContactFullyVisible()) {
        // Block further downward scroll
        return;
      }
      // --- End block ---
      
      if (!stopperInView) {
        setScrollY(prev => {
          const newY = prev + deltaY;
          return Math.max(0, Math.min(maxScrollY, newY));
        });
      }
      
      startY = e.touches[0].clientY;
    };

    // Use the utility function to set up event listeners
    const cleanup = setupScrollEventListeners(
      null, // Use window as target
      {
        wheel: handleWheel,
        touchStart: handleTouchStart,
        touchMove: handleTouchMove
      },
      {
        useWindow: true
      }
    );

    return () => {
      cleanup();
      // Restore browser scroll
      document.body.style.overflow = '';
      document.body.style.height = '';
    };
  }, [activeStopperId, isHandingOff, scrollParallelly, stoppersConfig,  maxScrollY]);

  return {
    scrollY,
    activeStopperId,
    handleScrollHandoff
  };
}; 