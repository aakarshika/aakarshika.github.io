import { useState, useEffect, useRef, useCallback } from 'react';
import { FilesetResolver, FaceLandmarker, PoseLandmarker, FaceDetector } from '@mediapipe/tasks-vision';

// Additional models detection system (separate from hands)
class AdditionalModelsDetection {
  constructor(onDataUpdate) {
    this.isLoaded = false;
    this.isDetecting = false;
    this.loadingStatus = 'Initializing...';
    this.onDataUpdate = onDataUpdate;
    
    // Model references
    this.faceMeshRef = null;
    this.poseRef = null;
    this.faceDetectionRef = null;
    
    // Results storage
    this.faceMeshResults = null;
    this.poseResults = null;
    this.faceDetectionResults = null;
    
    // Detection settings
    this.activeModels = {
      faceMesh: true,
      pose: true,
      faceDetection: true
    };
  }

  async initialize() {
    try {
      this.loadingStatus = 'Loading MediaPipe Tasks Vision...';
      
      // Initialize MediaPipe Tasks Vision
      const vision = await FilesetResolver.forVisionTasks(
        "/mediapipe"
      );
      
      this.loadingStatus = 'Initializing Face Landmarker...';
      
      // Initialize Face Landmarker (Face Mesh)
      if (this.activeModels.faceMesh) {
        this.faceMeshRef = await FaceLandmarker.createFromModelPath(vision, "/mediapipe/face_landmarker.task");
      }

      this.loadingStatus = 'Initializing Pose Landmarker...';
      
      // Initialize Pose Landmarker
      if (this.activeModels.pose) {
        this.poseRef = await PoseLandmarker.createFromModelPath(vision, "/mediapipe/pose_landmarker_lite.task");
      }

      this.loadingStatus = 'Initializing Face Detector...';
      
      // Initialize Face Detector
      if (this.activeModels.faceDetection) {
        this.faceDetectionRef = await FaceDetector.createFromModelPath(vision, "/mediapipe/blaze_face_short_range.tflite");
      }

      this.isLoaded = true;
      this.loadingStatus = 'Ready';
      console.log('Additional models initialized successfully');
    } catch (error) {
      console.error('Error initializing additional models:', error);
      this.loadingStatus = `Error: ${error.message}`;
      this.isLoaded = false;
    }
  }

  async processFrame(videoElement) {
    if (!this.isLoaded || !videoElement) return;

    // Check if video element is properly loaded and has valid dimensions
    if (!videoElement.videoWidth || !videoElement.videoHeight || 
        videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
      return; // Skip processing if video dimensions are invalid
    }

    // Check if video is ready to play
    if (videoElement.readyState < 2) { // HAVE_CURRENT_DATA
      return; // Skip processing if video isn't ready
    }

    try {
      // Process Face Landmarker
      if (this.faceMeshRef) {
        const faceResults = this.faceMeshRef.detect(videoElement);
        this.faceMeshResults = faceResults;
        if (faceResults.faceLandmarks && faceResults.faceLandmarks.length > 0) {
          console.log('😊 Face mesh detected:', faceResults.faceLandmarks.length, 'face(s)');
        }
      }
      
      // Process Pose Landmarker
      if (this.poseRef) {
        const poseResults = this.poseRef.detect(videoElement);
        this.poseResults = poseResults;
        if (poseResults.poseLandmarks && poseResults.poseLandmarks.length > 0) {
          console.log('🧍 Pose detected');
        }
      }
      
      // Process Face Detector
      if (this.faceDetectionRef) {
        const faceDetectionResults = this.faceDetectionRef.detect(videoElement);
        this.faceDetectionResults = faceDetectionResults;
        if (faceDetectionResults.detections && faceDetectionResults.detections.length > 0) {
          console.log('👤 Face detection:', faceDetectionResults.detections.length, 'face(s)');
        }
      }
      
      // Trigger re-render
      this.onDataUpdate();
    } catch (error) {
      console.error('Additional models frame processing error:', error);
    }
  }

  cleanup() {
    // Clean up all models
    const models = [
      { ref: this.faceMeshRef, name: 'FaceMesh' },
      { ref: this.poseRef, name: 'Pose' },
      { ref: this.faceDetectionRef, name: 'FaceDetection' }
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
  getFaceMeshResults() { return this.faceMeshResults; }
  getPoseResults() { return this.poseResults; }
  getFaceDetectionResults() { return this.faceDetectionResults; }

  // Toggle model activation
  toggleModel(modelName) {
    if (this.activeModels.hasOwnProperty(modelName)) {
      this.activeModels[modelName] = !this.activeModels[modelName];
      console.log(`${modelName} model ${this.activeModels[modelName] ? 'enabled' : 'disabled'}`);
    }
  }
}

// Hook for additional models
export const useAdditionalModels = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('Initializing...');
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const modelRef = useRef(null);

  // Initialize the additional models
  useEffect(() => {
    let isMounted = true;
    
    const initializeModels = async () => {
      try {
        setLoadingStatus('Creating additional models...');
        
        const model = new AdditionalModelsDetection(() => setUpdateTrigger(prev => prev + 1));
        modelRef.current = model;
        
        setLoadingStatus('Initializing models...');
        await model.initialize();
        
        if (isMounted) {
          setIsInitialized(model.isLoaded);
          setLoadingStatus(model.loadingStatus);
          
          if (model.isLoaded) {
            console.log('Additional models initialized successfully');
          }
        }
        
      } catch (error) {
        console.error('Error initializing additional models:', error);
        if (isMounted) {
          setLoadingStatus(`Error: ${error.message}`);
          setIsInitialized(false);
        }
      }
    };

    initializeModels();

    return () => {
      isMounted = false;
      if (modelRef.current) {
        modelRef.current.cleanup();
      }
    };
  }, []);

  // Process frame (called from main detection system)
  const processFrame = useCallback((videoElement) => {
    if (modelRef.current) {
      modelRef.current.processFrame(videoElement);
    }
  }, []);

  // Get results
  const getFaceMeshResults = useCallback(() => {
    return modelRef.current?.getFaceMeshResults() || null;
  }, [updateTrigger]);

  const getPoseResults = useCallback(() => {
    return modelRef.current?.getPoseResults() || null;
  }, [updateTrigger]);

  const getFaceDetectionResults = useCallback(() => {
    return modelRef.current?.getFaceDetectionResults() || null;
  }, [updateTrigger]);

  // Toggle models
  const toggleModel = useCallback((modelName) => {
    modelRef.current?.toggleModel(modelName);
  }, []);

  return {
    // State
    isInitialized,
    loadingStatus,
    
    // Methods
    processFrame,
    toggleModel,
    
    // Results
    getFaceMeshResults,
    getPoseResults,
    getFaceDetectionResults,
    
    // Raw model (for advanced usage)
    model: modelRef.current
  };
}; 