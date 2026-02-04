/**
 * Static visualization utilities
 * These calculations don't change when highlighting changes
 */

/**
 * Parse date string to timestamp
 * @param {string} dateStr - Date string in YYYY-MM format
 * @returns {number} Timestamp
 */
const parseDate = (dateStr) => new Date(dateStr).getTime();

/**
 * Convert timestamp to y-coordinate
 * @param {number} timestamp - Timestamp to convert
 * @param {number} startTime - Start time of the entire timeline
 * @param {number} timeRange - Total time range
 * @param {number} yZoom - Total height available
 * @returns {number} Y-coordinate
 */
const timestampToY = (timestamp, startTime, timeRange, yZoom) => {
  return ((timestamp - startTime) / timeRange) * (yZoom - 40) + 20;
};

/**
 * Get static dimensions for visualization
 * @returns {Object} Static dimensions
 */
export const getStaticDimensions = () => {
  return {
    width: 1400,
    height: 600,
    barWidth: 30,
    padding: 40
  };
};

/**
 * Calculate time range for y-axis from flat nodes
 * @param {Array} flatNodes - Array of all nodes
 * @returns {Object} Time range object with min and max timestamps
 */
export const calculateTimeRange = (flatNodes) => {
  if (!flatNodes || flatNodes.length === 0) {
    // Default fallback: use current date range from skills_timeline.json
    const defaultStart = parseDate('2015-06');
    const defaultEnd = parseDate('2025-06');
    return { min: defaultStart, max: defaultEnd };
  }

  let minTimestamp = Infinity;
  let maxTimestamp = -Infinity;

  flatNodes.forEach(node => {
    if (node.timelineBoxes && node.timelineBoxes.length > 0) {
      node.timelineBoxes.forEach(box => {
        if (box.startDate) {
          const startTimestamp = parseDate(box.startDate);
          minTimestamp = Math.min(minTimestamp, startTimestamp);
        }
        if (box.endDate) {
          const endTimestamp = parseDate(box.endDate);
          maxTimestamp = Math.max(maxTimestamp, endTimestamp);
        }
      });
    }
  });

  // Fallback if no valid dates found
  if (minTimestamp === Infinity || maxTimestamp === -Infinity) {
    const defaultStart = parseDate('2015-06');
    const defaultEnd = parseDate('2025-06');
    return { min: defaultStart, max: defaultEnd };
  }

  return { min: minTimestamp, max: maxTimestamp };
};

/**
 * Calculate grid lines for time visualization
 * @param {number} height - Height of the visualization
 * @returns {Array} Array of grid line objects
 */
export const calculateGridLines = (height) => {
  return Array.from({ length: 12 }, (_, i) => ({
    y: (height / 12) * i
  }));
};

/**
 * Calculate time labels for y-axis
 * @param {number} height - Height of the visualization
 * @param {Object} timeRange - Time range object with min and max timestamps
 * @returns {Array} Array of time label objects
 */
export const calculateTimeLabels = (height, timeRange) => {
  const startTime = timeRange.min;
  const endTime = timeRange.max;
  const timeRangeValue = endTime - startTime;
  
  // Use the same formula as timestampToY: ((timestamp - startTime) / timeRange) * (yZoom - 40) + 20
  // where yZoom is the height
  const timestampToY = (timestamp) => {
    return ((timestamp - startTime) / timeRangeValue) * (height - 40) + 20;
  };
  
  return Array.from({ length: 11 }, (_, i) => {
    // Calculate timestamp for this label (from max to min, evenly distributed)
    const timeValue = endTime - ((endTime - startTime) / 10) * i;
    const date = new Date(timeValue);
    // Map timestamp to y-coordinate using the same formula as timeline boxes
    const y = timestampToY(timeValue);
    
    return {
      y: y + 15, // Offset for better positioning
      label: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
    };
  });
};

/**
 * Get nodes with timeline data for details section
 * @param {Array} flatNodes - Array of all nodes
 * @returns {Array} Array of nodes with timeline data
 */
export const getNodesWithTimeline = (flatNodes) => {
  return flatNodes
    .filter(node => node.timelineBoxes && node.timelineBoxes.length > 0)
    .slice(0, 9); // Show first 9 nodes with timeline data
};

/**
 * Calculate node colors based on effective leaf status and next removal status
 * @param {Object} node - Node object
 * @param {string} nextNodeToRemove - ID of the next node to be removed
 * @returns {Object} Color object with fill and stroke
 */
export const getNodeColor = (node, nextNodeToRemove = null) => {
  // Purple for the next node to be removed
  if (nextNodeToRemove && node.id === nextNodeToRemove) {
    return {
      fill: "rgba(147, 51, 234, 0.7)", // Purple for next to remove
      stroke: "rgba(147, 51, 234, 0.9)"
    };
  }
  
  // Regular colors based on effective leaf status
  if (node.isEffectivelyLeaf) {
    return {
      fill: "rgba(59, 130, 246, 0.7)", // Blue for effectively leaf nodes
      stroke: "rgba(59, 130, 246, 0.9)"
    };
  } else {
    return {
      fill: "rgba(16, 185, 129, 0.7)", // Green for parent nodes with visible children
      stroke: "rgba(16, 185, 129, 0.9)"
    };
  }
}; 