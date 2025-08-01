import { useState, useEffect, useRef, useCallback } from 'react';

export const useSimplifiedTensorFlowDetection = () => {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [tfGestures, setTfGestures] = useState([]);
  const [tfHands, setTfHands] = useState([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('Initializing...');
  const [tfModelLoaded, setTfModelLoaded] = useState(false);
  const detectorRef = useRef(null);
  const tfModelRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Initialize MediaPipe and TensorFlow.js
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
                
                // Store hands for display
                const hands = results.multiHandLandmarks.map(landmarks => ({
                  keypoints: landmarks.map((landmark, index) => ({
                    x: landmark.x,
                    y: landmark.y,
                    z: landmark.z,
                    name: `landmark_${index}`
                  }))
                }));
                
                setTfHands(hands);
                
                // Process with TensorFlow detection
                if (tfModelLoaded) {
                  detectTFGestures(keypoints3D);
                }
              } else {
                setTfGestures([]);
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
        console.error('Error initializing detection:', error);
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

  // Initialize TensorFlow.js
  const initializeTensorFlow = async () => {
    try {
      // Wait for TensorFlow.js to load
      let attempts = 0;
      const maxAttempts = 100;
      
      while (attempts < maxAttempts) {
        if (typeof window !== 'undefined' && window.tf) {
          console.log('TensorFlow.js loaded successfully');
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      if (typeof window !== 'undefined' && window.tf) {
        setLoadingStatus('Creating TensorFlow model...');
        setTfModelLoaded(true);
        
        // Create a simple TensorFlow model for gesture detection
        await createSimpleTFModel();
        
        setLoadingStatus('Ready - TensorFlow detection active');
        console.log('Simplified TensorFlow detection initialized');
      } else {
        console.warn('TensorFlow.js not available');
        setLoadingStatus('Ready - MediaPipe only');
      }
    } catch (error) {
      console.error('Error initializing TensorFlow:', error);
      setLoadingStatus('Ready - MediaPipe only');
    }
  };

  // Create a simple TensorFlow model for gesture detection
  const createSimpleTFModel = async () => {
    try {
      const tf = window.tf;
      
      // Create a simple neural network for gesture classification
      const model = tf.sequential();
      
      // Input layer: 63 features (21 landmarks × 3 coordinates)
      model.add(tf.layers.dense({
        units: 64,
        activation: 'relu',
        inputShape: [63]
      }));
      
      model.add(tf.layers.dropout(0.2));
      
      model.add(tf.layers.dense({
        units: 32,
        activation: 'relu'
      }));
      
      model.add(tf.layers.dropout(0.2));
      
      // Output layer: 3 classes (thumbs_up, ok_sign, none)
      model.add(tf.layers.dense({
        units: 3,
        activation: 'softmax'
      }));
      
      // Compile the model
      model.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy']
      });
      
      tfModelRef.current = model;
      console.log('TensorFlow model created successfully');
      
    } catch (error) {
      console.error('Error creating TensorFlow model:', error);
    }
  };

  // TensorFlow-based gesture detection
  const detectTFGestures = useCallback(async (keypoints3D) => {
    try {
      if (!tfModelRef.current) return;

      const tf = window.tf;
      
      // Preprocess landmarks
      const input = tf.tensor2d([keypoints3D.flat()]);
      
      // Get prediction
      const prediction = await tfModelRef.current.predict(input).array();
      const [thumbsUp, okSign, none] = prediction[0];
      
      // Convert to gesture objects
      const gestures = [];
      if (thumbsUp > 0.6) {
        gestures.push({ 
          name: 'thumbs_up', 
          confidence: thumbsUp, 
          hand: { keypoints: keypoints3D },
          method: 'tensorflow'
        });
      }
      if (okSign > 0.6) {
        gestures.push({ 
          name: 'ok_sign', 
          confidence: okSign, 
          hand: { keypoints: keypoints3D },
          method: 'tensorflow'
        });
      }
      
      setTfGestures(gestures);
      
      // Clean up tensors
      input.dispose();
      
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
    setTfGestures([]);
    setTfHands([]);
  }, []);

  return {
    // TensorFlow detection
    tfGestures,
    tfHands,
    
    // Common state
    isModelLoaded,
    isDetecting,
    loadingStatus,
    tfModelLoaded,
    
    // Methods
    startDetection,
    stopDetection,
  };
}; 