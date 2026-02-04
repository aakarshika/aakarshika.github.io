import { useState, useEffect, useRef, useCallback } from 'react';

// Use globally available MediaPipe libraries from CDN
const Hands = window.Hands;
const FaceMesh = window.FaceMesh;
const Pose = window.Pose;
const FaceDetection = window.FaceDetection;
const SelfieSegmentation = window.SelfieSegmentation;
const Camera = window.Camera;

// Multi-model detection system
class MultiModelDetection {
  constructor(onDataUpdate) {
    this.name = 'MultiModel';
    this.isLoaded = false;
    this.isDetecting = false;
    this.loadingStatus = 'Initializing...';
    this.onDataUpdate = onDataUpdate;
    
    // Model references
    this.handsRef = null;
    this.faceMeshRef = null;
    this.poseRef = null;
    this.faceDetectionRef = null;
    this.selfieSegmentationRef = null;
    this.cameraRef = null;
    
    // Results storage
    this.handsResults = null;
    this.faceMeshResults = null;
    this.poseResults = null;
    this.faceDetectionResults = null;
    this.selfieSegmentationResults = null;
    
    // Frame counters for debugging
    this.frameCount = 0;
    this.selfieSegmentationFrameCount = 0;
    this.selfieSegmentationResultCount = 0;
    
    // Detection settings
    this.activeModels = {
      hands: true,
      faceMesh: true,
      pose: true,
      faceDetection: true,
      selfieSegmentation: true
    };
  }

