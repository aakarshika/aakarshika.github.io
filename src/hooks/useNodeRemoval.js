import { useState } from 'react';

/**
 * Hook for managing node removal with priority system
 * Level-based: Deeper nodes (skills) are removed before parent nodes (categories)
 * Order-based: Within each level, nodes are removed in the order they appear
 * Completion: All nodes at deeper levels must be removed before moving to shallower levels
 */
export const useNodeRemoval = ({ flatNodes }) => {
  const [removedNodeIds, setRemovedNodeIds] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Pick the next node to be removed based on priority system
   * @returns {string|null} ID of the next node to remove
   */
  const pickNextNodeToRemove = () => {
    if (!flatNodes || flatNodes.length === 0) return null;

    // Group nodes by level (deepest level first)
    const nodesByLevel = {};
    
    flatNodes.forEach(node => {
      const level = node.level;
      if (!nodesByLevel[level]) {
        nodesByLevel[level] = [];
      }
      nodesByLevel[level].push(node);
    });

    // Process levels from deepest to shallowest
    const levels = Object.keys(nodesByLevel).map(Number).sort((a, b) => b - a);
    
    for (const level of levels) {
      const levelNodes = nodesByLevel[level];
      const nextNode = levelNodes.find(node => !removedNodeIds.includes(node.id));
      
      if (nextNode) {
        return nextNode.id;
      }
    }
    
    return null;
  };

  /**
   * Remove the next node based on priority system
   */
  const removeNext = () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      const nextNodeId = pickNextNodeToRemove();
      if (nextNodeId) {
        setRemovedNodeIds(prev => [...prev, nextNodeId]);
      }
    } catch (error) {
      console.error('Error removing node:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Unremove the last removed node
   */
  const unremovePrevious = () => {
    if (isProcessing || removedNodeIds.length === 0) return;
    
    setIsProcessing(true);
    
    try {
      setRemovedNodeIds(prev => prev.slice(0, -1));
    } catch (error) {
      console.error('Error unremoving node:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Get the next node that will be removed (for purple highlighting)
   * @returns {string|null} ID of the next node to remove
   */
  const getNextNodeToRemove = () => {
    return pickNextNodeToRemove();
  };

  /**
   * Check if all nodes have been removed
   * @returns {boolean} True if all nodes are removed
   */
  const isAllRemoved = () => {
    return removedNodeIds.length === flatNodes.length;
  };

  /**
   * Check if no nodes have been removed
   * @returns {boolean} True if no nodes are removed
   */
  const isNoneRemoved = () => {
    return removedNodeIds.length === 0;
  };

  return {
    removedNodeIds,
    isProcessing,
    removeNext,
    unremovePrevious,
    getNextNodeToRemove,
    isAllRemoved,
    isNoneRemoved
  };
}; 