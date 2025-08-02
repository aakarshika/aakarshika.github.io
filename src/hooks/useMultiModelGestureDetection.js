import { useState, useRef, useEffect, useCallback } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

class SimpleHandDetector {
  constructor(onDataUpdate) {
    this.onDataUpdate = onDataUpdate;
    this.isLoaded = false;
    this.isDetecting = false;
    this.hands = [];
    this.detectedGestures = [];
    this.handsRef = null;
  }

  async initialize() {
    try {
      const vision = await FilesetResolver.forVisionTasks("/mediapipe");
      this.handsRef = await HandLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: "/mediapipe/hand_landmarker.task" },
        runningMode: "VIDEO",
        maxNumHands: 1, // Simplified: only one hand
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5
      });
      this.isLoaded = true;
    } catch (error) {
      console.error('Error initializing hand detector:', error);
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
          model: 'Simple Hand Detector'
        });
      }
      
      if (isOKSign()) {
        gestures.push({ 
          name: 'ok_sign', 
          confidence: 0.80,
          model: 'Simple Hand Detector'
        });
      }

      return gestures;
    } catch (error) {
      console.error('Error in gesture detection:', error);
      return [];
    }
  }

  async startDetection(videoElement) {
    this.isDetecting = true;
    if (!this.handsRef) return;
    
    const processFrame = async () => {
      if (!this.isDetecting || !this.handsRef) return;
      
      try {
        if (videoElement.readyState >= 2 && videoElement.videoWidth > 0) {
          const results = await this.handsRef.detectForVideo(videoElement, Date.now());
          
          // Process detected hand
          if (results.landmarks && results.landmarks.length > 0) {
            const landmarks = results.landmarks[0];
            this.hands = [{
              keypoints: landmarks.map(landmark => ({
                x: landmark.x,
                y: landmark.y,
                z: landmark.z
              }))
            }];
            
            // Detect gestures
            this.detectedGestures = [];
            const gestures = this.detectGestures(this.hands[0].keypoints);
            this.detectedGestures.push(...gestures);
          } else {
            this.hands = [];
            this.detectedGestures = [];
          }
          
          if (this.onDataUpdate) {
            this.onDataUpdate();
          }
        }
      } catch (error) {
        console.error('Detection error:', error);
      }
      
      if (this.isDetecting) {
        requestAnimationFrame(processFrame);
      }
    };
    
    processFrame();
  }

  stopDetection() {
    this.isDetecting = false;
    this.hands = [];
    this.detectedGestures = [];
  }

  cleanup() {
    this.stopDetection();
  }
}

export const useMultiModelGestureDetection = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const modelRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    
    const initializeModel = async () => {
      try {
        const model = new SimpleHandDetector(() => setUpdateTrigger(prev => prev + 1));
        modelRef.current = model;
        await model.initialize();
        
        if (isMounted) {
          setIsInitialized(model.isLoaded);
        }
      } catch (error) {
        console.error('Error initializing:', error);
      }
    };

    initializeModel();
    return () => {
      isMounted = false;
      if (modelRef.current) {
        modelRef.current.cleanup();
      }
    };
  }, []);

  const startDetection = useCallback((videoElement) => {
    if (!isInitialized || !videoElement || !modelRef.current) return;
    setIsDetecting(true);
    modelRef.current.startDetection(videoElement);
  }, [isInitialized]);

  const stopDetection = useCallback(() => {
    setIsDetecting(false);
    if (modelRef.current) {
      modelRef.current.stopDetection();
    }
  }, []);

  const getAllDetectedGestures = useCallback(() => {
    if (!modelRef.current) return [];
    return modelRef.current.detectedGestures;
  }, [updateTrigger]);

  const getAllHands = useCallback(() => {
    if (!modelRef.current) return [];
    return modelRef.current.hands || [];
  }, [updateTrigger]);

  const getModelStatus = useCallback(() => {
    if (!modelRef.current) return [];
    return [{
      name: 'Simple Hand Detector',
      color: '#00BFFF',
      isLoaded: modelRef.current.isLoaded,
      detectedGestures: modelRef.current.detectedGestures,
      hands: modelRef.current.hands
    }];
  }, [updateTrigger]);

  return {
    isInitialized,
    isDetecting,
    startDetection,
    stopDetection,
    getAllDetectedGestures,
    getAllHands,
    getModelStatus
  };
}; 