  async initialize() {
    try {
      this.loadingStatus = 'Loading models...';
      
      console.log('=== MultiModelDetection: Starting initialization ===');
      console.log('Initial MediaPipe library availability:', {
        Hands: typeof Hands,
        FaceMesh: typeof FaceMesh,
        Pose: typeof Pose,
        FaceDetection: typeof FaceDetection,
        SelfieSegmentation: typeof SelfieSegmentation,
        Camera: typeof Camera
      });
      
      // Wait for MediaPipe libraries to be loaded from CDN
      let attempts = 0;
      const maxAttempts = 100; // Wait up to 10 seconds
      
      while (attempts < maxAttempts) {
        if (typeof window.Hands !== 'undefined' && 
            typeof window.FaceMesh !== 'undefined' && 
            typeof window.Pose !== 'undefined' && 
            typeof window.FaceDetection !== 'undefined' && 
            typeof window.SelfieSegmentation !== 'undefined' &&
            typeof window.Camera !== 'undefined') {
          console.log('✅ All MediaPipe libraries loaded from CDN after', attempts * 100, 'ms');
          break;
        }
        
        if (attempts % 10 === 0) { // Log every second
          console.log('⏳ Waiting for MediaPipe libraries to load...', attempts + 1, '/', maxAttempts);
          console.log('Current library status:', {
            Hands: typeof window.Hands,
            FaceMesh: typeof window.FaceMesh,
            Pose: typeof window.Pose,
            FaceDetection: typeof window.FaceDetection,
            SelfieSegmentation: typeof window.SelfieSegmentation,
            Camera: typeof window.Camera
          });
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      // Check if MediaPipe libraries are available
      const availableLibraries = {
        Hands: typeof window.Hands,
        FaceMesh: typeof window.FaceMesh,
        Pose: typeof window.Pose,
        FaceDetection: typeof window.FaceDetection,
        SelfieSegmentation: typeof window.SelfieSegmentation,
        Camera: typeof window.Camera
      };
      
      console.log('📊 Final MediaPipe libraries status:', availableLibraries);
      
      // Log library sources if available
      Object.entries(availableLibraries).forEach(([name, type]) => {
        if (type !== 'undefined') {
          console.log(`✅ ${name}: Available (${type})`);
          // Try to get constructor info
          try {
            const constructor = window[name];
            if (constructor && constructor.name) {
              console.log(`   📦 ${name} constructor: ${constructor.name}`);
            }
          } catch (e) {
            console.log(`   ⚠️ Could not inspect ${name} constructor`);
          }
        } else {
          console.log(`❌ ${name}: Not available`);
        }
      });
      
      // Check if we have at least the essential libraries
      if (typeof window.Camera === 'undefined') {
        console.error('❌ Camera utility is required but not loaded');
        throw new Error('MediaPipe Camera utility not loaded. Please check your CDN imports.');
      }
      
      if (typeof window.SelfieSegmentation === 'undefined') {
        console.error('❌ SelfieSegmentation is required but not loaded');
        throw new Error('SelfieSegmentation library not loaded');
      }
      
      // Disable models that are not available
      if (typeof window.Hands === 'undefined') {
        console.warn('⚠️ Hands library not loaded, disabling hands detection');
        this.activeModels.hands = false;
      }
      
      if (typeof window.FaceMesh === 'undefined') {
        console.warn('⚠️ FaceMesh library not loaded, disabling face mesh detection');
        this.activeModels.faceMesh = false;
      }
      
      if (typeof window.Pose === 'undefined') {
        console.warn('⚠️ Pose library not loaded, disabling pose detection');
        this.activeModels.pose = false;
      }
      
      if (typeof window.FaceDetection === 'undefined') {
        console.warn('⚠️ FaceDetection library not loaded, disabling face detection');
        this.activeModels.faceDetection = false;
      }
      
      console.log('🎯 Active models after library check:', this.activeModels);
      
      // Helper function to get asset path
      const getAssetPath = (modelName, file) => {
        console.log(`🔍 getAssetPath called with modelName: "${modelName}", file: "${file}"`);
        
        // Check if we have local assets for this model
        const localAssets = {
          'hands': ['hand_landmarker.task'],
          'face_mesh': ['face_landmarker.task'],
          'pose': ['pose_landmarker_lite.task'],
          'face_detection': ['blaze_face_short_range.tflite']
        };
        
        if (localAssets[modelName] && localAssets[modelName].includes(file)) {
          console.log(`📁 Using local asset for ${modelName}: ${file}`);
          return `/mediapipe/${file}`;
        }
        
        // Use correct CDN paths for each MediaPipe model
        const cdnPaths = {
          'hands': 'https://cdn.jsdelivr.net/npm/@mediapipe/hands',
          'face_mesh': 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh',
          'pose': 'https://cdn.jsdelivr.net/npm/@mediapipe/pose',
          'face_detection': 'https://cdn.jsdelivr.net/npm/@mediapipe/face_detection',
          'selfie_segmentation': 'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation'
        };
        
        const baseUrl = cdnPaths[modelName] || `https://cdn.jsdelivr.net/npm/@mediapipe/${modelName}`;
        const cdnUrl = `${baseUrl}/${file}`;
        
        // Log with error handling
        console.log(`🌐 Using CDN asset for ${modelName}: ${cdnUrl}`);
        
        // Add error handling for asset loading
        if (file.includes('.wasm') || file.includes('.data')) {
          console.warn(`⚠️ Loading large asset: ${file} from ${cdnUrl}`);
        }
        
        // Return the CDN URL - MediaPipe will handle the actual loading
        return cdnUrl;
      };
      
      // Initialize Hands
      if (this.activeModels.hands) {
        try {
          console.log('🔧 Initializing Hands model...');
          this.handsRef = new window.Hands({
            locateFile: (file) => getAssetPath('hands', file)
          });
          this.handsRef.setOptions({
            maxNumHands: 2,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
          });
          this.handsRef.onResults((results) => {
            this.handsResults = results;
            this.onDataUpdate();
          });
          console.log('✅ Hands model initialized successfully');
        } catch (error) {
          console.error('❌ Failed to initialize Hands model:', error);
          this.activeModels.hands = false;
        }
      }

      // Initialize Face Mesh
      if (this.activeModels.faceMesh) {
        try {
          console.log('🔧 Initializing Face Mesh model...');
          this.faceMeshRef = new window.FaceMesh({
            locateFile: (file) => getAssetPath('face_mesh', file)
          });
          this.faceMeshRef.setOptions({
            maxNumFaces: 1,
            refineLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
          });
          this.faceMeshRef.onResults((results) => {
            this.faceMeshResults = results;
            this.onDataUpdate();
          });
          console.log('✅ Face Mesh model initialized successfully');
        } catch (error) {
          console.error('❌ Failed to initialize Face Mesh model:', error);
          this.activeModels.faceMesh = false;
        }
      }

      // Initialize Pose
      if (this.activeModels.pose) {
        try {
          console.log('🔧 Initializing Pose model...');
          this.poseRef = new window.Pose({
            locateFile: (file) => getAssetPath('pose', file)
          });
          this.poseRef.setOptions({
            modelComplexity: 0,
            smoothLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
          });
          this.poseRef.onResults((results) => {
            this.poseResults = results;
            this.onDataUpdate();
          });
          console.log('✅ Pose model initialized successfully');
        } catch (error) {
          console.error('❌ Failed to initialize Pose model:', error);
          this.activeModels.pose = false;
        }
      }

      // Initialize Face Detection
      if (this.activeModels.faceDetection) {
        try {
          console.log('🔧 Initializing Face Detection model...');
          this.faceDetectionRef = new window.FaceDetection({
            locateFile: (file) => getAssetPath('face_detection', file)
          });
          this.faceDetectionRef.setOptions({
            modelSelection: 0,
            minDetectionConfidence: 0.5
          });
          this.faceDetectionRef.onResults((results) => {
            this.faceDetectionResults = results;
            this.onDataUpdate();
          });
          console.log('✅ Face Detection model initialized successfully');
        } catch (error) {
          console.error('❌ Failed to initialize Face Detection model:', error);
          this.activeModels.faceDetection = false;
        }
      }

      // Initialize Selfie Segmentation using the correct MediaPipe API
      if (this.activeModels.selfieSegmentation) {
        try {
          console.log('🔧 Initializing Selfie Segmentation model...');
          console.log('SelfieSegmentation constructor available:', typeof window.SelfieSegmentation);
          
          this.selfieSegmentationRef = new window.SelfieSegmentation({
            locateFile: (file) => getAssetPath('selfie_segmentation', file)
          });
          
          console.log('✅ SelfieSegmentation instance created:', this.selfieSegmentationRef);
          
          this.selfieSegmentationRef.setOptions({
            modelSelection: 1, // Use landscape model for better performance
          });
          
          console.log('✅ SelfieSegmentation options set');
          
          // Set up the results callback
          this.selfieSegmentationRef.onResults((results) => {
            this.selfieSegmentationResultCount++;
            console.log('📊 Selfie Segmentation results received:', {
              resultCount: this.selfieSegmentationResultCount,
              frameCount: this.selfieSegmentationFrameCount,
              hasResults: !!results,
              hasSegmentationMask: !!(results?.segmentationMask),
              hasImage: !!(results?.image),
              timestamp: Date.now()
            });
            
            // Create a new object reference to ensure React detects the change
            if (results) {
              this.selfieSegmentationResults = {
                segmentationMask: results.segmentationMask,
                image: results.image,
                timestamp: Date.now(),
                _updateTrigger: Math.random() // Force React to see this as a new object
              };
            } else {
              this.selfieSegmentationResults = null;
            }
            this.onDataUpdate(); // Trigger re-render
          });
          
          console.log('✅ SelfieSegmentation onResults callback set');
          console.log('✅ Selfie Segmentation model initialized successfully');
        } catch (error) {
          console.error('❌ Error initializing Selfie Segmentation:', error);
          console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
          });
          console.log('⚠️ Disabling selfie segmentation due to initialization failure');
          this.activeModels.selfieSegmentation = false;
          this.selfieSegmentationRef = null;
        }
      } else {
        console.log('⚠️ Selfie Segmentation is disabled in active models');
      }

      this.isLoaded = true;
      this.loadingStatus = 'Ready';
      console.log('🎉 Multi-model detection initialized successfully');
      console.log('📊 Final model status:', {
        isLoaded: this.isLoaded,
        activeModels: this.activeModels,
        modelsInitialized: {
          hands: !!this.handsRef,
          faceMesh: !!this.faceMeshRef,
          pose: !!this.poseRef,
          faceDetection: !!this.faceDetectionRef,
          selfieSegmentation: !!this.selfieSegmentationRef
        }
      });
    } catch (error) {
      console.error('❌ Error initializing multi-model detection:', error);
      this.loadingStatus = `Error: ${error.message}`;
      this.isLoaded = false;
    }
  }

