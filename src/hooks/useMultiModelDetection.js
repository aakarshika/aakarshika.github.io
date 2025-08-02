import { useState, useEffect, useRef, useCallback } from 'react';
import { Hands } from '@mediapipe/hands';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Pose } from '@mediapipe/pose';
import { FaceDetection } from '@mediapipe/face_detection';
import { SelfieSegmentation } from '@mediapipe/selfie_segmentation';
import { Camera } from '@mediapipe/camera_utils';

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
    
    // Detection settings
    this.activeModels = {
      hands: true,
      faceMesh: true,
      pose: true,
      faceDetection: true,
      selfieSegmentation: false // Disabled by default for performance
    };
  }

  async initialize() {
    try {
      this.loadingStatus = 'Loading MediaPipe models...';
      
      // Initialize Hands
      if (this.activeModels.hands) {
        this.handsRef = new Hands({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });
        this.handsRef.setOptions({
          maxNumHands: 2,
          modelComplexity: 0,
          minDetectionConfidence: 0.6,
          minTrackingConfidence: 0.6
        });
        this.handsRef.onResults((results) => {
          this.handsResults = results;
          this.onDataUpdate();
        });
      }

      // Initialize Face Mesh
      if (this.activeModels.faceMesh) {
        this.faceMeshRef = new FaceMesh({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
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
      }

      // Initialize Pose
      if (this.activeModels.pose) {
        this.poseRef = new Pose({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
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
      }

      // Initialize Face Detection
      if (this.activeModels.faceDetection) {
        this.faceDetectionRef = new FaceDetection({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`
        });
        this.faceDetectionRef.setOptions({
          modelSelection: 0,
          minDetectionConfidence: 0.5
        });
        this.faceDetectionRef.onResults((results) => {
          this.faceDetectionResults = results;
          this.onDataUpdate();
        });
      }

      // Initialize Selfie Segmentation
      if (this.activeModels.selfieSegmentation) {
        this.selfieSegmentationRef = new SelfieSegmentation({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`
        });
        this.selfieSegmentationRef.setOptions({
          modelSelection: 1
        });
        this.selfieSegmentationRef.onResults((results) => {
          this.selfieSegmentationResults = results;
          this.onDataUpdate();
        });
      }

      this.isLoaded = true;
      this.loadingStatus = 'Ready';
      console.log('Multi-model detection initialized successfully');
    } catch (error) {
      console.error('Error initializing multi-model detection:', error);
      this.loadingStatus = `Error: ${error.message}`;
      this.isLoaded = false;
    }
  }

  async startDetection(videoElement) {
    if (!this.isLoaded || !videoElement || this.isDetecting) return;

    this.isDetecting = true;
    console.log('Starting multi-model detection...');

    try {
      // Initialize MediaPipe Camera utility
      this.cameraRef = new Camera(videoElement, {
        onFrame: async () => {
          if (!this.isDetecting) return;

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
              promises.push(this.selfieSegmentationRef.send({ image: videoElement }));
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
      await this.cameraRef.start();
      console.log('Multi-model detection started successfully');
      
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
        
        const model = new MultiModelDetection(() => setUpdateTrigger(prev => prev + 1));
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
    return modelRef.current?.getSelfieSegmentationResults() || null;
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
    
    // Raw model (for advanced usage)
    model: modelRef.current
  };
}; 