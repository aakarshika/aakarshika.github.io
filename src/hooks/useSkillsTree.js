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
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Remove highlightedNodes state - we'll derive it from treeNodes.isHighlighted
  const [highlightedNodeNames, setHighlightedNodeNames] = useState(new Set());

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
   * Picks the next node to be highlighted based on level priority
   * @returns {string|null} Name of the next node to highlight
   */
  const pickNextNode = () => {
    const filteredHierarchy = getFilteredHierarchy();
    
    // Group nodes by level (deepest level first)
    const nodesByLevel = {};
    
    const findNodesByLevel = (node, level = 1) => {
      if (!nodesByLevel[level]) {
        nodesByLevel[level] = [];
      }
      
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
      const nextNode = levelNodes.find(node => !highlightedNodeNames.has(node));
      
      if (nextNode) {
        const totalNodes = Object.values(nodesByLevel).flat().length;
        // // console.log(`🎯 ${nextNode} (Level ${level}) (${highlightedNodeNames.size + 1}/${totalNodes})`);
        return nextNode;
      }
    }
    
    // // console.log('🏁 All nodes highlighted!');
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
        setHighlightedNodeNames(prev => new Set([...prev, nextNode]));
      }
    } catch (error) {
      // console.error('❌ Error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Handles button click to unhighlight the last highlighted node
   */
  const handleUnhighlightLast = () => {
    if (isProcessing || highlightedNodeNames.size === 0) return;
    
    setIsProcessing(true);
    
    try {
      setHighlightedNodeNames(prev => {
        const nodesArray = Array.from(prev);
        const newSet = new Set(nodesArray.slice(0, -1)); // Remove the last node
        return newSet;
      });
    } catch (error) {
      // console.error('❌ Error:', error);
    } finally {
      setIsProcessing(false);
    }
  };



  /**
   * Builds tree data for D3 visualization
   * @returns {Array} Array of tree nodes with positioning data
   */
  const buildTreeData = () => {
    const filteredHierarchy = getFilteredHierarchy();
    const nextNode = pickNextNode();
    
    const convertToD3Format = (node, name = 'root', path = []) => {
      const children = Object.entries(node).map(([key, child]) => {
        const childPath = [...path, key];
        return convertToD3Format(child.children || {}, key, childPath);
      });
      
      return {
        name,
        path: path.join('.'),
        children: children.length > 0 ? children : undefined,
        isHighlighted: highlightedNodeNames.has(name),
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
      
      // Create a mock node object for getNodeTimelineData with proper children structure
      const mockNode = {
        children: node.children ? Object.fromEntries(
          node.children.map(child => {
            // Recursively build the children structure for this child
            const buildChildStructure = (childNode) => {
              if (!childNode.children || childNode.children.length === 0) {
                return { name: childNode.data.name, children: {} };
              }
              
              return {
                name: childNode.data.name,
                children: Object.fromEntries(
                  childNode.children.map(grandChild => [
                    grandChild.data.name,
                    buildChildStructure(grandChild)
                  ])
                )
              };
            };
            
            return [child.data.name, buildChildStructure(child)];
          })
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
        childrenHighlighted: node.children ? node.children.filter(child => child.data.isHighlighted).length : 0,
        childCount: node.children ? node.children.length : 0,
        isHighlighted: highlightedNodeNames.has(nodeName),
        isPreview: nextNode === nodeName,
        timelineData: nodeTimelineData
      });
      
      if (node.children) {
        node.children.forEach(child => traverse(child, level + 1));
      }
    };
    
    traverse(root);
    return nodes;
  };

  const treeNodes = useMemo(() => buildTreeData(), [highlightedNodeNames]);

  return {

    
    // Data
    treeNodes,
    
    // Actions
    handleHighlightNext,
    handleUnhighlightLast
  };
} 

