import { useMemo } from 'react';
import { shouldScaleNode } from '../../utils/skillDataUtils';

/**
 * Custom hook for SkillsList data processing
 * Handles node filtering, state calculation, and positioning logic
 */
export function useSkillsListData({ treeNodes, highlightedNodes, scaleUpLeafNodes }) {
  return useMemo(() => {
    if (!scaleUpLeafNodes) {
      return {
        visibleNodes: [],
        removingNodes: [],
        parentNodes: [],
        nextNode: null,
        positioning: null,
        getNodeState: () => 'hidden',
        findParentNode: () => null
      };
    }

    // Get current unhighlighted leaf nodes
    const currentUnhighlightedLeafNodes = treeNodes.filter(node => {
      const isLeaf = shouldScaleNode(node, treeNodes, highlightedNodes, scaleUpLeafNodes);
      return isLeaf && !node.isHighlighted;
    });

    // Calculate what the list will look like after the next highlight
    const nextHighlightedNodes = new Set([...highlightedNodes]);
    const nextNode = treeNodes.find(node => node.isPreview);
    if (nextNode) {
      nextHighlightedNodes.add(nextNode.name);
    }

    const nextUnhighlightedLeafNodes = treeNodes.filter(node => {
      const isLeaf = shouldScaleNode(node, treeNodes, nextHighlightedNodes, scaleUpLeafNodes);
      return isLeaf && !nextHighlightedNodes.has(node.name);
    });

    // Find parent nodes for nodes that will be removed
    const findParentNode = (nodeName) => {
      const node = treeNodes.find(n => n.name === nodeName);
      if (!node) return null;
      
      // Find parent by checking which node has this node as a child
      const parent = treeNodes.find(n => n.children && n.children.includes(node.id));
      return parent;
    };

    // Determine node states
    const getNodeState = (node) => {
      if (!node || !node.name) return 'hidden';
      
      const isCurrentlyVisible = currentUnhighlightedLeafNodes.some(n => n && n.name === node.name);
      const willBeVisible = nextUnhighlightedLeafNodes.some(n => n && n.name === node.name);
      
      if (isCurrentlyVisible && !willBeVisible) {
        return 'removing'; // Will be removed - darken
      } else if (!isCurrentlyVisible && willBeVisible) {
        return 'adding'; // Will be added - lighten
      } else if (isCurrentlyVisible && willBeVisible) {
        return 'staying'; // Will stay - normal
      } else {
        return 'hidden'; // Not visible in either state
      }
    };

    // Get nodes that will be removed and their parents
    const removingNodes = treeNodes.filter(node => getNodeState(node) === 'removing');
    const parentNodes = removingNodes.map(node => findParentNode(node.name)).filter(Boolean);

    // Show nodes that are currently visible, will be visible, or are parents of removing nodes
    const visibleNodes = treeNodes.filter(node => {
      const state = getNodeState(node);
      const isParentOfRemoving = parentNodes.some(parent => parent && parent.name === node.name);
      return state !== 'hidden' || isParentOfRemoving;
    });

    // Calculate positioning based on expertise levels and highlighted children
    const screenWidth = window.innerWidth;
    const containerPadding = 10; // 20px padding on each side
    const availableWidth = screenWidth - containerPadding;
    const boxHeight = 80; // Fixed box height
    const boxMargin = 10; // Gap between boxes
    
    // Calculate box width for each visible node based on expertise and highlighted children
    const calculateNodeWidth = (node) => {
      // Base width based on highest expertise level in timeline data
      let baseWidth = 45; // Default for Beginner
      
      if (node.timelineData && node.timelineData.length > 0) {
        const expertiseLevels = node.timelineData.map(entry => entry.expertise);
        if (expertiseLevels.includes('Expert')) {
          baseWidth = 65;
        } else if (expertiseLevels.includes('Intermediate')) {
          baseWidth = 55;
        }
      }
      
      // Add width for each highlighted child
      const highlightedChildrenCount = node.children ? 
        node.children.filter(childId => {
          const childNode = treeNodes.find(n => n.id === childId);
          return childNode && highlightedNodes.has(childNode.name);
        }).length : 0;
      
      const additionalWidth = highlightedChildrenCount * 25;
      
      return baseWidth + additionalWidth;
    };
    
    // Calculate individual box widths for each visible node
    const nodeWidths = visibleNodes.map(node => ({
      node,
      width: calculateNodeWidth(node)
    }));
    
    // Calculate total width needed
    const totalBoxesWidth = nodeWidths.reduce((sum, { width }) => sum + width, 0);
    const totalMarginsWidth = (visibleNodes.length - 1) * boxMargin;
    const totalWidthNeeded = totalBoxesWidth + totalMarginsWidth;
    
    // Calculate scaling factor to fit all boxes within available width
    const scaleFactor = totalWidthNeeded > availableWidth ? 
      (availableWidth - totalMarginsWidth) / totalBoxesWidth : 1;
    
    // Calculate final positions
    let currentX = 0;
    const nodePositions = nodeWidths.map(({ node, width }, index) => {
      const scaledWidth = width * scaleFactor;
      const position = {
        node,
        x: currentX,
        width: scaledWidth
      };
      currentX += scaledWidth + boxMargin;
      return position;
    });
    
    // Center the entire layout
    const actualTotalWidth = currentX - boxMargin; // Remove last margin
    const startX = (availableWidth - actualTotalWidth) / 2;

    const positioning = {
      screenWidth,
      availableWidth,
      boxHeight,
      boxMargin,
      totalBoxesWidth,
      totalMarginsWidth,
      totalWidthNeeded,
      scaleFactor,
      actualTotalWidth,
      startX,
      nodePositions
    };

    return {
      visibleNodes,
      removingNodes,
      parentNodes,
      nextNode,
      positioning,
      getNodeState,
      findParentNode
    };
  }, [treeNodes, highlightedNodes, scaleUpLeafNodes]);
} 