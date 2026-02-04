import React, { useEffect, useRef } from 'react';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { FACEMESH_TESSELATION, FACEMESH_RIGHT_EYE, FACEMESH_LEFT_EYE, FACEMESH_FACE_OVAL, FACEMESH_LIPS } from '@mediapipe/face_mesh';

const FaceMeshOverlay = ({ 
  faceMeshResults, 
  videoWidth, 
  videoHeight,
  showMesh = true,
  showEyes = true,
  showLips = true,
  showExpressions = true,
  detectedExpressions = []
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !faceMeshResults) {
      if (!faceMeshResults) {
        
      }
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw face mesh if results exist (Tasks Vision format)
    if (faceMeshResults.faceLandmarks && faceMeshResults.faceLandmarks.length > 0) {
      faceMeshResults.faceLandmarks.forEach((landmarks, faceIndex) => {
        
        
        // Debug: Check first few landmark coordinates
        
        
        // Draw a semi-transparent background around the face for visibility
        const faceCenter = {
          x: landmarks[10]?.x * videoWidth || videoWidth / 2,
          y: landmarks[10]?.y * videoHeight || videoHeight / 2
        };
        
        // Draw background circle around face
        ctx.beginPath();
        ctx.arc(faceCenter.x, faceCenter.y, 100, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(255, 255, 0, 0.1)'; // Very light yellow background
        ctx.fill();
        
        // Try manual drawing instead of MediaPipe functions
        try {
          // Draw simplified face outline with only 6 key points
          const keyPoints = [
            4,
            10,  // Top of forehead
            152, // Left temple
            454, // Chin
            234,  // Right temple
          ];
          
          ctx.beginPath();
          ctx.strokeStyle = '#FF0000';
          ctx.lineWidth = 3;
          ctx.moveTo(landmarks[keyPoints[0]].x * videoWidth, landmarks[keyPoints[0]].y * videoHeight);
          
          ctx.closePath();
          ctx.stroke();
          
          // Draw only 6 key landmark dots
          const dotPoints = keyPoints; // Key facial points
          ctx.fillStyle = '#FFFF00';
          for (let i = 0; i < dotPoints.length; i++) {
            const point = landmarks[dotPoints[i]];
            if (point) {
              ctx.beginPath();
              ctx.arc(point.x * videoWidth, point.y * videoHeight, 4, 0, 2 * Math.PI);
              ctx.fill();
            }
          }
          
          
        } catch (error) {
          console.error('Error in manual drawing:', error);
        }
        

        // Draw expression indicators
        if (showExpressions && detectedExpressions.length > 0) {
          drawExpressionIndicators(ctx, landmarks, detectedExpressions, videoWidth, videoHeight);
        }
      });
    }
  }, [faceMeshResults, videoWidth, videoHeight, showMesh, showEyes, showLips, showExpressions, detectedExpressions]);

  // Function to draw expression indicators
  const drawExpressionIndicators = (ctx, landmarks, expressions, videoWidth, videoHeight) => {
    // Get face center for positioning expression indicators
    const faceCenter = {
      x: landmarks[10]?.x * videoWidth || videoWidth / 2,
      y: landmarks[10]?.y * videoHeight || videoHeight / 2
    };

    expressions.forEach((expression, index) => {
      const yOffset = -80 - (index * 30); // Stack expressions above face
      
      // Draw expression background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.strokeStyle = getExpressionColor(expression.name);
      ctx.lineWidth = 2;
      
      const text = `${getExpressionEmoji(expression.name)} ${expression.name}`;
      ctx.font = '16px Arial';
      const textMetrics = ctx.measureText(text);
      const padding = 8;
      const rectWidth = textMetrics.width + padding * 2;
      const rectHeight = 24;
      
      // Draw rounded rectangle background
      const x = faceCenter.x - rectWidth / 2;
      const y = faceCenter.y + yOffset;
      const radius = 4;
      
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + rectWidth - radius, y);
      ctx.quadraticCurveTo(x + rectWidth, y, x + rectWidth, y + radius);
      ctx.lineTo(x + rectWidth, y + rectHeight - radius);
      ctx.quadraticCurveTo(x + rectWidth, y + rectHeight, x + rectWidth - radius, y + rectHeight);
      ctx.lineTo(x + radius, y + rectHeight);
      ctx.quadraticCurveTo(x, y + rectHeight, x, y + rectHeight - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      
      ctx.fill();
      ctx.stroke();
      
      // Draw expression text
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, faceCenter.x, y + rectHeight / 2);
      
      // Draw confidence bar
      const confidenceBarWidth = 60;
      const confidenceBarHeight = 4;
      const confidenceX = faceCenter.x - confidenceBarWidth / 2;
      const confidenceY = y + rectHeight + 4;
      
      // Background bar
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(confidenceX, confidenceY, confidenceBarWidth, confidenceBarHeight);
      
      // Confidence level bar
      ctx.fillStyle = getExpressionColor(expression.name);
      ctx.fillRect(confidenceX, confidenceY, confidenceBarWidth * expression.confidence, confidenceBarHeight);
    });
  };

  // Helper function to get expression color
  const getExpressionColor = (expressionName) => {
    switch (expressionName) {
      case 'smile':
        return '#FF6B6B';
      case 'wink':
        return '#4ECDC4';
      case 'surprised':
        return '#45B7D1';
      default:
        return '#FFD93D';
    }
  };

  // Helper function to get expression emoji
  const getExpressionEmoji = (expressionName) => {
    switch (expressionName) {
      case 'smile':
        return '😊';
      case 'wink':
        return '😉';
      case 'surprised':
        return '😲';
      default:
        return '😐';
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={videoWidth}
      height={videoHeight}
      className="absolute top-0 left-0 pointer-events-none rounded-lg"
      style={{
        zIndex: 25, // Increased z-index to be above effects
        mixBlendMode: 'normal',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        border: '1px solid red' // Debug border to see if canvas is positioned correctly
      }}
    />
  );
};

export default FaceMeshOverlay; 