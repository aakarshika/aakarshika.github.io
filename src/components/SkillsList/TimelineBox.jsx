import React from 'react';

/**
 * Individual timeline box component
 * Represents a single time period for a skill node
 */
const TimelineBox = ({
  timelineBox,
  x,
  width,
  state,
  isPreview,
  isParentOfRemoving,
  rainbowColor,
  getRemovingNodeOpacity
}) => {
  // Determine styling based on state
  let boxClasses = 'absolute rounded shadow-sm ';
  let opacity = 1;
  let zIndex = 10;
  switch (state) {
    case 'adding':
      boxClasses += '';
      opacity = getRemovingNodeOpacity ? getRemovingNodeOpacity() : 0.5; // Dynamic opacity based on scroll
      zIndex = 11;
      break;
    case 'removing':
      boxClasses += '';
      opacity = getRemovingNodeOpacity ? getRemovingNodeOpacity() : 1; // Dynamic opacity based on scroll
      zIndex = 9;
      break;
    case 'staying':
      boxClasses += '';
      opacity = 1; // Normal
      zIndex = 8;
      break;
    case 'hidden':
      boxClasses += '';
      opacity = 0.8;
      zIndex = 7;
      break;
  }
  
  // Override with preview styling if this is the preview node
  if (isPreview) {
    boxClasses = 'absolute rounded shadow-sm   ';
    opacity = 0.8;
    zIndex = 7;
  }
  
  // Override with parent styling if this is a parent of a removing node
  if (isParentOfRemoving && state !== 'removing' && !isPreview) {
    boxClasses = 'absolute rounded shadow-lg shadow-red-800  bg-gray-800';
    opacity = 0.1;
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
    <div
      className={boxClasses}
      style={{
        left: `${x}px`,
        top: `${timelineBox.y}px`,
        width: `${width}px`,
        height: `${timelineBox.height}px`,
        opacity: 1,
        backgroundColor: rainbowColor,
        zIndex: zIndex,
        // transform: 'translateX(-50%)', // Center the box
        transition: state === 'removing' || state === 'adding' ? 'none' : 'all 0.3s ease'
      }}
      title={`${timelineBox.company || 'Unknown Company'} - ${timelineBox.expertise} (${formatDate(timelineBox.startDate)} to ${formatDate(timelineBox.endDate)})`}
    >
      {/* Show content only if box is tall enough */}
      {timelineBox.height > 20 && (
        <div className="flex flex-col h-full justify-center items-center text-center">
          <div className="text-xs font-semibold text-white leading-tight">
            {timelineBox.name}
          </div>
          {/* {timelineBox.height > 30 && (
            <div className="text-xs text-white opacity-80 leading-tight">
              {timelineBox.company}
            </div>
          )} */}
        </div>
      )}
    </div>
  );
};

export default TimelineBox; 