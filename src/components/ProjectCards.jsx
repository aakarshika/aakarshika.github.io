import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, useMotionValueEvent } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import daywiseImg1 from '../assets/daywise1.png';
import daywiseImg2 from '../assets/daywise2.png';
import daywiseImg3 from '../assets/daywise3.png';
import portfolioImg from '../assets/portfolio_img.png';
import { useAnimationValue } from '../hooks/useAnimationValue';
export { TwirlyProject } from './TwirlyProject';
export { OutgoingProject } from './OutgoingProject';
export { ProcureWinProject } from './ProcureWinProject';

const WRITERVERSE_SENTENCE_1 = 'She pushed open the door and-';
const WRITERVERSE_SENTENCE_2 = ' a thousand fireflies poured out, painting her path with starlight. She quickly stepped through the portal, leaving behind the world she knew.';

const Typewriter = ({ progress, text, startTiming, duration, className = '' }) => {
  const charIndex = useTransform(
    progress,
    [startTiming, startTiming + duration],
    [0, text.length],
    { clamp: true }
  );
  const [shown, setShown] = useState('');
  useMotionValueEvent(charIndex, 'change', (latest) => {
    const i = Math.max(0, Math.min(text.length, Math.floor(latest)));
    setShown((prev) => {
      const next = text.slice(0, i);
      return prev === next ? prev : next;
    });
  });
  return <span className={className}>{shown}</span>;
};

// Timings rescaled by T_new = T_old * 5/6 + 16.67 to fit the 7-card layout
// (ProcureWin inserted between Twirly and Daywise).
// Daywise center moved from 40 → 50, Writerverse 60 → 66.67, NotAResume 100 → 100.
const DAYWISE_1_SLIDE_ANIM = [
  { initialValue: 220, startTiming: 40 },
  { initialValue: 0, finalValue: -320, startTiming: 50, duration: 8.33 },
];
const DAYWISE_2_SLIDE_ANIM = [
  { initialValue: 220, startTiming: 41.67 },
  { initialValue: 0, finalValue: -320, startTiming: 50, duration: 8.33 },
];
const DAYWISE_3_SLIDE_ANIM = [
  { initialValue: 220, startTiming: 43.33 },
  { initialValue: 0, finalValue: -320, startTiming: 50, duration: 8.33 },
];
const DAYWISE_1_FADE_ANIM = [
  { initialValue: 0, finalValue: 1, startTiming: 40 },
  { initialValue: 1, startTiming: 53.33, duration: 8.33 },
];
const DAYWISE_1_SCALE_ANIM = [{ initialValue: 0.8, finalValue: 1, startTiming: 40 }];
const WRITERVERSE_TITLE_SLIDE_ANIM = [
  { initialValue: -100, finalValue: 0, startTiming: 55.83, duration: 7.5 },
];
const WRITERVERSE_DESCRIPTION_FADE_ANIM = [{ initialValue: 0, finalValue: 1, startTiming: 56.67, duration: 3.33 }];
const WRITERVERSE_DESCRIPTION_SLIDE_ANIM = [{ initialValue: -40, startTiming: 59.17, duration: 3.33 }];
const WRITERVERSE_REST_FADE_ANIM = [{ initialValue: 0, finalValue: 1, startTiming: 60.83, duration: 3.33 }];
const WRITERVERSE_REST_SLIDE_ANIM = [{ initialValue: -28, startTiming: 61.67, duration: 3.33 }];

const WRITERVERSE_NOTEBOOK_SLIDE_ANIM = [{ initialValue: 320, startTiming: 52.5, duration: 2.5 }];
const WRITERVERSE_NOTEBOOK_SCALE_ANIM = [{ initialValue: 0.85, finalValue: 1, startTiming: 52.5, duration: 2.5 }];
const WRITERVERSE_NOTEBOOK_FADE_ANIM = [{ initialValue: 0, finalValue: 1, startTiming: 52.5, duration: 1.67 }];

const buildBranchAnim = (start) => [
  { initialValue: 0, finalValue: 1, startTiming: start, duration: 2 },
  { initialValue: 1, finalValue: 0, startTiming: 69.17, duration: 1.83 },
];
const WRITERVERSE_BRANCH_1_ANIM = buildBranchAnim(60.83);
const WRITERVERSE_BRANCH_2_ANIM = buildBranchAnim(61.5);
const WRITERVERSE_BRANCH_3_ANIM = buildBranchAnim(62.17);
const WRITERVERSE_BRANCH_4_ANIM = buildBranchAnim(62.83);

