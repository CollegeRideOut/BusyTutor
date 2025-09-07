# Busy Tutor

### Aug 7

- Layout & spacing: Wrap environment elements using flex + flex-wrap with proper spacing.
- Box highlighting: When indexing a variable, highlight the source box and the target box.
- Arrow / visual link: Draw an arrow from the source to the target for chain indexing.
- Path finding scaffold

### Aug 13

- Highlight current code line – show Lua line triggering access
- gotta look into rasterizng

### Aug 14

- rasterizing
- Basic pathfinding: Ensure arrows avoid overlapping other boxes for clarity.

### Aug 15

- Can support multiple paths simultaneously (for statements like a[1] === b[1])
- supportin left hand assigment

### Aug 18

- take front ast visualizer out
- Collapsible Make tables/nested objects collapsible to handle large data.

### Aug 20

- Scrollable Make tables/nested objects scrollable to handle large data. maybe have a maximum size
- extendable table
- movable table
- layered environemnts
- collapsible environment
- scrollable environment

### Sep 2

- N-arry tree

### Sep 3

- stack "history" no going back yet
- Tree display (gpt the great)
- change "mode" tree view to current environment
- can only click the current environment
- when exiting goes to parent
- button to change between Tree and Env mode

### Sep 7

- Break statement
- Using Global env as the frist env. cause it makes sense... for now
- While Statement

### Up Next

- Waiting on desing
- Environment visuals: polish node cards, spacing, and shadows
- Movable layout: allow dragging nodes/groups
- Collapsible nodes: toggle children open/closed with indicator
- Connector fix: reroute SVG links if target is off-screen/hidden
- Scroll & collapse logic: links attach to visible ancestor or viewport edge
- End-state indicator: show banner + color ring for correct/incorrect runs
- Demo capture: quick screen recording of expand/collapse, drag, reroute, and end badge
- Improved arrow styling – rounded corners, subtle animation, glow
- branching
- Mini tooltips – show variable info (type, value, key) on hover
- Operation-aware visual feedback – color/effect depending on operation (+, -, \*, assignment)
- extenable environment
- Simple animations for assignments – animate variables/tables when updated or accessed
- Add all tables to a heap with unique IDs for clean visualization, leaving cycle handling and arrow layout as a later enhancement.
- chaing indexing
- cache layout

## Features to Include in MVP

- [ ] Collapsible Tables / Nested Structures

  - [ ] Support deep nested objects without overwhelming the UI
  - [ ] Collapsed boxes show summary (e.g., size, keys)

- [ ] Chain Indexing Visualization

  - [ ] Support nested access like a.b.c or table[1][2]
  - [ ] Highlight the current part of the chain being accessed

- [ ] Code-Aware Indexing

  - [ ] Show line of code currently executing for the operation
  - [ ] Highlight the corresponding element(s) in the environment

- [ ] Multiple Simultaneous Indexing

  - [ ] Show multiple accesses happening at the same time
  - [ ] Example: a[1] === b[1] → both elements visually highlighted concurrently
  - [ ] Provides binary-level understanding of comparisons/assignments

- [ ] Code Animations

  - [ ] Animate elements when assigned or updated
  - [ ] Smoothly highlight changes to variables/tables

- [ ] Operation Awareness (Optional for MVP)
  - [ ] Visual effect based on operation type (e.g., +, -, \*)
  - [ ] Simple animation or highlight can indicate the action being performed
