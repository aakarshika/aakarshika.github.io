import { useState, useEffect, useRef, useCallback } from 'react';

export const useHandPoseDetection = () => {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [detectedGestures, setDetectedGestures] = useState([]);
  const [allHands, setAllHands] = useState([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('Initializing...');
  const detectorRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Initialize MediaPipe Hands
  useEffect(() => {
    const initializeModel = async () => {
      try {
        setLoadingStatus('Checking libraries...');
        
        // Wait for libraries to load with better debugging
        let attempts = 0;
        const maxAttempts = 100; // 10 seconds max wait
        
        while (attempts < maxAttempts) {
          const hasMediaPipe = typeof window !== 'undefined' && window.Hands;
          const hasFingerpose = typeof window !== 'undefined' && window.Fingerpose;
          
          console.log(`Attempt ${attempts + 1}: MediaPipe=${hasMediaPipe}, Fingerpose=${hasFingerpose}`);
          
          if (hasMediaPipe) {
            console.log('MediaPipe loaded successfully');
            break;
          }
          
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }
        
        // Check if MediaPipe is available
        if (typeof window !== 'undefined' && window.Hands) {
          setLoadingStatus('Initializing MediaPipe...');
          
          detectorRef.current = new window.Hands({
            locateFile: (file) => {
              return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }
          });
          
          detectorRef.current.setOptions({
            maxNumHands: 1,
            modelComplexity: 0,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
          });

          detectorRef.current.onResults((results) => {
            try {
              console.log('MediaPipe results:', {
                hasLandmarks: !!results.multiHandLandmarks,
                numHands: results.multiHandLandmarks ? results.multiHandLandmarks.length : 0
              });
              
              if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
                // Store all hands for skeleton display
                const hands = results.multiHandLandmarks.map(landmarks => ({
                  keypoints: landmarks.map((landmark, index) => ({
                    x: landmark.x,
                    y: landmark.y,
                    z: landmark.z,
                    name: `landmark_${index}`
                  }))
                }));
                setAllHands(hands);
                
                // Process gestures for the first hand
                const landmarks = results.multiHandLandmarks[0];
                const keypoints3D = landmarks.map((landmark, index) => ({
                  x: landmark.x,
                  y: landmark.y,
                  z: landmark.z,
                  name: `landmark_${index}`
                }));
                
                console.log('Processing gestures for hand with', keypoints3D.length, 'landmarks');
                // Process gestures
                processGestures(keypoints3D);
              } else {
                setDetectedGestures([]);
                setAllHands([]);
              }
            } catch (error) {
              console.error('Error processing MediaPipe results:', error);
              setDetectedGestures([]);
              setAllHands([]);
            }
          });

          setIsModelLoaded(true);
          setLoadingStatus('Ready');
          console.log('MediaPipe Hands initialized successfully');
        } else {
          console.error('MediaPipe Hands not available after waiting');
          setLoadingStatus('MediaPipe not available');
          setUseFallback(true);
          setIsModelLoaded(true); // Mark as loaded but with fallback
        }
        
        // Check if Fingerpose is available (optional for basic functionality)
        if (typeof window === 'undefined' || !window.Fingerpose) {
          console.warn('Fingerpose not available, using fallback gesture detection');
          setLoadingStatus('Using fallback gesture detection');
          // Don't set useFallback to true - we can still detect gestures with MediaPipe
        }
      } catch (error) {
        console.error('Error initializing MediaPipe Hands:', error);
        setLoadingStatus(`Error: ${error.message}`);
        setUseFallback(true);
        setIsModelLoaded(true); // Mark as loaded but with fallback
      }
    };

    initializeModel();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      // Clean up MediaPipe instance
      if (detectorRef.current) {
        try {
          detectorRef.current.close();
        } catch (error) {
          console.error('Error closing MediaPipe instance:', error);
        }
      }
    };
  }, []);

  // Define custom gestures using Fingerpose
  const createCustomGestures = () => {
    // Check if Fingerpose is available
    if (typeof window === 'undefined' || !window.Fingerpose) {
      console.error('Fingerpose library not available');
      return [];
    }

    const Fingerpose = window.Fingerpose;
    const thumbsUpGesture = new Fingerpose.GestureDescription('thumbs_up');
    const peaceSignGesture = new Fingerpose.GestureDescription('peace_sign');
    const okGesture = new Fingerpose.GestureDescription('ok_sign');

    // Thumbs up gesture
    thumbsUpGesture.addCurl(Fingerpose.Finger.Thumb, Fingerpose.FingerCurl.NoCurl, 1.0);
    thumbsUpGesture.addDirection(Fingerpose.Finger.Thumb, Fingerpose.FingerDirection.VerticalUp, 1.0);
    
    for (let finger of [Fingerpose.Finger.Index, Fingerpose.Finger.Middle, Fingerpose.Finger.Ring, Fingerpose.Finger.Pinky]) {
      thumbsUpGesture.addCurl(finger, Fingerpose.FingerCurl.FullCurl, 1.0);
    }

    // Peace sign gesture
    peaceSignGesture.addCurl(Fingerpose.Finger.Thumb, Fingerpose.FingerCurl.FullCurl, 1.0);
    peaceSignGesture.addCurl(Fingerpose.Finger.Index, Fingerpose.FingerCurl.NoCurl, 1.0);
    peaceSignGesture.addCurl(Fingerpose.Finger.Middle, Fingerpose.FingerCurl.NoCurl, 1.0);
    peaceSignGesture.addCurl(Fingerpose.Finger.Ring, Fingerpose.FingerCurl.FullCurl, 1.0);
    peaceSignGesture.addCurl(Fingerpose.Finger.Pinky, Fingerpose.FingerCurl.FullCurl, 1.0);

    // OK sign gesture (thumb and index finger forming a circle)
    // More flexible definition for better detection
    okGesture.addCurl(Fingerpose.Finger.Thumb, Fingerpose.FingerCurl.HalfCurl, 1.0);
    okGesture.addCurl(Fingerpose.Finger.Thumb, Fingerpose.FingerCurl.FullCurl, 0.8);
    okGesture.addCurl(Fingerpose.Finger.Index, Fingerpose.FingerCurl.HalfCurl, 1.0);
    okGesture.addCurl(Fingerpose.Finger.Index, Fingerpose.FingerCurl.FullCurl, 0.8);
    okGesture.addCurl(Fingerpose.Finger.Middle, Fingerpose.FingerCurl.NoCurl, 1.0);
    okGesture.addCurl(Fingerpose.Finger.Middle, Fingerpose.FingerCurl.HalfCurl, 0.8);
    okGesture.addCurl(Fingerpose.Finger.Ring, Fingerpose.FingerCurl.NoCurl, 1.0);
    okGesture.addCurl(Fingerpose.Finger.Ring, Fingerpose.FingerCurl.HalfCurl, 0.8);
    okGesture.addCurl(Fingerpose.Finger.Pinky, Fingerpose.FingerCurl.NoCurl, 1.0);
    okGesture.addCurl(Fingerpose.Finger.Pinky, Fingerpose.FingerCurl.HalfCurl, 0.8);

    return [thumbsUpGesture, peaceSignGesture, okGesture];
  };

  // Process gestures from MediaPipe landmarks
  const processGestures = useCallback(async (keypoints3D) => {
    try {
      // Check if Fingerpose is available
      if (typeof window !== 'undefined' && window.Fingerpose) {
        const Fingerpose = window.Fingerpose;
        const gestures = createCustomGestures();
        
        if (gestures.length === 0) {
          console.error('No gestures available for processing');
          return;
        }

        const ge = new Fingerpose.GestureEstimator(gestures);
        
        const gesture = await ge.estimate(keypoints3D, 9);
        if (gesture.gestures.length > 0) {
          const confidence = gesture.gestures[0].confidence;
          const name = gesture.gestures[0].name;
          if (confidence > 0.7) {
            setDetectedGestures([{ name, confidence, hand: { keypoints: keypoints3D } }]);
          } else {
            setDetectedGestures([]);
          }
        } else {
          setDetectedGestures([]);
        }
        
        // Debug: Log all detected gestures
        console.log('Detected gestures:', gesture.gestures.map(g => `${g.name}: ${g.confidence.toFixed(2)}`));
      } else {
        // Fallback: Simple gesture detection using MediaPipe landmarks directly
        const gestures = detectSimpleGestures(keypoints3D);
        setDetectedGestures(gestures);
      }
    } catch (error) {
      console.error('Error processing gestures:', error);
      // Fallback to simple gesture detection
      try {
        const gestures = detectSimpleGestures(keypoints3D);
        setDetectedGestures(gestures);
      } catch (fallbackError) {
        console.error('Fallback gesture detection also failed:', fallbackError);
        setDetectedGestures([]);
      }
    }
  }, []);

  // Simple gesture detection without Fingerpose
  const detectSimpleGestures = (keypoints3D) => {
    try {
      // MediaPipe hand landmarks indices
      const landmarks = {
        thumb: [1, 2, 3, 4],
        index: [5, 6, 7, 8],
        middle: [9, 10, 11, 12],
        ring: [13, 14, 15, 16],
        pinky: [17, 18, 19, 20]
      };

      // Get finger positions
      const getFingerPosition = (fingerIndices) => {
        const tip = keypoints3D[fingerIndices[3]];
        const pip = keypoints3D[fingerIndices[2]];
        const mcp = keypoints3D[fingerIndices[1]];
        return { tip, pip, mcp };
      };

      const thumb = getFingerPosition(landmarks.thumb);
      const index = getFingerPosition(landmarks.index);
      const middle = getFingerPosition(landmarks.middle);
      const ring = getFingerPosition(landmarks.ring);
      const pinky = getFingerPosition(landmarks.pinky);

      // Detect thumbs up
      const isThumbsUp = () => {
        // Thumb should be pointing up (y coordinate of tip > pip)
        const thumbUp = thumb.tip.y < thumb.pip.y;
        // Other fingers should be curled (tips closer to palm)
        const otherFingersCurled = 
          index.tip.y > index.pip.y &&
          middle.tip.y > middle.pip.y &&
          ring.tip.y > ring.pip.y &&
          pinky.tip.y > pinky.pip.y;
        
        return thumbUp && otherFingersCurled;
      };

      // Detect peace sign
      const isPeaceSign = () => {
        // Index and middle fingers should be extended
        const indexExtended = index.tip.y < index.pip.y;
        const middleExtended = middle.tip.y < middle.pip.y;
        // Other fingers should be curled
        const otherFingersCurled = 
          thumb.tip.y > thumb.pip.y &&
          ring.tip.y > ring.pip.y &&
          pinky.tip.y > pinky.pip.y;
        
        return indexExtended && middleExtended && otherFingersCurled;
      };

      // Detect OK sign (thumb and index forming circle)
      const isOKSign = () => {
        // Calculate distance between thumb tip and index tip
        const distance = Math.sqrt(
          Math.pow(thumb.tip.x - index.tip.x, 2) +
          Math.pow(thumb.tip.y - index.tip.y, 2)
        );
        
        // Distance should be small (forming a circle)
        const isClose = distance < 0.1; // Threshold for "close"
        
        // Other fingers should be extended
        const otherFingersExtended = 
          middle.tip.y < middle.pip.y &&
          ring.tip.y < ring.pip.y &&
          pinky.tip.y < pinky.pip.y;
        
        return isClose && otherFingersExtended;
      };

      // Check each gesture with debugging
      const thumbsUpDetected = isThumbsUp();
      const peaceSignDetected = isPeaceSign();
      const okSignDetected = isOKSign();
      
      console.log('Fallback gesture detection:', {
        thumbsUp: thumbsUpDetected,
        peaceSign: peaceSignDetected,
        okSign: okSignDetected
      });
      
      if (thumbsUpDetected) {
        return [{ name: 'thumbs_up', confidence: 0.8, hand: { keypoints: keypoints3D } }];
      } else if (peaceSignDetected) {
        return [{ name: 'peace_sign', confidence: 0.8, hand: { keypoints: keypoints3D } }];
      } else if (okSignDetected) {
        return [{ name: 'ok_sign', confidence: 0.7, hand: { keypoints: keypoints3D } }];
      }

      return [];
    } catch (error) {
      console.error('Error in simple gesture detection:', error);
      return [];
    }
  };

  // Detect hand poses from video element
  const detectHandPoses = useCallback(async (videoElement) => {
    if (!videoElement) return;

    // If using fallback, don't try to detect
    if (useFallback) {
      return;
    }

    if (!detectorRef.current) return;

    try {
      // Check if video is ready and has valid dimensions
      if (videoElement.readyState >= 2 && videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
        await detectorRef.current.send({ image: videoElement });
      }
    } catch (error) {
      console.error('Error detecting hand poses:', error);
      // Switch to fallback mode on repeated errors
      setUseFallback(true);
    }
  }, [useFallback]);

  // Start continuous detection
  const startDetection = useCallback((videoElement) => {
    if (!isModelLoaded || !videoElement) return;

    setIsDetecting(true);
    
    // Wait for video to be ready before starting detection
    const waitForVideo = () => {
      if (videoElement.readyState >= 2 && videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
        const detectFrame = async () => {
          try {
            await detectHandPoses(videoElement);
          } catch (error) {
            console.error('Detection frame error:', error);
          }
          animationFrameRef.current = requestAnimationFrame(detectFrame);
        };
        detectFrame();
      } else {
        // Retry after a short delay
        setTimeout(waitForVideo, 100);
      }
    };
    
    waitForVideo();
  }, [isModelLoaded, detectHandPoses]);

  // Stop detection
  const stopDetection = useCallback(() => {
    setIsDetecting(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setDetectedGestures([]);
    setAllHands([]);
  }, []);

  return {
    isModelLoaded,
    isDetecting,
    detectedGestures,
    allHands,
    useFallback,
    startDetection,
    stopDetection,
    detectHandPoses,
    loadingStatus,
  };
}; 