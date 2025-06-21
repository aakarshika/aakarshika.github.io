/**
 * Constants for the Skills Tree visualization
 */

// SVG margins
export const SVG_MARGIN = { 
  top: 50, 
  right: 50, 
  bottom: 50, 
  left: 50 
};

// Tree layout settings
export const TREE_LAYOUT = {
  nodeSize: [67, 120], // [height, width]
  separation: (a, b) => (a.parent === b.parent ? 1 : 1.1)
};

// Node scaling sizes
export const NODE_SIZES = {
  normal: {
    radius: 6,
    highlightedRadius: 8,
    timelineBackgroundRadius: 10,
    timelineBackgroundHighlightedRadius: 12
  },
  scaled: {
    radius: 10,
    highlightedRadius: 12,
    timelineBackgroundRadius: 14,
    timelineBackgroundHighlightedRadius: 16
  }
};

// Colors for different states
export const COLORS = {
  highlighted: {
    node: '#3b82f6',
    stroke: '#60a5fa',
    text: 'cornflowerblue'
  },
  normal: {
    node: '#6b7280',
    stroke: '#9ca3af',
    text: 'white'
  },
  timeline: {
    background: 'rgba(255, 255, 0, 0.2)',
    stroke: 'yellow',
    text: 'yellow'
  },
  connection: {
    highlighted: '#3b82f6',
    normal: '#4b5563'
  }
};

/**
 * Generates a rainbow color based on index
 * @param {number} index - The index of the node (0-based)
 * @param {number} total - Total number of nodes
 * @returns {string} CSS color string
 */
export function getRainbowColor(index, total) {
  if (total === 0) return '#6b7280'; // Default gray if no nodes
  
  // Generate hue based on index (0-360 degrees)
  const hue = (360 * index) / total;
  
  // Use high saturation and medium lightness for vibrant colors
  const saturation = 85;
  const lightness = 50;
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Generates a rainbow color palette for a given number of items
 * @param {number} count - Number of colors needed
 * @returns {string[]} Array of CSS color strings
 */
export function generateRainbowPalette(count) {
  return Array.from({ length: count }, (_, index) => 
    getRainbowColor(index, count)
  );
}

// Timeline entry colors
export const TIMELINE_COLORS = {
  duration: 'text-yellow-300',
  company: 'text-blue-300',
  level: 'text-green-300',
  description: 'text-gray-400'
};

// Toggle button states
export const TOGGLE_STATES = {
  active: {
    background: 'bg-green-600',
    hover: 'hover:bg-green-700',
    text: 'text-white'
  },
  inactive: {
    background: 'bg-gray-600',
    hover: 'hover:bg-gray-700',
    text: 'text-white'
  },
  scaleUp: {
    active: {
      background: 'bg-purple-600',
      hover: 'hover:bg-purple-700',
      text: 'text-white'
    },
    inactive: {
      background: 'bg-gray-600',
      hover: 'hover:bg-gray-700',
      text: 'text-white'
    }
  }
}; 