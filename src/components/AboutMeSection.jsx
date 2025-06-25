import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const AboutMeSection = ({ progress }) => {
  // console.log("progress", progress);
  // Animation sequence configuration - All animations complete by progress 50, exit animations start at 65
  const animationSequence = {
    title: {
      start: 0,
      duration: 15,
      initialY: 100,
      yMultiplier: 3,
      exitStart: 65,
      exitDuration: 15,
      exitType: 'fade'
    },
    firstText: {
      start: 8,
      duration: 18,
      initialY: 60,
      yMultiplier: 2,
      exitStart: 70,
      exitDuration: 12,
      exitType: 'slideUp'
    },
    secondText: {
      start: 18,
      duration: 15,
      initialY: 40,
      yMultiplier: 1.3,
      exitStart: 72,
      exitDuration: 10,
      exitType: 'slideUp'
    },
    skills: {
      start: 25,
      duration: 12,
      initialY: 80,
      yMultiplier: 2.5,
      exitStart: 75,
      exitDuration: 10,
      exitType: 'fade'
    },
    skill1: {
      start: 28,
      duration: 10,
      initialY: 60,
      yMultiplier: 2,
      initialX: -150,
      xMultiplier: 8,
      exitStart: 78,
      exitDuration: 8,
      exitType: 'slideLeft'
    },
    skill2: {
      start: 30,
      duration: 10,
      initialY: 60,
      yMultiplier: 2,
      initialX: 150,
      xMultiplier: -8,
      exitStart: 80,
      exitDuration: 8,
      exitType: 'slideRight'
    },
    skill3: {
      start: 32,
      duration: 10,
      initialY: 60,
      yMultiplier: 2,
      initialX: -150,
      xMultiplier: 8,
      exitStart: 82,
      exitDuration: 8,
      exitType: 'slideLeft'
    },
    skill4: {
      start: 34,
      duration: 10,
      initialY: 60,
      yMultiplier: 2,
      initialX: 150,
      xMultiplier: -8,
      exitStart: 84,
      exitDuration: 8,
      exitType: 'slideRight'
    }
  };

  // Calculate animation values for any element with improved easing
  const calculateAnimation = (elementKey) => {
    const config = animationSequence[elementKey];
    if (!config || !progress) return { 
      opacity: 0, 
      y: config?.initialY || 0,
      x: config?.initialX || 0, 
      scale: config?.initialScale || 1 
    };

    const { start, duration, initialY, yMultiplier, initialX, xMultiplier, initialScale, scaleIncrement, exitStart, exitDuration, exitType } = config;
    
    // Handle entrance animation
    let entranceProgress = 0;
    if (progress >= start) {
      entranceProgress = Math.min((progress - start) / duration, 1);
    }
    
    // Handle exit animation
    let exitProgress = 0;
    if (exitStart && progress >= exitStart) {
      exitProgress = Math.min((progress - exitStart) / exitDuration, 1);
    }
    
    // Apply easing for smoother animation (ease-out cubic)
    const easedEntranceProgress = 1 - Math.pow(1 - entranceProgress, 3);
    const easedExitProgress = 1 - Math.pow(1 - exitProgress, 3);
    
    // Opacity: 0 to 1 during entrance, 1 to 0 during exit
    let opacity = easedEntranceProgress;
    if (exitProgress > 0) {
      opacity = 1 - easedExitProgress;
    }
    
    // Y movement: from initialY to 0 during entrance
    let y = progress >= start ? initialY * (1 - easedEntranceProgress) : initialY;
    
    // Add exit Y movement based on exit type
    if (exitProgress > 0) {
      if (exitType === 'slideUp') {
        y = -50 * easedExitProgress; // Slide up and out
      } else if (exitType === 'slideDown') {
        y = 50 * easedExitProgress; // Slide down and out
      }
    }
    
    // X movement: from initialX to 0 during entrance
    let x = initialX ? (progress >= start ? initialX * (1 - easedEntranceProgress) : initialX) : 0;
    
    // Add exit X movement based on exit type
    if (exitProgress > 0) {
      if (exitType === 'slideLeft') {
        x = -100 * easedExitProgress; // Slide left and out
      } else if (exitType === 'slideRight') {
        x = 100 * easedExitProgress; // Slide right and out
      }
    }
    
    // Scale: from initialScale to final scale with easing
    const scale = initialScale ? 
      (progress >= start ? initialScale + (easedEntranceProgress * scaleIncrement) : initialScale) : 
      1;

    return { opacity, y, x, scale };
  };

  // Get animation values for each element
  const titleAnim = calculateAnimation('title');
  const firstTextAnim = calculateAnimation('firstText');
  const secondTextAnim = calculateAnimation('secondText');
  const skillsAnim = calculateAnimation('skills');
  const skill1Anim = calculateAnimation('skill1');
  const skill2Anim = calculateAnimation('skill2');
  const skill3Anim = calculateAnimation('skill3');
  const skill4Anim = calculateAnimation('skill4');

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-black to-gray-900 flex items-center justify-center py-20">
      <div className="about-section container mx-auto px-6 max-w-6xl">
        <motion.h2 
          style={{ 
            opacity: titleAnim.opacity, 
            y: titleAnim.y
          }}
          className="text-6xl font-bold text-center mb-16 bg-gradient-to-r from-blue-400 to-gray-400 bg-clip-text text-transparent"
        >
          About Me
        </motion.h2>
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <motion.div 
              style={{ 
                opacity: firstTextAnim.opacity, 
                y: firstTextAnim.y
              }}
              className="text-xl text-gray-300 leading-relaxed mb-6"
            >
              I'm building intelligent, cross-platform apps. 
              Trying to combine real-time systems, elegant UX, and AI-driven features, hoping for clean code and bold experiences.
            </motion.div>
            <motion.div 
              style={{ 
                opacity: secondTextAnim.opacity, 
                y: secondTextAnim.y
              }}
              className="text-lg text-gray-400"
            >
              Engineer, system thinker, and AI whisperer.
            </motion.div>
          </div>
        </div>
        <motion.div 
          style={{ 
            opacity: skillsAnim.opacity, 
            y: skillsAnim.y
          }}
          className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto"
        >
          <motion.div 
            style={{ 
              opacity: skill1Anim.opacity, 
              y: skill1Anim.y,
              x: skill1Anim.x
            }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold mb-2">Frontend</h3>
            <p className="text-gray-400">React, Kotlin, Angular</p>
          </motion.div>
          <motion.div 
            style={{ 
              opacity: skill2Anim.opacity, 
              y: skill2Anim.y,
              x: skill2Anim.x
            }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold mb-2">Backend</h3>
            <p className="text-gray-400">Node.js, Python, APIs, Java</p>
          </motion.div>
          <motion.div 
            style={{ 
              opacity: skill3Anim.opacity, 
              y: skill3Anim.y,
              x: skill3Anim.x
            }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-red-500 rounded-full mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold mb-2">Database</h3>
            <p className="text-gray-400">MongoDB, PostgreSQL, MySQL</p>
          </motion.div>
          <motion.div 
            style={{ 
              opacity: skill4Anim.opacity, 
              y: skill4Anim.y,
              x: skill4Anim.x
            }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold mb-2">Cloud</h3>
            <p className="text-gray-400">AWS, Vercel, Supabase</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutMeSection; 