  async startDetection(videoElement) {
    if (!this.isLoaded || !videoElement || this.isDetecting) return;

    this.isDetecting = true;
    console.log('=== Starting multi-model detection ===');
    console.log('Video element initial state:', {
      readyState: videoElement.readyState,
      videoWidth: videoElement.videoWidth,
      videoHeight: videoElement.videoHeight,
      currentTime: videoElement.currentTime
    });

    // Wait for video element to be ready
    let videoReadyAttempts = 0;
    const maxVideoReadyAttempts = 100; // Wait up to 10 seconds
    
    while (videoReadyAttempts < maxVideoReadyAttempts) {
      if (videoElement.readyState >= 2 && videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
        console.log('Video element ready after', videoReadyAttempts * 100, 'ms');
        console.log('Video element ready state:', {
          readyState: videoElement.readyState,
          videoWidth: videoElement.videoWidth,
          videoHeight: videoElement.videoHeight,
          currentTime: videoElement.currentTime
        });
        break;
      }
      
      if (videoReadyAttempts % 10 === 0) { // Log every second
        console.log('Waiting for video element to be ready...', videoReadyAttempts + 1, '/', maxVideoReadyAttempts);
        console.log('Current video state:', {
          readyState: videoElement.readyState,
          videoWidth: videoElement.videoWidth,
          videoHeight: videoElement.videoHeight,
          currentTime: videoElement.currentTime
        });
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
      videoReadyAttempts++;
    }
    
    if (videoElement.readyState < 2 || videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
      console.error('Video element not ready after waiting');
      this.isDetecting = false;
      return;
    }

    try {
      // Initialize MediaPipe Camera utility
      this.cameraRef = new window.Camera(videoElement, {
        onFrame: async () => {
          if (!this.isDetecting) return;

          this.frameCount++;
          if (this.frameCount % 30 === 0) { // Log every 30 frames
            console.log('MediaPipe Camera onFrame called:', {
              frameCount: this.frameCount,
              isDetecting: this.isDetecting,
              timestamp: Date.now()
            });
          }

          try {
            // Process all active models
            const promises = [];
            
            if (this.handsRef) {
              promises.push(this.handsRef.send({ image: videoElement }));
            }
            if (this.faceMeshRef) {
              promises.push(this.faceMeshRef.send({ image: videoElement }));
            }
            if (this.poseRef) {
              promises.push(this.poseRef.send({ image: videoElement }));
            }
            if (this.faceDetectionRef) {
              promises.push(this.faceDetectionRef.send({ image: videoElement }));
            }
            if (this.selfieSegmentationRef) {
              // SelfieSegmentation uses send method like other MediaPipe models
              try {
                this.selfieSegmentationFrameCount++;
                if (this.selfieSegmentationFrameCount % 30 === 0) { // Log every 30 frames (about once per second)
                  console.log('Sending frame to SelfieSegmentation...', {
                    hasVideoElement: !!videoElement,
                    videoElementReady: videoElement.readyState >= 2,
                    videoElementWidth: videoElement.videoWidth,
                    videoElementHeight: videoElement.videoHeight,
                    timestamp: Date.now(),
                    frameCount: this.selfieSegmentationFrameCount,
                    resultCount: this.selfieSegmentationResultCount
                  });
                }
                promises.push(this.selfieSegmentationRef.send({ image: videoElement }));
              } catch (error) {
                console.error('Error sending frame to SelfieSegmentation:', error);
                console.error('Error details:', {
                  name: error.name,
                  message: error.message,
                  stack: error.stack
                });
              }
            } else {
              console.log('SelfieSegmentation ref is null, skipping frame send');
            }

            // Wait for all models to process
            await Promise.all(promises);
          } catch (error) {
            console.error('Detection frame error:', error);
            this.stopDetection();
            return;
          }
        },
        width: 384,
        height: 384
      });

      // Start the camera
      console.log('Starting MediaPipe Camera...');
      try {
        await this.cameraRef.start();
        console.log('MediaPipe Camera started successfully');
        console.log('=== Multi-model detection started successfully ===');
      } catch (cameraError) {
        console.error('Error starting MediaPipe Camera:', cameraError);
        console.error('Camera error details:', {
          name: cameraError.name,
          message: cameraError.message,
          stack: cameraError.stack
        });
        throw cameraError;
      }
      
    } catch (error) {
      console.error('Error starting multi-model detection:', error);
      this.stopDetection();
    }
  }

  stopDetection() {
    this.isDetecting = false;
    
    if (this.cameraRef) {
      try {
        this.cameraRef.stop();
        console.log('Multi-model detection stopped');
      } catch (error) {
        console.error('Error stopping detection:', error);
      }
    }
  }

  cleanup() {
    this.stopDetection();
    
    // Clean up all models
    const models = [
      { ref: this.handsRef, name: 'Hands' },
      { ref: this.faceMeshRef, name: 'FaceMesh' },
      { ref: this.poseRef, name: 'Pose' },
      { ref: this.faceDetectionRef, name: 'FaceDetection' },
      { ref: this.selfieSegmentationRef, name: 'SelfieSegmentation' }
    ];

    models.forEach(({ ref, name }) => {
      if (ref) {
        try {
          ref.close();
          console.log(`${name} model closed`);
        } catch (error) {
          console.error(`Error closing ${name} model:`, error);
        }
      }
    });
  }

  // Getter methods for results
  getHandsResults() { return this.handsResults; }
  getFaceMeshResults() { return this.faceMeshResults; }
  getPoseResults() { return this.poseResults; }
  getFaceDetectionResults() { return this.faceDetectionResults; }
  getSelfieSegmentationResults() { return this.selfieSegmentationResults; }
  
  // Check if models are available
  isSelfieSegmentationAvailable() { return this.activeModels.selfieSegmentation && this.selfieSegmentationRef; }
  isPoseAvailable() { return this.activeModels.pose && this.poseRef; }
  isHandsAvailable() { return this.activeModels.hands && this.handsRef; }
  isFaceMeshAvailable() { return this.activeModels.faceMesh && this.faceMeshRef; }
  isFaceDetectionAvailable() { return this.activeModels.faceDetection && this.faceDetectionRef; }

  // Toggle model activation
  toggleModel(modelName) {
    if (this.activeModels.hasOwnProperty(modelName)) {
      this.activeModels[modelName] = !this.activeModels[modelName];
      console.log(`${modelName} model ${this.activeModels[modelName] ? 'enabled' : 'disabled'}`);
    }
  }
}

// Main hook for multi-model detection
export const useMultiModelDetection = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('Initializing...');
  const [isDetecting, setIsDetecting] = useState(false);
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const modelRef = useRef(null);

