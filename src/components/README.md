# Skills Tree Components

This directory contains the modular components for the Skills Tree visualization.

## Architecture Overview

The original monolithic `AnimatedSkillsChart.jsx` has been refactored into a modular architecture with clear separation of concerns:

### 📁 File Structure

```
src/
├── components/
│   ├── AnimatedSkillsChart.jsx      # Main component (orchestrator)
│   ├── SkillsTreeControls.jsx       # Header, controls, and data summary
│   ├── SkillsTreeVisualization.jsx  # SVG tree visualization
│   ├── TimelineInfoPanel.jsx        # Timeline details panel
│   └── README.md                    # This file
├── hooks/
│   ├── useSkillsTree.js             # Custom hook for tree state management
│   └── skillCategoryPaths.js        # Skill category paths data
├── utils/
│   ├── skillDataUtils.js            # Data manipulation utilities
│   └── constants.js                 # Shared constants and configuration
```

### 🔧 Components

#### `AnimatedSkillsChart.jsx`
- **Purpose**: Main orchestrator component
- **Responsibilities**: 
  - Uses the `useSkillsTree` hook for state management
  - Renders child components with appropriate props
  - Maintains clean separation between data and view

#### `SkillsTreeControls.jsx`
- **Purpose**: Header section with controls and data summary
- **Responsibilities**:
  - Displays title and description
  - Shows data statistics (total nodes, timeline entries, etc.)
  - Renders control buttons (Highlight Next, Reset)

#### `SkillsTreeVisualization.jsx`
- **Purpose**: SVG-based tree visualization
- **Responsibilities**:
  - Renders tree nodes and connections
  - Handles node highlighting and interactions
  - Manages SVG coordinate transformations
  - Uses constants for consistent styling

#### `TimelineInfoPanel.jsx`
- **Purpose**: Detailed timeline information display
- **Responsibilities**:
  - Shows timeline data for selected nodes
  - Displays period details (dates, duration, company, expertise)
  - Handles sorted timeline data presentation

### 🎣 Hooks

#### `useSkillsTree.js`
- **Purpose**: Custom hook for tree state management
- **Responsibilities**:
  - Manages highlighting state and logic
  - Handles tree data processing and D3 layout
  - Provides tree statistics and bounds calculations
  - Exposes actions for highlighting and resetting

### 🛠️ Utilities

#### `skillDataUtils.js`
- **Purpose**: Data manipulation and processing functions
- **Responsibilities**:
  - Building skill-to-timeline mappings
  - Creating category-to-skills mappings
  - Processing node timeline data
  - Calculating hierarchy and tree structures
  - Formatting and sorting timeline data

#### `constants.js`
- **Purpose**: Shared constants and configuration
- **Responsibilities**:
  - SVG margins and layout settings
  - Color schemes for different states
  - Special skill mappings
  - Timeline entry styling constants

## 🎯 Benefits of Modular Structure

### 1. **Separation of Concerns**
- Data manipulation is separated from UI components
- Each component has a single, clear responsibility
- State management is centralized in custom hooks

### 2. **Reusability**
- Components can be easily reused in other parts of the application
- Utilities can be imported and used independently
- Constants provide consistent configuration across components

### 3. **Maintainability**
- Smaller, focused files are easier to understand and modify
- Changes to data logic don't affect UI components
- Styling changes can be made in constants without touching components

### 4. **Testability**
- Each component can be tested in isolation
- Utilities can be unit tested independently
- Hooks can be tested with React Testing Library

### 5. **Performance**
- Components only re-render when their specific props change
- Data processing is memoized in the custom hook
- Tree layout calculations are optimized

## 🔄 Data Flow

```
skills_timeline.json → skillDataUtils.js → useSkillsTree.js → Components
     ↓
skillCategoryPaths.js → skillDataUtils.js → useSkillsTree.js → Components
     ↓
constants.js → All Components (styling and configuration)
```

## 🚀 Usage

The main component can be used exactly as before:

```jsx
import AnimatedSkillsChart from './components/AnimatedSkillsChart';

function App() {
  return <AnimatedSkillsChart />;
}
```

Individual components can also be used independently:

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