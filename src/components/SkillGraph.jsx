import React, { useRef, useState, useEffect } from 'react';
import { initializeTreeWithTimeline, getFlatNodeList } from '../utils/treeInitializer';
import DemoSkillGraph2 from './DemoSkillGraph2';

/**
 * SkillGraph Component
 * 
 * Single component that handles its own scroll animation and handoff.
 * Displays the skills tree visualization with scroll-based merging/splitting.
 */
const SkillGraph = ({ isActive, onScrollHandoff , handleHover}) => {

  // const [treeData, setTreeData] = useState([]);
  const [flatNodes, setFlatNodes] = useState([]);
  useEffect(() => {
    console.log("SkillGraph mounted");
    const tree = initializeTreeWithTimeline(600);
    // setTreeData(tree);
    setFlatNodes(getFlatNodeList(tree));
    // console.log(tree, "treeData");
    console.log(getFlatNodeList(tree), "flatNodes");
  }, []);


  // Tooltip state
  const [tooltip, setTooltip] = useState({
    visible: false,
    data: null,
    position: { x: 0, y: 0 }
  });

  // const onHover = (timelineBox, isHovered, event) => {
  //   // console.log('onHover called:', { timelineBox, isHovered, event, scrollY });
  //   if (isHovered) {
  //     // Calculate responsive positioning
  //     const tooltipWidth = 280; // max-w-sm = 24rem = 384px, but we'll use 280px
  //     const tooltipHeight = 120; // Approximate height
  //     const padding = 20;
      
  //     // Account for the transformed container by adjusting for scrollY
  //     const mouseX = event.clientX;
  //     const mouseY = event.clientY + scrollY; // Add scroll offset for transformed container
      
  //     let x = mouseX + 10;
  //     let y = mouseY - 10;
      
  //     // Check if tooltip would go off the right edge
  //     if (x + tooltipWidth + padding > window.innerWidth) {
  //       x = mouseX - tooltipWidth/2; // Position closer to the cursor (reduced gap from 10 to 5)
  //     }
      
  //     // Check if tooltip would go off the top edge
  //     if (y - tooltipHeight < padding) {
  //       y = mouseY + 10;
  //     }
      
  //     // Additional check: if tooltip is positioned to the left, make sure it doesn't go off the left edge
  //     if (x < padding) {
  //       x = padding; // Keep it within the left edge
  //     }
      
  //     const newTooltip = {
  //       visible: true,
  //       data: timelineBox,
  //       position: { x, y }
  //     };
  //     // console.log('Setting tooltip:', newTooltip);
  //     setTooltip(newTooltip);
  //   } else {
  //     // console.log('Hiding tooltip');
  //     setTooltip({
  //       visible: false,
  //       data: null,
  //       position: { x: 0, y: 0 }
  //     });
  //   }
  // };

  // Format dates for display
  // const formatDate = (dateStr) => {
  //   return new Date(dateStr).toLocaleDateString('en-US', { 
  //     year: 'numeric', 
  //     month: 'short' 
  //   });
  // };


  if (flatNodes.length === 0) return null;

  const y = 50; // Fixed vertical position


  return (

    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-black py-20">
      <div className="w-full h-full flex flex-col">
        <DemoSkillGraph2 
        isActive={isActive} 
        flatNodes={flatNodes} 
        handleScrollHandoff={onScrollHandoff} 
        handleHover={handleHover}
        />
      </div>
    </div>
  );


};

export default SkillGraph; 