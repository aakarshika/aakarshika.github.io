import {
  getStaticDimensions,
  calculateTimeRange,
  calculateGridLines,
  calculateTimeLabels,
  getNodesWithTimeline,
  getNodeColor
} from '../utils/staticVisualizationUtils';

/**
 * Bar visualization hook - handles dynamic calculations that change with removal
 * Static calculations are moved to staticVisualizationUtils.js
 */
export const useBarVisualization = ({ flatNodes, removedNodeIds = [], nextNodeToRemove = null }) => {
  // Get static dimensions
  const dimensions = getStaticDimensions();

  // Get time range for y-axis
  const timeRange = calculateTimeRange(flatNodes);

  // Calculate grid lines
  const gridLines = calculateGridLines(dimensions.height);

  // Calculate time labels
  const timeLabels = calculateTimeLabels(dimensions.height, timeRange);

  // Get nodes with timeline data for details section
  const nodesWithTimeline = getNodesWithTimeline(flatNodes);

  // Filter out removed nodes and calculate effective leaf status
  const positionedBars = (() => {
    if (!flatNodes || flatNodes.length === 0) return [];

    // Create a set of removed node IDs for quick lookup
    const removedNodeIdsSet = new Set(removedNodeIds);

    // Helper function to count all descendants that are not visible
    const countInvisibleDescendants = (nodeId) => {
      const node = flatNodes.find(n => n.id === nodeId);
      if (!node) return 0;
      
      let count = 0;
      
      // If this node is not visible (removed), count it
      if (removedNodeIdsSet.has(nodeId)) {
        count += 1;
      }
      
      // Recursively count all descendants
      if (node.childIds) {
        for (const childId of node.childIds) {
          count += countInvisibleDescendants(childId);
        }
      }
      
      return count;
    };

    // First pass: Filter out directly removed nodes
    const nodesAfterDirectRemoval = flatNodes.filter(node => !removedNodeIdsSet.has(node.id));
    
    if (nodesAfterDirectRemoval.length === 0) return [];

    // Second pass: Filter out parent nodes that have no removed children
    const nodesAfterParentFiltering = nodesAfterDirectRemoval.filter(node => {
      // If it's a leaf node, keep it
      if (node.isLeaf) return true;
      
      // If it's a parent node, check if it has any removed children
      const hasRemovedChildren = node.childIds && node.childIds.some(childId => removedNodeIdsSet.has(childId));
      
      // Only keep parent nodes that have at least one removed child
      return hasRemovedChildren;
    });

    if (nodesAfterParentFiltering.length === 0) return [];

    // Create a set of visible node IDs for quick lookup
    const visibleNodeIds = new Set(nodesAfterParentFiltering.map(node => node.id));

    // Calculate effective leaf status and dynamic width for each visible node
    const nodesWithEffectiveLeafStatus = nodesAfterParentFiltering.map(node => {
      // A node is effectively a leaf if:
      // 1. It has no children (original leaf), OR
      // 2. All its children are removed (not visible)
      const hasVisibleChildren = node.childIds && node.childIds.some(childId => visibleNodeIds.has(childId));
      const isEffectivelyLeaf = !hasVisibleChildren;

      // Calculate dynamic width for parent nodes based on removed descendants
      const getNodeWidth = () => {
        if (node.isLeaf) return dimensions.barWidth; // Leaf nodes keep original width
        
        const removedDescendantsCount = countInvisibleDescendants(node.id);
        
        // Increase width by 10 for each removed descendant
        const widthIncrease = removedDescendantsCount * 10;
        return dimensions.barWidth + widthIncrease;
      };

      const nodeBarWidth = getNodeWidth();

      return {
        ...node,
        isEffectivelyLeaf,
        hasVisibleChildren,
        barWidth: nodeBarWidth,
        removedChildrenCount: node.childIds ? 
          node.childIds.filter(childId => removedNodeIdsSet.has(childId)).length : 0,
        removedDescendantsCount: countInvisibleDescendants(node.id)
      };
    });

    const { width, barWidth, padding } = dimensions;
    const availableWidth = width - (padding * 2);
    
    // Calculate total width needed for all nodes
    const totalNodeWidths = nodesWithEffectiveLeafStatus.reduce((sum, node) => sum + node.barWidth, 0);
    
    // Calculate consistent gap between nodes
    const totalGaps = nodesWithEffectiveLeafStatus.length - 1;
    const gapWidth = totalGaps > 0 ? (availableWidth - totalNodeWidths) / totalGaps : 0;
    
    // Position nodes with consistent gaps
    let currentX = padding;
    return nodesWithEffectiveLeafStatus.map((node, index) => {
      const nodeX = currentX;
      currentX += node.barWidth + gapWidth; // Move to next position
      
      return {
        ...node,
        x: nodeX + node.barWidth / 2, // Center point for labels
        barX: nodeX, // Left edge for rendering
        index: index
      };
    });
  })();

  // Calculate stats
  const stats = (() => {
    return {
      totalNodes: flatNodes.length,
      visibleNodes: positionedBars.length,
      removedNodes: removedNodeIds.length,
      leafNodes: flatNodes.filter(n => n.isLeaf).length,
      parentNodes: flatNodes.filter(n => !n.isLeaf).length,
      nodesWithTimeline: flatNodes.filter(n => n.timelineBoxes && n.timelineBoxes.length > 0).length,
      effectivelyLeafNodes: positionedBars.filter(n => n.isEffectivelyLeaf).length
    };
  })();

  // Create a getNodeColor function that includes the next node to remove
  const getNodeColorWithNext = (node) => {
    return getNodeColor(node, nextNodeToRemove);
  };

  return {
    dimensions,
    positionedBars,
    timeRange,
    gridLines,
    timeLabels,
    stats,
    nodesWithTimeline,
    getNodeColor: getNodeColorWithNext
  };
}; 