import React from 'react';
import { motion, useTransform } from 'framer-motion';
import { useSectionScrollProgress } from '../hooks/useSectionScrollProgress';
import { useAnimationValue } from '../hooks/useAnimationValue';

const DESIGNER_SLIDE_ANIM = [{ initialValue: 80, startTiming: 50, duration: 25 }];
const DESIGNER_FADE_ANIM = [
  { initialValue: 0, finalValue: 1, startTiming: 50, duration: 25 },
  { initialValue: 1, finalValue: 0, startTiming: 75, duration: 1 },
];
const MAIN_TEXT_FADE_ANIM = [
  { initialValue: 1, finalValue: 1, startTiming: 50, duration: 25 },
  { initialValue: 1, finalValue: 0, startTiming: 75, duration: 1 },
];
const AFTER_TEXT_FADE_ANIM = [{ initialValue: 0, finalValue: 1, startTiming: 75, duration: 1 }];
const AFTER_TEXT_FADE_ANIM_MOBILE = [{ initialValue: 0, finalValue: 1, startTiming: 55, duration: 4 }];

const HeroSection = React.memo(() => {
  const { sectionRef, progress: progressMotionValue } = useSectionScrollProgress();

  const designerSlideX = useAnimationValue(progressMotionValue, DESIGNER_SLIDE_ANIM, 'slideX', 80);
  const designerFade = useAnimationValue(progressMotionValue, DESIGNER_FADE_ANIM, 'fade', 0);
  const mainTextFade = useAnimationValue(progressMotionValue, MAIN_TEXT_FADE_ANIM, 'fade', 1);
  const afterTextFade = useAnimationValue(progressMotionValue, AFTER_TEXT_FADE_ANIM, 'fade', 0);
  const afterTextFadeMobile = useAnimationValue(progressMotionValue, AFTER_TEXT_FADE_ANIM_MOBILE, 'fade', 0);
  const spacerHeight = useTransform(progressMotionValue, (p) => `${p * 0.8}vh`);
  const barWidth = useTransform(progressMotionValue, (p) => `${p / 2}%`);

  return (
    <div
      ref={sectionRef}
      className="relative min-h-screen  w-full flex flex-col overflow-hidden px-4 sm:px-6"
    >
      <motion.div className='hidden sm:block' style={{ height: spacerHeight }}>
        <div></div>
      </motion.div>
      <div className='sm:hidden ' style={{ height: '40vh' }}>
        <div></div>
      </div>

      <div className="text-center z-10 ">
        <motion.h1 className="text-5xl sm:text-6xl md:text-8xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight">
          Aakarshika
        </motion.h1>
        <div className="hidden sm:flex items-center justify-center mb-8 text-2xl text-white">
          <div className="relative w-full">
            <div className="">
              <motion.span style={{ opacity: mainTextFade }}>
                Software Developer
              </motion.span>
              <motion.span
                className="absolute"
                style={{ x: designerSlideX, opacity: designerFade }}
              >
                , sometimes Designer
              </motion.span>
            </div>
            <motion.span
              className="absolute inset-0"
              style={{ opacity: afterTextFade }}
            >
              Software Developer, sometimes Designer
            </motion.span>
          </div>
        </div>
        <motion.div
          className="h-1 bg-gradient-to-r from-[#ff66cc] to-[#ff66cc] mx-auto mt-5 max-w-[90%] hidden sm:block"
          style={{ width: barWidth }}
        />

        <div className="items-center justify-center mb-8 text-2xl text-white sm:hidden">
          <div className=" w-full">
            <motion.span
              className=""
            >
              Software Developer<motion.span style={{ opacity: afterTextFadeMobile }} >,<br /> sometimes Designer </motion.span>
            </motion.span>
          </div>

          <motion.div
            className=" h-1 bg-gradient-to-r from-[#ff66cc] to-[#ff66cc] mx-auto mt-5 max-w-[90%]"
            style={{ width: barWidth }}
          />
        </div>

      </div>

      <div className="absolute top-16 left-4 sm:left-20 w-24 h-24 sm:w-40 sm:h-40 bg-purple-500 rounded-full opacity-40 blur-2xl pointer-events-none" />
      <div className="absolute bottom-16 right-4 sm:right-20 w-36 h-36 sm:w-60 sm:h-60 bg-pink-500 rounded-full opacity-35 blur-2xl pointer-events-none" />
      <div className="absolute top-1/2 left-2 sm:left-10 w-20 h-20 sm:w-32 sm:h-32 bg-blue-500 rounded-full opacity-40 blur-2xl pointer-events-none" />
    </div>
  );
});

HeroSection.displayName = 'HeroSection';

export default HeroSection; 