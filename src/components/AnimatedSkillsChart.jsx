import { useSkillsTree } from '../hooks/useSkillsTree';
import React, { useRef, useState, useEffect } from 'react';
import { useSkillsListData } from './SkillsList/useSkillsListData';
import { useScrollAnimation } from './SkillsList/useScrollAnimation';
import { useTimelineData } from './SkillsList/useTimelineData';
import SkillsListNode from './SkillsList/SkillsListNode';

/**
 * Visual Tree Component
 * 
 * Displays a hierarchical tree structure of skills with level-by-level highlighting.
 * Users can click a button to highlight nodes one by one, starting from the deepest level.
 * Each node shows accumulated start and end dates from all its children.
 */
const AnimatedSkillsChart = ({ isActive = true, onScrollHandoff = null }) => {
  const {
    scaleUpLeafNodes,
    
    // Data
    treeNodes,
    
    // Actions
    handleHighlightNext,
    handleUnhighlightLast
  } = useSkillsTree();

  // Handle animation completion for both forward and backward directions
  const onAnimationComplete = (direction) => {
    // console.log('onAnimationComplete *******************', direction);
    
    if (direction === 'forward') {
      handleHighlightNext();
    } else if (direction === 'backward') {
      handleUnhighlightLast();
    }
  };

  const [containerWidth, setContainerWidth] = useState(0);
  const timelineContainerRef = useRef(null);
  const containerRef = useRef(null);

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

  // Update container width when component mounts or resizes
  useEffect(() => {
    const updateWidth = () => {
      if (timelineContainerRef.current) {
        setContainerWidth(timelineContainerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  if (!scaleUpLeafNodes || visibleNodes.length === 0) return null;

  const y = 50; // Fixed vertical position

  return (
    <div
      className="w-auto h-screen bg-gray-900 text-white p-6">
      {/* Skills List */}
      
    <div 
      ref={containerRef}
      className="mt-4 bg-gray-800 rounded-lg p-4 border border-gray-600"
      style={{ cursor: removingNodes.length > 0 ? 'ns-resize' : 'default' }}
    >
      {/* <SkillsListHeader
        visibleNodes={visibleNodes}
        nextNode={nextNode}
        removingNodes={removingNodes}
        scrollProgress={scrollProgress}
      /> */}
      
      <div 
        ref={timelineContainerRef}
        className="relative"
        style={{ 
          height: `${yZoom}px`, // Use timeline height instead of fixed 500px
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
  );
};

export default AnimatedSkillsChart; 