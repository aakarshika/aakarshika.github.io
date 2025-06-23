import React from 'react';
import { motion } from 'framer-motion';

const HeroSection = ({progress}) => {
  return (
        
    <div className="h-screen relative flex items-center justify-center">
    <motion.div className="text-center z-10"
    style={{
      y: progress*5,
      x: progress*-10,
    }}
    >
      <motion.h1 className="text-8xl font-bold mb-6 bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
        Aakarshika 
      </motion.h1>
      <motion.p className="text-2xl text-gray-300 mb-8">
        Software Developer, not Designer
      </motion.p>
      <motion.div className="w-24 h-1 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto"></motion.div>
    </motion.div>
    
    {/* Floating Background Elements */}
    <div className="absolute top-20 left-20 w-32 h-32 bg-purple-500 rounded-full opacity-20 blur-xl"></div>
    <div className="absolute bottom-20 right-20 w-48 h-48 bg-pink-500 rounded-full opacity-15 blur-2xl"></div>
    <div className="absolute top-1/2 left-10 w-20 h-20 bg-blue-500 rounded-full opacity-25 blur-lg"></div>
  </div>
  );
};

export default HeroSection; 