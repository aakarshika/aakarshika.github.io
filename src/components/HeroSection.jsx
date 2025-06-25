import React from 'react';
import { motion } from 'framer-motion';

const HeroSection = ({ progress }) => {
  console.log("progress", progress);
  return (

    <div className="h-screen relative flex items-center justify-center overflow-hidden">

      <motion.span 
        className="absolute text-2xl text-gray-300 mb-8 pointer-events-none"
        style={{
          y: 65,
          // transform: `translateX(${progress*10}px)`,
          right: `${((progress*20-500))}px`,
          opacity: progress > 65 ? 0 : progress < 51 ? 0 : 1
        }}>
        {', not Designer'}
      </motion.span>
      
      <motion.div className="text-center z-10"
        initial={{
          opacity: progress > 50 ? 1 : 0,
        }}
        animate={{
          opacity: 1
        }}
        transition={{
          duration: 1,
          ease: "easeInOut",
        }}
      >
        <motion.h1 className="text-8xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Aakarshika
        </motion.h1>
        <motion.span className="text-2xl text-gray-300 mb-8">
          {(progress < 65 ? 'Software Developer' : 'Software Developer, not Designer')}
        </motion.span>
        <motion.div
          className="h-1 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto mt-5"
          style={{
            width: `${progress}%`,
            opacity: (100-progress)/100
          }}></motion.div>
      </motion.div>

      {/* Floating Background Elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-purple-500 rounded-full opacity-20 blur-xl"></div>
      <div className="absolute bottom-20 right-20 w-48 h-48 bg-pink-500 rounded-full opacity-15 blur-2xl"></div>
      <div className="absolute top-1/2 left-10 w-20 h-20 bg-blue-500 rounded-full opacity-25 blur-lg"></div>
    </div>
  );
};

export default HeroSection; 