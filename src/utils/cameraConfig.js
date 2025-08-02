// Comprehensive Detection and Effects Configuration
export const CAMERA_CONFIG = {
  // Camera settings
  VIDEO_WIDTH: 640,
  VIDEO_HEIGHT: 480,
  IMAGE_QUALITY: 0.9,
  IMAGE_FORMAT: 'image/jpeg',
  
  // Detection settings
  DETECTION_CONFIDENCE_THRESHOLD: 0.85,
  DETECTION_REQUIRED_DETECTIONS_PER_SECOND: 5,
  DETECTION_REQUIRED_SUSTAINED_TIME: 1000, // 1 second
  DETECTION_MINIMUM_INTERVAL: 200, // 0.2s between detections
  DETECTION_INITIAL_DELAY: 2000, // 2 second delay after camera opens
  
  // Effect durations
  FIREWORKS_DURATION: 6000, // 6 seconds
};

// Detection Models Configuration
export const DETECTION_CONFIG = {
  // Hand Detection
  HANDS: {
    enabled: true,
    maxNumHands: 1,
    minDetectionConfidence: 0.1,
    minPresenceConfidence: 0.1,
    minTrackingConfidence: 0.1,
    
    // Hand Gestures and Effects
    gestures: {
      THUMBS_UP: {
        name: 'thumbs_up',
        confidence: 0.85,
        effects: [
          {
            type: 'FIREWORKS',
            duration: 6000, // 6 seconds
            delay: 0 // Start immediately
          },
          {
            type: 'COUNTDOWN_TIMER',
            duration: 2000, // 2 seconds countdown
            delay: 1000 // After 5 seconds (fireworks + buffer)
          },
          {
            type: 'CAPTURE',
            duration: 0, // Instant
            delay: 3000 // After 7 seconds (fireworks + countdown)
          },
          {
            type: 'CLOSE_CAMERA',
            duration: 0, // Instant
            delay: 6000 // After 7.5 seconds (fireworks + countdown + capture)
          }
        ]
      },
      
      OK_SIGN: {
        name: 'ok_sign',
        confidence: 0.85,
        effects: [
          {
            type: 'CONFETTI',
            duration: 4000,
            delay: 0
          },
          {
            type: 'READY_FOR_NEXT_GESTURE',
            duration: 0, // Instant
            delay: 4000 // After confetti completes
          }
        ]
      },
      
      PEACE_SIGN: {
        name: 'peace_sign',
        confidence: 0.85,
        effects: [
          {
            type: 'SPARKLES',
            duration: 3000,
            delay: 0
          },
          {
            type: 'READY_FOR_NEXT_GESTURE',
            duration: 0, // Instant
            delay: 3000 // After sparkles complete
          }
        ]
      }
    }
  },
  
  // Face Detection
  FACE: {
    enabled: true,
    maxNumFaces: 1,
    minDetectionConfidence: 0.5,
    refineLandmarks: true,
    
    // Face Expressions and Effects
    expressions: {
      SMILE: {
        name: 'smile',
        confidence: 0.85,
        effects: [
          {
            type: 'HEART_BURST',
            duration: 5000,
            delay: 0
          },
          {
            type: 'READY_FOR_NEXT_GESTURE',
            duration: 0, // Instant
            delay: 5000 // After heart burst completes
          }
        ]
      },
      
      WINK: {
        name: 'wink',
        confidence: 0.80,
        effects: [
          {
            type: 'STAR_BURST',
            duration: 4000,
            delay: 0
          },
          {
            type: 'READY_FOR_NEXT_GESTURE',
            duration: 0, // Instant
            delay: 4000 // After star burst completes
          }
        ]
      },
      
      SURPRISED: {
        name: 'surprised',
        confidence: 0.75,
        effects: [
          {
            type: 'SPARKLE_BURST',
            duration: 3500,
            delay: 0
          },
          {
            type: 'READY_FOR_NEXT_GESTURE',
            duration: 0, // Instant
            delay: 3500 // After sparkle burst completes
          }
        ]
      }
    }
  },
  
  // Pose Detection
  POSE: {
    enabled: true, // Enable pose detection
    maxNumPoses: 1,
    minDetectionConfidence: 0.5,
    
    // Pose Actions and Effects
    actions: {
      JUMP: {
        name: 'jump',
        confidence: 0.8,
        effects: [
          {
            type: 'BOUNCE_EFFECT',
            duration: 3000,
            delay: 0
          },
          {
            type: 'READY_FOR_NEXT_GESTURE',
            duration: 0, // Instant
            delay: 3000 // After bounce effect completes
          }
        ]
      },
      
      WAVE: {
        name: 'wave',
        confidence: 0.8,
        effects: [
          {
            type: 'WAVE_EFFECT',
            duration: 4000,
            delay: 0
          },
          {
            type: 'READY_FOR_NEXT_GESTURE',
            duration: 0, // Instant
            delay: 4000 // After wave effect completes
          }
        ]
      }
    }
  }
};

