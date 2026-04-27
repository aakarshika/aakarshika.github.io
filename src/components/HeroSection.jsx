import React, { useMemo } from 'react';
import { motion, useTransform } from 'framer-motion';
import { calculateAnimations } from '../utils/progressAnimationUtils';
import { useSectionScrollProgress } from '../hooks/useSectionScrollProgress';

const HeroSection = React.memo(() => {
  const { sectionRef, progress: progressMotionValue } = useSectionScrollProgress();

  // Animation config: only transforms (slideX, slideY); no opacity used
  const animationConfig = useMemo(() => [
    {
      object: 'designerText',
      anim: [
        { type: 'slideX', initialValue: 250, finalValue: 0, startTiming: 50, duration: 25 },
        { type: 'fade', initialValue: 0, finalValue: 1, startTiming: 50, duration: 25 },
        { type: 'fade', initialValue: 1, finalValue: 0, startTiming: 75, duration: 1 },
      ]
    },
    {
      object: 'mainText',
      anim: [
        { type: 'fade', initialValue: 1, finalValue: 1, startTiming: 50, duration: 25 },
        { type: 'fade', initialValue: 1, finalValue: 0, startTiming: 75, duration: 1 },
      ]
    },
    {
      object: 'afterText',
      anim: [
        { type: 'fade', initialValue: 0, finalValue: 1, startTiming: 75, duration: 1 },
      ]
    }
  ], []);

  const designerSlideX = useTransform(progressMotionValue, (progress) => {
    const anims = calculateAnimations(animationConfig, progress);
    const slideX = anims.designerText?.slideX ?? 0;
    return slideX;
  });
  const designerFade = useTransform(progressMotionValue, (progress) => {
    const anims = calculateAnimations(animationConfig, progress);
    const fade = anims.designerText?.fade ?? 0;
    return fade;
  });
  const mainTextFade = useTransform(progressMotionValue, (progress) => {
    const anims = calculateAnimations(animationConfig, progress);
    const fade = anims.mainText?.fade ?? 1;
    return fade;
  });
  const afterTextFade = useTransform(progressMotionValue, (progress) => {
    const anims = calculateAnimations(animationConfig, progress);
    const fade = anims.afterText?.fade ?? 0;
    return fade;
  });

  const spacerHeight = useTransform(progressMotionValue, (p) => `${p * 0.8}vh`);
  const barWidth = useTransform(progressMotionValue, (p) => `${p/2}%`);

  return (
    <div ref={sectionRef}
      className="h-screen w-full flex flex-col overflow-hidden"
    >
      <motion.div style={{ height: spacerHeight }}>
        <div></div>
      </motion.div>

      <div className="text-center z-10">
        <motion.h1 className="text-8xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Aakarshika
        </motion.h1>
        <div className="flex items-center justify-center mb-8 text-2xl text-white">
          <div className="relative w-full">
            <div>
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
          className="h-1 bg-gradient-to-r from-[#ff66cc] to-[#ff66cc] mx-auto mt-5"
          style={{ width: barWidth }}
        />
      </div>

      <div className="absolute top-20 left-20 w-40 h-40 bg-purple-500 rounded-full opacity-40 blur-2xl" />
      <div className="absolute bottom-20 right-20 w-60 h-60 bg-pink-500 rounded-full opacity-35 blur-2xl" />
      <div className="absolute top-1/2 left-10 w-32 h-32 bg-blue-500 rounded-full opacity-40 blur-2xl" />
    </div >
  );
});

HeroSection.displayName = 'HeroSection';

export default HeroSection; 