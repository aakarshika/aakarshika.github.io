import React from 'react';
import { SVG_MARGIN, COLORS } from '../utils/constants';

/**
 * Skills Tree Visualization Component
 * 
 * Renders the hierarchical tree structure with nodes and connections
 */
const SkillsTreeVisualization = ({ 
  treeNodes, 
  treeBounds, 
  treeWidth, 
  treeHeight, 
  margin = SVG_MARGIN,
  onNodeClick 
}) => {
  const transformX = (x) => {
    if (treeNodes.length === 0) return margin.left;
    return x - treeBounds.minX + margin.left + 100; // Add extra padding
  };
  
  const transformY = (y) => {
    if (treeNodes.length === 0) return margin.top;
    return y - treeBounds.minY + margin.top + 50; // Add extra padding
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
      <div className="text-sm text-gray-400 mb-4">
        Tree: {treeNodes.length} nodes
      </div>
      
      <svg 
        width={treeWidth + margin.left + margin.right} 
        height={treeHeight + margin.top + margin.bottom}
        className="w-full"
      >
        {/* Connections */}
        {treeNodes.map(node => (
          node.children.length > 0 && node.children.map(childId => {
            const child = treeNodes.find(n => n.id === childId);
            if (!child) return null;
            
            return (
              <line
                key={`${node.id}-${childId}`}
                x1={transformX(node.x)}
                y1={transformY(node.y)}
                x2={transformX(child.x)}
                y2={transformY(child.y)}
                stroke={node.isHighlighted && child.isHighlighted ? COLORS.connection.highlighted : COLORS.connection.normal}
                strokeWidth={node.isHighlighted && child.isHighlighted ? 2 : 1}
                className="transition-all duration-300"
              />
            );
          })
        ))}
        
        {/* Nodes */}
        {treeNodes.map(node => (
          <g key={node.id}>
            {/* Background circle for nodes with timeline data */}
            {node.timelineData && node.timelineData.length > 0 && (
              <circle
                cx={transformX(node.x)}
                cy={transformY(node.y)}
                r={node.isHighlighted ? 12 : 10}
                fill={COLORS.timeline.background}
                stroke={COLORS.timeline.stroke}
                strokeWidth={1}
                className="transition-all duration-300"
              />
            )}
            
            <circle
              cx={transformX(node.x)}
              cy={transformY(node.y)}
              r={node.isHighlighted ? 8 : 6}
              fill={node.isHighlighted ? COLORS.highlighted.node : COLORS.normal.node}
              stroke={node.isHighlighted ? COLORS.highlighted.stroke : COLORS.normal.stroke}
              strokeWidth={node.isHighlighted ? 2 : 1}
              className="transition-all duration-300 cursor-pointer"
              onClick={() => onNodeClick && onNodeClick(node)}
            />
            
            <text
              x={transformX(node.x)}
              y={transformY(node.y) + 20}
              textAnchor="middle"
              fill={node.isHighlighted ? COLORS.highlighted.text : COLORS.normal.text}
              fontSize="12px"
              transform={`rotate(-45 ${transformX(node.x)} ${transformY(node.y) + 20})`}
            >
              {node.name}
            </text>
            
            {/* Timeline data count display */}
            {node.timelineData && node.timelineData.length > 0 && (
              <text
                x={transformX(node.x)}
                y={transformY(node.y) + 35}
                textAnchor="middle"
                fill={COLORS.timeline.text}
                fontSize="10px"
                fontWeight="bold"
                transform={`rotate(-45 ${transformX(node.x)} ${transformY(node.y) + 35})`}
              >
                {node.timelineData.length} periods
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
};

export default SkillsTreeVisualization; 