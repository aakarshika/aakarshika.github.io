import React, { useEffect, useRef } from 'react';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { POSE_CONNECTIONS } from '@mediapipe/pose';

const keyPoints = [0, 11, 12, 23, 24, 25, 26]; // nose, shoulders, hips, knees
// 
// Point 0: Nose (head)
// Point 11: Left shoulder
// Point 12: Right shoulder
// Point 23: Left hip
// Point 24: Right hip
// Point 25: Left knee
// Point 26: Right knee
const PoseOverlay = ({ 
  poseResults, 
  videoWidth, 
  videoHeight,
  showConnections = true,
  showLandmarks = true
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !poseResults) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw pose if results exist
    if (poseResults.landmarks && poseResults.landmarks.length > 0) {
      const landmarks = poseResults.landmarks[0]; // Get the first pose's landmarks
      
      // Draw pose connections
      if (showConnections) {
        drawConnectors(ctx, landmarks, POSE_CONNECTIONS, {
          color: '#00FF00',
          lineWidth: 3
        });
      }

      // Draw key skeleton points
      if (showLandmarks && landmarks.length >= 33) {
        try {
          ctx.fillStyle = '#FFFF00';
          for (let i = 0; i < keyPoints.length; i++) {
            const pointIndex = keyPoints[i];
            const point = landmarks[pointIndex];

            if (point && point.x !== undefined && point.y !== undefined) {
              ctx.beginPath();
              ctx.arc(point.x * videoWidth, point.y * videoHeight, 8, 0, 2 * Math.PI);
              ctx.fill();
              
              // Add white border
              ctx.strokeStyle = '#FFFFFF';
              ctx.lineWidth = 2;
              ctx.stroke();
            }
          }
        } catch (error) {
          console.error('Error in manual drawing:', error);
        }
      }
    }
  }, [poseResults, videoWidth, videoHeight, showConnections, showLandmarks]);

  return (
    <canvas
      ref={canvasRef}
      width={videoWidth}
      height={videoHeight}
      className="absolute top-0 left-0 pointer-events-none"
      style={{
        zIndex: 25, // Increased z-index to be above effects
        mixBlendMode: 'normal',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%'
      }}
    />
  );
};

export default PoseOverlay; 