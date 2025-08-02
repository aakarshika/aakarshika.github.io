// Detection Pipeline Utilities
// Handles image capture, countdown timers, and effect management

import { CAMERA_CONFIG } from './cameraConfig';

/**
 * Captures and saves a composite image with all overlays and effects
 * @param {Object} elements - Required DOM elements for capture
 * @param {Object} elements.webcamRef - Webcam reference
 * @param {Object} elements.canvasRef - Main video canvas reference
 * @param {Object} elements.overlayRef - Hand skeleton overlay reference
 * @param {Object} elements.fireworksRef - Fireworks effect reference
 * @param {boolean} isFireworksActive - Whether fireworks are currently active
 * @param {string} message - Optional message to include in filename
 * @param {Function} setMessage - Function to update message state
 * @returns {Promise<void>}
 */
export const captureAndSaveImage = async ({
  webcamRef,
  canvasRef,
  overlayRef,
  fireworksRef,
  isFireworksActive,
  message,
  setMessage
}) => {
  console.log('📸 Starting image capture and save...');
  
  if (!webcamRef?.current || !canvasRef?.current || !overlayRef?.current) {
    console.error('❌ Required elements not found for capture');
    return;
  }

  try {
    // Create a composite canvas to combine all layers
    const compositeCanvas = document.createElement('canvas');
    const compositeCtx = compositeCanvas.getContext('2d');
    
    // Set canvas size to match video dimensions
    compositeCanvas.width = CAMERA_CONFIG.VIDEO_WIDTH;
    compositeCanvas.height = CAMERA_CONFIG.VIDEO_HEIGHT;
    
    // Step 1: Draw the filtered video frame
    if (canvasRef.current) {
      compositeCtx.drawImage(canvasRef.current, 0, 0);
    }
    
    // Step 2: Draw hand skeleton overlay
    const overlayCanvas = overlayRef.current.querySelector('canvas');
    if (overlayCanvas) {
      compositeCtx.drawImage(overlayCanvas, 0, 0);
    }
    
    // Step 3: Draw fireworks if active
    if (isFireworksActive && fireworksRef?.current) {
      const fireworksCanvas = fireworksRef.current.querySelector('canvas');
      if (fireworksCanvas) {
        compositeCtx.drawImage(fireworksCanvas, 0, 0);
      }
    }
    
    // Step 4: Convert to blob and save
    compositeCanvas.toBlob((blob) => {
      if (!blob) {
        console.error('❌ Failed to create image blob');
        return;
      }
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `capture_${timestamp}.jpg`;
      link.download = filename;
      
      // Add message to filename if provided
      if (message?.trim()) {
        const messageFilename = `capture_${message.replace(/\s+/g, '_')}_${timestamp}.jpg`;
        link.download = messageFilename;
      }
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
      
      console.log(`✅ Image saved as: ${link.download}`);
      
      // Show success message
      if (setMessage) {
        setMessage(prev => prev + ' - Image saved!');
      }
      
    }, CAMERA_CONFIG.IMAGE_FORMAT, CAMERA_CONFIG.IMAGE_QUALITY);
    
  } catch (error) {
    console.error('❌ Error capturing image:', error);
  }
};

/**
 * Starts a countdown timer based on configuration
 * @param {Object} effectConfig - Countdown effect configuration
 * @param {Function} setCountdown - Function to update countdown state
 * @param {Function} setEffectSequence - Function to update effect sequence state
 * @param {Function} captureAndSaveImage - Function to trigger image capture
 * @returns {Function} Cleanup function to clear timers
 */
