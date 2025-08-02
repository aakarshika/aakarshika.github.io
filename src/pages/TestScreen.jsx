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
import { useState, useEffect } from 'react';
// import { useAdditionalModels } from '../hooks/useAdditionalModels';

const TestScreen = () => {
  // const containerRef = useRef(null);
  
  // Use extracted hooks
  const { picturesList, handleCapture, handleDelete, fingerprint } = useVisitorPortfolio();
  
  // Initialize additional models at Portfolio level
  // Temporarily disabled to fix camera issue
  const additionalModelsInitialized = false;
  const additionalModelsLoadingStatus = "Disabled";
  const processAdditionalModelsFrame = null;
  const getFaceMeshResults = () => null;
  const getPoseResults = () => null;
  const getFaceDetectionResults = () => null;
  const toggleAdditionalModel = () => {};


  // Use scroll management hook
  // const { scrollY, activeStopperId, activePageName, pageProgress,  handleScrollHandoff, handleHover } = useScrollManagement({stoppersConfig});
  
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
          // transform: `translateY(-${scrollY}px)`
        }}
      >
        
        <PicSection 
          progress={0} 
          pictures={picturesList} 
          onCapture={handleCapture} 
          currentFingerprint={fingerprint} 
          onDelete={handleDelete}
          // Pass additional models data
          additionalModelsInitialized={additionalModelsInitialized}
          additionalModelsLoadingStatus={additionalModelsLoadingStatus}
          processAdditionalModelsFrame={processAdditionalModelsFrame}
          getFaceMeshResults={getFaceMeshResults}
          getPoseResults={getPoseResults}
          getFaceDetectionResults={getFaceDetectionResults}
          toggleAdditionalModel={toggleAdditionalModel}
        />
      </div>
    </div>
  );
};

export default TestScreen;
