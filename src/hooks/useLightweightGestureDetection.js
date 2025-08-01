import { useState, useEffect, useRef, useCallback } from 'react';

export const useLightweightGestureDetection = () => {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [detectedGestures, setDetectedGestures] = useState([]);
  const [allHands, setAllHands] = useState([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('Initializing...');
  const detectorRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Initialize MediaPipe Hands (lightweight configuration)
  useEffect(() => {
    const initializeModel = async () => {
      try {
        setLoadingStatus('Loading MediaPipe...');
        
        // Wait for MediaPipe to load
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds max
        
        while (attempts < maxAttempts) {
          if (typeof window !== 'undefined' && window.Hands) {
            break;
          }
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }
        
        if (typeof window !== 'undefined' && window.Hands) {
          setLoadingStatus('Initializing detector...');
          
          // Lightweight MediaPipe configuration
          detectorRef.current = new window.Hands({
            locateFile: (file) => {
              return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }
          });
          
          // Optimized settings for OK sign and thumbs up
          detectorRef.current.setOptions({
            maxNumHands: 1,           // Only track one hand
            modelComplexity: 0,       // Fastest model
            minDetectionConfidence: 0.6,  // Higher threshold for accuracy
            minTrackingConfidence: 0.6
          });

          detectorRef.current.onResults((results) => {
            try {
              if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
                // Store hand for skeleton display
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
                
                // Detect OK sign and thumbs up
                const gestures = detectOKAndThumbsUp(keypoints3D);
                setDetectedGestures(gestures);
              } else {
                setDetectedGestures([]);
                setAllHands([]);
              }
            } catch (error) {
              console.error('Error processing results:', error);
              setDetectedGestures([]);
              setAllHands([]);
            }
          });

          setIsModelLoaded(true);
          setLoadingStatus('Ready');
          console.log('Lightweight gesture detection initialized');
        } else {
          throw new Error('MediaPipe not available');
        }
      } catch (error) {
        console.error('Error initializing lightweight detection:', error);
        setLoadingStatus(`Error: ${error.message}`);
        setIsModelLoaded(false);
      }
    };

    initializeModel();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (detectorRef.current) {
        try {
          detectorRef.current.close();
        } catch (error) {
          console.error('Error closing detector:', error);
        }
      }
    };
  }, []);

  // Optimized detection for OK sign and thumbs up only
  const detectOKAndThumbsUp = useCallback((keypoints3D) => {
    try {
      // MediaPipe hand landmarks indices (optimized for our gestures)
      const landmarks = {
        thumb: [1, 2, 3, 4],      // Thumb landmarks
        index: [5, 6, 7, 8],      // Index finger landmarks
        middle: [9, 10, 11, 12],  // Middle finger landmarks
        ring: [13, 14, 15, 16],   // Ring finger landmarks
        pinky: [17, 18, 19, 20]   // Pinky finger landmarks
      };

      // Extract key points for each finger
      const getFingerKeyPoints = (fingerIndices) => {
        const tip = keypoints3D[fingerIndices[3]];    // Finger tip
        const pip = keypoints3D[fingerIndices[2]];    // PIP joint
        const mcp = keypoints3D[fingerIndices[1]];    // MCP joint
        return { tip, pip, mcp };
      };

      const thumb = getFingerKeyPoints(landmarks.thumb);
      const index = getFingerKeyPoints(landmarks.index);
      const middle = getFingerKeyPoints(landmarks.middle);
      const ring = getFingerKeyPoints(landmarks.ring);
      const pinky = getFingerKeyPoints(landmarks.pinky);

      // Detect thumbs up (optimized)
      const isThumbsUp = () => {
        // Thumb should be pointing up (tip above PIP joint)
        const thumbUp = thumb.tip.y < thumb.pip.y;
        
        // Other fingers should be curled (tips below PIP joints)
        const otherFingersCurled = 
          index.tip.y > index.pip.y &&
          middle.tip.y > middle.pip.y &&
          ring.tip.y > ring.pip.y &&
          pinky.tip.y > pinky.pip.y;
        
        return thumbUp && otherFingersCurled;
      };

      // Detect OK sign (optimized)
      const isOKSign = () => {
        // Calculate distance between thumb tip and index tip
        const distance = Math.sqrt(
          Math.pow(thumb.tip.x - index.tip.x, 2) +
          Math.pow(thumb.tip.y - index.tip.y, 2)
        );
        
        // Thumb and index should be close (forming a circle)
        const isClose = distance < 0.08; // Tighter threshold for OK sign
        
        // Other fingers should be extended (tips above PIP joints)
        const otherFingersExtended = 
          middle.tip.y < middle.pip.y &&
          ring.tip.y < ring.pip.y &&
          pinky.tip.y < pinky.pip.y;
        
        return isClose && otherFingersExtended;
      };

      // Return detected gestures with confidence scores
      const gestures = [];
      
      if (isThumbsUp()) {
        gestures.push({ 
          name: 'thumbs_up', 
          confidence: 0.50, 
          hand: { keypoints: keypoints3D } 
        });
      }
      if (isOKSign()) {
        gestures.push({ 
          name: 'ok_sign', 
          confidence: 0.50, 
          hand: { keypoints: keypoints3D } 
        });
      }

      return gestures;
    } catch (error) {
      console.error('Error in lightweight gesture detection:', error);
      return [];
    }
  }, []);

  // Optimized hand pose detection
  const detectHandPoses = useCallback(async (videoElement) => {
    if (!videoElement || !detectorRef.current) return;

    try {
      // Check if video is ready
      if (videoElement.readyState >= 2 && videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
        await detectorRef.current.send({ image: videoElement });
      }
    } catch (error) {
      console.error('Error detecting hand poses:', error);
    }
  }, []);

  // Start optimized detection
  const startDetection = useCallback((videoElement) => {
    if (!isModelLoaded || !videoElement) return;

    setIsDetecting(true);
    
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
    loadingStatus,
    startDetection,
    stopDetection,
  };
}; 