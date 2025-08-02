import React, { useEffect, useRef } from 'react';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { FACEMESH_TESSELATION, FACEMESH_RIGHT_EYE, FACEMESH_LEFT_EYE, FACEMESH_FACE_OVAL, FACEMESH_LIPS } from '@mediapipe/face_mesh';

const FaceMeshOverlay = ({ 
  faceMeshResults, 
  videoWidth, 
  videoHeight,
  showMesh = true,
  showEyes = true,
  showLips = true
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !faceMeshResults) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw face mesh if results exist (Tasks Vision format)
    if (faceMeshResults.faceLandmarks && faceMeshResults.faceLandmarks.length > 0) {
      faceMeshResults.faceLandmarks.forEach((landmarks, faceIndex) => {
        // Draw face mesh tessellation
        if (showMesh) {
          drawConnectors(ctx, landmarks, FACEMESH_TESSELATION, {
            color: '#E0E0E0',
            lineWidth: 1
          });
        }

        // Draw face oval
        drawConnectors(ctx, landmarks, FACEMESH_FACE_OVAL, {
          color: '#FF3030',
          lineWidth: 2
        });

        // Draw eyes
        if (showEyes) {
          drawConnectors(ctx, landmarks, FACEMESH_RIGHT_EYE, {
            color: '#30FF30',
            lineWidth: 2
          });
          drawConnectors(ctx, landmarks, FACEMESH_LEFT_EYE, {
            color: '#30FF30',
            lineWidth: 2
          });
        }

        // Draw lips
        if (showLips) {
          drawConnectors(ctx, landmarks, FACEMESH_LIPS, {
            color: '#FF30FF',
            lineWidth: 2
          });
        }

        // Draw key landmarks
        drawLandmarks(ctx, landmarks, {
          color: '#FF3030',
          lineWidth: 1,
          radius: 2,
          fillColor: '#FF3030'
        });
      });
    }
  }, [faceMeshResults, videoWidth, videoHeight, showMesh, showEyes, showLips]);

  return (
    <canvas
      ref={canvasRef}
      width={videoWidth}
      height={videoHeight}
      className="absolute top-0 left-0 pointer-events-none"
      style={{
        zIndex: 15,
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

export default FaceMeshOverlay; 