// Camera and Fireworks Configuration
export const CAMERA_CONFIG = {
  // Fireworks settings
  FIREWORKS_DURATION: 6000, // 10 seconds in milliseconds
  FIREWORKS_CAPTURE_DELAY: 5000, // Delay after fireworks before closing camera (ms)
  
  // Gesture detection settings
  GESTURE_COOLDOWN_PERIOD: 3000, // 3 seconds cooldown between captures
  GESTURE_CONFIDENCE_THRESHOLD: 0.85, // Minimum confidence for gesture detection
  GESTURE_REQUIRED_DETECTIONS_PER_SECOND: 5, // Detections per second for sustained detection
  GESTURE_REQUIRED_SUSTAINED_TIME: 1000, // 1 second sustained detection required
  GESTURE_MINIMUM_DETECTION_INTERVAL: 200, // Minimum 0.2s between detections
  
  // Camera settings
  VIDEO_WIDTH: 384,
  VIDEO_HEIGHT: 384,
  
  // Image capture settings
  IMAGE_QUALITY: 0.9, // JPEG quality (0.0 to 1.0)
  IMAGE_FORMAT: 'image/jpeg'
};

// Helper function to get fireworks duration in seconds
export const getFireworksDurationSeconds = () => CAMERA_CONFIG.FIREWORKS_DURATION / 1000;

// Helper function to get capture delay in seconds
export const getCaptureDelaySeconds = () => CAMERA_CONFIG.FIREWORKS_CAPTURE_DELAY / 1000; 