const buildBoxScaleAnim = (start) => [
  { initialValue: 0, finalValue: 1.5, startTiming: start, duration: 0.67 },
  { initialValue: 1.5, finalValue: 1.3, startTiming: start + 0.67, duration: 0.67 },
  { initialValue: 1.3, finalValue: 0, startTiming: 69.33, duration: 1.83 },
];
const buildBoxFadeAnim = (start) => [
  { initialValue: 0, finalValue: 1, startTiming: start, duration: 0.83 },
  { initialValue: 1, finalValue: 0, startTiming: 69.5, duration: 1.5 },
];
const WRITERVERSE_BOX_1_SCALE_ANIM = buildBoxScaleAnim(61.67);
const WRITERVERSE_BOX_1_FADE_ANIM = buildBoxFadeAnim(61.67);
const WRITERVERSE_BOX_2_SCALE_ANIM = buildBoxScaleAnim(62.5);
const WRITERVERSE_BOX_2_FADE_ANIM = buildBoxFadeAnim(62.5);
const WRITERVERSE_BOX_3_SCALE_ANIM = buildBoxScaleAnim(63.33);
const WRITERVERSE_BOX_3_FADE_ANIM = buildBoxFadeAnim(63.33);
const WRITERVERSE_BOX_4_SCALE_ANIM = buildBoxScaleAnim(64.17);
const WRITERVERSE_BOX_4_FADE_ANIM = buildBoxFadeAnim(64.17);

const WRITERVERSE_STAR_ORBIT_ANIM = [{ initialValue: -120, finalValue: 240, startTiming: 68.33, duration: 2.83 }];
const WRITERVERSE_STAR_FADE_ANIM = [
  { initialValue: 0, finalValue: 1, startTiming: 68.33, duration: 0.5 },
  { initialValue: 1, finalValue: 0, startTiming: 70.92, duration: 0.58 },
];
const WRITERVERSE_STAR_ROTATE_ANIM = [{ initialValue: 0, finalValue: 720, startTiming: 68.33, duration: 2.83 }];
const WRITERVERSE_STAR_SCALE_ANIM = [
  { initialValue: 0.65, finalValue: 1.25, startTiming: 68.33, duration: 0.83 },
  { initialValue: 1.25, finalValue: 0.82, startTiming: 70, duration: 1 },
];
const WRITERVERSE_FAIRY_FADE_ANIM = [
  { initialValue: 0, finalValue: 1, startTiming: 67.5, duration: 0.83 },
  { initialValue: 1, finalValue: 0, startTiming: 75, duration: 0.42 }
];
const WRITERVERSE_FAIRY_WINK_ANIM = [
  { initialValue: 1, finalValue: 0.05, startTiming: 66.75, duration: 0.33 },
  { initialValue: 0.2, finalValue: 1, startTiming: 67.92, duration: 0.42 },
  { initialValue: 1, finalValue: 0.05, startTiming: 69.25, duration: 0.33 },
  { initialValue: 0.2, finalValue: 1, startTiming: 70.42, duration: 0.42 },
];
const NOT_A_RESUME_IMAGE_SLIDE_ANIM = [{ initialValue: -320, startTiming: 87.5, duration: 8.33 }];
export const ProjectTitle = () => {
  return (
    <div className="w-screen min-h-screen md:h-screen px-4 sm:px-6 flex bg-gradient-to-b from-gray-900 to-purple-900 items-center justify-center flex-shrink-0">
      <div className="max-w-4xl text-center">
        <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold pb-4 sm:pb-8 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
          Projects
        </h2>
        <p className="text-lg sm:text-xl md:text-2xl text-white mb-4">that I spend late nights on</p>
        <div className="w-32 h-1 bg-gradient-to-r from-yellow-400 to-orange-400 mx-auto"></div>
      </div>
    </div>
  );
};

