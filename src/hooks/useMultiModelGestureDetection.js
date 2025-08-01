import { useState, useEffect, useRef, useCallback } from 'react';

// Simple lightweight gesture detection model
class LightweightGestureModel {
  constructor(onDataUpdate) {
    this.name = 'Lightweight';
    this.color = '#00BFFF';
    this.isLoaded = false;
    this.isDetecting = false;
    this.detectedGestures = [];
    this.hands = [];
    this.loadingStatus = 'Initializing...';
    this.detectorRef = null;
    this.animationFrameRef = null;
    this.onDataUpdate = onDataUpdate; // Callback to trigger re-renders
  }

  async initialize() {
    try {
      this.loadingStatus = 'Loading MediaPipe...';
      
      // Wait for MediaPipe to load with timeout
      let attempts = 0;
      const maxAttempts = 30; // 3 seconds max
      
      while (attempts < maxAttempts) {
        if (typeof window !== 'undefined' && window.Hands) {
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      if (typeof window !== 'undefined' && window.Hands) {
        this.loadingStatus = 'Initializing detector...';
        
        this.detectorRef = new window.Hands({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
          }
        });
        
        this.detectorRef.setOptions({
          maxNumHands: 2,
          modelComplexity: 0,
          minDetectionConfidence: 0.6,
          minTrackingConfidence: 0.6
        });

        this.detectorRef.onResults((results) => {
          try {
            if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
              console.log('Hand detected!', results.multiHandLandmarks.length, 'hand(s)');
              
              // Store hands for skeleton display
              const hands = results.multiHandLandmarks.map(landmarks => ({
                keypoints: landmarks.map((landmark, index) => ({
                  x: landmark.x,
                  y: landmark.y,
                  z: landmark.z,
                  name: `landmark_${index}`
                }))
              }));
              
              this.hands = hands;
              console.log('Model hands updated:', this.hands.length, 'hands');
              
              // Detect gestures for all hands
              this.detectedGestures = [];
              results.multiHandLandmarks.forEach((landmarks, handIndex) => {
                const keypoints3D = landmarks.map((landmark, index) => ({
                  x: landmark.x,
                  y: landmark.y,
                  z: landmark.z,
                  name: `landmark_${index}`
                }));
                
                const handGestures = this.detectGestures(keypoints3D);
                // Add hand index to gestures for identification
                handGestures.forEach(gesture => {
                  gesture.handIndex = handIndex;
                });
                this.detectedGestures.push(...handGestures);
              });
              
              if (this.detectedGestures.length > 0) {
                console.log('Gestures detected:', this.detectedGestures);
              }
              
              // Trigger re-render
              if (this.onDataUpdate) {
                this.onDataUpdate();
              }
            } else {
              this.detectedGestures = [];
              this.hands = [];
              
              // Trigger re-render
              if (this.onDataUpdate) {
                this.onDataUpdate();
              }
            }
          } catch (error) {
            console.error('Error processing results:', error);
            this.detectedGestures = [];
            this.hands = [];
          }
        });

        this.isLoaded = true;
        this.loadingStatus = 'Ready';
        console.log(`${this.name} model initialized successfully`);
      } else {
        throw new Error('MediaPipe not available after timeout');
      }
    } catch (error) {
      console.error(`Error initializing ${this.name} model:`, error);
      this.loadingStatus = `Error: ${error.message}`;
      this.isLoaded = false;
    }
  }

