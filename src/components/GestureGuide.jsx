import React, { useState } from 'react';

const GestureGuide = ({ isVisible, onClose }) => {
  const [selectedGesture, setSelectedGesture] = useState('ok_sign');

  const gestureGuides = {
    thumbs_up: {
      name: 'Thumbs Up',
      description: 'Thumb pointing up, other fingers curled',
      keypoints: [
        // Thumb (keypoints 1-4)
        { x: 50, y: 30, label: 'Thumb tip' },
        { x: 45, y: 35, label: 'Thumb IP' },
        { x: 40, y: 40, label: 'Thumb MCP' },
        { x: 35, y: 45, label: 'Thumb CMC' },
        // Index finger (keypoints 5-8) - curled
        { x: 60, y: 50, label: 'Index tip' },
        { x: 55, y: 55, label: 'Index PIP' },
        { x: 50, y: 60, label: 'Index MCP' },
        { x: 45, y: 65, label: 'Index CMC' },
        // Middle finger (keypoints 9-12) - curled
        { x: 70, y: 50, label: 'Middle tip' },
        { x: 65, y: 55, label: 'Middle PIP' },
        { x: 60, y: 60, label: 'Middle MCP' },
        { x: 55, y: 65, label: 'Middle CMC' },
        // Ring finger (keypoints 13-16) - curled
        { x: 80, y: 50, label: 'Ring tip' },
        { x: 75, y: 55, label: 'Ring PIP' },
        { x: 70, y: 60, label: 'Ring MCP' },
        { x: 65, y: 65, label: 'Ring CMC' },
        // Pinky (keypoints 17-20) - curled
        { x: 90, y: 50, label: 'Pinky tip' },
        { x: 85, y: 55, label: 'Pinky PIP' },
        { x: 80, y: 60, label: 'Pinky MCP' },
        { x: 75, y: 65, label: 'Pinky CMC' },
        // Wrist (keypoint 0)
        { x: 40, y: 70, label: 'Wrist' },
      ],
      connections: [
        [0, 1], [1, 2], [2, 3], [3, 4], // thumb
        [0, 5], [5, 6], [6, 7], [7, 8], // index finger
        [0, 9], [9, 10], [10, 11], [11, 12], // middle finger
        [0, 13], [13, 14], [14, 15], [15, 16], // ring finger
        [0, 17], [17, 18], [18, 19], [19, 20], // pinky
        [0, 5], [5, 9], [9, 13], [13, 17], // palm connections
      ],
      instructions: [
        "1. Extend your thumb upward",
        "2. Curl all other fingers into your palm",
        "3. Keep your hand steady and visible to camera"
      ]
    },
    peace_sign: {
      name: 'Peace Sign',
      description: 'Index and middle fingers extended, others curled',
      keypoints: [
        // Thumb (keypoints 1-4) - curled
        { x: 30, y: 50, label: 'Thumb tip' },
        { x: 35, y: 55, label: 'Thumb IP' },
        { x: 40, y: 60, label: 'Thumb MCP' },
        { x: 45, y: 65, label: 'Thumb CMC' },
        // Index finger (keypoints 5-8) - extended
        { x: 60, y: 30, label: 'Index tip' },
        { x: 55, y: 35, label: 'Index PIP' },
        { x: 50, y: 40, label: 'Index MCP' },
        { x: 45, y: 45, label: 'Index CMC' },
        // Middle finger (keypoints 9-12) - extended
        { x: 70, y: 30, label: 'Middle tip' },
        { x: 65, y: 35, label: 'Middle PIP' },
        { x: 60, y: 40, label: 'Middle MCP' },
        { x: 55, y: 45, label: 'Middle CMC' },
        // Ring finger (keypoints 13-16) - curled
        { x: 80, y: 50, label: 'Ring tip' },
        { x: 75, y: 55, label: 'Ring PIP' },
        { x: 70, y: 60, label: 'Ring MCP' },
        { x: 65, y: 65, label: 'Ring CMC' },
        // Pinky (keypoints 17-20) - curled
        { x: 90, y: 50, label: 'Pinky tip' },
        { x: 85, y: 55, label: 'Pinky PIP' },
        { x: 80, y: 60, label: 'Pinky MCP' },
        { x: 75, y: 65, label: 'Pinky CMC' },
        // Wrist (keypoint 0)
        { x: 40, y: 70, label: 'Wrist' },
      ],
      connections: [
        [0, 1], [1, 2], [2, 3], [3, 4], // thumb
        [0, 5], [5, 6], [6, 7], [7, 8], // index finger
        [0, 9], [9, 10], [10, 11], [11, 12], // middle finger
        [0, 13], [13, 14], [14, 15], [15, 16], // ring finger
        [0, 17], [17, 18], [18, 19], [19, 20], // pinky
        [0, 5], [5, 9], [9, 13], [13, 17], // palm connections
      ],
      instructions: [
        "1. Extend your index and middle fingers",
        "2. Keep them close together",
        "3. Curl your thumb, ring, and pinky fingers",
        "4. Hold your hand steady"
      ]
    },
    ok_sign: {
      name: 'OK Sign',
      description: 'Thumb and index finger forming a circle, other fingers extended',
      keypoints: [
        // Thumb (keypoints 1-4) - curved to meet index
        { x: 55, y: 35, label: 'Thumb tip' },
        { x: 50, y: 40, label: 'Thumb IP' },
        { x: 45, y: 45, label: 'Thumb MCP' },
        { x: 40, y: 50, label: 'Thumb CMC' },
        // Index finger (keypoints 5-8) - curved to meet thumb
        { x: 60, y: 35, label: 'Index tip' },
        { x: 55, y: 40, label: 'Index PIP' },
        { x: 50, y: 45, label: 'Index MCP' },
        { x: 45, y: 50, label: 'Index CMC' },
        // Middle finger (keypoints 9-12) - extended
        { x: 70, y: 30, label: 'Middle tip' },
        { x: 65, y: 35, label: 'Middle PIP' },
        { x: 60, y: 40, label: 'Middle MCP' },
        { x: 55, y: 45, label: 'Middle CMC' },
        // Ring finger (keypoints 13-16) - extended
        { x: 80, y: 30, label: 'Ring tip' },
        { x: 75, y: 35, label: 'Ring PIP' },
        { x: 70, y: 40, label: 'Ring MCP' },
        { x: 65, y: 45, label: 'Ring CMC' },
        // Pinky (keypoints 17-20) - extended
        { x: 90, y: 30, label: 'Pinky tip' },
        { x: 85, y: 35, label: 'Pinky PIP' },
        { x: 80, y: 40, label: 'Pinky MCP' },
        { x: 75, y: 45, label: 'Pinky CMC' },
        // Wrist (keypoint 0)
        { x: 40, y: 70, label: 'Wrist' },
      ],
      connections: [
        [0, 1], [1, 2], [2, 3], [3, 4], // thumb
        [0, 5], [5, 6], [6, 7], [7, 8], // index finger
        [0, 9], [9, 10], [10, 11], [11, 12], // middle finger
        [0, 13], [13, 14], [14, 15], [15, 16], // ring finger
        [0, 17], [17, 18], [18, 19], [19, 20], // pinky
        [0, 5], [5, 9], [9, 13], [13, 17], // palm connections
      ],
      instructions: [
        "1. Touch your thumb tip to your index finger tip",
        "2. Form a circle between thumb and index",
        "3. Extend your middle, ring, and pinky fingers straight",
        "4. Keep your hand facing the camera",
        "5. Make sure the circle is clearly visible"
      ]
    }
  };

  const currentGuide = gestureGuides[selectedGesture];

  if (!isVisible) return null;

  return (
    <div className="absolute bottom-4 right-4 bg-gray-800 bg-opacity-90 rounded-lg p-4 max-w-xs w-full z-20">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-white text-sm font-semibold">Gesture Guide</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white text-lg"
        >
          ×
        </button>
      </div>

      {/* Gesture selector */}
      <div className="flex gap-1 mb-3">
        {Object.keys(gestureGuides).map((gesture) => (
          <button
            key={gesture}
            onClick={() => setSelectedGesture(gesture)}
            className={`px-2 py-1 rounded text-xs ${
              selectedGesture === gesture
                ? 'bg-blue-500 text-white'
                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
            }`}
          >
            {gestureGuides[gesture].name}
          </button>
        ))}
      </div>

      {/* Gesture visualization */}
      <div className="mb-3">
        <h4 className="text-white text-xs font-medium mb-1">{currentGuide.name}</h4>
        <p className="text-gray-300 text-xs mb-2">{currentGuide.description}</p>
        
        {/* Hand skeleton visualization */}
        <div className="relative bg-gray-900 rounded p-2 h-24 flex items-center justify-center">
          <svg width="120" height="80" className="mx-auto">
            {/* Draw connections */}
            {currentGuide.connections.map(([start, end], index) => {
              const startPoint = currentGuide.keypoints[start];
              const endPoint = currentGuide.keypoints[end];
              return (
                <line
                  key={index}
                  x1={startPoint.x * 1.2}
                  y1={startPoint.y * 1.0}
                  x2={endPoint.x * 1.2}
                  y2={endPoint.y * 1.0}
                  stroke="#00ff00"
                  strokeWidth="1"
                />
              );
            })}
            
            {/* Draw keypoints */}
            {currentGuide.keypoints.map((point, index) => (
              <circle
                key={index}
                cx={point.x * 1.2}
                cy={point.y * 1.0}
                r="2"
                fill="#00ff00"
                stroke="#ffffff"
                strokeWidth="0.5"
              />
            ))}
            
            {/* Special highlight for OK sign circle */}
            {selectedGesture === 'ok_sign' && (
              <circle
                cx="69"
                cy="35"
                r="5"
                fill="none"
                stroke="#ff6b6b"
                strokeWidth="1"
                strokeDasharray="3,3"
              />
            )}
          </svg>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-gray-700 rounded p-2">
        <h5 className="text-white text-xs font-medium mb-1">How to make:</h5>
        <ul className="text-gray-300 text-xs space-y-0.5">
          {currentGuide.instructions.slice(0, 3).map((instruction, index) => (
            <li key={index}>{instruction}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default GestureGuide; 