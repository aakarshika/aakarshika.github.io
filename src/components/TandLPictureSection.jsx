import React, { useState, useRef, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera } from 'lucide-react';
import AllPicturesTwinkling from './AllPicturesTwinkling';
import MultiModelHandPoseOverlay from './MultiModelHandPoseOverlay';
import Fireworks from './Fireworks';
import { useMultiModelGestureDetection } from '../hooks/useMultiModelGestureDetection';
import { 
  CAMERA_CONFIG, 
  DETECTION_CONFIG, 
  getGestureConfig, 
  getEffectConfig 
} from '../utils/cameraConfig';
import {
  captureAndSaveImage,
  startCountdownFromConfig,
  scheduleEffectSequence,
  resetForNextGesture,
  closeCameraAndReset,
  processGestureDetection,
  getDetectionStatusMessage
} from '../utils/detectionPipelineUtils';

const TandLPictureSection = ({ 
  progress, 
  pictures, 
  onCapture, 
  currentFingerprint, 
  onDelete
}) => {
  const [cameraOpen, setCameraOpen] = useState(false);
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const fireworksRef = useRef(null);
  const captureAreaRef = useRef(null);
  const [filter, setFilter] = useState('sepia');
  const [message, setMessage] = useState('');
  const seriouslyInstance = useRef(null);
  const videoSource = useRef(null);
  const targetNode = useRef(null);
  const ownImage = currentFingerprint && pictures.some(pic => pic?.fingerprint === currentFingerprint);
  
  // Hand detection hook
  const {
    isInitialized,
    isDetecting,
    startDetection,
    stopDetection,
    getAllDetectedGestures,
    getAllHands,
    getModelStatus,
  } = useMultiModelGestureDetection();

  // Pipeline state management
  const [isFireworksActive, setIsFireworksActive] = useState(false);
  const [gestureCooldown, setGestureCooldown] = useState(false);
  const [consecutiveDetections, setConsecutiveDetections] = useState(0);
  const lastGestureTime = useRef(0);
  const gestureDetectionTimes = useRef([]);
  const lastDetectionTime = useRef(0);
  const [gestureProgress, setGestureProgress] = useState(0);
  
  // Effect sequence state
  const [effectSequence, setEffectSequence] = useState('idle'); // 'idle' | 'effects' | 'capture' | 'closing'
  const [currentEffect, setCurrentEffect] = useState(null);
  const [detectedGesture, setDetectedGesture] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const effectTimers = useRef({});

  // Setup Seriously.js for video filters
  useEffect(() => {
    if (!cameraOpen || !window.Seriously || !webcamRef.current || !canvasRef.current) return;

    if (seriouslyInstance.current) {
      seriouslyInstance.current.destroy();
      seriouslyInstance.current = null;
    }

    const seriously = new window.Seriously();
    seriouslyInstance.current = seriously;
    const video = webcamRef.current.video;
    const src = seriously.source(video);
    const target = seriously.target(canvasRef.current);
    videoSource.current = src;
    targetNode.current = target;

    // Apply sepia filter
    const effect = seriously.effect('sepia');
    effect.source = src;
    target.source = effect;
    seriously.go();

    return () => {
      seriously.destroy();
      seriouslyInstance.current = null;
    };
  }, [cameraOpen]);

  // Effect sequence management
  const startEffectSequence = useCallback((gestureConfig) => {
    const effectConfig = getEffectConfig('COUNTDOWN_TIMER');
    
    scheduleEffectSequence({
      gestureConfig,
      effectTimers,
      setEffectSequence,
      setIsFireworksActive,
      setCurrentEffect,
      setGestureCooldown,
      startCountdownFromConfig: () => startCountdownFromConfig(
        effectConfig,
        setCountdown,
        setEffectSequence,
        () => captureAndSaveImage({
          webcamRef,
          canvasRef,
          overlayRef,
          fireworksRef,
          isFireworksActive,
          message,
          setMessage
        })
      ),
      captureAndSaveImage: () => captureAndSaveImage({
        webcamRef,
        canvasRef,
        overlayRef,
        fireworksRef,
        isFireworksActive,
        message,
        setMessage
      }),
      closeCamera: () => closeCameraAndReset({
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
      }),
      resetForNextGesture: () => resetForNextGesture({
        setEffectSequence,
        setGestureCooldown,
        setCurrentEffect,
        setDetectedGesture,
        setGestureProgress,
        gestureDetectionTimes
      })
    });
  }, [isFireworksActive, message, setMessage]);

  // Step 1: Open camera → All detections start
  useEffect(() => {
    if (cameraOpen && isInitialized && webcamRef.current?.video) {
      console.log('🎥 Camera opened - starting all detections');
      startDetection(webcamRef.current.video);
    } else if (!cameraOpen) {
      console.log('🎥 Camera closed - stopping all detections');
      stopDetection();
    }
  }, [cameraOpen, isInitialized, startDetection, stopDetection]);

  // Step 3: Gesture detected for specified time → Effects triggered
  useEffect(() => {
    if (!cameraOpen) return;
    
    const detectedGestures = getAllDetectedGestures();
    const handsConfig = DETECTION_CONFIG.HANDS;
    
    // Process gesture detection using utility function
    const result = processGestureDetection({
      detectedGestures,
      detectionConfig: handsConfig,
      effectSequence,
      gestureCooldown,
      setGestureProgress,
      setDetectedGesture,
      startEffectSequence,
      gestureDetectionTimes,
      lastDetectionTime,
      lastGestureTime
    });
    
    // Trigger effect sequence if gesture detected
    if (result.shouldTrigger && result.detectedGesture) {
      setDetectedGesture(result.detectedGesture);
      startEffectSequence(result.detectedGesture);
    }
  }, [getAllDetectedGestures, effectSequence, cameraOpen, gestureCooldown, startEffectSequence]);

  // Handle fireworks completion
  const handleFireworksComplete = useCallback(() => {
    console.log('🎆 Fireworks complete!');
    setIsFireworksActive(false);
    setCurrentEffect(null);
    // Don't reset effect sequence here - let the timers handle the flow
  }, []);

  // Close camera function
  const closeCamera = useCallback(() => {
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
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(effectTimers.current).forEach(timer => clearTimeout(timer));
    };
  }, []);

  // Get current effect duration
  const getCurrentEffectDuration = () => {
    if (!currentEffect) return CAMERA_CONFIG.DETECTION_REQUIRED_SUSTAINED_TIME;
    return currentEffect.duration || 6000;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(effectTimers.current).forEach(timer => clearTimeout(timer));
    };
  }, []);

  return (
    <div className="tstart relative h-full w-full items-center justify-center mb-60">
      <div className="absolute top-0 left-0 w-full h-full p-12 pt-60">
        <AllPicturesTwinkling 
          pictures={pictures} 
          progress={progress} 
          currentFingerprint={currentFingerprint}
          onDelete={onDelete}
        />
      </div>
      
      {cameraOpen && !ownImage && (
        <div className="p-12 pt-60 h-full flex items-center justify-center gap-8 relative z-10">
          {/* Capture Area */}
          <div className="flex-1 flex flex-col items-center justify-center" ref={captureAreaRef}>
            <div className="relative">
              {/* Hidden webcam */}
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="absolute opacity-0 pointer-events-none"
                style={{ zIndex: 0 }}
                videoConstraints={{ 
                  width: CAMERA_CONFIG.VIDEO_WIDTH, 
                  height: CAMERA_CONFIG.VIDEO_HEIGHT 
                }}
              />
              
              {/* Main video canvas */}
              <canvas
                ref={canvasRef}
                width={CAMERA_CONFIG.VIDEO_WIDTH}
                height={CAMERA_CONFIG.VIDEO_HEIGHT}
                className="rounded-lg w-full h-full object-cover"
                style={{ zIndex: 1 }}
              />
              
              {/* Step 2: Show detected thing (hand skeleton) */}
              <div ref={overlayRef}>
                <MultiModelHandPoseOverlay
                  modelStatus={getModelStatus()}
                  videoWidth={CAMERA_CONFIG.VIDEO_WIDTH}
                  videoHeight={CAMERA_CONFIG.VIDEO_HEIGHT}
                />
              </div>
              
              {/* Gesture Progress Indicator */}
              {gestureProgress > 0 && effectSequence === 'idle' && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-black bg-opacity-50 rounded-full p-2">
                    <div className="w-32 h-3 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-200 ease-out ${
                          gestureProgress >= 100 
                            ? 'bg-gradient-to-r from-green-400 to-green-500 animate-pulse' 
                            : 'bg-gradient-to-r from-yellow-400 to-orange-500'
                        }`}
                        style={{ width: `${gestureProgress}%` }}
                      />
                    </div>
                    <div className={`text-xs text-center mt-1 ${
                      gestureProgress >= 100 ? 'text-green-300 font-semibold' : 'text-white'
                    }`}>
                      {gestureProgress >= 100 ? '🎆 Ready!' : `${Math.round(gestureProgress)}% - Hold gesture`}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Dynamic Effects */}
              <div ref={fireworksRef}>
                {currentEffect?.type === 'FIREWORKS' && (
                  <Fireworks
                    isActive={isFireworksActive}
                    onComplete={handleFireworksComplete}
                    duration={getCurrentEffectDuration()}
                  />
                )}
                {/* Add other effect components here as needed */}
              </div>
              
              {/* Countdown Timer */}
              {countdown && countdown > 0 && (
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <div className="bg-black bg-opacity-75 rounded-full w-32 h-32 flex items-center justify-center">
                    <div className="text-6xl font-bold text-white animate-pulse">
                      {countdown}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Capture Flash */}
              {countdown === 0 && (
                <div className="absolute inset-0 bg-white opacity-80 z-30 animate-pulse">
                  <div className="flex items-center justify-center h-full">
                    <div className="text-4xl font-bold text-gray-800">
                      📸
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Simple UI Controls */}
          <div className="w-80 flex flex-col gap-6">
            {/* Status */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-sm text-white space-y-2">
                {isInitialized ? (
                  <div className="text-green-400">✓ Hand tracking active</div>
                ) : (
                  <div className="text-yellow-400">Loading hand detection...</div>
                )}
                
                {getAllHands().length > 0 && (
                  <div className="text-green-300">✋ Hand detected</div>
                )}
                
                {(() => {
                  const detectedGestures = getAllDetectedGestures();
                  
                  // Handle countdown display
                  if (effectSequence === 'capture') {
                    if (countdown && countdown > 0) {
                      return <div className="text-blue-300">📸 Capturing in {countdown}...</div>;
                    } else if (countdown === 0) {
                      return <div className="text-green-300">📸 Capturing photo!</div>;
                    }
                    return <div className="text-blue-300">📸 Preparing to capture...</div>;
                  }
                  
                  // Use utility function for other status messages
                  return (
                    <div className="text-gray-300">
                      {getDetectionStatusMessage({
                        effectSequence,
                        currentEffect,
                        gestureCooldown,
                        detectedGestures,
                        gestureProgress,
                        detectionConfig: DETECTION_CONFIG.HANDS
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Message Input */}
            <div className="bg-gray-800 rounded-lg p-4">
              <label className="text-white text-sm font-medium mb-2 block">Message (optional):</label>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, 100))}
                placeholder="Add a message..."
                maxLength={100}
                className="w-full rounded px-3 py-2 bg-gray-700 text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="text-xs text-gray-400 text-right mt-1">
                {message.length}/100
              </div>
            </div>

            {/* Close Button (only show when not in effect sequence) */}
            {effectSequence === 'idle' && (
              <button
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition cursor-pointer text-sm font-medium"
                onClick={() => closeCameraAndReset({
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
                })}
              >
                Close Camera
              </button>
            )}
          </div>
        </div>
      )}
      
      {!cameraOpen && !ownImage && (
        <div className="p-12 pt-60 h-full flex items-center justify-center gap-4 z-2" onClick={() => {
          // Reset all states when opening camera
          setIsFireworksActive(false);
          setGestureCooldown(false);
          setConsecutiveDetections(0);
          setMessage('');
          setGestureProgress(0);
          setEffectSequence('idle');
          setCurrentEffect(null);
          setDetectedGesture(null);
          setCountdown(null);
          gestureDetectionTimes.current = [];
          lastGestureTime.current = Date.now();
          setCameraOpen(true);
        }}>
          <div className='items-center justify-center bg-gradient-to-b from-black to-gray-900 rounded-lg p-20 gap-4 z-10'>
            <Camera className="w-10 h-10" />
          </div>
        </div>
      )}
    </div>
  );
};

export default TandLPictureSection; 