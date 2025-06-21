import { useState, useMemo } from 'react';
import { hierarchy, tree } from 'd3-hierarchy';
import { 
  buildHierarchy, 
  buildSkillToTimelineMapping, 
  buildCategoryToSkillsMapping,
  getNodeTimelineData 
} from '../utils/skillDataUtils';
import { TREE_LAYOUT } from '../utils/constants';

/**
 * Custom hook for managing skills tree data and highlighting
 * @returns {Object} Tree data, highlighting state, and related functions
 */
export function useSkillsTree() {
  const [highlightedNodes, setHighlightedNodes] = useState(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [showOnlyWithData, setShowOnlyWithData] = useState(true);
  const [scaleUpLeafNodes, setScaleUpLeafNodes] = useState(true);

  // Build hierarchy data
  const { tree: hierarchyTree } = useMemo(() => buildHierarchy(), []);

  /**
   * Filters nodes to only include those with timeline data
   * @param {Object} node - Node to filter
   * @param {string} nodeName - Name of the node
   * @returns {Object|null} Filtered node or null if no data
   */
  const filterNodeWithData = (node, nodeName) => {
    const skillToTimeline = buildSkillToTimelineMapping();
    const categoryToSkills = buildCategoryToSkillsMapping();
    
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
        const filteredChild = filterNodeWithData(childNode, childName);
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
   * Gets the filtered hierarchy based on the toggle state
   * @returns {Object} Filtered hierarchy tree
   */
  const getFilteredHierarchy = () => {
    if (!showOnlyWithData) {
      return hierarchyTree;
    }
    
    const filteredTree = {};
    Object.entries(hierarchyTree).forEach(([rootName, rootNode]) => {
      const filteredRoot = filterNodeWithData(rootNode, rootName);
      if (filteredRoot) {
        filteredTree[rootName] = filteredRoot;
      }
    });
    
    return filteredTree;
  };

  /**
   * Picks the next node to highlight in level-by-level order
   * @returns {string|null} Next node name to highlight, or null if all done
   */
  const pickNextNode = () => {
    const filteredHierarchy = getFilteredHierarchy();
    
    // Group nodes by level (deepest level first)
    const nodesByLevel = {};
    
    const findNodesByLevel = (node, level = 1) => {
      if (!nodesByLevel[level]) {
        nodesByLevel[level] = [];
      }
      
      // Only add nodes that have timeline data when toggle is on
      if (showOnlyWithData) {
        const skillToTimeline = buildSkillToTimelineMapping();
        const categoryToSkills = buildCategoryToSkillsMapping();
        const mockNode = {
          children: node.children ? Object.fromEntries(
            Object.entries(node.children).map(([childName, childNode]) => [
              childName, 
              { name: childName, children: childNode.children || {} }
            ])
          ) : {}
        };
        const timelineData = getNodeTimelineData(node.name, mockNode, skillToTimeline, categoryToSkills);
        if (timelineData.length === 0) {
          return; // Skip nodes without timeline data
        }
      }
      
      nodesByLevel[level].push(node.name);
      
      if (node.children) {
        Object.values(node.children).forEach(child => {
          findNodesByLevel(child, level + 1);
        });
      }
    };
    
    // Build level groups
    Object.values(filteredHierarchy).forEach(rootNode => {
      findNodesByLevel(rootNode);
    });
    
    // Process levels from deepest to shallowest
    const levels = Object.keys(nodesByLevel).map(Number).sort((a, b) => b - a);
    
    for (const level of levels) {
      const levelNodes = nodesByLevel[level];
      const nextNode = levelNodes.find(node => !highlightedNodes.has(node));
      
      if (nextNode) {
        const totalNodes = Object.values(nodesByLevel).flat().length;
        console.log(`🎯 ${nextNode} (Level ${level}) (${highlightedNodes.size + 1}/${totalNodes})`);
        return nextNode;
      }
    }
    
    console.log('🏁 All nodes highlighted!');
    return null;
  };

  /**
   * Handles button click to highlight the next node
   */
  const handleHighlightNext = () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      const nextNode = pickNextNode();
      if (nextNode) {
        setHighlightedNodes(prev => new Set([...prev, nextNode]));
      }
    } catch (error) {
      console.error('❌ Error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Resets all highlighted nodes
   */
  const resetHighlighting = () => {
    setHighlightedNodes(new Set());
  };

  /**
   * Toggles the "show only with data" filter
   */
  const toggleShowOnlyWithData = () => {
    setShowOnlyWithData(prev => !prev);
    // Reset highlighting when toggling to avoid highlighting non-existent nodes
    setHighlightedNodes(new Set());
  };

  /**
   * Toggles the "scale up leaf nodes" feature
   */
  const toggleScaleUpLeafNodes = () => {
    setScaleUpLeafNodes(prev => !prev);
  };

  /**
   * Builds tree data for D3 visualization
   * @returns {Array} Array of tree nodes with positioning data
   */
  const buildTreeData = () => {
    const filteredHierarchy = getFilteredHierarchy();
    
    const convertToD3Format = (node, name = 'root', path = []) => {
      const children = Object.entries(node).map(([key, child]) => {
        const childPath = [...path, key];
        return convertToD3Format(child.children || {}, key, childPath);
      });
      
      return {
        name,
        path: path.join('.'),
        children: children.length > 0 ? children : undefined,
        isHighlighted: highlightedNodes.has(name),
        timelineData: node.timelineData || []
      };
    };
    
    const root = hierarchy(convertToD3Format(filteredHierarchy));
    
    // Use layout settings from constants
    const treeLayout = tree()
      .nodeSize(TREE_LAYOUT.nodeSize)
      .separation(TREE_LAYOUT.separation);
    
    treeLayout(root);
    
    const nodes = [];
    const traverse = (node, level = 0) => {
      const nodeName = node.data.name;
      
      // Get timeline data for this specific node
      const skillToTimeline = buildSkillToTimelineMapping();
      const categoryToSkills = buildCategoryToSkillsMapping();
      
      // Create a mock node object for getNodeTimelineData
      const mockNode = {
        children: node.children ? Object.fromEntries(
          node.children.map(child => [child.data.name, { name: child.data.name, children: {} }])
        ) : {}
      };
      
      const nodeTimelineData = getNodeTimelineData(nodeName, mockNode, skillToTimeline, categoryToSkills);
      
      nodes.push({
        id: node.data.path || node.data.name,
        name: nodeName,
        level: level + 1,
        x: node.x,
        y: node.y,
        children: node.children ? node.children.map(child => child.data.path || child.data.name) : [],
        childCount: node.children ? node.children.length : 0,
        isHighlighted: highlightedNodes.has(nodeName),
        timelineData: nodeTimelineData
      });
      
      if (node.children) {
        node.children.forEach(child => traverse(child, level + 1));
      }
    };
    
    traverse(root);
    return nodes;
  };

  const treeNodes = useMemo(() => buildTreeData(), [highlightedNodes, showOnlyWithData]);

  // Calculate tree bounds
  const treeBounds = treeNodes.length > 0 ? {
    minX: Math.min(...treeNodes.map(n => n.x)),
    maxX: Math.max(...treeNodes.map(n => n.x)),
    minY: Math.min(...treeNodes.map(n => n.y)),
    maxY: Math.max(...treeNodes.map(n => n.y))
  } : { minX: 0, maxX: 400, minY: 0, maxY: 300 };
  
  const treeWidth = treeBounds.maxX - treeBounds.minX + 200;
  const treeHeight = treeBounds.maxY - treeBounds.minY + 200;

  // Debug information
  const skillToTimeline = buildSkillToTimelineMapping();
  const categoryToSkills = buildCategoryToSkillsMapping();
  
  console.log('Skill to Timeline Mapping:', Object.keys(skillToTimeline));
  console.log('Category to Skills Mapping:', categoryToSkills);
  
  // Calculate total timeline entries across all nodes
  const totalTimelineEntries = treeNodes.reduce((total, node) => {
    return total + (node.timelineData ? node.timelineData.length : 0);
  }, 0);

  // Debug: Show nodes with timeline data
  const nodesWithData = treeNodes.filter(node => node.timelineData && node.timelineData.length > 0);
  console.log('Nodes with timeline data:', nodesWithData.map(node => ({
    name: node.name,
    entries: node.timelineData.length,
    sampleData: node.timelineData.slice(0, 2)
  })));

  // Debug: Show all node names
  console.log('All node names:', treeNodes.map(node => node.name));
  console.log('Available normalized skill names:', Object.keys(skillToTimeline));

  return {
    // State
    highlightedNodes,
    isProcessing,
    hoveredNode,
    setHoveredNode,
    showOnlyWithData,
    scaleUpLeafNodes,
    
    // Data
    treeNodes,
    hierarchyTree,
    treeBounds,
    treeWidth,
    treeHeight,
    
    // Statistics
    totalTimelineEntries,
    nodesWithData,
    skillToTimeline,
    categoryToSkills,
    
    // Actions
    handleHighlightNext,
    resetHighlighting,
    toggleShowOnlyWithData,
    toggleScaleUpLeafNodes
  };
} 