
when responding, do not give npm run command, i will do it myself.

# GAME PLAN: Animated Skills Timeline Chart

## 1. **Project Goal**
- Visualize a user's skills timeline, allowing zooming between hierarchical levels (skills → categories).
- Smoothly animate merging/unmerging of skills as the user scrolls or clicks.
- Keep code modular, clean, and performant.

---

## 2. **Core Requirements**
- **Input:** `skills_timeline.json` (user's skills, dates, expertise), `skillCategoryPaths.js` (hierarchy).
- **Chart:** Each skill/category is a box/shape on a timeline.
- **Zoom/Scroll:** Horizontal scroll (or slider) changes the level of detail (skills merge into parents).
- **Animation:** Merging/unmerging of boxes is animated.
- **Interactivity:** Clicking a parent expands/collapses only that branch.
- **Performance:** Fast, smooth, and responsive.
- **Data:** Static data structure - we change it once and keep it static. For each user, we only get a skill list.

---

## 3. **Timeline Chart Structure**

### **Y-Axis (Time Axis)**
- **Purpose**: Represents time progression
- **Position**: Vertical axis on the left side of the chart
- **Range**: From earliest skill start date (top) to latest skill end date (bottom)
- **Calculation**: `timestampToY(timestamp, startTime, timeRange, yZoom)`
- **Segments**: Each skill/category segment's height = time duration (end date - start date)
- **Multiple Periods**: A skill can have multiple start/end date ranges (gaps between usage)
- **Fixed Position**: Y-position NEVER changes during animations - only X-position animates

### **X-Axis (Skills/Categories Axis)**
- **Purpose**: Represents different skills or categories
- **Position**: Horizontal positioning of segments
- **Levels**: Different hierarchical levels (individual skills → categories → parent categories)
- **Spacing**: Fixed gap between segments (evenly distributed across page width)
- **Merging**: When skills merge, they move horizontally towards parent position on X-axis
- **Animation**: Only X-position changes during merging - Y-position stays fixed

### **Segment Positioning**
- **X Position**: Determined by skill/category index on X-axis (evenly distributed)
- **Y Position**: Determined by start date (y1) and end date (y2) - NEVER changes during animation
- **Height**: `Math.abs(y2 - y1)` = time duration
- **Width**: Fixed thickness (25px for skills, 30px for categories)
- **Multiple Segments**: One skill can have multiple segments if used in different time periods

### **Merging Animation**
- **X Movement**: Child segments move horizontally towards parent's X position
- **Y Movement**: NO CHANGE - segments stay at their time-based Y position
- **Time Span**: Merged segments span the combined time periods of all children
- **Overlapping**: Time periods are merged using `mergeOverlappingPeriods()`
- **Visual Feedback**: Color blending and thickness changes during merge

---

## 4. **Merging Animation Logic**

### **Progress-Based Merging System**
- **Each Level Progress**: 0-100% for each level transition
- **Child Distribution**: Divide progress into equal parts based on number of children
- **Parent Grouping**: Children merge into parents sequentially

### **Example: 8 Children → 3 Parents**
```
Level Progress: 0-100%
Children: [A, B, C, D, E, F, G, H]
Parents: [Parent1, Parent2, Parent3]

Progress 0-12.5%:   Child A moves towards Parent1
Progress 12.5-25%:  Child B moves towards Parent1
Progress 25-37.5%:  Child C moves towards Parent1
Progress 37.5-50%:  Child D moves towards Parent1
→ Parent1 is now COLLAPSED (50% progress)

Progress 50-62.5%:  Child E moves towards Parent2
Progress 62.5-75%:  Child F moves towards Parent2
→ Parent2 is now COLLAPSED (75% progress)

Progress 75-87.5%:  Child G moves towards Parent3
Progress 87.5-100%: Child H moves towards Parent3
→ Parent3 is now COLLAPSED (100% progress)
```

### **Snap-to-Parent Behavior**
- **User releases scroll**: Current parent snaps to fully expanded state
- **Progress remains**: At 0%, 50%, 75%, or 100% (depending on which parent was being worked on)
- **Next scroll**: Continues from current progress in same direction
- **Reverse scroll**: Reverses the merging process

### **Visual Indicators**
- **Progress Display**: Show current level progress (0-100%)
- **Parent Status**: Show which parents are collapsed/expanded
- **Current Parent**: Highlight the parent currently being worked on
- **Direction**: Show scroll direction (merging/collapsing)

---

## 5. **Proposed Architecture**
### a. **Data Layer**
- **SkillTreeBuilder:** Utility to convert flat skills + category paths into a tree structure with parent/child links.
- **VisibleNodesSelector:** Given a zoom level, returns the currently visible nodes (skills or categories).

### b. **State Management**
- **React Context or Zustand:** Store current zoom level, expanded/collapsed state for each node, and animation state.

### c. **Chart Rendering**
- **ChartCanvas (main component):** Renders the timeline, boxes, and axes.
- **SkillBox/CategoryBox:** Individual box components, animated with Framer Motion.
- **MergeAnimationManager:** Handles the animation logic for merging/unmerging nodes.

### d. **Animation**
- **Framer Motion:** Animate position, size, opacity, and label transitions.
- **Custom Animation Hooks:** For merging/unmerging, staggered transitions, and label morphing.

### e. **UI Controls**
- **Zoom Slider/Scroll:** For level-of-detail.
- **Expand/Collapse Button:** On each parent node.

---

## 6. **Implementation Steps**

1. **Refactor Data Processing:**
   - [x] Move all tree-building node in one file,
   - [x] node selection logic into another.
   - [x] create all new files. no need to modify any existing files.

2. **Modularize Components:**
   - [x] Create small, focused components.
   - [x] for boxes, labels, and axes. - boxes positioning and boxes should be the only thing in one file. 
   - [x] we should clearly be able to see which box is being placed where and what are the boxes' parameter. 
   focus the code on boxes and their current positions. 
   - [x] Use Framer Motion for all position/size transitions.

3. **Implement Animation Logic:**
   - [x] Animate merging: child boxes move and morph into parent box.
   - [x] Animate unmerging: parent splits into children, with smooth transitions.
   - [x] Animate label changes (fade).

4. **Interactivity:**
   - [x] On scroll, expand/collapse a parent node (only that branch animates) - one by one each child merges into the parent and the parent width keeps increasing. (initially there will be no parent. first 2 siblings will merge to become a prent and then they will eat all other siblings.) when one family is done, we will start with the next parent.
   - [x] Maintain state for which nodes are expanded, and which is the current level, and how many have been expanded for that level.
   - [x] as user scrolls, we will animate directly correlated with the scroll amount. the user can go the opposite direction mid scroll at any time - and it will reverse animate.
   - [x] if user lets go of scrolling for a family, we will snap that family, and next time he scrolls, will pick it up from there. mergining will continue in one direction, and collapsing in another direction.

5. **Performance Optimization:**
   - [x] Use bast practices for animation requirements mentioned below.

6. **Testing & Cleanup:**
   - [ ] Test with large skill sets. - LATER
   - [ ] Remove unused code, keep files small and focused.

---

## 7. **Questions for You (please answer below each):**

**A. Merging Animation:**
- Should child boxes move and shrink into the parent's position, or fade out as the parent fades in?
- Should color blend, or just snap to parent's color?

- boxes should move from their current position and all the boxes that are supposed to be merged into one box should move towards each other and meet in the middle to become the parent box. this should happen as the user scrolls. the animation will not have a state level 1 and level 2 - but the user's scroll position must have a snapshot of the current scene all the time. i mean no state change with animation delay, but we need scrolling and directly related positioning based on the scroll amount. once the boxes have been merged, we stop the animation. next time the scrolling starts, we will again start to merge the parents into the grandparents in a similar way. 
- blend into whatever color it is going to have next.

**B. Unmerging Animation:**
- Should children "burst" out from the parent, or slide out, or something else?
- slide out.

**C. Label Animation:**
- Should labels morph (crossfade) or just appear/disappear?
- appear and dissappear 

**D. Timing:**
- Should all merges/unmerges animate together, or staggered (one after another)?
- one after the other will look nice. it will give user time to slowly observe all the parents one by one. 
if the user lets go of the scroll before all the children for all the parents are expanded, then we will resume the expanding from the next parent- the next time he scrolls in the same direction. if he scrolls in the opposite direction, we will collapse the expanded ones in the reverse direction.
if the user lets go of the scroll, we will snap to the expanded or collapsed position of the currently expanding parent. and the rest as described above. 

**E. User Customization:**
- What animation parameters should be user-configurable (speed, style, etc)?
- user will not configure the animations. he will only be able to change the skillscategorypaths for his own skill list. so that he can make changes to which child is under which parent. (we will do this later. not in this scope.)

---

## 8. **Next Steps**
- [x] Fill in answers above.
- [x] Start with data utilities (SkillTreeBuilder and VisibleNodesSelector)
- [x] Create modular box components with Framer Motion
- [x] Implement scroll-based animation system
- [x] Fix level transitions and merging logic
- [x] Add timeline structure with proper X/Y axis positioning
- [x] Fix X-axis positioning for different levels (currently only leaf level shows)
- [ ] Implement progress-based merging system (0-100% per level)
- [ ] Add parent collapsing/expanding logic
- [ ] Add visual indicators for progress and parent status
- [ ] Test the current implementation
- [ ] Refine animations based on feedback
- [ ] Add timeline data integration
- [ ] Optimize performance

---

## 9. **Current Implementation Status**

### ✅ **Completed:**
- **SkillTreeBuilder.js**: Clean utility to build hierarchical skill tree
- **VisibleNodesSelector.js**: Node selection based on scroll progress (FIXED: now starts from leaf level)
- **SkillBox.jsx**: Individual animated box component with Framer Motion (ENHANCED: better merging animations)
- **AnimatedSkillsChart.jsx**: Main chart component with scroll handling (FIXED: proper level transitions)
- **TimelineDataProcessor.js**: NEW - Processes timeline data with proper time-based segments
- **TimelineSegment.jsx**: NEW - Renders timeline segments with time-based positioning
- **AnimatedSkillsPage.jsx**: Test page for the new chart
- **Routing**: Added route `/animated-skills` to test the implementation
- **X/Y Axis Understanding**: Fixed positioning with X-only animations
- **Even Distribution**: Skills spread evenly across page width

### 🔄 **In Progress:**
- Implementing progress-based merging system
- Adding parent collapsing/expanding logic
- Adding visual indicators for progress and parent status

### 📋 **Next:**
- Integrate timeline data (dates, expertise levels)
- Add proper merging logic between levels
- Optimize performance for larger datasets

### 🐛 **Fixed Issues:**
- ✅ Chart now starts from individual skills (leaf level) instead of highest level
- ✅ Proper level transitions based on scroll progress
- ✅ Merging animations work correctly
- ✅ Visual indicators show current level and merge progress
- ✅ Boxes show skill count and level information
- ✅ Timeline structure with Y-axis as time and X-axis as skills/categories
- ✅ Segments positioned based on start/end dates
- ✅ Skills spread evenly across page width (no horizontal scrolling)
- ✅ X-position animations only (Y-position stays fixed)

### 🐛 **Current Issues:**
- ❌ Need to implement progress-based merging (0-100% per level)
- ❌ Need to add parent collapsing/expanding logic
- ❌ Need to add visual indicators for progress and parent status

--- 