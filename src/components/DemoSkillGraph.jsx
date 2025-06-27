import React, { useMemo } from 'react';

/**
 * Demo Skill Graph Component
 * Simple visualization with time on y-axis and nodes spread across x-axis
 */
const DemoSkillGraph = ({ flatNodes }) => {
  // Calculate dimensions and positioning
  const dimensions = useMemo(() => {
    if (!flatNodes || flatNodes.length === 0) {
      return { width: 800, height: 600, nodeWidth: 100, nodeHeight: 60 };
    }

    const width = 1200;
    const height = 600;
    const nodeWidth = 120;
    const nodeHeight = 50;
    const padding = 20;

    return { width, height, nodeWidth, nodeHeight, padding };
  }, [flatNodes]);

  // Calculate x positions for nodes (spread across x-axis)
  const positionedNodes = useMemo(() => {
    if (!flatNodes || flatNodes.length === 0) return [];

    const { width, nodeWidth, padding } = dimensions;
    const availableWidth = width - (padding * 2);
    const spacing = availableWidth / (flatNodes.length + 1);

    return flatNodes.map((node, index) => ({
      ...node,
      x: padding + (spacing * (index + 1)),
      y: node.timelineBoxes && node.timelineBoxes.length > 0 
        ? node.timelineBoxes[0].y 
        : 300 // Default y position if no timeline data
    }));
  }, [flatNodes, dimensions]);

  // Get time range for y-axis
  const timeRange = useMemo(() => {
    if (!flatNodes || flatNodes.length === 0) return { min: 0, max: 600 };

    let minY = Infinity;
    let maxY = -Infinity;

    flatNodes.forEach(node => {
      if (node.timelineBoxes && node.timelineBoxes.length > 0) {
        node.timelineBoxes.forEach(box => {
          minY = Math.min(minY, box.y);
          maxY = Math.max(maxY, box.y + box.height);
        });
      }
    });

    return { min: minY, max: maxY };
  }, [flatNodes]);

  if (!flatNodes || flatNodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-400">
        No data available
      </div>
    );
  }

  const { width, height, nodeWidth, nodeHeight } = dimensions;

  return (
    <div className="w-full h-full flex flex-col items-center">
      <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
        Skills Timeline Demo
      </h2>
      
      <div className="relative border border-gray-600 rounded-lg bg-gray-900/50">
        {/* SVG Container */}
        <svg 
          width={width} 
          height={height} 
          className="block"
          style={{ background: 'rgba(0, 0, 0, 0.1)' }}
        >
          {/* Grid lines for time */}
          {Array.from({ length: 10 }, (_, i) => {
            const y = (height / 10) * i;
            return (
              <line
                key={`grid-${i}`}
                x1={0}
                y1={y}
                x2={width}
                y2={y}
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth={1}
              />
            );
          })}

          {/* Y-axis labels (time) */}
          {Array.from({ length: 6 }, (_, i) => {
            const y = (height / 6) * i;
            const timeValue = timeRange.max - ((timeRange.max - timeRange.min) / 6) * i;
            const date = new Date(timeValue);
            return (
              <text
                key={`time-${i}`}
                x={10}
                y={y + 15}
                fill="rgba(255, 255, 255, 0.6)"
                fontSize="12"
                fontFamily="monospace"
              >
                {date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
              </text>
            );
          })}

          {/* Render nodes */}
          {positionedNodes.map((node, index) => (
            <g key={node.id}>
              {/* Node rectangle */}
              <rect
                x={node.x - nodeWidth / 2}
                y={node.y - nodeHeight / 2}
                width={nodeWidth}
                height={nodeHeight}
                rx={8}
                fill={node.isLeaf ? "#3b82f6" : "#10b981"}
                stroke={node.isLeaf ? "#60a5fa" : "#34d399"}
                strokeWidth={2}
                opacity={0.8}
              />

              {/* Node name */}
              <text
                x={node.x}
                y={node.y + 5}
                textAnchor="middle"
                fill="white"
                fontSize="11"
                fontFamily="sans-serif"
                fontWeight="500"
              >
                {node.name.replace(/_/g, ' ')}
              </text>

              {/* Timeline boxes for this node */}
              {node.timelineBoxes && node.timelineBoxes.map((box, boxIndex) => (
                <rect
                  key={`${node.id}-box-${boxIndex}`}
                  x={node.x - nodeWidth / 2 - 5}
                  y={box.y}
                  width={nodeWidth + 10}
                  height={box.height}
                  fill="rgba(59, 130, 246, 0.3)"
                  stroke="rgba(59, 130, 246, 0.6)"
                  strokeWidth={1}
                  rx={4}
                />
              ))}

              {/* Connection lines to parent */}
              {node.parentId && (
                (() => {
                  const parent = positionedNodes.find(n => n.id === node.parentId);
                  if (parent) {
                    return (
                      <line
                        x1={parent.x}
                        y1={parent.y + nodeHeight / 2}
                        x2={node.x}
                        y2={node.y - nodeHeight / 2}
                        stroke="rgba(255, 255, 255, 0.3)"
                        strokeWidth={1}
                        strokeDasharray="3,3"
                      />
                    );
                  }
                  return null;
                })()
              )}
            </g>
          ))}

          {/* X-axis */}
          <line
            x1={0}
            y1={height - 1}
            x2={width}
            y2={height - 1}
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth={2}
          />

          {/* Y-axis */}
          <line
            x1={0}
            y1={0}
            x2={0}
            y2={height}
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth={2}
          />
        </svg>

        {/* Legend */}
        <div className="absolute top-4 right-4 bg-gray-800/80 p-3 rounded-lg text-white text-sm">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span>Leaf Nodes</span>
          </div>
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Parent Nodes</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500/30 border border-blue-500/60 rounded"></div>
            <span>Timeline Periods</span>
          </div>
        </div>

        {/* Stats */}
        <div className="absolute bottom-4 left-4 bg-gray-800/80 p-3 rounded-lg text-white text-sm">
          <div>Total Nodes: {flatNodes.length}</div>
          <div>Leaf Nodes: {flatNodes.filter(n => n.isLeaf).length}</div>
          <div>Parent Nodes: {flatNodes.filter(n => !n.isLeaf).length}</div>
        </div>
      </div>

      {/* Node details on hover */}
      <div className="mt-4 text-center text-gray-300 text-sm">
        <p>Hover over nodes to see timeline data</p>
        <p className="text-xs text-gray-500 mt-1">
          Y-axis: Time progression | X-axis: Skills spread
        </p>
      </div>
    </div>
  );
};

export default DemoSkillGraph; 