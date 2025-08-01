import React, { useState, useRef, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera } from 'lucide-react';
// Placeholder for AllPicturesTwinkling (to be implemented)
import AllPicturesTwinkling from './AllPicturesTwinkling';
import MultiModelHandPoseOverlay from './MultiModelHandPoseOverlay';
import GestureCaptureTimer from './GestureCaptureTimer';
import GestureGuide from './GestureGuide';
import Fireworks from './Fireworks';
import { useMultiModelGestureDetection } from '../hooks/useMultiModelGestureDetection';
// import ImageFilters from 'react-image-filters'; // Not needed for live preview


const FILTERS = {
  none: { label: 'None', setup: (seriously, src, target) => { target.source = src; } },
  blur: {
    label: 'Blur',
    setup: (seriously, src, target) => {
      const effect = seriously.effect('blur');
      effect.amount = 0.07;
      effect.source = src;
      target.source = effect;
    }
  },
  sepia: {
    label: 'Sepia',
    setup: (seriously, src, target) => {
      const effect = seriously.effect('sepia');
      effect.source = src;
      target.source = effect;
    }
  },
  tvglitch: {
    label: 'TV Glitch',
    setup: (seriously, src, target) => {
      const effect = seriously.effect('tvglitch');
      effect.source = src;
      target.source = effect;
    }
  },
  edge: {
    label: 'Edge Detect',
    setup: (seriously, src, target) => {
      const effect = seriously.effect('edge');
      effect.source = src;
      target.source = effect;
    }
  },
  vignette: {
    label: 'Vignette',
    setup: (seriously, src, target) => {
      const effect = seriously.effect('vignette');
      effect.amount = 1.0;
      effect.source = src;
      target.source = effect;
    }
  },
  filmgrain: {
    label: 'Film Grain',
    setup: (seriously, src, target) => {
      const effect = seriously.effect('filmgrain');
      effect.amount = 0.7;
      effect.source = src;
      target.source = effect;
    }
  },
};

function getPictureKey(pic, idx) {
  if (typeof pic === 'string') return pic;
  if (pic && pic.src) return pic.src;
  return String(idx);
}

// Utility: Convert dataURL to Blob
function dataURLtoBlob(dataurl) {
  const arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1], bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
  for (let i = 0; i < n; i++) u8arr[i] = bstr.charCodeAt(i);
  return new Blob([u8arr], { type: mime });
}