// Effect Types Configuration
export const EFFECT_TYPES = {
  FIREWORKS: {
    component: 'Fireworks',
    props: {
      duration: 6000,
      colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff']
    }
  },
  
  CONFETTI: {
    component: 'Confetti',
    props: {
      duration: 4000,
      colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57']
    }
  },
  
  SPARKLES: {
    component: 'Sparkles',
    props: {
      duration: 3000,
      color: '#ffd700'
    }
  },
  
  HEART_BURST: {
    component: 'HeartBurst',
    props: {
      duration: 5000,
      color: '#ff69b4'
    }
  },
  
  STAR_BURST: {
    component: 'StarBurst',
    props: {
      duration: 4000,
      color: '#ffd700'
    }
  },
  
  SPARKLE_BURST: {
    component: 'SparkleBurst',
    props: {
      duration: 3500,
      colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4']
    }
  },
  
  BOUNCE_EFFECT: {
    component: 'BounceEffect',
    props: {
      duration: 3000,
      intensity: 0.8
    }
  },
  
  WAVE_EFFECT: {
    component: 'WaveEffect',
    props: {
      duration: 4000,
      amplitude: 20
    }
  },
  
  COUNTDOWN_TIMER: {
    component: 'CountdownTimer',
    props: {
      duration: 2000, // Total countdown duration in ms
      countdownNumbers: [4, 3, 2, 1], // Numbers to count down from
      intervalMs: 500, // Time between each number
      flashDuration: 500, // Flash effect duration after countdown
      onComplete: 'CAPTURE' // What to do after countdown (CAPTURE, READY_FOR_NEXT_GESTURE, etc.)
    }
  },
  
  CAPTURE: {
    component: 'Capture',
    props: {
      duration: 0, // Instant
      quality: 0.9,
      format: 'image/jpeg'
    }
  },
  
  READY_FOR_NEXT_GESTURE: {
    component: 'ReadyForNextGesture',
    props: {
      duration: 0, // Instant
      message: 'Ready for next gesture!'
    }
  }
};

// Helper Functions
export const getDetectionConfig = (modelType) => {
  return DETECTION_CONFIG[modelType.toUpperCase()] || null;
};

export const getGestureConfig = (modelType, gestureName) => {
  const modelConfig = getDetectionConfig(modelType);
  if (!modelConfig) return null;
  
  const gesturesKey = modelType === 'HANDS' ? 'gestures' : 
                     modelType === 'FACE' ? 'expressions' : 'actions';
  return modelConfig[gesturesKey]?.[gestureName.toUpperCase()] || null;
};

export const getEffectConfig = (effectType) => {
  return EFFECT_TYPES[effectType.toUpperCase()] || null;
};

// 3D Positioning Analysis Functions
export const analyzePose3DPosition = (poseLandmarks) => {
  if (!poseLandmarks || poseLandmarks.length === 0) return null;
  
  const landmarks = poseLandmarks[0];
  
  // Calculate average depth
  const avgDepth = landmarks.reduce((sum, landmark) => sum + landmark.z, 0) / landmarks.length;
  
  // Analyze body parts for front/back positioning
  const nose = landmarks[0]; // Nose landmark
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  
  // Determine if person is facing camera (front) or away (back)
  const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);
  const hipWidth = Math.abs(leftHip.x - rightHip.x);
  const isFacingCamera = shoulderWidth > hipWidth * 0.8; // Shoulders wider than hips when facing camera
  
  // Calculate position in screen space
  const centerX = (leftShoulder.x + rightShoulder.x) / 2;
  const centerY = (leftShoulder.y + rightShoulder.y) / 2;
  
  // Determine screen position
  let screenPosition = 'center';
  if (centerX < 0.3) screenPosition = 'left';
  else if (centerX > 0.7) screenPosition = 'right';
  
  let verticalPosition = 'center';
  if (centerY < 0.3) verticalPosition = 'top';
  else if (centerY > 0.7) verticalPosition = 'bottom';
  
  return {
    depth: avgDepth,
    depthStatus: avgDepth < -0.3 ? 'Close' : avgDepth < 0 ? 'Medium' : 'Far',
    isFacingCamera,
    orientation: isFacingCamera ? 'Front' : 'Back',
    screenPosition: `${screenPosition}-${verticalPosition}`,
    centerX,
    centerY,
    shoulderWidth,
    hipWidth
  };
};

export const getPoseLandmarkNames = () => {
  return [
    'nose', 'left_eye_inner', 'left_eye', 'left_eye_outer', 'right_eye_inner', 'right_eye', 'right_eye_outer',
    'left_ear', 'right_ear', 'mouth_left', 'mouth_right', 'left_shoulder', 'right_shoulder',
    'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist', 'left_pinky', 'right_pinky',
    'left_index', 'right_index', 'left_thumb', 'right_thumb', 'left_hip', 'right_hip',
    'left_knee', 'right_knee', 'left_ankle', 'right_ankle', 'left_heel', 'right_heel',
    'left_foot_index', 'right_foot_index'
  ];
};

// Legacy compatibility (for existing code)
export const getFireworksDurationSeconds = () => {
  const thumbsUpConfig = getGestureConfig('HANDS', 'THUMBS_UP');
  const fireworksEffect = thumbsUpConfig?.effects?.find(e => e.type === 'FIREWORKS');
  return (fireworksEffect?.duration || 6000) / 1000;
};

export const getCaptureDelaySeconds = () => {
  const thumbsUpConfig = getGestureConfig('HANDS', 'THUMBS_UP');
  const captureEffect = thumbsUpConfig?.effects?.find(e => e.type === 'CAPTURE');
  return (captureEffect?.delay || 5000) / 1000;
}; 