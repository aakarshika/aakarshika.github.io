import React from 'react';
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
  onHover,
  timelineBoxes = [] // New prop for timeline boxes
}) => {

  // Generate rainbow color based on index
  const rainbowColor = getRainbowColor(index, visibleNodes.length);
  
  
  // Only use the timelineBox with the smallest minY (smallest y value)
  const timelineBox = timelineBoxes.reduce((minBox, box) =>
    box.y < (minBox ? minBox.y : Infinity) ? box : minBox, null);
  const nodeChildrenHighlighted = node.childrenHighlighted;
  // Determine styling based on state
  let boxClasses = 'absolute rounded ';
  let zIndex = 10;
  switch (state) {
    case 'adding':
      zIndex = 11;
      break;
    case 'removing':
      zIndex = 9;
      break;
    case 'staying':
      zIndex = 8;
      break;
    case 'hidden':
      zIndex = 7;
      break;
  }
  
  // Override with preview styling if this is the preview node
  if (isPreview) {
    boxClasses = 'absolute rounded    ';
    zIndex = 7;
  }
  
  // Override with parent styling if this is a parent of a removing node
  if (isParentOfRemoving && nodeChildrenHighlighted > 0) {
    boxClasses = 'absolute rounded bg-gray-800';
    zIndex = 11;
  }

  // Format dates for display
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
  };
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
      {timelineBoxes.map((timelineBox) => (
        
    <div
    key={timelineBox.startDate+'-'+timelineBox.name+'-'+timelineBox.company+'-'+timelineBox.endDate+'-'+index}
    className={boxClasses}
    style={{
      left: `${animatedX}px`,
      top: `${timelineBox.y}px`,
      width: `${timelineBox.name == 'root' ? 0 : adjustedBoxWidth}px`,
      height: `${timelineBox.height}px`,
      opacity:isParentOfRemoving ? !(nodeChildrenHighlighted > 0) ? 0 : 1 : 1,
      backgroundColor: rainbowColor,
      zIndex: zIndex,
      // transform: 'translateX(-50%)', // Center the box
      transition: 'all 0.3s ease'
    }}
    onMouseEnter={(event) => {
      console.log('Timeline box hovered:', timelineBox);
      onHover(timelineBox, true, event);
    }}
    onMouseLeave={(event) => {
      console.log('Timeline box unhovered:', timelineBox);
      onHover(timelineBox, false, event);
    }}
  >
    {/* Show content only if box is tall enough */}
    {timelineBox.height > 20 && timelineBox.name != 'root' && (
      <div  className="flex flex-col h-full justify-center items-center text-center">
        <div
          className="text-lg font-semibold text-white leading-tight"
          style={{
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            textAlign: 'center',
            adjustedBoxWidth: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            overflow: 'hidden',
          }}
        >
          {timelineBox.name.split('_').join(' ').toUpperCase()}
        </div>
      </div>
    )}
  </div>
      ))}
    </>
  );
};

export default SkillsListNode; 