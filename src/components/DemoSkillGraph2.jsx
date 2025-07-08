import React from 'react';
import { useBarVisualization } from '../hooks/useBarVisualization';
import { useNodeRemoval } from '../hooks/useNodeRemoval';
import { Eye, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useScrolling } from '../hooks/useScrolling';
const SPEED_PER_NODE = 100;
import { getRainbowColor } from '../utils/constants';


/**
 * Demo Skill Graph 2 Component
 * Shows bars for each node with calculated y-coordinates and heights from timeline data
 */
const DemoSkillGraph2 = ({ isActive,  flatNodes ,handleScrollHandoff, handleHover}) => {
  // Use the removal system
  const {
    removedNodeIds,
    removeNext,
    unremovePrevious,
    getNextNodeToRemove,
    isAllRemoved,
    isNoneRemoved
  } = useNodeRemoval({ flatNodes });

  const svgRef = useRef(null);
  const nextNodeToRemove = getNextNodeToRemove();
  const [showDetails, setShowDetails] = useState(false);
  const [expectedIndex, setExpectedIndex] = useState(0);
  const {
    dimensions,
    positionedBars,
    timeLabels,
    gridLines,
    nodesWithTimeline
  } = useBarVisualization({ flatNodes, removedNodeIds, nextNodeToRemove });

  // const xOffset = 0;
  const { xOffset } = useScrolling({
    containerRef: svgRef,
    currentNodeId: nextNodeToRemove,
    positionedBars,
    sensitivity: 0.5,
    maxOffset: (flatNodes.length-1 ) * SPEED_PER_NODE,
    isActive: isActive
  });

  // Update expected index when xOffset changes
  useEffect(() => {
    setExpectedIndex(Math.floor(xOffset / SPEED_PER_NODE));
  }, [xOffset]);

  useEffect(() => {
    console.log("xOffset", xOffset, "expectedIndex", expectedIndex);
    if(xOffset >= (flatNodes.length-1 ) * SPEED_PER_NODE){
      handleScrollHandoff('next');
    }else if(xOffset <= 0){
      handleScrollHandoff('previous');
    }
  }, [expectedIndex]);

  // Sync removedNodeIds count with expected index
  useEffect(() => {
    const currentRemovedCount = removedNodeIds.length;
    
    if (currentRemovedCount < expectedIndex) {
      // Need to remove more nodes
      const nodesToRemove = expectedIndex - currentRemovedCount;
      for (let i = 0; i < nodesToRemove; i++) {
        if (!isAllRemoved()) {
          removeNext();
        }
      }
    } else if (currentRemovedCount >= expectedIndex) {
      // Need to unremove nodes
      const nodesToUnremove = currentRemovedCount - expectedIndex;
      for (let i = 0; i < nodesToUnremove; i++) {
        if (!isNoneRemoved()) {
          unremovePrevious();
        }
      }
    }
  }, [expectedIndex]);

  const activeNodeId = nextNodeToRemove;
  const progress = xOffset % 100;

  if (!flatNodes || flatNodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-400">
        No data available
      </div>
    );
  }

  const { width, height } = dimensions;

  // Find siblings of the next node to remove
  const getSiblingBox = () => {
    if (!nextNodeToRemove) return null;

    // Find the next node to remove in the original flatNodes
    const nextNode = flatNodes.find(node => node.id === nextNodeToRemove);
    if (!nextNode || !nextNode.parentId) return null;

    // Find the parent node
    const parentNode = flatNodes.find(node => node.id === nextNode.parentId);
    if (!parentNode) return null;

    // Find all siblings (nodes with the same parent)
    const siblings = flatNodes.filter(node => 
      node.parentId === nextNode.parentId && 
      !removedNodeIds.includes(node.id)
    );

    // Find the visible siblings in the positioned bars
    const visibleSiblings = positionedBars.filter(node => 
      siblings.some(sibling => sibling.id === node.id)
    );

    // Find the parent in the positioned bars (if visible)
    const visibleParent = positionedBars.find(node => node.id === parentNode.id);

    // Collect all family members (parent + siblings) that are visible
    const familyMembers = [];
    if (visibleParent) familyMembers.push(visibleParent);
    familyMembers.push(...visibleSiblings);

    if (familyMembers.length === 0) return null;

    // Calculate the bounding box for all visible family members
    const minX = Math.min(...familyMembers.map(node => node.barX));
    const maxX = Math.max(...familyMembers.map(node => node.barX + node.barWidth));
    const boxWidth = maxX - minX;
    const boxHeight = height;

    return {
      x: minX - 10,
      y: 0,
      width: boxWidth + 20,
      height: boxHeight,
      familyCount: familyMembers.length,
      hasParent: !!visibleParent,
      parentNode: visibleParent,
      siblingCount: visibleSiblings.length
    };
  };

  const siblingBox = getSiblingBox();

  // Function to combine intersecting timeline boxes
  const combineIntersectingBoxes = (timelineBoxes) => {
    if (!timelineBoxes || timelineBoxes.length <= 1) return timelineBoxes;

    // Sort boxes by start date
    const sortedBoxes = [...timelineBoxes].sort((a, b) => 
      new Date(a.startDate) - new Date(b.startDate)
    );

    const combinedBoxes = [];
    let currentBox = { ...sortedBoxes[0] };

    for (let i = 1; i < sortedBoxes.length; i++) {
      const nextBox = sortedBoxes[i];
      
      // Check if boxes intersect (current end >= next start)
      if (new Date(currentBox.endDate) >= new Date(nextBox.startDate)) {
        // Combine the boxes
        currentBox = {
          ...currentBox,
          endDate: new Date(Math.max(new Date(currentBox.endDate), new Date(nextBox.endDate))).toISOString(),
          companies: [...(currentBox.companies || [currentBox.company]), nextBox.company],
          company: currentBox.company
        };
      } else {
        // No intersection, add current box and start new one
        combinedBoxes.push(currentBox);
        currentBox = { ...nextBox };
      }
    }

    // Add the last box
    combinedBoxes.push(currentBox);

    return combinedBoxes;
  };

  // Get the color for the sibling box
  const getSiblingBoxColor = () => {
    if (!siblingBox) return null;
    
    if (siblingBox.hasParent) {
      const c = getRainbowColor(
        positionedBars.findIndex(node => node.name === siblingBox.parentNode.name),
        positionedBars.length
      )
      // Parent is visible, use parent's color
      return c;
    } else {
      var c = null;
      // Parent is not visible, use next node's color
      const nextNodeIndex = positionedBars.findIndex(node => node.id === nextNodeToRemove);
      if (nextNodeIndex !== -1) {
        c =  getRainbowColor(nextNodeIndex, positionedBars.length);
        // console.log(c, nextNodeToRemove,nextNodeIndex, "current");
        return c;
      }
      // Fallback to first color if next node not found
      c = 'black';
      // console.log(c, "not current");

      return c;
    }
  };
  const [activeBackground, setActiveBackground] = useState(false);

  useEffect(() => {
    if(activeBackground){
      handleHover(true, 'skill-graph');
    }else{
      handleHover(false, 'skill-graph');
    }
  }, [activeBackground]);

  const siblingBoxColor = getSiblingBoxColor();

  return (
    <div className="w-full h-full flex flex-col items-center" 
    >
      <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
        Skills Timeline Bars
      </h2>


      <div className={`relative rounded-lg p-20 ${activeBackground ? 'bg-white/10' : ''}`}
      onMouseEnter={() => setActiveBackground(true)}
      onMouseLeave={() => setActiveBackground(false)}
      >
        {/* SVG Container */}
        <svg 
          ref={svgRef}
          width={width + 100 } 
          height={height} 
          className="block"
        >
        {/* Sibling box - render first so it's behind the bars */}
        {siblingBox && (
          <rect
            x={siblingBox.x }
            y={siblingBox.y}
            width={siblingBox.width}
            height={siblingBox.height}
            fill={siblingBoxColor}
            stroke="rgba(255, 215, 0, 0.1)"
            strokeWidth={3}
            opacity={0.3}
            rx={8}
          />
        )}
        {/* Sibling box - render first so it's behind the bars */}
        {siblingBox && (
          <rect
            x={siblingBox.x }
            y={siblingBox.y}
            width={siblingBox.width}
            height={siblingBox.height}
            fill='rgba(255, 255, 255, 0.5)'
            stroke="rgba(255, 215, 0, 0.1)"
            strokeWidth={3}
            opacity={0.3}
            rx={8}
          />
        )}

          {/* Grid lines for time */}
          {gridLines.map((line, i) => (
            <line
              key={`grid-${i}`}
              x1={0}
              y1={line.y}
              x2={width}
              y2={line.y}
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth={1}
            />
          ))}

          {/* Y-axis labels (time) */}
          {timeLabels.map((label, i) => (
            <text
              key={`time-${i}`}
              x={0}
              y={label.y}
              fill="rgba(255, 255, 255, 0.6)"
              fontSize="11"
              fontFamily="monospace"
            >
              {label.label}
            </text>
          ))}

          {/* Render timeline bars for each node */}
          {positionedBars.map((node, index) => {
            const isParentInList = positionedBars.find(n => n.id === node.parentId);
            const combinedTimelineBoxes = combineIntersectingBoxes(node.timelineBoxes);
            const nodeColor = getRainbowColor(index, positionedBars.length);
            
            const parentCenterX = isParentInList ? isParentInList.x : node.x;
            const parentDistance = node.x - parentCenterX;
            
            let nodeLeftX = node.barX;
            let nodeCenterX = node.x;
            let scaleX = 0;
            let scaleY = 0;
            
            if (nextNodeToRemove === node.id) {
              const moveX = parentDistance * (progress / 100);
              nodeLeftX = nodeLeftX - moveX;
              nodeCenterX = nodeCenterX - moveX;
              scaleX = progress / 4 * node.level * 0.2;
              scaleY = progress / 4 * node.level * 0.2;
            }else if(node.removedChildrenCount > 0){
              scaleX = 100 / 4 * (node.level+1) * 0.2;
              scaleY = 100 / 4 * (node.level+1) * 0.2;
            }
            return (
              <g key={node.id}>
                {/* Timeline boxes as colored bars with labels */}
                {combinedTimelineBoxes && combinedTimelineBoxes.map((box, boxIndex) => {
                
                const scaledHieght = box.height + scaleY;
                const scaledWidth = node.barWidth + scaleX;
                  return (
                  <g key={`${node.id}-box-${boxIndex}`}>
                    {/* Timeline box rectangle */}
                    <rect
                      x={nodeLeftX - scaleX / 2}
                      y={box.y - scaleY / 2}
                      width={scaledWidth}
                      height={scaledHieght}
                      fill={nodeColor}
                      stroke="white"
                      strokeWidth={1}
                      rx={3}
                    />
                    
                    {/* Node name label on timeline box */}
                    <text
                      x={nodeCenterX}
                      y={
                        // Check if text fits in the box after rotation
                        // For rotated text, we compare the text width to the box height
                        // If text is too long, position it above the box
                        node.name.length * 10 > scaledHieght
                          ? box.y - scaleY -  (node.name.length * 10) / 2 // start above box
                          : box.y + (scaledHieght) / 2 // center of the box
                      }
                      textAnchor="middle"
                      fill="white"
                      fontSize="14"
                      style={{
                        transform: 'rotate(-90deg)',
                        transformOrigin: 'center',
                        transformBox: 'fill-box'
                      }}
                      fontFamily="sans-serif"
                      fontWeight="600"
                      dominantBaseline={
                        node.name.length * 8 > scaledHieght ? 'auto' : 'middle'
                      }
                    >
                      {node.name.replace(/_/g, ' ').toUpperCase()}
                    </text>
                  </g>
                )})}

              </g>
            );
          })}

        </svg>

      </div>


    </div>
  );
};

export default DemoSkillGraph2; 