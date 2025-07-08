import { useMemo } from 'react';
import { isLeafNode } from '../../utils/skillDataUtils';
import { calculateInitialNodePositions } from '../../utils/treeUtils';

/**
 * Custom hook for SkillsList data processing
 * Handles node filtering, state calculation, and positioning logic
 */
export function useSkillsListData({ treeNodes }) {
  return useMemo(() => {
    // Derive highlighted nodes from treeNodes.isHighlighted
    const highlightedNodes = new Set(
      treeNodes.filter(node => node.isHighlighted).map(node => node.name)
    );

    // Get current unhighlighted leaf nodes
    const currentUnhighlightedLeafNodes = treeNodes.filter(node => {
      const isLeaf = isLeafNode(node, treeNodes);
      return isLeaf && !node.isHighlighted;
    });

    // Calculate what the list will look like after the next highlight
    const nextHighlightedNodes = new Set([...highlightedNodes]);
    const nextNode = treeNodes.find(node => node.isPreview);
    if (nextNode) {
      nextHighlightedNodes.add(nextNode.name);
    }

    const nextUnhighlightedLeafNodes = treeNodes.filter(node => {
      const isLeaf = isLeafNode(node, treeNodes);
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
      // if(node.name === 'django_rest_framework') {
        // // console.log(node.name, node.isHighlighted);
      // }
      // if (isCurrentlyVisible && nextUnhighlightedLeafNodes.length === 1 && nextUnhighlightedLeafNodes[0].name === node.name) {
      //   return 'removing';
      // }
      
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

    // Calculate positioning using shared utility
    // Use a reasonable default width that accounts for typical padding
    const estimatedContainerWidth = window.innerWidth - 200; // Account for typical padding
    const positioning = calculateInitialNodePositions(visibleNodes, treeNodes, {
      screenWidth: estimatedContainerWidth,
      containerPadding: 10,
      boxMargin: 10
    });

    // Add boxHeight to positioning object for backward compatibility
    positioning.boxHeight = 80;

    return {
      visibleNodes,
      removingNodes,
      parentNodes,
      nextNode,
      positioning,
      getNodeState,
      findParentNode
    };
  }, [treeNodes]);
} 