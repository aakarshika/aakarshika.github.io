import React, { useState, useEffect, useRef } from 'react';
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
  const [yZoom, setYZoom] = useState(initialYZoom);
  const [zoomValue, setZoomValue] = useState(1); // 1 = most detailed, higher = more clubbed
  const [categoryLevel, setCategoryLevel] = useState(null);
  const svgContainerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(800);
  const [use3D, setUse3D] = useState(false);

  console.log('SkillsTimeline2D mounted, initial ref:', svgContainerRef.current);

  // Log when ref gets attached
  useEffect(() => {
    console.log('Ref changed:', svgContainerRef.current);
  }, [svgContainerRef.current]);

  // Update containerWidth on resize
  useEffect(() => {
    function updateWidth() {
      console.log('updateWidth called, ref:', svgContainerRef.current);
      if (svgContainerRef.current) {
        const width = svgContainerRef.current.offsetWidth;
        console.log('Container width:', width);
        setContainerWidth(width);
      }
    }
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Use external data if provided, otherwise use the hook
  const data = externalData || useSkillsTimelineData({ yZoom, categoryLevel });

  // Compute maxCategoryLevel from the current data's categoryTree
  const maxCategoryLevel = React.useMemo(() => {
    const getMaxDepth = (tree, depth = 1) => {
      if (!tree || typeof tree !== 'object') return depth;
      let max = depth;
      for (const key in tree) {
        max = Math.max(max, getMaxDepth(tree[key], depth + 1));
      }
      return max;
    };
    const result = getMaxDepth(data.categoryTree);
    console.log('maxCategoryLevel calculated:', result, 'from categoryTree:', data.categoryTree);
    return result;
  }, [data.categoryTree]);

  // Handle horizontal scroll for smooth zoom
  useEffect(() => {
    const handleWheel = (e) => {
      console.log('Wheel event detected:', {
        deltaX: e.deltaX,
        deltaY: e.deltaY,
        ctrlKey: e.ctrlKey,
        deltaXAbs: Math.abs(e.deltaX),
        deltaYAbs: Math.abs(e.deltaY),
        isHorizontal: Math.abs(e.deltaX) > Math.abs(e.deltaY)
      });
      
      if (e.ctrlKey || Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
        console.log('Scroll ignored - ctrlKey or not horizontal enough');
        return; // Only horizontal scroll
      }
      
      console.log('Processing horizontal scroll, current zoomValue:', zoomValue);
      e.preventDefault();
      const delta = e.deltaX * 0.1; // Increased sensitivity from 0.01 to 0.1
      const newZoomValue = Math.max(0.1, Math.min(maxCategoryLevel + 1, zoomValue + delta));
      console.log('Delta:', delta, 'New zoomValue:', newZoomValue, 'maxCategoryLevel:', maxCategoryLevel);
      setZoomValue(newZoomValue);
    };
    
    const ref = svgContainerRef.current;
    console.log('Setting up wheel listener on ref:', ref);
    if (ref) {
      ref.addEventListener('wheel', handleWheel, { passive: false });
      console.log('Wheel listener added successfully');
    }
    return () => { 
      if (ref) {
        ref.removeEventListener('wheel', handleWheel);
        console.log('Wheel listener removed');
      }
    };
  }, [maxCategoryLevel, zoomValue]);

  // Dynamically set categoryLevel based on zoomValue and maxCategoryLevel
  useEffect(() => {
    // The most detailed (zoomValue=1) is leaf nodes, then each integer up is one level up
    // If maxCategoryLevel=4, then zoomValue=1 (skills), 2 (level 4), 3 (level 3), 4 (level 2), etc.
    // So categoryLevel = maxCategoryLevel - Math.floor(zoomValue) + 1
    const level = Math.max(1, maxCategoryLevel - Math.floor(zoomValue) + 1);
    const finalLevel = level === maxCategoryLevel ? null : level;
    console.log('Category level calculation:', { zoomValue, maxCategoryLevel, calculatedLevel: level, finalLevel });
    setCategoryLevel(finalLevel);
  }, [zoomValue, maxCategoryLevel]);

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

  // Responsive gap between skills/categories
  const nodeCount = data.skills.length;
  const minGap = 40;
  const maxGap = 200;
  const gap = nodeCount > 1 ? Math.max(minGap, Math.min(maxGap, (containerWidth - 100) / (nodeCount - 1))) : 100;
  const svgWidth = containerWidth;
  const svgHeight = yZoom;



  return (
    <div className="w-full h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-4 text-center">
          Skills Timeline Visualization
        </h1>
        {/* Time Axis Zoom Controls */}
        <div className="flex flex-wrap gap-4 justify-center mb-2">
          <div className="flex items-center gap-2 bg-black bg-opacity-60 px-3 py-2 rounded">
            <span className="text-white text-xs">Time Axis</span>
            <button className="bg-gray-700 text-white px-2 rounded" onClick={() => setYZoom(y => Math.max(200, y - 100))}>-</button>
            <span className="text-white text-xs">{yZoom}px</span>
            <button className="bg-gray-700 text-white px-2 rounded" onClick={() => setYZoom(y => Math.min(2000, y + 100))}>+</button>
          </div>
          <div className="flex items-center gap-2 bg-black bg-opacity-60 px-3 py-2 rounded">
            <span className="text-white text-xs">Skill Axis: <span className="font-bold">{categoryLevel === null ? 'Skills' : `Category Level ${categoryLevel}`}</span></span>
            <span className="text-white text-xs">(Scroll horizontally to zoom)</span>
          </div>
        </div>
        <div
          ref={svgContainerRef}
          tabIndex={0}
          className="bg-white rounded-lg p-2 relative w-full"
          style={{ height: 'calc(100vh - 220px)', minHeight: 300, outline: 'none', cursor: 'ew-resize' }}
        >
          <svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight+50}`} style={{ minWidth: 650, minHeight: 400 }}>
            {/* Y axis (time) */}
            <line x1="40" y1="20" x2="40" y2={svgHeight - 20} stroke="#666" strokeWidth="2" />
            {/* Y ticks */}
            {yTicks.map((tick, i) => (
              <g key={i}>
                <line x1="35" y1={tick.y} x2="45" y2={tick.y} stroke="#666" strokeWidth="2" />
                <text x="30" y={tick.y + 3} textAnchor="end" fill="#ccc" color="black" fontSize="12">{tick.label}</text>
              </g>
            ))}
            {/* Skill lanes */}
            {data.skills.map((skill, i) => (
              <line key={skill} x1={i * gap + 70} y1="20" x2={i * gap + 70} y2={svgHeight - 20} stroke="#333" strokeWidth="1" />
            ))}
            {/* Segments */}
            {data.segments.map((segment, idx) => (
              <g key={idx}>
                <line
                  x1={segment.x * gap + 70}
                  y1={segment.y1}
                  x2={segment.x * gap + 70}
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
                    x={segment.x * gap + 60}
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
            {data.gaps.map((gapObj, idx) => (
              <line
                key={idx}
                x1={gapObj.x * gap + 70}
                y1={gapObj.y1}
                x2={gapObj.x * gap + 70}
                y2={gapObj.y2}
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
                  cx={ach.x * gap + 70}
                  cy={ach.y}
                  r="8"
                  fill="#FFD700"
                  stroke="#FFA500"
                  strokeWidth="2"
                />
                <text
                  x={ach.x * gap + 70}
                  y={ach.y - 15}
                  textAnchor="middle"
                  fill="#FFD700"
                  color="black"
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
                x={i * gap + 70}
                y={svgHeight }
                fill="black"
                fontSize="14"
                fontWeight="bold"
                textAnchor="middle"
                transform={`rotate(-45 ${i * gap + 70} ${svgHeight - 5})`}
              >
                {(skill.substring(skill.lastIndexOf('.') + 1, skill.length)).split('_').join(' ')}
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