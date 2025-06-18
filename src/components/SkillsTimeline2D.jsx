import React, { useState } from 'react';
import useSkillsTimelineData from '../hooks/useSkillsTimelineData';



// Move formatDate above useMemo
const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short' 
  });
};

const MIN_X_ZOOM = 40;
const MAX_X_ZOOM = 200;
const MIN_Y_ZOOM = 200;
const MAX_Y_ZOOM = 2000;

const SkillsTimeline2D = ({ data: externalData, initialYZoom = 600 }) => {
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [xZoom, setXZoom] = useState(80);
  const [yZoom, setYZoom] = useState(initialYZoom);

  // Use external data if provided, otherwise use the hook
  const data = externalData || useSkillsTimelineData({ yZoom });

  // Y ticks for time
  const yTicks = React.useMemo(() => {
    const ticks = [];
    const n = 8;
    for (let i = 0; i <= n; i++) {
      const t = data.startTime + (data.endTime - data.startTime) * (i / n);
      const y = i * (yZoom - 40) / n + 20;
      ticks.push({ y, label: formatDate(t) });
    }
    return ticks;
  }, [data.startTime, data.endTime, yZoom]);

  // Handlers for zoom controls
  const handleXZoom = (delta) => {
    setXZoom(x => Math.max(MIN_X_ZOOM, Math.min(MAX_X_ZOOM, x + delta)));
  };
  const handleYZoom = (delta) => {
    setYZoom(y => Math.max(MIN_Y_ZOOM, Math.min(MAX_Y_ZOOM, y + delta)));
  };

  // SVG width/height
  const svgWidth = data.skills.length * xZoom + 100;
  const svgHeight = yZoom;

  return (
    <div className="w-full h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-4 text-center">
          Skills Timeline Visualization
        </h1>
        {/* Zoom Controls */}
        <div className="flex flex-wrap gap-4 justify-center mb-2">
          <div className="flex items-center gap-2 bg-black bg-opacity-60 px-3 py-2 rounded">
            <span className="text-white text-xs">Skill Axis</span>
            <button className="bg-gray-700 text-white px-2 rounded" onClick={() => handleXZoom(-20)}>-</button>
            <span className="text-white text-xs">{xZoom}px</span>
            <button className="bg-gray-700 text-white px-2 rounded" onClick={() => handleXZoom(20)}>+</button>
          </div>
          <div className="flex items-center gap-2 bg-black bg-opacity-60 px-3 py-2 rounded">
            <span className="text-white text-xs">Time Axis</span>
            <button className="bg-gray-700 text-white px-2 rounded" onClick={() => handleYZoom(-100)}>-</button>
            <span className="text-white text-xs">{yZoom}px</span>
            <button className="bg-gray-700 text-white px-2 rounded" onClick={() => handleYZoom(100)}>+</button>
          </div>
        </div>
        <div className="bg-white bg-opacity-80 rounded-lg p-2 relative overflow-auto" style={{ height: 'calc(100vh - 220px)', minHeight: 300 }}>
          <svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ minWidth: 600, minHeight: 300 }}>
            {/* Y axis (time) */}
            <line x1="40" y1="20" x2="40" y2={svgHeight - 20} stroke="#666" strokeWidth="2" />
            {/* Y ticks */}
            {yTicks.map((tick, i) => (
              <g key={i}>
                <line x1="35" y1={tick.y} x2="45" y2={tick.y} stroke="#666" strokeWidth="2" />
                <text x="30" y={tick.y + 3} textAnchor="end" fill="#ccc" fontSize="12">{tick.label}</text>
              </g>
            ))}
            {/* Skill lanes */}
            {data.skills.map((skill, i) => (
              <line key={skill} x1={i * xZoom + 70} y1="20" x2={i * xZoom + 70} y2={svgHeight - 20} stroke="#333" strokeWidth="1" />
            ))}
            {/* Segments */}
            {data.segments.map((segment, idx) => (
              <g key={idx}>
                <line
                  x1={segment.x * xZoom + 70}
                  y1={segment.y1}
                  x2={segment.x * xZoom + 70}
                  y2={segment.y2}
                  stroke={segment.color}
                  strokeWidth={segment.thickness}
                  opacity="0.8"
                  onMouseEnter={() => setHoveredSegment(segment)}
                  onMouseLeave={() => setHoveredSegment(null)}
                  style={{ cursor: 'pointer' }}
                />
                {/* Hover effect */}
                {hoveredSegment === segment && (
                  <rect
                    x={segment.x * xZoom + 60}
                    y={Math.min(segment.y1, segment.y2) - 8}
                    width={20}
                    height={Math.abs(segment.y2 - segment.y1) + 16}
                    fill="white"
                    opacity="0.1"
                  />
                )}
              </g>
            ))}
            {/* Gaps (dashed lines) */}
            {data.gaps.map((gap, idx) => (
              <line
                key={idx}
                x1={gap.x * xZoom + 70}
                y1={gap.y1}
                x2={gap.x * xZoom + 70}
                y2={gap.y2}
                stroke="#aaa"
                strokeWidth={2}
                strokeDasharray="6,6"
                opacity="0.7"
              />
            ))}
            {/* Achievements */}
            {data.achievements.map((ach, idx) => (
              <g key={idx}>
                <circle
                  cx={ach.x * xZoom + 70}
                  cy={ach.y}
                  r="8"
                  fill="#FFD700"
                  stroke="#FFA500"
                  strokeWidth="2"
                />
                <text
                  x={ach.x * xZoom + 70}
                  y={ach.y - 15}
                  textAnchor="middle"
                  fill="#FFD700"
                  fontSize="10"
                  fontWeight="bold"
                >
                  {ach.expertise}
                </text>
              </g>
            ))}
            {/* Skill labels */}
            {data.skills.map((skill, i) => (
              <text
                key={skill}
                x={i * xZoom + 70}
                y={svgHeight - 5}
                fill="white"
                fontSize="14"
                fontWeight="bold"
                textAnchor="middle"
              >
                {skill}
              </text>
            ))}
          </svg>
        </div>
        {/* Info Panel */}
        <div className="mt-6 bg-black bg-opacity-75 text-white p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Interactive Timeline</h2>
          <p className="text-sm mb-4">
            Hover over timeline segments to see details about your skills and experience
          </p>
          {hoveredSegment ? (
            <div className="border-l-4 border-blue-400 pl-3">
              <h3 className="font-semibold text-blue-300">{hoveredSegment.skill}</h3>
              <p className="text-sm text-gray-300">{hoveredSegment.company}</p>
              <p className="text-xs text-gray-400 mt-1">{hoveredSegment.expertise}</p>
              <p className="text-xs text-gray-300 mt-2">{hoveredSegment.description}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-400">
              Hover over timeline segments to see details
            </p>
          )}
        </div>
        {/* Legend */}
        <div className="mt-4 bg-black bg-opacity-75 text-white p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Legend</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {data.skills.map((skill) => (
              <div key={skill} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded mr-2" 
                  style={{ backgroundColor: data.skillColors[skill] }}
                ></div>
                <span>{skill}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-gray-400">
            <p>Line thickness = Expertise level (Beginner: 2px, Intermediate: 4px, Expert: 8px)</p>
            <p>Golden stars = Expert level achievements</p>
            <p>Dashed lines = Gaps in skill usage</p>
            <p>Use the controls above to zoom in/out on skills or time</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillsTimeline2D; 