export const startCountdownFromConfig = (
  effectConfig,
  setCountdown,
  setEffectSequence,
  captureAndSaveImage
) => {
  console.log('⏰ Starting countdown from config...');
  
  const { 
    countdownNumbers = [4, 3, 2, 1], 
    intervalMs = 500, 
    flashDuration = 500, 
    onComplete = 'CAPTURE' 
  } = effectConfig;
  
  let currentIndex = 0;
  setCountdown(countdownNumbers[currentIndex]);
  
  const countdownInterval = setInterval(() => {
    currentIndex++;
    
    if (currentIndex >= countdownNumbers.length) {
      clearInterval(countdownInterval);
      console.log('📸 Countdown complete!');
      
      // Show flash effect briefly
      setTimeout(() => {
        console.log('📸 Flash effect complete');
        setCountdown(null);
        
        // Handle onComplete action
        if (onComplete === 'CAPTURE') {
          console.log('📸 Triggering capture from countdown completion');
          // Add small delay to ensure flash is captured
          setTimeout(() => {
            captureAndSaveImage();
          }, 100);
        }
      }, flashDuration);
      
      return;
    }
    
    console.log(`⏰ Countdown: ${countdownNumbers[currentIndex]}`);
    setCountdown(countdownNumbers[currentIndex]);
  }, intervalMs);
  
  return () => clearInterval(countdownInterval);
};

/**
 * Manages effect sequence timers
 * @param {Object} gestureConfig - Gesture configuration with effects
 * @param {Object} effectTimers - Reference to store timers
 * @param {Function} setEffectSequence - Function to update effect sequence
 * @param {Function} setIsFireworksActive - Function to update fireworks state
 * @param {Function} setCurrentEffect - Function to update current effect
 * @param {Function} setGestureCooldown - Function to update cooldown state
 * @param {Function} startCountdownFromConfig - Function to start countdown
 * @param {Function} captureAndSaveImage - Function to capture image
 * @param {Function} closeCamera - Function to close camera
 * @param {Function} resetForNextGesture - Function to reset for next gesture
 * @returns {Object} Object with cleanup function
 */
export const scheduleEffectSequence = ({
  gestureConfig,
  effectTimers,
  setEffectSequence,
  setIsFireworksActive,
  setCurrentEffect,
  setGestureCooldown,
  startCountdownFromConfig,
  captureAndSaveImage,
  closeCamera,
  resetForNextGesture
}) => {
  console.log(`🚀 Starting effect sequence for ${gestureConfig.name}...`);
  
  // Clear any existing timers
  Object.values(effectTimers.current).forEach(timer => clearTimeout(timer));
  effectTimers.current = {};
  
  // Schedule all effects based on configuration
  gestureConfig.effects.forEach((effect, index) => {
    // Handle visual effects (FIREWORKS, HEART_BURST, STAR_BURST, SPARKLE_BURST, CONFETTI, SPARKLES)
    if (['FIREWORKS', 'HEART_BURST', 'STAR_BURST', 'SPARKLE_BURST', 'CONFETTI', 'SPARKLES'].includes(effect.type)) {
      // Start visual effect immediately
      console.log(`🎆 Starting ${effect.type} for ${effect.duration}ms`);
      setIsFireworksActive(true);
      setCurrentEffect(effect);
      
      // Schedule effect completion
      effectTimers.current[`effect_${index}`] = setTimeout(() => {
        console.log(`🎆 ${effect.type} complete`);
        setIsFireworksActive(false);
        setCurrentEffect(null);
      }, effect.duration);
    }
    
    // Schedule countdown timer
    if (effect.type === 'COUNTDOWN_TIMER') {
      effectTimers.current[`countdown_${index}`] = setTimeout(() => {
        console.log('⏰ Starting countdown timer');
        setEffectSequence('capture');
        startCountdownFromConfig();
      }, effect.delay);
    }
    
    // Schedule capture
    if (effect.type === 'CAPTURE') {
      effectTimers.current[`capture_${index}`] = setTimeout(() => {
        console.log('📸 Capture triggered');
        captureAndSaveImage();
      }, effect.delay);
    }
    
    // Schedule camera close
    if (effect.type === 'CLOSE_CAMERA') {
      effectTimers.current[`close_${index}`] = setTimeout(() => {
        console.log('🔒 Closing camera');
        setEffectSequence('closing');
        closeCamera();
      }, effect.delay);
    }
    
    // Schedule ready for next gesture
    if (effect.type === 'READY_FOR_NEXT_GESTURE') {
      effectTimers.current[`ready_${index}`] = setTimeout(() => {
        console.log('🔄 Ready for next gesture');
        resetForNextGesture();
      }, effect.delay);
    }
  });
  
  return {
    cleanup: () => {
      Object.values(effectTimers.current).forEach(timer => clearTimeout(timer));
      effectTimers.current = {};
    }
  };
};

