import React from 'react';
import { TOGGLE_STATES } from '../utils/constants';

/**
 * Skills Tree Controls Component
 * 
 * Renders the header, data summary, and control buttons
 */
const SkillsTreeControls = ({ 
  isProcessing, 
  totalTimelineEntries, 
  treeNodes, 
  skillToTimeline, 
  categoryToSkills,
  showOnlyWithData,
  scaleUpLeafNodes,
  onHighlightNext, 
  onUnhighlightLast,
  onReset,
  onToggleShowOnlyWithData,
  onToggleScaleUpLeafNodes
}) => {
  const toggleStyle = showOnlyWithData ? TOGGLE_STATES.active : TOGGLE_STATES.inactive;
  const scaleUpToggleStyle = scaleUpLeafNodes ? TOGGLE_STATES.scaleUp.active : TOGGLE_STATES.scaleUp.inactive;

  // Find the next node to be highlighted
  const nextNode = treeNodes.find(node => node.isPreview);
  
  // Derive highlighted nodes count from treeNodes
  const highlightedNodesCount = treeNodes.filter(node => node.isHighlighted).length;

  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold mb-2">Visual Tree Structure</h1>
      <p className="text-gray-400 text-sm mb-4">
        Click to highlight nodes level by level (deepest first)
      </p>
      
      {/* Toggle Buttons */}
      <div className="mb-4 flex gap-4">
        <div>
          <button
            onClick={onToggleShowOnlyWithData}
            className={`px-4 py-2 rounded font-medium transition-colors ${toggleStyle.background} ${toggleStyle.hover} ${toggleStyle.text}`}
          >
            🌳 View My Tree
          </button>
          <span className="ml-3 text-sm text-gray-400">
            {showOnlyWithData 
              ? 'Showing only skills with timeline data' 
              : 'Showing all skills (including those without timeline data)'
            }
          </span>
        </div>
        
        <div>
          <button
            onClick={onToggleScaleUpLeafNodes}
            className={`px-4 py-2 rounded font-medium transition-colors ${scaleUpToggleStyle.background} ${scaleUpToggleStyle.hover} ${scaleUpToggleStyle.text}`}
          >
            🔍 View leaves
          </button>
          <span className="ml-3 text-sm text-gray-400">
            {scaleUpLeafNodes 
              ? 'Leaf nodes and nodes with all children highlighted are larger' 
              : 'All nodes have the same size'
            }
          </span>
        </div>
      </div>
      
      {/* Data Summary */}
      <div className="bg-gray-800 rounded-lg p-3 mb-4 border border-gray-600">
        <div className="text-sm text-gray-300">
          <p><span className="font-semibold">Total Nodes:</span> {treeNodes.length}</p>
          <p><span className="font-semibold">Total Timeline Entries:</span> {totalTimelineEntries}</p>
          <p><span className="font-semibold">Skills with Data:</span> {Object.keys(skillToTimeline).length}</p>
          <p><span className="font-semibold">Categories Mapped:</span> {Object.keys(categoryToSkills).length}</p>
          {showOnlyWithData && (
            <p className="text-green-400 mt-2">
              <span className="font-semibold">Filtered View:</span> Only showing nodes with timeline data
            </p>
          )}
          {scaleUpLeafNodes && (
            <p className="text-purple-400 mt-2">
              <span className="font-semibold">Scaled View:</span> Leaf nodes and completed branches are larger
            </p>
          )}
          {nextNode && (
            <p className="text-yellow-400 mt-2">
              <span className="font-semibold">Next Node:</span> "{nextNode.name}" (preview active)
            </p>
          )}
        </div>
      </div>
      
      {/* Controls */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={onHighlightNext}
              disabled={isProcessing}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Highlight Next ({highlightedNodesCount})
            </button>
            
            <button
              onClick={onUnhighlightLast}
              disabled={isProcessing || highlightedNodesCount === 0}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Unhighlight Last ({highlightedNodesCount > 0 ? highlightedNodesCount - 1 : 0})
            </button>
            
            <button
              onClick={onReset}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Reset
            </button>
          </div>
          
          {/* Toggle Buttons */}
          <div className="flex gap-2">
            <button
              onClick={onToggleShowOnlyWithData}
              className={`px-4 py-2 rounded-lg transition-colors ${toggleStyle}`}
            >
              {showOnlyWithData ? 'Show All' : 'Show With Data Only'}
            </button>
            
            <button
              onClick={onToggleScaleUpLeafNodes}
              className={`px-4 py-2 rounded-lg transition-colors ${scaleUpToggleStyle}`}
            >
              {scaleUpLeafNodes ? 'Normal Size' : 'Scale Leaf Nodes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillsTreeControls; 