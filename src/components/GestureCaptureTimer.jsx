import React, { useState, useEffect } from 'react';

const GestureCaptureTimer = ({ 
  isActive, 
  detectedGestures, 
  modelStatus, 
  onComplete, 
  duration = 2 
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isCounting, setIsCounting] = useState(false);

  useEffect(() => {
    let interval = null;

    if (isActive && detectedGestures.length > 0 && !isCounting) {
      // Start countdown when gesture is detected
      setIsCounting(true);
      setTimeLeft(duration);
      
      interval = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            // Timer complete
            setIsCounting(false);
            onComplete();
            return duration;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (!isActive || detectedGestures.length === 0) {
      // Reset timer when no gesture detected
      setIsCounting(false);
      setTimeLeft(duration);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, detectedGestures, isCounting, duration, onComplete]);

  if (!isActive || !isCounting || detectedGestures.length === 0) {
    return null;
  }

  // Get the best gesture (highest confidence)
  const bestGesture = detectedGestures.reduce((best, current) => 
    current.confidence > best.confidence ? current : best
  );

  // Get all models that detected this gesture
  const detectingModels = modelStatus.filter(model => 
    model.detectedGestures && 
    model.detectedGestures.some(g => g.name === bestGesture.name)
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      
      {/* Timer content */}
      <div className="relative bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4">
        {/* Countdown circle */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-8 border-gray-200 flex items-center justify-center">
              <span className="text-4xl font-bold text-gray-800">{timeLeft}</span>
            </div>
            {/* Progress ring */}
            <svg className="absolute inset-0 w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-blue-500"
                strokeDasharray={`${(timeLeft / duration) * 251.2} 251.2`}
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Say Cheese text */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Say Cheese! 🧀
          </h2>
          <p className="text-lg text-gray-600">
            {bestGesture.name === 'thumbs_up' ? '👍 Thumbs Up Detected!' : '👌 OK Sign Detected!'}
          </p>
        </div>

        {/* Confidence scores */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-700 text-center mb-3">
            Detection Confidence:
          </h3>
          
          {detectingModels.map(model => {
            const gesture = model.detectedGestures.find(g => g.name === bestGesture.name);
            if (!gesture) return null;
            
            return (
              <div key={model.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded-full mr-3"
                    style={{ backgroundColor: model.color }}
                  ></div>
                  <span className="font-medium text-gray-700">{model.name}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-20 h-2 bg-gray-200 rounded-full mr-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${gesture.confidence * 100}%`,
                        backgroundColor: model.color 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-gray-800">
                    {Math.round(gesture.confidence * 100)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Instructions */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Keep your gesture steady for {timeLeft} more second{timeLeft !== 1 ? 's' : ''}...
          </p>
        </div>
      </div>
    </div>
  );
};

export default GestureCaptureTimer; 