  // Initialize the multi-model detection
  useEffect(() => {
    let isMounted = true;
    
    const initializeDetection = async () => {
      try {
        setLoadingStatus('Creating multi-model detection...');
        
        const model = new MultiModelDetection(() => {
          console.log('onDataUpdate callback triggered, incrementing updateTrigger');
          setUpdateTrigger(prev => {
            const newValue = prev + 1;
            console.log('updateTrigger changed from', prev, 'to', newValue);
            return newValue;
          });
        });
        modelRef.current = model;
        
        setLoadingStatus('Initializing models...');
        await model.initialize();
        
        if (isMounted) {
          setIsInitialized(model.isLoaded);
          setLoadingStatus(model.loadingStatus);
          
          if (model.isLoaded) {
            console.log('Multi-model detection initialized successfully');
          }
        }
        
      } catch (error) {
        console.error('Error initializing multi-model detection:', error);
        if (isMounted) {
          setLoadingStatus(`Error: ${error.message}`);
          setIsInitialized(false);
        }
      }
    };

    initializeDetection();

    return () => {
      isMounted = false;
      if (modelRef.current) {
        modelRef.current.cleanup();
      }
    };
  }, []);

  // Start detection
  const startDetection = useCallback((videoElement) => {
    if (!isInitialized || !videoElement || !modelRef.current) return;

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

  // Get results
  const getHandsResults = useCallback(() => {
    return modelRef.current?.getHandsResults() || null;
  }, [updateTrigger]);

  const getFaceMeshResults = useCallback(() => {
    return modelRef.current?.getFaceMeshResults() || null;
  }, [updateTrigger]);

  const getPoseResults = useCallback(() => {
    return modelRef.current?.getPoseResults() || null;
  }, [updateTrigger]);

  const getFaceDetectionResults = useCallback(() => {
    return modelRef.current?.getFaceDetectionResults() || null;
  }, [updateTrigger]);

  const getSelfieSegmentationResults = useCallback(() => {
    const results = modelRef.current?.getSelfieSegmentationResults() || null;
    // console.log('getSelfieSegmentationResults called, returning:', {
    //   hasResults: !!results,
    //   timestamp: results?.timestamp,
    //   updateTrigger: updateTrigger
    // });
    return results;
  }, [updateTrigger]);

  // Check model availability
  const isSelfieSegmentationAvailable = useCallback(() => {
    return modelRef.current?.isSelfieSegmentationAvailable() || false;
  }, [updateTrigger]);

  const isPoseAvailable = useCallback(() => {
    return modelRef.current?.isPoseAvailable() || false;
  }, [updateTrigger]);

  const isHandsAvailable = useCallback(() => {
    return modelRef.current?.isHandsAvailable() || false;
  }, [updateTrigger]);

  const isFaceMeshAvailable = useCallback(() => {
    return modelRef.current?.isFaceMeshAvailable() || false;
  }, [updateTrigger]);

  const isFaceDetectionAvailable = useCallback(() => {
    return modelRef.current?.isFaceDetectionAvailable() || false;
  }, [updateTrigger]);

  // Toggle models
  const toggleModel = useCallback((modelName) => {
    modelRef.current?.toggleModel(modelName);
  }, []);

  return {
    // State
    isInitialized,
    isDetecting,
    loadingStatus,
    
    // Methods
    startDetection,
    stopDetection,
    toggleModel,
    
    // Results
    getHandsResults,
    getFaceMeshResults,
    getPoseResults,
    getFaceDetectionResults,
    getSelfieSegmentationResults,
    
    // Model Availability
    isSelfieSegmentationAvailable,
    isPoseAvailable,
    isHandsAvailable,
    isFaceMeshAvailable,
    isFaceDetectionAvailable,
    
    // Raw model (for advanced usage)
    model: modelRef.current
  };
}; 