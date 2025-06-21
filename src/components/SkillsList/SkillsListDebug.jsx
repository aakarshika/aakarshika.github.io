import React from 'react';

/**
 * Debug information component for SkillsList
 * Displays technical details and state information
 */
const SkillsListDebug = ({
  positioning,
  visibleNodes,
  nextNode,
  removingNodes,
  parentNodes,
  scrollProgress,
  scrollSpeed
}) => {
  if (!positioning) return null;

  return (
    <div className="mt-4 text-xs text-gray-400">
      <p>Screen width: {positioning.screenWidth}px | Available width: {positioning.availableWidth}px</p>
      <p>Box width: {positioning.adjustedBoxWidth.toFixed(1)}px | Total boxes: {visibleNodes.length}</p>
      <p>Total width needed: {positioning.totalWidthNeeded}px | Actual total width: {positioning.actualTotalWidth.toFixed(1)}px</p>
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
      {removingNodes.length > 0 && (
        <p className="mt-1 text-orange-400">
          Scroll progress: {Math.round(scrollProgress * 100)}% | Speed: {scrollSpeed.toFixed(2)}x
        </p>
      )}
    </div>
  );
};

export default SkillsListDebug; 