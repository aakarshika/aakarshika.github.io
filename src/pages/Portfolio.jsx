import React, { useEffect, useRef, useState } from 'react';
import ProjectsSection from '../components/ProjectsSection';
import TestimonialsSection from '../components/TestimonialsSection';
import VeeSection from '../components/VeeSection';
import AboutMeSection from '../components/AboutMeSection';
import SkillsSection from '../components/SkillsSection';
import HeroSection from '../components/HeroSection';
import { setupScrollEventListeners } from '../utils/scrollEventUtils';

const Portfolio = () => {
  const stoppersListRef = useRef([]);
  const containerRef = useRef(null);
  
  // Custom scroll state
  const [scrollY, setScrollY] = useState(0);
  const [activeStopperId, setActiveStopperId] = useState(null); // Track which stopper is active
  const [isHandingOff, setIsHandingOff] = useState(false);
  const scrollWasteCountRef = useRef(0);
  
  // Scroll mode control
  const [scrollParallelly, setScrollParallelly] = useState(false); // false = stop vertical during horizontal, true = allow both
  
  // Define stoppers configuration
  const stoppersConfig = [
    {
      id: 'hero',
      componentType: 'none',
      componentFun: () => <HeroSection />,
      ref: useRef(null)
    },
    {
      id: 'about-me', 
      componentType: 'none',
      componentFun: () => <AboutMeSection />,
      ref: useRef(null)
    },
    {
      id: 'projects',
      componentType: 'horizontalStopper',
      componentFun: () => <ProjectsSection />,
      ref: useRef(null)
    },
    {
      id: 'skills',
      componentType: 'none',
      componentFun: () => <SkillsSection part="Skills" />,
      ref: useRef(null)
    },
    {
      id: 'testimonials', 
      componentType: 'horizontalStopper',
      componentFun: () => <TestimonialsSection />,
      ref: useRef(null)
    },
    {
      id: 'interactive',
      componentType: 'none',
      componentFun: () => <SkillsSection part="Interactive" />,
      ref: useRef(null)
    },
    {
      id: 'contact',
      componentType: 'none',
      componentFun: () => <SkillsSection part="Contact" />,
      ref: useRef(null)
    }
    ];
  
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
          const totalHeight = 8 * window.innerHeight; // Increased to accommodate all sections
          return Math.max(0, Math.min(totalHeight, newY));
        });
      } else if (direction === 'previous') {
        // Continue scrolling up
        setScrollY(prev => {
          const newY = prev - 100; // Subtract some scroll to move before stopper section
          const totalHeight = 8 * window.innerHeight; // Increased to accommodate all sections
          return Math.max(0, Math.min(totalHeight, newY));
        });
      }
    }
  };

  // Generic function to check if any stopper is in view
  const checkStoppersInView = () => {
    for (const stopper of stoppersConfig) {
      if (!stopper.ref.current || stopper.componentType !== 'horizontalStopper') continue;
      
      const rect = stopper.ref.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Check if stopper section is perfectly centered in viewport
      const sectionHeight = rect.height;
      const sectionCenter = rect.top + sectionHeight / 2;
      const viewportCenter = windowHeight / 2;
      const isCentered = Math.abs(sectionCenter - viewportCenter) < 50; // 50px tolerance
      const isInStopper = rect.top <= 0 && rect.bottom >= 0 && isCentered;
      
      if (isInStopper) {
        return stopper.id; // Return the stopper ID instead of just true
      }
    }
    return null;
  };

  // Custom scroll handler
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Disable browser scroll
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100vh';

    const handleWheel = (e) => {
      console.log('Wheel event:', { 
        activeStopperId, 
        isHandingOff, 
        scrollWasteCount: scrollWasteCountRef.current, 
        scrollParallelly,
        deltaY: e.deltaY 
      });
      
      // If any stopper section is active, handle based on scroll mode
      if (activeStopperId) {
        if (scrollParallelly) {
          // In parallel mode, allow vertical scrolling even when stoppers are active
          console.log('Parallel mode: Allowing vertical scroll during horizontal');
          setScrollY(prev => {
            const newY = prev + e.deltaY;
            const totalHeight = 8 * window.innerHeight; // Increased to accommodate all sections
            return Math.max(0, Math.min(totalHeight, newY));
          });
        } else {
          // In exclusive mode, don't handle vertical scroll at all
          console.log('Exclusive mode: Ignoring vertical scroll during horizontal');
        }
        return;
      }
      
      // If we're in handoff mode, waste scroll events (only in exclusive mode)
      if (isHandingOff && scrollWasteCountRef.current > 0) {
        console.log('Wasting scroll event, remaining:', scrollWasteCountRef.current - 1);
        scrollWasteCountRef.current = scrollWasteCountRef.current - 1;
        return;
      }
      
      // Reset handoff state when waste count reaches 0
      if (isHandingOff && scrollWasteCountRef.current === 0) {
        console.log('Waste period ended, resuming vertical scroll');
        setIsHandingOff(false);
      }
      
      // Check if any stopper is in view
      const stopperInView = checkStoppersInView();
      
      if (stopperInView && !activeStopperId) {
        // Activate stopper section
        console.log('Activating stopper section:', stopperInView);
        setActiveStopperId(stopperInView);
      } else {
        // Normal vertical scrolling (either not in stopper or stopper not active)
        console.log('Scrolling vertically, deltaY:', e.deltaY);
        setScrollY(prev => {
          const newY = prev + e.deltaY;
          const totalHeight = 8 * window.innerHeight; // Increased to accommodate all sections
          return Math.max(0, Math.min(totalHeight, newY));
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
      
      const stopperInView = checkStoppersInView();
      
      const deltaY = startY - e.touches[0].clientY;
      
      if (!stopperInView) {
        setScrollY(prev => {
          const newY = prev + deltaY;
          const totalHeight = 8 * window.innerHeight; // Increased to accommodate all sections
          return Math.max(0, Math.min(totalHeight, newY));
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
  }, [activeStopperId, isHandingOff, scrollParallelly]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-black text-white overflow-hidden"
    >
      <div 
        className="relative w-full"
        style={{
          transform: `translateY(-${scrollY}px)`
        }}
      >

        

        {/* Render all stopper sections */}
        {stoppersConfig.map((stopper) => {
          return stopper.componentType === 'horizontalStopper' ? (
            <div key={stopper.id} ref={stopper.ref}>
              <VeeSection
                isActive={activeStopperId === stopper.id}
                onScrollHandoff={(direction) => handleScrollHandoff(direction, stopper.id)}
                content={<stopper.componentFun />}
              />
            </div>
          ) : (
            <div key={stopper.id} ref={stopper.ref}>
              <stopper.componentFun />
            </div>
          );
        })}


        
      </div>
    </div>
  );
};

export default Portfolio;