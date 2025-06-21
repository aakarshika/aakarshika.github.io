import React from 'react';
import { shouldScaleNode } from '../utils/skillDataUtils';

/**
 * Skills List Component
 * 
 * Displays unhighlighted leaf nodes in a horizontal list with evenly spaced boxes
 */
const SkillsList = ({ 
  treeNodes, 
  highlightedNodes, 
  scaleUpLeafNodes
}) => {
  if (!scaleUpLeafNodes) return null;

  // Get unhighlighted leaf nodes
  const unhighlightedLeafNodes = treeNodes.filter(node => {
    const isLeaf = shouldScaleNode(node, treeNodes, highlightedNodes, scaleUpLeafNodes);
    return isLeaf && !node.isHighlighted;
  });

  if (unhighlightedLeafNodes.length === 0) return null;

  // Calculate positioning
  const screenWidth = window.innerWidth;
  const containerPadding = 40; // 20px padding on each side
  const availableWidth = screenWidth - containerPadding;
  const boxWidth = 200; // Fixed box width
  const boxHeight = 80; // Fixed box height
  const boxMargin = 20; // Margin between boxes
  
  // Calculate total width needed and spacing
  const totalBoxesWidth = unhighlightedLeafNodes.length * boxWidth;
  const totalMarginsWidth = (unhighlightedLeafNodes.length - 1) * boxMargin;
  const totalWidthNeeded = totalBoxesWidth + totalMarginsWidth;
  
  // If we need more space than available, adjust box width
  const adjustedBoxWidth = totalWidthNeeded > availableWidth 
    ? (availableWidth - totalMarginsWidth) / unhighlightedLeafNodes.length
    : boxWidth;
  
  // Calculate spacing to center the boxes
  const actualTotalWidth = unhighlightedLeafNodes.length * adjustedBoxWidth + totalMarginsWidth;
  const startX = (availableWidth - actualTotalWidth) / 2;

  return (
    <div className="mt-4 bg-gray-800 rounded-lg p-4 border border-gray-600">
      <h3 className="text-lg font-semibold mb-4 text-purple-300">
        Unhighlighted Leaf Nodes ({unhighlightedLeafNodes.length})
      </h3>
      
      <div 
        className="relative"
        style={{ 
          height: '500px',
          width: '100%',
          overflow: 'hidden'
        }}
      >
        {unhighlightedLeafNodes.map((node, index) => {
          const x = startX + index * (adjustedBoxWidth + boxMargin);
          const y = 50; // Fixed vertical position
          
          return (
            <div
              key={node.id}
              className="absolute bg-gray-700 border-2 border-purple-400 rounded-lg p-3 shadow-lg transition-all duration-300 hover:bg-gray-600 hover:border-purple-300"
              style={{
                left: `${x}px`,
                top: `${y}px`,
                width: `${adjustedBoxWidth}px`,
                height: `${boxHeight}px`,
                transform: 'translateX(-50%)' // Center the box on its position
              }}
            >
              <div className="flex flex-col h-full justify-center items-center text-center">
                <div className="text-sm font-semibold text-white mb-1">
                  #{index + 1}
                </div>
                <div className="text-xs text-gray-300 leading-tight">
                  {node.name}
                </div>
                {node.timelineData && node.timelineData.length > 0 && (
                  <div className="text-xs text-yellow-400 mt-1">
                    {node.timelineData.length} periods
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Debug info */}
      <div className="mt-4 text-xs text-gray-400">
        <p>Screen width: {screenWidth}px | Available width: {availableWidth}px</p>
        <p>Box width: {adjustedBoxWidth.toFixed(1)}px | Total boxes: {unhighlightedLeafNodes.length}</p>
        <p>Total width needed: {totalWidthNeeded}px | Actual total width: {actualTotalWidth.toFixed(1)}px</p>
      </div>
    </div>
  );
};

export default SkillsList; 