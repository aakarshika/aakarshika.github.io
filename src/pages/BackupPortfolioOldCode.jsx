import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import ProjectsSection from '../components/ProjectsSection';
import VeeSection from '../components/VeeSection';
import AboutMeSection from '../components/AboutMeSection';
import PicSection from '../components/PicSection';
import ContactSection from '../components/ContactSection';
import HeroSection from '../components/HeroSection';
import SkillGraph from '../components/SkillGraph';
import { useVisitorPortfolio } from '../hooks/useVisitorPortfolio';
import { useScrollManagement } from '../hooks/useScrollManagement';
import { useState } from 'react';

const Portfolio = () => {
  // const containerRef = useRef(null);
  
  // Use extracted hooks
  const { picturesList, handleCapture, handleDelete, fingerprint } = useVisitorPortfolio();
  // Define stoppers configuration
  const stoppersConfig = [
    {
      id: 'hero',
      componentType: 'none',
      componentFun: () => <HeroSection progress={activePageName == 'hero' ? pageProgress : 0} />,
      ref: useRef(null)
    },
    {
      id: 'about-me', 
      componentType: 'none',
      componentFun: () => <AboutMeSection progress={activePageName == 'about-me' ? pageProgress : 0} />,
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
    {
      id: 'interactive',
      componentType: 'none',
      componentFun: () => <PicSection progress={activePageName == 'interactive' ? pageProgress : 0} pictures={picturesList} onCapture={handleCapture} currentFingerprint={fingerprint} onDelete={handleDelete} />,
      ref: useRef(null)
    },
    {
      id: 'contact',
      componentType: 'none',
      componentFun: () => <ContactSection />,
      ref: useRef(null)
    }
  ];

  // Use scroll management hook
  const { scrollY, activeStopperId, activePageName, pageProgress,  handleScrollHandoff, handleHover } = useScrollManagement({stoppersConfig});
  
  return (
    <div 
      // ref={containerRef}
      className="fixed inset-0 bg-black text-white overflow-hidden"
    >
      {/* Portfolio Overlays */}
      {/* <PortfolioOverlays 
        pageProgress={pageProgress}
        photoAnim={photoAnim}
        clockX={clockX}
        clockY={clockY}
        photoLottieRef={photoLottieRef}
        clockLottieRef={clockLottieRef}
      /> */}

      <div 
        className="relative w-full"
        style={{
          transform: `translateY(-${scrollY}px)`
        }}
      >
        {/* Render all stopper sections */}
        {stoppersConfig.map((stopper, idx) => {
          return stopper.componentType === 'horizontalStopper' ? (
            <div key={stopper.id + ' ' + idx} ref={stopper.ref}>
              <VeeSection
                id={stopper.id}
                isActive={activeStopperId === stopper.id}
                progress={activePageName == stopper.id ? pageProgress : 0}
                onScrollHandoff={(direction) => handleScrollHandoff(direction, stopper.id)}
                content={<stopper.componentFun />}
                handleHover={handleHover}
                />
            </div>
          ) : stopper.componentType === 'customHorizontalStopper' ? (
            <div key={stopper.id + ' ' + idx} ref={stopper.ref}>
              {stopper.getFun === 'SkillGraph' ? 
                <SkillGraph 
                  isActive={activeStopperId === stopper.id} 
                  onScrollHandoff={(direction) => {
                    handleScrollHandoff(direction, stopper.id);
                  }}
                  scrollY={scrollY}
                  handleHover={handleHover}
                /> 
                : <div />
              }
            </div>
          ) : (
            <div key={stopper.id + ' ' + idx} ref={stopper.ref}
            // onMouseEnter={() => setHovered(true)}
            // onMouseLeave={() => setHovered(false)}
            >
              <stopper.componentFun />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Portfolio;
