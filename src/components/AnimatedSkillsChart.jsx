import React, { useState, useMemo } from 'react';
import { hierarchy, tree } from 'd3-hierarchy';
import { skillCategoryPaths } from '../hooks/skillCategoryPaths';
import skillsData from '../../skills_timeline.json';

/**
 * Visual Tree Component
 * 
 * Displays a hierarchical tree structure of skills with level-by-level highlighting.
 * Users can click a button to highlight nodes one by one, starting from the deepest level.
 * Each node shows accumulated start and end dates from all its children.
 */
const AnimatedSkillsChart = () => {
  const [highlightedNodes, setHighlightedNodes] = useState(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [hoveredNode, setHoveredNode] = useState(null);

  // Helper to normalize names for matching
  function normalizeName(name) {
    return name.toLowerCase().replace(/[_\s]+/g, '');
  }

  /**
   * Maps skill names to their timeline data
   * @returns {Object} Mapping of skill names to their timeline entries
   */
  const buildSkillToTimelineMapping = () => {
    const mapping = {};
    
    skillsData.forEach(entry => {
      const skillName = entry.Skill;
      const normalized = normalizeName(skillName);
      if (!mapping[normalized]) {
        mapping[normalized] = [];
      }
      mapping[normalized].push({
        startDate: entry['Start Date'],
        endDate: entry['End Date'],
        expertise: entry['Expertise Level Achieved'],
        company: entry['Where Tag'],
        description: entry['1 line Description on how I used it']
      });
    });
    
    return mapping;
  };

  /**
   * Maps category paths to their corresponding skills
   * @returns {Object} Mapping of category paths to skill arrays
   */
  const buildCategoryToSkillsMapping = () => {
    const mapping = {};
    
    // Create a mapping of normalized skill names to original skill names
    const normalizedSkillMap = {};
    skillsData.forEach(entry => {
      const normalizedName = normalizeName(entry.Skill);
      if (!normalizedSkillMap[normalizedName]) {
        normalizedSkillMap[normalizedName] = [];
      }
      normalizedSkillMap[normalizedName].push(entry.Skill);
    });
    
    skillCategoryPaths.forEach(path => {
      const parts = path.split('.');
      const lastPart = parts[parts.length - 1];
      const normalizedLastPart = normalizeName(lastPart);
      
      // Try to find matching skills
      const matchingSkills = [];
      
      // Direct match
      if (normalizedSkillMap[normalizedLastPart]) {
        matchingSkills.push(...normalizedSkillMap[normalizedLastPart]);
      }
      
      // Partial matches
      Object.keys(normalizedSkillMap).forEach(normalizedName => {
        if (normalizedName.includes(normalizedLastPart) || normalizedLastPart.includes(normalizedName)) {
          matchingSkills.push(...normalizedSkillMap[normalizedName]);
        }
      });
      
      // Special cases for common mappings
      const specialMappings = {
        'python': ['Python'],
        'django': ['Django'],
        'django_rest_framework': ['Django REST Framework'],
        'reactjs': ['ReactJS'],
        'angularjs': ['AngularJS'],
        'mysql': ['MySQL'],
        'mongodb': ['MongoDB'],
        'redshift': ['Redshift'],
        'aws': ['AWS'],
        'jenkins': ['Jenkins'],
        'airflow': ['Airflow'],
        'apache_kafka': ['Apache Kafka'],
        'apache_spark': ['Apache Spark'],
        'pytest': ['Pytest'],
        'localstack': ['Localstack'],
        'machine_learning': ['Machine Learning'],
        'computer_vision': ['Computer Vision'],
        'nlp': ['NLP'],
        'api': ['API'],
        'teaching': ['Teaching']
      };
      if (specialMappings[lastPart]) {
        matchingSkills.push(...specialMappings[lastPart]);
      }
      
      // Remove duplicates
      const uniqueSkills = [...new Set(matchingSkills)];
      
      if (uniqueSkills.length > 0) {
        mapping[path] = uniqueSkills;
      }
    });
    
    return mapping;
  };

  /**
   * Gets all timeline data for a given node (skill or category)
   * @param {string} nodeName - Name of the node
   * @param {Object} node - Node object with children
   * @param {Object} skillToTimeline - Mapping of skills to timeline data
   * @param {Object} categoryToSkills - Mapping of categories to skills
   * @returns {Array} Array of timeline entries for the node
   */
  const getNodeTimelineData = (nodeName, node, skillToTimeline, categoryToSkills) => {
    const timelineData = [];
    const normalizedNodeName = normalizeName(nodeName);
    
    // If this is a leaf node (has no children), get direct skill data
    if (!node.children || Object.keys(node.children).length === 0) {
      // Direct normalized match
      if (skillToTimeline[normalizedNodeName]) {
        timelineData.push(...skillToTimeline[normalizedNodeName]);
      }
      
      // Also check if this node name matches any category path
      const categoryPath = Object.keys(categoryToSkills).find(path => {
        const lastPart = path.split('.').pop();
        return normalizeName(lastPart) === normalizedNodeName;
      });
      
      if (categoryPath && categoryToSkills[categoryPath]) {
        categoryToSkills[categoryPath].forEach(skill => {
          const normalizedSkill = normalizeName(skill);
          if (skillToTimeline[normalizedSkill]) {
            timelineData.push(...skillToTimeline[normalizedSkill]);
          }
        });
      }
      
      // Try case-insensitive/partial matching
      Object.keys(skillToTimeline).forEach(skillNorm => {
        if (
          skillNorm === normalizedNodeName ||
          skillNorm.includes(normalizedNodeName) ||
          normalizedNodeName.includes(skillNorm)
        ) {
          timelineData.push(...skillToTimeline[skillNorm]);
        }
      });
    } else {
      // This is a parent node, collect data from all children
      Object.values(node.children).forEach(child => {
        const childData = getNodeTimelineData(child.name, child, skillToTimeline, categoryToSkills);
        timelineData.push(...childData);
      });
    }
    
    // Remove duplicates based on start date, end date, and company
    const uniqueData = [];
    const seen = new Set();
    
    timelineData.forEach(entry => {
      const key = `${entry.startDate}-${entry.endDate}-${entry.company}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueData.push(entry);
      }
    });
    
    return uniqueData;
  };

  /**
   * Builds the hierarchical tree structure from skillCategoryPaths
   * @returns {Object} Tree structure with parent-child relationships and timeline data
   */
  const buildHierarchy = () => {
    const tree = {};
    const skillToTimeline = buildSkillToTimelineMapping();
    const categoryToSkills = buildCategoryToSkillsMapping();
    
    // Build the complete tree from skillCategoryPaths
    skillCategoryPaths.forEach(path => {
      const parts = path.split('.');
      let current = tree;
      
      parts.forEach(part => {
        if (!current[part]) {
          current[part] = { name: part, children: {} };
        }
        current = current[part].children;
      });
    });
    
    // Add timeline data to each node
    const addTimelineDataToNode = (node, nodeName) => {
      const timelineData = getNodeTimelineData(nodeName, node, skillToTimeline, categoryToSkills);
      node.timelineData = timelineData;
      
      // Add timeline data to children
      if (node.children) {
        Object.entries(node.children).forEach(([childName, childNode]) => {
          addTimelineDataToNode(childNode, childName);
        });
      }
    };
    
    Object.entries(tree).forEach(([rootName, rootNode]) => {
      addTimelineDataToNode(rootNode, rootName);
    });
    
    return { tree };
  };

  const { tree: hierarchyTree } = buildHierarchy();

  /**
   * Builds tree data for D3 visualization
   * @returns {Array} Array of tree nodes with positioning data
   */
  const buildTreeData = () => {
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
    
    const root = hierarchy(convertToD3Format(hierarchyTree));
    
    // Use more compact layout settings
    const treeLayout = tree()
      .nodeSize([67, 120]) // Reduced spacing: [height, width]
      .separation((a, b) => (a.parent === b.parent ? 1 : 1.1)); // Reduced separation
    
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

  const treeNodes = buildTreeData();

  // Calculate SVG dimensions
  const margin = { top: 50, right: 50, bottom: 50, left: 50 };
  const safeTreeNodes = treeNodes || [];
  // Debug: Log the mapping information
  const skillToTimeline = buildSkillToTimelineMapping();
  const categoryToSkills = buildCategoryToSkillsMapping();
  
  console.log('Skill to Timeline Mapping:', Object.keys(skillToTimeline));
  console.log('Category to Skills Mapping:', categoryToSkills);
  
  // Calculate total timeline entries across all nodes
  const totalTimelineEntries = safeTreeNodes.reduce((total, node) => {
    return total + (node.timelineData ? node.timelineData.length : 0);
  }, 0);

  // Debug: Show nodes with timeline data
  const nodesWithData = safeTreeNodes.filter(node => node.timelineData && node.timelineData.length > 0);
  console.log('Nodes with timeline data:', nodesWithData.map(node => ({
    name: node.name,
    entries: node.timelineData.length,
    sampleData: node.timelineData.slice(0, 2)
  })));

  // Debug: Show all node names
  console.log('All node names:', safeTreeNodes.map(node => node.name));
  console.log('Available normalized skill names:', Object.keys(skillToTimeline));

  /**
   * Picks the next node to highlight in level-by-level order
   * @returns {string|null} Next node name to highlight, or null if all done
   */
  const pickNextNode = () => {
    // Group nodes by level (deepest level first)
    const nodesByLevel = {};
    
    const findNodesByLevel = (node, level = 1) => {
      if (!nodesByLevel[level]) {
        nodesByLevel[level] = [];
      }
      
      nodesByLevel[level].push(node.name);
      
      if (node.children) {
        Object.values(node.children).forEach(child => {
          findNodesByLevel(child, level + 1);
        });
      }
    };
    
    // Build level groups
    Object.values(hierarchyTree).forEach(rootNode => {
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

  // Calculate tree bounds
  const treeBounds = safeTreeNodes.length > 0 ? {
    minX: Math.min(...safeTreeNodes.map(n => n.x)),
    maxX: Math.max(...safeTreeNodes.map(n => n.x)),
    minY: Math.min(...safeTreeNodes.map(n => n.y)),
    maxY: Math.max(...safeTreeNodes.map(n => n.y))
  } : { minX: 0, maxX: 400, minY: 0, maxY: 300 };
  
  const treeWidth = treeBounds.maxX - treeBounds.minX + 200;
  const treeHeight = treeBounds.maxY - treeBounds.minY + 200;

  const transformX = (x) => {
    if (safeTreeNodes.length === 0) return margin.left;
    return x - treeBounds.minX + margin.left + 100; // Add extra padding
  };
  
  const transformY = (y) => {
    if (safeTreeNodes.length === 0) return margin.top;
    return y - treeBounds.minY + margin.top + 50; // Add extra padding
  };

  /**
   * Calculates total days worked from timeline data
   * @param {Array} timelineData - Array of timeline entries
   * @returns {number} Total days worked
   */
  const calculateTotalDays = (timelineData) => {
    if (!timelineData || timelineData.length === 0) return 0;
    
    let totalDays = 0;
    timelineData.forEach(entry => {
      const startDate = new Date(entry.startDate);
      const endDate = new Date(entry.endDate);
      const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      totalDays += Math.max(0, daysDiff); // Ensure non-negative
    });
    
    return totalDays;
  };

  /**
   * Gets sorted timeline data by start date
   * @param {Array} timelineData - Array of timeline entries
   * @returns {Array} Sorted timeline entries
   */
  const getSortedTimelineData = (timelineData) => {
    if (!timelineData || timelineData.length === 0) return [];
    
    return [...timelineData].sort((a, b) => {
      return new Date(a.startDate) - new Date(b.startDate);
    });
  };

  /**
   * Formats timeline data for display
   * @param {Array} timelineData - Array of timeline entries
   * @returns {string} Formatted timeline string
   */
  const formatTimelineData = (timelineData) => {
    if (!timelineData || timelineData.length === 0) {
      return 'No timeline data';
    }
    
    // Get unique date ranges
    const dateRanges = timelineData.map(entry => ({
      start: new Date(entry.startDate).getFullYear(),
      end: new Date(entry.endDate).getFullYear(),
      company: entry.company
    }));
    
    // Group by date ranges
    const groupedRanges = {};
    dateRanges.forEach(range => {
      const key = `${range.start}-${range.end}`;
      if (!groupedRanges[key]) {
        groupedRanges[key] = [];
      }
      if (!groupedRanges[key].includes(range.company)) {
        groupedRanges[key].push(range.company);
      }
    });
    
    // Format the ranges
    const formattedRanges = Object.entries(groupedRanges).map(([range, companies]) => {
      const [start, end] = range.split('-');
      return `${start}-${end} (${companies.join(', ')})`;
    });
    
    return formattedRanges.join(' | ');
  };

  return (
    <div className="w-auto h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Visual Tree Structure</h1>
        <p className="text-gray-400 text-sm mb-4">
          Click to highlight nodes level by level (deepest first)
        </p>
        
        {/* Data Summary */}
        <div className="bg-gray-800 rounded-lg p-3 mb-4 border border-gray-600">
          <div className="text-sm text-gray-300">
            <p><span className="font-semibold">Total Nodes:</span> {safeTreeNodes.length}</p>
            <p><span className="font-semibold">Total Timeline Entries:</span> {totalTimelineEntries}</p>
            <p><span className="font-semibold">Skills with Data:</span> {Object.keys(skillToTimeline).length}</p>
            <p><span className="font-semibold">Categories Mapped:</span> {Object.keys(categoryToSkills).length}</p>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex gap-4">
          <button 
            onClick={handleHighlightNext}
            disabled={isProcessing}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Highlight Next ({highlightedNodes.size})
          </button>
          
          <button
            onClick={() => setHighlightedNodes(new Set())}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reset
          </button>
        </div>
      </div>
      
      {/* Tree Visualization */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
        <div className="text-sm text-gray-400 mb-4">
          Tree: {safeTreeNodes.length} nodes
        </div>
        
        <svg 
          width={treeWidth + margin.left + margin.right} 
          height={treeHeight + margin.top + margin.bottom}
          className="w-full"
        >
          {/* Connections */}
          {safeTreeNodes.map(node => (
            node.children.length > 0 && node.children.map(childId => {
              const child = safeTreeNodes.find(n => n.id === childId);
              if (!child) return null;
              
              return (
                <line
                  key={`${node.id}-${childId}`}
                  x1={transformX(node.x)}
                  y1={transformY(node.y)}
                  x2={transformX(child.x)}
                  y2={transformY(child.y)}
                  stroke={node.isHighlighted && child.isHighlighted ? "#3b82f6" : "#4b5563"}
                  strokeWidth={node.isHighlighted && child.isHighlighted ? 2 : 1}
                  className="transition-all duration-300"
                />
              );
            })
          ))}
          
          {/* Nodes */}
          {safeTreeNodes.map(node => (
            <g key={node.id}>
              {/* Background circle for nodes with timeline data */}
              {node.timelineData && node.timelineData.length > 0 && (
                <circle
                  cx={transformX(node.x)}
                  cy={transformY(node.y)}
                  r={node.isHighlighted ? 12 : 10}
                  fill="rgba(255, 255, 0, 0.2)"
                  stroke="yellow"
                  strokeWidth={1}
                  className="transition-all duration-300"
                />
              )}
              
              <circle
                cx={transformX(node.x)}
                cy={transformY(node.y)}
                r={node.isHighlighted ? 8 : 6}
                fill={node.isHighlighted ? "#3b82f6" : "#6b7280"}
                stroke={node.isHighlighted ? "#60a5fa" : "#9ca3af"}
                strokeWidth={node.isHighlighted ? 2 : 1}
                className="transition-all duration-300 cursor-pointer"
                onClick={() => setHoveredNode(node)}
              />
              
              <text
                x={transformX(node.x)}
                y={transformY(node.y) + 20}
                textAnchor="middle"
                fill={`${node.isHighlighted ? 'cornflowerblue' : 'white'}`}
                fontSize="12px"
                transform={`rotate(-45 ${transformX(node.x)} ${transformY(node.y) + 20})`}
              >
                {node.name}
              </text>
              
              {/* Timeline data count display */}
              {node.timelineData && node.timelineData.length > 0 && (
                <text
                  x={transformX(node.x)}
                  y={transformY(node.y) + 35}
                  textAnchor="middle"
                  fill="yellow"
                  fontSize="10px"
                  fontWeight="bold"
                  transform={`rotate(-45 ${transformX(node.x)} ${transformY(node.y) + 35})`}
                >
                  {node.timelineData.length} periods
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
      
      {/* Timeline Information Panel */}
      {hoveredNode && (
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
                        <p className="text-xs text-yellow-300">Duration: {daysWorked} days</p>
                        <p className="text-xs text-blue-300">Company: {entry.company}</p>
                        <p className="text-xs text-green-300">Level: {entry.expertise}</p>
                        <p className="text-xs text-gray-400 mt-1">{entry.description}</p>
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
      )}
    </div>
  );
};

export default AnimatedSkillsChart; 