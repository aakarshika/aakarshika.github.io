import { useMemo } from 'react';
import skillsData from '../../skills_timeline.json';
import { skillCategoryPaths } from './skillCategoryPaths';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generates a visually distinct color palette for skills/categories
 * @param {number} n - Number of colors needed
 * @returns {string[]} Array of RGBA color strings
 */
function generateColorPalette(n) {
  return Array.from({ length: n }, (_, i) => {
    const hue = (360 * i) / n;
    const saturation = 90;
    const lightness = 45;
    
    // Convert HSL to RGB
    const h = hue / 360;
    const s = saturation / 100;
    const l = lightness / 100;
    
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h * 6) % 2 - 1));
    const m = l - c / 2;
    
    let r, g, b;
    if (h < 1/6) {
      [r, g, b] = [c, x, 0];
    } else if (h < 2/6) {
      [r, g, b] = [x, c, 0];
    } else if (h < 3/6) {
      [r, g, b] = [0, c, x];
    } else if (h < 4/6) {
      [r, g, b] = [0, x, c];
    } else if (h < 5/6) {
      [r, g, b] = [x, 0, c];
    } else {
      [r, g, b] = [c, 0, x];
    }
    
    return `rgba(${Math.round((r + m) * 255)}, ${Math.round((g + m) * 255)}, ${Math.round((b + m) * 255)}, 1)`;
  });
}

/**
 * Maps expertise levels to visual line thickness
 */
const expertiseThickness = {
  'Beginner': 25,
  'Intermediate': 30,
  'Expert': 35
};

/**
 * Parses date string to timestamp
 * @param {string} dateStr - Date string to parse
 * @returns {number} Timestamp in milliseconds
 */
const parseDate = (dateStr) => new Date(dateStr).getTime();

/**
 * Extracts unique skills from data
 * @param {Array} data - Skills data array
 * @returns {string[]} Array of unique skill names
 */
const getUniqueSkills = (data) => [...new Set(data.map(item => item.Skill))];

/**
 * Extracts unique companies from data
 * @param {Array} data - Skills data array
 * @returns {string[]} Array of unique company names
 */
const getUniqueCompanies = (data) => [...new Set(data.map(item => item['Where Tag']))];

// ============================================================================
// HIERARCHICAL LEVEL SYSTEM
// ============================================================================

/**
 * Builds a hierarchical category tree from flat path strings
 * @param {string[]} paths - Array of dot-separated category paths
 * @returns {Object} Nested object representing the category tree
 */
function buildCategoryTree(paths) {
  const root = {};
  for (const path of paths) {
    const parts = path.split('.');
    let node = root;
    for (const part of parts) {
      node[part] = node[part] || {};
      node = node[part];
    }
  }
  return root;
}

/**
 * Finds the maximum depth of the category tree
 * @param {Object} tree - Category tree object
 * @param {number} depth - Current depth
 * @returns {number} Maximum depth of the tree
 */
function getMaxTreeDepth(tree, depth = 1) {
  if (!tree || typeof tree !== 'object' || Object.keys(tree).length === 0) {
    return depth;
  }
  let max = depth;
  for (const key in tree) {
    max = Math.max(max, getMaxTreeDepth(tree[key], depth + 1));
  }
  return max;
}

/**
 * Maps a skill to its hierarchical levels, filling missing levels with the skill name
 * @param {string} skill - Skill name
 * @param {Object} categoryTree - Category tree
 * @param {number} maxDepth - Maximum depth to ensure all skills have same levels
 * @returns {string[]} Array of hierarchical levels for the skill
 */
function mapSkillToHierarchicalLevels(skill, categoryTree, maxDepth) {
  const skillPath = skill.toLowerCase().replace(/\s+/g, '_');
  
  // Find the matching path in skillCategoryPaths
  const matchingPath = skillCategoryPaths.find(path => path.includes(skillPath));
  
  if (!matchingPath) {
    // If no matching path found, create a simple hierarchy
    const levels = ['tech', 'other', skillPath];
    // Fill remaining levels with the skill name
    while (levels.length < maxDepth) {
      levels.push(skillPath);
    }
    return levels;
  }
  
  // Split the matching path into levels
  const pathParts = matchingPath.split('.');
  
  // Fill missing levels with the skill name
  while (pathParts.length < maxDepth) {
    pathParts.push(skillPath);
  }
  
  return pathParts;
}

