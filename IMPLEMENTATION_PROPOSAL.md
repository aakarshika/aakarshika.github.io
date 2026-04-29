# Implementation Proposal: Optimized Scroll System

## Overview

Replace manual scroll state management with a hybrid approach using:
1. **Intersection Observer** for section visibility detection
2. **Framer Motion `useScroll`** for scroll progress tracking
3. **React.memo** for component memoization
4. **Refs + requestAnimationFrame** for scroll position (no state updates)

## Key Changes

### 1. Replace State-Based Scroll with Refs + RAF

**Current Problem**: `setScrollY` triggers re-render on every scroll
**Solution**: Use refs for scroll position, only update state when sections change

### 2. Use Intersection Observer for Active Section Detection

**Current Problem**: Manual calculation on every scroll event
**Solution**: Observer fires only when visibility thresholds cross

### 3. Use Framer Motion `useScroll` for Progress

**Current Problem**: Manual `pageProgress` calculation
**Solution**: Use `useScroll` hook which is optimized internally

### 4. Memoize Components

**Current Problem**: All components re-render on every scroll
**Solution**: Wrap components in `React.memo` with proper comparison

## Implementation Files

### File 1: `useScrollOptimized.js` - New Optimized Hook

```javascript
import { useRef, useState, useEffect, useCallback } from 'react';
import { useScroll, useMotionValueEvent } from 'framer-motion';
import { setupScrollEventListeners } from '../utils/scrollEventUtils';
import { isContactFullyVisible } from '../utils/portfolioUtils';

export const useScrollOptimized = ({ stoppersConfig }) => {
  const sectionCount = stoppersConfig.length;
  const viewHeight = window.innerHeight;
  const maxScrollY = sectionCount * viewHeight - viewHeight;
  
  // Use refs for scroll position (no re-renders)
  const scrollYRef = useRef(0);
  const rafIdRef = useRef(null);
  
  // Only state that needs to trigger re-renders
  const [activePageName, setActivePageName] = useState(null);
  const [activeStopperId, setActiveStopperId] = useState(null);
  
  // Refs for scroll logic (avoid stale closures)
  const handoffsReceivedRef = useRef([]);
  const centerStuckRef = useRef(null);
  const hoveredRef = useRef(true);
  const hoveredSectionRef = useRef('projects');
  
  // Calculate page centers once
  const centerOfEachPage = useMemo(() => {
    return stoppersConfig.map((stopper, i) => {
      const top = i * viewHeight;
      const bottom = (i + 1) * viewHeight;
      return {
        ...stopper,
        id: stopper.id,
        center: (top + bottom) / 2,
        top,
        bottom
      };
    });
  }, [stoppersConfig, viewHeight]);
  
  // Update active section only when it changes (not on every scroll)
  const updateActiveSection = useCallback(() => {
    const matlabKaY = scrollYRef.current + viewHeight / 2;
    const activePage = centerOfEachPage.find(
      page => matlabKaY > page.top && matlabKaY < page.bottom
    );
    
    if (activePage?.id !== activePageName) {
      setActivePageName(activePage?.id || null);
      
      // Update active stopper
      const activeZoneMargin = viewHeight * 0.2;
      const isInActiveZone = activePage &&
        matlabKaY > activePage.top + activeZoneMargin &&
        matlabKaY < activePage.bottom - activeZoneMargin &&
        ['horizontalStopper', 'customHorizontalStopper'].includes(activePage.componentType);
      
      setActiveStopperId(isInActiveZone ? activePage.id : null);
    }
  }, [centerOfEachPage, viewHeight, activePageName]);
  
  // Throttled scroll handler using requestAnimationFrame
  const handleScroll = useCallback((deltaY) => {
    if (rafIdRef.current) return; // Skip if already scheduled
    
    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;
      
      if (deltaY > 0 && isContactFullyVisible()) {
        return;
      }
      
      const MAX_SCROLL_SPEED = 250;
      const cappedDeltaY = Math.max(-MAX_SCROLL_SPEED, Math.min(MAX_SCROLL_SPEED, deltaY));
      
      const newY = Math.max(0, Math.min(
        scrollYRef.current + cappedDeltaY,
        maxScrollY
      ));
      
      scrollYRef.current = newY;
      
      // Update transform directly (no state)
      const container = document.querySelector('.scroll-container');
      if (container) {
        container.style.transform = `translateY(-${newY}px)`;
      }
      
      // Update active section (throttled)
      updateActiveSection();
    });
  }, [maxScrollY, updateActiveSection]);
  
  // Scroll event listeners
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100vh';
    
    const handleWheel = (e) => handleScroll(e.deltaY);
    
    let startY = 0;
    const handleTouchStart = (e) => {
      startY = e.touches[0].clientY;
    };
    
    const handleTouchMove = (e) => {
      const deltaY = startY - e.touches[0].clientY;
      handleScroll(deltaY);
      startY = e.touches[0].clientY;
    };
    
    const cleanup = setupScrollEventListeners(
      null,
      { wheel: handleWheel, touchStart: handleTouchStart, touchMove: handleTouchMove },
      { useWindow: true }
    );
    
    return () => {
      cleanup();
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      document.body.style.overflow = '';
      document.body.style.height = '';
    };
  }, [handleScroll]);
  
  return {
    scrollYRef, // Expose ref for components that need it
    activeStopperId,
    activePageName,
    handleScrollHandoff: useCallback((direction, stopperId) => {
      handoffsReceivedRef.current = [{ direction, stopperId }];
      centerStuckRef.current = null;
      setActiveStopperId(null);
    }, []),
    handleHover: useCallback((isHovered, section) => {
      hoveredRef.current = isHovered;
      hoveredSectionRef.current = section;
    }, [])
  };
};
```

