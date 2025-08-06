# Busy Tutor

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
    - [ ] Visual effect based on operation type (e.g., +, -, *)
    - [ ] Simple animation or highlight can indicate the action being performed



#### Aug 7 plan
    - [ ] Layout & spacing: Wrap environment elements using flex + flex-wrap with proper spacing.
    - [ ] Collapsible & scrollable: Make tables/nested objects collapsible and scrollable to handle large data.
    - [ ] Box highlighting: When indexing a variable, highlight the source box and the target box.
    - [ ] Arrow / visual link: Draw an arrow from the source to the target for chain indexing.
    - [ ] Basic pathfinding: Ensure arrows avoid overlapping other boxes for clarity.
    - [ ] Highlight current code line – show Lua line triggering access
    - [ ] Improved arrow styling – rounded corners, subtle animation, glow
    - [ ] Mini tooltips – show variable info (type, value, key) on hover
    - [ ] Operation-aware visual feedback – color/effect depending on operation (+, -, *, assignment)
    - [ ] Simple animations for assignments – animate variables/tables when updated or accessed

### next
- [ ] Can support multiple paths simultaneously (for statements like a[1] === b[1])  
- [ ] chaing indexing
