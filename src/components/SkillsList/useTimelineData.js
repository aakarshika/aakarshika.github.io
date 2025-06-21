import { useMemo } from 'react';
import skillsData from '../../../skills_timeline.json';

// Parse date string to timestamp
const parseDate = (dateStr) => new Date(dateStr).getTime();

// Convert timestamp to y-coordinate
const timestampToY = (timestamp, startTime, timeRange, yZoom) => {
  return ((timestamp - startTime) / timeRange) * (yZoom - 40) + 20;
};

/**
 * Custom hook for processing timeline data for SkillsList
 * Converts timeline periods into y-coordinates and heights for vertical boxes
 */
export function useTimelineData({ treeNodes, yZoom = 600 }) {
  return useMemo(() => {
    // Calculate time range from all skills data
    const allDates = skillsData.flatMap(item => [
      parseDate(item['Start Date']), 
      parseDate(item['End Date'])
    ]);
    const startTime = Math.min(...allDates);
    const endTime = Math.max(...allDates);
    const timeRange = endTime - startTime;

    // Process timeline data for each node
    const nodeTimelineBoxes = treeNodes.map(node => {
      if (!node.timelineData || node.timelineData.length === 0) {
        return {
          nodeId: node.id,
          nodeName: node.name,
          timelineBoxes: []
        };
      }

      // Sort timeline data by start date
      const sortedTimelineData = [...node.timelineData].sort(
        (a, b) => parseDate(a.startDate) - parseDate(b.startDate)
      );

      // Create timeline boxes for each period
      const timelineBoxes = sortedTimelineData.map((period, index) => {
        const y1 = timestampToY(parseDate(period.startDate), startTime, timeRange, yZoom);
        const y2 = timestampToY(parseDate(period.endDate), startTime, timeRange, yZoom);
        const height = y2 - y1;

        return {
          id: `${node.id}-period-${index}`,
          y: y1,
          height: Math.max(height, 10), // Minimum height of 10px
          startDate: period.startDate,
          endDate: period.endDate,
          expertise: period.expertise,
          company: period.company,
          description: period.description,
          periodIndex: index
        };
      });

      return {
        nodeId: node.id,
        nodeName: node.name,
        timelineBoxes
      };
    });

    return {
      startTime,
      endTime,
      timeRange,
      yZoom,
      nodeTimelineBoxes,
      parseDate,
      timestampToY
    };
  }, [treeNodes, yZoom]);
} 