/**
 * Resets the system for detecting the next gesture
 * @param {Function} setEffectSequence - Function to update effect sequence
 * @param {Function} setGestureCooldown - Function to update cooldown state
 * @param {Function} setCurrentEffect - Function to update current effect
 * @param {Function} setDetectedGesture - Function to update detected gesture
 * @param {Function} setGestureProgress - Function to update progress
 * @param {Array} gestureDetectionTimes - Reference to detection times array
 */
export const resetForNextGesture = ({
  setEffectSequence,
  setGestureCooldown,
  setCurrentEffect,
  setDetectedGesture,
  setGestureProgress,
  gestureDetectionTimes
}) => {
  setEffectSequence('idle');
  setGestureCooldown(false);
  setCurrentEffect(null);
  setDetectedGesture(null);
  setGestureProgress(0);
  gestureDetectionTimes.current = [];
  console.log('✅ System reset - ready to detect next gesture');
};

/**
 * Closes the camera and resets all states
 * @param {Function} setCameraOpen - Function to update camera state
 * @param {Function} setMessage - Function to update message state
 * @param {Function} setIsFireworksActive - Function to update fireworks state
 * @param {Function} setGestureCooldown - Function to update cooldown state
 * @param {Function} setConsecutiveDetections - Function to update detections
 * @param {Function} setGestureProgress - Function to update progress
 * @param {Function} setEffectSequence - Function to update effect sequence
 * @param {Function} setCurrentEffect - Function to update current effect
 * @param {Function} setDetectedGesture - Function to update detected gesture
 * @param {Function} setCountdown - Function to update countdown state
 * @param {Array} gestureDetectionTimes - Reference to detection times array
 * @param {Object} effectTimers - Reference to effect timers
 */
export const closeCameraAndReset = ({
  setCameraOpen,
  setMessage,
  setIsFireworksActive,
  setGestureCooldown,
  setConsecutiveDetections,
  setGestureProgress,
  setEffectSequence,
  setCurrentEffect,
  setDetectedGesture,
  setCountdown,
  gestureDetectionTimes,
  effectTimers
}) => {
  console.log('🔒 Closing camera and resetting states');
  
  // Clear all timers
  Object.values(effectTimers.current).forEach(timer => clearTimeout(timer));
  effectTimers.current = {};
  
  // Reset all states
  setCameraOpen(false);
  setMessage('');
  setIsFireworksActive(false);
  setGestureCooldown(false);
  setConsecutiveDetections(0);
  setGestureProgress(0);
  setEffectSequence('idle');
  setCurrentEffect(null);
  setDetectedGesture(null);
  setCountdown(null);
  gestureDetectionTimes.current = [];
}; 

/**
 * Processes detected gestures and manages sustained detection logic
 * @param {Object} params - Detection parameters
 * @param {Array} params.detectedGestures - Array of detected gestures
 * @param {Object} params.detectionConfig - Detection configuration
 * @param {string} params.effectSequence - Current effect sequence state
 * @param {boolean} params.gestureCooldown - Whether gesture is in cooldown
 * @param {Function} params.setGestureProgress - Function to update progress
 * @param {Function} params.setDetectedGesture - Function to update detected gesture
 * @param {Function} params.startEffectSequence - Function to start effect sequence
 * @param {Array} params.gestureDetectionTimes - Reference to detection times array
 * @param {number} params.lastDetectionTime - Reference to last detection time
 * @param {number} params.lastGestureTime - Reference to last gesture time
 * @returns {Object} Detection result with trigger info
 */
