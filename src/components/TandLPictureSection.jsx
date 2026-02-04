import React, { useState, useRef, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera } from 'lucide-react';
import AllPicturesTwinkling from './AllPicturesTwinkling';
import MultiModelHandPoseOverlay from './MultiModelHandPoseOverlay';
import FaceMeshOverlay from './FaceMeshOverlay';
import PoseOverlay from './PoseOverlay';
import BackgroundRemovalOverlay from './BackgroundRemovalOverlay';
import Fireworks from './Fireworks';
import HeartBurst from './HeartBurst';
import StarBurst from './StarBurst';
import SparkleBurst from './SparkleBurst';
import CountdownTimer from './CountdownTimer';
import Confetti from './Confetti';
import Sparkles from './Sparkles';
import { useMultiModelGestureDetection } from '../hooks/useMultiModelGestureDetection';
import { useMultiModelDetection } from '../hooks/useMultiModelDetection';
import { useAdditionalModels } from '../hooks/useAdditionalModels';
import { 
  CAMERA_CONFIG, 
  DETECTION_CONFIG, 
  getGestureConfig, 
  getEffectConfig,
  analyzePose3DPosition
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
  
  // Multi-model detection hook (hands + face + selfie segmentation)
  const {
    isInitialized,
    isDetecting,
    startDetection,
    stopDetection,
    getAllDetectedGestures,
    getAllHands,
    getFaceMeshResults,
    getDetectedFaces,
    getModelStatus,
  } = useMultiModelGestureDetection();

  // Multi-model detection hook with selfie segmentation
  const {
    isInitialized: isMultiModelInitialized,
    isDetecting: isMultiModelDetecting,
    startDetection: startMultiModelDetection,
    stopDetection: stopMultiModelDetection,
    getSelfieSegmentationResults,
    isSelfieSegmentationAvailable,
    isPoseAvailable,
  } = useMultiModelDetection();

  // Additional models hook (pose + face mesh)
  const {
    isInitialized: isAdditionalModelsInitialized,
    processFrame: processAdditionalModelsFrame,
    getPoseResults,
  } = useAdditionalModels();

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
    console.log('🎬 Starting effect sequence for:', gestureConfig.name, gestureConfig.effects);
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
    if (cameraOpen && webcamRef.current?.video) {
      // Start gesture detection
      if (isInitialized) {
        startDetection(webcamRef.current.video);
      }
      
      // Start multi-model detection with selfie segmentation
      if (isMultiModelInitialized) {
        startMultiModelDetection(webcamRef.current.video);
      }
      
      // Start additional models processing (pose detection)
      if (isAdditionalModelsInitialized) {
        const processFrame = () => {
          if (webcamRef.current?.video && cameraOpen) {
            processAdditionalModelsFrame(webcamRef.current.video);
            requestAnimationFrame(processFrame);
          }
        };
        processFrame();
      }
    } else if (!cameraOpen) {
      // Stop all detections
      if (isInitialized) {
        stopDetection();
      }
      if (isMultiModelInitialized) {
        stopMultiModelDetection();
      }
    }
  }, [cameraOpen, isInitialized, isMultiModelInitialized, isAdditionalModelsInitialized, startDetection, stopDetection, startMultiModelDetection, stopMultiModelDetection, processAdditionalModelsFrame]);

  // Step 3: Gesture/Expression detected for specified time → Effects triggered
  useEffect(() => {
    if (!cameraOpen) return;
    
    const detectedGestures = getAllDetectedGestures();
    const handsConfig = DETECTION_CONFIG.HANDS;
    const faceConfig = DETECTION_CONFIG.FACE;
    
    // Safety check: ensure configs are properly defined
    if (!handsConfig || !faceConfig) {
      console.warn('Detection configs not properly initialized');
      return;
    }
    
    // Safety check: ensure configs have required properties
    if (!handsConfig.gestures || !faceConfig.expressions) {
      console.warn('Detection configs missing required gestures/expressions properties');
      return;
    }
    
    // Debug: Log detected gestures
    if (detectedGestures.length > 0) {
      console.log('Detected gestures:', detectedGestures);
    }
    
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
    
    // If no hand gesture detected, check for face expressions
    if (!result.shouldTrigger && faceConfig.enabled) {
      const faceExpressions = detectedGestures.filter(g => 
        ['smile', 'wink', 'surprised'].includes(g.name)
      );
      
      if (faceExpressions.length > 0) {
        console.log('Face expressions detected:', faceExpressions);
        const faceResult = processGestureDetection({
          detectedGestures: faceExpressions,
          detectionConfig: faceConfig,
          effectSequence,
          gestureCooldown,
          setGestureProgress,
          setDetectedGesture,
          startEffectSequence,
          gestureDetectionTimes,
          lastDetectionTime,
          lastGestureTime
        });
        
        if (faceResult.shouldTrigger && faceResult.detectedGesture) {
          console.log('Face effect triggered:', faceResult.detectedGesture);
          setDetectedGesture(faceResult.detectedGesture);
          startEffectSequence(faceResult.detectedGesture);
        }
      }
    } else if (result.shouldTrigger && result.detectedGesture) {
      console.log('Hand effect triggered:', result.detectedGesture);
      setDetectedGesture(result.detectedGesture);
      startEffectSequence(result.detectedGesture);
    }
  }, [getAllDetectedGestures, effectSequence, cameraOpen, gestureCooldown, startEffectSequence]);

  // Handle fireworks completion
  const handleFireworksComplete = useCallback(() => {
    console.log('🎆 Effect complete!', { 
      effectType: currentEffect?.type, 
      isFireworksActive 
    });
    setIsFireworksActive(false);
    setCurrentEffect(null);
    // Don't reset effect sequence here - let the timers handle the flow
  }, [currentEffect]);

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

  // Get detected face expressions for overlay
  const getDetectedFaceExpressions = () => {
    const detectedGestures = getAllDetectedGestures();
    return detectedGestures.filter(g => 
      ['smile', 'wink', 'surprised'].includes(g.name)
    );
  };

  return (
    <div className="tstart relative h-full w-full items-center justify-center mb-60">
      {/* <div className="absolute top-0 left-0 w-full h-full p-12 pt-60">
        <AllPicturesTwinkling 
          pictures={pictures} 
          progress={progress} 
          currentFingerprint={currentFingerprint}
          onDelete={onDelete}
        />
      </div> */}
      
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
              
              
              {/* Step 2: Show detected things (hand skeleton + face mesh) */}
              <div ref={overlayRef}>
                {/* Hand pose overlay */}
                <MultiModelHandPoseOverlay
                  modelStatus={getModelStatus()}
                  videoWidth={CAMERA_CONFIG.VIDEO_WIDTH}
                  videoHeight={CAMERA_CONFIG.VIDEO_HEIGHT}
                />
                
                <BackgroundRemovalOverlay
                    selfieSegmentationResults={getSelfieSegmentationResults()}
                    videoWidth={CAMERA_CONFIG.VIDEO_WIDTH}
                    videoHeight={CAMERA_CONFIG.VIDEO_HEIGHT}
                    backgroundColor="rgba(0, 0, 0, 0.5)"
                  />
                {/* Face mesh overlay */}
                <FaceMeshOverlay
                  faceMeshResults={getFaceMeshResults()}
                  videoWidth={CAMERA_CONFIG.VIDEO_WIDTH}
                  videoHeight={CAMERA_CONFIG.VIDEO_HEIGHT}
                  showMesh={true}
                  showEyes={true}
                  showLips={true}
                  showExpressions={true}
                  detectedExpressions={getDetectedFaceExpressions()}
                />
                
                {/* Pose overlay - Full person outline */}
                <PoseOverlay
                  poseResults={getPoseResults()}
                  videoWidth={CAMERA_CONFIG.VIDEO_WIDTH}
                  videoHeight={CAMERA_CONFIG.VIDEO_HEIGHT}
                  showConnections={true}
                  showLandmarks={true}
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
                      {gestureProgress >= 100 ? '🎆 Ready!' : `${Math.round(gestureProgress)}% - Hold gesture/expression`}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Dynamic Effects */}
              {currentEffect?.type === 'FIREWORKS' && (
                <Fireworks
                  isActive={isFireworksActive}
                  onComplete={handleFireworksComplete}
                  duration={getCurrentEffectDuration()}
                />
              )}
              {currentEffect?.type === 'SPARKLE_BURST' && (
                <SparkleBurst
                  isActive={isFireworksActive}
                  onComplete={handleFireworksComplete}
                  duration={getCurrentEffectDuration()}
                  colors={['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4']}
                />
              )}
              {currentEffect?.type === 'HEART_BURST' && (
                <HeartBurst
                  isActive={isFireworksActive}
                  onComplete={handleFireworksComplete}
                  duration={getCurrentEffectDuration()}
                  color="#ff69b4"
                />
              )}
              {currentEffect?.type === 'STAR_BURST' && (
                <StarBurst
                  isActive={isFireworksActive}
                  onComplete={handleFireworksComplete}
                  duration={getCurrentEffectDuration()}
                  color="#ffd700"
                />
              )}
              {currentEffect?.type === 'CONFETTI' && (
                <Confetti
                  isActive={isFireworksActive}
                  onComplete={handleFireworksComplete}
                  duration={getCurrentEffectDuration()}
                  colors={['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57']}
                />
              )}
              {currentEffect?.type === 'SPARKLES' && (
                <Sparkles
                  isActive={isFireworksActive}
                  onComplete={handleFireworksComplete}
                  duration={getCurrentEffectDuration()}
                  color="#ffd700"
                />
              )}
              {currentEffect?.type === 'COUNTDOWN_TIMER' && (
                <CountdownTimer
                  isActive={isFireworksActive}
                  onComplete={handleFireworksComplete}
                  duration={getCurrentEffectDuration()}
                  countdownNumbers={[4, 3, 2, 1]}
                  intervalMs={500}
                  flashDuration={500}
                />
              )}
              
              {/* 3D Position Indicator */}
              {(() => {
                const poseResults = getPoseResults();
                if (poseResults?.landmarks?.length > 0) {
                  const positionAnalysis = analyzePose3DPosition(poseResults.landmarks);
                  if (positionAnalysis) {
                    return (
                      <div className="absolute top-4 right-4 bg-black bg-opacity-75 text-white text-xs p-3 rounded-lg z-30">
                        <div className="font-bold mb-1">3D Position</div>
                        <div>Orientation: {positionAnalysis.orientation}</div>
                        <div>Depth: {positionAnalysis.depthStatus}</div>
                        <div>Position: {positionAnalysis.screenPosition}</div>
                        <div>Z: {positionAnalysis.depth.toFixed(3)}</div>
                        <div className="mt-2 text-xs text-gray-300">
                          {positionAnalysis.isFacingCamera ? '👤 Facing Camera' : '👤 Facing Away'}
                        </div>
                      </div>
                    );
                  }
                }
                return null;
              })()}
              
              {/* Debug: Show current effect info */}
              {currentEffect && (
                <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white text-xs p-2 rounded z-30">
                  Effect: {currentEffect.type} | Active: {isFireworksActive ? 'Yes' : 'No'}
                </div>
              )}
              
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
                  <div className="text-green-400">✓ Multi-model tracking active</div>
                ) : (
                  <div className="text-yellow-400">Loading detection models...</div>
                )}
                
                {isAdditionalModelsInitialized ? (
                  <div className="text-green-400">✓ Additional models (pose) active</div>
                ) : (
                  <div className="text-yellow-400">Loading pose detection...</div>
                )}
                
                {isMultiModelInitialized ? (
                  <div className="text-green-400">✓ Person outline active</div>
                ) : (
                  <div className="text-yellow-400">Loading person outline...</div>
                )}
                
                {getAllHands().length > 0 && (
                  <div className="text-green-300">✋ Hand detected</div>
                )}
                
                {getDetectedFaces().length > 0 && (
                  <div className="text-blue-300">😊 Face detected</div>
                )}
                
                {getSelfieSegmentationResults() && (
                  <div className="text-purple-300">🎭 Person outline detected</div>
                )}
                
                {(() => {
                  const poseResults = getPoseResults();
                  if (poseResults?.landmarks?.length > 0) {
                    const positionAnalysis = analyzePose3DPosition(poseResults.landmarks);
                    if (positionAnalysis) {
                      return (
                        <div className="text-green-300">
                          🧍 Person detected ({positionAnalysis.orientation} - {positionAnalysis.depthStatus})
                          <br />
                          <span className="text-xs text-gray-400">
                            Position: {positionAnalysis.screenPosition} | Depth: {positionAnalysis.depth.toFixed(2)}
                          </span>
                        </div>
                      );
                    }
                  }
                  return null;
                })()}
                
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
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition cursor-pointer text-sm font-medium w-full"
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