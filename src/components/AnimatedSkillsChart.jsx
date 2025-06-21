import React from 'react';
import { useSkillsTree } from '../hooks/useSkillsTree';
import SkillsTreeControls from './SkillsTreeControls';
import SkillsTreeVisualization from './SkillsTreeVisualization';
import TimelineInfoPanel from './TimelineInfoPanel';

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
    resetHighlighting
  } = useSkillsTree();

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
        onHighlightNext={handleHighlightNext}
        onReset={resetHighlighting}
      />
      
      {/* Tree Visualization */}
      <SkillsTreeVisualization
        treeNodes={treeNodes}
        treeBounds={treeBounds}
        treeWidth={treeWidth}
        treeHeight={treeHeight}
        onNodeClick={setHoveredNode}
      />
      
      {/* Timeline Information Panel */}
      <TimelineInfoPanel hoveredNode={hoveredNode} />
    </div>
  );
};

export default AnimatedSkillsChart; 