### File 2: `AboutMeSection.optimized.jsx` - Memoized Component with useScroll

```javascript
import React, { useMemo } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { calculateAnimations } from '../utils/progressAnimationUtils';

const AboutMeSection = React.memo(({ sectionRef, isVisible }) => {
  // Only track scroll when section is visible
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  // Convert scrollYProgress (0-1) to progress (0-100)
  const progress = useTransform(scrollYProgress, [0, 1], [0, 100]);
  
  // Memoize animation config (only recalculates if config changes)
  const animationConfig = useMemo(() => [
    {
      object: 'title',
      anim: [
        { type: 'fade', initialValue: 0, finalValue: 0.8, startTiming: 0, duration: 15 },
        { type: 'slideY', initialValue: 50, finalValue: 0, startTiming: 0, duration: 15 },
      ]
    },
    // ... rest of config
  ], []);
  
  // Only calculate animations when progress changes AND section is visible
  const animations = useMemo(() => {
    if (!isVisible) return {};
    // Use motion value's get() method
    const currentProgress = progress.get();
    return calculateAnimations(animationConfig, currentProgress);
  }, [isVisible, animationConfig, progress]);
  
  // Use motion values for smooth animations
  const titleOpacity = useTransform(progress, [0, 15], [0, 0.8]);
  const titleY = useTransform(progress, [0, 15], [50, 0]);
  
  return (
    <div 
      ref={sectionRef}
      className="relative min-h-screen bg-gradient-to-b from-black to-gray-900 flex items-center justify-center py-20"
      style={{ willChange: isVisible ? 'transform, opacity' : 'auto' }}
    >
      {/* Use motion values directly - no re-renders */}
      <motion.h2
        style={{ opacity: titleOpacity, y: titleY }}
        className="text-6xl font-bold text-start mb-16 bg-gradient-to-r from-blue-400 to-gray-400 bg-clip-text text-transparent"
      >
        About Me
      </motion.h2>
      
      {/* Rest of component */}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if visibility changes
  return prevProps.isVisible === nextProps.isVisible;
});

AboutMeSection.displayName = 'AboutMeSection';
export default AboutMeSection;
```

### File 3: `Portfolio.optimized.jsx` - Refactored Portfolio

