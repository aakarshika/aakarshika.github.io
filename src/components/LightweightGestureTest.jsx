import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { useLightweightGestureDetection } from '../hooks/useLightweightGestureDetection';

const LightweightGestureTest = () => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const webcamRef = useRef(null);
  
  const {
    isModelLoaded,
    isDetecting,
    detectedGestures,
    allHands,
    loadingStatus,
    startDetection,
    stopDetection,
  } = useLightweightGestureDetection();

  // Start detection when camera opens
  useEffect(() => {
    if (isCameraOpen && isModelLoaded && webcamRef.current?.video) {
      startDetection(webcamRef.current.video);
    } else if (!isCameraOpen) {
      stopDetection();
    }
  }, [isCameraOpen, isModelLoaded, startDetection, stopDetection]);

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Lightweight Gesture Detection Test</h2>
      
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">Status:</h3>
        <div className="space-y-1 text-sm">
          <div>Model Loaded: {isModelLoaded ? '✅' : '❌'}</div>
          <div>Detecting: {isDetecting ? '✅' : '❌'}</div>
          <div>Loading Status: {loadingStatus}</div>
          <div>Hands Detected: {allHands.length}</div>
          <div>Gestures: {detectedGestures.map(g => `${g.name} (${Math.round(g.confidence * 100)}%)`).join(', ') || 'None'}</div>
        </div>
      </div>

      <div className="mb-4">
        <button
          onClick={() => setIsCameraOpen(!isCameraOpen)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {isCameraOpen ? 'Close Camera' : 'Open Camera'}
        </button>
      </div>

      {isCameraOpen && (
        <div className="relative">
          <Webcam
            audio={false}
            ref={webcamRef}
            className="w-full max-w-md rounded border"
            videoConstraints={{ width: 640, height: 480 }}
          />
          
          {/* Gesture overlay */}
          <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-2 rounded">
            <div className="text-sm">
              {detectedGestures.length > 0 ? (
                detectedGestures.map(gesture => (
                  <div key={gesture.name} className="font-bold">
                    {gesture.name === 'thumbs_up' ? '👍' : '👌'} {gesture.name} ({Math.round(gesture.confidence * 100)}%)
                  </div>
                ))
              ) : (
                <div>No gesture detected</div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white p-2 rounded">
            <div className="text-sm">
              <div>👍 Show thumbs up</div>
              <div>👌 Show OK sign</div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 p-4 bg-yellow-50 rounded">
        <h3 className="font-semibold mb-2">Test Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Click "Open Camera" to start</li>
          <li>Wait for "OK sign & thumbs up detection ready"</li>
          <li>Show your hand to the camera</li>
          <li>Make a thumbs up gesture (👍)</li>
          <li>Make an OK sign gesture (👌)</li>
          <li>Check the status display for detection results</li>
        </ol>
      </div>
    </div>
  );
};

export default LightweightGestureTest; 