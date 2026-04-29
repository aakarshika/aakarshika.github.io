import { useTransform } from 'framer-motion';
import { calculateObjectAnimations } from '../utils/progressAnimationUtils';

export const useAnimationValue = (progressValue, animConfig, animationType, fallbackValue = 0, valueMapper) =>
  useTransform(progressValue, (progress) => {
    const normalizedConfig = animConfig.map((step) => ({
      ...step,
      type: step.type ?? animationType,
      finalValue: step.finalValue ?? 0,
      duration: step.duration ?? 6,
    }));

    const values = calculateObjectAnimations({ object: 'current', anim: normalizedConfig }, progress);
    const value = values?.[animationType] ?? fallbackValue;
    return valueMapper ? valueMapper(value, values) : value;
  });