/**
 * Gets all nodes at a specific hierarchical level
 * @param {Array} skillLevels - Array of skill level mappings
 * @param {number} level - Desired level (1-based)
 * @returns {string[]} Array of unique nodes at the specified level
 */
function getNodesAtHierarchicalLevel(skillLevels, level) {
  const nodes = new Set();
  skillLevels.forEach(skillLevel => {
    if (skillLevel[level - 1]) {
      nodes.add(skillLevel[level - 1]);
    }
  });
  return Array.from(nodes);
}

/**
 * Maps skills to their hierarchical levels
 * @param {string[]} uniqueSkills - Array of unique skill names
 * @param {Object} categoryTree - Category tree
 * @returns {Object} Object containing skill levels and max depth
 */
function createHierarchicalSkillMapping(uniqueSkills, categoryTree) {
  const maxDepth = getMaxTreeDepth(categoryTree);
  const skillLevels = {};
  
  uniqueSkills.forEach(skill => {
    skillLevels[skill] = mapSkillToHierarchicalLevels(skill, categoryTree, maxDepth);
  });
  
  return { skillLevels, maxDepth };
}

/**
 * Creates a mapping from level nodes to skills
 * @param {Object} skillLevels - Mapping of skills to their levels
 * @param {number} level - Current level (1-based)
 * @returns {Object} Mapping of level nodes to arrays of skills
 */
function createLevelToSkillsMapping(skillLevels, level) {
  const levelToSkills = {};
  
  Object.entries(skillLevels).forEach(([skill, levels]) => {
    const levelNode = levels[level - 1];
    if (levelNode) {
      if (!levelToSkills[levelNode]) {
        levelToSkills[levelNode] = [];
      }
      levelToSkills[levelNode].push(skill);
    }
  });
  
  return levelToSkills;
}

// ============================================================================
// SORTING FUNCTIONS
// ============================================================================

/**
 * Sorts visible nodes based on their position in skillCategoryPaths
 * @param {string[]} visibleNodes - Array of visible node paths
 * @param {Object} skillLevels - Mapping of skills to their hierarchical levels
 * @returns {string[]} Sorted array of visible nodes
 */
function sortNodesByCategoryPaths(visibleNodes, skillLevels) {
  // Create a mapping from node to its path in skillCategoryPaths
  const nodeToPathIndex = {};
  
  visibleNodes.forEach(node => {
    // Find the skill that corresponds to this node
    const skillForNode = Object.keys(skillLevels).find(skill => {
      const levels = skillLevels[skill];
      return levels.some(level => level === node);
    });
    
    if (skillForNode) {
      // Find the matching path in skillCategoryPaths
      const skillPath = skillForNode.toLowerCase().replace(/\s+/g, '_');
      const pathIndex = skillCategoryPaths.findIndex(path => path.includes(skillPath));
      nodeToPathIndex[node] = pathIndex !== -1 ? pathIndex : Infinity;
    } else {
      // If no matching path found, put at the end
      nodeToPathIndex[node] = Infinity;
    }
  });
  
  // Sort nodes by their path index
  return visibleNodes.sort((a, b) => {
    const indexA = nodeToPathIndex[a] || Infinity;
    const indexB = nodeToPathIndex[b] || Infinity;
    return indexA - indexB;
  });
}

// ============================================================================
// VISUAL PROPERTIES
// ============================================================================

/**
 * Generates color and position mappings for visible nodes
 * @param {string[]} visibleNodes - Array of visible node paths
 * @returns {Object} Object containing color and position mappings
 */
function generateVisualProperties(visibleNodes) {
  const palette = generateColorPalette(visibleNodes.length);
  const nodeColors = {};
  const nodePositions = {};
  
  visibleNodes.forEach((node, i) => {
    nodeColors[node] = palette[i];
    nodePositions[node] = i;
  });
  
  return { nodeColors, nodePositions };
}

// ============================================================================
// TIME CALCULATIONS
// ============================================================================

/**
 * Calculates the overall time range from the skills data
 * @param {Array} skillsData - Raw skills data array
 * @returns {Object} Object containing start time, end time, and time range
 */
