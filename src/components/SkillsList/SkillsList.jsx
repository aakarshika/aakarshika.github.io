import React, { useRef } from 'react';
import { useSkillsListData } from './useSkillsListData';
import { useScrollAnimation } from './useScrollAnimation';
import { useTimelineData } from './useTimelineData';
import SkillsListHeader from './SkillsListHeader';
import SkillsListNode from './SkillsListNode';
import SkillsListDebug from './SkillsListDebug';

/**
 * Skills List Component
 * 
 * Displays unhighlighted leaf nodes in a horizontal list with evenly spaced boxes
 * Now refactored into smaller, focused components with timeline visualization
 */
const SkillsList = ({ 
  treeNodes, 
  highlightedNodes, 
  scaleUpLeafNodes,
  onAnimationComplete
}) => {
  const containerRef = useRef(null);

  // Get processed data using custom hook
  const {
    visibleNodes,
    removingNodes,
    parentNodes,
    nextNode,
    positioning,
    getNodeState,
    findParentNode
  } = useSkillsListData({ treeNodes, highlightedNodes, scaleUpLeafNodes });

  // Get timeline data using custom hook
  const {
    nodeTimelineBoxes,
    yZoom
  } = useTimelineData({ treeNodes, yZoom: 600 });

  // Get scroll animation logic using custom hook
  const {
    scrollProgress,
    isAnimating,
    scrollSpeed,
    handleWheel,
    getAnimatedPosition,
    getRemovingNodeOpacity
  } = useScrollAnimation({
    removingNodes,
    visibleNodes,
    positioning,
    findParentNode,
    getNodeState,
    onAnimationComplete
  });

  if (!scaleUpLeafNodes || visibleNodes.length === 0) return null;

  const y = 50; // Fixed vertical position

  return (
    <div 
      ref={containerRef}
      className="mt-4 bg-gray-800 rounded-lg p-4 border border-gray-600"
      onWheel={handleWheel}
      style={{ cursor: removingNodes.length > 0 ? 'ns-resize' : 'default' }}
    >
      {/* <SkillsListHeader
        visibleNodes={visibleNodes}
        nextNode={nextNode}
        removingNodes={removingNodes}
        scrollProgress={scrollProgress}
      /> */}
      
      <div 
        className="relative"
        style={{ 
          height: `${yZoom}px`, // Use timeline height instead of fixed 500px
          width: '100%',
          overflow: 'hidden'
        }}
      >
        {visibleNodes.map((node, index) => {
          // Find the node position from the new positioning structure
          const nodePosition = positioning.nodePositions.find(np => np.node.id === node.id);
          const baseX = nodePosition ? positioning.startX + nodePosition.x : 0;
          const animatedX = getAnimatedPosition(node, baseX);
          const state = getNodeState(node);
          const isPreview = node.isPreview;
          const isParentOfRemoving = parentNodes.some(parent => parent.name === node.name);
          
          // Find timeline boxes for this node
          const nodeTimelineData = nodeTimelineBoxes.find(td => td.nodeId === node.id);
          const timelineBoxes = nodeTimelineData ? nodeTimelineData.timelineBoxes.map(
            (box, index) => ({
              ...box,
              name: `${node.name.split('_').join(' ')}`,
              children: node.childrenHighlighted
            })
          ) : [];
          
          // Find parent index for removing nodes
          let parentIndex = null;
          if (state === 'removing') {
            const parent = findParentNode(node.name);
            if (parent) {
              const parentVisibleIndex = visibleNodes.findIndex(n => n.name === parent.name);
              parentIndex = parentVisibleIndex >= 0 ? parentVisibleIndex + 1 : null;
            }
          }
          
          return (
            <SkillsListNode
              key={node.id}
              node={node}
              index={index}
              baseX={baseX}
              animatedX={animatedX}
              y={y}
              state={state}
              isPreview={isPreview}
              isParentOfRemoving={isParentOfRemoving}
              parentIndex={parentIndex}
              adjustedBoxWidth={nodePosition ? nodePosition.width : 50}
              boxHeight={positioning.boxHeight}
              getRemovingNodeOpacity={getRemovingNodeOpacity}
              findParentNode={findParentNode}
              visibleNodes={visibleNodes}
              timelineBoxes={timelineBoxes}
            />
          );
        })}
      </div>
      
      {/* <SkillsListDebug
        positioning={positioning}
        visibleNodes={visibleNodes}
        nextNode={nextNode}
        removingNodes={removingNodes}
        parentNodes={parentNodes}
        scrollProgress={scrollProgress}
        scrollSpeed={scrollSpeed}
      /> */}
    </div>
  );
};

export default SkillsList; 