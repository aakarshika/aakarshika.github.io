import React, { useEffect, useRef } from 'react';

const FaceDetectionOverlay = ({ 
  faceDetectionResults, 
  videoWidth, 
  videoHeight
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !faceDetectionResults) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw face detection boxes if results exist
    if (faceDetectionResults.detections && faceDetectionResults.detections.length > 0) {
      faceDetectionResults.detections.forEach((detection, index) => {
        const boundingBox = detection.boundingBox;
        if (boundingBox) {
          const x = boundingBox.originX * videoWidth;
          const y = boundingBox.originY * videoHeight;
          const width = boundingBox.width * videoWidth;
          const height = boundingBox.height * videoHeight;
          
          // Draw bounding box
          ctx.strokeStyle = '#FFD700';
          ctx.lineWidth = 3;
          ctx.strokeRect(x, y, width, height);
          
          // Draw label
          ctx.fillStyle = '#FFD700';
          ctx.font = 'bold 16px Arial';
          ctx.fillText(`Face ${index + 1}`, x, y - 10);
          
          // Draw confidence if available
          if (detection.categories && detection.categories[0]) {
            const confidence = detection.categories[0].score;
            ctx.fillText(`Confidence: ${Math.round(confidence * 100)}%`, x, y + height + 20);
          }
        }
      });
    }
  }, [faceDetectionResults, videoWidth, videoHeight]);

  return (
    <canvas
      ref={canvasRef}
      width={videoWidth}
      height={videoHeight}
      className="absolute top-0 left-0 pointer-events-none"
      style={{
        zIndex: 13,
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

export default FaceDetectionOverlay; 