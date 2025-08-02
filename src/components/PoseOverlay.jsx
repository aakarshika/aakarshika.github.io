import React, { useEffect, useRef } from 'react';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { POSE_CONNECTIONS } from '@mediapipe/pose';

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
    if (poseResults.poseLandmarks) {
      const landmarks = poseResults.poseLandmarks;
      
      // Draw pose connections
      if (showConnections) {
        drawConnectors(ctx, landmarks, POSE_CONNECTIONS, {
          color: '#00FF00',
          lineWidth: 3
        });
      }

      // Draw pose landmarks
      if (showLandmarks) {
        drawLandmarks(ctx, landmarks, {
          color: '#FF0000',
          lineWidth: 1,
          radius: 4,
          fillColor: '#FF0000'
        });
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
        zIndex: 14,
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