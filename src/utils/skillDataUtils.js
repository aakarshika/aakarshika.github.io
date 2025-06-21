import skillsData from '../../skills_timeline.json';
import { skillCategoryPaths } from '../hooks/skillCategoryPaths';

/**
 * Helper to normalize names for matching
 * @param {string} name - Name to normalize
 * @returns {string} Normalized name
 */
export function normalizeName(name) {
  return name.toLowerCase().replace(/\s+/g, '_');
}

/**
 * Determines if a node should be scaled up (is a leaf node)
 * @param {Object} node - Node object
 * @param {Array} treeNodes - All tree nodes for reference
 * @param {Set} highlightedNodes - Set of highlighted node names
 * @param {boolean} scaleUpLeafNodes - Whether scaling is enabled
 * @returns {boolean} True if node should be scaled up
 */
export function shouldScaleNode(node, treeNodes, highlightedNodes, scaleUpLeafNodes) {
  if (!scaleUpLeafNodes) return false;
  
  // If it's a literal leaf node (no children)
  if (!node.children || node.children.length === 0) {
    return true;
  }
  
  // If all children are highlighted, treat it as a leaf
  const allChildrenHighlighted = node.children.some(childId => {
    const childNode = treeNodes.find(n => n.id === childId);
    return childNode && highlightedNodes.has(childNode.name);
  });
  
  return allChildrenHighlighted;
}

/**
 * Maps skill names to their timeline data
 * @returns {Object} Mapping of skill names to their timeline entries
 */
export function buildSkillToTimelineMapping() {
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
      company: entry['Where Tag'],
      description: entry['1 line Description on how I used it']
    });
  });
  
  return mapping;
}

/**
 * Maps category paths to their corresponding skills
 * @returns {Object} Mapping of category paths to skill arrays
 */
export function buildCategoryToSkillsMapping() {
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
}

/**
 * Gets all timeline data for a given node (skill or category)
 * @param {string} nodeName - Name of the node
 * @param {Object} node - Node object with children
 * @param {Object} skillToTimeline - Mapping of skills to timeline data
 * @param {Object} categoryToSkills - Mapping of categories to skills
 * @returns {Array} Array of timeline entries for the node
 */
export function getNodeTimelineData(nodeName, node, skillToTimeline, categoryToSkills) {
  const timelineData = [];
  const normalizedNodeName = normalizeName(nodeName);
  
  // Debug for tech node
  if (nodeName === 'tech') {
    console.log('🔍 Processing tech node:', {
      nodeName,
      hasChildren: !!node.children,
      childrenKeys: node.children ? Object.keys(node.children) : [],
      childrenCount: node.children ? Object.keys(node.children).length : 0
    });
  }
  
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
    if (nodeName === 'tech') {
      console.log('🔍 Tech node collecting from children:', Object.keys(node.children));
    }
    
    Object.values(node.children).forEach(child => {
      const childData = getNodeTimelineData(child.name, child, skillToTimeline, categoryToSkills);
      if (nodeName === 'tech') {
        console.log(`🔍 Tech node child ${child.name} returned ${childData.length} entries`);
      }
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
  
  if (nodeName === 'tech') {
    console.log('🔍 Tech node final result:', {
      totalEntries: timelineData.length,
      uniqueEntries: uniqueData.length,
      sampleEntries: uniqueData.slice(0, 3)
    });
  }
  
  return uniqueData;
}

/**
 * Builds the hierarchical tree structure from skillCategoryPaths
 * @returns {Object} Tree structure with parent-child relationships and timeline data
 */
export function buildHierarchy() {
  const tree = {};
  const skillToTimeline = buildSkillToTimelineMapping();
  const categoryToSkills = buildCategoryToSkillsMapping();
  
  // Build the complete tree from skillCategoryPaths
  skillCategoryPaths.forEach(path => {
    const parts = path.split('.');
    let current = tree;
    
    parts.forEach(part => {
      if (!current[part]) {
        current[part] = { name: part, children: {} };
      }
      current = current[part].children;
    });
  });
  
  // Add timeline data to each node
  const addTimelineDataToNode = (node, nodeName) => {
    const timelineData = getNodeTimelineData(nodeName, node, skillToTimeline, categoryToSkills);
    node.timelineData = timelineData;
    
    // Add timeline data to children
    if (node.children) {
      Object.entries(node.children).forEach(([childName, childNode]) => {
        addTimelineDataToNode(childNode, childName);
      });
    }
  };
  
  Object.entries(tree).forEach(([rootName, rootNode]) => {
    addTimelineDataToNode(rootNode, rootName);
  });
  
  return { tree };
}

/**
 * Calculates total days worked from timeline data
 * @param {Array} timelineData - Array of timeline entries
 * @returns {number} Total days worked
 */
export function calculateTotalDays(timelineData) {
  if (!timelineData || timelineData.length === 0) return 0;
  
  let totalDays = 0;
  timelineData.forEach(entry => {
    const startDate = new Date(entry.startDate);
    const endDate = new Date(entry.endDate);
    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    totalDays += Math.max(0, daysDiff); // Ensure non-negative
  });
  
  return totalDays;
}

/**
 * Gets sorted timeline data by start date
 * @param {Array} timelineData - Array of timeline entries
 * @returns {Array} Sorted timeline entries
 */
export function getSortedTimelineData(timelineData) {
  if (!timelineData || timelineData.length === 0) return [];
  
  return [...timelineData].sort((a, b) => {
    return new Date(a.startDate) - new Date(b.startDate);
  });
}

/**
 * Formats timeline data for display
 * @param {Array} timelineData - Array of timeline entries
 * @returns {string} Formatted timeline string
 */
export function formatTimelineData(timelineData) {
  if (!timelineData || timelineData.length === 0) {
    return 'No timeline data';
  }
  
  // Get unique date ranges
  const dateRanges = timelineData.map(entry => ({
    start: new Date(entry.startDate).getFullYear(),
    end: new Date(entry.endDate).getFullYear(),
    company: entry.company
  }));
  
  // Group by date ranges
  const groupedRanges = {};
  dateRanges.forEach(range => {
    const key = `${range.start}-${range.end}`;
    if (!groupedRanges[key]) {
      groupedRanges[key] = [];
    }
    if (!groupedRanges[key].includes(range.company)) {
      groupedRanges[key].push(range.company);
    }
  });
  
  // Format the ranges
  const formattedRanges = Object.entries(groupedRanges).map(([range, companies]) => {
    const [start, end] = range.split('-');
    return `${start}-${end} (${companies.join(', ')})`;
  });
  
  return formattedRanges.join(' | ');
} 