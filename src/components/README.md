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
│   ├── AnimatedSkillsChar      # Main orchestrator component
│   ├── SkillsTreeControl       # Header, controls, and data summary
│   ├── SkillsTreeVisualizatio  # SVG tree visualization
│   ├── TimelineInfoPane        # Timeline details panel
│   └── README.md                    # This file
├── hooks/
│   ├── useSkillsTree.js             # Tree state management
│   └── skillCategoryPaths.js        # Skill category paths data
├── utils/
│   ├── skillDataUtils.js            # Data manipulation utilities
│   └── constants.js                 # Shared constants and configuration
```

## 🔧 Components

### `AnimatedSkillsChar`
- **Purpose**: Main orchestrator component
- **Responsibilities**: 
  - Uses `useSkillsTree` hook for state management
  - Renders child components with appropriate props
  - Maintains clean separation between data and view

### `SkillsTreeControl`
- **Purpose**: Header section with controls and data summary
- **Responsibilities**:
  - Displays title and description
  - Shows data statistics (total nodes, timeline entries)
  - Renders control buttons (Highlight Next, Reset)

### `SkillsTreeVisualizatio`
- **Purpose**: SVG-based tree visualization
- **Responsibilities**:
  - Renders tree nodes and connections
  - Handles node highlighting and interactions
  - Manages SVG coordinate transformations
  - Uses constants for consistent styling

### `TimelineInfoPane`
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

# Modular Horizontal Scroll System

This system allows you to easily create horizontal scrolling sections with automatic handoff to vertical scrolling.

## Architecture

### 1. **HorizontalScrollWrapper** (`HorizontalScrollWrapper.jsx`)
- **Purpose**: Handles all horizontal scrolling logic and handoff mechanism
- **Props**:
  - `isActive`: Boolean - when true, horizontal scrolling is enabled
  - `onScrollHandoff`: Function - called when scrolling reaches boundaries
  - `children`: React elements - the content to scroll horizontally
  - `slideCount`: Number - total number of slides (default: 3)
  - `className`: String - custom CSS classes for the wrapper

### 2. **Content Components** (e.g., `ProjectsContent.jsx`, `TestimonialsContent.jsx`)
- **Purpose**: Pure content components with no scroll logic
- **Structure**: Each slide should be a `div` with classes:
  ```jsx
  <div className="w-screen h-screen flex items-center justify-center px-20 flex-shrink-0">
    {/* Your content here */}
  </div>
  ```

### 3. **Section Components** (e.g., `ProjectsSection.jsx`, `TestimonialsSection.jsx`)
- **Purpose**: Wraps content with HorizontalScrollWrapper
- **Props**: `isActive`, `onScrollHandoff` (passed through to wrapper)

## How to Add a New Horizontal Scroll Section

### Step 1: Create Content Component
```jsx
// src/components/MyContent.jsx
import React from 'react';

const MyContent = () => {
  return (
    <>
      {/* Title Slide */}
      <div className="w-screen h-screen flex items-center justify-center px-20 flex-shrink-0">
        <h2>My Section</h2>
      </div>
      
      {/* Content Slide 1 */}
      <div className="w-screen h-screen flex items-center justify-center px-20 flex-shrink-0">
        <p>Content 1</p>
      </div>
      
      {/* Content Slide 2 */}
      <div className="w-screen h-screen flex items-center justify-center px-20 flex-shrink-0">
        <p>Content 2</p>
      </div>
    </>
  );
};

export default MyContent;
```

### Step 2: Create Section Component
```jsx
// src/components/MySection.jsx
import React from 'react';
import HorizontalScrollWrapper from './HorizontalScrollWrapper';
import MyContent from './MyContent';

const MySection = ({ isActive, onScrollHandoff }) => {
  return (
    <HorizontalScrollWrapper 
      isActive={isActive}
      onScrollHandoff={onScrollHandoff}
      slideCount={3} // Number of slides in MyContent
      className="h-screen bg-gradient-to-r from-red-900 to-orange-900 relative overflow-hidden"
    >
      <MyContent />
    </HorizontalScrollWrapper>
  );
};

export default MySection;
```

### Step 3: Add to Portfolio
```jsx
// In Portfolio.jsx, add to stoppersConfig:
const stoppersConfig = [
  {
    id: 'projects',
    component: ProjectsSection,
    ref: useRef(null)
  },
  {
    id: 'testimonials', 
    component: TestimonialsSection,
    ref: useRef(null)
  },
  {
    id: 'mySection', // Add your new section
    component: MySection,
    ref: useRef(null)
  }
];
```

## Key Features

### ✅ **Automatic Handoff**
- When reaching the first/last slide, automatically hands off to vertical scrolling
- Smooth transition between horizontal and vertical modes

### ✅ **Touch Support**
- Works on mobile devices with touch gestures
- Swipe left/right to navigate slides

### ✅ **Customizable**
- Different background colors per section
- Configurable number of slides
- Custom styling through className prop

### ✅ **Performance**
- Event capture prevents conflicts with parent scroll handlers
- Efficient boundary detection and handoff logic

## Example Usage

```jsx
// Simple 2-slide section
<HorizontalScrollWrapper 
  isActive={true}
  onScrollHandoff={(direction) => console.log(direction)}
  slideCount={2}
>
  <div className="w-screen h-screen flex items-center justify-center">
    <h1>Slide 1</h1>
  </div>
  <div className="w-screen h-screen flex items-center justify-center">
    <h1>Slide 2</h1>
  </div>
</HorizontalScrollWrapper>
```

## Best Practices

1. **Always use `flex-shrink-0`** on slide containers to prevent shrinking
2. **Use `w-screen h-screen`** for consistent slide sizing
3. **Count slides correctly** in `slideCount` prop for proper boundary detection
4. **Test on mobile** to ensure touch gestures work properly
5. **Use semantic IDs** in stoppersConfig for better debugging