export const DaywiseProject = ({ progressMotionValue, isMobile = false }) => {
  const fallbackProgress = useMotionValue(0);
  // On mobile we don't have horizontal scroll, so freeze progress at a value
  // where every Daywise element has slid in but not yet started sliding back out
  // (slide-ins finish ~48, slide-outs start at 50 in the 7-card layout).
  const mobileStaticProgress = useMotionValue(49);
  const activeProgress = isMobile
    ? mobileStaticProgress
    : (progressMotionValue ?? fallbackProgress);

  const daywise1SlideX = useAnimationValue(activeProgress, DAYWISE_1_SLIDE_ANIM, 'slideX', 0);
  const daywise2SlideX = useAnimationValue(activeProgress, DAYWISE_2_SLIDE_ANIM, 'slideX', 0);
  const daywise3SlideX = useAnimationValue(activeProgress, DAYWISE_3_SLIDE_ANIM, 'slideX', 0);
  const daywise1Fade = useAnimationValue(activeProgress, DAYWISE_1_FADE_ANIM, 'fade', 0);
  const daywise1Scale = useAnimationValue(activeProgress, DAYWISE_1_SCALE_ANIM, 'scale', 1);


  return (
    <div className="md:w-screen sm:w-full h-screen md:h-screen px-4 sm:px-6 py-10 md:py-0 flex items-center justify-center relative flex-shrink-0">
      {/* Background div */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900 to-[#3c0086] "></div>

      {/* Content */}
      <div className="relative z-10 grid grid-cols-2 gap-8 gap-12 items-center max-w-6xl">

        <motion.div className="w-screen sm:w-full md:w-full " style={{ x: daywise1SlideX }}>
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-pink-400">Daywise</h3>
          <p className="text-base sm:text-lg md:text-xl text-white mb-6">
            An ADHD-friendly To-Do mobile app using LLMs for predictive, personalized tasking.
            Built with shared business logic for Android/iOS using Kotlin Multiplatform.
          </p>
          <div className="flex flex-wrap gap-3 mb-6">
            <span className="px-3 py-1 bg-red-600 rounded-full text-sm">Kotlin Multiplatform</span>
            <span className="px-3 py-1 bg-yellow-600 rounded-full text-sm">Hugging Face</span>
            <span className="px-3 py-1 bg-indigo-600 rounded-full text-sm">GPT</span>
            <span className="px-3 py-1 bg-green-600 rounded-full text-sm">ML</span>
          </div>
          <a href="https://github.com/aakarshika/daywisehub" target="_blank" rel="noreferrer" className="text-pink-400 hover:text-pink-300 font-semibold">
            View App Code →
          </a>
          <br/>
          <a href="https://github.com/aakarshika/brainboard" target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 font-semibold">
            Brainboard <span className="text-blue-400 text-xs"> Another App for smart planning and scheduling</span> →
          </a>
        </motion.div>

        <div className="rounded-lg flex flex-row gap-2 w-screen sm:w-full md:w-full">
          <motion.div className="overflow-hidden rounded-lg w-full h-full" style={{ x: daywise1SlideX, opacity: daywise1Fade, scale: daywise1Scale }}>
            <img src={daywiseImg1} alt="Daywise App Screenshot" className="bg-pink-100 w-full h-full object-cover object-top rounded-lg" />
          </motion.div>
          <motion.div className="overflow-hidden rounded-lg w-full h-full" style={{ x: daywise2SlideX, opacity: daywise1Fade, scale: daywise1Scale }}>
            <img src={daywiseImg2} alt="Daywise App Screenshot" className="bg-blue-100 w-full h-full object-cover object-top rounded-lg" />
          </motion.div>
          <motion.div className="overflow-hidden rounded-lg w-full h-full" style={{ x: daywise3SlideX, opacity: daywise1Fade, scale: daywise1Scale }}>
            <img src={daywiseImg3} alt="Daywise App Screenshot" className="bg-green-100 w-full h-full object-cover object-top rounded-lg" />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export const WriterverseProject = ({ progressMotionValue }) => {
  const fallbackProgress = useMotionValue(0);
  const activeProgress = progressMotionValue ?? fallbackProgress;
  const writerverseTitleSlideX = useAnimationValue(activeProgress, WRITERVERSE_TITLE_SLIDE_ANIM, 'slideX', 0);
  const writerverseDescriptionFade = useAnimationValue(activeProgress, WRITERVERSE_DESCRIPTION_FADE_ANIM, 'fade', 0);
  const writerverseDescriptionSlideX = useAnimationValue(activeProgress, WRITERVERSE_DESCRIPTION_SLIDE_ANIM, 'slideX', 0);
  const writerverseRestFade = useAnimationValue(activeProgress, WRITERVERSE_REST_FADE_ANIM, 'fade', 0);
  const writerverseRestSlideX = useAnimationValue(activeProgress, WRITERVERSE_REST_SLIDE_ANIM, 'slideX', 0);

  const notebookSlideY = useAnimationValue(activeProgress, WRITERVERSE_NOTEBOOK_SLIDE_ANIM, 'slideY', 0);
  const notebookScale = useAnimationValue(activeProgress, WRITERVERSE_NOTEBOOK_SCALE_ANIM, 'scale', 1);
  const notebookFade = useAnimationValue(activeProgress, WRITERVERSE_NOTEBOOK_FADE_ANIM, 'fade', 0);

  const branch1 = useAnimationValue(activeProgress, WRITERVERSE_BRANCH_1_ANIM, 'fade', 0);
  const branch2 = useAnimationValue(activeProgress, WRITERVERSE_BRANCH_2_ANIM, 'fade', 0);
  const branch3 = useAnimationValue(activeProgress, WRITERVERSE_BRANCH_3_ANIM, 'fade', 0);
  const branch4 = useAnimationValue(activeProgress, WRITERVERSE_BRANCH_4_ANIM, 'fade', 0);

  const box1Scale = useAnimationValue(activeProgress, WRITERVERSE_BOX_1_SCALE_ANIM, 'scale', 0);
  const box1Fade = useAnimationValue(activeProgress, WRITERVERSE_BOX_1_FADE_ANIM, 'fade', 0);
  const box2Scale = useAnimationValue(activeProgress, WRITERVERSE_BOX_2_SCALE_ANIM, 'scale', 0);
  const box2Fade = useAnimationValue(activeProgress, WRITERVERSE_BOX_2_FADE_ANIM, 'fade', 0);
  const box3Scale = useAnimationValue(activeProgress, WRITERVERSE_BOX_3_SCALE_ANIM, 'scale', 0);
  const box3Fade = useAnimationValue(activeProgress, WRITERVERSE_BOX_3_FADE_ANIM, 'fade', 0);
  const box4Scale = useAnimationValue(activeProgress, WRITERVERSE_BOX_4_SCALE_ANIM, 'scale', 0);
  const box4Fade = useAnimationValue(activeProgress, WRITERVERSE_BOX_4_FADE_ANIM, 'fade', 0);

  const starOrbitRotate = useAnimationValue(activeProgress, WRITERVERSE_STAR_ORBIT_ANIM, 'rotate', -120);
  const starFade = useAnimationValue(activeProgress, WRITERVERSE_STAR_FADE_ANIM, 'fade', 0);
  const starRotate = useAnimationValue(activeProgress, WRITERVERSE_STAR_ROTATE_ANIM, 'rotate', 0);
  const starScale = useAnimationValue(activeProgress, WRITERVERSE_STAR_SCALE_ANIM, 'scale', 0.6);
  const fairyFade = useAnimationValue(activeProgress, WRITERVERSE_FAIRY_FADE_ANIM, 'fade', 0);
  const fairyWinkScaleY = useAnimationValue(activeProgress, WRITERVERSE_FAIRY_WINK_ANIM, 'scale', 1);

  return (
    <div className="md:w-screen sm:w-full min-h-screen md:h-screen px-4 sm:px-6 py-10 md:py-0 flex items-center justify-center relative flex-shrink-0">
      {/* Background div */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#3c0086] to-blue-900"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#3c0086] to-transparent "></div>

      {/* Content */}
      <div className="relative z-10  grid grid-cols-2 gap-8 gap-12 items-center max-w-6xl">

        {/* Right column: copy */}
        <div className="relative w-screen sm:w-full md:w-full">
          <motion.h3 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-fuchsia-400" style={{ x: writerverseTitleSlideX }}>
            Writerverse
          </motion.h3>
          <motion.p className="text-base sm:text-lg md:text-xl text-white mb-6" style={{ opacity: writerverseDescriptionFade, x: writerverseDescriptionSlideX }}>
          An AI co-writer that actually reads your story first. Retrieves your characters, world rules, and plot beats before writing a single word.
           <span className="text-fuchsia-400">RAG</span> for your own novel.
          </motion.p>
          <motion.div className="flex flex-wrap gap-3 mb-6" style={{ opacity: writerverseRestFade, x: writerverseRestSlideX }}>
            <span className="px-3 py-1 bg-fuchsia-600 rounded-full text-sm">LangGraph</span>
            <span className="px-3 py-1 bg-indigo-600 rounded-full text-sm">LLMs</span>
            <span className="px-3 py-1 bg-violet-600 rounded-full text-sm">Agentic Workflows</span>
          </motion.div>
          <motion.a
            href="https://github.com/aakarshika"
            target="_blank"
            rel="noreferrer"
            className="text-fuchsia-300 hover:text-fuchsia-200 font-semibold"
            style={{ opacity: writerverseRestFade, x: writerverseRestSlideX }}
          >
            Explore Project Notes →
          </motion.a>
        </div>
        {/* Notebook scene */}
        <div className="relative h-80 sm:h-[28rem] flex items-center justify-center w-screen sm:w-full md:w-full">
          {/* Branches (SVG paths drawn from notebook center to each box) */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 400 400"
            preserveAspectRatio="none"
          >
            <motion.path
              d="M 200 170 Q 130 110 60 60"
              stroke="rgb(232 121 249 / 0.7)"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              style={{ pathLength: branch1 }}
            />
            <motion.path
              d="M 200 170 Q 280 110 350 60"
              stroke="rgb(167 139 250 / 0.7)"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              style={{ pathLength: branch2 }}
            />
            <motion.path
              d="M 200 230 Q 130 300 60 350"
              stroke="rgb(244 114 182 / 0.7)"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              style={{ pathLength: branch3 }}
            />
            <motion.path
              d="M 200 230 Q 280 300 350 350"
              stroke="rgb(129 140 248 / 0.7)"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              style={{ pathLength: branch4 }}
            />
          </svg>

          {/* Notebook page */}
          <motion.div
            className="relative w-[18rem] sm:w-[22rem] md:w-[26rem] h-80 sm:h-[22rem] md:h-[28rem] rounded-md bg-amber-50 shadow-2xl shadow-purple-950/60 z-10 overflow-hidden"
            style={{ y: notebookSlideY, scale: notebookScale, opacity: notebookFade }}
          >
            {/* spiral binding */}
            <div className="absolute left-0 top-0 bottom-0 w-3 bg-amber-900/70"></div>
            <div className="absolute left-3 top-0 bottom-0 w-px bg-rose-400/60"></div>
            {/* page lines */}
            <div
              className="absolute inset-0 opacity-50"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(to bottom, transparent 0, transparent 23px, rgb(165 180 252 / 0.45) 24px)',
              }}
            ></div>
            {/* page text */}
            <div className="relative px-6 pl-7 pt-8 text-slate-700 font-mono text-sm leading-6 tracking-tight">
              <Typewriter
                progress={activeProgress}
                text={WRITERVERSE_SENTENCE_1}
                startTiming={55}
                duration={5.83}
              />
              <Typewriter
                progress={activeProgress}
                text={WRITERVERSE_SENTENCE_2}
                startTiming={71.67}
                duration={2.5}
                className="text-slate-600"
              />
            </div>
          </motion.div>

          <motion.div
            className="absolute top-0 left-0 w-full h-full z-11 overflow-hidden"
          >
            {/* Messy concept boxes around the notebook */}
            <motion.div
              className="absolute top-32 left-20 min-w-40 px-5 py-4 rounded-md text-sm font-semibold uppercase tracking-wide bg-fuchsia-500/25 border border-fuchsia-300/60 text-fuchsia-600 shadow-lg shadow-fuchsia-900/40 -rotate-6 z-20"
              style={{ scale: box1Scale, opacity: box1Fade }}
            >
              Ideas
            </motion.div>
            <motion.div
              className="absolute top-24 right-20 min-w-44 px-5 py-4 rounded-md text-sm font-semibold uppercase tracking-wide bg-violet-500/25 border border-violet-300/60 text-violet-600 shadow-lg shadow-violet-900/40 rotate-3 z-20"
              style={{ scale: box2Scale, opacity: box2Fade }}
            >
              World Building
            </motion.div>
            <motion.div
              className="absolute bottom-24 left-20 min-w-36 px-5 py-4 rounded-md text-sm font-semibold uppercase tracking-wide bg-pink-500/25 border border-pink-300/60 text-pink-600 shadow-lg shadow-pink-900/40 -rotate-3 z-20"
              style={{ scale: box3Scale, opacity: box3Fade }}
            >
              Outline
            </motion.div>
            <motion.div
              className="absolute bottom-28 right-20 min-w-40 px-5 py-4 rounded-md text-sm font-semibold uppercase tracking-wide bg-indigo-500/25 border border-indigo-300/60 text-indigo-600 shadow-lg shadow-indigo-900/40 rotate-6 z-20"
              style={{ scale: box4Scale, opacity: box4Fade }}
            >
              Characters
            </motion.div>


          </motion.div>



          {/* Magical orbiting star */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none"
            style={{ opacity: starFade }}
          >
            <motion.div style={{ rotate: starOrbitRotate }}>
              <motion.div style={{ x: 166, rotate: starRotate, scale: starScale }}>
                <div className="absolute inset-0 -m-6 rounded-full bg-fuchsia-300/30 blur-xl"></div>
                <Sparkles className="relative w-10 h-10 text-fuchsia-200 drop-shadow-[0_0_12px_rgba(244,114,182,0.8)]" />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* AI fairy companion that stays and hovers */}
          <motion.div
            className="absolute right-1/2 top-1/2 z-30"
            style={{ opacity: fairyFade }}
            animate={{ y: [0, -19, 0], x: [0, 25, 0] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="relative rounded-full bg-indigo-400/25 bg-transparent border-none border-indigo-200/50 p-3 shadow-none shadow-indigo-900/50">
              <svg viewBox="0 0 100 100" className="w-24 h-24" fill="none">
                {/* antenna */}
                <line x1="50" y1="8" x2="50" y2="22" stroke="rgb(165 180 252)" strokeWidth="3" strokeLinecap="round" />
                <circle cx="50" cy="6" r="3.5" fill="rgb(244 114 182)" />
                {/* head */}
                <rect x="18" y="24" width="64" height="54" rx="14" fill="rgb(99 102 241 / 0.4)" stroke="rgb(165 180 252)" strokeWidth="3" />
                {/* side bolts */}
                <rect x="11" y="44" width="6" height="14" rx="2" fill="rgb(165 180 252)" />
                <rect x="83" y="44" width="6" height="14" rx="2" fill="rgb(165 180 252)" />
                {/* left eye (always open) */}
                <motion.g style={{ x: 36, y: 46, scaleY: fairyWinkScaleY }}>
                  <rect x="0" y="0" width="9" height="12" rx="3" fill="rgb(224 231 255)" />
                  <rect x="1" y="0" width="8" height="12" rx="2" fill="rgb(67 56 202)" />
                </motion.g>
                {/* right eye (winks at 62.5) */}
                <motion.g style={{ x: 57, y: 46, scaleY: fairyWinkScaleY }}>
                  <rect x="0" y="0" width="9" height="12" rx="3" fill="rgb(224 231 255)" />
                  <rect x="1" y="0" width="8" height="12" rx="2" fill="rgb(67 56 202)" />
                </motion.g>
                {/* smile */}
                {/* <path d="M 38 64 Q 50 70 62 64" stroke="rgb(165 180 252)" strokeWidth="3" strokeLinecap="round" fill="none" /> */}
              </svg>
              <div className="absolute -inset-2 rounded-full bg-indigo-300/25 blur-md"></div>
            </div>
          </motion.div>
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
    <div className="w-screen min-h-screen md:h-screen px-4 sm:px-6 py-10 md:py-0 flex items-center justify-center relative flex-shrink-0">
      {/* Background div */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-red-900"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-blue-900 to-transparent "></div>

      {/* Content */}
      <div className="relative z-10 grid md:grid-cols-2 gap-8 md:gap-12 items-center max-w-6xl">
        <div>
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-orange-400">Not A Resume</h3>
          <p className="text-base sm:text-lg md:text-xl text-white mb-6">
            This website!<br />
            An interactive portfolio experience that tells the story behind projects, process,
            and personality beyond a traditional resume format.
          </p>
          <div className="flex flex-wrap gap-3 mb-6">
            <span className="px-3 py-1 bg-orange-600 rounded-full text-sm">React</span>
            <span className="px-3 py-1 bg-rose-600 rounded-full text-sm">Framer Motion</span>
            <span className="px-3 py-1 bg-red-600 rounded-full text-sm">Storytelling UI</span>
          </div>
        </div>
        <motion.div
          className="bg-gray-800 rounded-lg h-56 sm:h-72 md:h-80 flex items-center justify-center p-4 sm:p-6"
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
    <div className="w-screen min-h-screen md:h-screen px-4 sm:px-6 py-10 md:py-0 flex items-center justify-center relative flex-shrink-0">
      {/* Background div */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-red-900"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-blue-900 to-transparent "></div>

      {/* Content */}
      <div className="relative z-10 grid md:grid-cols-2 gap-8 md:gap-12 items-center max-w-6xl">
        <div className="bg-gray-800 rounded-lg h-56 sm:h-72 md:h-80 flex items-center justify-center">
          <img src={portfolioImg} alt="Daywise App Screenshot" className="rounded-lg w-full h-full object-cover" />
        </div>
        <div>
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-pink-400">Portfolio</h3>
          <p className="text-base sm:text-lg md:text-xl text-white mb-6">
            This website!
          </p>
          <div className="flex flex-wrap gap-3 mb-6">
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
