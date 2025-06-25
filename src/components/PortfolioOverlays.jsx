import React from 'react';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import coderAnimation from '../assets/coder2.json';
import clockAnimation from '../assets/clock2.json';

const PortfolioOverlays = ({ 
  aboutMeProgress, 
  photoAnim, 
  clockX, 
  clockY, 
  photoLottieRef, 
  clockLottieRef 
}) => {
  return (
    <>
      {/* Sticky Photo/Avatar */}
      <motion.div 
        className="fixed top-0 right-8 rounded-lg p-8 h-120 w-120 flex items-center justify-center z-40"
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

      {/* Sticky Clock Animation */}
      <motion.div 
        className="fixed top-0 left-0 rounded-lg p-8 h-100 w-100 flex items-center justify-center z-50"
        style={{
          opacity: aboutMeProgress < 10 ? 0 : aboutMeProgress > 80 ? 0 : 1,
          x: clockX,
          y: clockY,
          scale: aboutMeProgress < 10 ? 1 : aboutMeProgress > 90 ? 0.1 : 1-((aboutMeProgress) /200),
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

      {/* Background Element */}
      <motion.div 
        className="fixed top-0 left-0 m-12 p-16 rounded-full h-100 w-100 flex items-center justify-center z-50"
        style={{
          opacity: aboutMeProgress < 10 ? 0 : aboutMeProgress > 80 ? 0 : 1,
          x: clockX,
          y: clockY,
          scale: aboutMeProgress < 10 ? 1 : aboutMeProgress > 90 ? 0.1 : 1-((aboutMeProgress) /200),
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
            backgroundColor: 'rgb(142, 142, 142)', color: 'green' 
          }}
        />
      </motion.div>
    </>
  );
};

export default PortfolioOverlays; 