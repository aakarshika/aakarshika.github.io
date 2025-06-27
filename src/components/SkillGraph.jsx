import { useSkillsTree } from '../hooks/useSkillsTree';
import React, { useRef, useState, useEffect } from 'react';
import { useSkillsListData } from './SkillsList/useSkillsListData';
import { useScrollAnimation } from './SkillsList/useScrollAnimation';
import { useTimelineData } from './SkillsList/useTimelineData';
import SkillsListNode from './SkillsList/SkillsListNode';
import { initializeTreeWithTimeline, getFlatNodeList } from '../utils/treeInitializer';
import DemoSkillGraph2 from './DemoSkillGraph2';

/**
 * SkillGraph Component
 * 
 * Single component that handles its own scroll animation and handoff.
 * Displays the skills tree visualization with scroll-based merging/splitting.
 */
const SkillGraph = ({ isActive, onScrollHandoff, scrollY = 0 }) => {

  // Initialize the tree
  const treeData = initializeTreeWithTimeline(600);
  
  // Get flat list of all nodes
  const flatNodes = getFlatNodeList(treeData);

  // console.log('🔍 Flat nodes:', flatNodes);


  const {
    treeNodes,
    handleHighlightNext,
    handleUnhighlightLast
  } = useSkillsTree();

  // Tooltip state
  const [tooltip, setTooltip] = useState({
    visible: false,
    data: null,
    position: { x: 0, y: 0 }
  });

  // // console.log('SkillGraph: isActive:', isActive);
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

  // Calculate container width once on mount for centering
  const containerWidth = timelineContainerRef.current?.offsetWidth || window.innerWidth;

  const onHover = (timelineBox, isHovered, event) => {
    // console.log('onHover called:', { timelineBox, isHovered, event, scrollY });
    if (isHovered) {
      // Calculate responsive positioning
      const tooltipWidth = 280; // max-w-sm = 24rem = 384px, but we'll use 280px
      const tooltipHeight = 120; // Approximate height
      const padding = 20;
      
      // Account for the transformed container by adjusting for scrollY
      const mouseX = event.clientX;
      const mouseY = event.clientY + scrollY; // Add scroll offset for transformed container
      
      let x = mouseX + 10;
      let y = mouseY - 10;
      
      // Check if tooltip would go off the right edge
      if (x + tooltipWidth + padding > window.innerWidth) {
        x = mouseX - tooltipWidth/2; // Position closer to the cursor (reduced gap from 10 to 5)
      }
      
      // Check if tooltip would go off the top edge
      if (y - tooltipHeight < padding) {
        y = mouseY + 10;
      }
      
      // Additional check: if tooltip is positioned to the left, make sure it doesn't go off the left edge
      if (x < padding) {
        x = padding; // Keep it within the left edge
      }
      
      const newTooltip = {
        visible: true,
        data: timelineBox,
        position: { x, y }
      };
      // console.log('Setting tooltip:', newTooltip);
      setTooltip(newTooltip);
    } else {
      // console.log('Hiding tooltip');
      setTooltip({
        visible: false,
        data: null,
        position: { x: 0, y: 0 }
      });
    }
  };

  // Format dates for display
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
  };

  // Get processed data using custom hook
  const {
    visibleNodes,
    removingNodes,
    parentNodes,
    positioning,
    getNodeState,
    findParentNode
  } = useSkillsListData({ treeNodes });

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

  if (visibleNodes.length === 0) return null;

  const y = 50; // Fixed vertical position


  return (

    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-black py-20">
      <div className="w-full h-full flex flex-col">
        <DemoSkillGraph2 flatNodes={flatNodes} />
      </div>
    </div>
  );




  return (
    <>
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
                    <div key={node.id+'-'+index}>
                    <SkillsListNode
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
                      onHover={onHover}
                    />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip Popup - moved outside main container */}
      {tooltip.visible && tooltip.data && (
        <div
          className="fixed z-[9999] bg-gray-900 text-white p-4 rounded-lg shadow-2xl border border-gray-700 max-w-sm transition-all duration-200 ease-in-out opacity-100 scale-100"
          style={{
            left: `${tooltip.position.x}px`,
            top: `${tooltip.position.y}px`,
            pointerEvents: 'none'
          }}
        >
          <div className="space-y-2">
            <div className="font-semibold text-lg text-blue-400">
              {tooltip.data.company || 'Unknown Company'}
            </div>
            <div className="text-sm text-gray-300">
              {tooltip.data.expertise}
            </div>
            <div className="text-xs text-gray-400 border-t border-gray-700 pt-2">
              {formatDate(tooltip.data.startDate)} - {formatDate(tooltip.data.endDate)}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SkillGraph; 