function calculateTimeRange(skillsData) {
  const sortedData = [...skillsData].sort((a, b) => parseDate(a['Start Date']) - parseDate(b['Start Date']));
  const startTime = parseDate(sortedData[0]['Start Date']);
  const endTime = parseDate(sortedData[sortedData.length - 1]['End Date']);
  const timeRange = endTime - startTime;
  
  return { startTime, endTime, timeRange, sortedData };
}

/**
 * Converts a timestamp to Y-coordinate for visualization
 * @param {number} timestamp - Timestamp to convert
 * @param {number} startTime - Start of time range
 * @param {number} timeRange - Total time range
 * @param {number} yZoom - Zoom level for Y axis
 * @returns {number} Y-coordinate value
 */
function timestampToY(timestamp, startTime, timeRange, yZoom) {
  return ((timestamp - startTime) / timeRange) * (yZoom - 40) + 20;
}

// ============================================================================
// SEGMENT PROCESSING
// ============================================================================

/**
 * Merges overlapping time periods for category-level visualization
 * @param {Array} periods - Array of skill periods
 * @returns {Array} Array of merged periods
 */
function mergeOverlappingPeriods(periods) {
  const merged = [];
  periods.forEach(period => {
    const s = parseDate(period['Start Date']);
    const e = parseDate(period['End Date']);
    if (!merged.length || s > merged[merged.length - 1].end) {
      merged.push({ start: s, end: e, expertise: period['Expertise Level Achieved'] });
    } else {
      merged[merged.length - 1].end = Math.max(merged[merged.length - 1].end, e);
    }
  });
  return merged;
}

/**
 * Creates segments for a single skill
 * @param {Array} periods - Array of skill periods
 * @param {number} x - X position for the skill
 * @param {string} node - Node identifier
 * @param {string} color - Color for the segments
 * @param {Object} nodePositions - Mapping of nodes to positions
 * @param {number} startTime - Start of time range
 * @param {number} timeRange - Total time range
 * @param {number} yZoom - Zoom level for Y axis
 * @returns {Object} Object containing segments, gaps, and achievements
 */
function createSkillSegments(periods, x, node, color, nodePositions, startTime, timeRange, yZoom) {
  const segments = [];
  const gaps = [];
  const achievements = [];
  
  for (let i = 0; i < periods.length; i++) {
    const item = periods[i];
    const y1 = timestampToY(parseDate(item['Start Date']), startTime, timeRange, yZoom);
    const y2 = timestampToY(parseDate(item['End Date']), startTime, timeRange, yZoom);
    
    segments.push({
      x,
      y1,
      y2,
      thickness: expertiseThickness[item['Expertise Level Achieved']],
      color,
      skill: item.Skill,
      company: item['Where Tag'],
      description: item['1 line Description on how I used it'],
      expertise: item['Expertise Level Achieved']
    });
    
    if (item['Expertise Level Achieved'] === 'Expert') {
      achievements.push({
        x: x-1,
        y: y2-1,
        skill: item.Skill,
        company: item['Where Tag'],
        expertise: item['Expertise Level Achieved']
      });
    }
    
    // Check for gaps between periods
    if (i < periods.length - 1) {
      const next = periods[i + 1];
      const gapStart = parseDate(item['End Date']);
      const gapEnd = parseDate(next['Start Date']);
      if (gapEnd > gapStart) {
        const gy1 = timestampToY(gapStart, startTime, timeRange, yZoom);
        const gy2 = timestampToY(gapEnd, startTime, timeRange, yZoom);
        gaps.push({ x, y1: gy1, y2: gy2, skill: item.Skill, color: color });
      }
    }
  }
  
  return { segments, gaps, achievements };
}

/**
 * Creates segments for a category (multiple skills)
 * @param {Array} mergedPeriods - Array of merged periods
 * @param {number} x - X position for the category
 * @param {string} node - Node identifier
 * @param {string} color - Color for the segments
 * @param {number} startTime - Start of time range
 * @param {number} timeRange - Total time range
 * @param {number} yZoom - Zoom level for Y axis
 * @returns {Array} Array of segment objects
 */
function createCategorySegments(mergedPeriods, x, node, color, startTime, timeRange, yZoom) {
  return mergedPeriods.map(({ start, end, expertise }) => {
    const y1 = timestampToY(start, startTime, timeRange, yZoom);
    const y2 = timestampToY(end, startTime, timeRange, yZoom);
    return {
      x,
      y1,
      y2,
      thickness: expertiseThickness[expertise] || 20,
      color,
      skill: node,
      company: '',
      description: '',
      expertise
    };
  });
}

