import React, { useState, useEffect } from 'react';
import SkillsTimeline2D from '../components/SkillsTimeline2D';
// import SkillsTimeline3D from '../components/SkillsTimeline3D';

const SkillsTimelinePage = () => {
  const [use3D, setUse3D] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if WebGL is supported
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) {
      setError('WebGL not supported. Using 2D fallback.');
      setUse3D(false);
    }
  }, []);

  const handle3DError = () => {
    setError('3D rendering failed. Switching to 2D version.');
    setUse3D(false);
  };

  if (error) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-red-900 bg-opacity-75 text-white p-4 rounded-lg mb-4">
            <h2 className="text-xl font-bold mb-2">⚠️ Rendering Issue</h2>
            <p className="text-sm">{error}</p>
          </div>
          <SkillsTimeline2D />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen">
      {use3D ? (
        <div>
          {/* <SkillsTimeline3D /> */}
          {/* Toggle button */}
          <button
            onClick={() => setUse3D(false)}
            className="absolute top-4 right-4 bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all"
          >
            Switch to 2D
          </button>
        </div>
      ) : (
        <div>
          <SkillsTimeline2D />
          {/* Toggle button */}
          <button
            onClick={() => setUse3D(true)}
            className="absolute top-4 right-4 bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all"
          >
            Switch to 3D
          </button>
        </div>
      )}
    </div>
  );
};

export default SkillsTimelinePage; 