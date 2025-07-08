import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import girlMain from '../assets/girl_main.png';
import winkingGirl from '../assets/winking_girl.png';
import hand from '../assets/hand.png';
import laptop from '../assets/laptop.png';
import laptopBase from '../assets/lapbase.png';
import table from '../assets/table.png';
import { calculateAnimations } from '../utils/progressAnimationUtils';

const AboutMeSection = ({ progress }) => {

  // Animation configuration using fade and slide animations
  const animationConfig = [
    {
      object: 'title',
      anim: [
        { type: 'fade', initialValue: 0, finalValue: 0.8, startTiming: 0, duration: 15 },
        { type: 'slideY', initialValue: 50, finalValue: 0, startTiming: 0, duration: 15 },
        // { type: 'fade', initialValue: 1, finalValue: 0, startTiming: 60, duration: 15 },
      ]
    },
    {
      object: 'firstText',
      anim: [
        { type: 'fade', initialValue: 0, startTiming: 8, duration: 18 },
        { type: 'slideY', initialValue: 30, finalValue: 0, startTiming: 8, duration: 18 },
        // { type: 'fade', initialValue: 1, finalValue: 0, startTiming: 65, duration: 15 },
      ]
    },
    {
      object: 'secondText',
      anim: [
        { type: 'fade', initialValue: 0, startTiming: 18, duration: 15 },
        { type: 'slideY', initialValue: 20, finalValue: 0, startTiming: 18, duration: 15 },
        // { type: 'fade', initialValue: 1, finalValue: 0, startTiming: 70, duration: 10 },
      ]
    },
    {
      object: 'skills',
      anim: [
        { type: 'fade', initialValue: 0, startTiming: 25, duration: 12 },
        { type: 'slideY', initialValue: 40, finalValue: 0, startTiming: 25, duration: 12 }
      ]
    },
    {
      object: 'skill1',
      anim: [
        { type: 'fade', initialValue: 0, startTiming: 28, duration: 10 },
        { type: 'slideX', initialValue: -100, finalValue: 0, startTiming: 28, duration: 10 },
        // { type: 'fade', initialValue: 1, finalValue: 0, startTiming: 60, duration: 10 },
      ]
    },
    {
      object: 'skill2',
      anim: [
        { type: 'fade', initialValue: 0, startTiming: 30, duration: 10 },
        { type: 'slideX', initialValue: 100, finalValue: 0, startTiming: 30, duration: 10 },
        // { type: 'fade', initialValue: 1, finalValue: 0, startTiming: 70, duration: 10 },
      ]
    },
    {
      object: 'skill3',
      anim: [
        { type: 'fade', initialValue: 0, startTiming: 32, duration: 10 },
        { type: 'slideX', initialValue: -100, finalValue: 0, startTiming: 32, duration: 10 },
        // { type: 'fade', initialValue: 1, finalValue: 0, startTiming: 80, duration: 10 },
      ]
    },
    {
      object: 'skill4',
      anim: [
        { type: 'fade', initialValue: 0, startTiming: 34, duration: 10 },
        { type: 'slideX', initialValue: 100, finalValue: 0, startTiming: 34, duration: 10 },
        // { type: 'fade', initialValue: 1, finalValue: 0, startTiming: 90, duration: 10 },
      ]
    },
    {
      object: 'aboutImage',
      anim: [
        { type: 'fade', initialValue: 0, finalValue: 1, startTiming: 0, duration: 25 },
        { type: 'slideY', initialValue: -1000, finalValue: 0, startTiming: 0, duration: 45 },
        // { type: 'fade', initialValue: 1, finalValue: 0, startTiming: 65, duration: 15 },
      ]
    },
    {
      object: 'laptopImage',
      anim: [
        { type: 'fade', initialValue: 0, finalValue: 1, startTiming: 35, duration: 10 },
        { type: 'slideX', initialValue: 200, finalValue: 0, startTiming: 35, duration: 10 },
      ]
    },
    {
      object: 'tableImage', 
      anim: [
        { type: 'fade', initialValue: 0, finalValue: 1, startTiming: 45, duration: 10 },
        { type: 'slideX', initialValue: 200, finalValue: 0, startTiming: 45, duration: 10 },
      ]
    }
  ];

  // Calculate all animations using the utility
  const animations = calculateAnimations(animationConfig, progress);
  // // console.log("AboutMeSection progress:", progress);
  // // console.log("AboutMeSection animations:", animations);
  // // console.log("Title fade value:", animations.title?.fade);
  // // console.log("Title slideY value:", animations.title?.slideY);


  return (
    <div className="relative min-h-screen bg-gradient-to-b from-black to-gray-900 flex items-center justify-center py-20">

      {/* Floating Background Elements */}
      <motion.div style={{ opacity:progress  == 0 ? 0 : (progress/100) }} className="absolute bottom-20 left-20 w-40 h-40 bg-purple-500 rounded-full opacity-40 blur-2xl"></motion.div>
      <motion.div style={{ opacity:progress  == 0 ? 0 : (progress/100) }} className="absolute top-0 right-10 w-32 h-32 bg-blue-500 rounded-full opacity-40 blur-2xl"></motion.div>


      <div className="absolute right-0 top-0 bg-gray-800 rounded-lg h-full flex items-center justify-center">
        {/* <motion.img 
          src={twirlyImg} 
          alt="Twirly App Screenshot" 
          className="rounded-lg w-full h-full object-cover"
          style={{
            opacity: animations.title?.fade || 0,
            y: animations.title?.slideY || 0,
            x: animations.title?.slideX || 0
          }}
        /> */}
      </div>

      {progress > 0 && (<div className="absolute about-section container mx-auto px-6 max-w-6xl">

        <div className="grid md:grid-cols-2 gap-12 items-start mb-16">
          <div>
            <motion.h2
              style={{
                opacity: animations.title?.fade || 0,
                y: animations.title?.slideY || 0
              }}
              className="text-6xl font-bold text-start mb-16 bg-gradient-to-r from-blue-400 to-gray-400 bg-clip-text text-transparent"
            >
              About Me
            </motion.h2>
            <motion.div
              style={{
                opacity: animations.firstText?.fade || 0,
                y: animations.firstText?.slideY || 0
              }}
              className="text-xl text-white leading-relaxed mb-6"
            >
              I'm building intelligent, cross-platform apps.
              Trying to combine real-time systems, elegant UX, and AI-driven features, hoping for clean code and bold experiences.
            </motion.div>
            <motion.div
              style={{
                opacity: animations.secondText?.fade || 0
              }}
              className="text-lg text-white"
            >
              Engineer, system thinker, and AI whisperer.
            </motion.div>
          </div>
          <div>
              <div className="relative w-full h-96">
              <motion.div style={{ opacity: progress  == 0 ? 0 : (progress/100) }} 
              className="absolute w-96 h-96 bg-pink-500 rounded-full opacity-35 blur-2xl"></motion.div>

              <motion.img
                  src={laptopBase}
                  alt="Laptop base Image"
                  className="rounded-lg w-full h-full object-cover absolute inset-0"
                  style={{
                    opacity: animations.laptopImage?.fade || 0,
                    x: animations.laptopImage?.slideX || 0
                  }}
                />
                <motion.img
                  src={winkingGirl}
                  alt="Winking Girl Image"
                  className="rounded-lg w-full h-full object-cover absolute inset-0"
                  style={{
                    opacity: progress > 55 && progress < 70 ? animations.aboutImage?.fade || 0 : 0,
                    y: animations.aboutImage?.slideY || 0
                  }}
                />
                <motion.div 
                  style={{
                    opacity: progress < 55 || progress > 70 ? animations.aboutImage?.fade || 0 : 0,
                    y: progress < 55 || progress > 70 ? animations.aboutImage?.slideY || 0 : 0
                  }}
                  className="rounded-lg w-full h-full object-cover absolute inset-0">
                <img
                  src={girlMain}
                  alt="Girl Main Image"
                  className="rounded-lg w-full h-full object-cover absolute inset-0"
                />
                <img
                  src={hand}
                  alt="Hand Image"
                  className="rounded-lg w-full h-full object-cover absolute inset-0"
                />
                </motion.div>
                <motion.img
                  src={laptop}
                  alt="Laptop Image"
                  className="rounded-lg w-full h-full object-cover absolute inset-0"
                  style={{
                    opacity: animations.laptopImage?.fade || 0,
                    x: animations.laptopImage?.slideX || 0
                  }}
                />
                <motion.img
                  src={table}
                  alt="Table Image"
                  className="rounded-lg w-full h-full object-cover absolute inset-0"
                  style={{
                    opacity: animations.tableImage?.fade || 0,
                    x: animations.tableImage?.slideX || 0
                  }}
                />
              </div>
          </div>
        </div>
        <motion.div
          style={{
            opacity: animations.skills?.fade || 0
          }}
          className="grid md:grid-cols-4 gap-8"
        >
          <motion.div
            style={{
              opacity: animations.skill1?.fade || 0,
              x: animations.skill1?.slideX || 0
            }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold mb-2">Frontend</h3>
            <p className="text-white">React, Kotlin, Angular</p>
          </motion.div>
          <motion.div
            style={{
              opacity: animations.skill2?.fade || 0,
              x: animations.skill2?.slideX || 0
            }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold mb-2">Backend</h3>
            <p className="text-white">Node.js, Python, APIs, Java</p>
          </motion.div>
          <motion.div
            style={{
              opacity: animations.skill3?.fade || 0,
              x: animations.skill3?.slideX || 0
            }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-red-500 rounded-full mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold mb-2">Database</h3>
            <p className="text-white">MongoDB, PostgreSQL, MySQL</p>
          </motion.div>
          <motion.div
            style={{
              opacity: animations.skill4?.fade || 0,
              x: animations.skill4?.slideX || 0
            }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold mb-2">Cloud</h3>
            <p className="text-white">AWS, Vercel, Supabase</p>
          </motion.div>
        </motion.div>
      </div>)}




    </div>
  );
};

export default AboutMeSection; 