import React, { useEffect, useRef } from 'react';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { HAND_CONNECTIONS } from '@mediapipe/hands';

const MultiModelHandPoseOverlay = ({ 
  modelStatus, 
  videoWidth, 
  videoHeight
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw hand skeletons
    modelStatus.forEach(model => {
      if (model.hands?.length > 0) {
        model.hands.forEach((hand, index) => {
          const landmarks = hand.keypoints.map(point => ({
            x: point.x,
            y: point.y,
            z: point.z || 0
          }));

          // Draw skeleton
          drawConnectors(ctx, landmarks, HAND_CONNECTIONS, { 
            color: '#00BFFF', 
            lineWidth: 3 
          });
          drawLandmarks(ctx, landmarks, { 
            color: '#00BFFF', 
            lineWidth: 1, 
            radius: 4, 
            fillColor: '#00BFFF' 
          });
        });
      }
    });
  }, [modelStatus, videoWidth, videoHeight]);

  return (
    <canvas
      ref={canvasRef}
      width={videoWidth}
      height={videoHeight}
      className="absolute top-0 left-0 pointer-events-none rounded-lg w-full h-full object-cover"
      style={{
        zIndex: 10
      }}
    />
  );
};

export default MultiModelHandPoseOverlay; 