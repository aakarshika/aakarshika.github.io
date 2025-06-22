import React, { useRef } from 'react';
import { useSkillsTree } from '../hooks/useSkillsTree';
import SkillsTreeControls from './SkillsTreeControls';
import SkillsTreeVisualization from './SkillsTreeVisualization';
import TimelineInfoPanel from './TimelineInfoPanel';
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
    // State
    isProcessing,
    hoveredNode,
    setHoveredNode,
    showOnlyWithData,
    scaleUpLeafNodes,
    direction,
    
    // Data
    treeNodes,
    treeBounds,
    treeWidth,
    treeHeight,
    
    // Statistics
    totalTimelineEntries,
    skillToTimeline,
    categoryToSkills,
    
    // Actions
    handleHighlightNext,
    handleUnhighlightLast,
    handleHighlightDirection,
    resetHighlighting,
    toggleShowOnlyWithData,
    toggleScaleUpLeafNodes,
    toggleDirection,
    setDirection
  } = useSkillsTree();

  // // Create a function to handle unhighlighting the last node
  // const handleUnhighlightLast = () => {
  //   console.log('handleUnhighlightLast');
  //   handleHighlightDirection('backward');
  // };

  // // const handleHighlightNext = () => {
  // //   console.log('handleHighlightNext');
  // //   handleHighlightDirection('forward');
  // // };

  // const handleHighlightDirectionAnimationComplete = (e) => {
  //   console.log('handleHighlightDirectionAnimationComplete', e);
  //   handleHighlightDirection(e);
  // };

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
      {/* Header and Controls */}
      <SkillsTreeControls
        isProcessing={isProcessing}
        totalTimelineEntries={totalTimelineEntries}
        treeNodes={treeNodes}
        skillToTimeline={skillToTimeline}
        categoryToSkills={categoryToSkills}
        showOnlyWithData={showOnlyWithData}
        scaleUpLeafNodes={scaleUpLeafNodes}
        onHighlightNext={handleHighlightNext}
        onUnhighlightLast={handleUnhighlightLast}
        onReset={resetHighlighting}
        onToggleShowOnlyWithData={toggleShowOnlyWithData}
        onToggleScaleUpLeafNodes={toggleScaleUpLeafNodes}
      />
      
      {/* Tree Visualization */}
      {!scaleUpLeafNodes && (<SkillsTreeVisualization
        treeNodes={treeNodes}
        scaleUpLeafNodes={scaleUpLeafNodes}
        onNodeClick={setHoveredNode}
      />)}
      
      {/* Timeline Information Panel */}
      {/* <TimelineInfoPanel hoveredNode={hoveredNode} /> */}
      
      {/* Skills List */}
      <SkillsList
        treeNodes={treeNodes}
        containerRef={containerRef}
        scaleUpLeafNodes={scaleUpLeafNodes}
        onAnimationComplete={handleAnimationComplete}
        direction={direction}
        onDirectionChange={handleDirectionChange}
      />
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Visual Tree Structure</h1>
        <p className="text-gray-400 text-sm mb-4">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.      
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.      
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.      
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.      
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.      
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.      
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.      
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.      
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.      
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.      
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.      
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.      
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.      
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.      
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.      
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.      
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.      
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.      
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
        </p>
      </div>
    </div>
  );
};

export default AnimatedSkillsChart; 