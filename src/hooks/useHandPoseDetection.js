import { useState, useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as handpose from '@tensorflow-models/hand-pose-detection';
import { Fingerpose } from 'fingerpose';

export const useHandPoseDetection = () => {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [detectedGestures, setDetectedGestures] = useState([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const detectorRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Initialize TensorFlow.js and load the hand pose model
  useEffect(() => {
    const initializeModel = async () => {
      try {
        // Initialize TensorFlow.js backend
        await tf.ready();
        console.log('TensorFlow.js initialized');

        // Load hand pose detection model
        const model = handpose.SupportedModels.MediaPipeHands;
        const detectorConfig = {
          runtime: 'tfjs',
          modelType: 'full',
          maxHands: 2,
        };

        detectorRef.current = await handpose.createDetector(model, detectorConfig);
        setIsModelLoaded(true);
        console.log('Hand pose model loaded successfully');
      } catch (error) {
        console.error('Error loading hand pose model:', error);
      }
    };

    initializeModel();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Define custom gestures using Fingerpose
  const createCustomGestures = () => {
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
    okGesture.addCurl(Fingerpose.Finger.Thumb, Fingerpose.FingerCurl.HalfCurl, 1.0);
    okGesture.addCurl(Fingerpose.Finger.Index, Fingerpose.FingerCurl.HalfCurl, 1.0);
    okGesture.addCurl(Fingerpose.Finger.Middle, Fingerpose.FingerCurl.NoCurl, 1.0);
    okGesture.addCurl(Fingerpose.Finger.Ring, Fingerpose.FingerCurl.NoCurl, 1.0);
    okGesture.addCurl(Fingerpose.Finger.Pinky, Fingerpose.FingerCurl.NoCurl, 1.0);

    return [thumbsUpGesture, peaceSignGesture, okGesture];
  };

  // Detect hand poses from video element
  const detectHandPoses = async (videoElement) => {
    if (!detectorRef.current || !videoElement) return;

    try {
      const hands = await detectorRef.current.estimateHands(videoElement);
      
      if (hands.length > 0) {
        const gestures = createCustomGestures();
        const ge = new Fingerpose.GestureEstimator(gestures);
        
        const results = [];
        for (const hand of hands) {
          const gesture = await ge.estimate(hand.keypoints3D, 9);
          if (gesture.gestures.length > 0) {
            const confidence = gesture.gestures[0].confidence;
            const name = gesture.gestures[0].name;
            if (confidence > 0.7) {
              results.push({ name, confidence, hand });
            }
          }
        }
        
        setDetectedGestures(results);
      } else {
        setDetectedGestures([]);
      }
    } catch (error) {
      console.error('Error detecting hand poses:', error);
    }
  };

  // Start continuous detection
  const startDetection = (videoElement) => {
    if (!isModelLoaded || !videoElement) return;

    setIsDetecting(true);
    const detectFrame = async () => {
      await detectHandPoses(videoElement);
      animationFrameRef.current = requestAnimationFrame(detectFrame);
    };
    detectFrame();
  };

  // Stop detection
  const stopDetection = () => {
    setIsDetecting(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setDetectedGestures([]);
  };

  return {
    isModelLoaded,
    isDetecting,
    detectedGestures,
    startDetection,
    stopDetection,
    detectHandPoses,
  };
}; 