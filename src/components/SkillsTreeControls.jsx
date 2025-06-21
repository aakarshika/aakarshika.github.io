import React from 'react';

/**
 * Skills Tree Controls Component
 * 
 * Renders the header, data summary, and control buttons
 */
const SkillsTreeControls = ({ 
  highlightedNodes, 
  isProcessing, 
  totalTimelineEntries, 
  treeNodes, 
  skillToTimeline, 
  categoryToSkills,
  onHighlightNext, 
  onReset 
}) => {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold mb-2">Visual Tree Structure</h1>
      <p className="text-gray-400 text-sm mb-4">
        Click to highlight nodes level by level (deepest first)
      </p>
      
      {/* Data Summary */}
      <div className="bg-gray-800 rounded-lg p-3 mb-4 border border-gray-600">
        <div className="text-sm text-gray-300">
          <p><span className="font-semibold">Total Nodes:</span> {treeNodes.length}</p>
          <p><span className="font-semibold">Total Timeline Entries:</span> {totalTimelineEntries}</p>
          <p><span className="font-semibold">Skills with Data:</span> {Object.keys(skillToTimeline).length}</p>
          <p><span className="font-semibold">Categories Mapped:</span> {Object.keys(categoryToSkills).length}</p>
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex gap-4">
        <button 
          onClick={onHighlightNext}
          disabled={isProcessing}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Highlight Next ({highlightedNodes.size})
        </button>
        
        <button
          onClick={onReset}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default SkillsTreeControls; 