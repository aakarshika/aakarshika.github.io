import React from 'react';
import { motion } from 'framer-motion';
import { calculateAnimations } from '../utils/progressAnimationUtils';

/**
 * Example component demonstrating the new JSON-based progressAnimationUtils library
 * Shows different ways to use the animation system with the new format
 */
const AnimationExample = ({ progress }) => {
  // Animation configuration using the new JSON format
  const animationConfig = [
    // Title animations
    {
      object: 'title',
      anim: [
        { type: 'fade', initialValue: 0, startTiming: 0, duration: 5 },
        { type: 'slideY', initialValue: 50, startTiming: 0, duration: 8 }
      ]
    },
    {
      object: 'subtitle',
      anim: [
        { type: 'fade', initialValue: 0, startTiming: 8, duration: 5 },
        { type: 'slideY', initialValue: 30, startTiming: 8, duration: 6 }
      ]
    },
    
    // Scale animation
    {
      object: 'scaleElement',
      anim: [
        { type: 'fade', initialValue: 0, startTiming: 20, duration: 8 },
        { type: 'scale', initialValue: 0.5, startTiming: 20, duration: 8 }
      ]
    },
    
    // Delayed fade
    {
      object: 'fadeInDelayed',
      anim: [
        { type: 'fade', initialValue: 0, startTiming: 30, duration: 10 }
      ]
    },
    
    // Staggered elements
    {
      object: 'item1',
      anim: [
        { type: 'fade', initialValue: 0, startTiming: 40, duration: 8 }
      ]
    },
    {
      object: 'item2',
      anim: [
        { type: 'fade', initialValue: 0, startTiming: 42, duration: 8 }
      ]
    },
    {
      object: 'item3',
      anim: [
        { type: 'fade', initialValue: 0, startTiming: 44, duration: 8 }
      ]
    },
    {
      object: 'item4',
      anim: [
        { type: 'fade', initialValue: 0, startTiming: 46, duration: 8 }
      ]
    },
    
    // Slide animations
    {
      object: 'card1',
      anim: [
        { type: 'fade', initialValue: 0, startTiming: 55, duration: 10 },
        { type: 'slideX', initialValue: -100, startTiming: 55, duration: 10 }
      ]
    },
    {
      object: 'card2',
      anim: [
        { type: 'fade', initialValue: 0, startTiming: 55, duration: 10 },
        { type: 'slideX', initialValue: 100, startTiming: 55, duration: 10 }
      ]
    },
    
    // Simple fade
    {
      object: 'fadeElement',
      anim: [
        { type: 'fade', initialValue: 0, startTiming: 70, duration: 10 }
      ]
    },
    
    // Rotate animation
    {
      object: 'rotateElement',
      anim: [
        { type: 'fade', initialValue: 0, startTiming: 80, duration: 8 },
        { type: 'rotate', initialValue: 0, startTiming: 80, duration: 8 }
      ]
    }
  ];

  // Calculate all animations at once
  const animations = calculateAnimations(animationConfig, progress);

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Title Animations */}
        <section>
          <motion.h1 
            style={{ 
              opacity: animations.title?.fade || 0, 
              y: animations.title?.slideY || 0 
            }}
            className="text-4xl font-bold text-white mb-4"
          >
            Animation Library Demo
          </motion.h1>
          
          <motion.p 
            style={{ 
              opacity: animations.subtitle?.fade || 0, 
              y: animations.subtitle?.slideY || 0 
            }}
            className="text-xl text-white mb-8"
          >
            This demonstrates the new JSON-based progress animation system
          </motion.p>
        </section>

        {/* Scale Animation */}
        <section className="grid md:grid-cols-2 gap-8">
          <motion.div 
            style={{ 
              opacity: animations.scaleElement?.fade || 0, 
              scale: animations.scaleElement?.scale || 0.5 
            }}
            className="bg-purple-600 p-6 rounded-lg"
          >
            <h3 className="text-white text-lg font-semibold">Scale Animation</h3>
            <p className="text-purple-200">This element scales in with a pop effect</p>
          </motion.div>

          <motion.div 
            style={{ opacity: animations.fadeInDelayed?.fade || 0 }}
            className="bg-blue-600 p-6 rounded-lg"
          >
            <h3 className="text-white text-lg font-semibold">Delayed Fade</h3>
            <p className="text-blue-200">This element fades in later</p>
          </motion.div>
        </section>

        {/* Staggered Animations */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Staggered Elements</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['item1', 'item2', 'item3', 'item4'].map((item) => (
              <motion.div
                key={item}
                style={{ opacity: animations[item]?.fade || 0 }}
                className="bg-green-600 p-4 rounded-lg text-center"
              >
                <div className="text-white font-semibold">{item}</div>
                <div className="text-green-200 text-sm">Staggered</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Slide Animations */}
        <section className="grid md:grid-cols-2 gap-8">
          <motion.div 
            style={{ 
              opacity: animations.card1?.fade || 0, 
              x: animations.card1?.slideX || 0 
            }}
            className="bg-red-600 p-6 rounded-lg"
          >
            <h3 className="text-white text-lg font-semibold">Slide from Left</h3>
            <p className="text-red-200">This card slides in from the left</p>
          </motion.div>

          <motion.div 
            style={{ 
              opacity: animations.card2?.fade || 0, 
              x: animations.card2?.slideX || 0 
            }}
            className="bg-orange-600 p-6 rounded-lg"
          >
            <h3 className="text-white text-lg font-semibold">Slide from Right</h3>
            <p className="text-orange-200">This card slides in from the right</p>
          </motion.div>
        </section>

        {/* Simple Fade */}
        <motion.div 
          style={{ opacity: animations.fadeElement?.fade || 0 }}
          className="bg-gray-700 p-6 rounded-lg text-center"
        >
          <h3 className="text-white text-lg font-semibold">Simple Fade</h3>
          <p className="text-white">This element simply fades in</p>
        </motion.div>

        {/* Rotate Animation */}
        <motion.div 
          style={{ 
            opacity: animations.rotateElement?.fade || 0,
            rotate: `${animations.rotateElement?.rotate || 0}deg`
          }}
          className="bg-yellow-600 p-6 rounded-lg text-center"
        >
          <h3 className="text-white text-lg font-semibold">Rotate Animation</h3>
          <p className="text-yellow-200">This element rotates in</p>
        </motion.div>

        {/* Progress Indicator */}
        <div className="fixed bottom-4 right-4 bg-black bg-opacity-50 text-white px-4 py-2 rounded">
          Progress: {Math.round(progress)}%
        </div>

      </div>
    </div>
  );
};

export default AnimationExample; 