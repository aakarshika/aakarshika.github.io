import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const AboutMeSection = ({ progress }) => {
  const [viewHeight, setViewHeight] = useState(0);

  useEffect(() => {
    const handleResize = () => setViewHeight(window.innerHeight);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Animation sequence configuration - All animations complete by 50%
  const animationSequence = {
    title: {
      start: 0,
      duration: 10,
      initialY: 50,
      yMultiplier: 3
    },
    firstText: {
      start: 5,
      duration: 15,
      initialY: 30,
      yMultiplier: 2
    },
    secondText: {
      start: 20,
      duration: 15,
      initialY: 1,
      yMultiplier: 1.3
    },
    skills: {
      start: 25,
      duration: 10,
      initialY: 40,
      yMultiplier: 2.5
    },
    skill1: {
      start: 30,
      duration: 8,
      initialY: 30,
      yMultiplier: 2,
      initialX: -100,
      xMultiplier: 8
    },
    skill2: {
      start: 32,
      duration: 8,
      initialY: 30,
      yMultiplier: 2,
      initialX: 100,
      xMultiplier: -8
    },
    skill3: {
      start: 34,
      duration: 8,
      initialY: 30,
      yMultiplier: 2,
      initialX: -100,
      xMultiplier: 8
    },
    skill4: {
      start: 36,
      duration: 8,
      initialY: 30,
      yMultiplier: 2,
      initialX: 100,
      xMultiplier: -8
    }
  };

  // Calculate animation values for any element with improved easing
  const calculateAnimation = (elementKey) => {
    const config = animationSequence[elementKey];
    if (!config || !progress) return { 
      opacity: 0, 
      
      x: config?.initialX || 0, 
      scale: config?.initialScale || 1 
    };

    const { start, duration, initialY, yMultiplier, initialX, xMultiplier, initialScale, scaleIncrement } = config;
    
    // Calculate progress within this element's animation window (0 to 1)
    // Cap progress at 50% to ensure animations complete by then
    const cappedProgress = Math.min(progress, 50);
    const elementProgress = cappedProgress >= start ? Math.min((cappedProgress - start) / duration, 1) : 0;
    
    // Apply easing for smoother animation (ease-out cubic)
    const easedProgress = 1 - Math.pow(1 - elementProgress, 3);
    
    // Opacity: 0 to 1 based on eased progress
    const opacity = easedProgress;
    
    // Y movement: from initialY to 0 with easing
    const y = cappedProgress >= start ? 
      initialY * (1 - easedProgress) : 
      initialY;
    
    // X movement: from initialX to 0 with easing
    const x = initialX ? 
      (cappedProgress >= start ? initialX * (1 - easedProgress) : initialX) : 
      0;
    
    // Scale: from initialScale to final scale with easing
    const scale = initialScale ? 
      (cappedProgress >= start ? initialScale + (easedProgress * scaleIncrement) : initialScale) : 
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
    <div className="relative min-h-screen bg-gradient-to-b from-black to-gray-900 py-20">
      
      <div className="about-section container mx-auto px-6">
        <motion.h2 
          style={{ 
            opacity: titleAnim.opacity, 
            
          }}
          className="text-6xl font-bold  mb-16 bg-gradient-to-r from-blue-400 to-gray-400 bg-clip-text text-transparent"
        >
          About Me
        </motion.h2>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <motion.div 
              style={{ 
                opacity: firstTextAnim.opacity, 
                
              }}
              className="text-xl text-gray-300 leading-relaxed mb-6"
            >
              I'm building intelligent, cross-platform apps. 
              Trying to combine real-time systems, elegant UX, and AI-driven features, hoping for clean code and bold experiences.
            </motion.div>
            <motion.div 
              style={{ 
                opacity: secondTextAnim.opacity, 
                
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
            paddingRight: '500px',
            paddingTop: '100px'
          }}
          className="grid md:grid-cols-4 gap-4"
        >
          <motion.div 
            style={{ 
              opacity: skill1Anim.opacity, 
              
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