export const processGestureDetection = ({
  detectedGestures,
  detectionConfig,
  effectSequence,
  gestureCooldown,
  setGestureProgress,
  setDetectedGesture,
  startEffectSequence,
  gestureDetectionTimes,
  lastDetectionTime,
  lastGestureTime
}) => {
  // Don't process if already in effect sequence or cooldown
  if (effectSequence !== 'idle' || gestureCooldown) {
    return { shouldTrigger: false, detectedGesture: null };
  }

  const currentTime = Date.now();
  
  // Add initial delay to prevent immediate triggering
  if (currentTime - lastGestureTime.current < CAMERA_CONFIG.DETECTION_INITIAL_DELAY) {
    return { shouldTrigger: false, detectedGesture: null };
  }

  // Determine the correct key for gestures/expressions based on config
  const gesturesKey = detectionConfig.gestures ? 'gestures' : 
                     detectionConfig.expressions ? 'expressions' : 
                     detectionConfig.actions ? 'actions' : null;
  
  if (!gesturesKey || !detectionConfig[gesturesKey]) {
    console.warn('No valid gestures/expressions/actions found in detection config:', detectionConfig);
    return { shouldTrigger: false, detectedGesture: null };
  }

  // Check each configured gesture/expression
  for (const [gestureKey, gestureConfig] of Object.entries(detectionConfig[gesturesKey])) {
    const matchingGestures = detectedGestures.filter(g => g.name === gestureConfig.name);
    
    if (matchingGestures.length === 0) continue;
    
    const hasHighConfidenceGesture = matchingGestures.some(g => g.confidence >= gestureConfig.confidence);
    
    if (!hasHighConfidenceGesture) continue;
    
    // Track detection times for sustained detection
    if (!gestureCooldown) {
      // Only add if enough time has passed since last detection
      if (currentTime - lastDetectionTime.current >= CAMERA_CONFIG.DETECTION_MINIMUM_INTERVAL) {
        gestureDetectionTimes.current.push(currentTime);
        lastDetectionTime.current = currentTime;
        
        // Keep only detections from the last 1.5 seconds
        const cutoffTime = currentTime - 1500;
        gestureDetectionTimes.current = gestureDetectionTimes.current.filter(time => time > cutoffTime);
      }
    } else {
      // Reset detection times if in cooldown
      gestureDetectionTimes.current = [];
      continue;
    }
    
    // Check if we have sustained detection for required time
    const hasSustainedDetection = gestureDetectionTimes.current.length >= CAMERA_CONFIG.DETECTION_REQUIRED_DETECTIONS_PER_SECOND &&
      (gestureDetectionTimes.current[gestureDetectionTimes.current.length - 1] - gestureDetectionTimes.current[0]) >= CAMERA_CONFIG.DETECTION_REQUIRED_SUSTAINED_TIME;
    
    // Calculate progress percentage for visual feedback
    if (gestureDetectionTimes.current.length > 0) {
      const timeSpan = gestureDetectionTimes.current[gestureDetectionTimes.current.length - 1] - gestureDetectionTimes.current[0];
      const progress = Math.min((timeSpan / CAMERA_CONFIG.DETECTION_REQUIRED_SUSTAINED_TIME) * 100, 100);
      setGestureProgress(progress);
    } else {
      setGestureProgress(0);
    }
    
    // Return trigger info if sustained detection achieved
    if (hasSustainedDetection) {
      console.log(`🎆 ${gestureConfig.name} detected! Starting effect sequence...`);
      return { 
        shouldTrigger: true, 
        detectedGesture: gestureConfig,
        gestureKey 
      };
    }
  }
  
  // Reset progress if no gestures detected
  if (detectedGestures.length === 0) {
    setGestureProgress(0);
    gestureDetectionTimes.current = [];
  }
  
  return { shouldTrigger: false, detectedGesture: null };
};

