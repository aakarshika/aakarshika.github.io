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

  // Get current unhighlighted leaf nodes
  const currentUnhighlightedLeafNodes = treeNodes.filter(node => {
    const isLeaf = shouldScaleNode(node, treeNodes, highlightedNodes, scaleUpLeafNodes);
    return isLeaf && !node.isHighlighted;
  });

  // Calculate what the list will look like after the next highlight
  const nextHighlightedNodes = new Set([...highlightedNodes]);
  const nextNode = treeNodes.find(node => node.isPreview);
  if (nextNode) {
    nextHighlightedNodes.add(nextNode.name);
  }

  const nextUnhighlightedLeafNodes = treeNodes.filter(node => {
    const isLeaf = shouldScaleNode(node, treeNodes, nextHighlightedNodes, scaleUpLeafNodes);
    return isLeaf && !nextHighlightedNodes.has(node.name);
  });

  // Determine node states
  const getNodeState = (node) => {
    const isCurrentlyVisible = currentUnhighlightedLeafNodes.some(n => n.name === node.name);
    const willBeVisible = nextUnhighlightedLeafNodes.some(n => n.name === node.name);
    
    if (isCurrentlyVisible && !willBeVisible) {
      return 'removing'; // Will be removed - darken
    } else if (!isCurrentlyVisible && willBeVisible) {
      return 'adding'; // Will be added - lighten
    } else if (isCurrentlyVisible && willBeVisible) {
      return 'staying'; // Will stay - normal
    } else {
      return 'hidden'; // Not visible in either state
    }
  };

  // Find parent nodes for nodes that will be removed
  const findParentNode = (nodeName) => {
    const node = treeNodes.find(n => n.name === nodeName);
    if (!node) return null;
    
    // Find parent by checking which node has this node as a child
    const parent = treeNodes.find(n => n.children.includes(node.id));
    return parent;
  };

  // Get nodes that will be removed and their parents
  const removingNodes = treeNodes.filter(node => getNodeState(node) === 'removing');
  const parentNodes = removingNodes.map(node => findParentNode(node.name)).filter(Boolean);

  // Show nodes that are currently visible, will be visible, or are parents of removing nodes
  const visibleNodes = treeNodes.filter(node => {
    const state = getNodeState(node);
    const isParentOfRemoving = parentNodes.some(parent => parent.name === node.name);
    return state !== 'hidden' || isParentOfRemoving;
  });

  if (visibleNodes.length === 0) return null;

  // Calculate positioning
  const screenWidth = window.innerWidth;
  const containerPadding = 40; // 20px padding on each side
  const availableWidth = screenWidth - containerPadding;
  const boxWidth = 200; // Fixed box width
  const boxHeight = 80; // Fixed box height
  const boxMargin = 20; // Margin between boxes
  
  // Calculate total width needed and spacing
  const totalBoxesWidth = visibleNodes.length * boxWidth;
  const totalMarginsWidth = (visibleNodes.length - 1) * boxMargin;
  const totalWidthNeeded = totalBoxesWidth + totalMarginsWidth;
  
  // If we need more space than available, adjust box width
  const adjustedBoxWidth = totalWidthNeeded > availableWidth 
    ? (availableWidth - totalMarginsWidth) / visibleNodes.length
    : boxWidth;
  
  // Calculate spacing to center the boxes
  const actualTotalWidth = visibleNodes.length * adjustedBoxWidth + totalMarginsWidth;
  const startX = (availableWidth - actualTotalWidth) / 2;

  return (
    <div className="mt-4 bg-gray-800 rounded-lg p-4 border border-gray-600">
      <h3 className="text-lg font-semibold mb-4 text-purple-300">
        Leaf Nodes Preview ({visibleNodes.length})
        {nextNode && (
          <span className="ml-2 text-yellow-400 text-sm">
            • Next: {nextNode.name}
          </span>
        )}
      </h3>
      
      <div 
        className="relative"
        style={{ 
          height: '500px',
          width: '100%',
          overflow: 'hidden'
        }}
      >
        {visibleNodes.map((node, index) => {
          const x = startX + index * (adjustedBoxWidth + boxMargin);
          const y = 50; // Fixed vertical position
          const state = getNodeState(node);
          const isPreview = node.isPreview;
          const isParentOfRemoving = parentNodes.some(parent => parent.name === node.name);
          
          // Determine styling based on state
          let boxClasses = 'absolute rounded-lg p-3 shadow-lg transition-all duration-300';
          let opacity = 1;
          let scale = 1;
          
          switch (state) {
            case 'adding':
              boxClasses += ' bg-green-600 border-2 border-green-400 hover:bg-green-500';
              opacity = 0.6; // Lightened
              break;
            case 'removing':
              boxClasses += ' bg-gray-900 border-2 border-gray-600 hover:bg-gray-800';
              opacity = 0.4; // Darkened
              break;
            case 'staying':
              boxClasses += ' bg-gray-700 border-2 border-purple-400 hover:bg-gray-600 hover:border-purple-300';
              opacity = 1; // Normal
              break;
            case 'hidden':
              // This is a parent node that's not normally visible
              boxClasses += ' bg-blue-600 border-2 border-blue-400 hover:bg-blue-500';
              opacity = 0.8;
              scale = 1.2; // Larger size for parent nodes
              break;
          }
          
          // Override with preview styling if this is the preview node
          if (isPreview) {
            boxClasses = 'absolute rounded-lg p-3 shadow-lg transition-all duration-300 bg-purple-600 border-2 border-yellow-400 hover:bg-purple-500';
            opacity = 0.8;
          }
          
          // Override with parent styling if this is a parent of a removing node
          if (isParentOfRemoving && state !== 'removing' && !isPreview) {
            boxClasses = 'absolute rounded-lg p-3 shadow-lg transition-all duration-300 bg-blue-600 border-2 border-blue-400 hover:bg-blue-500';
            opacity = 0.9;
            scale = 1.2; // Larger size for parent nodes
          }
          
          // Find parent index for removing nodes
          let parentIndex = null;
          if (state === 'removing') {
            const parent = findParentNode(node.name);
            if (parent) {
              const parentVisibleIndex = visibleNodes.findIndex(n => n.name === parent.name);
              parentIndex = parentVisibleIndex >= 0 ? parentVisibleIndex + 1 : null;
            }
          }
          
          return (
            <div
              key={node.id}
              className={boxClasses}
              style={{
                left: `${x}px`,
                top: `${y}px`,
                width: `${adjustedBoxWidth}px`,
                height: `${boxHeight}px`,
                transform: `translateX(-50%) scale(${scale})`, // Center the box and apply scale
                opacity: opacity
              }}
            >
              <div className="flex flex-col h-full justify-center items-center text-center">
                <div className={`text-sm font-semibold mb-1 ${
                  isPreview ? 'text-yellow-300' : 
                  state === 'adding' ? 'text-green-300' :
                  state === 'removing' ? 'text-gray-400' :
                  isParentOfRemoving ? 'text-blue-300' :
                  'text-white'
                }`}>
                  #{index + 1}
                  {isPreview && (
                    <span className="ml-1 text-xs">(Next)</span>
                  )}
                  {state === 'adding' && (
                    <span className="ml-1 text-xs">(Adding)</span>
                  )}
                  {state === 'removing' && (
                    <span className="ml-1 text-xs">(Removing)</span>
                  )}
                  {isParentOfRemoving && (
                    <span className="ml-1 text-xs">(Parent)</span>
                  )}
                </div>
                <div className={`text-xs leading-tight ${
                  isPreview ? 'text-purple-200' :
                  state === 'adding' ? 'text-green-200' :
                  state === 'removing' ? 'text-gray-500' :
                  isParentOfRemoving ? 'text-blue-200' :
                  'text-gray-300'
                }`}>
                  {node.name}
                </div>
                {node.timelineData && node.timelineData.length > 0 && (
                  <div className="text-xs text-yellow-400 mt-1">
                    {node.timelineData.length} periods
                  </div>
                )}
                {state === 'removing' && parentIndex && (
                  <div className="text-xs text-blue-400 mt-1">
                    Parent: #{parentIndex}
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
        <p>Box width: {adjustedBoxWidth.toFixed(1)}px | Total boxes: {visibleNodes.length}</p>
        <p>Total width needed: {totalWidthNeeded}px | Actual total width: {actualTotalWidth.toFixed(1)}px</p>
        {nextNode && (
          <p className="text-yellow-400 mt-1">
            Preview mode: Next node will be "{nextNode.name}"
          </p>
        )}
        <p className="mt-1">
          <span className="text-green-400">Green</span> = Adding, 
          <span className="text-gray-400"> Gray</span> = Removing, 
          <span className="text-purple-400"> Purple</span> = Next,
          <span className="text-blue-400"> Blue</span> = Parent
        </p>
        {removingNodes.length > 0 && (
          <p className="mt-1 text-blue-400">
            Removing nodes: {removingNodes.map(n => n.name).join(', ')}
          </p>
        )}
        {parentNodes.length > 0 && (
          <p className="mt-1 text-blue-400">
            Parent nodes: {parentNodes.map(n => n.name).join(', ')}
          </p>
        )}
      </div>
    </div>
  );
};

export default SkillsList; 