import React, { useRef } from 'react';
import { useSkillsTree } from '../hooks/useSkillsTree';
import SkillsList from './SkillsList';

/**
 * Visual Tree Component
 * 
 * Displays a hierarchical tree structure of skills with level-by-level highlighting.
 * Users can click a button to highlight nodes one by one, starting from the deepest level.
 * Each node shows accumulated start and end dates from all its children.
 */
const AnimatedSkillsChart = () => {
  const containerRef = useRef(null);
  const {
    scaleUpLeafNodes,
    
    // Data
    treeNodes,
    
    // Actions
    handleHighlightNext,
    handleUnhighlightLast
  } = useSkillsTree();


  const handleDirectionChange = (newDirection) => {
    // console.log('handleDirectionChange', newDirection);
    setDirection(newDirection);
  };

  // Handle animation completion for both forward and backward directions
  const handleAnimationComplete = (direction) => {
    // console.log('onAnimationComplete *******************', direction);
    
    if (direction === 'forward') {
      handleHighlightNext();
    } else if (direction === 'backward') {
      handleUnhighlightLast();
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-auto h-screen bg-gray-900 text-white p-6">
      {/* Skills List */}
      <SkillsList
        treeNodes={treeNodes}
        containerRef={containerRef}
        scaleUpLeafNodes={scaleUpLeafNodes}
        onAnimationComplete={handleAnimationComplete}
        onDirectionChange={handleDirectionChange}
      />
    </div>
  );
};

export default AnimatedSkillsChart; 