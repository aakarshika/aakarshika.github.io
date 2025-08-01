import React, { useEffect, useRef } from 'react';

const DualHandPoseOverlay = ({ 
  lightweightGestures, 
  lightweightHands, 
  tfGestures, 
  tfHands, 
  videoWidth, 
  videoHeight 
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw lightweight detection (blue)
    if (lightweightHands.length > 0) {
      drawHandSkeleton(ctx, lightweightHands[0], '#00BFFF', 'Lightweight');
    }

    // Draw TensorFlow detection (red)
    if (tfHands.length > 0) {
      drawHandSkeleton(ctx, tfHands[0], '#FF6B6B', 'TensorFlow');
    }

    // Draw gesture labels
    drawGestureLabels(ctx, lightweightGestures, tfGestures);
  }, [lightweightGestures, lightweightHands, tfGestures, tfHands, videoWidth, videoHeight]);

  const drawHandSkeleton = (ctx, hand, color, method) => {
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
    ctx.lineWidth = 2;
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
        
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
  };

  const drawGestureLabels = (ctx, lightweightGestures, tfGestures) => {
    const padding = 10;
    let yOffset = 30;

    // Draw lightweight gestures (blue)
    if (lightweightGestures.length > 0) {
      ctx.fillStyle = '#00BFFF';
      ctx.font = 'bold 14px Arial';
      ctx.fillText('Lightweight Detection:', padding, yOffset);
      yOffset += 20;

      ctx.font = '12px Arial';
      lightweightGestures.forEach(gesture => {
        const text = `👍 ${gesture.name} (${Math.round(gesture.confidence * 100)}%)`;
        ctx.fillText(text, padding + 10, yOffset);
        yOffset += 15;
      });
    }

    // Draw TensorFlow gestures (red)
    if (tfGestures.length > 0) {
      yOffset += 10; // Add spacing
      ctx.fillStyle = '#FF6B6B';
      ctx.font = 'bold 14px Arial';
      ctx.fillText('TensorFlow Detection:', padding, yOffset);
      yOffset += 20;

      ctx.font = '12px Arial';
      tfGestures.forEach(gesture => {
        const text = `👌 ${gesture.name} (${Math.round(gesture.confidence * 100)}%)`;
        ctx.fillText(text, padding + 10, yOffset);
        yOffset += 15;
      });
    }

    // Draw comparison info
    if (lightweightGestures.length > 0 || tfGestures.length > 0) {
      yOffset += 10;
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px Arial';
      ctx.fillText('Comparison:', padding, yOffset);
      yOffset += 15;

      ctx.font = '10px Arial';
      
      // Compare thumbs up detection
      const lwThumbsUp = lightweightGestures.find(g => g.name === 'thumbs_up');
      const tfThumbsUp = tfGestures.find(g => g.name === 'thumbs_up');
      
      if (lwThumbsUp || tfThumbsUp) {
        const lwConf = lwThumbsUp ? Math.round(lwThumbsUp.confidence * 100) : 0;
        const tfConf = tfThumbsUp ? Math.round(tfThumbsUp.confidence * 100) : 0;
        ctx.fillText(`Thumbs Up: Lightweight ${lwConf}% vs TF ${tfConf}%`, padding + 10, yOffset);
        yOffset += 12;
      }

      // Compare OK sign detection
      const lwOK = lightweightGestures.find(g => g.name === 'ok_sign');
      const tfOK = tfGestures.find(g => g.name === 'ok_sign');
      
      if (lwOK || tfOK) {
        const lwConf = lwOK ? Math.round(lwOK.confidence * 100) : 0;
        const tfConf = tfOK ? Math.round(tfOK.confidence * 100) : 0;
        ctx.fillText(`OK Sign: Lightweight ${lwConf}% vs TF ${tfConf}%`, padding + 10, yOffset);
      }
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={videoWidth}
      height={videoHeight}
      className="absolute top-0 left-0 pointer-events-none"
      style={{
        zIndex: 10,
        mixBlendMode: 'normal'
      }}
    />
  );
};

export default DualHandPoseOverlay; 