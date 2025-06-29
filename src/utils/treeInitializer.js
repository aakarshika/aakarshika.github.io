import skillsData from '../../skills_timeline.json';
import { skillCategoryPaths } from '../hooks/skillCategoryPaths';
import { ROOT_NODE_NAME } from './constants';

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
 * Normalize skill names for matching
 * @param {string} name - Name to normalize
 * @returns {string} Normalized name
 */
const normalizeName = (name) => {
  return name.toLowerCase().replace(/\s+/g, '_');
};

/**
 * Build skill to timeline mapping from JSON data
 * @returns {Object} Mapping of skill names to timeline entries
 */
const buildSkillToTimelineMapping = () => {
  const mapping = {};
  
  skillsData.forEach(entry => {
    const skillName = entry.Skill;
    const normalized = normalizeName(skillName);
    if (!mapping[normalized]) {
      mapping[normalized] = [];
    }
    mapping[normalized].push({
      startDate: entry['Start Date'],
      endDate: entry['End Date'],
      expertise: entry['Expertise Level Achieved'],
      company: entry['company'],
      description: entry['1 line Description on how I used it']
    });
  });
  
  return mapping;
};

/**
 * Build category to skills mapping from skill category paths
 * @returns {Object} Mapping of category paths to skill arrays
 */
const buildCategoryToSkillsMapping = () => {
  const mapping = {};
  
  // Create a mapping of normalized skill names to original skill names
  const normalizedSkillMap = {};
  skillsData.forEach(entry => {
    const normalizedName = normalizeName(entry.Skill);
    if (!normalizedSkillMap[normalizedName]) {
      normalizedSkillMap[normalizedName] = [];
    }
    normalizedSkillMap[normalizedName].push(entry.Skill);
  });
  
  skillCategoryPaths.forEach(path => {
    const parts = path.split('.');
    const lastPart = parts[parts.length - 1];
    const normalizedLastPart = normalizeName(lastPart);
    
    // Try to find matching skills
    const matchingSkills = [];
    
    // Direct match
    if (normalizedSkillMap[normalizedLastPart]) {
      matchingSkills.push(...normalizedSkillMap[normalizedLastPart]);
    }
    
    // Partial matches
    Object.keys(normalizedSkillMap).forEach(normalizedName => {
      if (normalizedName.includes(normalizedLastPart) || normalizedLastPart.includes(normalizedName)) {
        matchingSkills.push(...normalizedSkillMap[normalizedName]);
      }
    });
    
    // Remove duplicates
    const uniqueSkills = [...new Set(matchingSkills)];
    
    if (uniqueSkills.length > 0) {
      mapping[path] = uniqueSkills;
    }
  });
  
  return mapping;
};

/**
 * Get timeline data for a specific node
 * @param {string} nodeName - Name of the node
 * @param {Object} node - Node object with children
 * @param {Object} skillToTimeline - Mapping of skills to timeline data
 * @param {Object} categoryToSkills - Mapping of categories to skills
 * @returns {Array} Array of timeline entries for the node
 */
