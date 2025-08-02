import React, { useEffect, useRef, useState } from 'react';
import { CAMERA_CONFIG } from '../utils/cameraConfig';

const CountdownTimer = ({ 
  isActive, 
  onComplete, 
  duration = 2000, 
  countdownNumbers = [4, 3, 2, 1],
  intervalMs = 500,
  flashDuration = 500
}) => {
  const [currentNumber, setCurrentNumber] = useState(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const timerRef = useRef(null);
  const startTimeRef = useRef(0);

  useEffect(() => {
    if (!isActive) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setCurrentNumber(null);
      setIsFlashing(false);
      return;
    }

    startTimeRef.current = Date.now();
    let currentIndex = 0;

    const showNumber = () => {
      if (currentIndex < countdownNumbers.length) {
        setCurrentNumber(countdownNumbers[currentIndex]);
        currentIndex++;
        
        if (currentIndex < countdownNumbers.length) {
          timerRef.current = setTimeout(showNumber, intervalMs);
        } else {
          // Show flash effect
          setIsFlashing(true);
          timerRef.current = setTimeout(() => {
            setIsFlashing(false);
            onComplete?.();
          }, flashDuration);
        }
      }
    };

    showNumber();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isActive, duration, onComplete, countdownNumbers, intervalMs, flashDuration]);

  if (!isActive) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center z-20">
      {currentNumber && !isFlashing && (
        <div className="bg-black bg-opacity-75 rounded-full w-32 h-32 flex items-center justify-center">
          <div className="text-6xl font-bold text-white animate-pulse">
            {currentNumber}
          </div>
        </div>
      )}
      
      {isFlashing && (
        <div className="absolute inset-0 bg-white opacity-80 z-30 animate-pulse">
          <div className="flex items-center justify-center h-full">
            <div className="text-4xl font-bold text-gray-800">
              📸
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CountdownTimer; 