import React from 'react';
import { motion } from 'framer-motion';
import { calculateAnimations } from '../utils/progressAnimationUtils';

const HeroSection = ({ progress }) => {
  // // console.log("Hero progress", progress);
  
  // Animation configuration using the new JSON format
  const animationConfig = [
    {
      object: 'designerText',
      anim: [
        { type: 'fade', initialValue: 0, startTiming: 51, duration: 14 },
        { type: 'fade', initialValue: 1, finalValue: 0, startTiming: 63, duration: 1 },
        { type: 'slideX', initialValue: 250, finalValue: 0, startTiming: 51, duration: 14}
      ]
    },
    {
      object: 'mainComponent',
      anim: [
        { type: 'fade', initialValue: 1, finalValue: 0, startTiming: 80, duration: 20 },
        { type: 'slideY', initialValue: 0, finalValue: 300, startTiming: 65, duration: 40}
      ]
    },
  ];
  
  // Calculate animation values using the utility
  const animations = calculateAnimations(animationConfig, progress);

  return (

    <div className="h-screen relative flex items-center justify-center overflow-hidden">

      <motion.div className="text-center z-10"
        style={{
          // y: `${animations.mainComponent?.slideY || 0}px`,
          opacity: progress > 0 ? animations.mainComponent?.fade || 1 : 0
        }}
      >
        <motion.h1 className="text-8xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Aakarshika
        </motion.h1>
        <motion.span className="text-2xl text-white mb-8">
          {(progress < 65 ? 'Software Developer' : 'Software Developer, sometimes Designer')}
        </motion.span>

      <motion.span 
        className="absolute text-2xl text-white mb-8 pointer-events-none"
        style={{
          x: `${animations.designerText?.slideX || 200}px`,
          opacity: animations.designerText?.fade || 0
        }}>
        {', sometimes Designer'}
      </motion.span>
      
        <motion.div
          className="h-1 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto mt-5"
          style={{
            width: `${progress}%`,
            opacity: (100-progress)/100
          }}></motion.div>
      </motion.div>

      {/* Floating Background Elements */}
      <motion.div style={{ opacity:progress  == 0 ? 0 : 1-(progress/100) }} className="absolute top-20 left-20 w-40 h-40 bg-purple-500 rounded-full opacity-40 blur-2xl"></motion.div>
      <motion.div style={{ opacity: progress  == 0 ? 0 : 1-(progress/100) }} className="absolute bottom-20 right-20 w-60 h-60 bg-pink-500 rounded-full opacity-35 blur-2xl"></motion.div>
      <motion.div style={{ opacity:progress  == 0 ? 0 : 1-(progress/100) }} className="absolute top-1/2 left-10 w-32 h-32 bg-blue-500 rounded-full opacity-40 blur-2xl"></motion.div>

      {/* <motion.div style={{ opacity:progress  == 0 ? 0 : 1 }} className="absolute bottom-20 right-20 w-60 h-60 bg-pink-500 rounded-full opacity-35 blur-2xl"></motion.div> */}

    </div>
  );
};

export default HeroSection; 