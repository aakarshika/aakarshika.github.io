import React from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Circle, ThumbsUp } from 'lucide-react';
import { createWigglePreset } from '../utils/progressAnimationUtils';
import { useAnimationValue } from '../hooks/useAnimationValue';

const OptionTwirly = ({ val, className = '' }) => (
  <div className={`w-full h-full object-cover aspect-square rounded-lg p-4 flex items-center justify-center ${className}`}>
    <p className="text-md text-gray-800 font-bold text-center font-mono">{val}</p>
  </div>
);

const TWIRLY_PREV_ANIM = [
  { initialValue: 220, startTiming: 9 },
  { initialValue: 0, finalValue: -320, startTiming: 20, duration: 16 },
];
const TWIRLY_IMAGE1_ANIM = [
  { initialValue: 220, startTiming: 10 },
  { initialValue: 0, finalValue: -320, startTiming: 20, duration: 16 },
];
const TWIRLY_IMAGE2_ANIM = [
  { initialValue: 220, startTiming: 10.5 },
  { initialValue: 0, finalValue: -320, startTiming: 20, duration: 16 },
];
const TWIRLY_IMAGE3_ANIM = [
  { initialValue: 220, startTiming: 11 },
  { initialValue: 0, finalValue: -320, startTiming: 20, duration: 16 },
];
const TWIRLY_IMAGE4_SLIDE_ANIM = [
  { initialValue: 220, startTiming: 11.5 },
  { initialValue: 0, finalValue: -320, startTiming: 20, duration: 16 },
];
const TWIRLY_IMAGE4_SCALE_ANIM = [{ initialValue: 1, finalValue: 1.1, startTiming: 18, duration: 2 }];
const TWIRLY_5_THUMBSUP_ANIM = [{ initialValue: 0, finalValue: 1, startTiming: 25, duration: 1 }];
const TITLE_ANIM = [{ initialValue: 100, startTiming: 7, duration: 2 }];
const DESCRIPTION_ANIM = [{ initialValue: 70, startTiming: 8, duration: 3 }];
const COMMON_FADE_ANIM = [{ initialValue: 1, finalValue: 0.95, startTiming: 18, duration: 5 }];
const THUMBSUP_FADE_ANIM = [{ initialValue: 0, finalValue: 1, startTiming: 19, duration: 1 }];
const THUMBSUP_WIGGLE_ROTATE_ANIM = createWigglePreset(16, 'rotate', false);
const THUMBSUP_WIGGLE_SCALE_ANIM = createWigglePreset(16, 'scale', false);

