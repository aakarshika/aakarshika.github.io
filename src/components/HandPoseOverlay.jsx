import React from 'react';

const HandPoseOverlay = ({ detectedGestures, videoWidth, videoHeight, allHands }) => {
  // Always show skeleton if we have hand data, even without detected gestures
  const handsToShow = allHands && allHands.length > 0 ? allHands : 
                     (detectedGestures && detectedGestures.length > 0 ? detectedGestures.map(g => g.hand) : []);
  
  if (handsToShow.length === 0) {
    return null;
  }

  const drawKeypoints = (hand, ctx) => {
    const keypoints = hand.keypoints;
    if (!keypoints) return;

    // Draw keypoints
    keypoints.forEach((keypoint, index) => {
      const x = keypoint.x * videoWidth;
      const y = keypoint.y * videoHeight;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = '#00ff00';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Draw connections between keypoints
    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4], // thumb
      [0, 5], [5, 6], [6, 7], [7, 8], // index finger
      [0, 9], [9, 10], [10, 11], [11, 12], // middle finger
      [0, 13], [13, 14], [14, 15], [15, 16], // ring finger
      [0, 17], [17, 18], [18, 19], [19, 20], // pinky
      [0, 5], [5, 9], [9, 13], [13, 17], // palm connections
    ];

    connections.forEach(([start, end]) => {
      if (keypoints[start] && keypoints[end]) {
        ctx.beginPath();
        ctx.moveTo(keypoints[start].x * videoWidth, keypoints[start].y * videoHeight);
        ctx.lineTo(keypoints[end].x * videoWidth, keypoints[end].y * videoHeight);
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
  };

  const drawGestureLabel = (gesture, hand, ctx) => {
    if (!hand.keypoints || hand.keypoints.length === 0) return;

    // Find the center of the hand (wrist position)
    const wrist = hand.keypoints[0];
    if (!wrist) return;

    const x = wrist.x * videoWidth;
    const y = wrist.y * videoHeight;
    const label = `${gesture.name} (${Math.round(gesture.confidence * 100)}%)`;
    
    // Draw background rectangle
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(x - 50, y - 40, 100, 30);
    
    // Draw text
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(label, x, y - 20);
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      <canvas
        width={videoWidth}
        height={videoHeight}
        className="absolute inset-0"
        ref={(canvas) => {
          if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, videoWidth, videoHeight);
            
            handsToShow.forEach((hand, index) => {
              drawKeypoints(hand, ctx);
              // Only show gesture labels for detected gestures
              if (detectedGestures && detectedGestures[index]) {
                drawGestureLabel(detectedGestures[index], hand, ctx);
              }
            });
          }
        }}
      />
    </div>
  );
};

export default HandPoseOverlay; 