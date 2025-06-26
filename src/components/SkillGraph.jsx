import { useSkillsTree } from '../hooks/useSkillsTree';
import React, { useRef, useState, useEffect } from 'react';
import { useSkillsListData } from './SkillsList/useSkillsListData';
import { useScrollAnimation } from './SkillsList/useScrollAnimation';
import { useTimelineData } from './SkillsList/useTimelineData';
import SkillsListNode from './SkillsList/SkillsListNode';

/**
 * SkillGraph Component
 * 
 * Single component that handles its own scroll animation and handoff.
 * Displays the skills tree visualization with scroll-based merging/splitting.
 */
const SkillGraph = ({ isActive, onScrollHandoff }) => {
  const {
    scaleUpLeafNodes,
    treeNodes,
    handleHighlightNext,
    handleUnhighlightLast
  } = useSkillsTree();

  // console.log('SkillGraph: isActive:', isActive);
  // Handle animation completion for both forward and backward directions
  const onAnimationComplete = (direction) => {
    if (direction === 'forward') {
      handleHighlightNext();
    } else if (direction === 'backward') {
      handleUnhighlightLast();
    }
  };

  const containerRef = useRef(null);
  const timelineContainerRef = useRef(null);

  // Get processed data using custom hook
  const {
    visibleNodes,
    removingNodes,
    parentNodes,
    positioning,
    getNodeState,
    findParentNode
  } = useSkillsListData({ treeNodes, scaleUpLeafNodes });

  // Get timeline data using custom hook
  const {
    nodeTimelineBoxes,
    yZoom
  } = useTimelineData({ treeNodes, yZoom: 600 });

  const highlightedNodes = treeNodes.filter(n => n.isHighlighted);
  
  // Get scroll animation logic using custom hook
  const {
    getAnimatedPosition,
    getRemovingNodeOpacity,
  } = useScrollAnimation({
    removingNodes,
    visibleNodes,
    containerRef,
    positioning,
    findParentNode,
    getNodeState,
    highlightedNodes,
    onAnimationComplete,
    isActive,
    onScrollHandoff
  });

  if (!scaleUpLeafNodes || visibleNodes.length === 0) return null;

  const y = 50; // Fixed vertical position

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-black py-20">
      <div className="w-full h-full flex flex-col"
            ref={containerRef}>
      <div className="about-section container mx-auto px-6">
            <h2 className="text-6xl font-bold text-center pb-16 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              Skills Gained Along The Way
            </h2>
          </div>
        <div className="flex-1 rounded-lg p-6">
          <div 
            className="rounded-lg p-4 h-full"
          >
            <div 
              ref={timelineContainerRef}
              className="relative"
              style={{ 
                height: `${yZoom}px`,
                width: '100%',
                overflow: 'hidden'
              }}
            >
              {visibleNodes.map((node, index) => {
                // Use the modularized position calculator
                const animatedX = getAnimatedPosition(node);
                const nodePosition = positioning.nodePositions.find(np => np.node.id === node.id);
                const adjustedBoxWidth = nodePosition ? nodePosition.width : 50;
                
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
                
                return (
                  <SkillsListNode
                    key={node.id}
                    node={node}
                    index={index}
                    animatedX={animatedX}
                    y={y}
                    state={state}
                    isPreview={isPreview}
                    isParentOfRemoving={isParentOfRemoving}
                    adjustedBoxWidth={adjustedBoxWidth}
                    getRemovingNodeOpacity={getRemovingNodeOpacity}
                    visibleNodes={visibleNodes}
                    timelineBoxes={timelineBoxes}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillGraph; 