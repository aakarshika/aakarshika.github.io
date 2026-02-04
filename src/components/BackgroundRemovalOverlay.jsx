import React, { useEffect, useRef } from 'react';

const BackgroundRemovalOverlay = ({ 
  selfieSegmentationResults, 
  videoWidth, 
  videoHeight,
  backgroundColor = "rgba(0, 0, 0, 0.5)"
}) => {
  const canvasRef = useRef(null);
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current += 1;
    console.log(`BackgroundRemovalOverlay useEffect called #${renderCount.current}`, {
      hasResults: !!selfieSegmentationResults,
      timestamp: Date.now()
    });

    const canvas = canvasRef.current;
    if (!canvas) {
      console.log('Canvas not available');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.log('Canvas context not available');
      return;
    }
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    console.log("BackgroundRemovalOverlay - Processing segmentation results:", {
      hasResults: !!selfieSegmentationResults,
      keys: Object.keys(selfieSegmentationResults || {}),
      hasSegmentationMask: !!(selfieSegmentationResults?.segmentationMask),
      hasImage: !!(selfieSegmentationResults?.image),
      renderCount: renderCount.current
    });
    
    // Check if we have valid segmentation results
    if (!selfieSegmentationResults) {
      console.log('No segmentation results available');
      return;
    }

    // MediaPipe SelfieSegmentation provides segmentationMask as a canvas element
    if (selfieSegmentationResults.segmentationMask) {
      try {
        console.log("Drawing MediaPipe segmentation mask", {
          maskWidth: selfieSegmentationResults.segmentationMask.width,
          maskHeight: selfieSegmentationResults.segmentationMask.height,
          canvasWidth: videoWidth,
          canvasHeight: videoHeight
        });
        
        // Draw the segmentation mask directly
        ctx.drawImage(selfieSegmentationResults.segmentationMask, 0, 0, videoWidth, videoHeight);
        
        // Apply background color effect
        ctx.globalCompositeOperation = 'source-in';
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, videoWidth, videoHeight);
        
        // Reset composite operation
        ctx.globalCompositeOperation = 'source-over';
        
        console.log("Successfully drew segmentation mask");
        
      } catch (error) {
        console.error("Error drawing MediaPipe segmentation mask:", error);
      }
    } else {
      console.log("No segmentationMask available in results");
    }
  }, [selfieSegmentationResults, videoWidth, videoHeight, backgroundColor]);

  return (
    <canvas
      ref={canvasRef}
      width={videoWidth}
      height={videoHeight}
      className="absolute top-0 left-0 pointer-events-none rounded-lg"
      style={{
        zIndex: 25,
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
      }}
    />
  );
};

export default BackgroundRemovalOverlay; 