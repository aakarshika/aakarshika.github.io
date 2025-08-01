import { useState, useEffect, useRef, useCallback } from 'react';

export const useDualGestureDetection = () => {
  // Lightweight detection state
  const [lightweightGestures, setLightweightGestures] = useState([]);
  const [lightweightHands, setLightweightHands] = useState([]);
  
  // TensorFlow + Fingerpose detection state
  const [tfGestures, setTfGestures] = useState([]);
  const [tfHands, setTfHands] = useState([]);
  
  // Common state
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('Initializing...');
  const [tfModelLoaded, setTfModelLoaded] = useState(false);
  const [fingerposeLoaded, setFingerposeLoaded] = useState(false);
  
  // Refs
  const detectorRef = useRef(null);
  const tfModelRef = useRef(null);
  const fingerposeGesturesRef = useRef([]);
  const animationFrameRef = useRef(null);

  // Initialize both detection systems
  useEffect(() => {
    const initializeModels = async () => {
      try {
        setLoadingStatus('Loading MediaPipe...');
        
        // Wait for MediaPipe to load
        let attempts = 0;
        const maxAttempts = 50;
        
        while (attempts < maxAttempts) {
          if (typeof window !== 'undefined' && window.Hands) {
            break;
          }
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }
        
        if (typeof window !== 'undefined' && window.Hands) {
          setLoadingStatus('Initializing MediaPipe detector...');
          
          // Initialize MediaPipe Hands
          detectorRef.current = new window.Hands({
            locateFile: (file) => {
              return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }
          });
          
          detectorRef.current.setOptions({
            maxNumHands: 1,
            modelComplexity: 0,
            minDetectionConfidence: 0.6,
            minTrackingConfidence: 0.6
          });

          detectorRef.current.onResults((results) => {
            try {
              if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
                const landmarks = results.multiHandLandmarks[0];
                const keypoints3D = landmarks.map((landmark, index) => ({
                  x: landmark.x,
                  y: landmark.y,
                  z: landmark.z,
                  name: `landmark_${index}`
                }));
                
                // Store hands for both systems
                const hands = results.multiHandLandmarks.map(landmarks => ({
                  keypoints: landmarks.map((landmark, index) => ({
                    x: landmark.x,
                    y: landmark.y,
                    z: landmark.z,
                    name: `landmark_${index}`
                  }))
                }));
                
                setLightweightHands(hands);
                setTfHands(hands);
                
                // Process with lightweight detection
                const lightweightResults = detectLightweightGestures(keypoints3D);
                setLightweightGestures(lightweightResults);
                
                // Process with TensorFlow + Fingerpose
                if (tfModelLoaded && fingerposeLoaded) {
                  detectTFGestures(keypoints3D);
                }
              } else {
                setLightweightGestures([]);
                setTfGestures([]);
                setLightweightHands([]);
                setTfHands([]);
              }
            } catch (error) {
              console.error('Error processing results:', error);
            }
          });

          setIsModelLoaded(true);
          setLoadingStatus('Loading TensorFlow.js...');
          
          // Initialize TensorFlow.js
          await initializeTensorFlow();
          
        } else {
          throw new Error('MediaPipe not available');
        }
      } catch (error) {
        console.error('Error initializing dual detection:', error);
        setLoadingStatus(`Error: ${error.message}`);
        setIsModelLoaded(false);
      }
    };

    initializeModels();

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

  // Initialize TensorFlow.js and Fingerpose
  const initializeTensorFlow = async () => {
    try {
      // Wait for TensorFlow.js to load
      let attempts = 0;
      const maxAttempts = 100; // Increased timeout
      
      while (attempts < maxAttempts) {
        if (typeof window !== 'undefined' && window.tf) {
          console.log('TensorFlow.js loaded successfully');
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      if (typeof window !== 'undefined' && window.tf) {
        setLoadingStatus('Loading Fingerpose...');
        setTfModelLoaded(true);
        
        // Wait for Fingerpose to load with better debugging
        attempts = 0;
        while (attempts < maxAttempts) {
          if (typeof window !== 'undefined' && window.Fingerpose) {
            console.log('Fingerpose loaded successfully');
            break;
          }
          console.log(`Fingerpose loading attempt ${attempts + 1}/${maxAttempts}`);
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }
        
        if (typeof window !== 'undefined' && window.Fingerpose) {
          setFingerposeLoaded(true);
          setLoadingStatus('Creating Fingerpose gestures...');
          
          // Create Fingerpose gestures
          createFingerposeGestures();
          
          setLoadingStatus('Ready - Both systems active');
          console.log('Dual detection system initialized');
        } else {
          console.warn('Fingerpose not available after waiting, trying manual load...');
          
          // Try to manually load Fingerpose
          try {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/fingerpose@0.1.0/dist/fingerpose.js';
            script.onload = () => {
              console.log('Fingerpose loaded manually');
              setFingerposeLoaded(true);
              createFingerposeGestures();
              setLoadingStatus('Ready - Both systems active');
            };
            script.onerror = () => {
              console.error('Manual Fingerpose load failed');
              setLoadingStatus('Ready - Lightweight only');
            };
            document.head.appendChild(script);
          } catch (error) {
            console.error('Error in manual Fingerpose load:', error);
            setLoadingStatus('Ready - Lightweight only');
          }
        }
      } else {
        console.warn('TensorFlow.js not available after waiting');
        setLoadingStatus('Ready - Lightweight only');
      }
    } catch (error) {
      console.error('Error initializing TensorFlow:', error);
      setLoadingStatus('Ready - Lightweight only');
    }
  };

  // Create Fingerpose gestures
  const createFingerposeGestures = () => {
    try {
      const Fingerpose = window.Fingerpose;
      
      // Thumbs up gesture
      const thumbsUpGesture = new Fingerpose.GestureDescription('thumbs_up');
      thumbsUpGesture.addCurl(Fingerpose.Finger.Thumb, Fingerpose.FingerCurl.NoCurl, 1.0);
      thumbsUpGesture.addDirection(Fingerpose.Finger.Thumb, Fingerpose.FingerDirection.VerticalUp, 1.0);
      
      for (let finger of [Fingerpose.Finger.Index, Fingerpose.Finger.Middle, Fingerpose.Finger.Ring, Fingerpose.Finger.Pinky]) {
        thumbsUpGesture.addCurl(finger, Fingerpose.FingerCurl.FullCurl, 1.0);
      }

      // OK sign gesture
      const okGesture = new Fingerpose.GestureDescription('ok_sign');
      okGesture.addCurl(Fingerpose.Finger.Thumb, Fingerpose.FingerCurl.HalfCurl, 1.0);
      okGesture.addCurl(Fingerpose.Finger.Index, Fingerpose.FingerCurl.HalfCurl, 1.0);
      okGesture.addCurl(Fingerpose.Finger.Middle, Fingerpose.FingerCurl.NoCurl, 1.0);
      okGesture.addCurl(Fingerpose.Finger.Ring, Fingerpose.FingerCurl.NoCurl, 1.0);
      okGesture.addCurl(Fingerpose.Finger.Pinky, Fingerpose.FingerCurl.NoCurl, 1.0);

      fingerposeGesturesRef.current = [thumbsUpGesture, okGesture];
      console.log('Fingerpose gestures created');
    } catch (error) {
      console.error('Error creating Fingerpose gestures:', error);
    }
  };

  // Lightweight gesture detection
  const detectLightweightGestures = useCallback((keypoints3D) => {
    try {
      const landmarks = {
        thumb: [1, 2, 3, 4],
        index: [5, 6, 7, 8],
        middle: [9, 10, 11, 12],
        ring: [13, 14, 15, 16],
        pinky: [17, 18, 19, 20]
      };

      const getFingerKeyPoints = (fingerIndices) => {
        const tip = keypoints3D[fingerIndices[3]];
        const pip = keypoints3D[fingerIndices[2]];
        const mcp = keypoints3D[fingerIndices[1]];
        return { tip, pip, mcp };
      };

      const thumb = getFingerKeyPoints(landmarks.thumb);
      const index = getFingerKeyPoints(landmarks.index);
      const middle = getFingerKeyPoints(landmarks.middle);
      const ring = getFingerKeyPoints(landmarks.ring);
      const pinky = getFingerKeyPoints(landmarks.pinky);

      const gestures = [];
      
      // Thumbs up detection
      const isThumbsUp = () => {
        const thumbUp = thumb.tip.y < thumb.pip.y;
        const otherFingersCurled = 
          index.tip.y > index.pip.y &&
          middle.tip.y > middle.pip.y &&
          ring.tip.y > ring.pip.y &&
          pinky.tip.y > pinky.pip.y;
        return thumbUp && otherFingersCurled;
      };

      // OK sign detection
      const isOKSign = () => {
        const distance = Math.sqrt(
          Math.pow(thumb.tip.x - index.tip.x, 2) +
          Math.pow(thumb.tip.y - index.tip.y, 2)
        );
        const isClose = distance < 0.08;
        const otherFingersExtended = 
          middle.tip.y < middle.pip.y &&
          ring.tip.y < ring.pip.y &&
          pinky.tip.y < pinky.pip.y;
        return isClose && otherFingersExtended;
      };

      if (isThumbsUp()) {
        gestures.push({ 
          name: 'thumbs_up', 
          confidence: 0.50, 
          hand: { keypoints: keypoints3D },
          method: 'lightweight'
        });
      }
      if (isOKSign()) {
        gestures.push({ 
          name: 'ok_sign', 
          confidence: 0.50, 
          hand: { keypoints: keypoints3D },
          method: 'lightweight'
        });
      }

      return gestures;
    } catch (error) {
      console.error('Error in lightweight detection:', error);
      return [];
    }
  }, []);

  // TensorFlow + Fingerpose gesture detection
  const detectTFGestures = useCallback(async (keypoints3D) => {
    try {
      if (!fingerposeGesturesRef.current.length) return;

      const Fingerpose = window.Fingerpose;
      const ge = new Fingerpose.GestureEstimator(fingerposeGesturesRef.current);
      
      const gesture = await ge.estimate(keypoints3D, 9);
      
      const gestures = [];
      if (gesture.gestures.length > 0) {
        const confidence = gesture.gestures[0].confidence;
        const name = gesture.gestures[0].name;
        if (confidence > 0.7) {
          gestures.push({ 
            name, 
            confidence, 
            hand: { keypoints: keypoints3D },
            method: 'tensorflow'
          });
        }
      }
      
      setTfGestures(gestures);
    } catch (error) {
      console.error('Error in TensorFlow detection:', error);
      setTfGestures([]);
    }
  }, []);

  // Hand pose detection
  const detectHandPoses = useCallback(async (videoElement) => {
    if (!videoElement || !detectorRef.current) return;

    try {
      if (videoElement.readyState >= 2 && videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
        await detectorRef.current.send({ image: videoElement });
      }
    } catch (error) {
      console.error('Error detecting hand poses:', error);
    }
  }, []);

  // Start detection
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
    setLightweightGestures([]);
    setTfGestures([]);
    setLightweightHands([]);
    setTfHands([]);
  }, []);

  return {
    // Lightweight detection
    lightweightGestures,
    lightweightHands,
    
    // TensorFlow + Fingerpose detection
    tfGestures,
    tfHands,
    
    // Common state
    isModelLoaded,
    isDetecting,
    loadingStatus,
    tfModelLoaded,
    fingerposeLoaded,
    
    // Methods
    startDetection,
    stopDetection,
  };
}; 