  detectGestures(keypoints3D) {
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
      
      // Enhanced thumbs up detection based on established patterns
      const isThumbsUp = () => {
        // 1. Thumb should be pointing upward (tip above PIP joint)
        const thumbUp = thumb.tip.y < thumb.pip.y;
        
        // 2. Thumb should be extended (tip above MCP joint)
        const thumbExtended = thumb.tip.y < thumb.mcp.y;
        
        // 3. Thumb should be pointing more upward than sideways
        const thumbAngle = Math.atan2(thumb.tip.y - thumb.mcp.y, thumb.tip.x - thumb.mcp.x);
        const isThumbPointingUp = thumbAngle < -0.5; // Roughly -30 degrees or more upward
        
        // 4. Other fingers should be curled (tips below PIP joints)
        const indexCurled = index.tip.y > index.pip.y;
        const middleCurled = middle.tip.y > middle.pip.y;
        const ringCurled = ring.tip.y > ring.pip.y;
        const pinkyCurled = pinky.tip.y > pinky.pip.y;
        
        // 5. Other fingers should be significantly curled (tips closer to palm)
        const indexWellCurled = index.tip.y > index.mcp.y;
        const middleWellCurled = middle.tip.y > middle.mcp.y;
        const ringWellCurled = ring.tip.y > ring.mcp.y;
        const pinkyWellCurled = pinky.tip.y > pinky.mcp.y;
        
        // 6. Check if thumb is positioned correctly relative to other fingers
        const thumbAboveOtherFingers = thumb.tip.y < Math.min(index.tip.y, middle.tip.y, ring.tip.y, pinky.tip.y);
        
        // 7. Calculate confidence based on how well all conditions are met
        let confidence = 0.5; // Base confidence
        
        if (thumbUp) confidence += 0.1;
        if (thumbExtended) confidence += 0.1;
        if (isThumbPointingUp) confidence += 0.1;
        if (indexCurled && middleCurled && ringCurled && pinkyCurled) confidence += 0.1;
        if (indexWellCurled && middleWellCurled && ringWellCurled && pinkyWellCurled) confidence += 0.1;
        if (thumbAboveOtherFingers) confidence += 0.1;
        
        // All basic conditions must be met
        const basicConditions = thumbUp && thumbExtended && 
                               indexCurled && middleCurled && ringCurled && pinkyCurled;
        
        return {
          detected: basicConditions,
          confidence: Math.min(confidence, 0.95) // Cap at 95%
        };
      };

      // Enhanced OK sign detection
      const isOKSign = () => {
        // Calculate distance between thumb tip and index tip
        const distance = Math.sqrt(
          Math.pow(thumb.tip.x - index.tip.x, 2) +
          Math.pow(thumb.tip.y - index.tip.y, 2)
        );
        
        // Distance should be small (forming a circle)
        const isClose = distance < 0.08;
        
        // Other fingers should be extended
        const otherFingersExtended = 
          middle.tip.y < middle.pip.y &&
          ring.tip.y < ring.pip.y &&
          pinky.tip.y < pinky.pip.y;
        
        return isClose && otherFingersExtended;
      };

      // Check thumbs up with enhanced detection
      const thumbsUpResult = isThumbsUp();
      if (thumbsUpResult.detected) {
        gestures.push({ 
          name: 'thumbs_up', 
          confidence: thumbsUpResult.confidence,
          model: this.name
        });
        
        // Debug logging for thumbs up detection
        console.log('👍 Enhanced thumbs up detected:', {
          confidence: thumbsUpResult.confidence,
          thumbUp: thumb.tip.y < thumb.pip.y,
          thumbExtended: thumb.tip.y < thumb.mcp.y,
          thumbAngle: Math.atan2(thumb.tip.y - thumb.mcp.y, thumb.tip.x - thumb.mcp.x),
          otherFingersCurled: {
            index: index.tip.y > index.pip.y,
            middle: middle.tip.y > middle.pip.y,
            ring: ring.tip.y > ring.pip.y,
            pinky: pinky.tip.y > pinky.pip.y
          }
        });
      }
      
      if (isOKSign()) {
        gestures.push({ 
          name: 'ok_sign', 
          confidence: 0.80,
          model: this.name
        });
      }

      return gestures;
    } catch (error) {
      console.error('Error in enhanced gesture detection:', error);
      return [];
    }
  }

  async startDetection(videoElement) {
    if (!this.isLoaded || !videoElement || this.isDetecting) return;

    this.isDetecting = true;
    let retryCount = 0;
    const maxRetries = 50; // 5 seconds max
    
    const waitForVideo = () => {
      // Check if video is ready
      if (videoElement.readyState >= 2 && videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
        console.log('Video ready, starting detection frames');
        const detectFrame = async () => {
          // Check if we should stop
          if (!this.isDetecting || !this.detectorRef) {
            return;
          }

          try {
            await this.detectorRef.send({ image: videoElement });
          } catch (error) {
            console.error('Detection frame error:', error);
            // Stop detection on error to prevent infinite loop
            this.stopDetection();
            return;
          }
          
          // Only continue if still detecting
          if (this.isDetecting) {
            this.animationFrameRef = requestAnimationFrame(detectFrame);
          }
        };
        detectFrame();
      } else {
        retryCount++;
        if (retryCount < maxRetries) {
          setTimeout(waitForVideo, 100);
        } else {
          console.error('Video not ready after maximum retries');
          this.stopDetection();
        }
      }
    };
    
    waitForVideo();
  }

  stopDetection() {
    this.isDetecting = false;
    if (this.animationFrameRef) {
      cancelAnimationFrame(this.animationFrameRef);
      this.animationFrameRef = null;
    }
    this.detectedGestures = [];
    this.hands = [];
  }

  cleanup() {
    this.stopDetection();
    if (this.detectorRef) {
      try {
        this.detectorRef.close();
      } catch (error) {
        console.error('Error closing detector:', error);
      }
    }
  }
}

