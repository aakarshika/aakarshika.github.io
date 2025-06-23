import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import ProjectsSection from '../components/ProjectsSection';
import TestimonialsSection from '../components/TestimonialsSection';
import VeeSection from '../components/VeeSection';
import AboutMeSection from '../components/AboutMeSection';
import SkillsSection from '../components/SkillsSection';
import HeroSection from '../components/HeroSection';
import { setupScrollEventListeners } from '../utils/scrollEventUtils';
import SkillGraph from '../components/SkillGraph';

const Portfolio = () => {
  const stoppersListRef = useRef([]);
  const containerRef = useRef(null);
  const [viewHeight, setViewHeight] = useState(0);
  
  // Custom scroll state
  const [scrollY, setScrollY] = useState(0);
  const [activeStopperId, setActiveStopperId] = useState(null); // Track which stopper is active
  const [isHandingOff, setIsHandingOff] = useState(false);
  const scrollWasteCountRef = useRef(0);
  
  // Track currently visible section
  const [visibleSections, setVisibleSections] = useState([]);
  const previousVisibleSectionsRef = useRef([]); // Store previous visibility data for comparison
  
  // Add cumulative progress tracking
  const [cumulativeProgress, setCumulativeProgress] = useState(0);
  
  // Scroll mode control
  const [scrollParallelly, setScrollParallelly] = useState(false); // false = stop vertical during horizontal, true = allow both
  
  // Animation sequence for the photo
  const photoAnimationSequence = {
    photo: {
      start: 0, // Start animation at 20% of about-me progress
      duration: 20, // Animation duration
      initialScale: 0.9,
      scaleIncrement: 0.1
    }
  };

  useEffect(() => {
    const handleResize = () => setViewHeight(window.innerHeight);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate animation values for the photo
  const calculateAnimation = (elementKey, progress) => {
    const config = photoAnimationSequence[elementKey];
    if (!config || progress === undefined) return { 
      opacity: 0, 
      scale: config?.initialScale || 1,
      y: 0
    };

    const { start, duration, initialScale, scaleIncrement } = config;
    
    // Fade-in logic
    const cappedProgress = Math.min(progress, 50);
    const elementProgress = cappedProgress >= start ? Math.min((cappedProgress - start) / duration, 1) : 0;
    const easedProgress = 1 - Math.pow(1 - elementProgress, 3);
    
    let opacity = easedProgress;
    
    // Fade-out logic for progress > 50
    if (progress > 50) {
      const fadeOutDuration = 30; // 80 - 50
      const fadeOutProgress = Math.min((progress - 50) / fadeOutDuration, 1);
      opacity = 1 - fadeOutProgress;
    }
    
    const scale = cappedProgress >= start ? initialScale + (easedProgress * scaleIncrement) : initialScale;
    const y = (progress / 100) * (viewHeight - 240); // 240 is h-60

    return { opacity, scale, y };
  };

  const aboutMeProgress = visibleSections.find(section => section.id === 'about-me')?.cumulativeProgress || 0;
  const photoAnim = calculateAnimation('photo', aboutMeProgress);

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
      componentFun: () => <AboutMeSection progress={aboutMeProgress} />,
      ref: useRef(null)
    },
    {
      id: 'projects',
      componentType: 'horizontalStopper',
      componentFun: () => <ProjectsSection />,
      ref: useRef(null)
    },
    {
      id: 'skill-graph',
      componentType: 'customHorizontalStopper',
      getFun: 'SkillGraph',
      ref: useRef(null)
    },
    // {
    //   id: 'skills',
    //   componentType: 'none',
    //   componentFun: () => <SkillsSection part="Skills" />,
    //   ref: useRef(null)
    // },
    // {
    //   id: 'testimonials', 
    //   componentType: 'horizontalStopper',
    //   componentFun: () => <TestimonialsSection />,
    //   ref: useRef(null)
    // },
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
      if (!stopper.ref.current || (stopper.componentType !== 'horizontalStopper' && stopper.componentType !== 'customHorizontalStopper')) continue;
      
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

  // Function to check which section is currently visible on screen
  const checkVisibleSection = () => {
    const windowHeight = window.innerHeight;
    const visibleSections = [];

    for (const section of stoppersConfig) {
      if (!section.ref.current) continue;
      
      const rect = section.ref.current.getBoundingClientRect();
      
      // Calculate how much of the section is visible
      const visibleTop = Math.max(0, Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0));
      const visibleHeight = Math.max(0, visibleTop);
      const sectionHeight = rect.height ;
      const visibilityRatio = visibleHeight / sectionHeight;
      
      // If more than 0% of the section is visible, include it in the list
      if (visibilityRatio > 0) {
        // Calculate cumulative progress for this section (0-100)
        let cumulativeProgress = 0;
        
        // Calculate progress based on section's journey through the viewport
        // Start from 0 when section top enters viewport, reach 100 when section bottom leaves viewport
        const sectionTop = rect.top;
        const sectionBottom = rect.bottom;
        const viewportHeight = windowHeight;
        
        if (sectionTop < viewportHeight && sectionBottom > 0) {
          // Section is in viewport
          if (sectionTop <= 0) {
            // Section top has passed viewport top - calculate progress from 0 to 100
            const totalJourney = viewportHeight + rect.height;
            const distanceTraveled = Math.abs(sectionTop) + rect.height;
            cumulativeProgress = Math.min(100, (distanceTraveled / totalJourney) * 100);
          } else {
            // Section is entering - calculate progress from 0 to 100
            const totalJourney = viewportHeight + rect.height;
            const distanceTraveled = rect.height - sectionTop;
            cumulativeProgress = Math.max(0, (distanceTraveled / totalJourney) * 100);
          }
        }
        
        // Ensure cumulative progress is between 0 and 100
        cumulativeProgress = Math.max(0, Math.min(100, cumulativeProgress));
        
        visibleSections.push({
          id: section.id,
          top: rect.top,
          sectionHeight: visibleHeight,
          visibilityPercentage: Math.round(visibilityRatio * 100),
          cumulativeProgress: Math.round(cumulativeProgress)
        });
      }
    }
    
    // Sort by visibility percentage (highest first)
    return visibleSections.sort((a, b) => b.visibilityPercentage - a.visibilityPercentage);
  };

  // Update visible section whenever scroll position changes
  useEffect(() => {
    const updateVisibleSection = () => {
      const result = checkVisibleSection();
      const visibleSectionsData = result;
      const previousData = previousVisibleSectionsRef.current;
      
      // Add waning/waxing information by comparing with previous data
      const sectionsWithTrend = visibleSectionsData.map(section => {
        console.log('Section:', section);
        const previousSection = previousData.find(prev => prev.id === section.id);
        let trend = 'stable';
        
        if (previousSection) {
          if (section.visibilityPercentage > previousSection.visibilityPercentage) {
            trend = 'waxing';
          } else if (section.visibilityPercentage < previousSection.visibilityPercentage) {
            trend = 'waning';
          }
        } else {
          // New section appearing
          trend = 'waxing';
        }
        
        return {
          ...section,
          trend
        };
      });
      
      const hasChanged = sectionsWithTrend.length !== visibleSections.length ||
        sectionsWithTrend.some((section, index) => 
          !visibleSections[index] || 
          section.id !== visibleSections[index].id || 
          section.visibilityPercentage !== visibleSections[index].visibilityPercentage ||
          section.trend !== visibleSections[index].trend
        );
      
      if (hasChanged) {
        console.log('Currently visible sections:', sectionsWithTrend);
        if (sectionsWithTrend.length > 0) {
          console.log('Cumulative progress:', sectionsWithTrend[0].cumulativeProgress.toFixed(1) + '%');
        }
        setVisibleSections(sectionsWithTrend);
        // Update cumulative progress to the first section's progress (most visible)
        if (sectionsWithTrend.length > 0) {
          setCumulativeProgress(sectionsWithTrend[0].cumulativeProgress);
        }
        previousVisibleSectionsRef.current = visibleSectionsData; // Store current data for next comparison
      }
    };

    // Update immediately
    updateVisibleSection();
    
    // Also update after a short delay to ensure DOM is updated
    const timeoutId = setTimeout(updateVisibleSection, 100);
    
    return () => clearTimeout(timeoutId);
  }, [scrollY, visibleSections, cumulativeProgress]);

  // Custom scroll handler
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Disable browser scroll
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100vh';

    const handleWheel = (e) => {
      // console.log('Wheel event:', { 
      //   activeStopperId, 
      //   isHandingOff, 
      //   scrollWasteCount: scrollWasteCountRef.current, 
      //   scrollParallelly,
      //   deltaY: e.deltaY 
      // });
      
      // If any stopper section is active, handle based on scroll mode
      if (activeStopperId) {
        if (scrollParallelly) {
          // In parallel mode, allow vertical scrolling even when stoppers are active
          // console.log('Parallel mode: Allowing vertical scroll during horizontal');
          setScrollY(prev => {
            const newY = prev + e.deltaY;
            const totalHeight = 8 * window.innerHeight; // Increased to accommodate all sections
            return Math.max(0, Math.min(totalHeight, newY));
          });
        } else {
          // In exclusive mode, don't handle vertical scroll at all
          // console.log('Exclusive mode: Ignoring vertical scroll during horizontal');
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
        // console.log('Activating stopper section:', stopperInView);
        setActiveStopperId(stopperInView);
      } else {
        // Normal vertical scrolling (either not in stopper or stopper not active)
        // console.log('Scrolling vertically, deltaY:', e.deltaY);
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
      {/* Sticky Photo/Avatar */}
      <motion.div 
        className="fixed top-0 right-8 bg-gray-800 rounded-lg p-8 h-60 w-60 flex items-center justify-center z-40"
        style={{ 
          opacity: photoAnim.opacity, 
          scale: photoAnim.scale,
          y: photoAnim.y
        }}
      >
        <span className="text-gray-500 text-lg">[Your Photo Here]</span>
      </motion.div>

      {/* Visual indicator for currently visible section */}
      {visibleSections.length > 0 && (
        <div className="fixed top-4 left-4 z-50 bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg">
          <div className="text-sm font-semibold">Visible Sections:</div>
          {visibleSections.map((section, index) => (
            <div key={section.id} className="text-sm">
              <span className="font-medium">{section.id}</span>
              <span className="text-yellow-300 ml-2">({section.visibilityPercentage}%)</span>
              <span className="text-green-300 ml-2">Cum: {section.cumulativeProgress}%</span>
              <span className={`ml-2 ${
                section.trend === 'waxing' ? 'text-green-300' : 
                section.trend === 'waning' ? 'text-red-300' : 
                'text-gray-300'
              }`}>
                {section.trend === 'waxing' ? '↗' : 
                 section.trend === 'waning' ? '↘' : 
                 '→'}
              </span>
              <span className="text-gray-300 ml-2">{section.top}/{section.sectionHeight}</span>
            </div>
          ))}
          {activeStopperId && (
            <div className="text-xs text-yellow-300 mt-1 border-t border-yellow-300 pt-1">
              Stopper Active: {activeStopperId}
            </div>
          )}
        </div>
      )}

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
          ) : stopper.componentType === 'customHorizontalStopper' ? (
            <div key={stopper.id} ref={stopper.ref}>
              {stopper.getFun == 'SkillGraph' ? 
              <SkillGraph isActive={activeStopperId === stopper.id} onScrollHandoff={(direction) => {
                console.log('SkillGraph: Received handoff:', direction, 'from:', stopper.id);
                handleScrollHandoff(direction, stopper.id)
              }} /> 
              : <div />}
            </div>
          ): (
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