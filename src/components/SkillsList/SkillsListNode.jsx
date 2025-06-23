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
  // Only use the timelineBox with the smallest minY (smallest y value)
  const smallestMinYBox = timelineBoxes.reduce((minBox, box) =>
    box.y < (minBox ? minBox.y : Infinity) ? box : minBox, null);
  const minY = smallestMinYBox ? smallestMinYBox.y : Infinity;
  const maxY = smallestMinYBox ? smallestMinYBox.y + smallestMinYBox.height : 0;
  const nodeChildrenHighlighted = node.childrenHighlighted;
  return (
    <>
      {/* Main node box */}
      {node.name == 'root' && (
        <div className="absolute h-full w-full flex items-center justify-center " 
        style={{ 
          height: `100%`,
          transition: 'all 0.3s ease'
        }}>
          <div className="text-2xl w-60 rounded-lg p-3 shadow-lg items-center justify-center flex font-semibold text-white leading-tight text-center"
        style={{ 
          height: `100%`,
          backgroundColor: rainbowColor,
        }}>
            Awesomeness
          </div>
        </div>
      )}
      
      {/* Timeline box (only the one with smallest minY) */}
      {smallestMinYBox && (
        <TimelineBox
          key={smallestMinYBox.id}
          timelineBox={smallestMinYBox}
          x={animatedX}
          width={adjustedBoxWidth}
          state={state}
          nodeChildrenHighlighted={nodeChildrenHighlighted}
          isPreview={isPreview}
          rainbowColor={rainbowColor}
          isParentOfRemoving={isParentOfRemoving}
          getRemovingNodeOpacity={getRemovingNodeOpacity}
        />
      )}
    </>
  );
};

export default SkillsListNode; 