/**
 * Processes all visible nodes to create segments, gaps, and achievements
 * @param {string[]} visibleNodes - Array of visible node paths
 * @param {Object} levelToSkills - Mapping of level nodes to skills
 * @param {Object} nodeColors - Mapping of nodes to colors
 * @param {Object} nodePositions - Mapping of nodes to positions
 * @param {number} startTime - Start of time range
 * @param {number} timeRange - Total time range
 * @param {number} yZoom - Zoom level for Y axis
 * @returns {Object} Object containing segments, gaps, and achievements
 */
function processAllNodes(visibleNodes, levelToSkills, nodeColors, nodePositions, startTime, timeRange, yZoom) {
  const segments = [];
  const gaps = [];
  const achievements = [];
  
  visibleNodes.forEach(node => {
    const nodeSkills = levelToSkills[node] || [];
    
    // Gather all periods for this node (skill or category)
    let periods = [];
    nodeSkills.forEach(skill => {
      periods = periods.concat(skillsData.filter(item => item.Skill === skill));
    });
    
    // Sort periods by start date
    periods.sort((a, b) => parseDate(a['Start Date']) - parseDate(b['Start Date']));
    
    if (nodeSkills.length > 1) {
      // Category: merge overlapping periods
      const merged = mergeOverlappingPeriods(periods);
      const categorySegments = createCategorySegments(
        merged, 
        nodePositions[node], 
        node, 
        nodeColors[node], 
        startTime, 
        timeRange, 
        yZoom
      );
      segments.push(...categorySegments);
    } else if (nodeSkills.length === 1) {
      // Single skill: use original logic
      const { segments: skillSegments, gaps: skillGaps, achievements: skillAchievements } = 
        createSkillSegments(
          periods, 
          nodePositions[node], 
          node, 
          nodeColors[node], 
          nodePositions, 
          startTime, 
          timeRange, 
          yZoom
        );
      segments.push(...skillSegments);
      gaps.push(...skillGaps);
      achievements.push(...skillAchievements);
    }
  });
  
  return { segments, gaps, achievements };
}

// ============================================================================
// MAIN HOOK
// ============================================================================

/**
 * Custom hook that processes skills timeline data for visualization
 * @param {Object} options - Configuration options
 * @param {number} options.yZoom - Zoom level for Y axis (default: 600)
 * @param {number|null} options.categoryLevel - Category level to display (null for all skills)
 * @returns {Object} Processed data for timeline visualization
 */
export default function useSkillsTimelineData({ yZoom = 600, categoryLevel = null } = {}) {
  return useMemo(() => {
    // Build category tree and create hierarchical skill mapping
    const categoryTree = buildCategoryTree(skillCategoryPaths);
    const uniqueSkills = getUniqueSkills(skillsData);
    const { skillLevels, maxDepth } = createHierarchicalSkillMapping(uniqueSkills, categoryTree);
    
    // Determine which level to display
    const displayLevel = categoryLevel || maxDepth;
    const visibleNodes = getNodesAtHierarchicalLevel(Object.values(skillLevels), displayLevel);
    
    // Sort visible nodes based on skillCategoryPaths
    const sortedVisibleNodes = sortNodesByCategoryPaths(visibleNodes, skillLevels);
    
    // Create level to skills mapping
    const levelToSkills = createLevelToSkillsMapping(skillLevels, displayLevel);
    
    // Generate visual properties
    const { nodeColors, nodePositions } = generateVisualProperties(sortedVisibleNodes);
    
    // Calculate time range
    const { startTime, endTime, timeRange } = calculateTimeRange(skillsData);
    
    // Process all nodes to create visualization data
    const { segments, gaps, achievements } = processAllNodes(
      sortedVisibleNodes, 
      levelToSkills, 
      nodeColors, 
      nodePositions, 
      startTime, 
      timeRange, 
      yZoom
    );
    
    return {
      segments,
      gaps,
      achievements,
      skills: sortedVisibleNodes,
      startTime,
      endTime,
      skillColors: nodeColors,
      expertiseThickness,
      skillPositions: nodePositions,
      parseDate,
      categoryTree,
      maxDepth,
      skillLevels
    };
  }, [yZoom, categoryLevel]);
} 