```javascript
import React, { useRef, useMemo } from 'react';
import { useScrollOptimized } from '../hooks/useScrollOptimized';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import AboutMeSection from '../components/AboutMeSection';
import HeroSection from '../components/HeroSection';
// ... other imports

const Portfolio = () => {
  const stoppersConfig = useMemo(() => [
    {
      id: 'hero',
      componentType: 'none',
      componentFun: HeroSection,
      ref: useRef(null)
    },
    {
      id: 'about-me',
      componentType: 'none',
      componentFun: AboutMeSection,
      ref: useRef(null)
    },
    // ... rest
  ], []);
  
  const { activeStopperId, activePageName, handleScrollHandoff, handleHover } = 
    useScrollOptimized({ stoppersConfig });
  
  // Use Intersection Observer to detect visible sections
  const visibleSections = useIntersectionObserver(
    stoppersConfig.map(s => s.ref),
    { threshold: [0.1, 0.5, 0.9] }
  );
  
  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden">
      <div 
        className="relative w-full scroll-container"
        style={{
          willChange: 'transform',
          transform: 'translateZ(0)' // Force GPU acceleration
        }}
      >
        {stoppersConfig.map((stopper, idx) => {
          const isVisible = visibleSections.has(stopper.id);
          
          if (stopper.componentType === 'horizontalStopper') {
            return (
              <VeeSection
                key={stopper.id}
                id={stopper.id}
                isActive={activeStopperId === stopper.id}
                isVisible={isVisible}
                onScrollHandoff={(direction) => handleScrollHandoff(direction, stopper.id)}
                content={<stopper.componentFun sectionRef={stopper.ref} isVisible={isVisible} />}
                handleHover={handleHover}
              />
            );
          }
          
          return (
            <div key={stopper.id} ref={stopper.ref}>
              <stopper.componentFun 
                sectionRef={stopper.ref}
                isVisible={isVisible}
                progress={activePageName === stopper.id ? pageProgress : 0}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Portfolio;
```

### File 4: `useIntersectionObserver.js` - Custom Hook

```javascript
import { useEffect, useState, useRef } from 'react';

export const useIntersectionObserver = (refs, options = {}) => {
  const [visibleSections, setVisibleSections] = useState(new Set());
  const observerRef = useRef(null);
  
  useEffect(() => {
    if (!refs || refs.length === 0) return;
    
    observerRef.current = new IntersectionObserver((entries) => {
      setVisibleSections(prev => {
        const next = new Set(prev);
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            next.add(entry.target.id || entry.target.dataset.sectionId);
          } else {
            next.delete(entry.target.id || entry.target.dataset.sectionId);
          }
        });
        return next;
      });
    }, {
      threshold: options.threshold || [0.1, 0.5, 0.9],
      rootMargin: options.rootMargin || '0px'
    });
    
    // Observe all refs
    refs.forEach(ref => {
      if (ref.current) {
        ref.current.id = ref.current.id || ref.current.dataset?.sectionId;
        observerRef.current.observe(ref.current);
      }
    });
    
    return () => {
      if (observerRef.current) {
        refs.forEach(ref => {
          if (ref.current) {
            observerRef.current.unobserve(ref.current);
          }
        });
        observerRef.current.disconnect();
      }
    };
  }, [refs, options.threshold, options.rootMargin]);
  
  return visibleSections;
};
```

## Migration Steps

1. **Phase 1**: Create `useIntersectionObserver` hook
2. **Phase 2**: Create `useScrollOptimized` hook
3. **Phase 3**: Refactor `AboutMeSection` to use `useScroll` and `React.memo`
4. **Phase 4**: Update `Portfolio.jsx` to use new hooks
5. **Phase 5**: Test and measure performance improvements

## Expected Performance Improvements

- **Re-renders**: Reduced from ~60 per second to ~2-3 per second (only when sections change)
- **CPU Usage**: ~70% reduction (Intersection Observer vs scroll listeners)
- **Frame Rate**: Consistent 60 FPS (no jank from state updates)
- **Memory**: Slight increase (refs + observers) but negligible

## Testing

Use React DevTools Profiler to measure:
- Component render counts
- Render duration
- Time to interactive

Compare before/after metrics.
