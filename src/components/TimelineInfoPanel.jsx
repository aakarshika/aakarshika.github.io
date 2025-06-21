import React from 'react';
import { getSortedTimelineData } from '../utils/skillDataUtils';
import { TIMELINE_COLORS } from '../utils/constants';

/**
 * Timeline Information Panel Component
 * 
 * Displays detailed timeline information for a selected node
 */
const TimelineInfoPanel = ({ hoveredNode }) => {
  if (!hoveredNode) return null;

  return (
    <div className="mt-4 bg-gray-800 rounded-lg p-4 border border-gray-600">
      <h3 className="text-lg font-semibold mb-2 text-blue-300">
        {hoveredNode.name} Timeline
      </h3>
      <div className="text-sm text-gray-300">
        <p className="mb-2">
          <span className="font-semibold">Total Periods:</span> {hoveredNode.timelineData.length}
        </p>
        {hoveredNode.timelineData.length > 0 && (
          <div className="mt-3">
            <p className="font-semibold mb-2 text-yellow-300">All Periods (sorted by start date):</p>
            <div className="max-h-60 overflow-y-auto">
              {getSortedTimelineData(hoveredNode.timelineData).map((entry, index) => {
                const startDate = new Date(entry.startDate);
                const endDate = new Date(entry.endDate);
                const daysWorked = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
                
                return (
                  <div key={index} className="mb-2 p-2 bg-gray-700 rounded border-l-4 border-blue-400">
                    <p className="text-xs font-semibold text-white">
                      Period {index + 1}: {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                    </p>
                    <p className={`text-xs ${TIMELINE_COLORS.duration}`}>Duration: {daysWorked} days</p>
                    <p className={`text-xs ${TIMELINE_COLORS.company}`}>Company: {entry.company}</p>
                    <p className={`text-xs ${TIMELINE_COLORS.level}`}>Level: {entry.expertise}</p>
                    <p className={`text-xs ${TIMELINE_COLORS.description} mt-1`}>{entry.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {hoveredNode.children && hoveredNode.children.length > 0 && (
          <div className="mt-3">
            <p className="font-semibold mb-2 text-yellow-300">Child Nodes:</p>
            <p className="text-xs text-gray-400">
              This node aggregates timeline data from {hoveredNode.children.length} child nodes
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimelineInfoPanel; 