import React, { useRef, useState, useEffect } from 'react';
import { useSkillsListData } from './useSkillsListData';
import { useScrollAnimation } from './useScrollAnimation';
import { useTimelineData } from './useTimelineData';
import SkillsListNode from './SkillsListNode';

/**
 * Skills List Component
 * 
 * Displays unhighlighted leaf nodes in a horizontal list with evenly spaced boxes
 * Now refactored into smaller, focused components with timeline visualization
 */
const SkillsList = ({ 
  treeNodes, 
  scaleUpLeafNodes,
  containerRef,
  onAnimationComplete
}) => {
  const [containerWidth, setContainerWidth] = useState(0);
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
    onAnimationComplete
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
  );
};

export default SkillsList; 