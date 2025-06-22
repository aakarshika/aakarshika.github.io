import React from 'react';
import TimelineBox from './TimelineBox';
import { getRainbowColor } from '../../utils/constants';

/**
 * Individual skill list node component
 * Renders a single node box with appropriate styling based on its state
 * Now includes timeline boxes for time periods and rainbow coloring
 */
const SkillsListNode = ({
  node,
  index,
  animatedX,
  y,
  highlightedCount,
  state,
  isPreview,
  isParentOfRemoving,
  adjustedBoxWidth,
  getRemovingNodeOpacity,
  visibleNodes,
  timelineBoxes = [] // New prop for timeline boxes
}) => {
  // Generate rainbow color based on index
  const rainbowColor = getRainbowColor(index, visibleNodes.length);
  
  // Determine styling based on state
  let boxClasses = 'absolute rounded-lg p-3 shadow-lg';
  let opacity = 1;
  let scale = 1;
  let backgroundColor = rainbowColor;
  let borderColor = rainbowColor;
  
  switch (state) {
    case 'adding':
      boxClasses += ' border-2 hover:opacity-80';
      backgroundColor = rainbowColor;
      borderColor = rainbowColor;
      opacity = getRemovingNodeOpacity(node); // Dynamic opacity based on scroll
      break;
    case 'removing':
      boxClasses += ' border-2 hover:opacity-60';
      backgroundColor = '#1f2937'; // Dark gray for removing
      borderColor = '#4b5563';
      opacity = getRemovingNodeOpacity(node); // Dynamic opacity based on scroll
      break;
    case 'staying':
      boxClasses += ' border-2 hover:opacity-90';
      backgroundColor = rainbowColor;
      borderColor = rainbowColor;
      opacity = 1; // Normal
      break;
    case 'hidden':
      // This is a parent node that's not normally visible
      boxClasses += ' border-2 hover:opacity-80';
      backgroundColor = '#2563eb'; // Blue for parent nodes
      borderColor = '#3b82f6';
      opacity = 0.8;
      scale = 1.2; // Larger size for parent nodes
      break;
  }
  
  // Override with preview styling if this is the preview node
  if (isPreview) {
    boxClasses = 'absolute rounded-lg p-3 shadow-lg border-2 hover:opacity-80';
    backgroundColor = '#8b5cf6'; // Purple for preview
    borderColor = '#fbbf24'; // Yellow border
    opacity = 0.8;
  }
  
  // Override with parent styling if this is a parent of a removing node
  if (isParentOfRemoving && state !== 'removing' && !isPreview) {
    boxClasses = 'absolute rounded-lg p-3 shadow-lg border-2 hover:opacity-80';
    backgroundColor = '#2563eb'; // Blue for parent of removing
    borderColor = '#3b82f6';
    opacity = 0.9;
    scale = 1.2; // Larger size for parent nodes
  }
  const minY = timelineBoxes.reduce((min, box) => Math.min(min, box.y), Infinity);
  const maxY = timelineBoxes.reduce((max, box) => Math.max(max, box.y + box.height), 0);
const nodeChildrenHighlighted = node.childrenHighlighted;
  return (
    <>
      {/* Main node box */}
      
      {/* Timeline boxes */}
      {timelineBoxes.map((timelineBox, boxIndex) => (
        <TimelineBox
          key={timelineBox.id}
          timelineBox={timelineBox}
          x={animatedX}
          width={adjustedBoxWidth}
          state={state}
          nodeChildrenHighlighted={nodeChildrenHighlighted}
          isPreview={isPreview}
          rainbowColor={rainbowColor}
          isParentOfRemoving={isParentOfRemoving}
          getRemovingNodeOpacity={getRemovingNodeOpacity}
        />
      ))}
      <div className="absolute top-0 left-0" 
      style={{ 
        height: `100%`,
        opacity: isParentOfRemoving ? !(nodeChildrenHighlighted > 0) ? 0 : getRemovingNodeOpacity(node) : 1,
        width: `12px`,
        left: `${(animatedX+adjustedBoxWidth/2)-6 }px`,
        top: `${minY}px`,
        backgroundColor: rainbowColor,
        transition: 'all 0.3s ease'
      }}></div>
    </>
  );
};

export default SkillsListNode; 