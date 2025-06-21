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
        positioning: null
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

    // Determine node states
    const getNodeState = (node) => {
      const isCurrentlyVisible = currentUnhighlightedLeafNodes.some(n => n.name === node.name);
      const willBeVisible = nextUnhighlightedLeafNodes.some(n => n.name === node.name);
      
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

    // Find parent nodes for nodes that will be removed
    const findParentNode = (nodeName) => {
      const node = treeNodes.find(n => n.name === nodeName);
      if (!node) return null;
      
      // Find parent by checking which node has this node as a child
      const parent = treeNodes.find(n => n.children.includes(node.id));
      return parent;
    };

    // Get nodes that will be removed and their parents
    const removingNodes = treeNodes.filter(node => getNodeState(node) === 'removing');
    const parentNodes = removingNodes.map(node => findParentNode(node.name)).filter(Boolean);

    // Show nodes that are currently visible, will be visible, or are parents of removing nodes
    const visibleNodes = treeNodes.filter(node => {
      const state = getNodeState(node);
      const isParentOfRemoving = parentNodes.some(parent => parent.name === node.name);
      return state !== 'hidden' || isParentOfRemoving;
    });

    // Calculate positioning
    const screenWidth = window.innerWidth;
    const containerPadding = 40; // 20px padding on each side
    const availableWidth = screenWidth - containerPadding;
    const boxWidth = 200; // Fixed box width
    const boxHeight = 80; // Fixed box height
    const boxMargin = 20; // Margin between boxes
    
    // Calculate total width needed and spacing
    const totalBoxesWidth = visibleNodes.length * boxWidth;
    const totalMarginsWidth = (visibleNodes.length - 1) * boxMargin;
    const totalWidthNeeded = totalBoxesWidth + totalMarginsWidth;
    
    // If we need more space than available, adjust box width
    const adjustedBoxWidth = totalWidthNeeded > availableWidth 
      ? (availableWidth - totalMarginsWidth) / visibleNodes.length
      : boxWidth;
    
    // Calculate spacing to center the boxes
    const actualTotalWidth = visibleNodes.length * adjustedBoxWidth + totalMarginsWidth;
    const startX = (availableWidth - actualTotalWidth) / 2;

    const positioning = {
      screenWidth,
      availableWidth,
      boxWidth,
      boxHeight,
      boxMargin,
      totalBoxesWidth,
      totalMarginsWidth,
      totalWidthNeeded,
      adjustedBoxWidth,
      actualTotalWidth,
      startX
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