const getNodeTimelineData = (nodeName, node, skillToTimeline, categoryToSkills) => {
  const timelineData = [];
  const normalizedNodeName = normalizeName(nodeName);
  
  // If this is a leaf node (has no children), get direct skill data
  if (!node.children || Object.keys(node.children).length === 0) {
    // Direct normalized match
    if (skillToTimeline[normalizedNodeName]) {
      timelineData.push(...skillToTimeline[normalizedNodeName]);
    }
    
    // Also check if this node name matches any category path
    const categoryPath = Object.keys(categoryToSkills).find(path => {
      const lastPart = path.split('.').pop();
      return normalizeName(lastPart) === normalizedNodeName;
    });
    
    if (categoryPath && categoryToSkills[categoryPath]) {
      categoryToSkills[categoryPath].forEach(skill => {
        const normalizedSkill = normalizeName(skill);
        if (skillToTimeline[normalizedSkill]) {
          timelineData.push(...skillToTimeline[normalizedSkill]);
        }
      });
    }
    
    // Try case-insensitive/partial matching
    Object.keys(skillToTimeline).forEach(skillNorm => {
      if (
        skillNorm === normalizedNodeName ||
        skillNorm.includes(normalizedNodeName) ||
        normalizedNodeName.includes(skillNorm)
      ) {
        timelineData.push(...skillToTimeline[skillNorm]);
      }
    });
  } else {
    // This is a parent node, collect data from all children
    Object.values(node.children).forEach(child => {
      const childData = getNodeTimelineData(child.name, child, skillToTimeline, categoryToSkills);
      timelineData.push(...childData);
    });
  }
  
  // Remove duplicates based on start date, end date, and company
  const uniqueData = [];
  const seen = new Set();
  
  timelineData.forEach(entry => {
    const key = `${entry.startDate}-${entry.endDate}-${entry.company}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueData.push(entry);
    }
  });
  
  return uniqueData;
};

/**
 * Build hierarchy tree from skill category paths
 * @returns {Object} Hierarchical tree structure
 */
const buildHierarchy = () => {
  const tree = {};
  skillCategoryPaths.push(ROOT_NODE_NAME);
  
  skillCategoryPaths.forEach(path => {
    if (path !== ROOT_NODE_NAME) {
      path = ROOT_NODE_NAME + '.' + path;
    }
    const parts = path.split('.');
    let currentLevel = tree;
    
    parts.forEach((part, index) => {
      if (!currentLevel[part]) {
        currentLevel[part] = {
          name: part,
          children: {}
        };
      }
      currentLevel = currentLevel[part].children;
    });
  });
  
  return { tree };
};

/**
 * Filter nodes to only include those with timeline data
 * @param {Object} node - Node to filter
 * @param {string} nodeName - Name of the node
 * @param {Object} skillToTimeline - Skill to timeline mapping
 * @param {Object} categoryToSkills - Category to skills mapping
 * @returns {Object|null} Filtered node or null if no data
 */
const filterNodeWithData = (node, nodeName, skillToTimeline, categoryToSkills) => {
  // Create a mock node object for getNodeTimelineData
  const mockNode = {
    children: node.children ? Object.fromEntries(
      Object.entries(node.children).map(([childName, childNode]) => [
        childName, 
        { name: childName, children: childNode.children || {} }
      ])
    ) : {}
  };
  
  const timelineData = getNodeTimelineData(nodeName, mockNode, skillToTimeline, categoryToSkills);
  
  // If no timeline data, return null
  if (timelineData.length === 0) {
    return null;
  }
  
  // Filter children recursively
  const filteredChildren = {};
  if (node.children) {
    Object.entries(node.children).forEach(([childName, childNode]) => {
      const filteredChild = filterNodeWithData(childNode, childName, skillToTimeline, categoryToSkills);
      if (filteredChild) {
        filteredChildren[childName] = filteredChild;
      }
    });
  }
  
  return {
    ...node,
    children: filteredChildren,
    timelineData
  };
};

/**
 * Calculate y-coordinates for timeline data
 * @param {Array} timelineData - Timeline data for a node
 * @param {number} startTime - Start time of the entire timeline
 * @param {number} timeRange - Total time range
 * @param {number} yZoom - Total height available
 * @returns {Array} Timeline boxes with y-coordinates
 */
const calculateTimelineYCoordinates = (timelineData, startTime, timeRange, yZoom) => {
  // Sort timeline data by start date
  const sortedTimelineData = [...timelineData].sort(
    (a, b) => parseDate(a.startDate) - parseDate(b.startDate)
  );

  // Create timeline boxes for each period
  return sortedTimelineData.map((period, index) => {
    const y1 = timestampToY(parseDate(period.startDate), startTime, timeRange, yZoom);
    const y2 = timestampToY(parseDate(period.endDate), startTime, timeRange, yZoom);
    const height = y2 - y1;

    return {
      id: `period-${index}`,
      y: y1,
      height: Math.max(height, 10), // Minimum height of 10px
      startDate: period.startDate,
      endDate: period.endDate,
      expertise: period.expertise,
      company: period.company,
      description: period.description,
      periodIndex: index
    };
  });
};

/**
 * Calculate y-coordinates for parent nodes based on their children
 * @param {Object} node - Node object
 * @param {string} nodeName - Name of the node
 * @param {Object} skillToTimeline - Skill to timeline mapping
 * @param {Object} categoryToSkills - Category to skills mapping
 * @param {number} startTime - Start time of the entire timeline
 * @param {number} timeRange - Total time range
 * @param {number} yZoom - Total height available
 * @returns {Array} Timeline boxes with y-coordinates
 */
const calculateParentYCoordinates = (node, nodeName, skillToTimeline, categoryToSkills, startTime, timeRange, yZoom) => {
  // Get timeline data for this node
  const mockNode = {
    children: node.children ? Object.fromEntries(
      Object.entries(node.children).map(([childName, childNode]) => [
        childName, 
        { name: childName, children: childNode.children || {} }
      ])
    ) : {}
  };
  
  const timelineData = getNodeTimelineData(nodeName, mockNode, skillToTimeline, categoryToSkills);
  
  if (timelineData.length === 0) {
    return [];
  }
  
  return calculateTimelineYCoordinates(timelineData, startTime, timeRange, yZoom);
};

/**
 * Main function to initialize the tree with timeline data and y-coordinates
 * @param {number} yZoom - Total height available for timeline visualization
 * @returns {Object} Complete tree with timeline data and y-coordinates
 */
export const initializeTreeWithTimeline = (yZoom = 600) => {
  // console.log('🌳 Initializing tree with timeline data...');
  
  // Step 1: Get JSON data (already imported)
  // console.log('📊 Loaded skills data:', skillsData.length, 'entries');
  
  // Step 2: Build mappings
  const skillToTimeline = buildSkillToTimelineMapping();
  const categoryToSkills = buildCategoryToSkillsMapping();
  
  // console.log('🗺️ Built skill mappings:', Object.keys(skillToTimeline).length, 'skills');
  // console.log('📁 Built category mappings:', Object.keys(categoryToSkills).length, 'categories');
  
  // Step 3: Build the tree
  const { tree: hierarchyTree } = buildHierarchy();
  
  // Step 4: Filter with timeline data and build complete tree
  const filteredTree = {};
  Object.entries(hierarchyTree).forEach(([rootName, rootNode]) => {
    const filteredRoot = filterNodeWithData(rootNode, rootName, skillToTimeline, categoryToSkills);
    if (filteredRoot) {
      filteredTree[rootName] = filteredRoot;
    }
  });
  
  // console.log('🌿 Filtered tree roots:', Object.keys(filteredTree));
  
  // Step 5: Calculate time range for y-coordinates
  const allDates = skillsData.flatMap(item => [
    parseDate(item['Start Date']), 
    parseDate(item['End Date'])
  ]);
  const startTime = Math.min(...allDates);
  const endTime = Math.max(...allDates);
  const timeRange = endTime - startTime;
  
  // console.log('⏰ Time range:', new Date(startTime).toLocaleDateString(), 'to', new Date(endTime).toLocaleDateString());
  
  // Step 6: Calculate y-coordinates for each node (no x positions)
  const processNodeWithYCoordinates = (node, nodeName, parentId = null) => {
    const nodeId = parentId ? `${parentId}-${nodeName}` : nodeName;
    
    // Calculate y-coordinates for this node
    let timelineBoxes = [];
    if (node.timelineData && node.timelineData.length > 0) {
      // Leaf node - direct calculation
      timelineBoxes = calculateTimelineYCoordinates(node.timelineData, startTime, timeRange, yZoom);
    } else if (Object.keys(node.children).length > 0) {
      // Parent node - calculate based on children
      timelineBoxes = calculateParentYCoordinates(node, nodeName, skillToTimeline, categoryToSkills, startTime, timeRange, yZoom);
    }
    
    // Process children and establish parent-child relationships
    const processedChildren = {};
    const childIds = [];
    
    Object.entries(node.children).forEach(([childName, childNode]) => {
      const childId = `${nodeId}-${childName}`;
      const processedChild = processNodeWithYCoordinates(childNode, childName, nodeId);
      processedChildren[childName] = processedChild;
      childIds.push(childId);
    });
    
    return {
      id: nodeId,
      name: nodeName,
      parentId: parentId,
      children: processedChildren,
      childIds: childIds,
      timelineData: node.timelineData || [],
      timelineBoxes: timelineBoxes,
      isLeaf: Object.keys(node.children).length === 0,
      level: parentId ? parentId.split('-').length : 0,
      // Highlighting state preparation
      isHighlighted: false,
      highlightedChildren: 0,
      totalChildren: childIds.length
    };
  };
  
  // Process all root nodes
  const processedTree = {};
  Object.entries(filteredTree).forEach(([rootName, rootNode]) => {
    processedTree[rootName] = processNodeWithYCoordinates(rootNode, rootName);
  });
  
  // console.log('✅ Tree initialization complete');
  // console.log('📈 Timeline boxes calculated for all nodes');
  
  return {
    tree: processedTree,
    timeRange: {
      startTime,
      endTime,
      timeRange
    },
    yZoom,
    skillToTimeline,
    categoryToSkills
  };
};

/**
 * Helper function to get a flat list of all nodes with their relationships
 * @param {Object} treeData - Tree data from initializeTreeWithTimeline
 * @returns {Array} Flat array of all nodes with parent-child relationships
 */
export const getFlatNodeList = (treeData) => {
  const nodes = [];
  
  const traverse = (node) => {
    nodes.push({
      id: node.id,
      name: node.name,
      parentId: node.parentId,
      childIds: node.childIds,
      timelineData: node.timelineData,
      timelineBoxes: node.timelineBoxes,
      isLeaf: node.isLeaf,
      level: node.level,
      isHighlighted: node.isHighlighted,
      highlightedChildren: node.highlightedChildren,
      totalChildren: node.totalChildren
    });
    
    Object.values(node.children).forEach(child => {
      traverse(child);
    });
  };
  
  Object.values(treeData.tree).forEach(rootNode => {
    traverse(rootNode);
  });
  
  return nodes;
}; 