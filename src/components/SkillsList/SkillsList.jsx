import React, { useRef } from 'react';
import { useSkillsListData } from './useSkillsListData';
import { useScrollAnimation } from './useScrollAnimation';
import SkillsListHeader from './SkillsListHeader';
import SkillsListNode from './SkillsListNode';
import SkillsListDebug from './SkillsListDebug';

/**
 * Skills List Component
 * 
 * Displays unhighlighted leaf nodes in a horizontal list with evenly spaced boxes
 * Now refactored into smaller, focused components
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
      <SkillsListHeader
        visibleNodes={visibleNodes}
        nextNode={nextNode}
        removingNodes={removingNodes}
        scrollProgress={scrollProgress}
      />
      
      <div 
        className="relative"
        style={{ 
          height: '500px',
          width: '100%',
          overflow: 'hidden'
        }}
      >
        {visibleNodes.map((node, index) => {
          const baseX = positioning.startX + index * (positioning.adjustedBoxWidth + positioning.boxMargin);
          const animatedX = getAnimatedPosition(node, baseX);
          const state = getNodeState(node);
          const isPreview = node.isPreview;
          const isParentOfRemoving = parentNodes.some(parent => parent.name === node.name);
          
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
              adjustedBoxWidth={positioning.adjustedBoxWidth}
              boxHeight={positioning.boxHeight}
              getRemovingNodeOpacity={getRemovingNodeOpacity}
              findParentNode={findParentNode}
              visibleNodes={visibleNodes}
            />
          );
        })}
      </div>
      
      <SkillsListDebug
        positioning={positioning}
        visibleNodes={visibleNodes}
        nextNode={nextNode}
        removingNodes={removingNodes}
        parentNodes={parentNodes}
        scrollProgress={scrollProgress}
        scrollSpeed={scrollSpeed}
      />
    </div>
  );
};

export default SkillsList; 