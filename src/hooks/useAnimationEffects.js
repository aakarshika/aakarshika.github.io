import { useState, useEffect, useRef } from 'react';
import { calculateAnimation } from '../utils/portfolioUtils';

export const useAnimationEffects = (visibleSections) => {
  const [viewHeight, setViewHeight] = useState(0);
  const photoLottieRef = useRef();
  const clockLottieRef = useRef();

  // Animation sequence for the photo
  const photoAnimationSequence = {
    photo: {
      start: 0, // Start animation at 20% of about-me progress
      duration: 20, // Animation duration
      initialScale: 0.9,
      scaleIncrement: 0.1
    }
  };

  useEffect(() => {
    const handleResize = () => setViewHeight(window.innerHeight);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const aboutMeProgress = visibleSections.find(section => section.id === 'about-me')?.cumulativeProgress || 0;
  const photoAnim = calculateAnimation('photo', aboutMeProgress, photoAnimationSequence, viewHeight);

  // Animate clock: fade in at 10%, fade out at 80%, move left to right
  const clockX = Math.min(1, Math.max(0, (60 - 10) / 70)) * (window.innerWidth - 200); // 200px margin
  const clockY = Math.min(1, Math.max(0, (aboutMeProgress - 10) / 70)) * (window.innerHeight - 200) - 100; // 200px margin

  // Lottie animation control
  useEffect(() => {
    if (photoLottieRef.current && photoLottieRef.current.getDuration) {
      const totalFrames = photoLottieRef.current.getDuration(true);
      const frame = Math.round((aboutMeProgress / 100) * (totalFrames - 1));
      if (!isNaN(frame)) {
        photoLottieRef.current.goToAndStop(frame, true);
      }
    }
    if (clockLottieRef.current && clockLottieRef.current.getDuration) {
      const totalFrames = clockLottieRef.current.getDuration(true);
      const frame = Math.round((aboutMeProgress / 100) * (totalFrames - 1));
      if (!isNaN(frame)) {
        clockLottieRef.current.goToAndStop(frame, true);
      }
    }
  }, [aboutMeProgress]);

  return {
    viewHeight,
    aboutMeProgress,
    photoAnim,
    clockX,
    clockY,
    photoLottieRef,
    clockLottieRef
  };
}; 