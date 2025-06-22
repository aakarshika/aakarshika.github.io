# SkillsList Component Architecture

The `SkillsList` component has been refactored from a monolithic 368-line file into a modular architecture with clear separation of concerns.

## 📁 File Structure

```
src/components/SkillsList/
├── index.js                    # Main export file
├── SkillsList.jsx             # Main orchestrator component
├── SkillsListNode.jsx         # Individual node rendering
├── SkillsListHeader.jsx       # Header with title and status
├── SkillsListDebug.jsx        # Debug information panel
├── useSkillsListData.js       # Data processing hook
├── useScrollAnimation.js      # Scroll animation hook
└── README.md                  # This file
```

## 🔧 Components

### `SkillsList.jsx` (Main Component)
- **Purpose**: Main orchestrator component
- **Responsibilities**: 
  - Coordinates all sub-components
  - Manages container and layout
  - Handles wheel events
  - Renders the complete UI

### `SkillsListNode.jsx`
- **Purpose**: Individual node box component
- **Responsibilities**:
  - Renders a single skill node box
  - Handles node-specific styling based on state
  - Manages node content and labels
  - Applies animations and transitions

### `SkillsListHeader.jsx`
- **Purpose**: Header section component
- **Responsibilities**:
  - Displays title and node count
  - Shows next node preview
  - Displays animation progress
  - Provides status information

### `SkillsListDebug.jsx`
- **Purpose**: Debug information panel
- **Responsibilities**:
  - Shows technical details and measurements
  - Displays node states and counts
  - Provides animation progress and speed
  - Lists removing and parent nodes

## 🎣 Custom Hooks

### `useSkillsListData.js`
- **Purpose**: Data processing and state management
- **Responsibilities**:
  - Filters visible nodes based on highlighting state
  - Calculates node states (adding, removing, staying, hidden)
  - Finds parent-child relationships
  - Computes positioning and layout calculations
  - Memoizes expensive calculations

### `useScrollAnimation.js`
- **Purpose**: Scroll animation logic
- **Responsibilities**:
  - Handles mouse wheel events
  - Manages animation progress state
  - Calculates animated positions for removing nodes
  - Controls opacity transitions
  - Triggers completion callbacks

## 🚀 Benefits of Refactoring

### **Maintainability**
- Each component has a single responsibility
- Easier to understand and modify individual pieces
- Clear separation between data logic and UI rendering

### **Reusability**
- Individual components can be reused in other contexts
- Custom hooks can be shared across different components
- Modular structure allows for easy testing

### **Performance**
- Data processing is memoized in custom hooks
- Components only re-render when their specific props change
- Better code splitting and lazy loading potential

### **Developer Experience**
- Smaller, focused files are easier to navigate
- Clear component boundaries make debugging simpler
- Better TypeScript support with focused interfaces

## 📊 Component Sizes

| File | Lines | Responsibility |
|------|-------|----------------|
| Original SkillsList.jsx | 368 | Everything |
| SkillsList.jsx | 95 | Main orchestration |
| SkillsListNode.jsx | 85 | Node rendering |
| useSkillsListData.js | 95 | Data processing |
| useScrollAnimation.js | 85 | Animation logic |
| SkillsListHeader.jsx | 20 | Header display |
| SkillsListDebug.jsx | 45 | Debug information |

## 🔄 Usage

The refactored component maintains the same API as the original:

```jsx
import SkillsList from './components/SkillsList';

<SkillsList
  treeNodes={treeNodes}
  scaleUpLeafNodes={scaleUpLeafNodes}
  onAnimationComplete={handleAnimationComplete}
/>