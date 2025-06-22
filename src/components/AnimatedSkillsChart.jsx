import React from 'react';
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
  const {
    // State
    highlightedNodes,
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
    console.log('handleDirectionChange', newDirection);
    setDirection(newDirection);
  };

  return (
    <div className="w-auto h-screen bg-gray-900 text-white p-6">
      {/* Header and Controls */}
      <SkillsTreeControls
        highlightedNodes={highlightedNodes}
        isProcessing={isProcessing}
        totalTimelineEntries={totalTimelineEntries}
        treeNodes={treeNodes}
        skillToTimeline={skillToTimeline}
        categoryToSkills={categoryToSkills}
        showOnlyWithData={showOnlyWithData}
        scaleUpLeafNodes={scaleUpLeafNodes}
        onHighlightNext={handleHighlightNext}
        // onUnhighlightLast={handleUnhighlightLast}
        onReset={resetHighlighting}
        onToggleShowOnlyWithData={toggleShowOnlyWithData}
        onToggleScaleUpLeafNodes={toggleScaleUpLeafNodes}
      />
      
      {/* Tree Visualization */}
      {!scaleUpLeafNodes && (<SkillsTreeVisualization
        treeNodes={treeNodes}
        treeBounds={treeBounds}
        treeWidth={treeWidth}
        treeHeight={treeHeight}
        scaleUpLeafNodes={scaleUpLeafNodes}
        highlightedNodes={highlightedNodes}
        onNodeClick={setHoveredNode}
      />)}
      
      {/* Timeline Information Panel */}
      {/* <TimelineInfoPanel hoveredNode={hoveredNode} /> */}
      
      {/* Skills List */}
      <SkillsList
        treeNodes={treeNodes}
        highlightedNodes={highlightedNodes}
        scaleUpLeafNodes={scaleUpLeafNodes}
        onAnimationComplete={handleHighlightNext}
        direction={direction}
        onDirectionChange={handleDirectionChange}
      />
    </div>
  );
};

export default AnimatedSkillsChart; 