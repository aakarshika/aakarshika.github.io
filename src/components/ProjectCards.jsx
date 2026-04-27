import React from 'react';
import { motion, useMotionValue } from 'framer-motion';
import daywiseImg1 from '../assets/daywise1.png';
import daywiseImg2 from '../assets/daywise2.png';
import daywiseImg3 from '../assets/daywise3.png';
import portfolioImg from '../assets/portfolio_img.png';
import { useAnimationValue } from '../hooks/useAnimationValue';
export { TwirlyProject } from './TwirlyProject';

const DAYWISE_1_SLIDE_ANIM = [
  { initialValue: 220, startTiming: 28 },
  { initialValue: 0, finalValue: -320, startTiming: 44, duration: 10 },
];
const DAYWISE_2_SLIDE_ANIM = [
  { initialValue: 220, startTiming: 32 },
  { initialValue: 0, finalValue: -320, startTiming: 44, duration: 10 },
];
const DAYWISE_3_SLIDE_ANIM = [
  { initialValue: 220, startTiming: 36 },
  { initialValue: 0, finalValue: -320, startTiming: 44, duration: 10 },
];
const DAYWISE_1_FADE_ANIM = [
  { initialValue: 0, finalValue: 1, startTiming: 28 },
  { initialValue: 1, startTiming: 44, duration: 10 },
];
const DAYWISE_1_SCALE_ANIM = [{ initialValue: 0.8, finalValue: 1, startTiming: 28 }];
const WRITERVERSE_PANEL_SLIDE_ANIM = [{ initialValue: -320, startTiming: 40, duration: 10 }];
const OUTGOING_PANEL_SLIDE_ANIM = [{ initialValue: -320, startTiming: 55, duration: 10 }];
const NOT_A_RESUME_IMAGE_SLIDE_ANIM = [{ initialValue: -320, startTiming: 70, duration: 10 }];
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

export const DaywiseProject = ({ progressMotionValue }) => {
  const fallbackProgress = useMotionValue(0);
  const activeProgress = progressMotionValue ?? fallbackProgress;
  const daywise1SlideX = useAnimationValue(activeProgress, DAYWISE_1_SLIDE_ANIM, 'slideX', 0);
  const daywise2SlideX = useAnimationValue(activeProgress, DAYWISE_2_SLIDE_ANIM, 'slideX', 0);
  const daywise3SlideX = useAnimationValue(activeProgress, DAYWISE_3_SLIDE_ANIM, 'slideX', 0);
  const daywise1Fade = useAnimationValue(activeProgress, DAYWISE_1_FADE_ANIM, 'fade', 0);
  const daywise1Scale = useAnimationValue(activeProgress, DAYWISE_1_SCALE_ANIM, 'scale', 1);


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
  const writerversePanelSlideY = useAnimationValue(activeProgress, WRITERVERSE_PANEL_SLIDE_ANIM, 'slideY', 0);

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
  const outgoingPanelSlideY = useAnimationValue(activeProgress, OUTGOING_PANEL_SLIDE_ANIM, 'slideY', 0);

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
  const notAResumeImageSlideY = useAnimationValue(activeProgress, NOT_A_RESUME_IMAGE_SLIDE_ANIM, 'slideY', 0);

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
