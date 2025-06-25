import { useState, useRef, useEffect } from 'react';
import { setupScrollEventListeners } from '../utils/scrollEventUtils';
import { 
  checkStoppersInView, 
  checkVisibleSection, 
  isContactFullyVisible 
} from '../utils/portfolioUtils';

export const useAnimationFunctions = (scrollY, stoppersConfig) => {
  const currentNodeProgress = useMemo(() => {
    return calculateProgress(scrollY, stoppersConfig);
  }, [scrollY, stoppersConfig]);



  return {
    currentNodeProgress
  };
}; 