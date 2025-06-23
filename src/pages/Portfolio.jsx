import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import ProjectsSection from '../components/ProjectsSection';
import TestimonialsSection from '../components/TestimonialsSection';
import VeeSection from '../components/VeeSection';
import AboutMeSection from '../components/AboutMeSection';
import PicSection from '../components/PicSection';
import ContactSection from '../components/ContactSection';
import HeroSection from '../components/HeroSection';
import { setupScrollEventListeners } from '../utils/scrollEventUtils';
import SkillGraph from '../components/SkillGraph';
import Lottie from 'lottie-react';
import coderAnimation from '../assets/coder2.json';
import clockAnimation from '../assets/clock2.json';
import { 
  calculateAnimation, 
  checkStoppersInView, 
  checkVisibleSection, 
  isContactFullyVisible 
} from '../utils/portfolioUtils';
import { supabase } from '../../supabase';

function dataURLtoBlob(dataurl) {
  const arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1], bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
  for (let i = 0; i < n; i++) u8arr[i] = bstr.charCodeAt(i);
  return new Blob([u8arr], { type: mime });
}

const Portfolio = () => {
  const stoppersListRef = useRef([]);
  const containerRef = useRef(null);
  const [viewHeight, setViewHeight] = useState(0);
  
  const [picturesList, setPicturesList] = useState([]);
  const [fingerprint] = useState(() => Math.random().toString(36).slice(2));

  const getPublicUrl = (filePath) => {
    if (!filePath) return null;
    const { data: { publicUrl } } = supabase.storage
      .from('aakarshika-visitors')
      .getPublicUrl(filePath);
    return publicUrl;
  };

  const fetchPortfolio = async () => {
    try {
      const { data, error } = await supabase
        .from('visitor_fingerprints')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      const d = data.map(pic => ({ src: getPublicUrl(pic.object_name), filter: pic.filter }));
      Array(70-d.length).fill(0).forEach(() => {
        d.push({ src: 'blank', filter: 'none' });
      });
      console.log(d);
      setPicturesList(d.sort((a, b) => Math.random() - 0.5));
    } catch (err) {
      console.error('Error fetching visitor images:', err);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const handleCapture = async (imageSrc, filter) => {
    const imageBlob = dataURLtoBlob(imageSrc);
    const fileName = `${Date.now()}_${fingerprint}.jpg`;
    try {
      const { error: uploadError } = await supabase.storage
        .from('aakarshika-visitors')
        .upload(fileName, imageBlob, {
          cacheControl: '3600',
          upsert: false
        });
      if (uploadError) throw uploadError;
      const { error: insertError } = await supabase
        .from('visitor_fingerprints')
        .insert({
          fingerprint,
          object_name: fileName,
          filter
        });
      if (insertError) throw insertError;
      await fetchPortfolio();
    } catch (err) {
      console.error('Error uploading visitor picture:', err);
    }
  };

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

  const photoLottieRef = useRef();
  const clockLottieRef = useRef();

  useEffect(() => {
    const handleResize = () => setViewHeight(window.innerHeight);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const aboutMeProgress = visibleSections.find(section => section.id === 'about-me')?.cumulativeProgress || 0;
  const photoAnim = calculateAnimation('photo', aboutMeProgress, photoAnimationSequence, viewHeight);

  // Animate clock: fade in at 10%, fade out at 80%, move left to right

  const clockX = Math.min(1, Math.max(0, (60 - 10) / 70)) * (window.innerWidth - 200); // 200px margin
  const clockY = Math.min(1, Math.max(0, (aboutMeProgress - 10) / 70)) * (window.innerHeight - 200) - 100; // 200px margin

  // Define stoppers configuration
  const stoppersConfig = [
    {
      id: 'hero',
      componentType: 'none',
      componentFun: () => <HeroSection progress={aboutMeProgress} />,
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
      componentFun: () => <PicSection progress={cumulativeProgress} pictures={picturesList} onCapture={handleCapture} />,
      ref: useRef(null)
    },
    {
      id: 'contact',
      componentType: 'none',
      componentFun: () => <ContactSection  />,
      ref: useRef(null)
    }
    ];
  
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

  // Update visible section whenever scroll position changes
  useEffect(() => {
    const updateVisibleSection = () => {
      const result = checkVisibleSection(stoppersConfig);
      const visibleSectionsData = result;
      const previousData = previousVisibleSectionsRef.current;
      
      // Add waning/waxing information by comparing with previous data
      const sectionsWithTrend = visibleSectionsData.map(section => {
        // console.log('Section:', section);
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
        // console.log('Currently visible sections:', sectionsWithTrend);
        if (sectionsWithTrend.length > 0) {
          // console.log('Cumulative progress:', sectionsWithTrend[0].cumulativeProgress.toFixed(1) + '%');
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
  }, [scrollY]);

  useEffect(() => {
    console.log("visibleSections[0].visibilityPercentagevisibleSections[0].visibilityPercentage", visibleSections?.[0]?.visibilityPercentage)
    if(visibleSections.length > 0 && visibleSections?.[0]?.visibilityPercentage > 90) {
      console.log(visibleSections, "visibleSections ssssssss ssssssss ssssssss ssssssss ssssssss ssssssss ssssssss ssssssss ssssssss ssssssss ssssssss ssssssss ssssssss ssssssss ssssssss ssssssss ssssssss ssssssss ");
    }
  }, [visibleSections]);


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
            return Math.max(0, Math.min(maxScrollY, newY));
          });
        } else {
          // In exclusive mode, don't handle vertical scroll at all
          // console.log('Exclusive mode: Ignoring vertical scroll during horizontal');
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
      if (e.deltaY > 0 && isContactFullyVisible(visibleSections)) {
        // Block further downward scroll
        return;
      }
      // --- End block ---
      
      if (stopperInView && !activeStopperId) {
        // Activate stopper section
        // console.log('Activating stopper section:', stopperInView);
        setActiveStopperId(stopperInView);
      } else {
        // Normal vertical scrolling (either not in stopper or stopper not active)
        // console.log('Scrolling vertically, deltaY:', e.deltaY);
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
      if (deltaY > 0 && isContactFullyVisible(visibleSections)) {
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
  }, [activeStopperId, isHandingOff, scrollParallelly]);

  useEffect(() => {
    if (photoLottieRef.current && photoLottieRef.current.getDuration) {
      const totalFrames = photoLottieRef.current.getDuration(true);
      const frame = Math.round((aboutMeProgress / 100) * (totalFrames - 1));
      if (!isNaN(frame)) {
        photoLottieRef.current.goToAndStop(frame, true);
      }
    }
    if (clockLottieRef.current && clockLottieRef.current.getDuration) {
      const totalFrames = clockLottieRef.current.getDuration(true);
      const frame = Math.round((aboutMeProgress / 100) * (totalFrames - 1));
      if (!isNaN(frame)) {
        clockLottieRef.current.goToAndStop(frame, true);
      }
    }
  }, [aboutMeProgress]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-black text-white overflow-hidden"
    >
    {/* Sticky Photo/Avatar */}
    <motion.div 
      className="fixed top-0 right-8  rounded-lg p-8 h-120 w-120 flex items-center justify-center z-40"
      style={{ 
        opacity: photoAnim.opacity, 
        scale: photoAnim.scale,
        y: photoAnim.y
      }}
    >
      <Lottie
        animationData={coderAnimation}
        loop={false}
        autoplay={false}
        style={{ height: '500px', width: '500px', background: 'none' }}
        lottieRef={photoLottieRef}
      />
    </motion.div>

      {/* Sticky Photo/Avatar */}
      <motion.div 
        className="fixed top-0 left-0 rounded-lg p-8 h-100 w-100 flex items-center justify-center z-50"
        style={{
          opacity: aboutMeProgress < 10 ? 0 :  aboutMeProgress > 80 ? 0 :  1,
          x: clockX,
          y: clockY,
          scale: aboutMeProgress < 10 ? 1 :  aboutMeProgress > 90 ? 0.1 :  1-((aboutMeProgress) /200),
          pointerEvents: 'none', // so it doesn't block UI
        }}
        transition={{
          duration: 0.6,
          ease: "easeInOut"
        }}
      >
        <Lottie
          animationData={clockAnimation}
          loop={false}
          autoplay={false}
          style={{ height: '400px', width: '400px', background: 'none' }}
          lottieRef={clockLottieRef}
        />
      </motion.div>

      <motion.div 
        className="fixed top-0 left-0 m-12 p-16 rounded-full  h-100 w-100 flex items-center justify-center z-50 "
        style={{
          opacity: aboutMeProgress < 10 ? 0 :  aboutMeProgress > 80 ? 0 :  1,
          x: clockX,
          y: clockY,
          scale: aboutMeProgress < 10 ? 1 :  aboutMeProgress > 90 ? 0.1 :  1-((aboutMeProgress) /200),
          pointerEvents: 'none', // so it doesn't block UI
        }}
        transition={{
          duration: 0.6,
          ease: "easeInOut"
        }}
      >
        <div
        className='rounded-full'
          style={{ 
            opacity: 0.5,
            height: '250px', width: '200px', 
            transform: 'rotate(25deg) translateX(18px) translateY(-18px)',
            backgroundColor: 'rgb(142, 142, 142)', color: 'green' }}
        />
      </motion.div>

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
