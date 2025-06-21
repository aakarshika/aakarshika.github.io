import React from 'react';

/**
 * Header component for SkillsList
 * Displays title and status information
 */
const SkillsListHeader = ({
  visibleNodes,
  nextNode,
  removingNodes,
  scrollProgress
}) => {
  return (
    <h3 className="text-lg font-semibold mb-4 text-purple-300">
      Leaf Nodes Preview ({visibleNodes.length})
      {nextNode && (
        <span className="ml-2 text-yellow-400 text-sm">
          • Next: {nextNode.name}
        </span>
      )}
      {removingNodes.length > 0 && (
        <span className="ml-2 text-blue-400 text-sm">
          • Scroll to animate ({Math.round(scrollProgress * 100)}%)
        </span>
      )}
    </h3>
  );
};

export default SkillsListHeader; 