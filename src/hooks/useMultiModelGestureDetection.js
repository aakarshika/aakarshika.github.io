import { useState, useRef, useEffect, useCallback } from 'react';
import { FilesetResolver, HandLandmarker, FaceLandmarker } from '@mediapipe/tasks-vision';

class MultiModelDetector {
  constructor(onDataUpdate) {
    this.onDataUpdate = onDataUpdate;
    this.isLoaded = false;
    this.isDetecting = false;
    this.loadingStatus = 'Initializing...';
    
    // Model references
    this.handsRef = null;
    this.faceMeshRef = null;
    
    // Results storage
    this.hands = [];
    this.detectedGestures = [];
    this.faceMeshResults = null;
    this.detectedFaces = [];
  }

  async initialize() {
    try {
      this.loadingStatus = 'Loading MediaPipe Tasks Vision...';
      const vision = await FilesetResolver.forVisionTasks("/mediapipe");
      
      // Initialize Hand Landmarker
      this.loadingStatus = 'Initializing Hand Landmarker...';
      this.handsRef = await HandLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: "/mediapipe/hand_landmarker.task" },
        runningMode: "VIDEO",
        maxNumHands: 1,
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5
      });
      
      // Initialize Face Landmarker
      this.loadingStatus = 'Initializing Face Landmarker...';
      this.faceMeshRef = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: "/mediapipe/face_landmarker.task" },
        runningMode: "VIDEO",
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });
      
      this.isLoaded = true;
      this.loadingStatus = 'Ready';
      
    } catch (error) {
      console.error('Error initializing multi-model detector:', error);
      this.loadingStatus = `Error: ${error.message}`;
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
      
      // Enhanced thumbs up detection
      const isThumbsUp = () => {
        const thumbUp = thumb.tip.y < thumb.pip.y;
        const thumbExtended = thumb.tip.y < thumb.mcp.y;
        const thumbAngle = Math.atan2(thumb.tip.y - thumb.mcp.y, thumb.tip.x - thumb.mcp.x);
        const isThumbPointingUp = thumbAngle < -0.5;
        
        const indexCurled = index.tip.y > index.pip.y;
        const middleCurled = middle.tip.y > middle.pip.y;
        const ringCurled = ring.tip.y > ring.pip.y;
        const pinkyCurled = pinky.tip.y > pinky.pip.y;
        
        const indexWellCurled = index.tip.y > index.mcp.y;
        const middleWellCurled = middle.tip.y > middle.mcp.y;
        const ringWellCurled = ring.tip.y > ring.mcp.y;
        const pinkyWellCurled = pinky.tip.y > pinky.mcp.y;
        
        const thumbAboveOtherFingers = thumb.tip.y < Math.min(index.tip.y, middle.tip.y, ring.tip.y, pinky.tip.y);
        
        let confidence = 0.5;
        if (thumbUp) confidence += 0.1;
        if (thumbExtended) confidence += 0.1;
        if (isThumbPointingUp) confidence += 0.1;
        if (indexCurled && middleCurled && ringCurled && pinkyCurled) confidence += 0.1;
        if (indexWellCurled && middleWellCurled && ringWellCurled && pinkyWellCurled) confidence += 0.1;
        if (thumbAboveOtherFingers) confidence += 0.1;
        
        const basicConditions = thumbUp && thumbExtended && 
                               indexCurled && middleCurled && ringCurled && pinkyCurled;
        
        return {
          detected: basicConditions,
          confidence: Math.min(confidence, 0.95)
        };
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

      // Check gestures
      const thumbsUpResult = isThumbsUp();
      if (thumbsUpResult.detected) {
        gestures.push({ 
          name: 'thumbs_up', 
          confidence: thumbsUpResult.confidence,
          model: 'Multi-Model Detector'
        });
      }
      
      if (isOKSign()) {
        gestures.push({ 
          name: 'ok_sign', 
          confidence: 0.80,
          model: 'Multi-Model Detector'
        });
      }

      return gestures;
    } catch (error) {
      console.error('Error in gesture detection:', error);
      return [];
    }
  }

  detectFaceExpressions(faceLandmarks) {
    try {
      if (!faceLandmarks || faceLandmarks.length === 0) return [];
      
      const expressions = [];
      const landmarks = faceLandmarks[0]; // Get first face
      
      // Key landmark indices for face expressions
      const FACE_LANDMARKS = {
        // Eyes
        LEFT_EYE_TOP: 159,
        LEFT_EYE_BOTTOM: 145,
        RIGHT_EYE_TOP: 386,
        RIGHT_EYE_BOTTOM: 374,
        
        // Mouth
        MOUTH_TOP: 13,
        MOUTH_BOTTOM: 14,
        MOUTH_LEFT: 61,
        MOUTH_RIGHT: 291,
        
        // Eyebrows
        LEFT_EYEBROW_TOP: 70,
        LEFT_EYEBROW_BOTTOM: 63,
        RIGHT_EYEBROW_TOP: 300,
        RIGHT_EYEBROW_BOTTOM: 293
      };
      
      // Smile detection
      const isSmiling = () => {
        const mouthTop = landmarks[FACE_LANDMARKS.MOUTH_TOP];
        const mouthBottom = landmarks[FACE_LANDMARKS.MOUTH_BOTTOM];
        const mouthLeft = landmarks[FACE_LANDMARKS.MOUTH_LEFT];
        const mouthRight = landmarks[FACE_LANDMARKS.MOUTH_RIGHT];
        
        // Calculate mouth openness and width
        const mouthHeight = Math.abs(mouthTop.y - mouthBottom.y);
        const mouthWidth = Math.abs(mouthLeft.x - mouthRight.x);
        const mouthRatio = mouthWidth / mouthHeight;
        
        // Smile typically has wider mouth relative to height
        // Made more sensitive by lowering thresholds
        return mouthRatio > 2.5 && mouthHeight > 0.015;
      };
      
      // Wink detection (one eye closed)
      const isWinking = () => {
        const leftEyeTop = landmarks[FACE_LANDMARKS.LEFT_EYE_TOP];
        const leftEyeBottom = landmarks[FACE_LANDMARKS.LEFT_EYE_BOTTOM];
        const rightEyeTop = landmarks[FACE_LANDMARKS.RIGHT_EYE_TOP];
        const rightEyeBottom = landmarks[FACE_LANDMARKS.RIGHT_EYE_BOTTOM];
        
        const leftEyeHeight = Math.abs(leftEyeTop.y - leftEyeBottom.y);
        const rightEyeHeight = Math.abs(rightEyeTop.y - rightEyeBottom.y);
        
        // One eye significantly more closed than the other
        const heightRatio = Math.min(leftEyeHeight, rightEyeHeight) / Math.max(leftEyeHeight, rightEyeHeight);
        return heightRatio < 0.6;
      };
      
      // Surprised expression (raised eyebrows)
      const isSurprised = () => {
        const leftEyebrowTop = landmarks[FACE_LANDMARKS.LEFT_EYEBROW_TOP];
        const leftEyebrowBottom = landmarks[FACE_LANDMARKS.LEFT_EYEBROW_BOTTOM];
        const rightEyebrowTop = landmarks[FACE_LANDMARKS.RIGHT_EYEBROW_TOP];
        const rightEyebrowBottom = landmarks[FACE_LANDMARKS.RIGHT_EYEBROW_BOTTOM];
        
        const leftEyebrowHeight = Math.abs(leftEyebrowTop.y - leftEyebrowBottom.y);
        const rightEyebrowHeight = Math.abs(rightEyebrowTop.y - rightEyebrowBottom.y);
        
        // Raised eyebrows have more height
        return leftEyebrowHeight > 0.015 && rightEyebrowHeight > 0.015;
      };
      
      // Check expressions
      if (isSmiling()) {
        
        expressions.push({
          name: 'smile',
          confidence: 0.85,
          model: 'Multi-Model Detector'
        });
      }
      
      if (isWinking()) {
        
        expressions.push({
          name: 'wink',
          confidence: 0.80,
          model: 'Multi-Model Detector'
        });
      }
      
      if (isSurprised()) {
        
        expressions.push({
          name: 'surprised',
          confidence: 0.75,
          model: 'Multi-Model Detector'
        });
      }
      
      return expressions;
    } catch (error) {
      console.error('Error in face expression detection:', error);
      return [];
    }
  }

  async startDetection(videoElement) {
    this.isDetecting = true;
    if (!this.handsRef || !this.faceMeshRef) return;
    
    const processFrame = async () => {
      if (!this.isDetecting) return;
      
      try {
        if (videoElement.readyState >= 2 && videoElement.videoWidth > 0) {
          // Process hands
          const handResults = await this.handsRef.detectForVideo(videoElement, Date.now());
          
          if (handResults.landmarks && handResults.landmarks.length > 0) {
            const landmarks = handResults.landmarks[0];
            this.hands = [{
              keypoints: landmarks.map(landmark => ({
                x: landmark.x,
                y: landmark.y,
                z: landmark.z
              }))
            }];
            
            // Detect hand gestures
            this.detectedGestures = this.detectGestures(this.hands[0].keypoints);
          } else {
            this.hands = [];
            this.detectedGestures = [];
          }
          
          // Process face
          const faceResults = await this.faceMeshRef.detectForVideo(videoElement, Date.now());
          
          if (faceResults.faceLandmarks && faceResults.faceLandmarks.length > 0) {
            this.faceMeshResults = faceResults;
            this.detectedFaces = faceResults.faceLandmarks.map(landmarks => ({
              landmarks: landmarks.map(landmark => ({
                x: landmark.x,
                y: landmark.y,
                z: landmark.z
              }))
            }));
            
            // Detect face expressions and add to gestures
            const faceExpressions = this.detectFaceExpressions(faceResults.faceLandmarks);
            this.detectedGestures.push(...faceExpressions);
          } else {
            this.faceMeshResults = null;
            this.detectedFaces = [];
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
    this.faceMeshResults = null;
    this.detectedFaces = [];
  }

  cleanup() {
    this.stopDetection();
    if (this.handsRef) {
      this.handsRef.close();
    }
    if (this.faceMeshRef) {
      this.faceMeshRef.close();
    }
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
        const model = new MultiModelDetector(() => setUpdateTrigger(prev => prev + 1));
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

  const getFaceMeshResults = useCallback(() => {
    if (!modelRef.current) return null;
    return modelRef.current.faceMeshResults;
  }, [updateTrigger]);

  const getDetectedFaces = useCallback(() => {
    if (!modelRef.current) return [];
    return modelRef.current.detectedFaces || [];
  }, [updateTrigger]);

  const getModelStatus = useCallback(() => {
    if (!modelRef.current) return [];
    return [{
      name: 'Multi-Model Detector',
      color: '#00BFFF',
      isLoaded: modelRef.current.isLoaded,
      detectedGestures: modelRef.current.detectedGestures,
      hands: modelRef.current.hands,
      faces: modelRef.current.detectedFaces
    }];
  }, [updateTrigger]);

  return {
    isInitialized,
    isDetecting,
    startDetection,
    stopDetection,
    getAllDetectedGestures,
    getAllHands,
    getFaceMeshResults,
    getDetectedFaces,
    getModelStatus
  };
}; 