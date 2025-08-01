import React, { useEffect, useRef } from 'react';

const MultiModelHandPoseOverlay = ({ 
  modelStatus, 
  videoWidth, 
  videoHeight,
  showConfidenceScores = true,
  showModelNames = true
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log('MultiModelHandPoseOverlay: No canvas ref');
      return;
    }

    console.log('MultiModelHandPoseOverlay render:', { modelStatus, videoWidth, videoHeight });

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.log('MultiModelHandPoseOverlay: No canvas context');
      return;
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw a test rectangle to verify the overlay is working
    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.fillRect(10, 10, 50, 30);
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.fillText('Overlay Active', 15, 25);

    // Always draw hand skeletons for each model when hands are detected
    modelStatus.forEach(model => {
      console.log('Model:', model.name, 'Hands:', model.hands?.length, 'Gestures:', model.detectedGestures?.length);
      console.log('Model hands data:', model.hands);
      if (model.hands && model.hands.length > 0) {
        model.hands.forEach(hand => {
          console.log('Drawing skeleton for hand:', hand);
          drawHandSkeleton(ctx, hand, model.color, model.name);
        });
      }
    });

    // Draw confidence scores and model info only when gestures are detected
    const hasDetectedGestures = modelStatus.some(model => 
      model.detectedGestures && model.detectedGestures.length > 0
    );
    
    // Check if hands are being tracked but no gestures detected
    const hasHandsButNoGestures = modelStatus.some(model => 
      model.hands && model.hands.length > 0
    ) && !hasDetectedGestures;
    
    if ((showConfidenceScores || showModelNames) && hasDetectedGestures) {
      drawModelInfo(ctx, modelStatus);
    } else if (hasHandsButNoGestures) {
      // Show "waiting for gesture" message
      drawWaitingMessage(ctx);
    }
  }, [modelStatus, videoWidth, videoHeight, showConfidenceScores, showModelNames]);

  const drawHandSkeleton = (ctx, hand, color, modelName) => {
    if (!hand || !hand.keypoints) return;

    const keypoints = hand.keypoints;
    
    // Hand connections (MediaPipe hand skeleton)
    const connections = [
      // Thumb
      [0, 1], [1, 2], [2, 3], [3, 4],
      // Index finger
      [0, 5], [5, 6], [6, 7], [7, 8],
      // Middle finger
      [0, 9], [9, 10], [10, 11], [11, 12],
      // Ring finger
      [0, 13], [13, 14], [14, 15], [15, 16],
      // Pinky finger
      [0, 17], [17, 18], [18, 19], [19, 20],
      // Palm connections
      [5, 9], [9, 13], [13, 17]
    ];

    // Draw connections
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    connections.forEach(([start, end]) => {
      const startPoint = keypoints[start];
      const endPoint = keypoints[end];
      
      if (startPoint && endPoint) {
        const startX = startPoint.x * videoWidth;
        const startY = startPoint.y * videoHeight;
        const endX = endPoint.x * videoWidth;
        const endY = endPoint.y * videoHeight;
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }
    });

    // Draw keypoints
    keypoints.forEach((point, index) => {
      if (point) {
        const x = point.x * videoWidth;
        const y = point.y * videoHeight;
        
        // Draw keypoint with color
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
        
        // Add white border for better visibility
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });
  };

  const drawWaitingMessage = (ctx) => {
    const padding = 15;
    const yOffset = 40;
    const lineHeight = 20;

    // Draw background for waiting message
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(padding - 5, padding - 5, 250, 60);

    // Draw waiting message
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('Hand Detected', padding, yOffset);
    
    ctx.font = '12px Arial';
    ctx.fillStyle = '#FFFF00';
    ctx.fillText('Show 👍 thumbs up or 👌 OK sign', padding, yOffset + lineHeight);
  };

  const drawModelInfo = (ctx, modelStatus) => {
    const padding = 15;
    let yOffset = 40;
    const lineHeight = 20;
    const sectionSpacing = 10;

    // Filter models that have detected gestures
    const activeModels = modelStatus.filter(model => 
      model.detectedGestures && model.detectedGestures.length > 0
    );

    if (activeModels.length === 0) return;

    // Draw background for info panel
    const infoHeight = activeModels.length * lineHeight + 40;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(padding - 5, padding - 5, 300, infoHeight);

    // Draw title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('Gesture Detection Results', padding, yOffset);
    yOffset += lineHeight + 5;

    // Draw each model's results
    activeModels.forEach(model => {
      // Model name
      if (showModelNames) {
        ctx.fillStyle = model.color;
        ctx.font = 'bold 14px Arial';
        ctx.fillText(`${model.name}:`, padding, yOffset);
        yOffset += lineHeight;
      }

      // Gestures and confidence scores
      if (showConfidenceScores && model.detectedGestures) {
        ctx.font = '12px Arial';
        model.detectedGestures.forEach(gesture => {
          const gestureIcon = gesture.name === 'thumbs_up' ? '👍' : '👌';
          const text = `${gestureIcon} ${gesture.name}: ${Math.round(gesture.confidence * 100)}%`;
          
          // Draw confidence bar
          const barWidth = 150;
          const barHeight = 8;
          const barX = padding + 120;
          const barY = yOffset - 8;
          
          // Background bar
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.fillRect(barX, barY, barWidth, barHeight);
          
          // Confidence bar
          ctx.fillStyle = model.color;
          ctx.fillRect(barX, barY, barWidth * gesture.confidence, barHeight);
          
          // Text
          ctx.fillStyle = '#FFFFFF';
          ctx.fillText(text, padding, yOffset);
          yOffset += lineHeight;
        });
      }

      yOffset += sectionSpacing;
    });
  };

  return (
    <canvas
      ref={canvasRef}
      width={videoWidth}
      height={videoHeight}
      className="absolute top-0 left-0 pointer-events-none"
      style={{
        zIndex: 10,
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

export default MultiModelHandPoseOverlay; 