/**
 * Processes detection for multiple model types (hands, face, pose)
 * @param {Object} params - Multi-model detection parameters
 * @param {Object} params.detectionResults - Results from all detection models
 * @param {Object} params.detectionConfigs - Configuration for all models
 * @param {Object} params.state - Current detection state
 * @param {Object} params.setters - State setter functions
 * @param {Function} params.startEffectSequence - Function to start effect sequence
 * @returns {Object} Detection result with trigger info
 */
export const processMultiModelDetection = ({
  detectionResults,
  detectionConfigs,
  state,
  setters,
  startEffectSequence
}) => {
  const { effectSequence, gestureCooldown } = state;
  const { setGestureProgress, setDetectedGesture } = setters;
  
  // Process each enabled detection model
  for (const [modelType, modelConfig] of Object.entries(detectionConfigs)) {
    if (!modelConfig.enabled) continue;
    
    const modelResults = detectionResults[modelType] || [];
    
    // Determine the correct key for gestures/expressions based on model type
    const gesturesKey = modelType === 'HANDS' ? 'gestures' : 
                       modelType === 'FACE' ? 'expressions' : 
                       'actions';
    
    if (!modelConfig[gesturesKey]) continue;
    
    const result = processGestureDetection({
      detectedGestures: modelResults,
      detectionConfig: modelConfig,
      effectSequence,
      gestureCooldown,
      setGestureProgress,
      setDetectedGesture,
      startEffectSequence,
      gestureDetectionTimes: state.gestureDetectionTimes,
      lastDetectionTime: state.lastDetectionTime,
      lastGestureTime: state.lastGestureTime
    });
    
    if (result.shouldTrigger) {
      return {
        ...result,
        modelType,
        modelConfig
      };
    }
  }
  
  return { shouldTrigger: false, detectedGesture: null, modelType: null };
}; 

/**
 * Gets available gestures from detection configuration for display
 * @param {Object} detectionConfig - Detection configuration
 * @param {string} modelType - Type of detection model (HANDS, FACE, POSE)
 * @returns {Array} Array of gesture names formatted for display
 */
export const getAvailableGestures = (detectionConfig, modelType = 'HANDS') => {
  if (!detectionConfig || !detectionConfig.enabled) {
    return [];
  }
  
  // Determine the correct key based on model type
  const gesturesKey = modelType === 'HANDS' ? 'gestures' : 
                     modelType === 'FACE' ? 'expressions' : 
                     'actions';
  
  const gestures = detectionConfig[gesturesKey];
  
  if (!gestures) {
    return [];
  }
  
  return Object.values(gestures)
    .map(g => g.name.replace('_', ' '))
    .join(', ');
};

/**
 * Gets detection status message based on current state
 * @param {Object} params - Status parameters
 * @param {string} params.effectSequence - Current effect sequence
 * @param {Object} params.currentEffect - Current active effect
 * @param {boolean} params.gestureCooldown - Whether in cooldown
 * @param {Array} params.detectedGestures - Currently detected gestures
 * @param {number} params.gestureProgress - Gesture detection progress
 * @param {Object} params.detectionConfig - Detection configuration
 * @returns {string} Status message
 */
export const getDetectionStatusMessage = ({
  effectSequence,
  currentEffect,
  gestureCooldown,
  detectedGestures,
  gestureProgress,
  detectionConfig
}) => {
  if (effectSequence === 'effects') {
    return `✨ ${currentEffect?.type || 'Effects'} active!`;
  } else if (effectSequence === 'capture') {
    return '📸 Capturing photo...';
  } else if (effectSequence === 'closing') {
    return '🔒 Closing camera...';
  } else if (gestureCooldown) {
    return '⏳ Cooldown';
  } else if (detectedGestures.length > 0) {
    const gestureNames = detectedGestures.map(g => g.name).join(', ');
    return `${gestureNames}: ${Math.round(gestureProgress)}% complete`;
  }
  
  // Show available gestures
  const availableGestures = getAvailableGestures(detectionConfig);
  return `Show ${availableGestures} for 1 second to trigger effects`;
}; 