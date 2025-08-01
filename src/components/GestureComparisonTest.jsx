import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { useDualGestureDetection } from '../hooks/useDualGestureDetection';
import DualHandPoseOverlay from './DualHandPoseOverlay';

const GestureComparisonTest = () => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const webcamRef = useRef(null);
  
  const {
    lightweightGestures,
    lightweightHands,
    tfGestures,
    tfHands,
    isModelLoaded,
    isDetecting,
    loadingStatus,
    tfModelLoaded,
    fingerposeLoaded,
    startDetection,
    stopDetection,
  } = useDualGestureDetection();

  // Start detection when camera opens
  useEffect(() => {
    if (isCameraOpen && isModelLoaded && webcamRef.current?.video) {
      startDetection(webcamRef.current.video);
    } else if (!isCameraOpen) {
      stopDetection();
    }
  }, [isCameraOpen, isModelLoaded, startDetection, stopDetection]);

  // Calculate detection statistics
  const getDetectionStats = () => {
    const lwThumbsUp = lightweightGestures.find(g => g.name === 'thumbs_up');
    const tfThumbsUp = tfGestures.find(g => g.name === 'thumbs_up');
    const lwOK = lightweightGestures.find(g => g.name === 'ok_sign');
    const tfOK = tfGestures.find(g => g.name === 'ok_sign');

    return {
      thumbsUp: {
        lightweight: lwThumbsUp ? Math.round(lwThumbsUp.confidence * 100) : 0,
        tensorflow: tfThumbsUp ? Math.round(tfThumbsUp.confidence * 100) : 0,
        difference: (lwThumbsUp ? lwThumbsUp.confidence : 0) - (tfThumbsUp ? tfThumbsUp.confidence : 0)
      },
      okSign: {
        lightweight: lwOK ? Math.round(lwOK.confidence * 100) : 0,
        tensorflow: tfOK ? Math.round(tfOK.confidence * 100) : 0,
        difference: (lwOK ? lwOK.confidence : 0) - (tfOK ? tfOK.confidence : 0)
      }
    };
  };

  const stats = getDetectionStats();

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center">Gesture Detection Comparison</h2>
      
      {/* Status Panel */}
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-3">System Status:</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="p-2 bg-blue-50 rounded">
            <div className="font-medium">MediaPipe</div>
            <div className={isModelLoaded ? 'text-green-600' : 'text-red-600'}>
              {isModelLoaded ? '✅ Loaded' : '❌ Loading...'}
            </div>
          </div>
          <div className="p-2 bg-red-50 rounded">
            <div className="font-medium">TensorFlow.js</div>
            <div className={tfModelLoaded ? 'text-green-600' : 'text-red-600'}>
              {tfModelLoaded ? '✅ Loaded' : '❌ Loading...'}
            </div>
          </div>
          <div className="p-2 bg-purple-50 rounded">
            <div className="font-medium">Fingerpose</div>
            <div className={fingerposeLoaded ? 'text-green-600' : 'text-red-600'}>
              {fingerposeLoaded ? '✅ Loaded' : '❌ Loading...'}
            </div>
          </div>
          <div className="p-2 bg-green-50 rounded">
            <div className="font-medium">Detection</div>
            <div className={isDetecting ? 'text-green-600' : 'text-gray-600'}>
              {isDetecting ? '✅ Active' : '⏸️ Inactive'}
            </div>
          </div>
        </div>
        <div className="mt-3 text-sm text-gray-600">
          Status: {loadingStatus}
        </div>
      </div>

      {/* Controls */}
      <div className="mb-6 flex gap-4 justify-center">
        <button
          onClick={() => setIsCameraOpen(!isCameraOpen)}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          {isCameraOpen ? 'Close Camera' : 'Open Camera'}
        </button>
        <button
          onClick={() => setShowStats(!showStats)}
          className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
        >
          {showStats ? 'Hide Stats' : 'Show Stats'}
        </button>
      </div>

      {/* Camera and Detection */}
      {isCameraOpen && (
        <div className="mb-6">
          <div className="relative max-w-2xl mx-auto">
            <Webcam
              audio={false}
              ref={webcamRef}
              className="w-full rounded-lg border-4 border-gray-300"
              videoConstraints={{ width: 640, height: 480 }}
            />
            
            <DualHandPoseOverlay
              lightweightGestures={lightweightGestures}
              lightweightHands={lightweightHands}
              tfGestures={tfGestures}
              tfHands={tfHands}
              videoWidth={640}
              videoHeight={480}
            />

            {/* Legend */}
            <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white p-3 rounded">
              <div className="text-sm font-bold mb-2">Legend:</div>
              <div className="text-xs space-y-1">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-400 rounded mr-2"></div>
                  Lightweight Detection
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-400 rounded mr-2"></div>
                  TensorFlow Detection
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Detection Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Lightweight Detection */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="font-bold text-blue-800 mb-3 flex items-center">
            <div className="w-4 h-4 bg-blue-400 rounded mr-2"></div>
            Lightweight Detection
          </h3>
          <div className="space-y-2">
            {lightweightGestures.length > 0 ? (
              lightweightGestures.map((gesture, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-white rounded">
                  <span className="font-medium">
                    {gesture.name === 'thumbs_up' ? '👍' : '👌'} {gesture.name}
                  </span>
                  <span className="text-blue-600 font-bold">
                    {Math.round(gesture.confidence * 100)}%
                  </span>
                </div>
              ))
            ) : (
              <div className="text-gray-500 italic">No gestures detected</div>
            )}
          </div>
        </div>

        {/* TensorFlow Detection */}
        <div className="p-4 bg-red-50 rounded-lg">
          <h3 className="font-bold text-red-800 mb-3 flex items-center">
            <div className="w-4 h-4 bg-red-400 rounded mr-2"></div>
            TensorFlow Detection
          </h3>
          <div className="space-y-2">
            {tfGestures.length > 0 ? (
              tfGestures.map((gesture, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-white rounded">
                  <span className="font-medium">
                    {gesture.name === 'thumbs_up' ? '👍' : '👌'} {gesture.name}
                  </span>
                  <span className="text-red-600 font-bold">
                    {Math.round(gesture.confidence * 100)}%
                  </span>
                </div>
              ))
            ) : (
              <div className="text-gray-500 italic">No gestures detected</div>
            )}
          </div>
        </div>
      </div>

      {/* Statistics Panel */}
      {showStats && (
        <div className="p-6 bg-gray-50 rounded-lg">
          <h3 className="font-bold text-xl mb-4">Detection Statistics</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Thumbs Up Comparison */}
            <div className="p-4 bg-white rounded-lg border">
              <h4 className="font-semibold mb-3 flex items-center">
                👍 Thumbs Up Detection
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Lightweight:</span>
                  <span className="font-bold text-blue-600">{stats.thumbsUp.lightweight}%</span>
                </div>
                <div className="flex justify-between">
                  <span>TensorFlow:</span>
                  <span className="font-bold text-red-600">{stats.thumbsUp.tensorflow}%</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span>Difference:</span>
                  <span className={`font-bold ${stats.thumbsUp.difference > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.thumbsUp.difference > 0 ? '+' : ''}{Math.round(stats.thumbsUp.difference * 100)}%
                  </span>
                </div>
              </div>
            </div>

            {/* OK Sign Comparison */}
            <div className="p-4 bg-white rounded-lg border">
              <h4 className="font-semibold mb-3 flex items-center">
                👌 OK Sign Detection
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Lightweight:</span>
                  <span className="font-bold text-blue-600">{stats.okSign.lightweight}%</span>
                </div>
                <div className="flex justify-between">
                  <span>TensorFlow:</span>
                  <span className="font-bold text-red-600">{stats.okSign.tensorflow}%</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span>Difference:</span>
                  <span className={`font-bold ${stats.okSign.difference > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.okSign.difference > 0 ? '+' : ''}{Math.round(stats.okSign.difference * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Summary */}
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-semibold mb-2">Performance Summary:</h4>
            <div className="text-sm space-y-1">
              <div>• <strong>Lightweight:</strong> Fast, simple, rule-based detection</div>
              <div>• <strong>TensorFlow:</strong> AI-powered, more sophisticated detection</div>
              <div>• <strong>Comparison:</strong> See which method performs better for your gestures</div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
        <h3 className="font-semibold mb-2">Test Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Click "Open Camera" to start detection</li>
          <li>Wait for both systems to load (check status panel)</li>
          <li>Show your hand to the camera</li>
          <li>Make a thumbs up gesture (👍) - watch both skeletons</li>
          <li>Make an OK sign gesture (👌) - compare detection accuracy</li>
          <li>Toggle "Show Stats" to see detailed comparison</li>
          <li>Notice the different colored skeletons (blue vs red)</li>
        </ol>
      </div>
    </div>
  );
};

export default GestureComparisonTest; 