// Main hook for gesture detection
export const useMultiModelGestureDetection = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('Initializing...');
  const [isDetecting, setIsDetecting] = useState(false);
  const [updateTrigger, setUpdateTrigger] = useState(0); // Add this to trigger re-renders
  const modelRef = useRef(null);

  // Initialize the model
  useEffect(() => {
    let isMounted = true;
    
    const initializeModel = async () => {
      try {
        setLoadingStatus('Creating detection model...');
        
        // Create model instance
        const model = new LightweightGestureModel(() => setUpdateTrigger(prev => prev + 1));
        modelRef.current = model;
        
        setLoadingStatus('Initializing model...');
        
        // Initialize the model
        await model.initialize();
        
        if (isMounted) {
          setIsInitialized(model.isLoaded);
          setLoadingStatus(model.loadingStatus);
          
          if (model.isLoaded) {
            console.log('Gesture detection model initialized successfully');
          }
        }
        
      } catch (error) {
        console.error('Error initializing gesture detection:', error);
        if (isMounted) {
          setLoadingStatus(`Error: ${error.message}`);
          setIsInitialized(false);
        }
      }
    };

    initializeModel();

    return () => {
      isMounted = false;
      // Cleanup model
      if (modelRef.current) {
        modelRef.current.cleanup();
      }
    };
  }, []);

  // Start detection
  const startDetection = useCallback((videoElement) => {
    console.log('startDetection called:', { isInitialized, hasVideo: !!videoElement, hasModel: !!modelRef.current });
    
    if (!isInitialized || !videoElement || !modelRef.current) return;

    console.log('Starting detection...');
    setIsDetecting(true);
    modelRef.current.startDetection(videoElement);
  }, [isInitialized]);

  // Stop detection
  const stopDetection = useCallback(() => {
    setIsDetecting(false);
    if (modelRef.current) {
      modelRef.current.stopDetection();
    }
  }, []);

  // Get detected gestures
  const getAllDetectedGestures = useCallback(() => {
    if (!modelRef.current) return [];
    return modelRef.current.detectedGestures;
  }, [updateTrigger]);

  // Get hands data
  const getAllHands = useCallback(() => {
    if (!modelRef.current) return [];
    return modelRef.current.hands || [];
  }, [updateTrigger]);

  // Get model status
  const getModelStatus = useCallback(() => {
    if (!modelRef.current) return [];
    
    const status = [{
      name: modelRef.current.name,
      color: modelRef.current.color,
      isLoaded: modelRef.current.isLoaded,
      loadingStatus: modelRef.current.loadingStatus,
      detectedGestures: modelRef.current.detectedGestures,
      hands: modelRef.current.hands
    }];
    
    console.log('getModelStatus returning:', status);
    return status;
  }, [updateTrigger]);

  return {
    // State
    isInitialized,
    isDetecting,
    loadingStatus,
    
    // Methods
    startDetection,
    stopDetection,
    
    // Data
    getAllDetectedGestures,
    getAllHands,
    getModelStatus,
    
    // Raw model (for advanced usage)
    model: modelRef.current
  };
}; 