# some instructions for ai .
Do not run testing and npm run commands after doing changes. if needed, i will do them otherwise my server will automatically refresh. only when npm install is needed, let me know.
NEVER run npm run build.
i will run npm run dev myself. just let me know.

# Skills Tree Components

This directory contains the modular components for the Skills Tree visualization.

## 📁 File Structure

```
src/
├── components/
│   ├── AnimatedSkillsChart.jsx      # Main orchestrator component
│   ├── SkillsTreeControls.jsx       # Header, controls, and data summary
│   ├── SkillsTreeVisualization.jsx  # SVG tree visualization
│   ├── TimelineInfoPanel.jsx        # Timeline details panel
│   └── README.md                    # This file
├── hooks/
│   ├── useSkillsTree.js             # Tree state management
│   └── skillCategoryPaths.js        # Skill category paths data
├── utils/
│   ├── skillDataUtils.js            # Data manipulation utilities
│   └── constants.js                 # Shared constants and configuration
```

## 🔧 Components

### `AnimatedSkillsChart.jsx`
- **Purpose**: Main orchestrator component
- **Responsibilities**: 
  - Uses `useSkillsTree` hook for state management
  - Renders child components with appropriate props
  - Maintains clean separation between data and view

### `SkillsTreeControls.jsx`
- **Purpose**: Header section with controls and data summary
- **Responsibilities**:
  - Displays title and description
  - Shows data statistics (total nodes, timeline entries)
  - Renders control buttons (Highlight Next, Reset)

### `SkillsTreeVisualization.jsx`
- **Purpose**: SVG-based tree visualization
- **Responsibilities**:
  - Renders tree nodes and connections
  - Handles node highlighting and interactions
  - Manages SVG coordinate transformations
  - Uses constants for consistent styling

### `TimelineInfoPanel.jsx`
- **Purpose**: Detailed timeline information display
- **Responsibilities**:
  - Shows timeline data for selected nodes
  - Displays period details (dates, duration, company, expertise)
  - Handles sorted timeline data presentation

## 🎣 Hooks

### `useSkillsTree.js`
- **Purpose**: Custom hook for tree state management
- **Responsibilities**:
  - Manages highlighting state and logic
  - Handles tree data processing and D3 layout
  - Provides tree statistics and bounds calculations
  - Exposes actions for highlighting and resetting

## 🛠️ Utilities

### `skillDataUtils.js`
- **Purpose**: Data manipulation and processing functions
- **Responsibilities**:
  - Building skill-to-timeline mappings
  - Creating category-to-skills mappings
  - Processing node timeline data
  - Calculating hierarchy and tree structures
  - Formatting and sorting timeline data

### `constants.js`
- **Purpose**: Shared constants and configuration
- **Responsibilities**:
  - SVG margins and layout settings
  - Color schemes for different states
  - Special skill mappings
  - Timeline entry styling constants

## 🔄 Data Flow

```
skills_timeline.json → skillDataUtils.js → useSkillsTree.js → Components
     ↓
skillCategoryPaths.js → skillDataUtils.js → useSkillsTree.js → Components
     ↓
constants.js → All Components (styling and configuration)
```

## 🎯 Benefits

- **Separation of Concerns**: Data manipulation separated from UI components
- **Reusability**: Components can be easily reused in other parts of the application
- **Maintainability**: Smaller, focused files are easier to understand and modify
- **Testability**: Each component can be tested in isolation
- **Performance**: Components only re-render when their specific props change

## 🚀 Usage

### Main Component
```jsx
import AnimatedSkillsChart from './components/AnimatedSkillsChart';

function App() {
  return <AnimatedSkillsChart />;
}
```

### Individual Components
```jsx
import { useSkillsTree } from './hooks/useSkillsTree';
import SkillsTreeVisualization from './components/SkillsTreeVisualization';

function CustomTreeView() {
  const { treeNodes, treeBounds, treeWidth, treeHeight } = useSkillsTree();
  
  return (
    <SkillsTreeVisualization
      treeNodes={treeNodes}
      treeBounds={treeBounds}
      treeWidth={treeWidth}
      treeHeight={treeHeight}
    />
  );
}
``` 