export const TwirlyProject = ({ progressMotionValue }) => {
  const fallbackProgress = useMotionValue(0);
  const activeProgress = progressMotionValue ?? fallbackProgress;
  const titleSlideX = useAnimationValue(activeProgress, TITLE_ANIM, 'slideX', 0);
  const descriptionSlideX = useAnimationValue(activeProgress, DESCRIPTION_ANIM, 'slideX', 0);
  const twirlyPrevSlideY = useAnimationValue(activeProgress, TWIRLY_PREV_ANIM, 'slideY', 0);
  const twirlyImage1SlideY = useAnimationValue(activeProgress, TWIRLY_IMAGE1_ANIM, 'slideY', 0);
  const twirlyImage2SlideY = useAnimationValue(activeProgress, TWIRLY_IMAGE2_ANIM, 'slideY', 0);
  const twirlyImage3SlideY = useAnimationValue(activeProgress, TWIRLY_IMAGE3_ANIM, 'slideY', 0);
  const twirlyImage4SlideY = useAnimationValue(activeProgress, TWIRLY_IMAGE4_SLIDE_ANIM, 'slideY', 0);
  const twirlyImage4Scale = useAnimationValue(activeProgress, TWIRLY_IMAGE4_SCALE_ANIM, 'scale', 1);
  const commonFade = useAnimationValue(activeProgress, COMMON_FADE_ANIM, 'fade', 1);
  const appearThumbsUp = useAnimationValue(activeProgress, THUMBSUP_FADE_ANIM, 'fade', 1);
  const appearThumbsUp5 = useAnimationValue(activeProgress, TWIRLY_5_THUMBSUP_ANIM, 'fade', 0);
  const wiggleRotation = useAnimationValue(activeProgress, THUMBSUP_WIGGLE_ROTATE_ANIM, 'rotate', 0);
  const wiggleScale = useAnimationValue(activeProgress, THUMBSUP_WIGGLE_SCALE_ANIM, 'scale', 1, (value) => value * 1.5);

  const twirlyImage4BackgroundColor = useTransform(appearThumbsUp, [0, 1], ['#e5e7eb', 'rgb(255, 237, 166)']);
  const twirlyImage5BackgroundColor = useTransform(appearThumbsUp5, [0, 1], ['#e5e7eb', 'rgb(166, 194, 255)']);

  return (
    <div className="w-screen h-screen  flex items-center justify-center relative flex-shrink-0">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-purple-900"></div>
      <div className="absolute inset-0 bg-gradient-to-l from-purple-900 to-transparent "></div>

      <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center max-w-6xl">
        <div className="relative">
          <motion.h3 className="text-5xl font-bold mb-6 text-cyan-400" style={{ x: titleSlideX }}>
            Twirly App
          </motion.h3>
          <motion.p className="text-xl text-white mb-6" style={{ x: descriptionSlideX }}>
            A real-time <motion.span className=" text-cyan-400">social comparison platform</motion.span> for mobile and web. Built with
            live voting system, TikTok-style infinite scroll, and mobile-first UI with smooth animations.
          </motion.p>
          <div className="relative flex space-x-4 mb-6">
            <span className="px-3 py-1 bg-blue-600 rounded-full text-sm">React</span>
            <span className="px-3 py-1 bg-green-600 rounded-full text-sm">Supabase</span>
            <span className="px-3 py-1 bg-purple-600 rounded-full text-sm">PostgreSQL</span>
            <span className="px-3 py-1 bg-cyan-600 rounded-full text-sm">Tailwind</span>
            <span className="px-3 py-1 bg-pink-600 rounded-full text-sm">Framer Motion</span>
          </div>
          <a href="https://twirlyapp.com" target="_blank" className="text-cyan-400 hover:text-cyan-300 font-semibold" rel="noreferrer">
            View Live Site →
          </a>
        </div>
        <div className="flex justify-center">
          <div className="relative w-[400px] h-[800px] rounded-[3rem] border-8 border-slate-800 bg-slate-950 shadow-2xl shadow-black/50 p-3 rotate-1">
            <div className="pointer-events-none absolute top-3 left-1/2 z-30 h-7 w-28 -translate-x-1/2 rounded-full bg-slate-900"></div>
            <div className="absolute inset-3 rounded-[2.4rem] overflow-hidden bg-slate-100">
              <motion.div className="absolute inset-0 p-4 " style={{ y: -180 }} >
                <motion.div className="rounded-lg bg-white p-4 mt-4" style={{
                    y: twirlyPrevSlideY,
                  }}
                >
                  <div className="w-full mt-4 mb-4">
                    <p className="inline-flex text-sm text-gray-700">
                      <Circle className="w-3 h-3 mt-1 mr-1" fill="currentColor" /> Dream House Location:
                    </p>
                  </div>

                  <div className="w-full h-full grid grid-cols-2 gap-3">
                    <div className="overflow-hidden rounded-lg">
                      <OptionTwirly val="In the city" className="bg-[#e5e7eb]" />
                    </div>
                    <div className="overflow-hidden rounded-lg">
                      <OptionTwirly val="At the beach" className="bg-[#e5e7eb]" />
                    </div>
                    <motion.div className="relative overflow-hidden rounded-lg" style={{ scale: 1.1 }}>
                      <OptionTwirly val="In the mountains" className="bg-green-100" />
                      <motion.div className="absolute top-0 left-0" style={{ x: 10, y: 8, scale: 1.1 }}>
                        <ThumbsUp className="w-4 h-4 text-green-400" />
                      </motion.div>
                    </motion.div>
                    <div className="relative overflow-hidden rounded-lg">
                      <OptionTwirly val="In the library" className="bg-[#e5e7eb]" />
                    </div>
                  </div>
                  <div className="w-full mt-4 h-1 bg-gray-200"></div>
                </motion.div>

                <motion.div className="rounded-lg bg-white p-4 mt-4" style={{ y: twirlyPrevSlideY }} >
                  <motion.div className="w-full mt-4 mb-4" >
                    <p className="inline-flex text-sm text-gray-700">
                      <Circle className="w-3 h-3 mt-1 mr-1" fill="currentColor" /> I am usually found:
                    </p>
                  </motion.div>

                  <div className=" grid grid-cols-2 gap-3 h-full w-full">
                    <motion.div className="overflow-hidden rounded-lg" style={{ opacity: commonFade }}>
                      <OptionTwirly val="Scheduling meetings" className="bg-[#e5e7eb]" />
                    </motion.div>
                    <motion.div className="overflow-hidden rounded-lg" style={{ opacity: commonFade }}>
                      <OptionTwirly val="Balancing work-life" className="bg-[#e5e7eb]" />
                    </motion.div>
                    <motion.div className="overflow-hidden rounded-lg" style={{ opacity: commonFade }}>
                      <OptionTwirly val="Pivoting strategies" className="bg-[#e5e7eb]" />
                    </motion.div>
                    <motion.div
                      className="relative overflow-hidden rounded-lg"
                      style={{ scale: twirlyImage4Scale, backgroundColor: twirlyImage4BackgroundColor }}
                    >
                      <OptionTwirly val="Shipping features no one asked for" />
                      <motion.div
                        className="absolute top-0 left-0"
                        style={{ scale: wiggleScale, rotate: wiggleRotation, x: 10, y: 8, opacity: appearThumbsUp }}
                      >
                        <ThumbsUp className="w-4 h-4 text-yellow-400" />
                      </motion.div>
                    </motion.div>
                  </div>
                  <motion.div className="w-full mt-4 h-1 bg-gray-200" style={{ opacity: commonFade }}></motion.div>
                </motion.div>

                <motion.div className="rounded-lg bg-white p-4 mt-4"  style={{
                    y: twirlyPrevSlideY,
                  }}
                >
                  <div className="w-full mt-4 mb-4">
                    <p className="inline-flex text-sm text-gray-700">
                      <Circle className="w-3 h-3 mt-1 mr-1" fill="currentColor" /> You should buy me a:
                    </p>
                  </div>

                  <div className="w-full h-full grid grid-cols-2 gap-3">
                    <motion.div className="relative overflow-hidden rounded-lg" style={{ backgroundColor: twirlyImage5BackgroundColor }}>
                      <OptionTwirly val="Vanilla Ice Cream" />
                      <motion.div
                        className="absolute top-0 left-0"
                        style={{ scale: wiggleScale, rotate: wiggleRotation, x: 10, y: 8, opacity: appearThumbsUp5 }}
                      >
                        <ThumbsUp className="w-4 h-4 text-blue-400" />
                      </motion.div>
                    </motion.div>
                    <div className="overflow-hidden rounded-lg">
                      <OptionTwirly val="Chocolate Bar" className="bg-[#e5e7eb]" />
                    </div>
                    <motion.div className="relative overflow-hidden rounded-lg">
                      <OptionTwirly val="Strawberry Smoothie" className="bg-[#e5e7eb]" />
                    </motion.div>
                    <div className="relative overflow-hidden rounded-lg">
                      <OptionTwirly val="Mint Chocolate Chip" className="bg-[#e5e7eb]" />
                    </div>
                  </div>
                  <div className="w-full mt-4 h-1 bg-gray-200"></div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
