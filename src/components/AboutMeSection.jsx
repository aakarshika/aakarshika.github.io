import React, { useMemo, useState, useEffect } from 'react';
import { motion, useTransform } from 'framer-motion';
import girlMain from '../assets/girl_main.png';
import winkingGirl from '../assets/winking_girl.png';
import hand from '../assets/hand.png';
import laptop from '../assets/laptop.png';
import laptopBase from '../assets/lapbase.png';
import table from '../assets/table.png';
import { calculateAnimations } from '../utils/progressAnimationUtils';
import { useSectionScrollProgress } from '../hooks/useSectionScrollProgress';

const AboutMeSection = React.memo(() => {
  console.log("AboutMeSection");
  const { sectionRef, progress: progressMotionValue } = useSectionScrollProgress();

  // Only track visibility for conditional rendering (minimal state)
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const unsubscribe = progressMotionValue.on('change', (progress) => {
      setIsVisible(progress > 0);
    });
    return unsubscribe;
  }, [progressMotionValue]);

  // Animation configuration using fade and slide animations - memoized to prevent recreation
  const animationConfig = useMemo(() => [
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
        { type: 'fade', initialValue: 0, startTiming: 28, duration: 25 },
        { type: 'slideX', initialValue: -100, finalValue: 0, startTiming: 28, duration: 25 },
        // { type: 'fade', initialValue: 1, finalValue: 0, startTiming: 60, duration: 25 },
      ]
    },
    {
      object: 'skill2',
      anim: [
        { type: 'fade', initialValue: 0, startTiming: 34, duration: 25 },
        { type: 'slideX', initialValue: 100, finalValue: 0, startTiming: 30, duration: 25 },
        // { type: 'fade', initialValue: 1, finalValue: 0, startTiming: 70, duration: 25 },
      ]
    },
    {
      object: 'skill3',
      anim: [
        { type: 'fade', initialValue: 0, startTiming: 40, duration: 25 },
        { type: 'slideX', initialValue: -100, finalValue: 0, startTiming: 32, duration: 25 },
        // { type: 'fade', initialValue: 1, finalValue: 0, startTiming: 80, duration: 25 },
      ]
    },
    {
      object: 'skill4',
      anim: [
        { type: 'fade', initialValue: 0, startTiming: 46, duration: 25 },
        { type: 'slideX', initialValue: 100, finalValue: 0, startTiming: 34, duration: 25 },
        // { type: 'fade', initialValue: 1, finalValue: 0, startTiming: 90, duration: 25 },
      ]
    },
    {
      object: 'skill5',
      anim: [
        { type: 'fade', initialValue: 0, startTiming: 52, duration: 25 },
        { type: 'slideX', initialValue: -100, finalValue: 0, startTiming: 40, duration: 25 },
      ]
    },
    {
      object: 'skill6',
      anim: [
        { type: 'fade', initialValue: 0, startTiming: 58, duration: 25 },
        { type: 'slideX', initialValue: 100, finalValue: 0, startTiming: 46, duration: 25 },
      ]
    },
    {
      object: 'aboutImage',
      anim: [
        { type: 'fade', initialValue: 0, finalValue: 1, startTiming: 20, duration: 25 },
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
  ], []);

  // Create motion values for all animations - no component rerenders!
  // Each useTransform creates a motion value that updates independently
  const titleFade = useTransform(progressMotionValue, (progress) => {
    const anims = calculateAnimations(animationConfig, progress);
    return anims.title?.fade ?? 0;
  });
  const titleSlideY = useTransform(progressMotionValue, (progress) => {
    const anims = calculateAnimations(animationConfig, progress);
    return anims.title?.slideY ?? 0;
  });
  const firstTextFade = useTransform(progressMotionValue, (progress) => {
    const anims = calculateAnimations(animationConfig, progress);
    return anims.firstText?.fade ?? 0;
  });
  const firstTextSlideY = useTransform(progressMotionValue, (progress) => {
    const anims = calculateAnimations(animationConfig, progress);
    return anims.firstText?.slideY ?? 0;
  });
  const secondTextFade = useTransform(progressMotionValue, (progress) => {
    const anims = calculateAnimations(animationConfig, progress);
    return anims.secondText?.fade ?? 0;
  });
  const skillsFade = useTransform(progressMotionValue, (progress) => {
    const anims = calculateAnimations(animationConfig, progress);
    return anims.skills?.fade ?? 0;
  });
  const skill1Fade = useTransform(progressMotionValue, (progress) => {
    const anims = calculateAnimations(animationConfig, progress);
    return anims.skill1?.fade ?? 0;
  });
  const skill1SlideX = useTransform(progressMotionValue, (progress) => {
    const anims = calculateAnimations(animationConfig, progress);
    return anims.skill1?.slideX ?? 0;
  });
  const skill2Fade = useTransform(progressMotionValue, (progress) => {
    const anims = calculateAnimations(animationConfig, progress);
    return anims.skill2?.fade ?? 0;
  });
  const skill2SlideX = useTransform(progressMotionValue, (progress) => {
    const anims = calculateAnimations(animationConfig, progress);
    return anims.skill2?.slideX ?? 0;
  });
  const skill3Fade = useTransform(progressMotionValue, (progress) => {
    const anims = calculateAnimations(animationConfig, progress);
    return anims.skill3?.fade ?? 0;
  });
  const skill3SlideX = useTransform(progressMotionValue, (progress) => {
    const anims = calculateAnimations(animationConfig, progress);
    return anims.skill3?.slideX ?? 0;
  });
  const skill4Fade = useTransform(progressMotionValue, (progress) => {
    const anims = calculateAnimations(animationConfig, progress);
    return anims.skill4?.fade ?? 0;
  });
  const skill4SlideX = useTransform(progressMotionValue, (progress) => {
    const anims = calculateAnimations(animationConfig, progress);
    return anims.skill4?.slideX ?? 0;
  });
  const skill5Fade = useTransform(progressMotionValue, (progress) => {
    const anims = calculateAnimations(animationConfig, progress);
    return anims.skill5?.fade ?? 0;
  });
  const skill5SlideX = useTransform(progressMotionValue, (progress) => {
    const anims = calculateAnimations(animationConfig, progress);
    return anims.skill5?.slideX ?? 0;
  });
  const skill6Fade = useTransform(progressMotionValue, (progress) => {
    const anims = calculateAnimations(animationConfig, progress);
    return anims.skill6?.fade ?? 0;
  });
  const skill6SlideX = useTransform(progressMotionValue, (progress) => {
    const anims = calculateAnimations(animationConfig, progress);
    return anims.skill6?.slideX ?? 0;
  });
  const aboutImageFade = useTransform(progressMotionValue, (progress) => {
    const anims = calculateAnimations(animationConfig, progress);
    return anims.aboutImage?.fade ?? 0;
  });
  const aboutImageSlideY = useTransform(progressMotionValue, (progress) => {
    const anims = calculateAnimations(animationConfig, progress);
    return anims.aboutImage?.slideY ?? 0;
  });
  const laptopImageFade = useTransform(progressMotionValue, (progress) => {
    const anims = calculateAnimations(animationConfig, progress);
    return anims.laptopImage?.fade ?? 0;
  });
  const laptopImageSlideX = useTransform(progressMotionValue, (progress) => {
    const anims = calculateAnimations(animationConfig, progress);
    return anims.laptopImage?.slideX ?? 0;
  });
  const tableImageFade = useTransform(progressMotionValue, (progress) => {
    const anims = calculateAnimations(animationConfig, progress);
    return anims.tableImage?.fade ?? 0;
  });
  const tableImageSlideX = useTransform(progressMotionValue, (progress) => {
    const anims = calculateAnimations(animationConfig, progress);
    return anims.tableImage?.slideX ?? 0;
  });

  // Background opacity motion values
  const backgroundOpacity = useTransform(progressMotionValue, (progress) =>
    progress === 0 ? 0 : progress / 100
  );

  // Conditional image opacity (winking girl vs regular)
  const winkingGirlOpacity = useTransform(progressMotionValue, (progress) => {
    if (progress > 55 && progress < 70) {
      const anims = calculateAnimations(animationConfig, progress);
      return anims.aboutImage?.fade ?? 0;
    }
    return 0;
  });

  const regularImageOpacity = useTransform(progressMotionValue, (progress) => {
    if (progress < 55 || progress > 70) {
      const anims = calculateAnimations(animationConfig, progress);
      return anims.aboutImage?.fade ?? 0;
    }
    return 0;
  });

  const regularImageY = useTransform(progressMotionValue, (progress) => {
    if (progress < 55 || progress > 70) {
      const anims = calculateAnimations(animationConfig, progress);
      return anims.aboutImage?.slideY ?? 0;
    }
    return 0;
  });

  return (
    <div ref={sectionRef} className="relative min-h-screen bg-gradient-to-b from-black to-gray-900 flex items-center justify-center py-14 sm:py-20 overflow-hidden">

      {/* Floating Background Elements */}
      <motion.div style={{ opacity: backgroundOpacity }} className="absolute bottom-10 left-4 sm:bottom-20 sm:left-20 w-24 h-24 sm:w-40 sm:h-40 bg-purple-500 rounded-full opacity-40 blur-2xl pointer-events-none"></motion.div>
      <motion.div style={{ opacity: backgroundOpacity }} className="absolute top-0 right-4 sm:right-10 w-20 h-20 sm:w-32 sm:h-32 bg-blue-500 rounded-full opacity-40 blur-2xl pointer-events-none"></motion.div>

      {isVisible && (<div className="relative z-10 about-section container mx-auto px-4 sm:px-6 max-w-6xl w-full">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start mb-12 sm:mb-16">
          <div>
            <motion.h2
              style={{
                opacity: titleFade,
                y: titleSlideY
              }}
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-start mb-8 sm:mb-16 bg-gradient-to-r from-blue-400 to-gray-400 bg-clip-text text-transparent"
            >
              About Me
            </motion.h2>
            <motion.div
              style={{
                opacity: firstTextFade,
                y: firstTextSlideY
              }}
              className="text-base sm:text-lg md:text-xl text-white/95 leading-relaxed mb-5"
            >
              I build <span className="font-semibold text-white">full-stack systems</span> that combine
              <span className="font-semibold text-white"> real-time applications</span>,
              <span className="font-semibold text-white"> scalable backend architecture</span>, and
              <span className="font-semibold text-white"> AI-driven workflows</span>.
            </motion.div>
            <motion.div
              style={{
                opacity: secondTextFade
              }}
              className="text-base sm:text-lg text-white/90 leading-relaxed space-y-3"
            >
              <p>
                My recent work focuses on <span className="font-semibold text-white">AI-integrated products</span> - designing
                <span className="font-semibold text-white"> agent-based systems</span>,
                <span className="font-semibold text-white"> hybrid retrieval pipelines (RAG)</span>, and
                <span className="font-semibold text-white"> data-driven applications</span> that operate under
                <span className="font-semibold text-white"> real-world constraints</span>.
              </p>
              <p>
                Across projects and production systems, I&apos;ve worked
                <span className="font-semibold text-white"> end-to-end</span>: <span className="font-semibold text-white">frontend architecture</span>, backend services, cloud infrastructure, and
                system design. I care about building software that is not just functional, but
                <span className="font-semibold text-white"> reliable</span>,
                <span className="font-semibold text-white"> maintainable</span>, and
                <span className="font-semibold text-white"> adaptable</span>.
              </p>
            </motion.div>
          </div>
          <div>
            <div className="relative w-full mt-0 sm:mt-40 h-96 sm:h-96 mx-auto max-w-sm sm:max-w-none">
              <motion.div style={{ opacity: backgroundOpacity }}
                className="absolute w-64 h-64 sm:w-96 sm:h-96 bg-pink-500 rounded-full opacity-35 blur-2xl"></motion.div>

              <motion.img
                src={laptopBase}
                alt="Laptop base Image"
                className="rounded-lg w-full h-full object-cover absolute inset-0"
                style={{
                  opacity: laptopImageFade,
                  x: laptopImageSlideX
                }}
              />
              <motion.img
                src={winkingGirl}
                alt="Winking Girl Image"
                className="rounded-lg w-full h-full object-cover absolute inset-0"
                style={{
                  opacity: winkingGirlOpacity,
                  y: aboutImageSlideY
                }}
              />
              <motion.div
                style={{
                  opacity: regularImageOpacity,
                  y: regularImageY
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
                  opacity: laptopImageFade,
                  x: laptopImageSlideX
                }}
              />
              <motion.img
                src={table}
                alt="Table Image"
                className="rounded-lg w-full h-full object-cover absolute inset-0 hidden sm:block"
                style={{
                  opacity: tableImageFade,
                  x: tableImageSlideX,
                  scaleY: 5,
                  y: -740
                }}
              />
            </div>
          </div>
        </div>
        <motion.div
          style={{
            opacity: skillsFade
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8"
        >
          <motion.div
            style={{
              opacity: skill1Fade,
              x: skill1SlideX
            }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold mb-2">Frontend</h3>
            <p className="text-white">React 18, TypeScript, Angular, Kotlin/iOS/Android</p>
          </motion.div>
          <motion.div
            style={{
              opacity: skill2Fade,
              x: skill2SlideX
            }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold mb-2">Systems</h3>
            <p className="text-white">Real-time Systems, Node.js, Python (Django, FastAPI), Java, WebSockets, REST APIs, Microservices</p>
          </motion.div>
          <motion.div
            style={{
              opacity: skill3Fade,
              x: skill3SlideX
            }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-red-500 rounded-full mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold mb-2">AI / ML</h3>
            <p className="text-white">LangChain, LangGraph, RAG Pipelines, pgvector, Hugging Face, PyTorch, NLP</p>
          </motion.div>
          <motion.div
            style={{
              opacity: skill4Fade,
              x: skill4SlideX
            }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-cyan-500 rounded-full mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold mb-2">Database</h3>
            <p className="text-white">PostgreSQL, MongoDB, MySQL, PLpgSQL, Query Optimization</p>
          </motion.div>
          <motion.div
            style={{
              opacity: skill5Fade,
              x: skill5SlideX
            }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold mb-2">Cloud &amp; DevOps</h3>
            <p className="text-white">AWS (Lambda, EC2, S3, Kinesis), Docker, Kubernetes, CI/CD</p>
          </motion.div>
        </motion.div>
      </div>)}




    </div>
  );
});

AboutMeSection.displayName = 'AboutMeSection';

export default AboutMeSection; 