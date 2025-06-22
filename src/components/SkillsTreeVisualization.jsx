import React from 'react';
import { getRainbowColor, COLORS, NODE_SIZES } from '../utils/constants';
import { shouldScaleNode } from '../utils/skillDataUtils';
import { calculateTreeBounds, createTransformFunctions } from '../utils/treeUtils';

/**
 * Skills Tree Visualization Component
 * 
 * Renders a hierarchical tree visualization of skills using D3
 * Shows nodes with different sizes and colors based on highlighting state
 */
const SkillsTreeVisualization = ({ 
  treeNodes = [], 
  scaleUpLeafNodes = false,
  onNodeClick 
}) => {
  // Calculate tree bounds and transform functions using shared utilities
  const bounds = calculateTreeBounds(treeNodes);
  const { width, height } = { width: bounds.maxX - bounds.minX + 200, height: bounds.maxY - bounds.minY + 200 };
  const { transformX, transformY } = createTransformFunctions(bounds);

  // Create index mapping for unhighlighted leaf nodes
  const unhighlightedLeafIndices = {};
  if (scaleUpLeafNodes) {
    const unhighlightedLeafNodes = treeNodes.filter(node => {
      const isLeaf = shouldScaleNode(node, treeNodes, scaleUpLeafNodes);
      return isLeaf && !node.isHighlighted;
    });
    
    unhighlightedLeafNodes.forEach((node, index) => {
      unhighlightedLeafIndices[node.name] = index + 1;
    });
  }

  /**
   * Get node size based on highlighting state and leaf node scaling
   * @param {Object} node - Node object
   * @param {boolean} isHighlighted - Whether node is highlighted
   * @returns {number} Node radius
   */
  const getNodeSize = (node, isHighlighted) => {
    // Check if this node should be considered a leaf for scaling
    const isConsideredLeaf = shouldScaleNode(node, treeNodes, scaleUpLeafNodes);
    
    // Scale up leaf nodes that are not highlighted
    if(isConsideredLeaf && !isHighlighted){
      return NODE_SIZES.scaled.radius;
    }
    
    // Scale up nodes with highlighted children
    if (node.childrenHighlighted > 0) {
      return NODE_SIZES.normal.highlightedRadius;
    }
    
    return isHighlighted ? NODE_SIZES.normal.highlightedRadius : NODE_SIZES.normal.radius;
  };

  return (
    <div className="relative bg-gray-900 rounded-lg p-4 border border-gray-600">
      <svg 
        width={width} 
        height={height} 
        className="w-full h-auto"
        style={{ maxHeight: '600px' }}
      >
        {/* Connections between nodes */}
        {treeNodes
          .filter(node => {
            const isLeaf = shouldScaleNode(node, treeNodes, scaleUpLeafNodes);
            return isLeaf && !node.isHighlighted && node.children && node.children.length > 0;
          })
          .map((node) => 
            node.children.map((childId) => {
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
                  opacity={0.6}
                />
              );
            })
          ).flat().filter(Boolean)}

        {/* Nodes */}
        {treeNodes.map((node, index) => {
          const size = getNodeSize(node, node.isHighlighted);
          const rainbowColor = getRainbowColor(index, treeNodes.length);
          
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
                fill={node.isPreview ? '#8b5cf6' : (node.isHighlighted ? COLORS.highlighted.node : rainbowColor)}
                stroke={node.isPreview ? '#a78bfa' : (node.isHighlighted ? COLORS.highlighted.stroke : rainbowColor)}
                strokeWidth={node.isPreview ? 3 : (node.isHighlighted ? 2 : 1)}
                opacity={node.isPreview ? 0.8 : 1}
                className="transition-all duration-300 cursor-pointer"
                onClick={() => onNodeClick && onNodeClick(node)}
              />
              
              <text
                x={transformX(node.x)}
                y={transformY(node.y) + 20}
                textAnchor="middle"
                fill={node.isPreview ? '#a78bfa' : (node.isHighlighted ? COLORS.highlighted.text : 'white')}
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