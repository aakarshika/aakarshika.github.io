/**
 * Shared utilities for tree calculations and positioning
 * Consolidates redundant functionality from multiple components
 */

/**
 * Calculate tree bounds from tree nodes
 * @param {Array} treeNodes - Array of tree nodes with x, y coordinates
 * @param {Object} defaultBounds - Default bounds when no nodes exist
 * @returns {Object} Bounds object with minX, maxX, minY, maxY
 */
export function calculateTreeBounds(treeNodes, defaultBounds = { minX: 0, maxX: 400, minY: 0, maxY: 300 }) {
  if (!treeNodes || treeNodes.length === 0) {
    return defaultBounds;
  }
  
  return {
    minX: Math.min(...treeNodes.map(n => n.x)),
    maxX: Math.max(...treeNodes.map(n => n.x)),
    minY: Math.min(...treeNodes.map(n => n.y)),
    maxY: Math.max(...treeNodes.map(n => n.y))
  };
}

/**
 * Calculate tree dimensions with padding
 * @param {Object} bounds - Tree bounds object
 * @param {number} padding - Padding to add to dimensions
 * @returns {Object} Width and height of the tree
 */
export function calculateTreeDimensions(bounds, padding = 200) {
  const width = bounds.maxX - bounds.minX + padding;
  const height = bounds.maxY - bounds.minY + padding;
  return { width, height };
}

/**
 * Create transform functions for viewport coordinates
 * @param {Object} bounds - Tree bounds object
 * @param {number} offset - Offset to add to transformed coordinates
 * @returns {Object} Transform functions for x and y coordinates
 */
export function createTransformFunctions(bounds, offset = 100) {
  return {
    transformX: (x) => x - bounds.minX + offset,
    transformY: (y) => y - bounds.minY + offset
  };
}

/**
 * Calculate node width based on expertise level and highlighted children
 * @param {Object} node - Node object with timelineData and children
 * @param {Array} treeNodes - All tree nodes for reference
 * @param {Object} widthConfig - Configuration for width calculations
 * @returns {number} Calculated node width
 */
export function calculateNodeWidth(node, treeNodes, widthConfig = {
  baseWidths: { beginner: 45, intermediate: 55, expert: 65 },
  childWidthMultiplier: 25
}) {
  // Base width based on highest expertise level in timeline data
  let baseWidth = widthConfig.baseWidths.beginner;
  
  if (node.timelineData && node.timelineData.length > 0) {
    const expertiseLevels = node.timelineData.map(entry => entry.expertise);
    if (expertiseLevels.includes('Expert')) {
      baseWidth = widthConfig.baseWidths.expert;
    } else if (expertiseLevels.includes('Intermediate')) {
      baseWidth = widthConfig.baseWidths.intermediate;
    }
  }
  
  // Add width for each highlighted child
  const highlightedChildrenCount = node.children ? 
    node.children.filter(childId => {
      const childNode = treeNodes.find(n => n.id === childId);
      return childNode && childNode.isHighlighted;
    }).length : 0;
  
  const additionalWidth = highlightedChildrenCount * widthConfig.childWidthMultiplier;
  
  return baseWidth + additionalWidth;
}

/**
 * Calculate positioning for a list of nodes
 * @param {Array} nodes - Array of nodes to position
 * @param {Array} treeNodes - All tree nodes for reference
 * @param {Object} config - Positioning configuration
 * @returns {Object} Positioning data with nodePositions and layout info
 */
export function calculateInitialNodePositions(nodes, treeNodes, config = {
  screenWidth: window.innerWidth,
  containerPadding: 10,
  boxMargin: 10,
  widthConfig: {
    baseWidths: { beginner: 45, intermediate: 55, expert: 65 },
    childWidthMultiplier: 25
  }
}) {
  const availableWidth = config.screenWidth - config.containerPadding;
  
  // Calculate individual box widths for each node
  const nodeWidths = nodes.map(node => ({
    node,
    width: calculateNodeWidth(node, treeNodes, config.widthConfig)
  }));
  
  // Calculate total width needed
  const totalBoxesWidth = nodeWidths.reduce((sum, { width }) => sum + width, 0);
  const totalMarginsWidth = (nodes.length - 1) * config.boxMargin;
  const totalWidthNeeded = totalBoxesWidth + totalMarginsWidth;
  
  // Calculate scaling factor to fit all boxes within available width
  const scaleFactor = totalWidthNeeded > availableWidth ? 
    (availableWidth - totalMarginsWidth) / totalBoxesWidth : 1;
  
  // Calculate final positions
  let currentX = 0;
  const nodePositions = nodeWidths.map(({ node, width }) => {
    const scaledWidth = width * scaleFactor;
    const position = {
      node,
      x: currentX,
      width: scaledWidth
    };
    currentX += scaledWidth + config.boxMargin;
    return position;
  });
  
  // Center the entire layout
  const actualTotalWidth = currentX - config.boxMargin; // Remove last margin
  const startX = (availableWidth - actualTotalWidth) / 2;

  return {
    screenWidth: config.screenWidth,
    availableWidth,
    boxMargin: config.boxMargin,
    totalBoxesWidth,
    totalMarginsWidth,
    totalWidthNeeded,
    scaleFactor,
    actualTotalWidth,
    startX,
    nodePositions
  };
}

/**
 * Get current position of a node from positioning data
 * @param {Object} node - Node object
 * @param {Object} positioning - Positioning data
 * @returns {number|null} Current x position or null if not found
 */
export function getNodeCurrentPosition(node, positioning) {
  const nodePosition = positioning.nodePositions.find(np => np.node.id === node.id);
  return nodePosition ? positioning.startX + nodePosition.x : null;
}

/**
 * Get target position of a node (parent position for removing nodes)
 * @param {Object} node - Node object
 * @param {Object} positioning - Positioning data
 * @param {Function} findParentNode - Function to find parent node
 * @returns {number|null} Target x position or null if not found
 */
export function getNodeTargetPosition(node, positioning, findParentNode) {
  const parent = findParentNode(node.name);
  if (!parent) return null;
  
  const parentPosition = positioning.nodePositions.find(np => np.node.id === parent.id);
  return parentPosition ? positioning.startX + parentPosition.x : null;
}

/**
 * Interpolate position between start and target based on progress
 * @param {number} startPosition - Start position
 * @param {number} targetPosition - Target position
 * @param {number} progress - Progress value between 0 and 1
 * @returns {number} Interpolated position
 */
export function interpolatePosition(startPosition, targetPosition, progress) {
  if (startPosition === null || targetPosition === null) return startPosition;
  return startPosition + (targetPosition - startPosition) * progress;
}

/**
 * Calculate total timeline entries across all nodes
 * @param {Array} treeNodes - Array of tree nodes
 * @returns {number} Total number of timeline entries
 */
export function calculateTotalTimelineEntries(treeNodes) {
  return treeNodes.reduce((total, node) => {
    return total + (node.timelineData ? node.timelineData.length : 0);
  }, 0);
}

/**
 * Get nodes with timeline data
 * @param {Array} treeNodes - Array of tree nodes
 * @returns {Array} Nodes that have timeline data
 */
export function getNodesWithTimelineData(treeNodes) {
  return treeNodes.filter(node => node.timelineData && node.timelineData.length > 0);
} 