const TandLPictureSection = ({ progress, pictures, onCapture, currentFingerprint, onDelete }) => {
    const [cameraOpen, setCameraOpen] = useState(false);
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const [filter, setFilter] = useState('sepia');
    const [message, setMessage] = useState('');
    const [showGestureGuide, setShowGestureGuide] = useState(false);
    const seriouslyInstance = useRef(null);
    const videoSource = useRef(null);
    const targetNode = useRef(null);
    const ownImage = currentFingerprint && pictures.some(pic => pic?.fingerprint === currentFingerprint);
    
    // Multi-model gesture detection hook
    const {
        isInitialized,
        isDetecting,
        loadingStatus,
        startDetection,
        stopDetection,
        getAllDetectedGestures,
        getAllHands,
        getModelStatus,
    } = useMultiModelGestureDetection();

    // State for gesture-based capture
    const [isGestureCaptureActive, setIsGestureCaptureActive] = useState(false);
    const [isFireworksActive, setIsFireworksActive] = useState(false);
    const [gestureCooldown, setGestureCooldown] = useState(false);
    const [consecutiveDetections, setConsecutiveDetections] = useState(0);
    const lastGestureTime = useRef(0);
    const gestureDetectionTimes = useRef([]);
    const lastDetectionTime = useRef(0);
    const [gestureProgress, setGestureProgress] = useState(0);

    // Setup Seriously.js pipeline for live preview
    useEffect(() => {
        if (!cameraOpen) return;
        if (!window.Seriously) return;
        if (!webcamRef.current || !canvasRef.current) return;
        if (!webcamRef.current.video) return;

        // Clean up previous instance
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

        // Setup selected filter
        FILTERS[filter].setup(seriously, src, target);
        seriously.go();

        return () => {
            seriously.destroy();
            seriouslyInstance.current = null;
        };
    }, [cameraOpen, filter]);





    // Start multi-model gesture detection when camera opens
    useEffect(() => {
        if (cameraOpen && isInitialized && webcamRef.current?.video) {
            startDetection(webcamRef.current.video);
        } else if (!cameraOpen) {
            stopDetection();
        }
    }, [cameraOpen, isInitialized, startDetection, stopDetection]);

    // Handle gesture-based capture with fireworks
    useEffect(() => {
        const detectedGestures = getAllDetectedGestures();
        const thumbsUpGestures = detectedGestures.filter(g => g.name === 'thumbs_up');
        
        // Robust detection requirements
        const confidenceThreshold = 0.85;
        const cooldownPeriod = 3000; // 3 seconds cooldown
        const requiredDetectionsPerSecond = 5; // 5 detections per second (every 0.2s)
        const requiredSustainedTime = 1000; // 1 second sustained detection
        const currentTime = Date.now();
        
        // Check if any gesture is detected with threshold+ confidence
        const hasHighConfidenceGesture = 
            thumbsUpGestures.some(g => g.confidence >= confidenceThreshold);
        
        // Track detection times for sustained detection
        if (hasHighConfidenceGesture && !gestureCooldown) {
            // Only add if enough time has passed since last detection (0.2s minimum)
            if (currentTime - lastDetectionTime.current >= 200) {
                gestureDetectionTimes.current.push(currentTime);
                lastDetectionTime.current = currentTime;
                
                // Keep only detections from the last 1.5 seconds
                const cutoffTime = currentTime - 1500;
                gestureDetectionTimes.current = gestureDetectionTimes.current.filter(time => time > cutoffTime);
            }
        } else if (!hasHighConfidenceGesture) {
            // Reset detection times if no gesture detected
            gestureDetectionTimes.current = [];
        }
        
        // Check if we have sustained detection for 1 second
        const hasSustainedDetection = gestureDetectionTimes.current.length >= requiredDetectionsPerSecond &&
            (gestureDetectionTimes.current[gestureDetectionTimes.current.length - 1] - gestureDetectionTimes.current[0]) >= requiredSustainedTime;
        
        // Calculate progress percentage for visual feedback
        if (gestureDetectionTimes.current.length > 0) {
            const timeSpan = gestureDetectionTimes.current[gestureDetectionTimes.current.length - 1] - gestureDetectionTimes.current[0];
            const progress = Math.min((timeSpan / requiredSustainedTime) * 100, 100);
            setGestureProgress(progress);
        } else {
            setGestureProgress(0);
        }
        
        // Only log when fireworks are triggered
        if (hasSustainedDetection && 
            !gestureCooldown && 
            !isFireworksActive && 
            !isGestureCaptureActive &&
            (currentTime - lastGestureTime.current) > cooldownPeriod) {
            console.log(`🎆 Fireworks triggered! Sustained detection: ${gestureDetectionTimes.current.length} detections over ${Math.round((gestureDetectionTimes.current[gestureDetectionTimes.current.length - 1] - gestureDetectionTimes.current[0]) / 100) / 10}s`);
        }
        
        // Start fireworks only when sustained detection is achieved
        if (hasSustainedDetection && 
            !gestureCooldown && 
            !isFireworksActive && 
            !isGestureCaptureActive &&
            (currentTime - lastGestureTime.current) > cooldownPeriod) {
            
            console.log(`🎆 Fireworks triggered! Sustained detection achieved`);
            setIsFireworksActive(true);
            setGestureCooldown(true);
            lastGestureTime.current = currentTime;
            
            // Reset cooldown after 3 seconds
            setTimeout(() => {
                setGestureCooldown(false);
                gestureDetectionTimes.current = [];
            }, cooldownPeriod);
        }
    }, [getAllDetectedGestures, isGestureCaptureActive, isFireworksActive, gestureCooldown]);

    // Handle fireworks completion and photo capture
    const handleFireworksComplete = useCallback(() => {
        console.log('🎆 Fireworks complete! Capturing photo...');
        if (canvasRef.current) {
            requestAnimationFrame(() => {
                const imageSrc = canvasRef.current.toDataURL('image/jpeg');
                if (onCapture) onCapture(imageSrc, filter, message);
                setTimeout(() => {
                    setCameraOpen(false);
                    setMessage('');
                    setIsFireworksActive(false);
                    setIsGestureCaptureActive(false);
                    setGestureCooldown(false);
                    setConsecutiveDetections(0);
                }, 120);
            });
        }
    }, [filter, message, onCapture]);

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
                    {/* Main Camera Area - Large */}
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            className="rounded-lg w-full h-full object-cover absolute opacity-0 pointer-events-none"
                            style={{ zIndex: 0 }}
                            videoConstraints={{ width: 384, height: 384 }}
                        />
                        <div className="relative w-full h-full">
                            <canvas
                                ref={canvasRef}
                                width={384}
                                height={384}
                                className="rounded-lg w-full h-full object-cover"
                                style={{ zIndex: 1 }}
                            />
                            <MultiModelHandPoseOverlay
                                modelStatus={getModelStatus()}
                                videoWidth={384}
                                videoHeight={384}
                                showConfidenceScores={false}
                                showModelNames={false}
                            />
                            <GestureGuide
                                isVisible={showGestureGuide}
                                onClose={() => setShowGestureGuide(false)}
                            />
                            
                            {/* Gesture Progress Indicator */}
                            {gestureProgress > 0 && !isFireworksActive && (
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
                                            {gestureProgress >= 100 ? '🎆 Ready!' : `${Math.round(gestureProgress)}% - Hold thumbs up`}
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {/* Fireworks Effect */}
                            <Fireworks
                                isActive={isFireworksActive}
                                onComplete={handleFireworksComplete}
                                duration={10000}
                            />
                        </div>
                    </div>

                    {/* Controls Sidebar */}
                    <div className="w-80 flex flex-col gap-6">
                        {/* Filter and Status */}
                        <div className="bg-gray-800 rounded-lg p-4">
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-2">
                                    <label className="text-white text-sm font-medium">Filter:</label>
                                    <select
                                        value={filter}
                                        onChange={e => setFilter(e.target.value)}
                                        className="rounded px-3 py-2 bg-gray-700 text-white text-sm flex-1"
                                    >
                                        {Object.entries(FILTERS).map(([key, val]) => (
                                            <option key={key} value={key}>{val.label}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className="text-sm text-white space-y-2">
                                    {isInitialized ? (
                                        <div className="text-green-400">✓ Hand tracking active</div>
                                    ) : (
                                        <div className="text-yellow-400">Loading: {loadingStatus}</div>
                                    )}
                                    {getAllHands().length > 0 && (
                                        <div className="text-green-300">✋ Hand detected</div>
                                    )}
                                    {(() => {
                                        const detectedGestures = getAllDetectedGestures();
                                        const thumbsUpGestures = detectedGestures.filter(g => g.name === 'thumbs_up');
                                        
                                        if (isFireworksActive) {
                                            return <div className="text-purple-300">✨ Fireworks active!</div>;
                                        } else if (gestureCooldown) {
                                            return <div className="text-orange-300">⏳ Cooldown</div>;
                                        } else if (thumbsUpGestures.length > 0) {
                                            const detectionCount = gestureDetectionTimes.current.length;
                                            const timeSpan = detectionCount > 1 ? 
                                                Math.round((gestureDetectionTimes.current[gestureDetectionTimes.current.length - 1] - gestureDetectionTimes.current[0]) / 100) / 10 : 0;
                                            return (
                                                <div className="text-yellow-300">
                                                    👍 Thumbs up: {Math.round(gestureProgress)}% complete
                                                </div>
                                            );
                                        }
                                        return null;
                                    })()}
                                </div>
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
                        
                        {/* Gesture Instructions */}
                        <div className="bg-gray-800 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="text-white text-sm font-semibold">Gesture:</h4>
                                <button
                                    onClick={() => setShowGestureGuide(true)}
                                    className="text-blue-400 hover:text-blue-300 text-xs underline"
                                >
                                    Guide
                                </button>
                            </div>
                            <div className="text-xs text-gray-300 space-y-2">
                                <div>👍 <strong>Hold thumbs up for 1 second</strong> to trigger fireworks</div>
                                <div className="text-blue-300">🎯 Hand skeleton shows detection</div>
                            </div>
                        </div>

                        {/* Debug and Close Buttons */}
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                                <button
                                    className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition cursor-pointer text-xs font-medium"
                                    onClick={() => {
                                        const gestures = getAllDetectedGestures();
                                        console.log('Current gestures:', gestures.length > 0 ? gestures : 'None');
                                        console.log('Hands detected:', getAllHands().length);
                                    }}
                                >
                                    Debug
                                </button>
                                <button
                                    className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition cursor-pointer text-xs font-medium"
                                    onClick={() => {
                                        console.log('🎆 Manual fireworks trigger!');
                                        setIsFireworksActive(true);
                                    }}
                                >
                                    Test Fireworks
                                </button>
                            </div>
                            <button
                                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition cursor-pointer text-sm font-medium"
                                onClick={() => {
                                    setCameraOpen(false);
                                    setMessage(''); // Reset message when closing
                                }}
                            >
                                Close Camera
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {!cameraOpen && !ownImage && (
                <div className="p-12 pt-60 h-full flex items-center justify-center gap-4  z-2" onClick={() => {
                    // Reset all states when opening camera
                    setIsFireworksActive(false);
                    setIsGestureCaptureActive(false);
                    setGestureCooldown(false);
                    setConsecutiveDetections(0);
                    setMessage('');
                    setCameraOpen(true);
                }}>
                  <div className=' items-center justify-center bg-gradient-to-b from-black to-gray-900 rounded-lg p-20 gap-4 z-10'>
                    <Camera className="w-10 h-10" />
                </div>
                </div>
            )}
            

        </div>
    );
};

export default TandLPictureSection; 