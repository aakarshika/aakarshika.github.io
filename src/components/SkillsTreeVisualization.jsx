import React from 'react';
import { SVG_MARGIN, COLORS, NODE_SIZES } from '../utils/constants';
import { shouldScaleNode } from '../utils/skillDataUtils';

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
  scaleUpLeafNodes = false,
  highlightedNodes = new Set(),
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

  /**
   * Gets the appropriate node size based on scaling state
   * @param {Object} node - Node object
   * @param {boolean} isHighlighted - Whether node is highlighted
   * @returns {number} Radius size
   */
  const getNodeSize = (node, isHighlighted) => {
    const isConsideredLeaf = shouldScaleNode(node, treeNodes, highlightedNodes, scaleUpLeafNodes);    
    
    if(scaleUpLeafNodes) {
      if(isConsideredLeaf && !isHighlighted){
        return NODE_SIZES.scaled.radius;
      }
      return 0;
    }
    if (!scaleUpLeafNodes) {
      return isHighlighted ? NODE_SIZES.normal.highlightedRadius : NODE_SIZES.normal.radius;
    }
  };

  /**
   * Gets the index of unhighlighted leaf nodes for display
   * @returns {Object} Mapping of node names to their indices
   */
  const getUnhighlightedLeafIndices = () => {
    if (!scaleUpLeafNodes) return {};
    
    const unhighlightedLeafNodes = treeNodes.filter(node => {
      const isLeaf = shouldScaleNode(node, treeNodes, highlightedNodes, scaleUpLeafNodes);
      return isLeaf && !node.isHighlighted;
    });
    
    const indices = {};
    unhighlightedLeafNodes.forEach((node, index) => {
      indices[node.name] = index + 1; // 1-based indexing
    });
    
    return indices;
  };

  const unhighlightedLeafIndices = getUnhighlightedLeafIndices();
  const totalUnhighlightedLeaves = Object.keys(unhighlightedLeafIndices).length;

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
      <div className="text-sm text-gray-400 mb-4">
        Tree: {treeNodes.length} nodes
        {scaleUpLeafNodes && (
          <span className="ml-2 text-purple-400">
            • Showing {totalUnhighlightedLeaves} unhighlighted leaf nodes
          </span>
        )}
      </div>
      
      <svg 
        width={treeWidth + margin.left + margin.right} 
        height={treeHeight + margin.top + margin.bottom}
        className="w-full"
      >
        {/* Connections */}
        {!scaleUpLeafNodes && treeNodes.map(node => (
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
        {treeNodes.map(node => {
          const size = getNodeSize(node, node.isHighlighted);
          return size > 0 && (
            <g key={node.id}>
              {/* Background circle for nodes with timeline data */}
              {node.timelineData && node.timelineData.length > 0 && (
                <circle
                  cx={transformX(node.x)}
                  cy={transformY(node.y)}
                  r={size}
                  fill={COLORS.timeline.background}
                  stroke={COLORS.timeline.stroke}
                  strokeWidth={1}
                  opacity={node.isPreview ? 0.6 : 1}
                  className="transition-all duration-300"
                />
              )}
              
              <circle
                cx={transformX(node.x)}
                cy={transformY(node.y)}
                r={size}
                fill={node.isPreview ? '#8b5cf6' : (node.isHighlighted ? COLORS.highlighted.node : COLORS.normal.node)}
                stroke={node.isPreview ? '#a78bfa' : (node.isHighlighted ? COLORS.highlighted.stroke : COLORS.normal.stroke)}
                strokeWidth={node.isPreview ? 3 : (node.isHighlighted ? 2 : 1)}
                opacity={node.isPreview ? 0.8 : 1}
                className="transition-all duration-300 cursor-pointer"
                onClick={() => onNodeClick && onNodeClick(node)}
              />
              
              <text
                x={transformX(node.x)}
                y={transformY(node.y) + 20}
                textAnchor="middle"
                fill={node.isPreview ? '#a78bfa' : (node.isHighlighted ? COLORS.highlighted.text : COLORS.normal.text)}
                fontSize="12px"
                opacity={node.isPreview ? 0.8 : 1}
                transform={`rotate(-45 ${transformX(node.x)} ${transformY(node.y) + 20})`}
              >
                {node.name}
                {node.isPreview && (
                  <tspan x={transformX(node.x)} dy="12" fill="#fbbf24" fontSize="10px">
                    (Next)
                  </tspan>
                )}
              </text>
              
              {/* Timeline data count and index display */}
              {node.timelineData && node.timelineData.length > 0 && (
                <text
                  x={transformX(node.x)}
                  y={transformY(node.y) + 35}
                  textAnchor="middle"
                  fill={COLORS.timeline.text}
                  fontSize="10px"
                  fontWeight="bold"
                  opacity={node.isPreview ? 0.8 : 1}
                  transform={`rotate(-45 ${transformX(node.x)} ${transformY(node.y) + 35})`}
                >
                  {node.timelineData.length} periods
                  {scaleUpLeafNodes && unhighlightedLeafIndices[node.name] && (
                    <tspan x={transformX(node.x)} dy="12" fill="white">
                      #{unhighlightedLeafIndices[node.name]}
                    </tspan>
                  )}
                </text>
              )}
              
              {/* Index display for nodes without timeline data */}
              {scaleUpLeafNodes && unhighlightedLeafIndices[node.name] && (!node.timelineData || node.timelineData.length === 0) && (
                <text
                  x={transformX(node.x)}
                  y={transformY(node.y) + 35}
                  textAnchor="middle"
                  fill="white"
                  fontSize="10px"
                  fontWeight="bold"
                  opacity={node.isPreview ? 0.8 : 1}
                  transform={`rotate(-45 ${transformX(node.x)} ${transformY(node.y) + 35})`}
                >
                  #{unhighlightedLeafIndices[node.name]}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  );
};

export default SkillsTreeVisualization; 