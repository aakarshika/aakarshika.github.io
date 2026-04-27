import React, { useMemo } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import twirlyImg from '../assets/twirly.png';
import daywiseImg1 from '../assets/daywise1.png';
import daywiseImg2 from '../assets/daywise2.png';
import daywiseImg3 from '../assets/daywise3.png';
import portfolioImg from '../assets/portfolio_img.png';
import { calculateAnimations, createWigglePreset } from '../utils/progressAnimationUtils';
import { ThumbsUp } from 'lucide-react';
import { Circle } from 'lucide-react';
export const ProjectTitle = () => {
  return (
    <div className="w-screen h-screen flex bg-gradient-to-b from-gray-900 to-purple-900 items-center justify-center flex-shrink-0">
      <div className="max-w-4xl">
        <h2 className="text-7xl font-bold pb-8 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
          Projects
        </h2>
        <p className="text-2xl text-white mb-4">that I spend late nights on</p>
        <div className="w-32 h-1 bg-gradient-to-r from-yellow-400 to-orange-400 mx-auto"></div>
      </div>
    </div>
  );
};

export const TwirlyProject = ({ progressMotionValue }) => {
  const fallbackProgress = useMotionValue(0);
  const activeProgress = progressMotionValue ?? fallbackProgress;
  const animationConfig = useMemo(() => [
    {
      object: 'twirlyPrev',
      anim: [
        { type: 'slideY', initialValue: 220, finalValue: 0, startTiming: 9, duration: 6 },
        { type: 'slideY', initialValue: 0, finalValue: -320, startTiming: 20, duration: 16 },
      ]
    },
    {
      object: 'twirlyImage1',
      anim: [
        { type: 'slideY', initialValue: 220, finalValue: 0, startTiming: 10, duration: 6 },
        { type: 'slideY', initialValue: 0, finalValue: -320, startTiming: 20, duration: 16 },
      ]
    },
    {
      object: 'twirlyImage2',
      anim: [
        { type: 'slideY', initialValue: 220, finalValue: 0, startTiming: 10.5, duration: 6 },
        { type: 'slideY', initialValue: 0, finalValue: -320, startTiming: 20, duration: 16 },
      ]
    },
    {
      object: 'twirlyImage3',
      anim: [
        { type: 'slideY', initialValue: 220, finalValue: 0, startTiming: 11, duration: 6 },
        { type: 'slideY', initialValue: 0, finalValue: -320, startTiming: 20, duration: 16 },
      ]
    },
    {
      object: 'twirlyImage4',
      anim: [
        { type: 'slideY', initialValue: 220, finalValue: 0, startTiming: 11.5, duration: 6 },
        { type: 'slideY', initialValue: 0, finalValue: -320, startTiming: 20, duration: 16 },
        { type: 'fade', initialValue: 0, finalValue: 1, startTiming: 15, duration: 1 },
        { type: 'scale', initialValue: 1, finalValue: 1.1, startTiming: 18, duration: 2 },
      ]
    },
    {
      object: 'twirly5ThumbsUp',
      anim: [
        { type: 'fade', initialValue: 0, finalValue: 1, startTiming: 25, duration: 1 },
      ]
    },
    {
      object: 'title',
      anim: [
        { type: 'slideX', initialValue: 100, finalValue: 0, startTiming: 7, duration: 2 },
      ]
    },
    {
      object: 'description',
      anim: [
        { type: 'slideX', initialValue: 70, finalValue: 0, startTiming: 8, duration: 3 },
      ]
    },
    {
      object: 'description2',
      anim: [
        { type: 'slideX', initialValue: 100, finalValue: 0, startTiming: 9, duration: 5 },
      ]
    },
    {
      object: 'commonFade',
      anim: [
        { type: 'fade', initialValue: 1, finalValue: 0.95, startTiming: 18, duration: 5 },
      ]
    },
    {
      object: 'thumbsUp',
      anim: createWigglePreset(16)
    },
    {
      object: 'thumbsUpFade',
      anim: [
        { type: 'fade', initialValue: 0, finalValue: 1, startTiming: 16, duration: 1 },
      ]
    }

  ], []);
  const twirlyImage1SlideY = useTransform(activeProgress, (progress) => {
    const anims = calculateAnimations(animationConfig, progress);
    return anims.twirlyImage1?.slideY ?? 0;
  });
  const twirlyImage2SlideY = useTransform(activeProgress, (progress) => {
    const anims = calculateAnimations(animationConfig, progress);
    return anims.twirlyImage2?.slideY ?? 0;
  });
  const twirlyImage3SlideY = useTransform(activeProgress, (progress) => {
    const anims = calculateAnimations(animationConfig, progress);
    return anims.twirlyImage3?.slideY ?? 0;
  });
  const twirlyImage4SlideY = useTransform(activeProgress, (progress) => {
    const anims = calculateAnimations(animationConfig, progress);
    return anims.twirlyImage4?.slideY ?? 0;
  });
  const descriptionSlideX = useTransform(activeProgress, (progress) => {
    const anims = calculateAnimations(animationConfig, progress);
    return anims.description?.slideX ?? 0;
  });
  const titleSlideX = useTransform(activeProgress, (progress) => {
    const anims = calculateAnimations(animationConfig, progress);
    return anims.title?.slideX ?? 0;
  });
  const description2SlideX = useTransform(activeProgress, (progress) => {
    const anims = calculateAnimations(animationConfig, progress);
    return anims.description2?.slideX ?? 0;
  });
  const twirlyImage4Scale = useTransform(activeProgress, (progress) => {
    const anims = calculateAnimations(animationConfig, progress);
    return anims.twirlyImage4?.scale ?? 1;
  });
  const commonFade = useTransform(activeProgress, (progress) => {
    const anims = calculateAnimations(animationConfig, progress);
    return anims.commonFade?.fade ?? 1;
  });
  const wiggleRotation = useTransform(activeProgress, (progress) => {
    const anims = calculateAnimations(animationConfig, progress);
    return anims.thumbsUp?.rotate ?? 0;
  });
  const wiggleScale = useTransform(activeProgress, (progress) => {
    const anims = calculateAnimations(animationConfig, progress);
    return anims.thumbsUp?.scale * 1.5 ?? 1;
  });
  const appearThumbsUp5 = useTransform(activeProgress, (progress) => {
    const anims = calculateAnimations(animationConfig, progress);
    return anims.twirly5ThumbsUp?.fade ?? 0;
  });
  const twirlyImage5BackgroundColor = useTransform(
    appearThumbsUp5,
    [0, 1],
    ['#e5e7eb', 'rgb(166, 194, 255)']
  );
  const appearThumbsUp = useTransform(activeProgress, (progress) => {
    const anims = calculateAnimations(animationConfig, progress);
    return anims.thumbsUpFade?.fade ?? 1;
  });
  const twirlyImage4BackgroundColor = useTransform(
    appearThumbsUp,
    [0, 1],
    ['#e5e7eb', 'rgb(255, 237, 166)']
  );
  const twirlyPrevSlideY = useTransform(activeProgress, (progress) => {
    const anims = calculateAnimations(animationConfig, progress);
    return anims.twirlyPrev?.slideY ?? 0;
  });
  const OptionTwirly = ({ val, className }) => {
    return (
      <div className={`w-full h-full object-cover aspect-square rounded-lg p-4 flex items-center justify-center ${className}`}>
        <p className="text-lg text-gray-800 font-bold text-center font-mono">{val}</p>
      </div>
    );
  };

  return (
    <div className="w-screen h-screen  flex items-center justify-center relative flex-shrink-0">
      {/* Background div */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-purple-900"></div>
      <div className="absolute inset-0 bg-gradient-to-l from-purple-900 to-transparent "></div>

      {/* Content */}
      <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center max-w-6xl">
        <div className="relative">
          <motion.h3 className="text-5xl font-bold mb-6 text-cyan-400" style={{ x: titleSlideX }}>
            Twirly App
          </motion.h3>
          <motion.p className="text-xl text-white mb-6" style={{ x: descriptionSlideX }}>
            A real-time <motion.span className=" text-cyan-400">social comparison platform</motion.span> for mobile and web. Built with live voting system,
            TikTok-style infinite scroll, and mobile-first UI with smooth animations.
          </motion.p>
          <div className="relative flex space-x-4 mb-6">
            <span className="px-3 py-1 bg-blue-600 rounded-full text-sm">React</span>
            <span className="px-3 py-1 bg-green-600 rounded-full text-sm">Supabase</span>
            <span className="px-3 py-1 bg-purple-600 rounded-full text-sm">PostgreSQL</span>
            <span className="px-3 py-1 bg-cyan-600 rounded-full text-sm">Tailwind</span>
            <span className="px-3 py-1 bg-pink-600 rounded-full text-sm">Framer Motion</span>
          </div>
          <a href="https://twirlyapp.com" target="_blank" className="text-cyan-400 hover:text-cyan-300 font-semibold">
            View Live Site →
          </a>
        </div>
        <div>

          <motion.div
            className="rounded-lg p-12 " style={{
              width: 400, height: 400,
              y: twirlyPrevSlideY
            }}>
            <div className="w-full mt-4 mb-4">
               
               <p className="inline-flex text-white-500 text-sm"><Circle className="w-3 h-3 mt-1 mr-1" fill="white" /> Dream House Location:</p>
            </div>

            <div className="w-full h-full grid grid-cols-2 gap-3">
              <div className="overflow-hidden rounded-lg">
                <OptionTwirly val="In the city" className="bg-gray-100" />
              </div>
              <div className="overflow-hidden rounded-lg">
                <OptionTwirly val="At the beach" className="bg-gray-100" />
              </div>
              <motion.div className="relative overflow-hidden rounded-lg" style={{ scale: 1.1 }}>
                <OptionTwirly val="In the mountains" className="bg-green-100" />
                <motion.div className="absolute top-0 left-0" style={{ x: 10, y: 8, scale: 1.1 }}>
                  <ThumbsUp className="w-4 h-4 text-green-400" />
                </motion.div>
              </motion.div>
              <div className="relative overflow-hidden rounded-lg">
                <OptionTwirly val="In the library" className="bg-gray-100" />
              </div>
            </div>
            <div className="w-full mt-4 h-1 bg-gray-200"></div>
          </motion.div>


          <motion.div className="rounded-lg p-12" style={{ width: 400, height: 400 }}>
            <motion.div className="w-full mt-4 mb-4" style={{ y: twirlyImage1SlideY }}>
               
               <p className="inline-flex text-white-500 text-sm"><Circle className="w-3 h-3 mt-1 mr-1" fill="white" /> I am usually found:</p>
            </motion.div>

            <div className=" grid grid-cols-2 gap-3 h-full w-full" >
              <motion.div className="overflow-hidden rounded-lg" style={{ y: twirlyImage1SlideY, opacity: commonFade }}>
                <OptionTwirly val="Scheduling meetings" className="bg-gray-100" />
              </motion.div>
              <motion.div className="overflow-hidden rounded-lg" style={{ y: twirlyImage2SlideY, opacity: commonFade }}>
                <OptionTwirly val="Balancing work-life" className="bg-gray-100" />
              </motion.div>
              <motion.div className="overflow-hidden rounded-lg" style={{ y: twirlyImage3SlideY, opacity: commonFade }}>
                <OptionTwirly val="Pivoting strategies" className="bg-gray-100" />
              </motion.div>
              <motion.div className="relative overflow-hidden rounded-lg" style={{ y: twirlyImage4SlideY, scale: twirlyImage4Scale, backgroundColor: twirlyImage4BackgroundColor }}>
                <OptionTwirly val="Shipping features no one asked for" />
                <motion.div className="absolute top-0 left-0" style={{ scale: wiggleScale, rotate: wiggleRotation, x: 10, y: 8, opacity: appearThumbsUp }}>
                  <ThumbsUp className="w-4 h-4 text-yellow-400" />
                </motion.div>
              </motion.div>
            </div>
            <motion.div className="w-full mt-4 h-1 bg-gray-200" style={{ y: twirlyImage1SlideY, opacity: commonFade }}></motion.div>
          </motion.div>

          <motion.div
            className="rounded-lg p-12 " style={{
              width: 400, height: 400,
              y: twirlyPrevSlideY
            }}>
            <div className="w-full mt-4 mb-4">
               
               <p className="inline-flex text-white-500 text-sm"><Circle className="w-3 h-3 mt-1 mr-1" fill="white" /> You should buy me a:</p>
            </div>

            <div className="w-full h-full grid grid-cols-2 gap-3">
              
            <motion.div className="relative overflow-hidden rounded-lg" style={{ backgroundColor: twirlyImage5BackgroundColor }}>
                <OptionTwirly val="Vanilla Ice Cream" />
                <motion.div className="absolute top-0 left-0" style={{ scale: wiggleScale, rotate: wiggleRotation, x: 10, y: 8, opacity: appearThumbsUp5 }}>
                  <ThumbsUp className="w-4 h-4 text-blue-400" />
                </motion.div>
              </motion.div>
              <div className="overflow-hidden rounded-lg">
                <OptionTwirly val="Chocolate Bar" className="bg-gray-100" />
              </div>
              <motion.div className="relative overflow-hidden rounded-lg" >
                <OptionTwirly val="Strawberry Smoothie" className="bg-gray-100" />
              </motion.div>
              <div className="relative overflow-hidden rounded-lg">
                <OptionTwirly val="Mint Chocolate Chip" className="bg-gray-100" />
              </div>
            </div>
            <div className="w-full mt-4 h-1 bg-gray-200"></div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export const DaywiseProject = ({ progressMotionValue }) => {
  const fallbackProgress = useMotionValue(0);
  const activeProgress = progressMotionValue ?? fallbackProgress;

  const animationConfig = useMemo(() => [
    {
      object: 'daywise1',
      anim: [
        { type: 'slideX', initialValue: 220, finalValue: 0, startTiming: 28, duration: 6 },
        { type: 'slideX', initialValue: 0, finalValue: -320, startTiming: 44, duration: 10 },
        { type: 'fade', initialValue: 0, finalValue: 1, startTiming: 28, duration: 6 },
        { type: 'fade', initialValue: 1, finalValue: 0, startTiming: 44, duration: 10 },
        { type: 'scale', initialValue: 0.8, finalValue: 1, startTiming: 28, duration: 6 },
      ]
    },
    {
      object: 'daywise2',
      anim: [
        { type: 'slideX', initialValue: 220, finalValue: 0, startTiming: 32, duration: 6 },
        { type: 'slideX', initialValue: 0, finalValue: -320, startTiming: 44, duration: 10 },
      ]
    },
    {
      object: 'daywise3',
      anim: [
        { type: 'slideX', initialValue: 220, finalValue: 0, startTiming: 36, duration: 6 },
        { type: 'slideX', initialValue: 0, finalValue: -320, startTiming: 44, duration: 10 },
      ]
    },

  ], []);
  const daywise1SlideX = useTransform(activeProgress, (progress) => {
    const anims = calculateAnimations(animationConfig, progress);
    return anims.daywise1?.slideX ?? 0;
  });
  const daywise2SlideX = useTransform(activeProgress, (progress) => {
    const anims = calculateAnimations(animationConfig, progress);
    return anims.daywise2?.slideX ?? 0;
  });
  const daywise3SlideX = useTransform(activeProgress, (progress) => {
    const anims = calculateAnimations(animationConfig, progress);
    return anims.daywise3?.slideX ?? 0;
  });
  const daywise1Fade = useTransform(activeProgress, (progress) => {
    const anims = calculateAnimations(animationConfig, progress);
    return anims.daywise1?.fade ?? 0;
  });
  const daywise1Scale = useTransform(activeProgress, (progress) => {
    const anims = calculateAnimations(animationConfig, progress);
    return anims.daywise1?.scale ?? 1;
  });


  return (
    <div className="w-screen h-screen  flex items-center justify-center relative flex-shrink-0">
      {/* Background div */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900 to-[#3c0086] "></div>

      {/* Content */}
      <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center max-w-6xl">

        <div className="rounded-lg grid grid-cols-3 gap-2 w-250 h-320">
          <motion.div className="overflow-hidden rounded-lg" style={{ x: daywise1SlideX, opacity: daywise1Fade, scale: daywise1Scale }}>
            <img src={daywiseImg1} alt="Daywise App Screenshot" className="bg-pink-100 w-full h-full object-cover rounded-lg" />
          </motion.div>
          <motion.div className="overflow-hidden rounded-lg" style={{ x: daywise2SlideX, opacity: daywise1Fade, scale: daywise1Scale }}>
            <img src={daywiseImg2} alt="Daywise App Screenshot" className="bg-blue-100 w-full h-full object-cover rounded-lg" />
          </motion.div>
          <motion.div className="overflow-hidden rounded-lg" style={{ x: daywise3SlideX, opacity: daywise1Fade, scale: daywise1Scale }}>
            <img src={daywiseImg3} alt="Daywise App Screenshot" className="bg-green-100 w-full h-full object-cover rounded-lg" />
          </motion.div>
        </div>
        <div>
          <h3 className="text-5xl font-bold mb-6 text-pink-400">Daywise</h3>
          <p className="text-xl text-white mb-6">
            An ADHD-friendly To-Do mobile app using LLMs for predictive, personalized tasking.
            Built with shared business logic for Android/iOS using Kotlin Multiplatform.
          </p>
          <div className="flex space-x-4 mb-6">
            <span className="px-3 py-1 bg-red-600 rounded-full text-sm">Kotlin Multiplatform</span>
            <span className="px-3 py-1 bg-yellow-600 rounded-full text-sm">Hugging Face</span>
            <span className="px-3 py-1 bg-indigo-600 rounded-full text-sm">GPT</span>
            <span className="px-3 py-1 bg-green-600 rounded-full text-sm">ML</span>
          </div>
          <a href="https://github.com/aakarshika/daywisehub" target="_blank" className="text-pink-400 hover:text-pink-300 font-semibold">
            View App Code →
          </a>
        </div>
      </div>
    </div>
  );
};

export const WriterverseProject = ({ progressMotionValue }) => {
  const fallbackProgress = useMotionValue(0);
  const activeProgress = progressMotionValue ?? fallbackProgress;
  const animationConfig = useMemo(() => [
    {
      object: 'writerversePanel',
      anim: [
        { type: 'slideY', initialValue: -320, finalValue: 0, startTiming: 40, duration: 10 },
      ]
    }
  ], []);
  const writerversePanelSlideY = useTransform(activeProgress, (progress) => {
    const anims = calculateAnimations(animationConfig, progress);
    return anims.writerversePanel?.slideY ?? 0;
  });

  return (
    <div className="w-screen h-screen  flex items-center justify-center relative flex-shrink-0">
      {/* Background div */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#3c0086] to-blue-900"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#3c0086] to-transparent "></div>

      {/* Content */}
      <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center max-w-6xl">
        <div>
          <h3 className="text-5xl font-bold mb-6 text-fuchsia-400">Writerverse</h3>
          <p className="text-xl text-white mb-6">
            A writing helper agent for long-form storytelling and novel workflows.
            Built with LangGraph to support iterative drafting, brainstorming, and editing support.
          </p>
          <div className="flex space-x-4 mb-6">
            <span className="px-3 py-1 bg-fuchsia-600 rounded-full text-sm">LangGraph</span>
            <span className="px-3 py-1 bg-indigo-600 rounded-full text-sm">LLMs</span>
            <span className="px-3 py-1 bg-violet-600 rounded-full text-sm">Agentic Workflows</span>
          </div>
        </div>
        <motion.div
          className="bg-gray-800 rounded-lg h-80 flex items-center justify-center p-6"
          style={{ y: writerversePanelSlideY }}
        >
          <p className="text-2xl text-fuchsia-300 font-semibold text-center">AI Writing Copilot</p>
        </motion.div>
      </div>
    </div>
  );
};

export const OutgoingProject = ({ progressMotionValue }) => {
  const fallbackProgress = useMotionValue(0);
  const activeProgress = progressMotionValue ?? fallbackProgress;
  const animationConfig = useMemo(() => [
    {
      object: 'outgoingPanel',
      anim: [
        { type: 'slideY', initialValue: -320, finalValue: 0, startTiming: 55, duration: 10 },
      ]
    }
  ], []);
  const outgoingPanelSlideY = useTransform(activeProgress, (progress) => {
    const anims = calculateAnimations(animationConfig, progress);
    return anims.outgoingPanel?.slideY ?? 0;
  });

  return (
    <div className="w-screen h-screen  flex items-center justify-center relative flex-shrink-0">
      {/* Background div */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#3c0086] to-blue-900"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900 to-transparent "></div>

      {/* Content */}
      <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center max-w-6xl">
        <motion.div
          className="bg-gray-800 rounded-lg h-80 flex items-center justify-center p-6"
          style={{ y: outgoingPanelSlideY }}
        >
          <p className="text-2xl text-cyan-300 font-semibold text-center">Host + Guest Collaboration Platform</p>
        </motion.div>
        <div>
          <h3 className="text-5xl font-bold mb-6 text-cyan-400">Outgoing</h3>
          <p className="text-xl text-white mb-6">
            A social event platform where guests can help make events happen alongside hosts.
            It smartly matches people to opportunities based on intent, availability, and event needs.
          </p>
          <div className="flex space-x-4 mb-6">
            <span className="px-3 py-1 bg-cyan-600 rounded-full text-sm">Social Platform</span>
            <span className="px-3 py-1 bg-indigo-600 rounded-full text-sm">Smart Matching</span>
            <span className="px-3 py-1 bg-blue-600 rounded-full text-sm">Event Tech</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const NotAResumeProject = ({ progressMotionValue }) => {
  const fallbackProgress = useMotionValue(0);
  const activeProgress = progressMotionValue ?? fallbackProgress;
  const animationConfig = useMemo(() => [
    {
      object: 'notAResumeImage',
      anim: [
        { type: 'slideY', initialValue: -320, finalValue: 0, startTiming: 70, duration: 10 },
      ]
    }
  ], []);
  const notAResumeImageSlideY = useTransform(activeProgress, (progress) => {
    const anims = calculateAnimations(animationConfig, progress);
    return anims.notAResumeImage?.slideY ?? 0;
  });

  return (
    <div className="w-screen h-screen  flex items-center justify-center relative flex-shrink-0">
      {/* Background div */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-red-900"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-blue-900 to-transparent "></div>

      {/* Content */}
      <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center max-w-6xl">
        <div>
          <h3 className="text-5xl font-bold mb-6 text-orange-400">Not A Resume</h3>
          <p className="text-xl text-white mb-6">
            This website!<br />
            An interactive portfolio experience that tells the story behind projects, process,
            and personality beyond a traditional resume format.
          </p>
          <div className="flex space-x-4 mb-6">
            <span className="px-3 py-1 bg-orange-600 rounded-full text-sm">React</span>
            <span className="px-3 py-1 bg-rose-600 rounded-full text-sm">Framer Motion</span>
            <span className="px-3 py-1 bg-red-600 rounded-full text-sm">Storytelling UI</span>
          </div>
        </div>
        <motion.div
          className="bg-gray-800 rounded-lg h-80 flex items-center justify-center p-6"
          style={{ y: notAResumeImageSlideY }}
        >
          <img src={portfolioImg} alt="portfolio App Screenshot" className="rounded-lg w-full h-full object-cover" />
        </motion.div>
      </div>
    </div>
  );
};

export const PortfolioProject = () => {
  return (
    <div className="w-screen h-screen  flex items-center justify-center relative flex-shrink-0">
      {/* Background div */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-red-900"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-blue-900 to-transparent "></div>

      {/* Content */}
      <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center max-w-6xl">
        <div className="bg-gray-800 rounded-lg h-80 flex items-center justify-center">
          <img src={portfolioImg} alt="Daywise App Screenshot" className="rounded-lg w-full h-full object-cover" />
        </div>
        <div>
          <h3 className="text-5xl font-bold mb-6 text-pink-400">Portfolio</h3>
          <p className="text-xl text-white mb-6">
            This website!
          </p>
          <div className="flex space-x-4 mb-6">
            <span className="px-3 py-1 bg-red-600 rounded-full text-sm">React</span>
            <span className="px-3 py-1 bg-yellow-600 rounded-full text-sm">Tailwind</span>
            <span className="px-3 py-1 bg-indigo-600 rounded-full text-sm">Framer Motion</span>
            <span className="px-3 py-1 bg-green-600 rounded-full text-sm">Github Pages</span>
          </div>
          <a href="https://github.com/aakarshika/aakarshika.github.io/tree/main" target="_blank" className="text-pink-400 hover:text-pink-300 font-semibold">
            View App Code →
          </a>
        </div>
      </div>
    </div>
  );
};
