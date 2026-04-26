import { useRef } from 'react';
import { useScroll, useTransform } from 'framer-motion';

/**
 * Hook to calculate scroll progress (0-100) for a section
 * Uses Framer Motion's optimized useScroll with requestAnimationFrame
 * 
 * @returns {Object} { sectionRef, progress }
 * - sectionRef: Ref to attach to the section's root element
 * - progress: MotionValue that represents scroll progress from 0-100
 */
export const useSectionScrollProgress = () => {
  const sectionRef = useRef(null);

  // Track scroll progress as section enters/leaves viewport
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"] // Progress from when section top hits viewport bottom to when section bottom hits viewport top
  });

  // Transform scrollYProgress (0-1) to progress (0-100)
  const progress = useTransform(scrollYProgress, [0, 1], [0, 100]);

  return { sectionRef, progress };
};
