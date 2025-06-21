// Test file to validate the new positioning logic

// Mock tree nodes with timeline data
const mockTreeNodes = [
  {
    id: 'python',
    name: 'Python',
    children: [],
    timelineData: [
      { expertise: 'Beginner', startDate: '2015-01-01', endDate: '2016-01-01' },
      { expertise: 'Intermediate', startDate: '2016-01-01', endDate: '2017-01-01' },
      { expertise: 'Expert', startDate: '2017-01-01', endDate: '2018-01-01' }
    ]
  },
  {
    id: 'aws',
    name: 'AWS',
    children: ['python'],
    timelineData: [
      { expertise: 'Expert', startDate: '2017-01-01', endDate: '2018-01-01' }
    ]
  },
  {
    id: 'django',
    name: 'Django',
    children: [],
    timelineData: [
      { expertise: 'Beginner', startDate: '2015-01-01', endDate: '2016-01-01' }
    ]
  }
];

const highlightedNodes = new Set(['python']);

// Test the positioning calculation logic
function testPositioningLogic() {
  const screenWidth = 1200;
  const containerPadding = 40;
  const availableWidth = screenWidth - containerPadding;
  const boxMargin = 5;
  
  // Calculate box width for each visible node based on expertise and highlighted children
  const calculateNodeWidth = (node) => {
    // Base width based on highest expertise level in timeline data
    let baseWidth = 25; // Default for Beginner
    
    if (node.timelineData && node.timelineData.length > 0) {
      const expertiseLevels = node.timelineData.map(entry => entry.expertise);
      if (expertiseLevels.includes('Expert')) {
        baseWidth = 45;
      } else if (expertiseLevels.includes('Intermediate')) {
        baseWidth = 35;
      }
    }
    
    // Add width for each highlighted child
    const highlightedChildrenCount = node.children ? 
      node.children.filter(childId => {
        const childNode = mockTreeNodes.find(n => n.id === childId);
        return childNode && highlightedNodes.has(childNode.name);
      }).length : 0;
    
    const additionalWidth = highlightedChildrenCount * 10;
    
    return baseWidth + additionalWidth;
  };
  
  // Calculate individual box widths for each visible node
  const nodeWidths = mockTreeNodes.map(node => ({
    node,
    width: calculateNodeWidth(node)
  }));
  
  console.log('Node widths:', nodeWidths.map(nw => ({
    name: nw.node.name,
    width: nw.width,
    expertise: nw.node.timelineData.map(td => td.expertise)
  })));
  
  // Calculate total width needed
  const totalBoxesWidth = nodeWidths.reduce((sum, { width }) => sum + width, 0);
  const totalMarginsWidth = (mockTreeNodes.length - 1) * boxMargin;
  const totalWidthNeeded = totalBoxesWidth + totalMarginsWidth;
  
  console.log('Total calculations:', {
    totalBoxesWidth,
    totalMarginsWidth,
    totalWidthNeeded,
    availableWidth
  });
  
  // Calculate scaling factor to fit all boxes within available width
  const scaleFactor = totalWidthNeeded > availableWidth ? 
    (availableWidth - totalMarginsWidth) / totalBoxesWidth : 1;
  
  console.log('Scale factor:', scaleFactor);
  
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
  
  console.log('Final positions:', nodePositions.map(np => ({
    name: np.node.name,
    x: np.x,
    width: np.width,
    finalX: startX + np.x
  })));
  
  console.log('Layout summary:', {
    startX,
    actualTotalWidth,
    availableWidth
  });
}

// Run the test
testPositioningLogic(); 