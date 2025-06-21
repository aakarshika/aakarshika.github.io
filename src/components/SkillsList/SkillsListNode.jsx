import React from 'react';

/**
 * Individual skill list node component
 * Renders a single node box with appropriate styling based on its state
 */
const SkillsListNode = ({
  node,
  index,
  baseX,
  animatedX,
  y,
  state,
  isPreview,
  isParentOfRemoving,
  parentIndex,
  adjustedBoxWidth,
  boxHeight,
  getRemovingNodeOpacity,
  findParentNode,
  visibleNodes
}) => {
  // Determine styling based on state
  let boxClasses = 'absolute rounded-lg p-3 shadow-lg';
  let opacity = 1;
  let scale = 1;
  
  switch (state) {
    case 'adding':
      boxClasses += ' bg-green-600 border-2 border-green-400 hover:bg-green-500';
      opacity = 0.6; // Lightened
      break;
    case 'removing':
      boxClasses += ' bg-gray-900 border-2 border-gray-600 hover:bg-gray-800';
      opacity = getRemovingNodeOpacity(node); // Dynamic opacity based on scroll
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
    boxClasses = 'absolute rounded-lg p-3 shadow-lg bg-purple-600 border-2 border-yellow-400 hover:bg-purple-500';
    opacity = 0.8;
  }
  
  // Override with parent styling if this is a parent of a removing node
  if (isParentOfRemoving && state !== 'removing' && !isPreview) {
    boxClasses = 'absolute rounded-lg p-3 shadow-lg bg-blue-600 border-2 border-blue-400 hover:bg-blue-500';
    opacity = 0.9;
    scale = 1.2; // Larger size for parent nodes
  }

  return (
    <div
      className={boxClasses}
      style={{
        left: `${animatedX}px`,
        top: `${y}px`,
        width: `${adjustedBoxWidth}px`,
        height: `${boxHeight}px`,
        transform: `translateX(-50%) scale(${scale})`, // Center the box and apply scale
        opacity: opacity,
        // Remove all transitions for removing nodes to make movement immediate
        transition: state === 'removing' ? 'none' : 'all 0.3s ease'
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
};

export default SkillsListNode; 